const modal = document.getElementById('videoModal');
    const frame = document.getElementById('videoFrame');
    const modalTitle = document.getElementById('modalTitle');
    const modalTag = document.getElementById('modalTag');

    function openVideo(id,title,tag){
      modalTitle.textContent = title;
      modalTag.textContent = tag;
      frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    function closeVideo(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      frame.src = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.work-card').forEach(card=>{
      card.addEventListener('click',()=>openVideo(card.dataset.video,card.dataset.title,card.dataset.tag));
    });
    document.querySelector('.close').addEventListener('click',closeVideo);
    modal.addEventListener('click',e=>{if(e.target===modal)closeVideo()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && modal.classList.contains('open'))closeVideo()});

    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
      });
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
