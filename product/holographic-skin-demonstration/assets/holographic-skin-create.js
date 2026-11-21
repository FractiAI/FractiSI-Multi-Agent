/**
 * FractiSI · Holographic Skin Create — client Soft Story generator.
 * Assembles styles, vibes, and elements into a living holographic skin board.
 */
(function () {
  const form = document.getElementById('hl-create-form');
  const result = document.getElementById('hl-skin-result');
  const resultTitle = document.getElementById('result-title');
  const resultVibe = document.getElementById('result-vibe');
  const resultStyles = document.getElementById('result-styles');
  const resultMenu = document.getElementById('result-menu');
  const stage = document.getElementById('hl-stage');
  const canvas = document.getElementById('hl-stage-canvas');
  const stageTitle = document.getElementById('hl-stage-title');
  const stageBlurb = document.getElementById('hl-stage-blurb');
  const stageClose = document.getElementById('hl-stage-close');
  const stageReturn = document.getElementById('hl-stage-return');
  const downloadBtn = document.getElementById('hl-download-json');
  const resetBtn = document.getElementById('hl-reset');

  let lastSkin = null;

  const STYLE_PALETTES = {
    'navy-gold': { a: '#0b1424', b: '#c9a227', c: '#f3e6c0', label: 'Navy & gold' },
    'frontier-dusk': { a: '#1a1020', b: '#d4a05a', c: '#ffe6c2', label: 'Frontier dusk' },
    'desert-neon': { a: '#0e1528', b: '#e0b93d', c: '#9ad7ff', label: 'Desert neon' },
    'cave-schematic': { a: '#0a0f14', b: '#8fa8b8', c: '#e8f0f5', label: 'Cave schematic' },
    'ocean-sponsor': { a: '#061820', b: '#3db8c9', c: '#f0e2b0', label: 'Ocean sponsor' },
    'lab-wire': { a: '#0c1220', b: '#7fd1b0', c: '#f3e6c0', label: 'Lab wire' },
  };

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function parseElements(raw) {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
  }

  function selectedStyles(formEl) {
    const checked = [...formEl.querySelectorAll('input[name="styles"]:checked')].map((el) => el.value);
    if (checked.length) return checked;
    const hidden = formEl.querySelector('input[name="styles"][type="hidden"]');
    return hidden && hidden.value ? [hidden.value] : [];
  }

  function paintPanel(ctx, w, h, { title, vibe, styles, seedKey }) {
    const seed = hash(seedKey + '|' + (styles[0] || 'navy-gold'));
    const pal =
      STYLE_PALETTES[styles[seed % styles.length]] ||
      STYLE_PALETTES[styles[0]] ||
      STYLE_PALETTES['navy-gold'];

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, pal.a);
    g.addColorStop(0.55, '#071018');
    g.addColorStop(1, pal.a);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft Story filament arcs
    for (let i = 0; i < 18; i++) {
      const x0 = ((seed * (i + 3)) % w) - w * 0.1;
      const y0 = ((seed / (i + 2)) % h) * 0.01 * h + (i * h) / 22;
      ctx.beginPath();
      ctx.strokeStyle = i % 2 ? pal.b + '88' : pal.c + '55';
      ctx.lineWidth = 1 + (i % 3);
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x0 + w * 0.25, y0 - 40, x0 + w * 0.55, y0 + 80, x0 + w * 0.95, y0 + 20);
      ctx.stroke();
    }

    // Nested Enrichment rings
    ctx.save();
    ctx.translate(w * 0.72, h * 0.42);
    for (let r = 40; r < 220; r += 28) {
      ctx.beginPath();
      ctx.strokeStyle = pal.b + '66';
      ctx.lineWidth = 1.5;
      ctx.arc(0, 0, r + (seed % 17), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Frontier vignette plate
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    ctx.fillStyle = pal.c;
    ctx.font = '600 54px "Bebas Neue", Impact, sans-serif';
    ctx.fillText(title.slice(0, 42), 48, h - 120);
    ctx.fillStyle = 'rgba(232,238,246,0.85)';
    ctx.font = '500 28px "Cormorant Garamond", Georgia, serif';
    const vibeLine = (vibe || '').slice(0, 90);
    ctx.fillText(vibeLine, 48, h - 70);
  }

  function openStage(elementLabel, skin) {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    paintPanel(ctx, w, h, {
      title: elementLabel,
      vibe: skin.vibes,
      styles: skin.styles,
      seedKey: skin.title + '::' + elementLabel,
    });
    stageTitle.textContent = elementLabel;
    stageBlurb.textContent =
      skin.title + ' · Soft Story holographic panel · ' + (skin.stylesLabels || []).join(' · ');
    stage.hidden = false;
    stage.classList.add('is-open');
    document.body.classList.add('hl-lock');
    stageClose.focus();
  }

  function closeStage() {
    stage.classList.remove('is-open');
    stage.hidden = true;
    document.body.classList.remove('hl-lock');
  }

  function mountSkinStatusChrome() {
    const mount = document.getElementById('hl-skin-status-mount') || result;
    if (!mount) return;
    mount.querySelectorAll('.hl-status-stack').forEach((n) => n.remove());
    const api = window.FractiSIHolographicStatus;
    if (api && typeof api.mountBarAndFlag === 'function') {
      api.mountBarAndFlag(mount);
      return;
    }
    /* Fallback if initiation script is missing — same bar + flag markup */
    const wrap = document.createElement('div');
    wrap.className = 'hl-status-stack';
    wrap.innerHTML = `
      <div class="hl-status-bar" data-track="holographic" role="status">
        <span class="hl-status-bar__spacer" aria-hidden="true"></span>
        <span class="hl-status-bar__label hl-status-bar__label--quiet">Inside Soft Story</span>
        <span class="hl-status-bar__story">Hero’s Return · FractiSI Multi-Agent</span>
      </div>
      <div class="hl-flag" data-track="holographic" role="img" aria-label="Flag: inside the chosen holographic space" title="Inside holographic space">
        <span class="hl-flag__pole" aria-hidden="true"></span>
        <span class="hl-flag__cloth hl-flag__cloth--in">In</span>
      </div>`;
    mount.insertBefore(wrap, mount.firstChild);
  }

  function renderSkin(skin) {
    lastSkin = skin;
    result.hidden = false;
    resultTitle.textContent = skin.title;
    resultVibe.textContent = skin.vibes;
    if (resultStyles) {
      resultStyles.textContent =
        'Styles: ' +
        skin.stylesLabels.join(' · ') +
        (skin.styleNotes ? ' — ' + skin.styleNotes : '');
    }
    resultMenu.innerHTML = '';

    /* Whole board = Enrichment Menu — no separate Enrichment button */
    skin.elements.forEach((el, index) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hl-menu__btn';
      b.setAttribute('role', 'listitem');
      b.innerHTML =
        '<span class="hl-menu__idx">' +
        String(index + 1).padStart(2, '0') +
        '</span><span class="hl-menu__copy"><span class="hl-menu__label">' +
        el +
        '</span><small>Enrichment scene</small></span><span class="hl-menu__go" aria-hidden="true">›</span>';
      b.addEventListener('click', () => openStage(el, skin));
      resultMenu.appendChild(b);
    });

    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('skin-title').value.trim();
    const vibes = document.getElementById('vibes').value.trim();
    const styleNotesEl = document.getElementById('style-notes');
    const styleNotes = styleNotesEl ? styleNotesEl.value.trim() : '';
    const styles = selectedStyles(form);
    const elements = parseElements(document.getElementById('elements').value);
    if (!title || !vibes || !elements.length) return;
    if (!styles.length) styles.push('frontier-dusk');

    const skin = {
      product: 'FractiSI Holographic Skin',
      kind: 'soft_story_create',
      title,
      vibes,
      styleNotes,
      styles,
      stylesLabels: styles.map((s) => (STYLE_PALETTES[s] || {}).label || s),
      elements,
      createdAt: new Date().toISOString(),
      honesty:
        'Client Soft Story generator · procedural holographic panels · not hosted LLM image bake-off · FractiSI spelling lock',
    };
    renderSkin(skin);
  });

  downloadBtn.addEventListener('click', () => {
    if (!lastSkin) return;
    const blob = new Blob([JSON.stringify(lastSkin, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (lastSkin.title || 'holographic-skin').toLowerCase().replace(/\s+/g, '-') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  resetBtn.addEventListener('click', () => {
    result.hidden = true;
    resultMenu.innerHTML = '';
    lastSkin = null;
    form.reset();
    const styleInput = form.querySelector('input[name="styles"]');
    if (styleInput && styleInput.type === 'hidden') styleInput.value = 'frontier-dusk';
    document.getElementById('skin-title').focus();
  });

  stageClose.addEventListener('click', closeStage);
  if (stageReturn) stageReturn.addEventListener('click', closeStage);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stage.classList.contains('is-open')) closeStage();
  });
})();
