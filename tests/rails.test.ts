import {beforeAll,it,expect} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3,Quaternion} from 'three';
import {Vehicle} from '../src/game/vehicle';
import type {Track} from '../src/game/track';
beforeAll(async()=>{await RAPIER.init()});
const samples=Array.from({length:601},(_,i)=>({p:[0,0,i-100],t:[0,0,1],u:[0,1,0],r:[1,0,0],q:[0,0,0,1],s:i,road:true,name:'test',width:10}));
const track={samples,spawn:samples[100],gates:[],length:600} as unknown as Track;
for(const side of [-1,1])for(const speed of [25,50,70])it(`contains ${speed*3.6} km/h glancing impact on side ${side} without launching`,()=>{
 const v=new Vehicle(track);for(let i=0;i<60;i++)v.step({throttle:0,brake:0,steer:0,handbrake:false});
 const rotation=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),side*.25);
 v.body.setTranslation({x:side*3,y:.67,z:0},true);v.body.setRotation(rotation,true);v.body.setLinvel(new Vector3(0,0,speed).applyQuaternion(rotation),true);v.sync();
 let height=0,upSpeed=0,lateral=0;
 for(let i=0;i<120;i++){v.step({throttle:0,brake:0,steer:0,handbrake:false});height=Math.max(height,v.position.y);upSpeed=Math.max(upSpeed,v.body.linvel().y);lateral=Math.max(lateral,Math.abs(v.position.x));}
 expect(height).toBeLessThan(1.15);expect(upSpeed).toBeLessThan(3);expect(lateral).toBeLessThan(5.1);v.dispose();
});
