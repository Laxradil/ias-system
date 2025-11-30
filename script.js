document.addEventListener('DOMContentLoaded', function(){
  
  // ===== 1. TRAM ANIMATION OBSERVER =====
  const observerOptions = {
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: "0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // TRAM ANIMATION LOGIC:
        // We define the transition properties here.
        tram(entry.target)
          .add('opacity 800ms ease-out')
          .add('transform 800ms ease-out-quint') // Smooth easing
          .start({ opacity: 1, y: 0 }); // Animate to visible and original Y position
        
        observer.unobserve(entry.target); // Run once
      }
    });
  }, observerOptions);

  function observeItems() {
    // Select all items that should animate
    document.querySelectorAll('.pop-on-scroll').forEach(el => {
      // Ensure Tram is initialized on them (optional, but good practice)
      tram(el);
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
            // Reset state for Tram animation
            tram(el).set({ opacity: 0, y: 50 });
            // Small delay to allow reset to take effect before animating in
            setTimeout(() => {
                 tram(el)
                  .add('opacity 600ms ease-out')
                  .add('transform 600ms ease-out-quint')
                  .start({ opacity: 1, y: 0 });
            }, 50);
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
});