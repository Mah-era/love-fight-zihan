import { MOVES } from './data.js';

export const PROTOCOL = 'love-fight/1';
export const INPUT_KEYS = ['left', 'right', 'down', 'jump', 'dodge', 'interact', 'kiss', 'hug', 'special'];
const HELD = new Set(['left', 'right', 'down']);
const MATCH_FIELDS = ['stage', 'timer', 'time', 'countdown', 'round', 'wins', 'roundOver', 'matchOver', 'roundDelay', 'roundWinner', 'ended', 'score', 'banner', 'bannerTime', 'shake', 'flash', 'propPulse', 'propCooldown', 'particles', 'floats', 'callouts'];

// Inputs are the only combat data accepted from a guest. The host owns all damage,
// collision, RNG, energy, furniture, round and victory decisions.
export class InputBuffer {
  constructor() { this.reset(); }
  reset() { this.sequence = -1; this.at = -Infinity; this.held = {}; this.edges = {}; }
  push(sequence, input, now) {
    if (!Number.isSafeInteger(sequence) || sequence <= this.sequence || !input || typeof input !== 'object') return false;
    this.sequence = sequence; this.at = now;
    for (const key of INPUT_KEYS) {
      if (HELD.has(key)) this.held[key] = input[key] === true;
      else if (input[key] === true) this.edges[key] = true;
    }
    return true;
  }
  take(now) {
    if (now - this.at > 250) { this.held = {}; this.edges = {}; }
    const result = { ...this.held, ...this.edges };
    this.edges = {};
    return result;
  }
}

export function snapshot(fight) {
  const state = Object.fromEntries(MATCH_FIELDS.map(key => [key, fight[key] ?? null]));
  state.fighters = fight.fighters.map(p => ({ ...p, attack: p.attack ? { ...p.attack, move: undefined, victims: undefined } : null }));
  state.projectiles = fight.projectiles.map(p => ({ ...p, move: undefined }));
  return structuredClone(state);
}

export function applySnapshot(fight, state) {
  if (!state || !Array.isArray(state.fighters) || state.fighters.length !== 2 || state.stage !== fight.stage) return false;
  for (const key of MATCH_FIELDS) if (Object.hasOwn(state, key)) fight[key] = state[key];
  for (let i = 0; i < 2; i++) {
    const target = fight.fighters[i], source = state.fighters[i];
    for (const key of Object.keys(target)) if (key !== 'attack' && Object.hasOwn(source, key)) target[key] = source[key];
    const attack = source.attack;
    target.attack = attack && MOVES[attack.id] ? { ...attack, move: MOVES[attack.id], victims: new Set() } : null;
  }
  fight.projectiles = (state.projectiles || []).filter(p => MOVES[p.id]).map(p => ({ ...p, move: MOVES[p.id] }));
  return true;
}

export function validConfig(value) {
  return value && Number.isInteger(value.stage) && value.stage >= 0 && value.stage < 8 && (value.character === 0 || value.character === 1);
}
