import RAPIER from '@dimforge/rapier3d-compat';
import {readFileSync,writeFileSync} from 'node:fs';
import {Vector3,Quaternion} from 'three';
import {Vehicle} from '../src/game/vehicle';
import {Race,DT} from '../src/game/race';
import {vec} from '../src/game/track';
await RAPIER.init();const track=JSON.parse(readFileSync('public/assets/track.json','utf8'));
const results:any={};
for(const fps of [30,60,120]){const v=new Vehicle(track);for(let i=0;i<fps*3;i++)for(let sub=0;sub<120/fps;sub++)v.step({throttle:1,brake:0,steer:0,handbrake:false});results[fps]={position:v.position.toArray(),speed:v.speed,grounded:v.grounded};v.dispose();}
const v=new Vehicle(track),r=new Race(track.gates);r.start('test');let nearest=0,maxSpeed=0,air=0;const trace:any[]=[],inputs:any[]=[];
for(let tick=0;tick<120*180;tick++){
 let best=Infinity;for(let i=Math.max(0,nearest-8);i<Math.min(track.samples.length,nearest+50);i++){const d=vec(track.samples[i].p).distanceToSquared(v.position);if(d<best){best=d;nearest=i;}}
 const ahead=track.samples[Math.min(nearest+Math.round(7+Math.abs(v.speed)*.25),track.samples.length-1)];const local=vec(ahead.p).sub(v.position).applyQuaternion(v.rotation.clone().invert());const angle=Math.atan2(local.x,local.z);
 const here=track.samples[nearest];const turn=vec(here.t).angleTo(vec(ahead.t));const target=here.name.includes('发卡')?18:here.name.includes('能源')?46:turn>.15?25:40;
 const input={throttle:v.speed<target?1:.1,brake:v.speed>target+3?.6:0,steer:Math.max(-1,Math.min(1,-angle*4)),handbrake:false};inputs.push(input);v.step(input);r.step(v.previous,v.position);maxSpeed=Math.max(maxSpeed,v.speed);if(!v.grounded)air++;
 if(tick%120===0)trace.push({t:tick*DT,i:nearest,speed:v.speed,p:v.position.toArray(),grounded:v.grounded,cp:r.next,angle,road:here.name});
 if(r.finished||v.position.y<-50){break;}
}
for(const fps of [30,60,120]){const probe=new Vehicle(track),race=new Race(track.gates);race.start('replay');for(let frame=0;frame<Math.ceil(inputs.length/(120/fps));frame++)for(let sub=0;sub<120/fps;sub++){const input=inputs[frame*(120/fps)+sub];if(input){probe.step(input);race.step(probe.previous,probe.position);}}results['fullRace'+fps]={finished:race.finished,valid:race.valid,time:race.elapsed,position:probe.position.toArray()};if(!race.valid||race.result!==r.result)throw Error('Render schedule mismatch');probe.dispose();}
results.autopilot={finished:r.finished,valid:r.valid,time:r.elapsed,cp:r.next,nearest,maxSpeed,air,trace};writeFileSync('drive-inputs.json',JSON.stringify(inputs));writeFileSync('drive-test.json',JSON.stringify(results,null,2));console.log(JSON.stringify({...results,autopilot:{...results.autopilot,trace:trace.slice(-6)}},null,2));v.dispose();

