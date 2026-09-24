const modal = document.getElementById('videoModal');
const frame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const modalTag = document.getElementById('modalTag');

function openVideo(id, title, tag, card) {
  // Artmug hosts this page inside a very tall cross-origin iframe.
  // Anchor the modal around the clicked card instead of the iframe's full center.
  const rect = card.getBoundingClientRect();
  const cardCenterY = rect.top + window.scrollY + rect.height / 2;
  const narrow = window.innerWidth < 640;
  const modalHeight = narrow ? 760 : 900;
  const modalTop = Math.max(0, cardCenterY - modalHeight / 2);

  modal.style.height = `${modalHeight}px`;
  modal.style.top = `${modalTop}px`;
  modalTitle.textContent = title;
  modalTag.textContent = tag;
  frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeVideo() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frame.src = '';
}

document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('click', () => openVideo(
    card.dataset.video,
    card.dataset.title,
    card.dataset.tag,
    card
  ));
});

document.querySelector('.close').addEventListener('click', closeVideo);
modal.addEventListener('click', e => { if (e.target === modal) closeVideo(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeVideo();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .10 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Pointer spotlight / subtle parallax in the opening section.
const hero = document.getElementById('hero');
if (hero) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    hero.style.setProperty('--px', `${x}%`);
    hero.style.setProperty('--py', `${y}%`);
  });
}

// 3D tilt for portfolio cards. Disabled automatically on touch/coarse pointers.
const canTilt = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if (canTilt) {
  document.querySelectorAll('.work-card').forEach(card => {
    let raf = 0;
    card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
    card.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const nx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        const ny = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        const ry = (nx - .5) * 12;      // Y axis ±6deg
        const rx = (.5 - ny) * 8;       // X axis ±4deg
        card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
        card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(ny * 100).toFixed(1)}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.classList.remove('is-tilting');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '50%');
    });
  });
}

// V10: brush-path erase/reveal for 저점매수.
// The visible red fill lives on a canvas. Pointer strokes temporarily erase
// only that fill, revealing the page below while the black glyph outline stays.
const lowBuyText = document.getElementById('lowBuyText');
const lowBuyOutline = document.getElementById('lowBuyOutline');
const fillCanvas = document.getElementById('lowBuyFillCanvas');
const glassCanvas = document.getElementById('lowBuyGlassCanvas');

