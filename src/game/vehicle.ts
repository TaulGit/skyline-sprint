import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3,Quaternion} from 'three';
import {roadMesh,vec,quat,type Track,type Sample} from './track';
import {DT} from './race';
import {railMesh} from './rails';
export interface Control{throttle:number;brake:number;steer:number;handbrake:boolean}
export class Vehicle{
 world:RAPIER.World;body:RAPIER.RigidBody;controller:RAPIER.DynamicRayCastVehicleController;
 roadHandle:number;
 grounded=0;speed=0;steering=0;drifting=false;position=new Vector3();rotation=new Quaternion();previous=new Vector3();normal=new Vector3(0,1,0);
 constructor(public track:Track){
  this.world=new RAPIER.World({x:0,y:-9.81,z:0});this.world.timestep=DT;
  const mesh=roadMesh(track);const road=this.world.createCollider(RAPIER.ColliderDesc.trimesh(mesh.vertices,mesh.indices).setFriction(1).setRestitution(0));
  this.roadHandle=road.handle;
  const rails=railMesh(track);
  this.world.createCollider(RAPIER.ColliderDesc.trimesh(rails.vertices,rails.indices,RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES_TWO_SIDED).setFriction(0).setRestitution(0));
  this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setCcdEnabled(true).setLinearDamping(.08).setAngularDamping(.8));
  this.world.createCollider(RAPIER.ColliderDesc.roundCuboid(.76,.18,1.54,.06).setMass(720).setFriction(.12).setRestitution(0),this.body);
  this.controller=this.world.createVehicleController(this.body);this.controller.indexUpAxis=1;this.controller.setIndexForwardAxis=2;
  for(const z of [1.1,-1.1])for(const x of [-.85,.85]){
   const i=this.controller.numWheels();this.controller.addWheel({x,y:0,z},{x:0,y:-1,z:0},{x:-1,y:0,z:0},.36,.34);
   this.controller.setWheelSuspensionStiffness(i,120);this.controller.setWheelSuspensionCompression(i,7);this.controller.setWheelSuspensionRelaxation(i,8);this.controller.setWheelMaxSuspensionTravel(i,.3);this.controller.setWheelMaxSuspensionForce(i,60000);this.controller.setWheelFrictionSlip(i,2.2);this.controller.setWheelSideFrictionStiffness(i,1.3);
  }
  this.reset(track.spawn);this.world.step();
 }
 reset(s:Sample){const p=vec(s.p).addScaledVector(vec(s.u),.67);this.body.setTranslation(p,true);this.body.setRotation(quat(s.q),true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.body.resetForces(true);this.body.resetTorques(true);this.steering=0;this.drifting=false;this.sync();this.previous.copy(this.position);}
 sync(){this.position.copy(this.body.translation());this.rotation.copy(this.body.rotation());this.speed=new Vector3().copy(this.body.linvel()).dot(new Vector3(0,0,1).applyQuaternion(this.rotation));}
 step(input:Control){
  this.previous.copy(this.position);const speed=Math.abs(this.speed),target=input.steer*(.42/(1+speed*.055));this.steering+=(target-this.steering)*.13;
  this.drifting=input.brake>0&&Math.abs(input.steer)>.15&&this.speed>8&&this.grounded>=2;
  for(let i=0;i<4;i++){
   this.controller.setWheelSteering(i,i<2?-this.steering:0);
   const reverse=input.brake>0&&this.speed<1;const power=reverse?(this.speed>-12?-1900:0):input.throttle*3600*Math.max(0,1-speed/82);
   this.controller.setWheelEngineForce(i,power);
   this.controller.setWheelBrake(i,reverse?0:this.drifting?(i>=2?input.brake*3:0):input.brake*16+(input.handbrake&&i>=2?22:0));
   this.controller.setWheelFrictionSlip(i,this.drifting&&i>=2?.65:input.handbrake&&i>=2?.85:2.2);
  }
  this.controller.updateVehicle(DT,undefined,undefined,c=>c.handle===this.roadHandle);this.grounded=0;this.normal.set(0,0,0);
  for(let i=0;i<4;i++)if(this.controller.wheelIsInContact(i)){this.grounded++;const n=this.controller.wheelContactNormal(i);if(n)this.normal.add(n);}
  if(this.grounded){this.normal.normalize();
   // Contact-only downforce: no teleport, no attraction when airborne.
   const downforce=Math.min(18000,speed*speed*4.0);this.body.applyImpulse(this.normal.clone().multiplyScalar(-downforce*DT),true);
  }
  this.slideAlongRail();this.world.step();this.sync();
 }
 /** Arcade safety response: remove outward momentum before a side impact can roll the chassis.
  * Only applies beside a road surface; jump gaps and airborne motion remain free. */
 slideAlongRail(){
  if(this.grounded<2)return;
  const position=new Vector3().copy(this.body.translation()),velocity=new Vector3().copy(this.body.linvel());
  let nearest:Sample|undefined,point=new Vector3(),best=Infinity;
  for(let i=0;i<this.track.samples.length-1;i++){
   const a=this.track.samples[i],b=this.track.samples[i+1];if(!a.road||!b.road)continue;
   const start=vec(a.p),segment=vec(b.p).sub(start),f=Math.max(0,Math.min(1,position.clone().sub(start).dot(segment)/segment.lengthSq()));
   const candidate=start.addScaledVector(segment,f),distance=candidate.distanceToSquared(position);
   if(distance<best){best=distance;nearest=a;point=candidate;}
  }
  if(!nearest)return;const up=vec(nearest.u),right=vec(nearest.r),relative=position.clone().sub(point),height=relative.dot(up);
  if(height<.2||height>1.15)return;
  const lateral=relative.dot(right),side=Math.sign(lateral),rotation=this.body.rotation();
  const extent=.82*Math.abs(new Vector3(1,0,0).applyQuaternion(rotation).dot(right))+1.6*Math.abs(new Vector3(0,0,1).applyQuaternion(rotation).dot(right));
  const outward=velocity.dot(right)*side,clearance=nearest.width/2+.1-Math.abs(lateral)-extent;
  if(outward>0&&clearance<outward*DT+.12){
   velocity.addScaledVector(right,-side*outward);this.body.setLinvel(velocity,true);
   const angular=new Vector3().copy(this.body.angvel()),yaw=angular.dot(up);
   this.body.setAngvel(up.multiplyScalar(yaw),true);
  }
 }
 dispose(){this.world.free()}
}
