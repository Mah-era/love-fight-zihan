# LOVE FIGHT: THE PDA ARCADE

A local Canvas fighting game starring Mahera and Zihan. This is the desktop keyboard edition. Mobile work is deferred until explicitly requested.

## Run

Requires Node.js 18 or newer. No package installation is required.

```sh
npm run dev
```

Open http://localhost:4173. The included server binds to localhost. The local modes make no network requests beyond loading local assets.

The menu also includes live online two-player play. Choose `VERSUS` → `ONLINE TWO PLAYER`. The host creates an eight-character room code, the second player joins with that code, and the host starts after the guest presses `I'M READY`. The host selects the arena. Both players use their own P1 keys: WASD, F/G for the two attacks, F+G for a special, E for furniture, and Escape to pause both players. The host runs the authoritative fight simulation; the guest sends input and receives 30 Hz snapshots, keeping damage, furniture, rounds, victory and rematches synchronized. Create a new room after a disconnect.

Online play uses PeerJS/WebRTC data channels. A signaling service helps browsers find each other, then game data flows peer to peer. Restrictive networks may require TURN relay configuration; deployments can provide it through `window.LOVE_FIGHT_RTC`. Mobile controls remain intentionally deferred until requested.

The complete desktop recording is [LOVE-FIGHT-full-playthrough.mp4](artifacts/LOVE-FIGHT-full-playthrough.mp4): 1920×1080, 30 fps, 6:35, synthesized arcade audio, all eight arenas.

## Anniversary landing message

The landing screen displays the requested dedication exactly as written:

> Happy 5th Anniversary Zihan!  
> PRAY you become a better person and treat me with love and respect; HOW you intend to!

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Move | A / D | Left / Right |
| Jump | W | Up |
| Crouch | S | Down |
| Kiss / light attack | F | 1 |
| Hug / grapple | G | 2 |
| Stage special | F + G together | 1 + 2 together |
| Dodge | Space | 0 |
| Use furniture | E | Enter |
| Pause | Escape | Escape |

Hold away from your partner to block. Double-tap a direction to run. Two attack buttons together spend 40 energy on the stage special; at 100 energy they trigger PDA Overload. Controls can be remapped in Settings.

## Modes and arenas

- **Quick match:** any arena against the CPU.
- **Story:** eight chapters, stage-specific dialogue, increasing challenge, saved checkpoints.
- **Versus:** two local players or live online players, best of three, pause and rematches.
- **Training:** infinite time, refill, idle/blocking/fighting dummy, damage and combo display.
- **Arcade:** eight increasingly difficult partner variants and a final encounter.

The restaurant, café, cinema, rooftop, bedroom, mall, arcade and Forever arena each have separate collision-enabled furniture. Jump onto it, or use it when nearby. Contextual affection moves require your partner to be nearby. The bed is its own sprite, platform and interaction anchor; it is not part of the painted room. Furniture use charges energy and triggers stage effects. Ambience is rendered in separate animated layers.

The two basic moves change by stage. All ten basic moves and six specials are defined in `src/data.js`. Movement, range, attack timing, recovery, hitstun, blocking, throws, dodges, counters, projectiles, energy, combos and round outcomes run in `src/engine.js` independently of drawing.

## Project structure

- `src/engine.js`: simulation and CPU behavior, independent of DOM/Canvas.
- `src/data.js`: characters, attacks, stages, furniture, dialogue and achievements.
- `src/render.js`: Canvas sprite animation, paired affection states, scenery, HUD and particles.
- `src/main.js`: menus, keyboard input and mode flow.
- `src/online.js` / `src/net-state.js`: room flow, host-authoritative WebRTC session and validated snapshots.
- `src/progression.js`: match rewards, checkpoints, endings and achievements.
- `src/audio.js`: original procedural chiptune music and effects.
- `src/storage.js`: versioned localStorage persistence with safe fallback.
- `assets/`: locally stored original generated art and licensed font.
- `tests/`: deterministic Node tests for mechanics and persistence.

```sh
npm test
```

Settings, high scores, story unlocks and achievements save on the current browser/device. Training does not alter progression. Audio starts after a click/key gesture and has separate music and effects volume controls. All art is local; no image generation or cloud service is needed to play.

## Asset provenance

Original character and environment assets were created with the built-in imagegen tool, using the supplied references. The selected fuller Zihan design with black rectangular glasses and a light-blue polo is the canonical character reference. Prompts and revisions are recorded in `ASSETS.md`. Press Start 2P is bundled under the SIL Open Font License; see `assets/FONT-LICENSE.txt`.

## Full feature reference

### Characters and presentation

