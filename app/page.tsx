'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import KineticCanvas from './KineticCanvas';
import ExerciseVisual from './ExerciseVisual';

const moves=[
 ['Jumping jacks','Ouvre et ferme bras et jambes en rythme.','0% 0%'],
 ['Chaise au mur','Dos plaqué, cuisses parallèles au sol.','33.33% 0%'],
 ['Pompes','Corps gainé, poitrine vers le sol.','66.66% 0%'],
 ['Abdominaux','Décolle les épaules sans tirer la nuque.','100% 0%'],
 ['Step-up chaise','Pousse dans le talon, alterne les jambes.','0% 50%'],
 ['Squats','Hanches en arrière, genoux dans l’axe.','33.33% 50%'],
 ['Dips sur chaise','Coudes vers l’arrière, épaules basses.','66.66% 50%'],
 ['Planche','Serre les abdos et garde le dos droit.','100% 50%'],
 ['Montées de genoux','Reste léger et monte les genoux.','0% 100%'],
 ['Fentes','Descends verticalement, alterne les côtés.','33.33% 100%'],
 ['Pompes en T','Tourne le buste et tends le bras.','66.66% 100%'],
 ['Planche latérale','Hanches hautes, corps bien aligné.','100% 100%'],
] as const;

type Phase='ready'|'work'|'rest'|'done';

