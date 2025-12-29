(function(){
  const el = {
    wrapper: document.getElementById('playerWrapper'),
    video: document.getElementById('video'),
    sourceInput: document.getElementById('sourceInput'),
    btnPlayUrl: document.getElementById('btnPlayUrl'),
    fileInput: document.getElementById('fileInput'),
    infoOverlay: document.getElementById('infoOverlay'),
    infoText: document.getElementById('infoText'),
    infoCode: document.getElementById('infoCode')
  };

  const isHls = (url) => /\.m3u8($|\?)/i.test(url);
  let hls = null;
  const cleanupHls = () => { if (hls) { try { hls.destroy(); } catch {} hls = null; } };

  const hideInfo = () => {
    if (el.infoOverlay) {
      el.infoOverlay.hidden = true;
      if (el.infoText) el.infoText.textContent = '';
      if (el.infoCode) el.infoCode.textContent = '';
    }
  };

  const showInfo = (text, code) => {
    if (!el.infoOverlay) return;
    if (el.infoText) el.infoText.textContent = text || 'Playback error';
    if (el.infoCode) el.infoCode.textContent = code ? `Code: ${code}` : '';
    el.infoOverlay.hidden = false;
  };

  const loadUrl = (url) => {
    if (!url) return;
    cleanupHls();
    hideInfo();
    if (isHls(url)) {
      // Prefer HLS.js when supported; fallback to native if available
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.attachMedia(el.video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url));
        // Basic HLS error surfacing
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data?.fatal) {
            showInfo('HLS playback error', `ERR-HLS-${data.type || 'FATAL'}`);
          }
        });
      } else if (el.video.canPlayType && el.video.canPlayType('application/vnd.apple.mpegURL')) {
        el.video.src = url; // Safari/iOS native HLS
      } else {
        showInfo('Unsupported HLS content', 'ERR-HLS-UNSUPPORTED');
        return;
      }
    } else {
      el.video.src = url;
    }
    el.video.load();
    el.video.play().catch(()=>{});
  };

  const loadFile = (file) => {
    if (!file) return;
    cleanupHls();
    hideInfo();
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

  // Enter key in URL input triggers playback
  el.sourceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = (el.sourceInput.value || '').trim();
      if (url) {
        e.preventDefault();
        loadUrl(url);
      }
    }
  });

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

  // Media error overlay for unsupported content
  el.video.addEventListener('error', () => {
    const code = el.video.error?.code;
    // Map standard HTMLMediaElement error codes
    const messages = {
      1: 'Playback aborted by user',
      2: 'Network error during download',
      3: 'Decoding error: media corrupt or unsupported codec',
      4: 'Source not supported by this browser'
    };
    const msg = messages[code] || 'Unknown media error';
    showInfo(msg, `ERR-MEDIA-${code || 'UNKNOWN'}`);
  });

  // Keyboard shortcuts: F (fullscreen), Space (play/pause)
  const isTypingElement = (target) => {
    const t = target && target.tagName ? target.tagName.toLowerCase() : '';
    const editable = target && (target.isContentEditable || target.getAttribute?.('contenteditable') === 'true');
    return t === 'input' || t === 'textarea' || editable;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(()=>{});
    } else if (el.wrapper && el.wrapper.requestFullscreen) {
      el.wrapper.requestFullscreen().catch(()=>{});
    } else if (el.video && el.video.requestFullscreen) {
      el.video.requestFullscreen().catch(()=>{});
    }
  };

  const togglePlayPause = () => {
    if (!el.video) return;
    if (el.video.paused) {
      el.video.play().catch(()=>{});
    } else {
      el.video.pause();
    }
  };

  document.addEventListener('keydown', (e) => {
    // Ignore when typing in inputs/textareas/contenteditable
    if (isTypingElement(e.target)) return;
    // Ignore with modifiers to avoid conflicts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();
    if (key === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (key === ' ' || key === 'spacebar' || e.code === 'Space') {
      // Some browsers use different values for space
      e.preventDefault();
      togglePlayPause();
    }
  });
})();
