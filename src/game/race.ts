import {Vector3} from 'three';
import {vec,type Gate} from './track';
export const DT=1/120;
export function crossing(a:Vector3,b:Vector3,g:Gate):number|null{
 const n=vec(g.t),o=vec(g.p),da=a.clone().sub(o).dot(n),db=b.clone().sub(o).dot(n);
 if(!(da<0&&db>=0))return null;
 const f=-da/(db-da),hit=a.clone().lerp(b,f).sub(o);
 if(Math.abs(hit.dot(vec(g.r)))>g.width/2+.6||hit.dot(vec(g.u))<-.7||hit.dot(vec(g.u))>5)return null;
 return f;
}
export class Race{
 ticks=0;next=0;splits:number[]=[];reason='';finished=false;result=0;running=false;id='';
 constructor(public gates:Gate[]){}
 start(id:string){this.ticks=0;this.next=0;this.splits=[];this.reason='';this.finished=false;this.result=0;this.running=true;this.id=id;}
 invalidate(reason:string){if(this.running&&!this.reason)this.reason=reason;}
 step(a:Vector3,b:Vector3){if(!this.running)return;if(!Number.isFinite(a.lengthSq()+b.lengthSq())||a.distanceTo(b)>90*DT)this.invalidate('车辆状态异常 · 本局转为练习');let previousFraction=-1;
  const finishFraction=crossing(a,b,this.gates[this.gates.length-1]);
  while(this.next<this.gates.length){const f=crossing(a,b,this.gates[this.next]);if(f===null||f<previousFraction)break;previousFraction=f;const ms=Math.round((this.ticks+f)*DT*1000);this.splits.push(ms);this.next++;if(this.next===this.gates.length){this.result=ms;this.running=false;this.finished=true;break;}}
  if(!this.finished&&finishFraction!==null&&this.next<this.gates.length-1){
   this.invalidate(`漏过 CP ${this.next+1} · 练习完赛`);
   this.result=Math.round((this.ticks+finishFraction)*DT*1000);this.running=false;this.finished=true;
  }
  this.ticks++;if(this.ticks*DT>600)this.invalidate('超过正式挑战时限');
 }
 get elapsed(){return this.finished?this.result:Math.round(this.ticks*DT*1000)}
 get valid(){return this.finished&&!this.reason&&this.result>=1000&&this.result<=600000}
}
export class FixedClock{
 accumulator=0;
 reset(){this.accumulator=0}
 advance(seconds:number,step:()=>void,lag:()=>void){
  if(seconds>.25){lag();this.accumulator=0;return;}
  this.accumulator+=Math.max(0,seconds);
  while(this.accumulator+1e-10>=DT){step();this.accumulator-=DT;}
 }
}
export function formatTime(ms:number){return `${Math.floor(ms/60000).toString().padStart(2,'0')}:${Math.floor(ms/1000%60).toString().padStart(2,'0')}.${Math.floor(ms%1000).toString().padStart(3,'0')}`}
