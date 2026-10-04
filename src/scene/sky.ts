import * as T from 'three';
/** Two authored horizon paintings blend into the procedural upper/lower sky. */
export function createSky(){
 const loader=new T.TextureLoader(),city=loader.load('./assets/sky-city.webp'),mountains=loader.load('./assets/sky-mountains.webp');
 city.colorSpace=mountains.colorSpace=T.SRGBColorSpace;
 const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{city:{value:city},mountains:{value:mountains}},vertexShader:`varying vec3 direction;
 void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 direction;uniform sampler2D city;uniform sampler2D mountains;
 void main(){vec3 d=normalize(direction);float h=max(d.y,0.);
 vec3 horizon=vec3(.72,.83,.89),zenith=vec3(.20,.46,.68);
 vec3 color=mix(horizon,zenith,pow(h,.55));
 float sun=dot(d,normalize(vec3(-.5,.65,.35)));
 color+=vec3(1.,.69,.35)*pow(max(sun,0.),90.)*.3;
 color+=vec3(1.,.93,.72)*smoothstep(.9993,.9996,sun)*.6;
 if(d.y<0.)color=mix(horizon,vec3(.62,.72,.83),min(1.,-d.y*2.));
 float longitude=atan(d.z,d.x)/6.2831853+.5;
 float panel=fract(longitude*2.);
 vec2 uv=vec2(panel,clamp((d.y+.30)/.85,0.,1.));
 vec3 painted=longitude<.5?texture2D(city,uv).rgb:texture2D(mountains,uv).rgb;
 float edge=smoothstep(0.,.075,panel)*(1.-smoothstep(.925,1.,panel));
 float band=smoothstep(-.30,-.19,d.y)*(1.-smoothstep(.37,.53,d.y));
 color=mix(color,painted,edge*band*.88);
 gl_FragColor=vec4(color,1.);}`});
 const dome=new T.Mesh(new T.SphereGeometry(1400,24,16),material);dome.frustumCulled=false;dome.renderOrder=-10;return dome;
}
