(() => {
  const modal = document.querySelector('[data-video-modal]');
  if (!modal) return;

  const dialog = modal.querySelector('[role="dialog"]');
  const frameHost = modal.querySelector('[data-video-player]');
  const closeButton = modal.querySelector('button[data-video-close]');
  const toggleButton = modal.querySelector('[data-video-toggle]');
  const muteButton = modal.querySelector('[data-video-mute]');
  const fullscreenButton = modal.querySelector('[data-video-fullscreen]');
  const seek = modal.querySelector('[data-video-seek]');
  const time = modal.querySelector('[data-video-time]');
  const status = modal.querySelector('[data-video-status]');
  let apiPromise;
  let player;
  let ready = false;
  let seeking = false;
  let session = 0;
  let trigger;
  let progressTimer;
  let readyTimer;

  // Fetch YouTube's official API only when the visitor opens the video.
  const loadAPI = () => {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const previousCallback = window.onYouTubeIframeAPIReady;
      const finish = error => {
        clearTimeout(timeout);
        script.onerror = null;
        if (window.onYouTubeIframeAPIReady === onReady) {
          window.onYouTubeIframeAPIReady = previousCallback;
        }
        if (error) {
          script.remove();
          reject(error);
        } else resolve(window.YT);
      };
      const onReady = () => {
        finish();
        if (typeof previousCallback === 'function') previousCallback();
      };
      const timeout = setTimeout(() => finish(new Error('YouTube API timeout')), 20000);
      window.onYouTubeIframeAPIReady = onReady;
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => finish(new Error('YouTube API unavailable'));
      document.head.append(script);
    }).catch(error => {
      apiPromise = null;
      throw error;
    });
    return apiPromise;
  };

  const formatTime = value => {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const updateControls = () => {
    if (!ready || !player) return;
    const state = player.getPlayerState();
    const playing = state === window.YT.PlayerState.PLAYING || state === window.YT.PlayerState.BUFFERING;
    toggleButton.textContent = playing ? 'Jeda' : state === window.YT.PlayerState.ENDED ? 'Putar ulang' : 'Putar';
    const muted = player.isMuted();
    muteButton.textContent = muted ? 'Aktifkan suara' : 'Bisukan';
    muteButton.setAttribute('aria-pressed', String(muted));
    const duration = player.getDuration() || 0;
    const current = player.getCurrentTime() || 0;
    seek.max = String(Math.floor(duration));
    seek.disabled = duration <= 0;
    if (!seeking) seek.value = String(Math.floor(current));
    const shown = seeking ? Number(seek.value) : current;
    time.textContent = `${formatTime(shown)} / ${formatTime(duration)}`;
    seek.setAttribute('aria-valuetext', `${formatTime(shown)} dari ${formatTime(duration)}`);
  };

  const stopPlayer = () => {
    ready = false;
    seeking = false;
    clearInterval(progressTimer);
    clearTimeout(readyTimer);
    if (player) player.destroy();
    player = null;
    frameHost.replaceChildren();
    toggleButton.disabled = muteButton.disabled = seek.disabled = true;
  };

  const close = () => {
    if (modal.hidden) return;
    session += 1; // Ignore late API callbacks after closing or reopening.
    if (document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
    stopPlayer();
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('video-modal-open');
    trigger?.focus();
  };

  const open = async button => {
    if (!modal.hidden) return;
    trigger = button;
    const currentSession = ++session;
    const isCurrent = () => currentSession === session && !modal.hidden;
    const fail = () => {
      if (!isCurrent()) return;
      session += 1;
      stopPlayer();
      status.textContent = 'Video belum dapat dimuat. Silakan buka melalui tautan YouTube di atas.';
    };
    toggleButton.textContent = 'Putar';
    muteButton.textContent = 'Bisukan';
    muteButton.setAttribute('aria-pressed', 'false');
    seek.value = seek.max = '0';
    seek.removeAttribute('aria-valuetext');
    time.textContent = '0:00 / 0:00';
    status.textContent = 'Memuat video…';
    modal.hidden = false;
    document.body.classList.add('video-modal-open');
    requestAnimationFrame(() => { if (!modal.hidden) modal.classList.add('is-open'); });
    closeButton.focus();

    try {
      const YT = await loadAPI();
      if (!isCurrent()) return;
      const iframe = document.createElement('iframe');
      const url = new URL('https://www.youtube-nocookie.com/embed/Nn3U1dr3FuY');
      // Supported controls=0 removes native playback controls from the picture.
      // Controls below the frame use the IFrame API; no overlays cover the video.
      url.search = new URLSearchParams({
        autoplay: '1', controls: '0', enablejsapi: '1', playsinline: '1',
        rel: '0', origin: window.location.origin
      }).toString();
      iframe.src = url.href;
      iframe.title = 'Video profil Nordy Sukmana';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      frameHost.replaceChildren(iframe);
      readyTimer = setTimeout(fail, 20000);
      player = new YT.Player(iframe, {
        events: {
          onReady: () => {
            if (!isCurrent()) return;
            clearTimeout(readyTimer);
            ready = true;
            toggleButton.disabled = muteButton.disabled = false;
            status.textContent = 'Gunakan kontrol di bawah video. Tekan Putar jika video belum dimulai.';
            updateControls();
            progressTimer = setInterval(updateControls, 500);
          },
          onStateChange: event => {
            if (!isCurrent() || !ready) return;
            updateControls();
            if (event.data === YT.PlayerState.PLAYING) status.textContent = 'Video sedang diputar.';
            if (event.data === YT.PlayerState.PAUSED) status.textContent = 'Video dijeda.';
            if (event.data === YT.PlayerState.ENDED) status.textContent = 'Video selesai. Anda dapat memutarnya kembali.';
            if (event.data === YT.PlayerState.BUFFERING) status.textContent = 'Menyiapkan video…';
          },
          onAutoplayBlocked: () => {
            if (!isCurrent()) return;
            updateControls();
            status.textContent = 'Tekan Putar di bawah untuk memulai video.';
          },
          onError: fail
        }
      });
    } catch {
      fail();
    }
  };

  toggleButton.addEventListener('click', () => {
    if (!ready) return;
    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING || state === window.YT.PlayerState.BUFFERING) player.pauseVideo();
    else player.playVideo();
  });
  muteButton.addEventListener('click', () => {
    if (!ready) return;
    if (player.isMuted()) player.unMute();
    else player.mute();
    updateControls();
  });
  seek.addEventListener('input', () => { seeking = true; updateControls(); });
  seek.addEventListener('change', () => {
    if (ready) player.seekTo(Number(seek.value), true);
    seeking = false;
  });
  seek.addEventListener('blur', () => { seeking = false; });

  fullscreenButton.hidden = !document.fullscreenEnabled || !dialog.requestFullscreen;
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === dialog) await document.exitFullscreen();
      else await dialog.requestFullscreen();
    } catch {
      status.textContent = 'Layar penuh tidak tersedia pada browser ini.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.textContent = document.fullscreenElement === dialog ? 'Keluar layar penuh' : 'Layar penuh';
  });

  document.querySelectorAll('[data-video-open]').forEach(button => button.addEventListener('click', () => open(button)));
  modal.querySelectorAll('[data-video-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), iframe')]
      .filter(element => !element.hidden && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
