# Skyline Sprint

[中文](README.md) · [Tripothon submission copy](TRIPOTHON_SUBMISSION.md)

A browser-based 3D time trial above the clouds. Drive through floating islands, sky cities and airships on an original 1.13 km course, passing six checkpoints, an island jump and a vertical loop.

- Three selectable cars with identical performance: Lumen, Kestrel and Zephyr.
- Gentle brake-assisted drifting, contact-based tire marks and rounded guardrails.
- Personal-best ghosts, split times and Star-letter cloud saves and leaderboards.
- Chinese / English switch on the home screen and in Settings; the choice persists.
- Keyboard and touch controls. Two creator-supplied Sky Flight tracks.

| Action | Keyboard |
| --- | --- |
| Accelerate | W / Up |
| Brake, reverse at low speed | S / Down |
| Steer | A D / Left Right |
| Drift | Steer while pressing S / Down |
| Handbrake | Space |
| Restart | R / Enter |
| Practice reset | C |
| Settings | Escape |

Pass all checkpoints in order before finishing. Pausing, resetting or leaving the game window turns the current attempt into a practice run.

## Run locally

```sh
npm ci
npm run dev
npm test
npm run build
```

The build bakes the track, checks scenery clearance against the full course, checks TypeScript, bundles the game and updates the Star-letter preview entry. `star-letter dev --open` opens the platform preview when the creator CLI is installed and authenticated.

The creator has published game #8537 on Star-letter. This revision is uploaded as an update draft; it does not automatically replace the published version.

## Tripo and Blender workflow

Tripo generated the cars and many environmental assets. The latest six models include an endurance prototype, a rally car, a warning sign, a modular barrier, an airship and a sky citadel. Prompts, seeds and receipts are preserved under `assets/source/`. The project has 31 generation tasks totaling 1,480 credits; the six-asset expansion used 240 credits.

Blender source files include normalized assets, separated wheels, legible sign geometry and additional architecture. Runtime GLBs use compressed textures and distance-based detail levels. Two generated panoramic paintings extend the sky. The game uses Three.js, TypeScript and Rapier raycast vehicle physics.

Install Git LFS and run `git lfs pull` to retrieve editable `.blend` files and source exports. See [scene notes](assets/SCENE.md), [audio attribution](assets/AUDIO_LICENSES.md) and [submission copy](TRIPOTHON_SUBMISSION.md) for details.

Current checks: 31 tests pass; complete runs at 30/60/120 render FPS finish in the same 39.904 seconds. Physics v5 uses an independent leaderboard to avoid mixing rulesets.
