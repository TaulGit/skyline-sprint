import {getLanguage,type Language} from '../i18n';
import {cloudRecord,validRecord,type RecordData} from '../game/replay';
export const BOARD='skyline_v5_time';
export interface Settings{language:Language;car:string;color:string;sfx:number;music:number;lowMotion:boolean;quality:string;autoThrottle:boolean;ghost:boolean}
export const defaults:Settings={language:getLanguage(),car:'car',color:'#38d9ec',sfx:.6,music:.15,lowMotion:false,quality:'high',autoThrottle:false,ghost:true};
// Wire interfaces follow SDK v2.4.6 rev23; runtime is exclusively the official IIFE.
interface SDK{context:{user:{id:string|number}|null;sessionId?:string;gameId:number};on:(name:string,cb:()=>void)=>()=>void;storage?:{get:(p:unknown)=>Promise<{value:unknown;version:number}>;set:(p:unknown)=>Promise<{ok:boolean;version:number}>};leaderboard?:{submit:(p:unknown)=>Promise<any>;getTop:(p:unknown)=>Promise<any>;getMyValue:(p:unknown)=>Promise<any>}}
declare global{interface Window{GameSDK?:{init:()=>Promise<SDK>;isPlatformSDKError:(e:unknown)=>e is {code:string;details?:{retryAfterMs?:number}}}}}
export class Platform{
 sdk?:SDK;best?:RecordData;settings={...defaults};identity='local';generation=0;ready=false;settlement=0;
 constructor(public trackVersion:string,public physicsVersion:string,public status:(s:string)=>void){}
 key(){return`skyline:${this.trackVersion}:${this.physicsVersion}:${this.identity}`}
 error(e:unknown){return window.GameSDK?.isPlatformSDKError(e)?e.code:'NETWORK_ERROR'}
 async init(){if(window.parent!==window&&!window.GameSDK){const script=document.getElementById('star-letter-sdk');if(script)await new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);script.removeEventListener('load',done);script.removeEventListener('error',done);resolve();};const timer=setTimeout(done,12000);script.addEventListener('load',done,{once:true});script.addEventListener('error',done,{once:true});});}try{if(!window.GameSDK||window.parent===window)throw Error('standalone');this.sdk=await window.GameSDK.init();this.identity=String(this.sdk.context.user?.id??'guest');this.sdk.on('context.update',()=>{const next=String(this.sdk?.context.user?.id??'guest');if(next!==this.identity){this.identity=next;this.generation++;this.best=undefined;this.settings={...defaults};this.ready=false;void this.load();}});}catch(e){this.status('本机模式 · 云存档与排行未连接');}await this.load();}
 async load(){const gen=this.generation;
  try{const raw=JSON.parse(localStorage.getItem(this.key())??'null');if(raw){if(validRecord(raw.best,this.trackVersion,this.physicsVersion))this.best=raw.best;this.settings=this.cleanSettings(raw.settings);}}catch{this.status('本机存档损坏，已恢复默认设置');}
  if(!this.sdk?.storage){this.ready=false;return;}
  try{const data=await this.sdk.storage.get({key:`record:${this.trackVersion}:${this.physicsVersion}`,scope:'user'});if(gen!==this.generation)return;const raw=data.value as any;if(raw){if(validRecord(raw.best,this.trackVersion,this.physicsVersion)&&(!this.best||raw.best.time<this.best.time))this.best=raw.best;this.settings=this.cleanSettings(raw.settings);}
   this.ready=true;this.status('云存档已连接');this.local();
  }catch(e){this.ready=false;this.status(`云端读取失败 · ${this.error(e)} · 保留本机进度`);}
 }
 cleanSettings(s:any):Settings{return{language:s?.language==='en'?'en':s?.language==='zh'?'zh':getLanguage(),car:['car','endurance-coupe','rally-buggy'].includes(s?.car)?s.car:defaults.car,color:['#38d9ec','#ff9169','#bba2ff'].includes(s?.color)?s.color:defaults.color,sfx:typeof s?.sfx==='number'?Math.max(0,Math.min(1,s.sfx)):defaults.sfx,music:typeof s?.music==='number'?Math.max(0,Math.min(1,s.music)):defaults.music,lowMotion:!!s?.lowMotion,quality:s?.quality==='low'?'low':'high',autoThrottle:!!s?.autoThrottle,ghost:s?.ghost!==false}}
 local(){try{localStorage.setItem(this.key(),JSON.stringify({best:this.best,settings:this.settings}));}catch{this.status('本机空间不足，当前成绩保留在内存');}}
 async save(){this.local();if(!this.sdk?.storage||!this.ready){this.status('已保存本机 · 尚未同步云端');return;}const gen=this.generation,storage=this.sdk.storage,key=`record:${this.trackVersion}:${this.physicsVersion}`;
  try{for(let attempt=0;attempt<2;attempt++){
   const old=await storage.get({key,scope:'user'});if(gen!==this.generation)return;const value=old.value as any;let best=this.best;
   if(validRecord(value?.best,this.trackVersion,this.physicsVersion)&&(!best||value.best.time<best.time))best=value.best;
   try{await storage.set({key,scope:'user',ifVersion:old.version,value:{schemaVersion:1,best:best?cloudRecord(best):null,settings:{...this.settings}}});if(gen!==this.generation)return;this.best=best;this.local();this.status('已同步云端');return;}catch(e){if(this.error(e)==='STORAGE_CONFLICT'&&attempt===0)continue;throw e;}
  }}catch(e){if(gen===this.generation)this.status(`仅保存在本机 · ${this.error(e)}`);}
 }
 async submit(id:string,time:number){if(!this.sdk?.leaderboard){this.status('本机成绩已保留 · 排行能力尚未就绪');return;}const gen=this.generation,settlement=this.settlement,session=this.sdk.context.sessionId,payload={boardCode:BOARD,submissionId:id,payload:{type:'numeric',value:time}};
  // Only same-result CAPABILITY_UNAVAILABLE gets one bounded same-session retry.
  for(let attempt=0;attempt<2;attempt++)try{const r=await this.sdk.leaderboard.submit(payload);if(gen!==this.generation||settlement!==this.settlement||session!==this.sdk.context.sessionId)return;this.status(r.targets?.some((t:any)=>t.projection.status==='PENDING')?'成绩已接收 · 排名计算中':'成绩已提交');return r;}catch(e){if(gen!==this.generation||settlement!==this.settlement||session!==this.sdk.context.sessionId)return;const code=this.error(e);if(code==='CAPABILITY_UNAVAILABLE'&&attempt===0){const delay=window.GameSDK?.isPlatformSDKError(e)?e.details?.retryAfterMs:undefined;await new Promise(r=>setTimeout(r,Math.max(500,Math.min(delay??1000,5000))));if(gen!==this.generation||settlement!==this.settlement||session!==this.sdk.context.sessionId)return;continue;}this.status(code==='LEADERBOARD_MATERIALIZATION_PENDING'?'成绩已记录 · 榜单更新中':code==='PERMISSION_DENIED'?'未授权排行 · 本局保存在本机':`提交未完成 · ${code} · 可继续新挑战`);return;}
 }
 async board(viewCode:string){if(!this.sdk?.leaderboard)throw Error('排行榜尚未连接，请在星匣预览中打开');const args={boardCode:BOARD,viewCode,window:'CURRENT'};return Promise.all([this.sdk.leaderboard.getTop({...args,boardKind:'PLAYER_VALUE',limit:20}),this.sdk.leaderboard.getMyValue(args)]);}
}
