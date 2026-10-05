import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {roadMesh,vec,quat,type Track} from '../game/track';
import type {Vehicle} from '../game/vehicle';
import {createSky} from './sky';
import {railMesh} from '../game/rails';
import {TireTrails} from './tire-trails';
export class Scene{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(62,1,.1,1800);car=new T.Group();ghost=new T.Group();wheels:T.Object3D[]=[];carMaterials:T.MeshStandardMaterial[]=[];decorations:T.Object3D[]=[];lowQuality=false;cameraUp=new T.Vector3(0,1,0);target=new T.Vector3();gates:T.Group[]=[];bodyMaterial=new T.MeshStandardMaterial({color:0x38d9ec,metalness:.45,roughness:.32});
 signTexture=new T.CanvasTexture(document.createElement('canvas'));
 carModels=new Map<string,T.Group>();selectedCar='';
 cameraObstacles:T.Object3D[]=[];cameraRay=new T.Raycaster();fallbackScenery=new T.Group();sky=createSky();trails=new TireTrails();
 constructor(public track:Track,canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setClearColor(0xb2cbdc);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
  this.scene.fog=new T.Fog(0xb8d4e3,160,780);this.scene.add(this.sky,this.fallbackScenery,this.trails.group);this.scene.add(new T.HemisphereLight(0xd9f5ff,0x55547a,2.2));const sun=new T.DirectionalLight(0xffedd6,2.6);sun.position.set(-100,200,70);this.scene.add(sun);
  const road=roadMesh(track),edge=roadMesh(track,true);
  for(const [data,color] of [[road,0xe3e9e4],[edge,0xf29162]] as const){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(data.vertices,3));geo.setIndex(new T.BufferAttribute(data.indices,1));geo.computeVertexNormals();const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.8,side:T.DoubleSide}));this.scene.add(mesh);this.cameraObstacles.push(mesh);}
  const box=new T.BoxGeometry(1,1,1),cyan=new T.MeshStandardMaterial({color:0x2ed4e3,emissive:0x086573,emissiveIntensity:.25}),dark=new T.MeshStandardMaterial({color:0x263c51,roughness:.7});
  const railData=railMesh(track),railGeometry=new T.BufferGeometry();railGeometry.setAttribute('position',new T.BufferAttribute(railData.vertices,3));railGeometry.setIndex(new T.BufferAttribute(railData.indices,1));railGeometry.computeVertexNormals();const rails=new T.Mesh(railGeometry,new T.MeshStandardMaterial({color:0xc1d9d9,metalness:.2,roughness:.55,side:T.DoubleSide}));this.scene.add(rails);this.cameraObstacles.push(rails);
  const placements:{p:T.Vector3;q:T.Quaternion;s:T.Vector3}[]=[],supports:typeof placements=[];
  track.samples.forEach((s,i)=>{if(!s.road)return;if(i%6===0)placements.push({p:vec(s.p).addScaledVector(vec(s.u),.03),q:quat(s.q),s:new T.Vector3(.16,.025,2.8)});if(i%32===0&&s.u[1]>.85)supports.push({p:vec(s.p).add(new T.Vector3(0,-8,0)),q:new T.Quaternion(),s:new T.Vector3(1.3,15,1.3)});});
  for(const [list,mat] of [[placements,cyan],[supports,dark]] as const){const mesh=new T.InstancedMesh(box,mat,list.length);list.forEach((o,i)=>mesh.setMatrixAt(i,new T.Matrix4().compose(o.p,o.q,o.s)));if(list===supports)this.fallbackScenery.add(mesh);else this.scene.add(mesh);}
  track.gates.forEach((g,i)=>{const group=new T.Group();group.position.copy(vec(g.p));group.quaternion.copy(quat(g.q));for(const x of [-5.1,5.1]){const m=new T.Mesh(box,dark);m.position.set(x,2.5,0);m.scale.set(.4,5,.5);group.add(m);}const bar=new T.Mesh(box,i===track.gates.length-1?new T.MeshStandardMaterial({color:0xffac76}):cyan);bar.position.y=5;bar.scale.set(10.7,.35,.55);group.add(bar);this.scene.add(group);this.gates.push(group);});
  const rockGeo=new T.IcosahedronGeometry(1,0),rockMat=new T.MeshStandardMaterial({color:0x7f859f,flatShading:true}),rocks=new T.InstancedMesh(rockGeo,rockMat,110),crystals=new T.InstancedMesh(new T.ConeGeometry(1,3,5),cyan,70);
  let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<110;i++){const sample=track.samples[Math.floor(random()*track.samples.length)],side=random()>.5?1:-1,p=vec(sample.p).addScaledVector(vec(sample.r),side*(24+random()*80));p.y-=12+random()*55;const size=6+random()*17;rocks.setMatrixAt(i,new T.Matrix4().compose(p,new T.Quaternion().setFromEuler(new T.Euler(random(),random(),random())),new T.Vector3(size,size*.7,size)));if(i<70)crystals.setMatrixAt(i,new T.Matrix4().compose(p.clone().add(new T.Vector3(0,size*.5,0)),new T.Quaternion(),new T.Vector3(size*.2,size*.3,size*.2)));}this.fallbackScenery.add(rocks,crystals);
  const cloud=new T.Mesh(new T.PlaneGeometry(2600,2600),new T.MeshBasicMaterial({color:0xd5e5eb,transparent:true,opacity:.24,depthWrite:false}));cloud.rotation.x=-Math.PI/2;cloud.position.y=-18;this.scene.add(cloud);
  this.setLanguage('zh');this.createCar(this.car,false);this.createCar(this.ghost,true);this.scene.add(this.car,this.ghost);this.ghost.visible=false;this.camera.position.set(-22,43,-27);this.target.copy(vec(track.spawn.p));this.resize();
 }
 createCar(group:T.Group,ghost:boolean){const mat=ghost?new T.MeshStandardMaterial({color:0x95f6ff,transparent:true,opacity:.28,depthWrite:false}):this.bodyMaterial;
  const shell=new T.Mesh(new T.BoxGeometry(1.72,.48,3.5),mat);shell.position.y=.04;group.add(shell);const cabin=new T.Mesh(new T.BoxGeometry(1.25,.42,1.4),ghost?mat:new T.MeshStandardMaterial({color:0x102b40,metalness:.65,roughness:.15}));cabin.position.set(0,.46,-.2);group.add(cabin);const wing=new T.Mesh(new T.BoxGeometry(2,.12,.5),mat);wing.position.set(0,.5,-1.55);group.add(wing);
  for(const z of [1.1,-1.1])for(const x of [-.88,.88]){const wheel=new T.Mesh(new T.CylinderGeometry(.34,.34,.24,12).rotateZ(Math.PI/2),ghost?mat:new T.MeshStandardMaterial({color:0x142033,roughness:.7}));wheel.position.set(x,-.3,z);group.add(wheel);if(!ghost)this.wheels.push(wheel);}
  if(!ghost)for(const x of [-.56,.56]){const light=new T.Mesh(new T.BoxGeometry(.34,.08,.03),new T.MeshBasicMaterial({color:0xdcfcff}));light.position.set(x,.14,1.76);group.add(light);}
 }
 setColor(color:string){this.bodyMaterial.color.set(color);for(const mat of this.carMaterials)mat.color.set('#ffffff').lerp(new T.Color(color),.3);}
 async loadAssets(progress:(done:number,total:number)=>void=()=>{}){
  const response=await fetch('./assets/models.json');if(!response.ok)throw Error('模型清单加载失败');const manifest=await response.json(),loader=new GLTFLoader();const total=1+(manifest.cars?.length??1)+manifest.decorations.length*2;let done=0;const loadModel=async(path:string)=>{const result=await loader.loadAsync(path);progress(++done,total);return result;};progress(0,total);
  const environment=await loadModel('./assets/environment.glb');this.scene.add(environment.scene);this.fallbackScenery.visible=false;
  for(const choice of manifest.cars??[{id:'car',file:manifest.car}]){const loaded=await loadModel(`./assets/${choice.file}`);this.carModels.set(choice.id,loaded.scene);}
  this.setCar('car');
  for(const asset of manifest.decorations){const [high,low]=await Promise.all([loadModel(`./assets/${asset.file}`),loadModel(`./assets/${asset.file.replace('.glb','-low.glb')}`)]);
   for(const index of asset.samples){const s=this.track.samples[index],lod=new T.LOD();lod.addLevel(high.scene.clone(),0);lod.addLevel(low.scene.clone(),80);lod.position.copy(vec(s.p).addScaledVector(vec(s.r),asset.offset));lod.position.y+=(asset.height??0)-(asset.name==='floating-rock'?asset.scale*.85:0);if(asset.positions?.[String(index)])lod.position.copy(vec(asset.positions[String(index)]));if(asset.align)lod.quaternion.copy(quat(s.q));lod.rotateY(asset.yaw??0);lod.userData.distant=!!asset.distant;lod.scale.setScalar(asset.scale);this.scene.add(lod);this.decorations.push(lod);
    if(asset.name==='warning-sign'){const label=new T.Mesh(new T.PlaneGeometry(.76,.27),new T.MeshBasicMaterial({map:this.signTexture}));label.position.set(0,.66,.125);lod.add(label);const arm=new T.Mesh(new T.BoxGeometry(3.7,.22,.3),new T.MeshStandardMaterial({color:0x617e89,metalness:.5,roughness:.6}));arm.position.copy(vec(s.p).addScaledVector(vec(s.r),6.9).addScaledVector(vec(s.u),-.12));arm.quaternion.copy(quat(s.q));this.scene.add(arm);}
}
  }
 }
 setLanguage(language:'zh'|'en'){
  const canvas=this.signTexture.image as HTMLCanvasElement;canvas.width=768;canvas.height=256;const context=canvas.getContext('2d')!;context.fillStyle='#efba42';context.fillRect(0,0,768,256);context.fillStyle='#172736';context.textAlign='center';context.textBaseline='middle';context.font=language==='en'?'bold 94px Arial':'bold 120px Microsoft YaHei, sans-serif';context.fillText(language==='en'?'SLOW DOWN':'请减速',384,132);this.signTexture.colorSpace=T.SRGBColorSpace;this.signTexture.needsUpdate=true;
 }
 setCar(id:string){
  if(this.selectedCar===id||!this.carModels.has(id))return;
  const model=this.carModels.get(id)!.clone(true);this.car.clear();this.car.add(model);this.selectedCar=id;this.carMaterials=[];
  this.wheels=['FL','FR','RL','RR'].map(n=>model.getObjectByName('Wheel_'+n)).filter((w):w is T.Object3D=>!!w);
  model.getObjectByName('Car_Body')?.traverse(o=>{if(o instanceof T.Mesh){o.material=(o.material as T.MeshStandardMaterial).clone();this.carMaterials.push(o.material);}});
  this.ghost.clear();const ghost=model.clone(true);ghost.traverse(o=>{if(o instanceof T.Mesh)o.material=new T.MeshStandardMaterial({color:0x85f5ff,transparent:true,opacity:.25,depthWrite:false});});this.ghost.add(ghost);
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight,false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 render(vehicle:Vehicle,dt:number,menu:boolean,lowMotion:boolean,next:number){this.car.position.copy(vehicle.position);this.car.quaternion.copy(vehicle.rotation);this.wheels.forEach((w,i)=>{w.position.y=-(vehicle.controller.wheelSuspensionLength(i)??.3);w.rotation.set(0,i<2?-vehicle.steering:0,0);w.rotateX(vehicle.controller.wheelRotation(i)??0);});
  const fw=new T.Vector3(0,0,1).applyQuaternion(vehicle.rotation),up=new T.Vector3(0,1,0).applyQuaternion(vehicle.rotation);
  if(menu){const t=performance.now()*.00012,s=this.track.samples[70],p=vec(s.p);this.camera.position.lerp(p.clone().addScaledVector(vec(s.r),22+Math.sin(t)*4).addScaledVector(vec(s.t),-32).add(new T.Vector3(0,17,0)),.03);this.target.lerp(p.clone().addScaledVector(vec(s.t),14),.05);this.cameraUp.lerp(new T.Vector3(0,1,0),.05);}
  else{const alpha=1-Math.exp(-dt*(lowMotion?4:7));this.cameraUp.lerp(vehicle.grounded?up:new T.Vector3(0,1,0),1-Math.exp(-dt*2.2)).normalize();const desired=vehicle.position.clone().addScaledVector(fw,-(8.5+Math.abs(vehicle.speed)*.05)).addScaledVector(this.cameraUp,4.2);this.camera.position.lerp(desired,alpha);this.target.lerp(vehicle.position.clone().addScaledVector(fw,8).addScaledVector(this.cameraUp,1),alpha);}
  if(!menu){const origin=vehicle.position.clone().addScaledVector(up,.5),direction=this.camera.position.clone().sub(origin),distance=direction.length();this.cameraRay.set(origin,direction.normalize());this.cameraRay.far=distance;const hit=this.cameraRay.intersectObjects(this.cameraObstacles,false)[0];if(hit)this.camera.position.copy(origin).addScaledVector(direction,Math.max(.25,hit.distance-.35));}
  this.camera.up.copy(this.cameraUp);this.camera.lookAt(this.target);this.sky.position.copy(this.camera.position);const fov=62+(lowMotion?0:Math.min(12,Math.abs(vehicle.speed)*.2));if(Math.abs(this.camera.fov-fov)>.05){this.camera.fov+=(fov-this.camera.fov)*.06;this.camera.updateProjectionMatrix();}for(const object of this.decorations)object.visible=object.position.distanceTo(vehicle.position)<(object.userData.distant?(this.lowQuality?500:950):(this.lowQuality?150:360));this.renderer.render(this.scene,this.camera);
 }
}

