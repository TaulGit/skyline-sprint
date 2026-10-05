export type Language='zh'|'en';
let language:Language='zh';
try{language=localStorage.getItem('skyline:language')==='en'?'en':'zh'}catch{}
export const getLanguage=()=>language;
export function setLanguage(value:Language){language=value;try{localStorage.setItem('skyline:language',value)}catch{}if(typeof document!=='undefined'){document.documentElement.lang=value==='en'?'en':'zh-CN';document.title=value==='en'?'Skyline Sprint':'云端极速 · Skyline Sprint'}}
const english:Record<string,string>={
 '云端极速':'Skyline Sprint','云端折返 · 1.13 KM':'SKYLINE CIRCUIT · 1.13 KM','云端折返':'Skyline Circuit','追逐你的最快一圈。':'Chase your best time.',
 '开始 ↗':'Race ↗','赛车':'Cars','排行':'Rankings','设置':'Settings','↻ 重开':'↻ Restart','Ⅱ 设置':'Ⅱ Settings','用时':'Time','最佳':'Best','金':'Gold','银':'Silver','铜':'Bronze',
 'WASD / 方向键 · R 重开 · C 复位':'WASD / Arrows · R Restart · C Reset','方向键驾驶 · 转弯按 ↓ 漂移':'Arrows to drive · Turn + ↓ to drift','R 重开 · C 复位':'R Restart · C Reset','手刹':'Brake','↓ 漂':'↓ Drift',
 '操作':'Controls','W / ↑ 加速 · S / ↓ 刹车':'W / ↑ Accelerate · S / ↓ Brake','A D / ← → 转向 · 转弯按 S / ↓ 漂移':'A D / ← → Steer · Turn + S / ↓ to drift','Space 手刹 · R 重开 · C 复位':'Space Handbrake · R Restart · C Reset','依次过门，再冲线。':'Pass every checkpoint, then cross the finish.','复位、暂停或离开窗口后，本局不计排名。':'Resetting, pausing or leaving the window makes this a practice run.','出发 ↗':'Go ↗',
 '选择赛车':'Choose your car','流光':'Lumen','赤隼':'Kestrel','逐风':'Zephyr','原版轻量赛车':'Lightweight racer','封闭座舱原型车':'Endurance prototype','开放式拉力赛车':'Open-cockpit rally car','三款赛车性能一致。':'All three cars have identical performance.','完成':'Done','配色':'Paint','音效':'Effects','音乐':'Music','下一首 ♫':'Next track ♫','低晃动':'Reduced camera motion','自动加速':'Auto accelerate','显示幽灵':'Show ghost','画质':'Quality','标准':'Standard','流畅':'Low','主页':'Home','语言':'Language',
 '排行榜':'Leaderboards','本日':'Today','本周':'This week','28 天周期':'28-day cycle','加载中…':'Loading…','返回':'Back','暂无成绩':'No times yet','榜单更新中':'Updating rankings','本期暂无成绩':'No time this period','成绩已过期':'Time expired','排名计算中':'Calculating rank','未进入展示范围':'Outside the displayed rankings','名次':'Rank','车手':'Driver',
 '新纪录':'New best','完赛':'Finished','练习完赛':'Practice finished','已保存幽灵。':'Ghost saved.','★ 金牌':'★ Gold','★ 银牌':'★ Silver','★ 铜牌':'★ Bronze','分段':'Splits','重开 ↗':'Race again ↗','检查点通过':'Checkpoint passed',
 '已复位 · 练习局':'Reset · Practice run','已暂停 · 练习局':'Paused · Practice run','账号已切换 · 请重新开始':'Account changed · Restart required','运行卡顿 · 练习局':'Timing interrupted · Practice run','已离开窗口 · 练习局':'Window unfocused · Practice run','已切到后台 · 练习局':'Tab hidden · Practice run','车辆状态异常 · 本局转为练习':'Invalid vehicle state · Practice run','超过正式挑战时限':'Time limit exceeded',
 '正在连接星匣…':'Connecting to Star-letter…','本机模式 · 云存档与排行未连接':'Local mode · Cloud and rankings offline','本机存档损坏，已恢复默认设置':'Local save unreadable · Defaults restored','云存档已连接':'Cloud save connected','本机空间不足，当前成绩保留在内存':'Local storage full · Time kept in memory','已保存本机 · 尚未同步云端':'Saved locally · Cloud sync pending','已同步云端':'Cloud save synced','本机成绩已保留 · 排行能力尚未就绪':'Time saved locally · Rankings unavailable','成绩已接收 · 排名计算中':'Time received · Calculating rank','成绩已提交':'Time submitted','云端已保存成绩':'Time saved on leaderboard','云端已保存成绩 · 排名计算中':'Time saved online · Calculating rank','成绩已记录 · 榜单更新中':'Time saved · Updating rankings','未授权排行 · 本局保存在本机':'Rankings not authorized · Time saved locally','排行榜尚未连接，请在星匣预览中打开':'Rankings offline. Open this game on Star-letter.',
 '模型加载失败，请刷新重试':'Models failed to load. Please refresh.','模型清单加载失败':'Model list failed to load','赛道资源加载失败':'Track failed to load','加载未完成':'Unable to load','重新加载':'Reload'
};
export function t(text:string):string{
 if(language==='zh')return text;
 const trimmed=text.trim(),padding=text.slice(0,text.indexOf(trimmed));
 if(english[trimmed])return padding+english[trimmed]+text.slice(padding.length+trimmed.length);
 return text.replace(/^最佳 (.*)$/,'Best $1').replace(/^(\d+)\/6 · 下一门 CP(\d+)$/,'$1/6 · Next CP$2').replace('6/6 · 冲线','6/6 · Finish')
 .replace(/^配色 (.*)$/,'Paint $1').replace(/^漏过 CP (\d+) · 练习完赛$/,'Missed CP $1 · Practice finished')
 .replace(/^对比最佳 (.*) 秒$/,'Compared to best: $1 s').replace(/^第 (\d+) 名$/,'Rank $1')
 .replace(/^我的成绩 (.*?) · (.*)$/,(_,time,status)=>`My time ${time} · ${t(status)}`)
 .replace(/^云端读取失败 · (.*?) · 保留本机进度$/,'Cloud read failed · $1 · Local progress kept')
 .replace(/^仅保存在本机 · (.*)$/,'Saved locally only · $1').replace(/^提交未完成 · (.*?) · 可继续新挑战$/,'Submission incomplete · $1 · You can race again');
}
/** Translate authored interface text; player names and other external values can opt out. */
export function translateDOM(root:HTMLElement){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
 while(node=walker.nextNode())if(!(node.parentElement?.closest('[data-no-translate]')))node.textContent=t(node.textContent??'');
 for(const node of root.querySelectorAll<HTMLElement>('[aria-label],[alt]'))for(const attr of ['aria-label','alt']){const value=node.getAttribute(attr);if(value)node.setAttribute(attr,t(value));}
}
