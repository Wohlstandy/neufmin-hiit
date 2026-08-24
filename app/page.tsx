'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const moves = [
  ['Jumping jacks','Ouvre et ferme bras et jambes en rythme.','0% 0%'],
  ['Chaise contre un mur','Dos plaqué, cuisses parallèles au sol.','33.33% 0%'],
  ['Pompes','Corps gainé, poitrine vers le sol.','66.66% 0%'],
  ['Abdominaux','Décolle les épaules sans tirer la nuque.','100% 0%'],
  ['Monter sur une chaise','Pousse dans le talon, alterne les jambes.','0% 50%'],
  ['Squats','Hanches en arrière, genoux dans l’axe.','33.33% 50%'],
  ['Dips sur une chaise','Coudes vers l’arrière, épaules basses.','66.66% 50%'],
  ['Planche','Serre les abdos et garde le dos droit.','100% 50%'],
  ['Courir sur place','Reste léger et monte les genoux.','0% 100%'],
  ['Fentes','Descends verticalement, alterne les côtés.','33.33% 100%'],
  ['Pompes en T','Tourne le buste et tends le bras.','66.66% 100%'],
  ['Planche sur le côté','Hanches hautes, corps bien aligné.','100% 100%'],
] as const;
type Phase='ready'|'work'|'rest'|'done';

export default function Home(){
  const [idx,setIdx]=useState(0),[phase,setPhase]=useState<Phase>('ready'),[sec,setSec]=useState(30),[running,setRunning]=useState(false);
  const [soundReady,setSoundReady]=useState(false);
  const end=useRef(0), lock=useRef(false), warned=useRef(false), audio=useRef<AudioContext|null>(null);
  const beep=useCallback((frequency=720,duration=.11)=>{const c=audio.current;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.frequency.value=frequency;o.type='sine';g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.18,c.currentTime+.015);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration)},[]);
  const say=useCallback((s:string,energy=true)=>{beep(energy?760:520);if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang==='fr-FR'&&/Denise|Henri|Google|Natural|Online/i.test(v.name))||voices.find(v=>v.lang.startsWith('fr'))||null;u.lang='fr-FR';u.rate=energy?1.08:.96;u.pitch=energy?1.06:1;u.volume=1;speechSynthesis.speak(u)}},[beep]);
  const next=useCallback(()=>{if(lock.current)return;lock.current=true;
    if(phase==='work'){setPhase('rest');setSec(10);end.current=Date.now()+10000;warned.current=false;say('Souffle. Dix secondes de récupération.',false);}
    else if(idx<11){const n=idx+1;setIdx(n);setPhase('work');setSec(30);end.current=Date.now()+30000;warned.current=false;say(`${moves[n][0]}. C'est parti !`);}
    else{setPhase('done');setSec(0);setRunning(false);say('Entraînement terminé. Bravo !');}
    setTimeout(()=>lock.current=false,300);
  },[idx,phase,say]);
  useEffect(()=>{if(!running||phase==='ready'||phase==='done')return;const t=setInterval(()=>{const n=Math.max(0,Math.ceil((end.current-Date.now())/1000));setSec(n);if(phase==='work'&&n===5&&!warned.current){warned.current=true;say('Encore cinq secondes, tiens bon !')}if(n===0)next()},200);return()=>clearInterval(t)},[running,phase,next,say]);
  const toggle=()=>{if(phase==='ready'||phase==='done'){setIdx(0);setPhase('work');setSec(30);end.current=Date.now()+30000;setRunning(true);say(moves[0][0]);return}if(running){setSec(Math.max(0,Math.ceil((end.current-Date.now())/1000)));setRunning(false)}else{end.current=Date.now()+sec*1000;setRunning(true)}};
  const activate=async()=>{audio.current=new AudioContext();await audio.current.resume();speechSynthesis?.resume();setSoundReady(true);setIdx(0);setPhase('work');setSec(30);end.current=Date.now()+30000;setRunning(true);say('Son activé. Jumping jacks. C’est parti !')};
  const jump=(n:number)=>{setIdx(Math.max(0,Math.min(11,n)));setPhase('work');setSec(30);setRunning(false)};
  const duration=phase==='rest'?10:30,pct=(sec/duration)*100;
  const title=phase==='rest'?'Récupération':phase==='done'?'Terminé !':moves[idx][0];
  return <main className={phase}>
    {!soundReady&&<div className="soundGate"><div><span>PRÊT POUR 7 MINUTES ?</span><h2>ACTIVE LE SON.<br/>ON S’OCCUPE DU RESTE.</h2><p>Un seul clic. Ensuite, la séance complète s’enchaîne toute seule.</p><button onClick={activate}>◉ &nbsp; ACTIVER LE SON ET DÉMARRER</button></div></div>}
    {soundReady&&<div className="musicPlayer"><iframe width="220" height="124" src="https://www.youtube.com/embed/3ArOBAt5Ml0?autoplay=1&start=30&loop=1&playlist=3ArOBAt5Ml0&controls=0&playsinline=1&rel=0" title="Dillon Francis, Skrillex — Bun Up the Dance" allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin"/><span><i/> MUSIQUE EN COURS</span></div>}
    <header><div className="logo"><i/>SEPT<span>MIN</span></div><div className="rule"><b>30</b> SEC ON <i/> <b>10</b> SEC OFF</div><div className="count">{String(idx+1).padStart(2,'0')} <span>/ 12</span></div></header>
    <section className="screen">
      <div className="copy"><div className="kicker"><i/>{phase==='rest'?'RESPIRE · LE PROCHAIN ARRIVE':phase==='done'?'CIRCUIT TERMINÉ':'HIIT DÉBUTANT · À FOND'}</div><h1>{title}</h1><p>{phase==='rest'?(idx<11?`Ensuite : ${moves[idx+1][0]}`:'Dernière récupération, tiens bon.'):(phase==='done'?'7 minutes. 12 exercices. Tu peux être fier de toi.':moves[idx][1])}</p><div className="steps">{moves.map((m,i)=><button key={m[0]} aria-label={`Aller à ${m[0]}`} onClick={()=>jump(i)} className={i===idx?'active':i<idx?'past':''}>{i+1}</button>)}</div></div>
      <div className="visual carousel" aria-label={`Carrousel des exercices, exercice actuel : ${moves[idx][0]}`}>
        {[idx-1,idx,idx+1].filter(n=>n>=0&&n<12).map(n=><div key={n} className={`slide ${n===idx?'current':'adjacent'}`} style={{backgroundPosition:moves[n][2]}}><span>{n===idx?'MAINTENANT':n<idx?'PRÉCÉDENT':'ENSUITE'}</span><strong>{moves[n][0]}</strong></div>)}
      </div>
      <div className="clock"><div className="status"><i/>{phase==='ready'?'DÉPART AUTO…':phase==='work'?'TRAVAIL':phase==='rest'?'REPOS':'BRAVO'}</div><div className="time">{String(sec).padStart(2,'0')}</div><div className="unit">SECONDES</div><div className="bar"><i style={{width:`${pct}%`}}/></div><button className="start" onClick={toggle}>{running?'Ⅱ  PAUSE':phase==='ready'||phase==='done'?'▶  DÉMARRER':'▶  REPRENDRE'}</button><div className="nav"><button disabled={idx===0} onClick={()=>jump(idx-1)}>←</button><button onClick={()=>jump(idx+1)} disabled={idx===11}>→</button></div></div>
    </section>
    <footer><b>7:50</b> DURÉE RÉELLE <span/> Prépare une chaise stable et un mur <em>Écoute ton corps — arrête-toi en cas de douleur.</em></footer>
  </main>
}
