import {ACHIEVEMENTS} from './data.js';

// Match results are committed once by the UI after the engine emits `end`.
export function recordMatch(profile, fight, winner, mode, stage, campaignScore=0) {
 const p=fight.fighters[0],won=winner===0;
 profile.kisses+=p.kisses;profile.hugs+=p.hugs;profile.affection+=p.hits;
 profile.love+=Math.round(p.hits*3+(won?100:25));
 profile.combo=Math.max(profile.combo,p.maxCombo);profile.ultimates+=p.ultimates;
 const earnedScore=Math.round(fight.score*(mode==='versus'?1:won?1:.5));
 campaignScore+=earnedScore;profile.score+=earnedScore;
 profile.highScore=Math.max(profile.highScore,campaignScore);
 if(won){profile.wins++;if(!profile.stages.includes(stage))profile.stages.push(stage);
  if(mode==='story'){profile.unlocked=Math.max(profile.unlocked,Math.min(7,stage+1));if(stage===7)profile.storyComplete=true;}
  if(mode==='arcade'&&stage===7)profile.arcadeComplete=true;
 }
 const earned=ACHIEVEMENTS.filter(([id,,,check])=>!profile.badges.includes(id)&&check(profile));
 for(const[id]of earned)profile.badges.push(id);
 return {campaignScore,earned,won};
}
