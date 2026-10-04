type Cue='click'|'checkpoint'|'finish'|'impact';
const SAMPLES=['engine','skid','click','checkpoint','finish','impact'] as const;
/** Playback only: all effects are licensed recordings, not synthesized sounds. */
export class Sound{
 context?:AudioContext;engine?:AudioBufferSourceNode;skid?:AudioBufferSourceNode;
 engineGain?:GainNode;skidGain?:GainNode;buffers=new Map<string,AudioBuffer>();
 sfx=.6;private musicVolume=.35;private started=false;private loading?:Promise<void>;
 private voices=new Set<AudioBufferSourceNode>();private track=0;
 readonly playlist=['./assets/audio/sky-flight-1.mp3','./assets/audio/sky-flight-2.mp3'];
 readonly player:HTMLAudioElement;
 constructor(){
  this.player=document.createElement('audio');this.player.id='bgm';this.player.hidden=true;this.player.preload='metadata';this.player.src=this.playlist[0];this.player.volume=this.musicVolume;document.body.append(this.player);
  this.player.addEventListener('ended',()=>this.nextTrack());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.player.pause();void this.context?.suspend();}else if(this.started)this.start();});
 }
 get music(){return this.musicVolume}
 set music(value:number){this.musicVolume=Math.max(0,Math.min(1,value));this.player.volume=this.musicVolume;}
 start(){
  this.started=true;if(document.hidden)return;
  if(!this.context)this.context=new AudioContext();void this.context.resume();
  if(this.player.paused)void this.player.play().catch(()=>{});
  if(!this.loading)this.loading=this.load();
 }
 nextTrack(){this.track=(this.track+1)%this.playlist.length;this.player.src=this.playlist[this.track];if(this.started&&!document.hidden)void this.player.play().catch(()=>{});}
 private async load(){
  const ctx=this.context!;
  await Promise.all(SAMPLES.map(async name=>{try{const response=await fetch(`./assets/audio/${name}.wav`);if(!response.ok)throw Error(String(response.status));this.buffers.set(name,await ctx.decodeAudioData(await response.arrayBuffer()));}catch(e){console.warn(`Audio sample unavailable: ${name}`,e)}}));
  for(const name of ['engine','skid'] as const){const buffer=this.buffers.get(name);if(!buffer)continue;const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain).connect(ctx.destination);source.start();if(name==='engine'){this.engine=source;this.engineGain=gain}else{this.skid=source;this.skidGain=gain}}
 }
 tick(speed:number,active:boolean,skidding=false){
  if(!this.context)return;const t=this.context.currentTime;
  this.engine?.playbackRate.setTargetAtTime(.75+Math.min(1.45,Math.abs(speed)/32),t,.15);
  this.engineGain?.gain.setTargetAtTime(active?this.sfx*(.12+Math.min(.16,Math.abs(speed)/180)):0,t,.08);
  this.skidGain?.gain.setTargetAtTime(active&&skidding&&Math.abs(speed)>8?this.sfx*.14:0,t,.07);
 }
 play(cue:Cue,volume=1){
  const buffer=this.buffers.get(cue);if(!buffer||!this.context||this.context.state!=='running'||this.voices.size>=8)return;
  const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=this.sfx*Math.max(0,Math.min(1,volume))*.45;source.connect(gain).connect(this.context.destination);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect()};source.start();
 }
}
