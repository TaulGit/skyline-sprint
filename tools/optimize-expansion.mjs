import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,weld,flatten,join,simplify,textureCompress} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {readFileSync,writeFileSync,statSync,readdirSync,copyFileSync} from 'node:fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);await MeshoptSimplifier.ready;
const names=['endurance-coupe','rally-buggy','warning-sign','safety-barrier','sky-airship','sky-citadel','distant-observatory'],report=[];
for(const name of names){
 const doc=await io.read(`assets/blender/exports/${name}.glb`);
 await doc.transform(dedup(),...(names.indexOf(name)>1?[flatten(),join()]:[]),weld(),prune(),textureCompress({encoder:sharp,resize:[1024,1024],targetFormat:'webp',quality:84}));
 await io.write(`public/assets/models/${name}.glb`,doc);
 const triangles=()=>doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),high=triangles();
 if(name!=='warning-sign')await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.4,error:.01}));
 await io.write(`public/assets/models/${name}-low.glb`,doc);
 report.push({name,triangles:high,lodTriangles:triangles(),bytes:statSync(`public/assets/models/${name}.glb`).size});
}
const manifest=JSON.parse(readFileSync('public/assets/models.json','utf8'));
manifest.cars=[{id:'car',name:'流光',file:'models/car.glb'},{id:'endurance-coupe',name:'赤隼',file:'models/endurance-coupe.glb'},{id:'rally-buggy',name:'逐风',file:'models/rally-buggy.glb'}];
manifest.decorations=manifest.decorations.filter(x=>!names.includes(x.name));
const track=JSON.parse(readFileSync('public/assets/track.json','utf8')),jump=track.samples.findIndex(x=>x.name==='飞跃');
manifest.decorations.push(
 {name:'warning-sign',file:'models/warning-sign.glb',scale:4.2,samples:[jump-24,jump-8],offset:8.5,yaw:Math.PI,align:true},
 {name:'safety-barrier',file:'models/safety-barrier.glb',scale:3,samples:[20,26,32,38,44,50,56,62,68,74,80,86,92,98],offset:-7.2,yaw:Math.PI/2,align:true},
 {name:'sky-airship',file:'models/sky-airship.glb',scale:34,samples:[90,320,660,850],offset:95,height:38,distant:true},
 {name:'sky-citadel',file:'models/sky-citadel.glb',scale:95,samples:[180,490,780],offset:-145,height:-45,distant:true},
 {name:'distant-observatory',file:'models/distant-observatory.glb',scale:2.1,samples:[65,370,620,870],offset:150,height:-35,distant:true}
);
const overrides=JSON.parse(readFileSync('assets/source/layout-overrides.json','utf8'));for(const asset of manifest.decorations)Object.assign(asset,overrides[asset.name]??{});
writeFileSync('public/assets/models.json',JSON.stringify(manifest,null,2));writeFileSync('assets/expansion-report.json',JSON.stringify(report,null,2));
const receipts=[];for(const name of names.slice(0,6)){const dir=readdirSync('assets/source/tripo-out').find(x=>x.startsWith(name+'-'));const receipt=JSON.parse(readFileSync(`assets/source/tripo-out/${dir}/task.json`));receipts.push(receipt);copyFileSync(`assets/source/tripo-out/${dir}/task.json`,`assets/source/receipts/${name}.json`);}
writeFileSync('assets/source/expansion-receipts.json',JSON.stringify({totalCredits:receipts.reduce((n,x)=>n+x.credits_consumed,0),tasks:receipts},null,2));console.log(report);
