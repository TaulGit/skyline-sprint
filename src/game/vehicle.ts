import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3,Quaternion} from 'three';
import {roadMesh,vec,quat,type Track,type Sample} from './track';
import {DT} from './race';
export interface Control{throttle:number;brake:number;steer:number;handbrake:boolean}
export class Vehicle{
 world:RAPIER.World;body:RAPIER.RigidBody;controller:RAPIER.DynamicRayCastVehicleController;
 grounded=0;speed=0;steering=0;position=new Vector3();rotation=new Quaternion();previous=new Vector3();normal=new Vector3(0,1,0);
 constructor(public track:Track){
  this.world=new RAPIER.World({x:0,y:-9.81,z:0});this.world.timestep=DT;
  const mesh=roadMesh(track);this.world.createCollider(RAPIER.ColliderDesc.trimesh(mesh.vertices,mesh.indices).setFriction(1).setRestitution(0));
  // Continuous low guard rails follow each road cross-section. No rails across the jump gap.
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<track.samples.length-1;i++){const a=track.samples[i],b=track.samples[i+1];if(!a.road||!b.road)continue;
   for(const side of [-1,1]){const k=vertices.length/3;for(const s of [a,b])for(const h of [0,.65])vertices.push(...vec(s.p).addScaledVector(vec(s.r),side*(s.width/2+.1)).addScaledVector(vec(s.u),h).toArray());indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  this.world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(vertices),new Uint32Array(indices)).setFriction(.05).setRestitution(0));
  this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setCcdEnabled(true).setLinearDamping(.08).setAngularDamping(.8));
  this.world.createCollider(RAPIER.ColliderDesc.cuboid(.82,.24,1.6).setMass(720).setFriction(.12).setRestitution(0),this.body);
  this.controller=this.world.createVehicleController(this.body);this.controller.indexUpAxis=1;this.controller.setIndexForwardAxis=2;
  for(const z of [1.1,-1.1])for(const x of [-.85,.85]){
   const i=this.controller.numWheels();this.controller.addWheel({x,y:0,z},{x:0,y:-1,z:0},{x:-1,y:0,z:0},.36,.34);
   this.controller.setWheelSuspensionStiffness(i,120);this.controller.setWheelSuspensionCompression(i,7);this.controller.setWheelSuspensionRelaxation(i,8);this.controller.setWheelMaxSuspensionTravel(i,.3);this.controller.setWheelMaxSuspensionForce(i,60000);this.controller.setWheelFrictionSlip(i,2.2);this.controller.setWheelSideFrictionStiffness(i,1.3);
  }
  this.reset(track.spawn);this.world.step();
 }
 reset(s:Sample){const p=vec(s.p).addScaledVector(vec(s.u),.67);this.body.setTranslation(p,true);this.body.setRotation(quat(s.q),true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.body.resetForces(true);this.body.resetTorques(true);this.steering=0;this.sync();this.previous.copy(this.position);}
 sync(){this.position.copy(this.body.translation());this.rotation.copy(this.body.rotation());this.speed=new Vector3().copy(this.body.linvel()).dot(new Vector3(0,0,1).applyQuaternion(this.rotation));}
 step(input:Control){
  this.previous.copy(this.position);const speed=Math.abs(this.speed),target=input.steer*(.42/(1+speed*.055));this.steering+=(target-this.steering)*.13;
  for(let i=0;i<4;i++){
   this.controller.setWheelSteering(i,i<2?-this.steering:0);
   const reverse=input.brake>0&&this.speed<1;const power=reverse?(this.speed>-12?-1900:0):input.throttle*2600*Math.max(0,1-speed/62);
   this.controller.setWheelEngineForce(i,power);
   this.controller.setWheelBrake(i,reverse?0:input.brake*16+(input.handbrake&&i>=2?22:0));
   this.controller.setWheelFrictionSlip(i,input.handbrake&&i>=2?.85:2.2);
  }
  this.controller.updateVehicle(DT);this.grounded=0;this.normal.set(0,0,0);
  for(let i=0;i<4;i++)if(this.controller.wheelIsInContact(i)){this.grounded++;const n=this.controller.wheelContactNormal(i);if(n)this.normal.add(n);}
  if(this.grounded){this.normal.normalize();
   // Contact-only downforce: no teleport, no attraction when airborne.
   const downforce=Math.min(18000,speed*speed*4.0);this.body.applyImpulse(this.normal.clone().multiplyScalar(-downforce*DT),true);
  }
  this.world.step();this.sync();
 }
 dispose(){this.world.free()}
}
