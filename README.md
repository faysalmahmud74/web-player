# StreamFlix Simple Player

A clean, Netflix-style HTML5 video player with native controls and optional HLS (.m3u8) support via Hls.js.

## Features
- Minimal UI: brand header, URL input, upload button
- Native video controls for a familiar experience
- Drag & drop local file support
- URL input for MP4/WebM and .m3u8 (Hls.js used if available)

## Use It
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
2. Paste a video URL and click "Play" or click "Upload" to select a local file. You can also drag & drop onto the player.

## HLS (.m3u8)
Includes a CDN script for [Hls.js](https://github.com/video-dev/hls.js). If your browser doesn’t support HLS natively, `.m3u8` URLs will play via Hls.js when available.

## Notes
- No media is bundled; use your own content.
- DASH is not supported.

## Author
© 2025 StreamFlix — Faysal Mahmud
