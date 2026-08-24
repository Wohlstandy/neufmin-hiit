'use client';

import {useEffect,useRef} from 'react';

let atlasPromise:Promise<HTMLCanvasElement>|null=null;

function loadAtlas(){
 if(atlasPromise)return atlasPromise;
 atlasPromise=new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{
   const buffer=document.createElement('canvas');buffer.width=image.naturalWidth;buffer.height=image.naturalHeight;
   const context=buffer.getContext('2d',{willReadFrequently:true});if(!context){reject(new Error('Canvas unavailable'));return}
   context.drawImage(image,0,0);
   const pixels=context.getImageData(0,0,buffer.width,buffer.height),data=pixels.data;
   for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
    if(lo>238&&hi-lo<7)data[i+3]=0;
    else if(lo>225&&hi-lo<12)data[i+3]=Math.min(data[i+3],Math.max(0,(238-lo)*20));
   }
   context.putImageData(pixels,0,0);resolve(buffer);
  };
  image.onerror=reject;image.src='/neufmin-hiit/exercise-sprites-v2.png';
 });
 return atlasPromise;
}

export default function ExerciseVisual({index,className=''}:{index:number;className?:string}){
 const ref=useRef<HTMLCanvasElement|null>(null);
 useEffect(()=>{
  let active=true;
  loadAtlas().then(atlas=>{
   if(!active||!ref.current)return;
   const canvas=ref.current,context=canvas.getContext('2d');if(!context)return;
   const cellW=atlas.width/4,cellH=atlas.height/3,col=index%4,row=Math.floor(index/4);
   canvas.width=768;canvas.height=682;context.clearRect(0,0,canvas.width,canvas.height);
   context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
   context.drawImage(atlas,col*cellW,row*cellH,cellW,cellH,0,0,canvas.width,canvas.height);
  }).catch(()=>{});
  return()=>{active=false};
 },[index]);
 return <canvas ref={ref} className={`exerciseVisual ${className}`} aria-hidden="true"/>;
}
