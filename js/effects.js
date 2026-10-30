/**
 * COS 106 - Web Technologies: Effects & Interaction Engine
 * Features:
 * 1. ThemeEngine: Dual Light (Ice/Steel #F1F6F9) & Dark (Obsidian #0B0F17) with persistence
 * 2. ClickSpark: Canvas particle physics (radiating ray vectors on click)
 * 3. UpwardParticles: Ambient dust/stardust canvas floating smoothly upward at 60fps
 * 4. InteractiveGrid: Interactive geometric matrix with hover illumination and click ripple wave
 * 5. LiquidNavbar: iOS frosted-glass morph on scroll
 * 6. RoleRotator: Typewriter hero headline
 * 7. AudioNotePlayer: Tactile audio pill with dancing equalizer bars
 * 8. MobileDrawer: Mobile drawer overlay navigation
 */

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initAll() {
  try { initThemeEngine(); } catch (e) { console.error('Theme engine error:', e); }
  try { initClickSpark(); } catch (e) { console.error('ClickSpark error:', e); }
  try { initUpwardParticles(); } catch (e) { console.error('Particles error:', e); }
  try { initInteractiveGrid(); } catch (e) { console.error('Grid error:', e); }
  try { initLiquidNavbar(); } catch (e) { console.error('Navbar error:', e); }
  try { initRoleRotator(); } catch (e) { console.error('Role rotator error:', e); }
  try { initAudioPlayer(); } catch (e) { console.error('Audio player error:', e); }
  try { initMobileDrawer(); } catch (e) { console.error('Drawer error:', e); }
  try { initPagePrefetch(); } catch (e) { console.error('Prefetch error:', e); }
  try { initProjectFilters(); } catch (e) { console.error('Project filters error:', e); }
  try { initProjectCodeModal(); } catch (e) { console.error('Project modal error:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/* ==========================================================================
   1. THEME ENGINE (Dual Light / Dark with Persistence)
   ========================================================================== */
function initThemeEngine() {
  const STORAGE_KEY = 'elisha_portfolio_theme';
  const html = document.documentElement;

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  } catch (e) {
    savedTheme = 'light';
  }
  applyTheme(savedTheme);

  let isTransitioning = false;

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn, .floating-theme-switch');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isTransitioning) return;

      const current = html.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'light' ? 'dark' : 'light';
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Fallback for browsers without View Transitions or if reduced motion is requested
      if (!document.startViewTransition || reduceMotion) {
        applyTheme(nextTheme);
        try { localStorage.setItem(STORAGE_KEY, nextTheme); } catch (err) {}
        return;
      }

      isTransitioning = true;

      // Origin coordinates for expanding circular mask
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX && e.clientX > 0) ? e.clientX : rect.left + rect.width / 2;
      const y = (e.clientY && e.clientY > 0) ? e.clientY : rect.top + rect.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Suppress individual element transitions so the snapshot captures the full new theme state instantly
      html.classList.add('theme-transitioning');

      const transition = document.startViewTransition(() => {
        applyTheme(nextTheme);
        try { localStorage.setItem(STORAGE_KEY, nextTheme); } catch (err) {}
        void html.offsetWidth;
      });

      try {
        await transition.ready;
        const animation = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 550,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)'
          }
        );
        await animation.finished;
      } catch (err) {
        // Animation finished or was superseded
      } finally {
        html.classList.remove('theme-transitioning');
        isTransitioning = false;
      }
    });
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    updateToggleIcons(theme);
    if (typeof window._redrawCanvases === 'function') {
      window._redrawCanvases();
    }
  }

  function updateToggleIcons(theme) {
    const allBtns = document.querySelectorAll('.theme-toggle-btn, .floating-theme-switch');
    allBtns.forEach(btn => {
      const sun = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      const label = btn.querySelector('.theme-label');
      if (sun && moon) {
        if (theme === 'dark') {
          sun.style.display = 'block';
          moon.style.display = 'none';
        } else {
          sun.style.display = 'none';
          moon.style.display = 'block';
        }
      }
      if (label) {
        label.textContent = theme === 'dark' ? 'Dark' : 'Light';
      }
    });
  }
}

