# Asset prompts and design decisions

All PNG art was generated with the **built-in imagegen tool** and copied into this project. No source photographs are shipped with the game. They were used only as the user-supplied appearance references. Original generated versions remain in the Codex generated-images folder.

## `assets/fighters.png`

Two rows of eight transparent full-body animation frames: Mahera and Zihan, facing right. Idle, two walking frames, jump, kiss reach, hug reach, embarrassed reaction, victory. Detailed 1996 Neo Geo pixel art, hard outlines and transparent background. Mahera: dark side-swept bob, lavender blouse, white wide trousers, white sneakers. Zihan: round face, stocky fuller build, tousled black hair, black rectangular glasses, light sky-blue polo, beige trousers, white sneakers. Preserve the exact frame layout and baselines.

Canonical reference selected by the user: `exec-c44fcf5b-09bd-49e2-a991-38ed541e5e20.png`, particularly the marked jumping Zihan. The final edit requested removal of all bright white/silver earring pixels in every Mahera frame while preserving this Zihan exactly.

## `assets/couples.png`

Four columns by two rows of separate, transparent, full-body adult couple interactions. Column poses: standing kiss, bear hug, seated lap cuddle, forehead kiss. Two animation keyframes per pose. Match the approved fighter sheet's Zihan face, round stocky body, black glasses, light-blue polo and beige trousers; match Mahera's bob, lavender blouse and white trousers. Preserve atlas layout and transparency. Final edit: remove Mahera's ear jewelry.

## `assets/arenas.png`

Four columns by two rows of detailed 16-bit fighting backgrounds, no fighters or UI: warm restaurant, turquoise blossom café with panda plush, red-seat cinema, sunset rooftop, cozy bedroom, mall atrium, neon arcade, magical floral Forever arena. Purple shadows, amber highlights and pink accents, clear foreground floor, consistent pixel density. The bottom-left bedroom was revised to remove its painted bed and leave a rug and open floor; the playable bed is a separate object.

## `assets/props.png`

Four columns by two rows of transparent, separately rendered foreground furniture: teal restaurant booth, pink rattan loveseat, red cinema chairs, rooftop flower bench, lavender/red bed, mall bench, neon arcade cabinet, floral golden dais. Nearly front-facing side-view composition, flat seating/platform surfaces, intricate pixel textures, dark outlines, purple shadows and amber highlights. The engine's collision rectangles and interactions are aligned with the visible furniture surfaces.

Sprite frames are cropped from their atlases at runtime. Props, ambient effects, lights, petals, screen effects, particles, fighters, paired poses and HUD are distinct rendering layers; background paintings never substitute for gameplay.
# Wedding ending assets

Built-in image generation produced `dist/assets/wedding-poses.png` and `dist/assets/wedding-stage.png` from the user-approved wedding board. Pose prompt: transparent four-column, two-row atlas with ring exchange, forehead kiss, lip kiss and joined-hands celebration, two animation frames each; preserve Mahera's red/gold saree and Zihan's stocky body, black glasses, black panjabi and cream trousers. Stage prompt: expand the approved empty Bangladeshi wedding stage into a 16:9 pixel-art background with cream/gold loveseat, ruby drapes, roses, marigolds, fairy lights and unobstructed foreground. No generated text is used for the ending message; it is rendered in code for exact spelling.

