const modal = document.getElementById('videoModal');
const frame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const modalTag = document.getElementById('modalTag');

function openVideo(id, title, tag, card) {
  // Artmug embeds this page as one very tall cross-origin iframe.
  // We cannot read the parent page's scroll position, so centering with
  // position:fixed would center against the entire iframe (far below the user).
  // Anchor the popup to the clicked card instead: the card is necessarily
  // inside the viewer's current screen, so the player opens right where they clicked.
  const rect = card.getBoundingClientRect();
  const cardCenterY = rect.top + window.scrollY + rect.height / 2;
  const modalHeight = window.innerWidth < 640 ? 720 : 860;
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
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// Subtle pointer light for the opening section.
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
