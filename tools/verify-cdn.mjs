import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const detail=JSON.parse(readFileSync(process.argv[2]??'game-detail.json','utf8').replace(/^\uFEFF/,'' )).data;
const base=new URL('.',detail.gameFile), paths=['index.html',...detail.assets.map(url=>new URL(url).pathname.slice(base.pathname.length))];
const rows=[];let next=0;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await Promise.all(Array.from({length:4},async()=>{
 while(next<paths.length){const path=paths[next++],response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000)}),bytes=Buffer.from(await response.arrayBuffer()),local=readFileSync('dist/'+path);
  rows.push({path,status:response.status,mime:response.headers.get('content-type'),bytes:bytes.length,sha256:hash(bytes),matchesLocal:hash(bytes)===hash(local)});
 }
}));
const cover=await fetch(detail.cover,{signal:AbortSignal.timeout(30000)}),coverBytes=Buffer.from(await cover.arrayBuffer());
const coverPath=JSON.parse(readFileSync('star-letter.json','utf8')).cover;
rows.push({path:coverPath,status:cover.status,mime:cover.headers.get('content-type'),bytes:coverBytes.length,sha256:hash(coverBytes),matchesLocal:hash(coverBytes)===hash(readFileSync(coverPath))});
rows.sort((a,b)=>a.path.localeCompare(b.path));
const report={checkedAt:new Date().toISOString(),gameId:detail.gameId,mode:'relative URLs without query parameters',files:rows};
writeFileSync('evidence/cdn-check.json',JSON.stringify(report,null,2));
if(rows.some(r=>r.status!==200||!r.matchesLocal))throw Error('CDN content differs from local build; inspect evidence/cdn-check.json');
console.log(JSON.stringify({gameId:detail.gameId,files:rows.length,all200:true,allHashesMatch:true}));