/* ==========================================================================
   2. CLICK SPARK CANVAS ANIMATION (Particle Vector Ray Engine)
   ========================================================================== */
function initClickSpark() {
  // Prevent duplicate canvases
  if (document.getElementById('clickSparkCanvas')) return;
  if (prefersReducedMotion()) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'clickSparkCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;display:block;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = Math.ceil(window.innerWidth * dpr);
    canvas.height = Math.ceil(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const duration = 400; // ms (crisp, tactile particle animation duration)
  const sparkRadius = 24; // px
  const sparkSize = 12; // px
  const sparkWidth = 2; // px
  let bursts = [];
  let rafId = null;

  function spawn(clientX, clientY) {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 6 : 8;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const color = isDark ? '#93C5FD' : '#212A3E';

    const sparks = Array.from({ length: count }, (_, i) => ({
      angle: (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.15,
      scale: 0.85 + Math.random() * 0.3,
      speed: 0.9 + Math.random() * 0.2,
      color: color
    }));

    bursts.push({
      x: clientX,
      y: clientY,
      start: performance.now(),
      sparks
    });

    if (!rafId) {
      rafId = requestAnimationFrame(render);
    }
  }

  // Pointerdown fires with zero latency on mouse click or touchscreen tap
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    spawn(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      bursts = [];
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  });

  function render(now) {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (bursts.length === 0) {
      rafId = null;
      return;
    }

    bursts = bursts.filter(burst => {
      const elapsed = now - burst.start;
      if (elapsed >= duration) return false;

      const p = elapsed / duration;
      // Quadratic polynomial ease-out: p * (2 - p)
      const ease = p * (2 - p);
      const distance = sparkRadius * ease;
      const length = sparkSize * (1 - ease);
      const fade = Math.max(0, 1 - Math.pow(p, 1.4));

      for (const spark of burst.sparks) {
        const d = distance * spark.speed;
        const l = Math.max(0.1, length * spark.scale);

        const x1 = burst.x + d * Math.cos(spark.angle);
        const y1 = burst.y + d * Math.sin(spark.angle);
        const x2 = burst.x + (d + l) * Math.cos(spark.angle);
        const y2 = burst.y + (d + l) * Math.sin(spark.angle);

        ctx.strokeStyle = spark.color;
        ctx.lineCap = 'round';
        ctx.globalAlpha = fade;
        ctx.lineWidth = sparkWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      return true;
    });

    if (bursts.length > 0) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }
}

/* ==========================================================================
   3. UPWARD FLOWING PARTICLES CANVAS (Ambient Particle Drift Engine)
   ========================================================================== */
function initUpwardParticles() {
  if (document.getElementById('upwardParticlesCanvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'upwardParticlesCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2;display:block;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 30 : 65;
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.4,
      vy: -(Math.random() * 0.45 + 0.3), // Float upwards
      vx: (Math.random() - 0.5) * 0.15,  // Gentle horizontal sway
      baseAlpha: Math.random() * 0.35 + 0.2,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      pulseAngle: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.3 ? 'primary' : 'star'
    });
  }

  function drawParticlesFrame() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const alphaPulse = Math.sin(p.pulseAngle) * 0.15;
      const currentAlpha = Math.max(0.08, Math.min(1, p.baseAlpha + alphaPulse));

      if (isDark) {
        ctx.fillStyle = p.tint === 'star' ? '#FFFFFF' : '#93C5FD';
        ctx.globalAlpha = Math.min(0.85, currentAlpha * 1.3);
      } else {
        ctx.fillStyle = '#394867';
        ctx.globalAlpha = Math.min(0.4, currentAlpha * 0.7);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  window._redrawCanvases = drawParticlesFrame;
  if (prefersReducedMotion()) { drawParticlesFrame(); return; }

  let rafId = null;

  function animate() {
    if (document.hidden) return;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.pulseAngle) * 0.08;
      p.pulseAngle += p.pulseSpeed;

      // Wrap around top to bottom
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    }

    drawParticlesFrame();
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    }
  });
}

