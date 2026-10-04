import {describe,it,expect} from 'vitest';
import {Vector3} from 'three';
import {Race,crossing,FixedClock,DT} from '../src/game/race';
import {byteSize,cloudRecord,packFrame,playback,validRecord,type RecordData} from '../src/game/replay';
import {Quaternion} from 'three';
import type {Gate} from '../src/game/track';
import track from '../public/assets/track.json';
const gate=(z:number):Gate=>({p:[0,0,z],t:[0,0,1],u:[0,1,0],r:[1,0,0],q:[0,0,0,1],s:z,width:10,road:true,name:'test',index:0,label:'CP'});
describe('directed finite swept gates',()=>{
 it('interpolates a high speed crossing',()=>expect(crossing(new Vector3(0,1,-30),new Vector3(0,1,70),gate(0))).toBeCloseTo(.3));
 it('rejects reverse, out of width and overflight',()=>{expect(crossing(new Vector3(0,1,1),new Vector3(0,1,-1),gate(0))).toBeNull();expect(crossing(new Vector3(8,1,-1),new Vector3(8,1,1),gate(0))).toBeNull();expect(crossing(new Vector3(0,9,-1),new Vector3(0,9,1),gate(0))).toBeNull();});
 it('ends as practice when crossing the finish after a missed checkpoint',()=>{const r=new Race([gate(5),gate(20)]);r.start('one');r.step(new Vector3(0,1,19.8),new Vector3(0,1,20.2));expect(r.next).toBe(0);expect(r.finished).toBe(true);expect(r.valid).toBe(false);expect(r.reason).toContain('CP 1');});
 it('bakes the six configured checkpoints in route order',()=>{expect(track.gates.map(g=>g.label)).toEqual(['CP 1','CP 2','CP 3','CP 4','CP 5','CP 6','FINISH']);expect(track.gates[0].s).toBeLessThan(130);expect(track.gates[4].name).toBe('能源环助跑');});
 it('prevents a gate with an earlier sweep fraction passing after another',()=>{const r=new Race([gate(20),gate(5)]);r.start('one');r.step(new Vector3(0,1,0),new Vector3(0,1,25));expect(r.next).toBe(1);});
 it('invalidates practice and fully resets runs',()=>{const r=new Race([gate(1)]);r.start('a');r.invalidate('pause');r.ticks=240;r.step(new Vector3(0,1,0),new Vector3(0,1,2));expect(r.valid).toBe(false);r.start('b');expect(r.reason).toBe('');expect(r.ticks).toBe(0);expect(r.splits).toEqual([]);});
});
describe('render independent time',()=>{
 it.each([30,60,120])('%i FPS schedules exactly 1200 steps for 10 seconds',(fps)=>{const c=new FixedClock();let ticks=0;for(let i=0;i<10*fps;i++)c.advance(1/fps,()=>ticks++,()=>{throw Error('lag')});expect(ticks).toBe(1200);expect(ticks*DT).toBe(10);});
 it('serious lag explicitly invalidates instead of granting a ranked slowdown',()=>{const c=new FixedClock();let lag=false;c.advance(1,()=>{},()=>lag=true);expect(lag).toBe(true);});
});
describe('ghost records',()=>{
 it('interpolates quantized transform',()=>{const frames=[packFrame(0,new Vector3(),new Quaternion()),packFrame(50,new Vector3(10,0,0),new Quaternion())];const p=new Vector3(),q=new Quaternion();playback(frames,25,p,q);expect(p.x).toBe(5);});
 it('removes only cloud frames over budget and isolates versions',()=>{const r:RecordData={schemaVersion:1,trackVersion:'t',physicsVersion:'p',time:600000,splits:[1,2,3,4,5,6,600000],frames:Array.from({length:12000},(_,i)=>packFrame(i*50,new Vector3(100,100,100),new Quaternion()))};expect(byteSize(r)).toBeGreaterThan(192*1024);expect(cloudRecord(r).frames).toEqual([]);expect(r.frames.length).toBe(12000);expect(validRecord(r,'wrong','p')).toBe(false);expect(validRecord(r,'t','p')).toBe(true);});
});
