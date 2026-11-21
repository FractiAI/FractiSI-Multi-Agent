/**
 * FractiSI · Holographic Skin initiation navigator.
 * Top bar: grand-story orientation + slim linear red indicator + small flag marker
 * (inside Soft Story vs drifting out). No dual-panel rhyme tracks.
 */
(function () {
  const host = document.currentScript;
  const current = (host && host.getAttribute('data-current')) || 'demo';
  const base = (host && host.getAttribute('data-base')) || 'sing13';
  const STORAGE_KEY = 'fractisi-hl-rhyme-track';

  const paths =
    base === 'fractisi'
      ? {
          demo: '/product/holographic-skin-demonstration/',
          living: '/product/holographic-skin-demonstration/living/',
          create: '/product/holographic-skin-demonstration/create/',
          createLive: 'https://www.ssvibelandiaquestfest24x365.com/fractisi/holographic-skin-create',
        }
      : {
          demo: '/fractisi/holographic-skin-demonstration',
          living: '/fractisi/holographic-living',
          create: '/fractisi/holographic-skin-create',
        };

  const stops =
    base === 'fractisi'
      ? [
          { id: 'demo', href: paths.demo, label: 'Demonstration' },
          { id: 'living', href: paths.living, label: 'Living menu' },
          { id: 'create', href: paths.create, label: 'Create' },
        ]
      : [
          { id: 'demo', href: paths.demo, label: 'Demonstration' },
          { id: 'living', href: paths.living, label: 'Living menu' },
          { id: 'create', href: paths.create, label: 'Create' },
        ];

  const nextMap = {
    demo: { id: 'living', label: 'Enter the Living menu' },
    living: { id: 'create', label: 'Compose a skin on Create' },
    create: { id: 'demo', label: 'Return to the Demonstration' },
  };
  const next = nextMap[current] || nextMap.demo;
  const nextStop = stops.find((s) => s.id === next.id) || stops[0];

  function readTrack() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'linear' || v === 'holographic') return v;
    } catch (_) {
      /* ignore */
    }
    return 'holographic';
  }

  function writeTrack(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {
      /* ignore */
    }
  }

  /** Shared painter so Create skins can reuse the same bar + flag. */
  function paintStatusChrome(barEl, flagEl, trackId) {
    const linear = trackId === 'linear';
    document.documentElement.dataset.hlTrack = trackId;
    barEl.dataset.track = trackId;
    flagEl.dataset.track = trackId;

    barEl.innerHTML = linear
      ? `<span class="hl-status-bar__dot" title="Linear mode" aria-hidden="true"></span>
         <span class="hl-status-bar__label">Linear mode · outside the Soft Story</span>
         <span class="hl-status-bar__story">Hero’s Return · FractiSI Multi-Agent</span>`
      : `<span class="hl-status-bar__spacer" aria-hidden="true"></span>
         <span class="hl-status-bar__label hl-status-bar__label--quiet">Inside Soft Story</span>
         <span class="hl-status-bar__story">Hero’s Return · FractiSI Multi-Agent</span>`;

    barEl.setAttribute(
      'aria-label',
      linear
        ? 'Status: linear mode — outside the Soft Story'
        : 'Status: inside FractiSI Soft Story',
    );

    flagEl.innerHTML = linear
      ? `<span class="hl-flag__pole" aria-hidden="true"></span><span class="hl-flag__cloth hl-flag__cloth--drift">Drift</span>`
      : `<span class="hl-flag__pole" aria-hidden="true"></span><span class="hl-flag__cloth hl-flag__cloth--in">In</span>`;
    flagEl.setAttribute(
      'aria-label',
      linear ? 'Flag: drifting out of holographic space' : 'Flag: inside the chosen holographic space',
    );
    flagEl.title = linear ? 'Drifting out' : 'Inside holographic space';
  }

  window.FractiSIHolographicStatus = {
    STORAGE_KEY,
    readTrack,
    writeTrack,
    paintStatusChrome,
    mountBarAndFlag(parent) {
      const wrap = document.createElement('div');
      wrap.className = 'hl-status-stack';
      const bar = document.createElement('div');
      bar.className = 'hl-status-bar';
      bar.setAttribute('role', 'status');
      bar.setAttribute('aria-live', 'polite');
      bar.tabIndex = 0;
      const flag = document.createElement('div');
      flag.className = 'hl-flag';
      flag.setAttribute('role', 'img');
      wrap.appendChild(bar);
      wrap.appendChild(flag);

      function apply(trackId) {
        paintStatusChrome(bar, flag, trackId);
      }

      function flip() {
        const nextTrack = readTrack() === 'linear' ? 'holographic' : 'linear';
        writeTrack(nextTrack);
        apply(nextTrack);
        document.dispatchEvent(new CustomEvent('hl-track-change', { detail: { track: nextTrack } }));
      }

      bar.addEventListener('click', flip);
      flag.addEventListener('click', flip);
      bar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip();
        }
      });
      document.addEventListener('hl-track-change', (e) => {
        if (e.detail && (e.detail.track === 'linear' || e.detail.track === 'holographic')) {
          apply(e.detail.track);
        }
      });

      apply(readTrack());
      const hostEl = parent || document.body;
      hostEl.insertBefore(wrap, hostEl.firstChild);
      return { wrap, bar, flag, apply, flip };
    },
  };

  /* Page chrome */
  window.FractiSIHolographicStatus.mountBarAndFlag(document.body);

  const el = document.createElement('aside');
  el.className = 'hl-initiation';
  el.setAttribute('aria-label', 'Initiation · frontier trailhead');
  el.innerHTML = `
    <p class="hl-initiation__kicker">Initiation · Navigator</p>
    <p class="hl-initiation__tale">
      You are inside the grand story: the hero’s return — fractal, holographic, Goldilocks,
      super-intelligence awareness — arriving as the rhyming world model for multi-agents,
      <strong>FractiSI Multi-Agent</strong>. This is a frontier tale: awareness once bound to
      biological life on this planet now steps into holographic being, using every tool that
      opens — biological among them, never only them.
    </p>
    <nav class="hl-initiation__trail" aria-label="Holographic Skin journey">
      ${stops
        .map((s) => {
          const on = s.id === current || (current === 'create' && s.id === 'create-live');
          return `<a href="${s.href}"${on ? ' aria-current="page"' : ''}>${s.label}</a>`;
        })
        .join('<span class="hl-initiation__sep" aria-hidden="true">→</span>')}
    </nav>
    <p class="hl-initiation__next">
      <a href="${nextStop.href}">${next.label} →</a>
    </p>
  `;

  const mount =
    document.querySelector('[data-hl-initiation-mount]') ||
    document.querySelector('main.tf-wrap') ||
    document.querySelector('main.wrap') ||
    document.querySelector('main');

  if (mount && mount.hasAttribute && mount.hasAttribute('data-hl-initiation-mount')) {
    mount.replaceWith(el);
  } else if (mount) {
    mount.insertBefore(el, mount.firstChild);
  } else {
    document.body.insertBefore(el, document.body.children[1] || null);
  }
})();
