import RAPIER from '@dimforge/rapier3d-compat';
import {readFileSync} from 'node:fs';
import {Vector3} from 'three';
import {Vehicle} from '../src/game/vehicle';
await RAPIER.init();
const track=JSON.parse(readFileSync('public/assets/track.json','utf8'));
for(const brake of [0,1]){
 const vehicle=new Vehicle(track);
 for(let i=0;i<120;i++)vehicle.step({throttle:1,brake:0,steer:0,handbrake:false});
 const origin=vehicle.position.clone(),forward=new Vector3(0,0,1).applyQuaternion(vehicle.rotation);
 let driftTicks=0;
 for(let i=0;i<45;i++){vehicle.step({throttle:1,brake,steer:-1,handbrake:false});if(vehicle.drifting)driftTicks++}
 const lateral=new Vector3(1,0,0).applyQuaternion(vehicle.rotation),velocity=new Vector3().copy(vehicle.body.linvel()),heading=new Vector3(0,0,1).applyQuaternion(vehicle.rotation);
 console.log(JSON.stringify({brake,driftTicks,speed:vehicle.speed,lateralSpeed:velocity.dot(lateral),headingChange:heading.angleTo(forward),travel:vehicle.position.clone().sub(origin).dot(forward),grounded:vehicle.grounded}));
 vehicle.dispose();
}