if (lowBuyText && lowBuyOutline && fillCanvas && glassCanvas) {
  const TEXT = '저점매수';
  const BRUSH_WIDTH = 118;
  const LIFE = 920;
  const canBrush = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const segments = [];
  let previous = null;
  let raf = 0;
  let size = { w: 1, h: 1, dpr: 1, fontSize: 100, letterSpacing: 0, fontFamily: 'sans-serif', fontWeight: '900', baseline: 1, textScaleX: 1 };

  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }

  function measureAndResize() {
    const cs = getComputedStyle(lowBuyOutline);
    const w = Math.max(1, lowBuyOutline.offsetWidth);
    const h = Math.max(1, lowBuyOutline.offsetHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size.w = w; size.h = h; size.dpr = dpr;
    size.fontSize = parseFloat(cs.fontSize) || 100;
    size.letterSpacing = parseFloat(cs.letterSpacing) || 0;
    size.fontFamily = cs.fontFamily || 'sans-serif';
    size.fontWeight = cs.fontWeight || '900';

    [fillCanvas, glassCanvas].forEach(c => {
      c.width = Math.ceil(w * dpr);
      c.height = Math.ceil(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    });

    const ctx = fillCanvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.font = `${size.fontWeight} ${size.fontSize}px ${size.fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(TEXT);
    const ascent = m.actualBoundingBoxAscent || size.fontSize * .78;
    const descent = m.actualBoundingBoxDescent || size.fontSize * .12;
    size.baseline = Math.max(ascent, (h - (ascent + descent)) / 2 + ascent);

    // Canvas text doesn't perfectly mirror negative CSS tracking in every engine.
    // Fit the painted word back to the exact DOM width so the brush aligns visually.
    let rawWidth = 0;
    for (let i=0;i<TEXT.length;i++) rawWidth += ctx.measureText(TEXT[i]).width + (i<TEXT.length-1 ? size.letterSpacing : 0);
    size.textScaleX = rawWidth > 0 ? w / rawWidth : 1;
  }

  function withCanvas(c, fn) {
    const ctx = c.getContext('2d');
    ctx.setTransform(size.dpr,0,0,size.dpr,0,0);
    fn(ctx);
  }

  function traceText(ctx) {
    ctx.save();
    ctx.font = `${size.fontWeight} ${size.fontSize}px ${size.fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    ctx.scale(size.textScaleX, 1);
    let x = 0;
    for (let i=0;i<TEXT.length;i++) {
      const ch = TEXT[i];
      ctx.fillText(ch, x, size.baseline);
      x += ctx.measureText(ch).width + (i<TEXT.length-1 ? size.letterSpacing : 0);
    }
    ctx.restore();
  }

  function drawBaseAndErase(now) {
    withCanvas(fillCanvas, ctx => {
      ctx.clearRect(0,0,size.w,size.h);
      ctx.fillStyle = '#ff3f5c';
      traceText(ctx);

      if (!segments.length) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const seg of segments) {
        const age = now - seg.time;
        const progress = Math.min(1, age / LIFE);
        // Stay strongly erased first, then recover smoothly toward the end.
        const alpha = progress < .38 ? 1 : 1 - easeOut((progress - .38) / .62);
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = BRUSH_WIDTH;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    });
  }

  function drawGlass(now) {
    withCanvas(glassCanvas, ctx => {
      ctx.clearRect(0,0,size.w,size.h);
      if (!segments.length) return;

      // Wide translucent brush body.
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const seg of segments) {
        const age = now - seg.time;
        const progress = Math.min(1, age / LIFE);
        const alpha = (progress < .48 ? .25 : .25 * (1 - easeOut((progress - .48)/.52)));
        if (alpha <= .005) continue;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(255,255,255,.92)';
        ctx.shadowColor = 'rgba(126,103,255,.24)';
        ctx.shadowBlur = 14;
        ctx.lineWidth = BRUSH_WIDTH - 10;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }

      // A slim dashed glint rides the actual drawn path instead of making circles.
      ctx.shadowBlur = 0;
      ctx.setLineDash([10, 11]);
      ctx.lineDashOffset = -now * .035;
      for (const seg of segments) {
        const age = now - seg.time;
        const progress = Math.min(1, age / LIFE);
        const alpha = progress < .55 ? .72 : .72 * (1 - easeOut((progress - .55)/.45));
        if (alpha <= .005) continue;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Keep every highlight strictly inside the glyphs.
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = '#fff';
      traceText(ctx);
      ctx.globalCompositeOperation = 'source-over';
    });
  }

  function render(now = performance.now()) {
    for (let i=segments.length-1;i>=0;i--) {
      if (now - segments[i].time >= LIFE) segments.splice(i,1);
    }
    drawBaseAndErase(now);
    drawGlass(now);
    if (segments.length) raf = requestAnimationFrame(render);
    else raf = 0;
  }

  function localPoint(e) {
    const r = lowBuyText.getBoundingClientRect();
    // getBoundingClientRect includes CSS skew/scale. Approximate back into the
    // untransformed local canvas; for this visual brush, the small skew is harmless.
    return {
      x: Math.max(0, Math.min(size.w, (e.clientX - r.left) * (size.w / r.width))),
      y: Math.max(0, Math.min(size.h, (e.clientY - r.top) * (size.h / r.height)))
    };
  }

  function addSegment(a,b) {
    const dx=b.x-a.x, dy=b.y-a.y;
    const dist=Math.hypot(dx,dy);
    if (dist < 2.5) return;
    // Subdivide fast pointer jumps so it reads as one continuous brush stroke.
    const pieces=Math.max(1,Math.ceil(dist/22));
    let px=a.x, py=a.y;
    for(let i=1;i<=pieces;i++){
      const t=i/pieces;
      const nx=a.x+dx*t, ny=a.y+dy*t;
      segments.push({x1:px,y1:py,x2:nx,y2:ny,time:performance.now() + i*3});
      px=nx; py=ny;
    }
    if (!raf) raf=requestAnimationFrame(render);
  }

  async function initBrush() {
    try { if (document.fonts?.ready) await document.fonts.ready; } catch(_) {}
    measureAndResize();
    lowBuyText.classList.add('brush-ready');
    drawBaseAndErase(performance.now());

    if (canBrush) {
      lowBuyText.addEventListener('pointerenter', e => { previous = localPoint(e); });
      lowBuyText.addEventListener('pointermove', e => {
        const p=localPoint(e);
        if (previous) addSegment(previous,p);
        previous=p;
      });
      lowBuyText.addEventListener('pointerleave', () => { previous=null; });
    }
  }

  const ro = new ResizeObserver(() => {
    measureAndResize();
    drawBaseAndErase(performance.now());
    drawGlass(performance.now());
  });
  ro.observe(lowBuyOutline);
  initBrush();
}
