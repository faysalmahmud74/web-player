(function(){
  const el = {
    wrapper: document.getElementById('playerWrapper'),
    video: document.getElementById('video'),
    sourceInput: document.getElementById('sourceInput'),
    btnPlayUrl: document.getElementById('btnPlayUrl'),
    fileInput: document.getElementById('fileInput')
  };

  const isHls = (url) => /\.m3u8($|\?)/i.test(url);
  let hls = null;
  const cleanupHls = () => { if (hls) { try { hls.destroy(); } catch {} hls = null; } };

  const loadUrl = (url) => {
    if (!url) return;
    cleanupHls();
    if (isHls(url) && window.Hls) {
      hls = new window.Hls();
      hls.attachMedia(el.video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url));
    } else {
      el.video.src = url;
    }
    el.video.load();
    el.video.play().catch(()=>{});
  };

  const loadFile = (file) => {
    if (!file) return;
    cleanupHls();
    el.video.src = URL.createObjectURL(file);
    el.video.load();
    el.video.play().catch(()=>{});
  };

  // Bindings
  el.btnPlayUrl.addEventListener('click', () => {
    const url = (el.sourceInput.value || '').trim();
    if (!url) return;
    loadUrl(url);
  });
  el.fileInput.addEventListener('change', (e) => loadFile(e.target.files?.[0]));

  // Drag & drop
  ['dragenter','dragover','dragleave','drop'].forEach(evt => {
    el.wrapper.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
  });
  el.wrapper.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) loadFile(file);
  });
})();
