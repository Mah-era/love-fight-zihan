import {heart, pixelText, arcadeText} from './render.js';

export const WEDDING_DURATION = 20;
export function shouldPlayWedding(mode,stage,winner){return mode==='story'&&stage===7&&winner===0;}
export function weddingBeat(time){return time<3?'arrival':time<6?'rings':time<9?'forehead':time<12?'lips':time<16?'celebration':'card';}
const loadImage=name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=new URL(`../assets/${name}.png`,import.meta.url).href;});
let assets;
export async function playWedding(parent,{onSound=()=>{}}={}){
 if(parent.querySelector('.wedding-ending'))return;
 const previous=document.activeElement;
 const panel=document.createElement('section');panel.className='wedding-ending';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Mahera and Zihan wedding ending');
 panel.innerHTML='<canvas width="960" height="540" aria-label="Animated Bangladeshi wedding"></canvas><p class="wedding-status" role="status">Preparing your forever…</p><button class="wedding-skip">SKIP ENDING →</button>';
 parent.append(panel);const button=panel.querySelector('button'),status=panel.querySelector('p'),canvas=panel.querySelector('canvas'),c=canvas.getContext('2d');button.focus();
 let closed=false,frame=0,time=0,last=performance.now(),lastBeat='';
 const close=()=>{closed=true;cancelAnimationFrame(frame);document.removeEventListener('keydown',keyboard,true);panel.remove();if(previous?.isConnected)previous.focus();};
 const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){e.preventDefault();button.focus();}};
 document.addEventListener('keydown',keyboard,true);button.onclick=close;
 let sprites,stage;
 try{[sprites,stage]=await(assets ||= Promise.all([loadImage('wedding-poses'),loadImage('wedding-stage')]));}catch{assets=null;if(!closed){status.textContent='The wedding art could not load. Continue to your victory screen.';button.textContent='CONTINUE →';}return;}
 if(closed)return;
 // Find alpha bounds per cell, preserving the two-keyframe atlas layout.
 const scan=document.createElement('canvas');scan.width=sprites.width;scan.height=sprites.height;const sc=scan.getContext('2d',{willReadFrequently:true});sc.drawImage(sprites,0,0);const pixels=sc.getImageData(0,0,scan.width,scan.height).data;
 const cells=[];for(let row=0;row<2;row++)for(let col=0;col<4;col++){const x0=Math.floor(col*scan.width/4),x1=Math.floor((col+1)*scan.width/4),y0=Math.floor(row*scan.height/2),y1=Math.floor((row+1)*scan.height/2);let left=x1,right=x0,top=y1,bottom=y0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*scan.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}cells.push({x:left,y:top,w:Math.max(1,right-left+1),h:Math.max(1,bottom-top+1)});}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const captions={arrival:'A NEW CHAPTER',rings:'WITH THIS RING…',forehead:'A LITTLE PROMISE',lips:'SEALED WITH A KISS',celebration:'PLAYER TWO, FOR LIFE',card:'biye kore ar ki hobe, na korleo hobe'};
 last=performance.now();
 function draw(now){
  if(closed)return;
  if(!document.hidden)time+=Math.min((now-last)/1000,.1);last=now;
  const beat=weddingBeat(time);
  if(beat!==lastBeat){status.textContent=captions[beat];onSound(beat==='celebration'?'victory':'menu');lastBeat=beat;}
  c.imageSmoothingEnabled=false;c.clearRect(0,0,960,540);
  const zoom=reduced?1:1+Math.min(time/20,.025);c.save();c.translate(480,270);c.scale(zoom,zoom);c.drawImage(stage,-480,-270,960,540);c.restore();
  c.fillStyle='#1d0b2930';c.fillRect(0,0,960,540);
  for(let i=0;i<24;i++){c.globalAlpha=.35+.4*Math.sin(time*2+i)**2;c.fillStyle='#ffe1a5';c.fillRect(30+i*39,45+Math.sin(i)*12,3,4);}c.globalAlpha=1;
  const col=beat==='forehead'?1:beat==='lips'?2:beat==='celebration'||beat==='card'?3:0;
  const pose=cells[col+(!reduced&&Math.floor(time*2)%2?4:0)];const h=300,w=pose.w/pose.h*h;
  const arrival=beat==='arrival'&&!reduced?Math.max(0,1-time/2):0;
  const bounce=beat==='celebration'&&!reduced?Math.abs(Math.sin(time*5))*7:0;
  c.globalAlpha=Math.min(1,time/1.2);c.drawImage(sprites,pose.x,pose.y,pose.w,pose.h,480-w/2,460-h+arrival*45-bounce,w,h);c.globalAlpha=1;
  if(time>=6)for(let i=0;i<10;i++){const phase=(time*.25+i*.19)%1;heart(c,480+Math.sin(i*8)*170,320-phase*230,2, i%2?'#ffc68b':'#ff83ad');}
  if(time>=12)for(let i=0;i<60;i++){c.fillStyle=['#ff96be','#ffe1a3','#fff3d7'][i%3];const y=reduced?i*37%540:(time*45+i*37)%540;c.fillRect((i*137+Math.sin(time+i)*12)%960,y,4,7);}
  c.fillStyle='#1b0e2be6';c.fillRect(0,0,960,38);pixelText(c,'MAHERA + ZIHAN',480,12,2,'#ffe3ac','center');
  if(beat==='card'){
   c.fillStyle='#21102de8';c.fillRect(130,110,700,280);c.strokeStyle='#e6ab80';c.lineWidth=3;c.strokeRect(139,119,682,262);
   arcadeText(c,'MAHERA + ZIHAN',480,155,4);
   heart(c,480,218,4);
   c.textAlign='center';c.fillStyle='#ffe3ad';c.font='italic 29px Georgia, serif';c.fillText('biye kore ar ki hobe,',480,282);c.fillText('na korleo hobe',480,322);
   pixelText(c,'FOREVER, CONTINUE?',480,357,2,'#ff9abc','center');
  }else{c.fillStyle='#21102ddc';c.fillRect(235,475,490,38);pixelText(c,captions[beat],480,487,2,'#ffe4b5','center');}
  if(time>=WEDDING_DURATION){close();return;}frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);
}
