import {NodeIO,getBounds} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {readFileSync,writeFileSync} from 'node:fs';
import {Vector3,Quaternion,Matrix4,Box3} from 'three';
const track=JSON.parse(readFileSync('public/assets/track.json')),manifest=JSON.parse(readFileSync('public/assets/models.json'));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),hits=[],moved=[];
let placementsChecked=0;
const vec=a=>new Vector3(...a);
for(const asset of manifest.decorations){
 const doc=await io.read('public/assets/'+asset.file),bounds=getBounds(doc.getRoot().listScenes()[0]);
 const local=new Box3(vec(bounds.min),vec(bounds.max));
 for(const index of asset.samples){
  placementsChecked++;const s=track.samples[index],key=String(index);
  const original=vec(s.p).addScaledVector(vec(s.r),asset.offset);original.y+=(asset.height??0)-(asset.name==='floating-rock'?asset.scale*.85:0);
  const rotation=asset.align?new Quaternion(...s.q):new Quaternion();rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),asset.yaw??0));
  const position=asset.positions?.[key]?vec(asset.positions[key]):original.clone();
  const overlaps=p=>{
   const box=local.clone().applyMatrix4(new Matrix4().compose(p,rotation,new Vector3().setScalar(asset.scale))).expandByScalar(asset.distant?2:.1);
   return track.samples.flatMap((q,i)=>{if(!q.road)return[];for(const side of [-1,0,1])for(const height of [.3,2.2,4])if(box.containsPoint(vec(q.p).addScaledVector(vec(q.r),side*(q.width/2)).addScaledVector(vec(q.u),height)))return[i];return[];});
  };
  let collisions=overlaps(position);
  if(collisions.length&&asset.distant&&process.argv.includes('--fix')){
   const direction=vec(s.r).multiplyScalar(Math.sign(asset.offset));
   for(let step=1;step<=50&&collisions.length;step++){position.copy(original).addScaledVector(direction,step*20);collisions=overlaps(position);}
   if(!collisions.length){asset.positions??={};asset.positions[key]=position.toArray();moved.push({asset:asset.name,index,from:original.toArray(),to:position.toArray()});}
  }
  if(collisions.length)hits.push({asset:asset.name,index,roadSamples:collisions});
 }
}
if(process.argv.includes('--fix'))writeFileSync('public/assets/models.json',JSON.stringify(manifest,null,2));
writeFileSync('evidence/model-clearance.json',JSON.stringify({trackHash:track.hash,placementsChecked,roadSamples:track.samples.length,marginMeters:{distant:2,near:.1},hits,moved},null,2));
console.log(JSON.stringify({hits,moved},null,2));if(hits.length)process.exitCode=1;
