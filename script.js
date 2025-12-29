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

  // Responsive player height: keep page within viewport on laptops
  const footer = document.querySelector('.sf-footer');
  const main = document.querySelector('.sf-main');
  const setPlayerMaxHeight = () => {
    if (!el.wrapper) return;
    const rect = el.wrapper.getBoundingClientRect();
    const footerH = footer ? footer.offsetHeight : 0;
    // Account for main's bottom padding/margin so page doesn't overflow
    const cs = main ? getComputedStyle(main) : null;
    const mainPB = cs ? parseFloat(cs.paddingBottom || '0') : 0;
    const mainMB = cs ? parseFloat(cs.marginBottom || '0') : 0;
    // Small safety allowance
    const allowance = 12;
    const available = Math.max(200, Math.floor(window.innerHeight - rect.top - footerH - mainPB - mainMB - allowance));
    document.documentElement.style.setProperty('--player-max-h', `${available}px`);
  };
  // Run on load and resize
  window.addEventListener('resize', setPlayerMaxHeight);
  window.addEventListener('orientationchange', setPlayerMaxHeight);
  window.addEventListener('DOMContentLoaded', setPlayerMaxHeight);
  window.addEventListener('load', setPlayerMaxHeight);
  // Also run soon after scripts load (in case DOMContentLoaded already fired)
  setTimeout(setPlayerMaxHeight, 0);
})();