export default function Home(){
 const[idx,setIdx]=useState(0);
 const[phase,setPhase]=useState<Phase>('ready');
 const[sec,setSec]=useState(30);
 const[running,setRunning]=useState(false);
 const[soundReady,setSoundReady]=useState(false);
 const[music,setMusic]=useState(true);
 const[launchVisible,setLaunchVisible]=useState(true);
 const[launching,setLaunching]=useState(false);
 const[launchDemo,setLaunchDemo]=useState(0);
 const end=useRef(0),lock=useRef(false),warned=useRef(false),audio=useRef<AudioContext|null>(null);

 useEffect(()=>{
  if(!launchVisible||launching)return;
  const demo=setInterval(()=>setLaunchDemo(n=>(n+1)%moves.length),1700);
  return()=>clearInterval(demo);
 },[launchVisible,launching]);

 const beep=useCallback((f=720,d=.1)=>{
  const c=audio.current;if(!c)return;
  const o=c.createOscillator(),g=c.createGain();
  o.frequency.value=f;o.type='sine';
  g.gain.setValueAtTime(.0001,c.currentTime);
  g.gain.exponentialRampToValueAtTime(.16,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);
  o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+d);
 },[]);

 const say=useCallback((text:string,energy=true)=>{
  beep(energy?780:520);
  if('speechSynthesis'in window){
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(text),vs=speechSynthesis.getVoices();
   u.voice=vs.find(v=>v.lang==='fr-FR'&&/Denise|Henri|Google|Natural|Online/i.test(v.name))||vs.find(v=>v.lang.startsWith('fr'))||null;
   u.lang='fr-FR';u.rate=energy?1.08:.96;u.pitch=energy?1.05:1;
   speechSynthesis.speak(u);
  }
 },[beep]);

 const advance=useCallback(()=>{
  if(lock.current)return;lock.current=true;
  if(phase==='work'){
   setPhase('rest');setSec(15);end.current=Date.now()+15000;warned.current=false;
   say(idx===11?'Dernière récupération. Respire.':'Récupération. Quinze secondes.',false);
  }else if(idx<11){
   const n=idx+1;setIdx(n);setPhase('work');setSec(30);end.current=Date.now()+30000;warned.current=false;
   say(`${moves[n][0]}. C’est parti !`);
  }else{
   setPhase('done');setSec(0);setRunning(false);say('Session terminée. Solide !');
  }
  setTimeout(()=>lock.current=false,300);
 },[idx,phase,say]);

 useEffect(()=>{
  if(!running||phase==='ready'||phase==='done')return;
  const timer=setInterval(()=>{
   const n=Math.max(0,Math.ceil((end.current-Date.now())/1000));setSec(n);
   if(phase==='work'&&n===5&&!warned.current){warned.current=true;say('Cinq secondes. Ne lâche rien !')}
   if(n===0)advance();
  },200);
  return()=>clearInterval(timer);
 },[running,phase,advance,say]);

 const start=async()=>{
  if(launching)return;
  setLaunching(true);
  if(!audio.current)audio.current=new AudioContext();
  await audio.current.resume();speechSynthesis?.resume();beep(880,.16);
  setTimeout(()=>{
   setSoundReady(true);setLaunchVisible(false);setLaunching(false);setIdx(0);setPhase('work');setSec(30);
   end.current=Date.now()+30000;setRunning(true);say('NEUFMIN démarre. Jumping jacks !');
  },760);
 };

 const toggle=()=>{
  if(phase==='done'){setLaunchVisible(true);setPhase('ready');setSec(30);return}
  if(running){setSec(Math.max(0,Math.ceil((end.current-Date.now())/1000)));setRunning(false)}
  else{end.current=Date.now()+sec*1000;setRunning(true)}
 };

 const jump=(n:number)=>{
  if(n<0||n>11)return;
  setIdx(n);setPhase('work');setSec(30);warned.current=false;
  if(running)end.current=Date.now()+30000;
  say(moves[n][0]);
 };

 const phaseTotal=phase==='rest'?15:30;
 const arc=Math.max(0,Math.min(100,(sec/phaseTotal)*100));
 const elapsed=phase==='done'?540:idx*45+(phase==='rest'?30+(15-sec):phase==='work'?30-sec:0);
 const overall=Math.min(100,elapsed/540*100);
 const nextIdx=Math.min(11,idx+1);
 const demoSet=[(launchDemo+11)%12,launchDemo,(launchDemo+1)%12];

 return <main className={`app ${phase} ${sec<=5&&phase==='work'?'critical':''}`} onPointerMove={e=>{
  const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)/box.width-.5,y=(e.clientY-box.top)/box.height-.5;
  e.currentTarget.style.setProperty('--mx',`${e.clientX}px`);e.currentTarget.style.setProperty('--my',`${e.clientY}px`);
  e.currentTarget.style.setProperty('--rx',`${x*10}deg`);e.currentTarget.style.setProperty('--ry',`${y*-8}deg`);
 }}>
  <KineticCanvas phase={phase} intensity={1-arc/100}/>
  <div className="atmosphere" aria-hidden="true"><i/><i/></div>

  {launchVisible&&<section className={`launch ${launching?'exit':''}`}>
   <nav className="launchNav"><div className="wordmark"><i/>NEUF<span>MIN</span></div><span>HIIT DÉBUTANT · 09:00</span><b>12 MOUVEMENTS</b></nav>
   <div className="launchCopy">
    <span className="eyebrow"><i/> SESSION GUIDÉE · PILOTAGE AUTOMATIQUE</span>
    <h1>TON CORPS.<br/><em>TON ROUND.</em></h1>
    <p>30 secondes d’effort. 15 secondes de récupération. Une voix te guide et tout s’enchaîne automatiquement.</p>
    <button onClick={start} disabled={launching}><span>{launching?'PRÉPARATION…':'LANCER LE ROUND'}</span><b>↗</b></button>
   </div>
   <div className="launchShowcase">
    <div className="showcaseHalo"/>
    <div className="showcaseTrack" key={launchDemo}>{demoSet.map((n,p)=><article className={p===1?'featured':''} key={n}>
     <span>{String(n+1).padStart(2,'0')}</span><ExerciseVisual index={n}/><b>{moves[n][0]}</b>
    </article>)}</div>
    <div className="showcaseHud"><span><i/> APERÇU LIVE</span><b>{moves[launchDemo][0]}</b><small>{String(launchDemo+1).padStart(2,'0')} / 12</small></div>
   </div>
   <div className="launchStats"><div><b>30</b><span>SEC ON</span></div><div><b>15</b><span>SEC OFF</span></div><div><b>09</b><span>MINUTES</span></div></div>
   <div className="launchTicker"><div>JUMPING JACKS · CHAISE AU MUR · POMPES · ABDOMINAUX · SQUATS · PLANCHE · FENTES ·&nbsp;</div><div>JUMPING JACKS · CHAISE AU MUR · POMPES · ABDOMINAUX · SQUATS · PLANCHE · FENTES ·&nbsp;</div></div>
  </section>}

  <header className="topbar">
   <div className="wordmark"><i/>NEUF<span>MIN</span></div>
   <div className="sessionState"><span><i/>{phase==='rest'?'RÉCUPÉRATION':phase==='done'?'ROUND TERMINÉ':'SESSION EN DIRECT'}</span><b>09:00</b></div>
   <div className="topActions"><button onClick={()=>setMusic(v=>!v)} aria-label="Activer ou couper la musique">{music?'♫ MUSIQUE ON':'♫ MUSIQUE OFF'}</button><span>{String(idx+1).padStart(2,'0')}<i>/12</i></span></div>
  </header>

  <section className="stage">
   <div className="stageWord" aria-hidden="true">{phase==='rest'?'BREATHE':moves[idx][0]}</div>
   <aside className="brief">
    <div className="live"><i/>{phase==='rest'?'RECOVERY MODE':phase==='done'?'COMPLETE':'MOVE NOW'}</div>
    <span className="number">{String(idx+1).padStart(2,'0')}</span>
    <h2>{phase==='rest'?'RESPIRE':phase==='done'?'SOLIDE !':moves[idx][0]}</h2>
    <p>{phase==='rest'?(idx<11?`Prépare-toi : ${moves[nextIdx][0]}`:'Dernières secondes. Tu as fait le plus dur.'):phase==='done'?'Les 12 mouvements sont terminés. Round validé.':moves[idx][1]}</p>
    <div className="next"><div className="nextThumb"><ExerciseVisual index={nextIdx}/></div><small>{idx<11?'PROCHAIN MOUVEMENT':'OBJECTIF'}</small><b>{idx<11?moves[nextIdx][0]:'ROUND COMPLET'}</b><span>{idx<11?'30 SEC':'09:00'}</span></div>
   </aside>

   <div className="motion">
    <div className="motionRings"><i/><i/><i/></div>
    <ExerciseVisual index={idx} className="figureEcho" key={`echo-${idx}`}/>
    <ExerciseVisual index={idx} className="figure" key={idx}/>
    <div className="ground"/>
    <button type="button" className="prev" onClick={()=>jump(idx-1)} disabled={idx===0} aria-label="Exercice précédent"><b>←</b><span>PRÉC.</span></button>
    <button type="button" className="nextBtn" onClick={()=>jump(idx+1)} disabled={idx===11} aria-label="Exercice suivant"><span>SUIVANT</span><b>→</b></button>
    <div className="motionLabel"><span>DÉMONSTRATION</span><b>{moves[idx][0]}</b></div>
   </div>

   <aside className="timer">
    <div className="phaseLabel"><i/>{phase==='rest'?'REPOS — RESPIRE':phase==='done'?'SESSION COMPLÈTE':'EFFORT — GARDE LE RYTHME'}</div>
    <div className="dial" style={{'--progress':`${arc*3.6}deg`} as React.CSSProperties}>
     <div className="dialTrack"/><div className="dialSweep"/>
     <div className="time"><b key={`${phase}-${sec}`}>{String(sec).padStart(2,'0')}</b><span>SECONDES</span></div>
    </div>
    <div className="timerMeta"><span>INTERVALLE</span><b>{phase==='rest'?'15 SEC OFF':'30 SEC ON'}</b></div>
    <button className="pause" onClick={toggle}>{phase==='done'?'↻  RECOMMENCER':running?'Ⅱ  PAUSE':'▶  REPRENDRE'}</button>
   </aside>
  </section>

  <section className="timeline">
   <div className="overall"><span>PROGRESSION</span><div><i style={{width:`${overall}%`}}/></div><b>{Math.round(overall)}%</b></div>
   <div className="rail">{moves.map((m,i)=><button key={m[0]} className={i===idx?'active':i<idx?'past':''} onClick={()=>jump(i)} aria-label={`Aller à ${m[0]}`}>
    <span>{String(i+1).padStart(2,'0')}</span><div className="railLine"><i/></div><b>{m[0]}</b>
   </button>)}</div>
  </section>

  {soundReady&&music&&<div className="music"><iframe src="https://www.youtube.com/embed/3ArOBAt5Ml0?autoplay=1&start=16&loop=1&playlist=3ArOBAt5Ml0&controls=0&playsinline=1&rel=0" title="Musique d’entraînement" allow="autoplay; encrypted-media"/><span><i/><b>ROUND RADIO</b><small>PLAYING</small></span></div>}
 </main>;
}
