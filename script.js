document.addEventListener('DOMContentLoaded', function(){
  
  // ===== 1. SCROLL ANIMATION OBSERVER =====
  const observerOptions = {
    threshold: 0.1, 
    rootMargin: "0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  function observeItems() {
    document.querySelectorAll('.pop-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
  observeItems();

  // ===== 2. PARTICLE BACKGROUND =====
  (function(){
    const canvas = document.getElementById('particles-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle{
      constructor(){
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update(){
        this.x += this.vx;
        this.y += this.vy;
        if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if(this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 209, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles(){
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 100);
      for(let i = 0; i < particleCount; i++) particles.push(new Particle());
    }

    function animateParticles(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();
  })();

  // ===== 3. GALLERY SUB-CATEGORY FILTER =====
  (function(){
    const tabs = Array.from(document.querySelectorAll('.gallery-tabs .gtab'));
    const panels = Array.from(document.querySelectorAll('.gallery-content .category-panel'));
    
    function showCategory(idx){
      const s = String(idx);
      tabs.forEach(t => t.classList.toggle('active', String(t.dataset.catIndex) === s));
      panels.forEach(p => {
        const match = String(p.dataset.catIndex) === s;
        p.classList.toggle('hidden', !match);
        // Retrigger animations for newly shown items
        if(match) {
          p.querySelectorAll('.pop-on-scroll').forEach(el => {
            el.classList.remove('visible');
            setTimeout(()=> el.classList.add('visible'), 50);
          });
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', ()=> {
        showCategory(tab.dataset.catIndex || '0');
      });
    });
  })();

  // ===== 4. MODAL LOGIC =====
  const modal = document.getElementById('details-modal');
  const closeBtn = document.getElementById('close-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalScamdetails = document.getElementById('modal-scamdetails');
  const modalScamdetailsSection = document.getElementById('modal-scamdetails-section');

  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.example-card');
      const imgSrc = card.querySelector('img').src;
      const titleText = card.querySelector('.caption').innerText;
      const description = button.getAttribute('data-desc');
      const scamdetails = button.getAttribute('data-scamdetails');
      
      modalImg.src = imgSrc;
      modalTitle.innerText = titleText;
      modalDesc.innerText = description ? description : "No detailed explanation provided for this example yet.";
      
      if(scamdetails){
        modalScamdetails.innerHTML = scamdetails;
        modalScamdetailsSection.style.display = 'block';
      } else {
        modalScamdetailsSection.style.display = 'none';
      }
      modal.classList.add('active');
    });
  });

  if(closeBtn){
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // ===== 5. LOGO CONTROLS =====
  const logoMappings = [
    {id: 'site-logo', varW: '--site-logo-width', varH: '--site-logo-height'},
    {id: 'hero-logo', varW: '--hero-logo-width', varH: '--hero-logo-height'}
  ];
  
  function setCssVar(name, value){ if(value) document.documentElement.style.setProperty(name, value); }
  
  logoMappings.forEach(m=>{
    const img = document.getElementById(m.id);
    if(img){
      const dw = img.getAttribute('data-width');
      const dh = img.getAttribute('data-height');
      if(dw) setCssVar(m.varW, dw.match(/^\d+$/) ? dw+'px' : dw);
      if(dh) setCssVar(m.varH, dh.match(/^\d+$/) ? dh+'px' : dh);
    }
  });

  const lcToggle = document.getElementById('lc-toggle');
  const lcPanel = document.querySelector('.logo-controls');
  if(lcToggle){
    lcToggle.addEventListener('click', ()=>{
      lcPanel.classList.toggle('collapsed');
    });
  }
});