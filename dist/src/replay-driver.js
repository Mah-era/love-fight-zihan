import {STAGES} from './data.js';

// Autoplay supplies ordinary inputs to the real engine; it never changes health,
// energy, positions, round results, cooldowns or collision rules.
export function createReplayDriver(){
 let specialRound=0;
 return fight=>{
  const p=fight.fighters[0],o=fight.fighters[1],prop=STAGES[fight.stage].prop;
  const dx=o.x-p.x,distance=Math.abs(dx),input={};
  if(fight.roundOver||fight.countdown>0)return input;
  if(fight.round===1&&fight.time<10){
   const target=prop.x+prop.w/2;
   if(Math.abs(p.x-target)>24)input[target>p.x?'right':'left']=true;
   else input.interact=true;
   if(p.onPlatform&&distance<160)input.interact=true;
   return input;
  }
  if(distance>62)input[dx>0?'right':'left']=true;
  if(o.y<p.y-55)input.jump=true;
  if(p.onPlatform&&distance<160&&Math.abs(p.y-o.y)>70)input.interact=true;
  if(p.energy>=100||(p.energy>=40&&specialRound!==fight.round&&fight.stage!==7)){
   if(distance<120||STAGES[fight.stage].special==='heart'){input.special=true;specialRound=fight.round;}
  }else if(distance<95){
   if(o.block||fight.time%3<1.8)input.hug=true;else input.kiss=true;
  }
  return input;
 };
}
export function seededRandom(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
