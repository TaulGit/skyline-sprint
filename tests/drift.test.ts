import {beforeAll,describe,expect,it} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import track from '../public/assets/track.json';
import {Vehicle} from '../src/game/vehicle';
import {TireTrails} from '../src/scene/tire-trails';

beforeAll(async()=>{await RAPIER.init()});

describe('down-key drift and wheel trails',()=>{
 it('only drifts while steering at speed, with stronger rotation than normal steering',()=>{
  const results:number[]=[];
  for(const brake of [0,1]){
   const car=new Vehicle(track);
   for(let i=0;i<120;i++)car.step({throttle:1,brake:0,steer:0,handbrake:false});
   const start=new Vector3(0,0,1).applyQuaternion(car.rotation);
   for(let i=0;i<45;i++)car.step({throttle:1,brake,steer:-1,handbrake:false});
   expect(car.drifting).toBe(brake===1);
   results.push(start.angleTo(new Vector3(0,0,1).applyQuaternion(car.rotation)));
   car.dispose();
  }
  expect(results[1]-results[0]).toBeGreaterThan(.01);
  expect(results[1]-results[0]).toBeLessThan(.05);
 });
 it('records four real wheel contact trails and clears them on reset',()=>{
  const car=new Vehicle(track),trails=new TireTrails();
  for(let i=0;i<120;i++){car.step({throttle:1,brake:0,steer:0,handbrake:false});trails.update(car)}
  expect(trails.rolling.count).toBeGreaterThan(10);
  for(let i=0;i<45;i++){car.step({throttle:1,brake:1,steer:-1,handbrake:false});trails.update(car)}
  expect(trails.sliding.count).toBeGreaterThan(0);
  trails.clear();expect(trails.rolling.count+trails.sliding.count).toBe(0);
  car.dispose();
 });
});