/* ==========================================================================
   4. INTERACTIVE GEOMETRIC MATRIX GRID
   ========================================================================== */
function initInteractiveGrid() {
  const containers = document.querySelectorAll('.interactive-grid-container');
  if (!containers.length) return;

  const cellSize = 60;
  const isMobile = window.innerWidth < 768;

  containers.forEach(container => {
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width || window.innerWidth;
    const containerHeight = rect.height || 850;

    const cols = Math.ceil(containerWidth / cellSize) + 2;
    const rows = isMobile ? 12 : Math.max(16, Math.ceil(containerHeight / cellSize) + 2);

    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'interactive-grid-matrix';
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    grid.style.width = `${cols * cellSize}px`;
    grid.style.height = `${rows * cellSize}px`;

    const totalCells = cols * rows;
    const frag = document.createDocumentFragment();
    const cells = new Array(totalCells);

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-matrix-cell';
      cells[i] = cell;
      frag.appendChild(cell);
    }

    grid.appendChild(frag);
    container.appendChild(grid);

    // High-performance batched ripple wave (Zero lag, zero reflow, passive listener)
    let rippleBusy = false;
    function triggerRipple(clientX, clientY) {
      if (rippleBusy) return;
      rippleBusy = true;

      const gridRect = grid.getBoundingClientRect();
      const clickX = clientX - gridRect.left;
      const clickY = clientY - gridRect.top;
      const centerCol = Math.floor(clickX / cellSize);
      const centerRow = Math.floor(clickY / cellSize);

      const maxRadius = isMobile ? 8 : 12;
      const minR = Math.max(0, centerRow - maxRadius);
      const maxR = Math.min(rows - 1, centerRow + maxRadius);
      const minC = Math.max(0, centerCol - maxRadius);
      const maxC = Math.min(cols - 1, centerCol + maxRadius);

      const affected = [];

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const dist = Math.hypot(centerRow - r, centerCol - c);
          if (dist <= maxRadius) {
            const idx = r * cols + c;
            const cell = cells[idx];
            if (cell) {
              const delay = Math.round(dist * 45);
              const duration = Math.round(260 + dist * 50);
              affected.push({ cell, delay, duration });
            }
          }
        }
      }

      // Batch DOM class and property application in requestAnimationFrame
      requestAnimationFrame(() => {
        affected.forEach(({ cell, delay, duration }) => {
          cell.style.setProperty('--delay', `${delay}ms`);
          cell.style.setProperty('--duration', `${duration}ms`);
          cell.classList.remove('animate-cell-ripple');
        });

        requestAnimationFrame(() => {
          affected.forEach(({ cell }) => {
            cell.classList.add('animate-cell-ripple');
            cell.addEventListener('animationend', () => {
              cell.classList.remove('animate-cell-ripple');
            }, { once: true });
          });
        });
      });

      // Release debounce lock after wave initiates
      setTimeout(() => {
        rippleBusy = false;
      }, 100);
    }

    // Passive listener: bubbles freely to window for ClickSpark.
    // AbortController removes the previous listener when the grid is rebuilt.
    if (container._gridAbort) container._gridAbort.abort();
    const ac = new AbortController();
    container._gridAbort = ac;
    container.addEventListener('pointerdown', (e) => {
      if (prefersReducedMotion()) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      triggerRipple(e.clientX, e.clientY);
    }, { passive: true, signal: ac.signal });
  });

  if (!window._gridResizeBound) {
    window._gridResizeBound = true;
    let resizeTimer = null;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Mobile URL-bar show/hide changes only the height: skip the rebuild
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        initInteractiveGrid();
      }, 250);
    }, { passive: true });
  }
}

