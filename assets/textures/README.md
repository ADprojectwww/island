
## Animal animation sheets

Generated with the built-in imagegen tool. Both sheets have genuine alpha,
four columns (successive looping gait frames) and four rows:

| File | Rows, top to bottom |
| --- | --- |
| animals-wild-atlas.png | Rabbit, turtle, parrot, boar |
| animals-farm-atlas.png | Wild dog, companion dog, chicken, goat |

Generation prompt set: production 4 × 4 transparent animation sprite sheets for
a painterly tropical survival game; isolated animals facing right in a consistent
slightly overhead three-quarter view, warm upper-left light, stable body scale and
baseline; four distinct successive contact/passing/opposite contact/passing poses.
Rabbit hops with ear movement, turtle alternates feet, parrot changes wing poses,
boar alternates legs; dogs alternate legs and tail positions, chicken alternates
feet with head bob, goat alternates hooves. No labels, grid, scenery or background.
The companion has a teal collar. Source images are preserved without cropping.

## Animation behavior

All new effects share `GameTextures.time`, advanced by the simulation's `dt`.
Drawing does not advance the clock. Pause freezes animation; starting a new game
resets it. Animal movement is tracked with a WeakMap and does not enter saves.

| Category | Animation |
| --- | --- |
| Animals | Four gait frames driven by actual distance traveled, horizontal facing, species-specific hop, grounded shadows; idle breathing, slower sleep breathing and z marker, eating head/body dip |
| Trees, palms, bushes, fiber | Wind bends upper sprite strips, while the base remains planted; wind strength follows weather and each world position has a different phase |
| Viral herb | Gentle sway and pulsing glow |
| Mushrooms, stones, branches, stumps | Remain grounded and still |
| Ocean and shallows | Continuous texture drift in world coordinates with wrapped samples, plus moving wave highlights |
| Sand, rocky ground, forest/meadow ground | Stable surfaces; vegetation above them provides movement |
| Campfire | Flame sway, pulsing warm light and rising fading embers |
| Shelter and garden | Subtle wind in the upper sprite, stable base |
| Cabin | Soft window flicker at night |
| Rain collector | Falling droplets while raining |
| Solar panel | Slow sunlight glint during daytime |
| Wind turbine / water wheel | Rotating blades; turbine speed follows wind strength |
| Radio tower | Beacon blink on the shared simulation clock |
| Boat | Bobbing hull and gently flexing sail |
| Dropped items | Low-amplitude bob above a stationary ground shadow |
| Inventory / recipe icons | Stable for readability |
| Chests, workbenches, fences, other solid structures | Stable; no artificial wobble of rigid materials |

PNG load failures retain the original Canvas animal drawings and existing
procedural world artwork. Companion nameplates and found-item markers remain;
the virus extension still draws infection/guide indicators above animals.

## Survivor and aircraft

Generated with the built-in imagegen tool and saved locally:

| File | Layout | Meaning |
| --- | --- | --- |
| player-atlas.png | 4 × 4 | Rows: down, left, right, up; columns: four walking-cycle poses |
| aircraft-atlas.png | 2 × 2 | Intact flight, crashed wreck, stripped wreck, damaged flight |

Player prompt: identical adult survivor with tan skin, short dark hair, teal
rolled-sleeve shirt, beige cargo trousers, brown boots and a small backpack;
painterly top-down three-quarter game art; sixteen full-body sprites, four facing
rows and four alternating contact/passing walk poses; stable scale and baseline,
genuine alpha, no tools, labels, scenery or background.

Aircraft prompt: small weathered ivory twin-engine island transport plane with a
teal stripe and silver wings, nose pointing right; four states in a 2 × 2 transparent
atlas: intact flight, crashed wreck, stripped salvage and damaged flight; matching
hand-painted overhead game art, no text, scenery, baked smoke or flames.

Player gait follows distance actually moved, including collision checks. The idle
pose breathes; equipped tools follow the hand, melee/harvest actions swing, shots
recoil with a short muzzle flash, and damage triggers a brief flinch. Passengers
use the same character artwork inside the boat.

New crash events have a 3.2-second approach with rotating propellers and a damaged
flight state, then an impact ring, moving smoke, flames and embers. Loot interaction
starts after landing. Salvaging switches to stripped wreck artwork. Restored saves
show already-grounded wrecks; transient flight and action animation state is not
serialized. Missing player/aircraft PNGs retain the previous Canvas renderers.

Water additionally has weather-independent continuous wave crests, advancing and
receding foam only along water/land boundaries, boat wake trails when moving and
idle hull ripples. All effects use the same pause-aware simulation clock.
