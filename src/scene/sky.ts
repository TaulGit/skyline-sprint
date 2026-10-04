import * as T from 'three';
/** Directional sky, independent of the camera position. No external skybox requests. */
export function createSky(){
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{},vertexShader:`varying vec3 direction;
 void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 direction;
 void main(){vec3 d=normalize(direction);float h=max(d.y,0.);
 vec3 horizon=vec3(.72,.83,.89),zenith=vec3(.20,.46,.68);
 vec3 color=mix(horizon,zenith,pow(h,.55));
 float sun=dot(d,normalize(vec3(-.5,.65,.35)));
 color+=vec3(1.,.69,.35)*pow(max(sun,0.),90.)*.3;
 color+=vec3(1.,.93,.72)*smoothstep(.9993,.9996,sun)*.6;
 if(d.y<0.)color=mix(horizon,vec3(.62,.72,.83),min(1.,-d.y*2.));
 gl_FragColor=vec4(color,1.);}`});
 const dome=new T.Mesh(new T.SphereGeometry(1400,24,16),material);dome.frustumCulled=false;dome.renderOrder=-10;return dome;
}
