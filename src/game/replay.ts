import {Vector3,Quaternion} from 'three';
export type Frame=[number,number,number,number,number,number,number,number];
export interface RecordData{schemaVersion:1;trackVersion:string;physicsVersion:string;time:number;splits:number[];frames:Frame[]}
export const byteSize=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value)).length;
export function packFrame(time:number,p:Vector3,q:Quaternion):Frame{return[time,Math.round(p.x*100),Math.round(p.y*100),Math.round(p.z*100),Math.round(q.x*10000),Math.round(q.y*10000),Math.round(q.z*10000),Math.round(q.w*10000)]}
export function playback(frames:Frame[],ms:number,p:Vector3,q:Quaternion){
 if(!frames.length)return false;let lo=0,hi=frames.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid][0]<=ms)lo=mid;else hi=mid-1;}
 const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)],f=b[0]===a[0]?0:Math.max(0,Math.min(1,(ms-a[0])/(b[0]-a[0])));
 p.set(a[1]/100,a[2]/100,a[3]/100).lerp(new Vector3(b[1]/100,b[2]/100,b[3]/100),f);
 q.set(a[4]/10000,a[5]/10000,a[6]/10000,a[7]/10000).normalize().slerp(new Quaternion(b[4]/10000,b[5]/10000,b[6]/10000,b[7]/10000).normalize(),f);return true;
}
export function validRecord(v:unknown,t:string,p:string):v is RecordData{
 if(!v||typeof v!=='object')return false;const r=v as RecordData;
 return r.schemaVersion===1&&r.trackVersion===t&&r.physicsVersion===p&&Number.isInteger(r.time)&&r.time>=1000&&r.time<=600000&&Array.isArray(r.splits)&&r.splits.length===7&&r.splits.every((n,i)=>Number.isFinite(n)&&n>=0&&(i===0||n>=r.splits[i-1]))&&r.splits.at(-1)===r.time&&Array.isArray(r.frames)&&r.frames.length<=12001&&r.frames.every((f,i)=>Array.isArray(f)&&f.length===8&&f.every(Number.isFinite)&&f[0]>=0&&(i===0||f[0]>r.frames[i-1][0]));
}
export function cloudRecord(record:RecordData){const copy={...record};if(byteSize(copy)>192*1024)copy.frames=[];return copy;}
