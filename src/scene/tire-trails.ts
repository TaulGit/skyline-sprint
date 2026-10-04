import * as T from 'three';
import type {Vehicle} from '../game/vehicle';

class Ribbon{
 readonly positions=new Float32Array(9000*18);
 readonly geometry=new T.BufferGeometry();
 readonly mesh:T.Mesh;
 count=0;next=0;
 constructor(opacity:number){
  this.geometry.setAttribute('position',new T.BufferAttribute(this.positions,3).setUsage(T.DynamicDrawUsage));
  this.geometry.setDrawRange(0,0);
  this.mesh=new T.Mesh(this.geometry,new T.MeshBasicMaterial({color:0x111a24,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  this.mesh.frustumCulled=false;this.mesh.renderOrder=2;
 }
 clear(){this.count=0;this.next=0;this.geometry.setDrawRange(0,0)}
 append(a:T.Vector3,b:T.Vector3,normal:T.Vector3){
  const forward=b.clone().sub(a),length=forward.length();if(length<.2||length>2.5)return;
  const side=new T.Vector3().crossVectors(normal,forward).normalize().multiplyScalar(.105);
  const lift=normal.clone().multiplyScalar(.025);
  const aLeft=a.clone().sub(side).add(lift),aRight=a.clone().add(side).add(lift);
  const bLeft=b.clone().sub(side).add(lift),bRight=b.clone().add(side).add(lift);
  const offset=this.next*18;
  this.positions.set([...aLeft.toArray(),...aRight.toArray(),...bLeft.toArray(),...aRight.toArray(),...bRight.toArray(),...bLeft.toArray()],offset);
  (this.geometry.getAttribute('position') as T.BufferAttribute).needsUpdate=true;
  this.next=(this.next+1)%9000;this.count=Math.min(this.count+1,9000);this.geometry.setDrawRange(0,this.count*6);
 }
}

/** World-space ribbons follow Rapier's wheel contact points, including banked road and loop. */
export class TireTrails{
 readonly rolling=new Ribbon(.17);readonly sliding=new Ribbon(.46);
 readonly group=new T.Group();private last:(T.Vector3|null)[]=[null,null,null,null];
 constructor(){this.group.add(this.rolling.mesh,this.sliding.mesh)}
 clear(){this.last=[null,null,null,null];this.rolling.clear();this.sliding.clear()}
 update(vehicle:Vehicle){
  if(Math.abs(vehicle.speed)<2){this.last=[null,null,null,null];return}
  for(let i=0;i<4;i++){
   if(!vehicle.controller.wheelIsInContact(i)){this.last[i]=null;continue}
   const hit=vehicle.controller.wheelContactPoint(i),surface=vehicle.controller.wheelContactNormal(i);
   if(!hit||!surface){this.last[i]=null;continue}
   const point=new T.Vector3(hit.x,hit.y,hit.z),previous=this.last[i];
   if(previous){const distance=point.distanceTo(previous);if(distance>=.2&&distance<2.5){(vehicle.drifting&&i>=2?this.sliding:this.rolling).append(previous,point,new T.Vector3(surface.x,surface.y,surface.z));this.last[i]=point}else if(distance>=2.5)this.last[i]=point}
   else this.last[i]=point;
  }
 }
}
