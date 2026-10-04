import {Vector3,Quaternion} from 'three';
export interface Sample{p:number[];t:number[];u:number[];r:number[];q:number[];s:number;road:boolean;name:string;width:number}
export interface Gate extends Sample{index:number;label:string}
export interface Track{samples:Sample[];gates:Gate[];spawn:Sample;length:number;hash:string;trackVersion:string;physicsVersion:string;medals:{gold:number;silver:number;bronze:number;calibrated:boolean}}
export const vec=(a:number[])=>new Vector3(a[0],a[1],a[2]);
export const quat=(a:number[])=>new Quaternion(a[0],a[1],a[2],a[3]);
export function roadMesh(track:Track,edge=false){
 const vertices:number[]=[],indices:number[]=[];
 for(let i=0;i<track.samples.length-1;i++){
  const a=track.samples[i],b=track.samples[i+1];if(!a.road||!b.road)continue;
  for(const side of edge?[-1,1]:[0]){
   const base=vertices.length/3;
   const offsets=edge?[side*(a.width/2-.18),side*(a.width/2+.18)]:[-a.width/2,a.width/2];
   for(const sample of [a,b])for(const offset of offsets){const p=vec(sample.p).addScaledVector(vec(sample.r),offset).addScaledVector(vec(sample.u),edge?.04:0);vertices.push(...p.toArray());}
   if(side===-1)indices.push(base,base+2,base+1,base+1,base+2,base+3);else indices.push(base,base+1,base+2,base+1,base+3,base+2);
  }
 }
 return{vertices:new Float32Array(vertices),indices:new Uint32Array(indices)};
}
