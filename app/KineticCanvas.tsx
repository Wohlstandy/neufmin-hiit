'use client';

import {useEffect,useRef} from 'react';

type Props={phase:'ready'|'work'|'rest'|'done';intensity:number};

const vertex=`
attribute vec2 a_position;
void main(){gl_Position=vec4(a_position,0.0,1.0);}
`;

const fragment=`
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_phase;
uniform float u_energy;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0)),f.x),f.y);
}

void main(){
 vec2 size=u_resolution;
 vec2 uv=(gl_FragCoord.xy-.5*size)/min(size.x,size.y);
 vec2 mouse=(u_mouse-.5*size)/min(size.x,size.y);
 float t=u_time*.22;
 vec3 hot=vec3(1.0,.14,.025),cool=vec3(.48,1.0,.055);
 vec3 accent=mix(hot,cool,u_phase);

 float field=noise(uv*3.2+vec2(t,-t*.7));
 float bend=(field-.5)*.25;
 float ribbonA=1.0-smoothstep(0.0,.034,abs(uv.y+sin(uv.x*4.1+t*2.2)*.12+bend));
 float ribbonB=1.0-smoothstep(0.0,.022,abs(uv.y*.8-cos(uv.x*5.2-t*1.7)*.19-bend*.7));
 float radius=length(uv-mouse*.22);
 float pulse=sin(radius*24.0-t*5.0-u_energy*2.0)*.5+.5;
 float halo=(1.0-smoothstep(.05,.62,radius))*(.24+.23*pulse);
 float grain=hash(gl_FragCoord.xy+u_time)*.025;
 float strength=(ribbonA*.23+ribbonB*.12+halo*.12)*(0.72+u_energy*.55);
 vec3 color=accent*strength+grain*accent;
 float alpha=clamp(strength+grain*.7,0.0,.34);
 gl_FragColor=vec4(color,alpha);
}
`;

function makeShader(gl:WebGLRenderingContext,type:number,source:string){
 const shader=gl.createShader(type);if(!shader)return null;
 gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null}
 return shader;
}

export default function KineticCanvas({phase,intensity}:Props){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const phaseRef=useRef(0),energyRef=useRef(intensity);

 useEffect(()=>{phaseRef.current=phase==='rest'?1:phase==='done' ? .45 : 0;energyRef.current=intensity},[phase,intensity]);

 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true});if(!gl)return;
  const vs=makeShader(gl,gl.VERTEX_SHADER,vertex),fs=makeShader(gl,gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
  const program=gl.createProgram();if(!program)return;
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);

  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const resolution=gl.getUniformLocation(program,'u_resolution'),mouseUniform=gl.getUniformLocation(program,'u_mouse'),time=gl.getUniformLocation(program,'u_time'),phaseUniform=gl.getUniformLocation(program,'u_phase'),energy=gl.getUniformLocation(program,'u_energy');
  const mouse={x:innerWidth*.5,y:innerHeight*.5},target={...mouse};
  const move=(e:PointerEvent)=>{const rect=canvas.getBoundingClientRect();target.x=e.clientX-rect.left;target.y=rect.height-(e.clientY-rect.top)};
  addEventListener('pointermove',move,{passive:true});
  const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));gl.viewport(0,0,canvas.width,canvas.height)};
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now();let frame=0;
  const draw=(now:number)=>{
   mouse.x+=(target.x-mouse.x)*.055;mouse.y+=(target.y-mouse.y)*.055;
   const scale=canvas.width/Math.max(1,canvas.clientWidth);
   gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform2f(mouseUniform,mouse.x*scale,mouse.y*scale);
   gl.uniform1f(time,(now-start)/1000);gl.uniform1f(phaseUniform,phaseRef.current);gl.uniform1f(energy,energyRef.current);
   gl.drawArrays(gl.TRIANGLES,0,6);
   if(!reduced)frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',move);observer.disconnect();gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(buffer)gl.deleteBuffer(buffer)};
 },[]);

 return <canvas ref={canvasRef} className="kineticCanvas" aria-hidden="true"/>;
}
