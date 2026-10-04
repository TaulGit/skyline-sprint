import type {Control} from './vehicle';
// In the +Z-forward chase view, driver's left is local +X. The Rapier
// steering convention takes a negative input for that turn.
export function readControl(keys:ReadonlySet<string>,touch:ReadonlySet<string>,autoThrottle=false):Control{
 const left=keys.has('KeyA')||keys.has('ArrowLeft')||touch.has('left');
 const right=keys.has('KeyD')||keys.has('ArrowRight')||touch.has('right');
 return{throttle:keys.has('KeyW')||keys.has('ArrowUp')||touch.has('throttle')||autoThrottle?1:0,brake:keys.has('KeyS')||keys.has('ArrowDown')||touch.has('brake')?1:0,steer:Number(right)-Number(left),handbrake:keys.has('Space')||touch.has('handbrake')};
}