Mahera is the fast kiss-combo fighter. Zihan is the fuller, stocky cuddler with black rectangular glasses, a light-blue polo and beige trousers. Both are adults. Mahera's earrings are removed from the supplied character art. The paired interaction atlas uses the same approved character proportions as the standalone fighter sheet.

The landing page keeps the arcade cabinet presentation and includes the anniversary dedication for Zihan. The character select screen shows partner descriptions and ratings. Stage variants recolor clothing and scenery while preserving the canonical character identity.

### Combat model

The game keeps exactly two attack buttons per player. The buttons are context-sensitive by stage: each arena selects two basic moves and one stage special. Holding both attack buttons spends 40 energy on that stage special; reaching 100 energy enables PDA Overload. Overload contains six affection phases: kiss, neck kiss, cuddle grab, lap sit, kiss and forehead kiss.

The engine also implements movement, jumping, gravity, one-way furniture platforms, crouching, running, blocking, dodge invulnerability, counter windows, grabs, projectiles, hitstun, recovery, combo decay, critical hits, energy gain, best-of-three rounds, timeout decisions, training mode and CPU difficulty. The engine is independent of Canvas rendering and is covered by deterministic tests.

### Interactive arenas

There are eight arenas: The Restaurant, The Café, The Cinema, The Rooftop, The Bedroom, The Shopping Mall, The Arcade and The Forever Arena. Each has its own collision-enabled prop and move prompt. Props are rendered as separate foreground elements rather than being a stale background image. Players can jump onto platforms or press Use nearby. When both fighters are close, furniture interaction pulls them into a contextual PDA action.

The bedroom's bed has its own platform rectangle, collision rules, sprite, edge clamping and seated/lap alignment. Bed actions include cuddle, neck kiss, lap sit and PDA Overload. The same interaction pattern applies to booths, benches, cinema seats, the arcade cabinet and the Forever platform.

### Online architecture

Online mode is a two-player room, not a shared CPU match. The host owns the simulation, random outcomes, hit detection, furniture state, round state and victory result. Player 2 sends validated input packets. The host sends snapshots at up to 30 Hz, including fighter state, projectiles, particles, callouts and round events. Sequence numbers reject replayed input. Stale packets cannot affect a different match. The session pauses on a stalled connection, reports latency and stops safely after a disconnect. Both players must approve a rematch before a new match starts.

PeerJS is bundled locally under `vendor/peerjs.min.js` with its license. PeerJS provides signaling and WebRTC data-channel setup; after connection, gameplay data travels directly between browsers where the network permits. A deployed version can define `window.LOVE_FIGHT_RTC` with short-lived ICE/TURN configuration. Do not commit permanent TURN credentials.

### Recording pipeline

`recording.html` and `src/recording.js` render an offline, deterministic desktop playthrough using the real renderer and engine. The recorder drives all eight stages, captures the menu, character select, stage intros, complete fights, victory prompts and audio, then writes an MP4 through Mediabunny. `scripts/record-server.mjs` receives the finished file and metadata in `artifacts/`. The delivered recording is not a slideshow and does not override health, energy or match outcomes.

### Verification

Run `npm test` after changes. The suite currently covers 29 tests across movement, attacks, specials, blocking, dodging, counters, combos, ultimate phases, all furniture, bed edge support, jumping, rounds, timeouts, training, CPU behavior, online input buffering, authoritative snapshots, lobby readiness, pause/disconnect behavior, rematches, version mismatch, progression and storage fallback.

For a browser smoke test, run `npm run dev`, open the local URL, press Start, enter Versus, and verify both Local Two Player and Online Two Player screens. For online testing on two machines, use a hosted HTTPS URL or a LAN-accessible deployment; do not give another machine a `localhost` URL because it resolves to that other machine.

### Project files

`index.html` contains the cabinet shell and accessibility status output. `style.css` contains the desktop visual system and intentionally hides touch controls until mobile is requested. `src/main.js` owns screens, input mapping, menus, pause flow, progression and online integration. `src/engine.js` is the simulation. `src/render.js` draws the pixel scene. `src/data.js` stores fighters, moves, stages and dialogue. `src/online.js` manages room lifecycle. `src/net-state.js` validates packets and serializes snapshots. `src/audio.js` creates synthesized music and effects. `src/storage.js` handles safe browser persistence. `src/progression.js` records wins and achievements. `src/replay-driver.js` supplies the recorder's ordinary inputs. `tests/` contains Node's built-in test suite. `assets/` contains local art and font files. `vendor/` contains the bundled PeerJS client and license.

### Known deployment requirement

The checked-out project runs locally and contains the complete online client. A true cross-device online session requires both players to load the same reachable URL. A Git push also requires a configured Git remote; this checkout currently has no `.git` directory or remote, so the code can be committed locally but cannot be pushed to an unknown destination.
