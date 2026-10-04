import {vec,type Track} from './track';
/** Shared, welded rail profile. The vertical inner face cannot act as a wheel ramp. */
export function railMesh(track:Track){
 const vertices:number[]=[],indices:number[]=[];
 const profile=[[0,-.3],[0,1.12],[.025,1.22],[.09,1.30],[.19,1.34],[.36,1.34],[.46,1.30],[.525,1.22],[.55,1.12],[.55,-.3]];
 for(const side of [-1,1]){
  let previous=-1;
  for(let i=0;i<track.samples.length;i++){
   const sample=track.samples[i];if(!sample.road){previous=-1;continue;}
   const base=vertices.length/3;
   for(const [offset,height] of profile)vertices.push(...vec(sample.p).addScaledVector(vec(sample.r),side*(sample.width/2+.1+offset)).addScaledVector(vec(sample.u),height).toArray());
   if(previous>=0)for(let j=0;j<profile.length;j++){const k=(j+1)%profile.length;indices.push(previous+j,base+j,previous+k,previous+k,base+j,base+k);}
   else for(let j=1;j<profile.length-1;j++)indices.push(base,base+j,base+j+1);
   if(!track.samples[i+1]?.road)for(let j=1;j<profile.length-1;j++)indices.push(base,base+j+1,base+j);
   previous=base;
  }
 }
 return{vertices:new Float32Array(vertices),indices:new Uint32Array(indices)};
}
