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
  const sky=c.createLinearGradient(0,0,0,540);
  sky.addColorStop(0,'#3a173d'); sky.addColorStop(1,'#151020');
  c.fillStyle=sky; c.fillRect(0,0,960,540);
  c.fillStyle='#a95979'; c.fillRect(110,117,740,417);
  c.drawImage(sheet,(index%4)*w+4,Math.floor(index/4)*h+7,w-8,h-14,112,119,736,413);
  const [start,who,line]=lines.filter(([start])=>start<=t).at(-1);
  const left=who==='Mahera';
  const center=left?335:625;
  c.save();
  c.translate(center,56);
  const pop=.88+.12*Math.sin(Math.min(1,(t-start)/.15)*Math.PI/2);
  c.scale(pop,pop);
  c.font='bold 23px monospace';
  const rows=[''];
  for(const word of line.split(' ')){
    const next=(rows.at(-1)+' '+word).trim();
    if(c.measureText(next).width>480) rows.push(word);
    else rows[rows.length-1]=next;
  }
  const radius=Math.max(...rows.map(row=>c.measureText(row).width))/2+30;
  const depth=rows.length===1?29:40;
  c.fillStyle=left?'#ffe3f1':'#ddf4ff'; c.strokeStyle='#331834'; c.lineWidth=4;
  c.beginPath();
  for(let i=0;i<=160;i++){
    const a=i*Math.PI/80, ripple=1+.036*Math.cos(14*a);
    const x=radius*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.52*ripple;
    const y=depth*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.52*ripple;
    if(i===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.closePath(); c.fill(); c.stroke();
  for(const [offset,y,r] of [[8,depth+13,7],[17,depth+28,4]]){
    c.beginPath(); c.arc(left?-offset:offset,y,r,0,2*Math.PI); c.fill(); c.stroke();
  }
  c.fillStyle='#341832'; c.textAlign='center'; c.textBaseline='middle';
  rows.forEach((row,i)=>c.fillText(row,0,(i-(rows.length-1)/2)*26));
  c.restore();
  if(t>=24.2) arcadeText(c,'LOVE FIGHT',680,48,3);
}

export async function playIntro(renderer, overlay, audio) {
  await new Promise(resolve => {
    const video = document.createElement('video');
    video.src = new URL('../assets/sunset-cafe-intro.mp4', import.meta.url);
    video.playsInline = true;
    video.muted = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#151020';
    video.setAttribute('aria-label','Sunset Café anniversary intro with illustrated dialogue');
    const skip = document.createElement('button');
    skip.className = 'wedding-skip';
    skip.textContent = 'SKIP INTRO';
    const sound = document.createElement('button');
    sound.className = 'wedding-skip';
    sound.style.cssText = 'left:16px;right:auto';
    sound.textContent = 'ENABLE SOUND';
    sound.onclick = () => {
      video.muted = !video.muted;
      sound.textContent = video.muted ? 'ENABLE SOUND' : 'MUTE';
      video.play().catch(finish);
    };
    function finish() {
      document.removeEventListener('keydown', onKey, true);
      video.pause();
      overlay.replaceChildren();
      resolve();
    }
    function onKey(event) {
      if (event.code === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        finish();
      }
    }
    video.onended = video.onerror = skip.onclick = finish;
    overlay.replaceChildren(video, sound, skip);
    skip.focus({preventScroll:true});
    document.addEventListener('keydown', onKey, true);
    video.play().catch(error => {
      if (!video.isConnected) return;
      if (error.name !== 'NotAllowedError') return finish();
      sound.textContent = 'PLAY INTRO WITH SOUND';
    });
  });
}
