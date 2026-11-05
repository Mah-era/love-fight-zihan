# Love Fight: The PDA Arcade

A personal anniversary game about affection, companionship, and playful competition. Built around Mahera and Zihan, Love Fight brings the presentation of a classic arcade fighter to eight places in their shared story, ending with a Bangladeshi wedding celebration.

[Play the game](https://mah-era.github.io/love-fight-zihan/) · [Preview the wedding ending](https://mah-era.github.io/love-fight-zihan/wedding-preview.html)

## Overview

Love Fight is a desktop browser game with two playable characters, a two-button attack system, interactive environments, solo progression, and local or online versus play. Kisses, embraces, and other affectionate gestures form the move set, while spacing, timing, defense, and energy management determine the outcome of each match.

Its visual direction combines detailed pixel art, warm evening palettes, arcade typography, animated hearts, and synthesized music. The anniversary dedication is part of the opening screen; the wedding ending completes the Story campaign.

Both characters are adults. Mahera's play style emphasizes speed and quick combinations. Zihan favors stronger attacks and greater resilience. Arena variants introduce changes in clothing palettes, CPU tactics, and available moves.

## Getting started

Open the [live game](https://mah-era.github.io/love-fight-zihan/) in a current desktop browser and select **Press Start**. Choose **Quick Match** for an immediate match, **Story Mode** for the eight-chapter campaign, or **Versus Mode** to play with a second person.

Keyboard controls are the supported input method. Audio begins after a click or key press. Mobile controls are not enabled in this edition.

### Game modes

| Mode | Experience |
| --- | --- |
| Quick Match | Choose an arena and face the CPU. |
| Story | Progress through eight chapters with dialogue, saved arena unlocks, and the wedding ending. |
| Local Versus | Two players share one keyboard; the first to win two rounds wins the match. |
| Online Versus | Two players connect through a room code from separate computers. |
| Training | Practice without a time limit, refill resources, and select an idle, blocking, or active opponent. |

### Default controls

| Action | Player 1 | Player 2 — local versus |
| --- | --- | --- |
| Move left / right | A / D | Left / Right arrows |
| Jump | W | Up arrow |
| Crouch | S | Down arrow |
| Attack 1 | F | 1 |
| Attack 2 | G | 2 |
| Special | F + G | 1 + 2 |
| Dodge | Space | 0 |
| Use nearby furniture | E | Enter |
| Pause | Escape | Escape |

Controls can be reassigned in **Settings**. In online play, each participant uses the Player 1 bindings on their own computer, regardless of which fighter they control.

Hold a direction away from the opponent to block. Double-tap a direction to run. Press both attack buttons together to use a stage special with at least 40 energy; at 100 energy, the same input activates **PDA Overload**.

## Combat and environments

Each arena assigns two basic moves and a stage special to the same attack buttons. The full move set includes kisses, hand holding, hugs, cuddles, and lap sitting, alongside heart projectiles and multi-hit specials.

Attacks have defined reach, startup, active timing, and recovery. Defense includes blocking, dodging, and counter opportunities; grabs can bypass a block. Successful attacks build combinations and contribute to energy and scoring. Most modes use timed rounds and require two round wins to complete a match.

Furniture is part of the playable space. Players can land on platforms, move off their edges, or use nearby objects to gain energy and initiate contextual interactions. Paired actions require the other character to be close enough. The bedroom bed has its own collision surface and supports both characters during seated interactions.

### The eight arenas

| Chapter | Location | Interactive feature | Basic moves | Stage special |
| --- | --- | --- | --- | --- |
| First Date | Restaurant | Window booth | Kiss attack · Hand hold | Heart Blast |
| Coffee & Chaos | Café | Panda-corner bench | Cheek kiss · Hug grab | Kiss Storm |
| Movie Night | Cinema | Back-row seats | Forehead kiss · Cuddle attack | Heart Blast |
| Golden Hour | Rooftop | Flower bench | Surprise kiss · Bear hug | Love Upper Cut |
| Do Not Disturb | Bedroom | Bed | Neck kiss · Lap sit | Ultimate Cuddle |
| Public Display | Shopping mall | Atrium bench | Kiss attack · Bear hug | Kiss Storm |
| Player Two | Arcade | Co-op cabinet | Cheek kiss · Hug grab | Love Upper Cut |
| Forever, Continue? | Forever arena | Flower-arch platform | Forehead kiss · Cuddle attack | Forehead Kiss Finisher |

**PDA Overload** is available in every arena at full energy. Its six phases combine a kiss, neck kiss, hug, lap sit, another kiss, and a forehead kiss. Connected attacks and combinations trigger the arcade callouts throughout the game.

## Playing together online

1. Both players open the live game and select **Versus Mode → Online Two Player**.
2. The host selects **Create Room** and shares the eight-character code.
3. The second player enters the code and selects **Join Room**.
4. The host chooses a fighter and arena. The guest receives the other fighter and selects **I'm Ready**.
5. The host selects **Start Together**.

Keep both game tabs open. Either player can pause the match. A rematch starts after both players choose **Yes**; if a player disconnects, create a new room to reconnect.

Online mode uses the bundled PeerJS client and WebRTC data channels. A signaling service establishes the connection. The host runs the combat simulation and sends state updates to the guest; the guest sends input rather than calculating a separate match outcome. Sequence and match identifiers prevent stale input from being applied to a later match.

Connection quality depends on both players' networks. Some restrictive networks require a TURN relay. Deployments can supply PeerJS connection options through `window.LOVE_FIGHT_RTC` before a room is opened. The repository does not include a managed TURN service or persistent room recovery.

## Story conclusion

Winning the eighth Story arena plays a 20-second wedding ending. Mahera wears a red and gold saree, and Zihan wears a black panjabi, against a decorated Bangladeshi wedding stage.

The sequence moves through a ring exchange, a forehead kiss, a lip kiss, and a celebration before displaying:

> biye kore ar ki hobe, na korleo hobe

The ending is rendered inside the game using Canvas, character frames, animated lighting, hearts, and confetti. It returns to the victory screen when complete. **Skip Ending** or **Escape** exits early, and switching away from the tab pauses its timeline. Reduced-motion preferences suppress camera movement and character-frame cycling.

The [standalone preview](https://mah-era.github.io/love-fight-zihan/wedding-preview.html) allows the ending to be viewed without completing the campaign.

## Progress and settings

The game saves settings, high scores, Story unlocks, achievements, and relationship statistics in the current browser using `localStorage`. Training does not add progression rewards. Saves are specific to the browser and site address; they do not automatically transfer between computers or between a local copy and the live site.

Settings include keyboard bindings, music and effects volume, CPU difficulty, CRT scanlines, and screen shake. If browser storage is unavailable, the game falls back to session-only progress.

## Running this repository locally

The public repository contains a static website in `dist/`. It does not require a package installation or application build step. Serve that directory over HTTP rather than opening the HTML file directly.

With Python 3 installed:

```sh
git clone https://github.com/Mah-era/love-fight-zihan.git
cd love-fight-zihan
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The ending preview is available at `/wedding-preview.html`.

The local address is reachable only from the same computer. Use the hosted game URL when inviting someone on another device. Local solo and same-keyboard modes use bundled assets; online versus additionally requires internet access to establish a connection.

## Code organization

| Path | Responsibility |
| --- | --- |
| `dist/index.html` | Game shell, canvas, controls, and status elements |
| `dist/style.css` | Cabinet layout, menus, dedication, and ending presentation |
| `dist/src/main.js` | Screen flow, input handling, progression, and mode integration |
| `dist/src/data.js` | Characters, moves, stages, dialogue, and achievements |
| `dist/src/engine.js` | Movement, collision, combat, rounds, and CPU behavior |
| `dist/src/render.js` | Sprites, paired poses, scenery, HUD, and effects |
| `dist/src/online.js` | Room lifecycle, connection status, pause, and rematch flow |
| `dist/src/net-state.js` | Input buffering and match-state serialization |
| `dist/src/progression.js` | Match rewards, campaign progress, and achievements |
| `dist/src/storage.js` | Browser save data and fallback defaults |
| `dist/src/audio.js` | Synthesized music and sound effects |
| `dist/src/wedding.js` | Wedding eligibility, timeline, animation, and exit handling |
| `dist/wedding-preview.html` | Standalone wedding preview |
| `dist/assets/` | Character, environment, furniture, wedding, and font assets |
| `dist/vendor/` | Bundled third-party libraries and license notices |
| `tests/` | Tests included in this public repository |
| `.github/workflows/pages.yml` | GitHub Pages deployment workflow |

The deployed JavaScript modules are maintained directly in `dist/src/`. There is no framework compilation step. The combat simulation is separate from rendering, while the main module connects it to menus, input, audio, and progression.

### Validation

With a current Node.js installation, run the included tests:

```sh
node --test tests/*.test.mjs
```

The tests currently included here verify the wedding trigger and timeline: only a player victory in the final Story arena starts the ending, and both kiss scenes appear before the final card. The broader development project has additional combat, networking, progression, and storage tests; those suites are not part of this published checkout.

For browser verification, check that the title screen loads, a match starts, movement and furniture interaction work, and the wedding preview reaches its final card and returns cleanly. Changes to online behavior should also be tested with two browser clients, including pause, disconnect, and rematch handling.

### Deployment and recordings

Pushes to `main` trigger the GitHub Actions workflow, which publishes `dist/` to GitHub Pages. Check the workflow result before treating a change as live.

The MP4 playthrough is retained locally and is excluded from this repository and website. The public wedding ending is an in-game animation and does not require a video download. Supporting recording modules remain in the source, but the original recording page and local recording server are not included in this checkout.

## Art, audio, and third-party notices

Character and environment artwork was generated and refined from supplied references. The wedding artwork follows the approved red-saree and black-panjabi designs. [ASSETS.md](ASSETS.md) records the asset provenance and creative specifications. Music and sound effects are synthesized through the Web Audio API.

Press Start 2P is distributed under the [SIL Open Font License](dist/assets/FONT-LICENSE.txt). Bundled libraries retain their respective notices: [PeerJS](dist/vendor/PEERJS-LICENSE) and [Mediabunny](dist/vendor/MEDIABUNNY-LICENSE.txt). These third-party licenses apply to their respective components; they do not establish a blanket license for the game's personal artwork or other project content.
