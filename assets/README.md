# Audio & Multimedia Assets Documentation

This directory contains the multimedia assets fulfilling Requirement 6.4 (*"Multimedia: Video or Audio"*) of the COS 106 Term Project.

### Included Multimedia Assets:
1. `welcome_audio.wav`: Primary HTML5 audio voice greeting asset demonstrating multimedia tag integration (`<audio controls>`) on the homepage hero.
2. `pDoom.mp3`: Background atmospheric cybersecurity audio stream. Handled via progressive byte-range fetch chunk streaming and CacheStorage caching in `js/effects.js` (loaded on-demand with zero page load bottleneck).
