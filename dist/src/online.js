import { Fight } from './engine.js';
import { PROTOCOL, InputBuffer, snapshot, applySnapshot, validConfig } from './net-state.js';

const PREFIX = 'lovefight-v1-';
const CODE = /^[A-HJ-NP-Z2-9]{8}$/;
let library;
function loadPeer() {
  if (globalThis.Peer) return Promise.resolve(globalThis.Peer);
  return library ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('../vendor/peerjs.min.js', import.meta.url).href;
    script.onload = () => resolve(globalThis.Peer);
    script.onerror = () => { library = null; reject(Error('The online library could not load. Reload and try again.')); };
    document.head.append(script);
  });
}
function roomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [...crypto.getRandomValues(new Uint8Array(8))].map(n => alphabet[n % 32]).join('');
}
export function normalizeCode(code) { return String(code).toUpperCase().replace(/[\s-]/g, ''); }

export class OnlineSession {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; this.closed = false; this.connected = false;
    this.config = { stage: 0, character: 0 }; this.ready = false; this.paused = false;
    this.remote = new InputBuffer(); this.outgoing = new InputBuffer();
    this.sequence = 0; this.frame = 0; this.receivedFrame = -1;
    this.lastPacket = performance.now(); this.events = []; this.votes = [false, false];
  }
  notify(name, ...args) { this.callbacks[name]?.(...args); }
  async open(role, code = '', config = this.config) {
    this.host = role === 'host'; this.code = this.host ? roomCode() : normalizeCode(code);
    if (!CODE.test(this.code)) { this.fail('Enter the eight-character room code shown on the host’s screen.'); return; }
    this.config = { ...config };
    this.notify('status', 'Connecting to the room service…');
    this.deadline = setTimeout(() => this.fail('Connection timed out. Check your internet connection and try again. A restrictive network may need a TURN relay.'), 20000);
    try {
      const Peer = await loadPeer();
      if (this.closed) return;
      // Optional deployment configuration supports a self-hosted signalling server
      // and short-lived TURN credentials. Never put long-lived TURN secrets here.
      const options = { debug: 0, ...(globalThis.LOVE_FIGHT_RTC || {}) };
      this.peer = this.host ? new Peer(PREFIX + this.code, options) : new Peer(options);
      this.peer.on('open', () => {
        if (this.host) { clearTimeout(this.deadline); this.notify('status', 'Room open. Share the code with your partner.'); this.lobby(); }
        else this.attach(this.peer.connect(PREFIX + this.code, { reliable: true, serialization: 'json', metadata: { protocol: PROTOCOL } }));
      });
      this.peer.on('connection', connection => {
        if (!this.host || this.connection || connection.metadata?.protocol !== PROTOCOL) {
          connection.on('open', () => { connection.send({ type: 'reject', reason: 'This room already has two players, or uses a different game version.' }); setTimeout(() => connection.close(), 100); });
          return;
        }
        this.attach(connection);
      });
      this.peer.on('error', error => {
        const messages = {
          'peer-unavailable': 'Room not found. Check the code and make sure the host is still in the lobby.',
          'unavailable-id': 'That room code is already taken. Please create a new room.',
          'browser-incompatible': 'This browser does not support online play. Use a current desktop Chrome, Edge, Firefox or Safari.',
          'network': 'The room service is unreachable. Check your connection and retry.',
        };
        this.fail(messages[error.type] || 'The online connection failed. Please create or join a new room.');
      });
      this.peer.on('disconnected', () => {
        if (!this.closed && !this.connected) this.fail('The room service disconnected. Please create a new room.');
      });
    } catch (error) { this.fail(error.message); }
  }
  attach(connection) {
    this.connection = connection;
    connection.on('open', () => this.send({ type: 'hello', protocol: PROTOCOL }));
    connection.on('data', data => this.receive(data));
    connection.on('close', () => this.fail('Your partner left or disconnected. The match has stopped. Create a new room to play again.'));
    connection.on('error', () => this.fail('The connection to your partner was lost. Please create a new room.'));
  }
  send(data) {
    if (!this.closed && this.connection?.open) {
      try { this.connection.send(data); } catch { this.fail('Could not send game data. Please reconnect.'); }
    }
  }
  receive(data) {
    if (this.closed || !data || typeof data !== 'object' || typeof data.type !== 'string') return;
    const now = performance.now(); this.lastPacket = now;
    if (data.type === 'reject') { this.fail('This room is full or uses a different game version.'); return; }
    if (data.type === 'hello') {
      if (data.protocol !== PROTOCOL) { this.fail('Game versions do not match. Both players should reload the game.'); return; }
      clearTimeout(this.deadline); this.connected = true;
      this.notify('status', 'Two hearts connected.');
      if (this.host) this.lobby();
      return;
    }
    if (!this.connected) return;
    if (data.type === 'ping') { this.send({ type: 'pong', at: data.at }); return; }
    if (data.type === 'pong') { this.latency = Math.round(now - data.at); this.notify('latency', this.latency); return; }
    if (this.host) {
      if (data.type === 'ready' && !this.fight) { this.ready = data.ready === true; this.lobby(); }
      if (data.type === 'input' && data.match === this.match && !this.paused) this.remote.push(data.sequence, data.input, now);
      if (data.type === 'pause' && data.match === this.match) this.setPause(data.paused === true);
      if (data.type === 'rematch' && this.fight?.ended) { this.votes[1] = true; this.rematch(); }
    } else {
      if (data.type === 'lobby' && validConfig(data.config)) {
        this.config = data.config; this.ready = data.ready === true; this.fight = null; this.notify('lobby');
      }
      if (data.type === 'start' && validConfig(data.config) && Number.isSafeInteger(data.match)) this.begin(data.config, data.match);
      if (data.type === 'pause' && data.match === this.match) {
        this.paused = data.paused === true; this.outgoing.reset(); this.notify('pause', this.paused);
      }
      if (data.type === 'state' && data.match === this.match && this.fight && Number.isSafeInteger(data.frame) && data.frame > this.receivedFrame) {
        this.receivedFrame = data.frame;
        if (!applySnapshot(this.fight, data.state)) return;
        for (const event of data.events || []) this.notify('event', event);
      }
      if (data.type === 'votes' && Array.isArray(data.votes)) { this.votes = data.votes; this.notify('votes'); }
    }
  }
  lobby() {
    this.send({ type: 'lobby', config: this.config, ready: this.ready });
    this.notify('lobby');
  }
  configure(config) {
    if (!this.host || this.fight || !validConfig(config)) return;
    this.config = { ...config }; this.ready = false; this.lobby();
  }
  setReady() { if (!this.host) this.send({ type: 'ready', ready: !this.ready }); }
  start() {
    if (!this.host || !this.connected || !this.ready) return;
    const match = (this.match || 0) + 1;
    this.send({ type: 'start', config: this.config, match });
    this.begin(this.config, match);
  }
  begin(config, match) {
    this.config = config; this.match = match; this.paused = false; this.votes = [false, false];
    this.remote.reset(); this.outgoing.reset(); this.events = []; this.receivedFrame = -1;
    this.fight = new Fight({ ...config, mode: 'versus', onEvent: event => this.events.push(event) });
    this.notify('match', this.fight);
  }
  setPause(paused) {
    if (!this.fight || this.fight.ended) return;
    if (!this.host) { this.send({ type: 'pause', match: this.match, paused }); return; }
    this.paused = paused; this.remote.reset();
    this.send({ type: 'pause', match: this.match, paused }); this.notify('pause', paused);
  }
  requestRematch() {
    if (!this.fight?.ended) return;
    if (this.host) { this.votes[0] = true; this.rematch(); }
    else { this.votes[1] = true; this.send({ type: 'rematch' }); this.notify('votes'); }
  }
  rematch() {
    this.send({ type: 'votes', votes: this.votes }); this.notify('votes');
    if (this.votes.every(Boolean)) this.start();
  }
  tick(dt, input, now) {
    if (this.closed || !this.connected) return;
    if (!this.pingAt || now - this.pingAt > 1000) { this.pingAt = now; this.send({ type: 'ping', at: now }); }
    if (now - this.lastPacket > 12000) { this.fail('Your partner stopped responding. The match has stopped; please reconnect.'); return; }
    if (now - this.lastPacket > 2500) {
      if (!this.stalled) { this.stalled = true; if (this.host) this.setPause(true); this.notify('status', 'Connection interrupted — waiting for your partner…'); }
      return;
    }
    if (this.stalled) { this.stalled = false; this.notify('status', 'Connection restored. Resume when you are ready.'); }
    if (!this.fight || this.fight.ended || this.paused) return;
    if (this.host) {
      this.fight.step(dt, [input, this.remote.take(now)]);
      const events = this.events.splice(0);
      if (!this.sentAt || now - this.sentAt >= 1000 / 30 || events.length) {
        this.sentAt = now;
        this.send({ type: 'state', match: this.match, frame: this.frame++, state: snapshot(this.fight), events });
      }
      for (const event of events) this.notify('event', event);
    } else {
      this.outgoing.push(this.sequence++, input, now);
      if (!this.sentAt || now - this.sentAt >= 1000 / 30) {
        this.sentAt = now;
        this.send({ type: 'input', match: this.match, sequence: this.sequence, input: this.outgoing.take(now) });
      }
    }
  }
  fail(message) {
    if (this.closed) return;
    this.close(); this.notify('error', message);
  }
  close() {
    this.closed = true; this.connected = false; clearTimeout(this.deadline);
    this.connection?.close(); this.peer?.destroy();
  }
}
