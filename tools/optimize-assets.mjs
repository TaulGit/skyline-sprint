import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,weld,simplify,textureCompress} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);await MeshoptSimplifier.ready;
const selected=JSON.parse(readFileSync('assets/source/selection.json','utf8'));const report=[];mkdirSync('public/assets/models',{recursive:true});
for(const name of ['car',...selected.decorations.map(x=>x.name)]){
 const doc=await io.read(`assets/blender/exports/${name}.glb`);
 await doc.transform(dedup(),prune(),weld(),textureCompress({encoder:sharp,resize:[name==='car'?2048:1024,name==='car'?2048:1024],targetFormat:'webp',quality:82}));
 const triangles=()=>doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);
 await io.write(`public/assets/models/${name}.glb`,doc);const high=triangles();
 await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.45,error:.012}));await io.write(`public/assets/models/${name}-low.glb`,doc);
 report.push({name,triangles:high,lodTriangles:triangles(),bytes:statSync(`public/assets/models/${name}.glb`).size,lodBytes:statSync(`public/assets/models/${name}-low.glb`).size});
}
writeFileSync('assets/asset-report.json',JSON.stringify(report,null,2));writeFileSync('public/assets/models.json',JSON.stringify({car:'models/car.glb',decorations:selected.decorations.map(x=>({...x,file:`models/${x.name}.glb`,scale:x.size}))},null,2));console.log(report);
