import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Vector3,Quaternion,Matrix4} from 'three';
const design=JSON.parse(readFileSync('tracks/skyline-v1/design.json','utf8'));
let p=new Vector3(0,30,0), heading=0, distance=0;
const samples:any[]=[], gates:any[]=[];
function add(p:Vector3,t:Vector3,u:Vector3,road:boolean,name:string){
 const right=new Vector3().crossVectors(u,t).normalize();u=new Vector3().crossVectors(t,right).normalize();
 const q=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,u,t));
 if(samples.length)distance+=p.distanceTo(new Vector3(...samples.at(-1).p));
 samples.push({p:p.toArray(),t:t.toArray(),u:u.toArray(),r:right.toArray(),q:q.toArray(),s:distance,road,name,width:design.width});
}
add(p,new Vector3(0,0,1),new Vector3(0,1,0),true,'发车直线');
design.segments.forEach((seg:any,idx:number)=>{
 const start=p.clone(),h0=heading,n=Math.ceil(seg.length/1.25);
 for(let j=1;j<=n;j++){
  const f=j/n;
  if(seg.kind==='loop'){
   const a=f*Math.PI*2,fw=new Vector3(Math.sin(heading),0,Math.cos(heading)),rt=new Vector3(Math.cos(heading),0,-Math.sin(heading));
   p=start.clone().addScaledVector(fw,seg.radius*Math.sin(a)).addScaledVector(rt,seg.drift*f);p.y+=seg.radius*(1-Math.cos(a));
   const t=fw.clone().multiplyScalar(Math.cos(a)).add(new Vector3(0,Math.sin(a),0)).addScaledVector(rt,seg.drift/(Math.PI*2*seg.radius)).normalize();
   const up=fw.clone().multiplyScalar(-Math.sin(a)).add(new Vector3(0,Math.cos(a),0)).normalize();
   add(p,t,up,true,seg.name);
  }else{
   heading=h0+(seg.turn||0)*f;
   // Midpoint integration and smooth elevation remove slope discontinuities.
   const mid=h0+(seg.turn||0)*(j-.5)/n;
   p=p.clone().add(new Vector3(Math.sin(mid)*seg.length/n,0,Math.cos(mid)*seg.length/n));
   const ramp=seg.name==='飞跃';
   p.y=start.y+(seg.rise||0)*(ramp?f*f:f*f*(3-2*f));
   const slope=(seg.rise||0)/seg.length*(ramp?2*f:6*f*(1-f));
   const t=new Vector3(Math.sin(heading),slope,Math.cos(heading)).normalize();
   const u=new Vector3(0,1,0).applyAxisAngle(t,(seg.bank||0)*Math.sin(Math.PI*f));add(p,t,u,seg.kind!=='gap',seg.name);
  }
 }
 if(design.checkpointSegments.includes(idx)){const k=samples.length-5;gates.push({...samples[k],index:k,label:`CP ${gates.length+1}`});}
});
gates.push({...samples.at(-5),index:samples.length-5,label:'FINISH'});
const track={...design,samples,gates,length:distance,spawn:{...samples[4]},hash:''};
track.hash=createHash('sha256').update(JSON.stringify(track)).digest('hex');
mkdirSync('public/assets',{recursive:true});writeFileSync('public/assets/track.json',JSON.stringify(track));
writeFileSync('tracks/skyline-v1/baked.json',JSON.stringify(track));
console.log(JSON.stringify({length:distance,samples:samples.length,gates:gates.length,hash:track.hash}));
