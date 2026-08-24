'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const moves = [
  ['Jumping jacks','Ouvre et ferme bras et jambes en rythme.','10% 23%'],
  ['Chaise contre un mur','Dos plaqué, cuisses parallèles au sol.','50% 23%'],
  ['Pompes','Corps gainé, poitrine vers le sol.','91% 25%'],
  ['Abdominaux','Décolle les épaules sans tirer la nuque.','10% 41%'],
  ['Monter sur une chaise','Pousse dans le talon, alterne les jambes.','50% 42%'],
  ['Squats','Hanches en arrière, genoux dans l’axe.','91% 42%'],
  ['Dips sur une chaise','Coudes vers l’arrière, épaules basses.','11% 59%'],
  ['Planche','Serre les abdos et garde le dos droit.','52% 59%'],
  ['Courir sur place','Reste léger et monte les genoux.','91% 59%'],
  ['Fentes','Descends verticalement, alterne les côtés.','10% 76%'],
  ['Pompes en T','Tourne le buste et tends le bras.','52% 76%'],
  ['Planche sur le côté','Hanches hautes, corps bien aligné.','91% 77%'],
] as const;
type Phase='ready'|'work'|'rest'|'done';

export default function Home(){
  const [idx,setIdx]=useState(0),[phase,setPhase]=useState<Phase>('ready'),[sec,setSec]=useState(30),[running,setRunning]=useState(false);
  const end=useRef(0), lock=useRef(false);
  const say=useCallback((s:string)=>{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);u.lang='fr-FR';speechSynthesis.speak(u)}},[]);
  const next=useCallback(()=>{if(lock.current)return;lock.current=true;
    if(phase==='work'){setPhase('rest');setSec(10);end.current=Date.now()+10000;say('Repos. Dix secondes.');}
    else if(idx<11){const n=idx+1;setIdx(n);setPhase('work');setSec(30);end.current=Date.now()+30000;say(moves[n][0]);}
    else{setPhase('done');setSec(0);setRunning(false);say('Entraînement terminé. Bravo !');}
    setTimeout(()=>lock.current=false,300);
  },[idx,phase,say]);
  useEffect(()=>{if(!running||phase==='ready'||phase==='done')return;const t=setInterval(()=>{const n=Math.max(0,Math.ceil((end.current-Date.now())/1000));setSec(n);if(n===0)next()},200);return()=>clearInterval(t)},[running,phase,next]);
  const toggle=()=>{if(phase==='ready'||phase==='done'){setIdx(0);setPhase('work');setSec(30);end.current=Date.now()+30000;setRunning(true);say(moves[0][0]);return}if(running){setSec(Math.max(0,Math.ceil((end.current-Date.now())/1000)));setRunning(false)}else{end.current=Date.now()+sec*1000;setRunning(true)}};
  const jump=(n:number)=>{setIdx(Math.max(0,Math.min(11,n)));setPhase('work');setSec(30);setRunning(false)};
  const duration=phase==='rest'?10:30,pct=(sec/duration)*100;
  const title=phase==='rest'?'Récupération':phase==='done'?'Terminé !':moves[idx][0];
  return <main className={phase}>
    <header><div className="logo"><i/>SEPT<span>MIN</span></div><div className="rule"><b>30</b> SEC ON <i/> <b>10</b> SEC OFF</div><div className="count">{String(idx+1).padStart(2,'0')} <span>/ 12</span></div></header>
    <section className="screen">
      <div className="copy"><div className="kicker"><i/>{phase==='rest'?'RESPIRE · LE PROCHAIN ARRIVE':phase==='done'?'CIRCUIT TERMINÉ':'HIIT DÉBUTANT · À FOND'}</div><h1>{title}</h1><p>{phase==='rest'?(idx<11?`Ensuite : ${moves[idx+1][0]}`:'Dernière récupération, tiens bon.'):(phase==='done'?'7 minutes. 12 exercices. Tu peux être fier de toi.':moves[idx][1])}</p><div className="steps">{moves.map((m,i)=><button key={m[0]} aria-label={`Aller à ${m[0]}`} onClick={()=>jump(i)} className={i===idx?'active':i<idx?'past':''}>{i+1}</button>)}</div></div>
      <div className="visual" style={{backgroundPosition:moves[idx][2]}}><span>MOUVEMENT {String(idx+1).padStart(2,'0')}</span></div>
      <div className="clock"><div className="status"><i/>{phase==='ready'?'PRÊT ?':phase==='work'?'TRAVAIL':phase==='rest'?'REPOS':'BRAVO'}</div><div className="time">{String(sec).padStart(2,'0')}</div><div className="unit">SECONDES</div><div className="bar"><i style={{width:`${pct}%`}}/></div><button className="start" onClick={toggle}>{running?'Ⅱ  PAUSE':phase==='ready'||phase==='done'?'▶  DÉMARRER':'▶  REPRENDRE'}</button><div className="nav"><button disabled={idx===0} onClick={()=>jump(idx-1)}>←</button><button onClick={()=>jump(idx+1)} disabled={idx===11}>→</button></div></div>
    </section>
    <footer><b>7:50</b> DURÉE RÉELLE <span/> Prépare une chaise stable et un mur <em>Écoute ton corps — arrête-toi en cas de douleur.</em></footer>
  </main>
}
