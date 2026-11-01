# Audio & Multimedia Assets Documentation

This directory contains the multimedia assets fulfilling Requirement 6.4 (*"Multimedia: Video or Audio"*) of the COS 106 Term Project.

### Included Multimedia Asset:
- `pdoom.mp3`: Ambient cybersecurity background audio stream. Handled via progressive byte-range fetch chunk streaming and CacheStorage caching in `js/effects.js` (loaded on-demand with zero page load bottleneck).
