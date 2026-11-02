# Doom Fire

Interactive browser version of the Doom fire effect.

Each cell copies the intensity from the neighbor toward the source, subtracts a random decay and shifts sideways. That intensity indexes a color palette. The defaults match the original effect: decay from 0 to 2, wind coupled to that decay, source along the bottom edge, and the 37-color Doom palette.

Open it through a static server so the modules load:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Controls

- Columns, rows and frame rate
- Source intensity, thickness and flame direction
- Minimum and maximum decay
- Wind: classic, fixed, or oscillating
- Palette length, Doom / blue / pink presets, or a custom cold-mid-hot ramp
- Left click paints heat. Right click puts it out.

The effect was documented by [Fabien Sanglard](https://fabiensanglard.net/doom_fire_psx/) and explored in [filipedeschamps/doom-fire-algorithm](https://github.com/filipedeschamps/doom-fire-algorithm).
