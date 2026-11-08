import {arcadeText, heart} from './render.js';

const lines = [
  [0,'Zihan','You’re staring.'],[1.6,'Mahera','You wore my favorite shirt.'],
  [4,'Zihan','Who do you think I wore it for?'],
  [8,'Mahera','Come here, then. Let me see how it looks up close.'],
  [12,'Zihan','Well?'],[13,'Mahera','I forgot to look at the shirt.'],
  [16,'Zihan','Five years and that line still works?'],
  [21,'Mahera','You wore the shirt again, didn’t you?']
];

export function drawIntro(renderer, t) {
  const c = renderer.ctx;
  renderer.time = t;
  renderer.background(1,t);
  const approach = Math.min(1,Math.max(0,(t-8)/4));
  if (t >= 16 && (t < 18 || t >= 23)) renderer.couple(495,414,'kiss',false,1.55);
  else {
    renderer.fighter({character:0,x:330+approach*95,y:414,face:1,state:'sit',stateTime:t},0,1.7);
    renderer.fighter({character:1,x:686-approach*146,y:414,face:-1,state:'sit',stateTime:t},0,1.7);
  }
  // Two ceramic cups on the foreground café table.
  c.fillStyle='#573044'; c.fillRect(268,389,434,17);
  c.fillStyle='#b66d54'; c.fillRect(264,385,442,6);
  for(const x of [364,622-approach*58]){
    c.fillStyle='#f7d5ad'; c.fillRect(x,364,23,21); c.strokeStyle='#f7d5ad';
    c.lineWidth=3; c.strokeRect(x+23,368,6,9); c.fillStyle='#633c3a'; c.fillRect(x+2,364,19,3);
  }
  const [,who,line] = lines.filter(([start])=>start<=t).at(-1);
  c.fillStyle='#221225f5'; c.fillRect(26,423,908,95);
  c.fillStyle=who==='Mahera'?'#ffa2c2':'#a8def8'; c.font='bold 18px monospace';
  c.fillText(who.toUpperCase(),52,453); c.fillStyle='#fff0da'; c.font='bold 24px monospace'; c.fillText(line,52,492);
  if(t>=23){c.save(); c.globalAlpha=Math.min(1,t-23); arcadeText(c,'LOVE FIGHT',480,40,7); heart(c,738,60,3); c.restore();}
}

export async function playIntro(renderer, overlay, audio) {
  const key='love-fight-cafe-intro-v1';
  try { if(sessionStorage.getItem(key)) return; } catch {}
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
      if(previous!==undefined && !document.hidden) elapsed+=Math.min((now-previous)/1000,.1);
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