/* ==========================================================================
   5. SCROLL-MORPHING iOS LIQUID NAVBAR
   ========================================================================== */
function initLiquidNavbar() {
  const navShell = document.querySelector('.nav-shell');
  if (!navShell) return;

  let ticking = false;
  let isScrolled = false;

  function updateNav() {
    const y = window.scrollY || window.pageYOffset || 0;
    if (!isScrolled && y > 45) {
      isScrolled = true;
      navShell.classList.add('scrolled-liquid');
    } else if (isScrolled && y < 15) {
      isScrolled = false;
      navShell.classList.remove('scrolled-liquid');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  updateNav();
}

/* ==========================================================================
   6. TYPEWRITER HERO ROLE ROTATOR
   ========================================================================== */
function initRoleRotator() {
  const target = document.getElementById('roleRotator');
  if (!target || prefersReducedMotion()) return;

  const roles = [
    'Cybersecurity Undergraduate',
    'SOC & Defense Analyst',
    'Problem Solver & Systems Builder',
    'Python & Web Technologies Developer'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 90;

  function type() {
    if (document.hidden) {
      setTimeout(type, 1000);
      return;
    }

    const current = roles[roleIdx];
    
    if (isDeleting) {
      target.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      delay = 40;
    } else {
      target.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      delay = 85;
    }

    if (!isDeleting && charIdx === current.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ==========================================================================
   7. CUSTOM AUDIO NOTE PLAYER
   ========================================================================== */
function initAudioPlayer() {
  const audio = document.getElementById('welcomeAudio');
  const playBtn = document.getElementById('audioPlayBtn');
  const pill = document.querySelector('.audio-pill');
  const bars = document.querySelectorAll('.eq-bar');
  const playIcon = document.getElementById('audioPlayIcon');
  const pauseIcon = document.getElementById('audioPauseIcon');
  const statusText = document.getElementById('audioStatusText');

  if (!audio) return;

  const AUDIO_URL = 'assets/pdoom.mp3';
  const CACHE_NAME = 'elisha-audio-cache-v1';
  let isPlaying = false;
  let isCached = false;
  let isCaching = false;

  // Check persistent CacheStorage on load (non-blocking, zero network transfer)
  async function checkCacheOnLoad() {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(AUDIO_URL);
      if (match) {
        const blob = await match.blob();
        audio.src = URL.createObjectURL(blob);
        isCached = true;
        if (statusText && !isPlaying) {
          statusText.innerHTML = 'p(doom) Ready &bull; Offline Cached';
        }
      }
    } catch (err) {
      console.warn('Cache check notice:', err);
    }
  }

  checkCacheOnLoad();

  // Background caching: downloads in small background stream once and saves permanently
  async function cacheAudioInBackground() {
    if (!('caches' in window) || isCached || isCaching) return;
    isCaching = true;
    try {
      const res = await fetch(AUDIO_URL);
      if (res.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(AUDIO_URL, res.clone());
        isCached = true;
        const blob = await res.blob();
        if (audio.paused && !isPlaying) {
          audio.src = URL.createObjectURL(blob);
          if (statusText) statusText.innerHTML = 'p(doom) Ready &bull; Cached (0 KB net)';
        }
      }
    } catch (e) {
      console.warn('Background caching note:', e);
    } finally {
      isCaching = false;
    }
  }

  function setPlayingUI() {
    isPlaying = true;
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (statusText) {
      statusText.textContent = isCached ? 'Playing p(doom) • Local Cache' : 'Playing p(doom) • Streaming...';
    }
    bars.forEach(b => b.classList.add('animating'));
  }

  function setPausedUI() {
    isPlaying = false;
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (statusText) {
      statusText.innerHTML = isCached ? 'p(doom) Ready &bull; Instant Play' : 'p(doom) Ready &bull; Tap to Play';
    }
    bars.forEach(b => b.classList.remove('animating'));
  }

  function setEndedUI() {
    isPlaying = false;
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (statusText) statusText.innerHTML = 'Track Finished &bull; Replay';
    bars.forEach(b => b.classList.remove('animating'));
  }

  // Progressive streaming event hooks
  audio.addEventListener('waiting', () => {
    if (statusText && isPlaying) statusText.textContent = 'Buffering chunk...';
  });

  audio.addEventListener('playing', () => {
    if (isPlaying) setPlayingUI();
  });

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      setPausedUI();
    } else {
      // If audio has not been assigned a src yet (due to preload="none"), assign it now
      if (!audio.src || audio.src === window.location.href) {
        audio.src = AUDIO_URL;
      }

      if (statusText && !isCached) {
        statusText.textContent = 'Buffering stream...';
      }

      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          setPlayingUI();
          cacheAudioInBackground();
        }).catch(err => {
          console.warn('Playback notice:', err);
          audio.play().then(setPlayingUI).catch(() => {});
        });
      } else {
        setPlayingUI();
        cacheAudioInBackground();
      }
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  if (pill) {
    pill.addEventListener('click', () => {
      togglePlay();
    });
  }

  audio.addEventListener('play', setPlayingUI);
  audio.addEventListener('pause', setPausedUI);
  audio.addEventListener('ended', setEndedUI);
}

/* ==========================================================================
   8. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggle = document.querySelector('.mobile-toggle');
  const overlay = document.querySelector('.mobile-nav-overlay');

  if (!toggle || !overlay) return;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });

  toggle.addEventListener('click', () => {
    const isOpen = overlay.classList.toggle('active');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  const links = overlay.querySelectorAll('.mobile-nav-link');
  links.forEach(l => {
    l.addEventListener('click', () => {
      overlay.classList.remove('active');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================================================
   9. INTELLIGENT SPECULATIVE PAGE PREFETCHER (Instant Navigation)
   ========================================================================== */
function initPagePrefetch() {
  const pages = ['index.html', 'about.html', 'projects.html', 'planner.html', 'contact.html'];
  const prefetched = new Set();

  function prefetchUrl(url) {
    if (prefetched.has(url)) return;
    if (navigator.connection && navigator.connection.saveData) return;
    prefetched.add(url);

    // 1. Speculative Link Tag
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    } catch (_) {}

  }

  // A. Idle-time background preload of all site pages
  const idleWarmup = () => {
    pages.forEach(p => {
      if (!window.location.pathname.endsWith(p)) {
        prefetchUrl(p);
      }
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(idleWarmup, { timeout: 1500 });
  } else {
    setTimeout(idleWarmup, 800);
  }

  // B. Immediate hover/touch prefetch on any navigation anchor
  document.querySelectorAll('a[href$=".html"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      a.addEventListener('pointerenter', () => prefetchUrl(href), { passive: true, once: true });
      a.addEventListener('touchstart', () => prefetchUrl(href), { passive: true, once: true });
    }
  });
}

/* ==========================================================================
   10. PROJECT CATEGORY FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBar = document.querySelector('.projects-filter-bar');
  if (!filterBar) return;

  const tabs = filterBar.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');
  const setPressed = () => tabs.forEach(t => t.setAttribute('aria-pressed', String(t.classList.contains('active'))));
  setPressed();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCategory = tab.getAttribute('data-filter');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      setPressed();

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCat === targetCategory) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   11. PROJECT CODE INSPECTOR MODAL
   ========================================================================== */
function initProjectCodeModal() {
  const modal = document.getElementById('projectCodeModal');
  if (!modal) return;

  const titleEl = document.getElementById('modalProjectTitle');
  const subtitleEl = document.getElementById('modalProjectSubtitle');
  const abstractEl = document.getElementById('modalProjectAbstract');
  const codeEl = document.getElementById('modalProjectCode');
  const closeBtn = document.getElementById('closeCodeModalBtn');
  const copyBtn = document.getElementById('copyCodeBtn');

  const PROJECTS_CODE_DATA = {
    soc: {
      title: "SOC Incident & Network Threat Analyzer",
      subtitle: "CYB 101 • Python 3 Defensive Telemetry Simulation",
      abstract: "A defensive cybersecurity simulation engine modeling SOC intrusion detection, automated malicious IP filtering, and structured incident logging for enterprise networks.",
      code: `# Network Intrusion Detection & Telemetry Simulation
# Adebayo Elisha (Matric: 2025/C/CYB/1089)

import datetime

MALICIOUS_SIGNATURES = {
    "192.168.1.105": "SYN Flood Denial-of-Service",
    "10.0.0.84": "SSH Brute-Force Authentication Attempt",
    "172.16.4.22": "Port Scan / Reconnaissance Probe"
}

def analyze_packet(source_ip, destination_port, payload_len):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if source_ip in MALICIOUS_SIGNATURES:
        threat = MALICIOUS_SIGNATURES[source_ip]
        return {
            "status": "ALERT",
            "action": "DROP_PACKET",
            "threat": threat,
            "log": f"[{timestamp}] ALERT: Dropped packet from {source_ip}:{destination_port} -> {threat}"
        }
    return {
        "status": "ALLOW",
        "action": "FORWARD",
        "threat": "Clean",
        "log": f"[{timestamp}] ALLOW: {source_ip}:{destination_port} ({payload_len} bytes)"
    }

# Test Packet Stream Verification
packets = [
    ("192.168.1.105", 80, 512),
    ("192.168.1.20", 443, 1024),
    ("10.0.0.84", 22, 64)
]

for ip, port, size in packets:
    result = analyze_packet(ip, port, size)
    print(result["log"])`
    },
    triangle: {
      title: "Right-Angled Triangle Angle Classifier & Invariant Verifier",
      subtitle: "COS 102 • C99 Euclidean Geometric Invariant Proofs",
      abstract: "A robust C program validating Euclidean triangle invariants, defending against floating-point precision loss, and verifying right-angle properties using epsilon tolerance.",
      code: `/**
 * ============================================================================
 * COURSE: COS 102 - Problem Solving (May Cohort 2026)
 * INSTITUTION: MIVA Open University
 * STUDENT: Adebayo Elisha
 * MATRICULATION NO: 2025/C/CYB/1089
 * DEPARTMENT: Cybersecurity
 * 
 * LAB ASSESSMENT 1 - QUESTION 1
 * Problem Statement:
 * Write a C program to input two angles of a triangle and check whether the 
 * triangle is a right-angled triangle or not.
 * ============================================================================
 */

#include <stdio.h>
#include <math.h>

int main(void) {
    double angle1 = 0.0, angle2 = 0.0, angle3 = 0.0;

    printf("COS 102: Right-Angled Triangle Angle Checker\\n");
    printf("Enter first angle (in degrees): ");
    if (scanf("%lf", &angle1) != 1) {
        printf("[ERROR]: Invalid input! Please enter a numerical value.\\n");
        return 1;
    }

    printf("Enter second angle (in degrees): ");
    if (scanf("%lf", &angle2) != 1) {
        printf("[ERROR]: Invalid input! Please enter a numerical value.\\n");
        return 1;
    }

    /* Input Validation / Geometric Invariant Checks */
    if (angle1 <= 0.0 || angle2 <= 0.0) {
        printf("[ERROR]: Angles must be strictly greater than 0 degrees.\\n");
        return 1;
    }
    if ((angle1 + angle2) >= 180.0) {
        printf("[ERROR]: The sum of two angles must be strictly less than 180 degrees.\\n");
        return 1;
    }

    /* Compute third angle via Euclidean triangle postulate */
    angle3 = 180.0 - (angle1 + angle2);
    printf("Calculated Third Angle: %.2f deg\\n", angle3);

    /* Verify 90-degree right angle orientation with float tolerance */
    if (fabs(angle1 - 90.0) < 1e-6 || 
        fabs(angle2 - 90.0) < 1e-6 || 
        fabs(angle3 - 90.0) < 1e-6) {
        printf("RESULT: YES, the triangle is a RIGHT-ANGLED triangle.\\n");
    } else {
        printf("RESULT: NO, the triangle is NOT a right-angled triangle.\\n");
    }

    return 0;
}`
    },
    palindrome: {
      title: "Mathematical Palindrome Verifier & 64-bit Reversal Engine",
      subtitle: "COS 102 • C99 Pure Integer Modulo Arithmetic Reversal",
      abstract: "A low-level C algorithm reversing 64-bit integers via modulo 10 extraction and integer division without string conversion shortcuts, equipped with overflow protection guards.",
      code: `/**
 * ============================================================================
 * COURSE: COS 102 - Problem Solving (May Cohort 2026)
 * INSTITUTION: MIVA Open University
 * STUDENT: Adebayo Elisha
 * MATRICULATION NO: 2025/C/CYB/1089
 * DEPARTMENT: Cybersecurity
 * 
 * LAB ASSESSMENT 1 - QUESTION 2
 * Problem Statement:
 * Write a C program to find whether a given number is Palindrome or Not.
 * ============================================================================
 */

#include <stdio.h>
#include <limits.h>

int main(void) {
    long long number = 0, temp = 0, reversed_number = 0;

    printf("COS 102: Palindrome Number Checker\\n");
    printf("Enter an integer to check: ");
    if (scanf("%lld", &number) != 1) {
        printf("[ERROR]: Invalid integer input!\\n");
        return 1;
    }

    /* Negative numbers cannot be palindromes due to leading sign asymmetry */
    if (number < 0) {
        printf("RESULT: %lld is NOT a Palindrome number.\\n", number);
        return 0;
    }

    /* Single-digit fast path */
    if (number >= 0 && number <= 9) {
        printf("RESULT: YES! %lld is a Palindrome number.\\n", number);
        return 0;
    }

    /* Pure arithmetic digit extraction loop */
    temp = number;
    reversed_number = 0;

    while (temp > 0) {
        int remainder = temp % 10;

        /* 64-bit overflow prevention guard */
        if (reversed_number > (LLONG_MAX - remainder) / 10) {
            printf("[ERROR]: Integer overflow encountered.\\n");
            return 1;
        }

        reversed_number = (reversed_number * 10) + remainder;
        temp /= 10;
    }

    printf("Original: %lld | Reversed: %lld\\n", number, reversed_number);
    if (number == reversed_number) {
        printf("RESULT: YES! %lld is a PALINDROME number.\\n", number);
    } else {
        printf("RESULT: NO! %lld is NOT a palindrome number.\\n", number);
    }

    return 0;
}`
    },
    covid: {
      title: "COVID-19 Epidemiological Telemetry Engine",
      subtitle: "COS 102 • Exercise 1.5.2: Dictionary Manipulation & Pruning",
      abstract: "A public health data modeling system tracking confirmed cases across Sub-Saharan African nations with dynamic key pruning, dictionary insertions, and cohort size tracking.",
      code: `# COS 102: Computer Programming Lab - Exercise 1.5.2
# Sub-Saharan Africa COVID-19 Telemetry & Dictionary Manipulation
# Student: Adebayo Elisha

# Task 1: Initialize confirmed COVID-19 case counts across African nations
COVID_19 = {
    "Burundi": 694,
    "Ethiopia": 113295,
    "Ghana": 52198,
    "Kenya": 88380,
    "Nigeria": 68937,
    "Rwanda": 6129,
    "Somalia": 4525,
    "South Sudan": 3166,
    "Sudan": 19196,
    "Uganda": 22499
}

# Task 2: Calculate number of active reporting countries
num_keys = len(COVID_19)
print(f"Total reporting nations: {num_keys}")

# Task 3: Prune Nigeria from current observation cohort
del COVID_19['Nigeria']
print("Updated cohort after pruning Nigeria:", list(COVID_19.keys()))

# Task 4: Ingest Tanzania into active dataset with recorded case count
COVID_19['Tanzania'] = 509
print(f"Ingested Tanzania: {COVID_19['Tanzania']} confirmed cases")
print(f"Active nations count: {len(COVID_19)}")`
    },
    finance: {
      title: "Computational Finance & Thermodynamics Suite",
      subtitle: "COS 102 • Exercise 1.4.1: Loan Amortization & Temperature Scales",
      abstract: "A dual-module scientific workspace calculating simple interest loan amortizations (PRT formula) alongside high-precision thermodynamic scale conversions from Celsius to Fahrenheit.",
      code: `# COS 102: Computer Programming Lab - Exercise 1.4.1
# Computational Finance & Thermodynamic Conversions
# Student: Adebayo Elisha

# Module 1: Simple Interest Loan Amortization Function
def interest(principal, rate, years):
    # Simple Interest = Principal * Rate * Time (PRT)
    # Since rate is given as a percentage, divide by 100
    return principal * (rate / 100) * years

principal_amount = 100000
annual_rate = 5
loan_years = 3

interest_owed = interest(principal_amount, annual_rate, loan_years)
print(f"The interest owed at the end of the loan term is: ₦{interest_owed:,.2f}")
# Output: ₦15,000.00


# Module 2: Thermodynamic Temperature Converter (Celsius to Fahrenheit)
def celsius_to_fahrenheit(celsius_temp):
    # Formula: Tc * 1.8 + 32
    return (celsius_temp * 1.8) + 32

test_temps = [100, 75, 120]
for tc in test_temps:
    tf = celsius_to_fahrenheit(tc)
    print(f"{tc}°C is equivalent to {tf:.1f}°F")`
    },
    grade: {
      title: "Academic Examination Cohort & Rank Analytics",
      subtitle: "COS 102 • Exercise 1.5.1: Cohort Score Rank & Sorting Engine",
      abstract: "An automated gradebook analytics processor calculating statistical distributions and sorting student examination marks into descending rank order.",
      code: `# COS 102: Computer Programming Lab - Exercise 1.5.1
# Academic Examination Cohort Analytics & Score Ranking
# Student: Adebayo Elisha

# 13 student examination scores taken from cohort assessment:
marks = [10, 15, 10, 9, 18, 16, 14, 12, 16, 13, 15, 20, 17]

print(f"Raw Examination Scores ({len(marks)} candidates):")
print(marks)

# Arrange elements of marks in descending order for ranking
marks_sorted = sorted(marks, reverse=True)

print("\\n--- COHORT RANKINGS (DESCENDING) ---")
print(marks_sorted)

# Descriptive metrics
top_score = marks_sorted[0]
lowest_score = marks_sorted[-1]
average_score = sum(marks_sorted) / len(marks_sorted)

print(f"\\nCohort Summary Metrics:")
print(f"Top Score:    {top_score} / 20")
print(f"Lowest Score: {lowest_score} / 20")
print(f"Class Mean:   {average_score:.2f} / 20")`
    }
  };

  function openModal(projectKey) {
    const data = PROJECTS_CODE_DATA[projectKey];
    if (!data) return;

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;
    abstractEl.textContent = data.abstract;
    codeEl.textContent = data.code;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.code-trigger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project');
      openModal(proj);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = codeEl.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const copyLabel = copyBtn.querySelector('.copy-label');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        copyBtn.style.borderColor = 'var(--text-accent)';
        copyBtn.style.color = 'var(--text-accent)';
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy Code';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  }
}

