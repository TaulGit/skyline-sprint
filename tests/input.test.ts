import {beforeAll,describe,it,expect} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import track from '../public/assets/track.json';
import {Vector3} from 'three';
import {Vehicle} from '../src/game/vehicle';
import {readControl} from '../src/game/input';
beforeAll(async()=>{await RAPIER.init()});
describe('driver-relative steering',()=>{
 for(const [direction,key,letter,sign] of [['left','ArrowLeft','KeyA',1],['right','ArrowRight','KeyD',-1]] as const){
  it(`${direction} agrees for arrow, WASD and touch and turns the physical car that way`,()=>{
   const input=readControl(new Set(['KeyW',key]),new Set());
   expect(readControl(new Set(['KeyW',letter]),new Set())).toEqual(input);
   expect(readControl(new Set(),new Set(['throttle',direction]))).toEqual(input);
   const v=new Vehicle(track);for(let i=0;i<120;i++)v.step({throttle:1,brake:0,steer:0,handbrake:false});
   const start=v.position.clone(),left=new Vector3(1,0,0).applyQuaternion(v.rotation);
   for(let i=0;i<40;i++)v.step(input);
   expect(v.position.clone().sub(start).dot(left)*sign).toBeGreaterThan(.15);v.dispose();
  });
 }
 it('opposing inputs cancel',()=>{expect(readControl(new Set(['ArrowLeft']),new Set(['right'])).steer).toBe(0)});
});
