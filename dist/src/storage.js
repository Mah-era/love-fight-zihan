import {DEFAULT_KEYS} from './data.js';
const defaults=()=>({score:0,highScore:0,love:0,affection:0,kisses:0,hugs:0,wins:0,combo:0,ultimates:0,stages:[],unlocked:0,storyComplete:false,arcadeComplete:false,badges:[],settings:{music:.3,sfx:.55,muted:false,crt:true,shake:true,difficulty:'normal',keys:structuredClone(DEFAULT_KEYS)}});
export function load(){try{let saved=JSON.parse(localStorage.getItem('love-fight-v1')||'null'),d=defaults();return saved?{...d,...saved,settings:{...d.settings,...saved.settings}}:d;}catch{return defaults();}}
export function save(data){try{localStorage.setItem('love-fight-v1',JSON.stringify(data));return true;}catch{return false;}}
