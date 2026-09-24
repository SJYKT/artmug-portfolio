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


// V9: visible glass/dashed follower + short-lived cursor trail on 저점매수.
const lowBuyText = document.getElementById('lowBuyText');
if (lowBuyText && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let hideTimer = 0;
  let lastTrailAt = 0;

  const setRingPosition = (e) => {
    const r = lowBuyText.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    lowBuyText.style.setProperty('--ring-x', `${x}px`);
    lowBuyText.style.setProperty('--ring-y', `${y}px`);
    return {x, y};
  };

  const spawnTrail = (x, y) => {
    const now = performance.now();
    if (now - lastTrailAt < 48) return;
    lastTrailAt = now;
    const trail = document.createElement('span');
    trail.className = 'glass-trail';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    lowBuyText.appendChild(trail);
    trail.addEventListener('animationend', () => trail.remove(), {once:true});
  };

  lowBuyText.addEventListener('pointerenter', (e) => {
    clearTimeout(hideTimer);
    const p = setRingPosition(e);
    lowBuyText.classList.add('ring-active');
    spawnTrail(p.x, p.y);
  });

  lowBuyText.addEventListener('pointermove', (e) => {
    const p = setRingPosition(e);
    lowBuyText.classList.add('ring-active');
    spawnTrail(p.x, p.y);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => lowBuyText.classList.remove('ring-active'), 150);
  });

  lowBuyText.addEventListener('pointerleave', () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => lowBuyText.classList.remove('ring-active'), 70);
  });
}
