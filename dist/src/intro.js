import {arcadeText} from './render.js';

const lines = [
  [0,'Zihan','You’re staring.'],[1.6,'Mahera','You wore my favorite shirt.'],
  [4,'Zihan','Who do you think I wore it for?'],
  [8,'Mahera','Come here, then. Let me see how it looks up close.'],
  [12,'Zihan','Well?'],[13,'Mahera','I forgot to look at the shirt.'],
  [16,'Zihan','Five years and that line still works?'],
  [21,'Mahera','You wore the shirt again, didn’t you?']
];

// Each time marks the first frame of a new pose. The middle shot uses the approved recut at 24 fps.
const opening = [0,.85,1.65,2.75,4,4.7,5.65,6.65,8,9.05,9.9,10.75];
const collar = [0,18,23,28,31,35,39,48,54,62,67,78,89,96,102,108];
const ending = [17.625,18.05,21,23.5];

export async function loadFilm() {
  return Promise.all(['intro-story.png','intro-collar.png'].map(async name=>{
    const image=new Image();
    image.src=new URL('../assets/'+name,import.meta.url);
    await image.decode();
    return image;
  }));
}

export function drawIntro(renderer,t) {
  const c=renderer.ctx;
  const middle=t>=12 && t<17.625;
  const marks=middle?collar:t<12?opening:ending;
  const time=middle?(t-12)*24:t;
  const index=marks.filter(start=>start<=time).length-1+(t>=17.625?12:0);
  const sheet=renderer.introFilm[middle?1:0];
  const w=sheet.width/4,h=sheet.height/4;
  c.imageSmoothingEnabled=false;
  c.drawImage(sheet,(index%4)*w+8,Math.floor(index/4)*h+9,w-16,h-18,0,0,960,540);
  const [,who,line]=lines.filter(([start])=>start<=t).at(-1);
  c.fillStyle='#211226f2'; c.fillRect(16,438,928,86);
  c.fillStyle=who==='Mahera'?'#ffa2c2':'#a8def8'; c.font='bold 18px monospace';
  c.fillText(who.toUpperCase(),36,465);
  c.fillStyle='#fff0da'; c.font='bold 24px monospace'; c.fillText(line,36,502);
  if(t>=24.2) arcadeText(c,'LOVE FIGHT',480,30,5);
}

export async function playIntro(renderer, overlay, audio) {
  const key='love-fight-cafe-intro-v3';
  try { if(sessionStorage.getItem(key)) return; } catch {}
  try { renderer.introFilm=await loadFilm(); } catch { return; }
  await new Promise(resolve=>{
    const skip=document.createElement('button');
    skip.className='wedding-skip'; skip.textContent='SKIP INTRO';
    overlay.replaceChildren(skip); skip.focus();
    let frame, previous, elapsed=0, lastCue=-1;
    function finish(){
      cancelAnimationFrame(frame); document.removeEventListener('keydown',keyDown,true);
      document.removeEventListener('pointerdown',unlock,true); skip.remove();
      try { sessionStorage.setItem(key,'1'); } catch {}
      resolve();
    }
    function unlock(){audio.start();}
    function keyDown(e){if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish();}else if(!e.repeat)unlock();}
    function tick(now){
      if(previous!==undefined && !document.hidden) elapsed+=Math.max(0,Math.min((now-previous)/1000,.1));
      previous=now;
      if(elapsed>=25){finish();return;}
      drawIntro(renderer,elapsed);
      const cue=[0,4,8,12,16,21,23].filter(v=>v<=elapsed).length;
      if(cue!==lastCue){audio.tone(cue>=5?784:1175,.22,'sine',.09);lastCue=cue;}
      frame=requestAnimationFrame(tick);
    }
    skip.onclick=finish; document.addEventListener('keydown',keyDown,true);
    document.addEventListener('pointerdown',unlock,true); tick(performance.now());
  });
}
