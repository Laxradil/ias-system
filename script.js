document.addEventListener('DOMContentLoaded', function(){
  
  // ===== CTA BUTTON RIPPLE EFFECT =====
  const ctaButton = document.querySelector('.cta');
  if(ctaButton){
    ctaButton.addEventListener('click', function(e){
      const rect = ctaButton.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'translate(-50%, -50%)';
      
      ctaButton.appendChild(ripple);
      
      // Animate ripple
      ripple.animate([
        { width: '0px', height: '0px', opacity: '1' },
        { width: '300px', height: '300px', opacity: '0' }
      ], {
        duration: 600,
        easing: 'ease-out'
      }).onfinish = () => ripple.remove();
    });
  }
  
 function animateNavLetters(){
    const navItems = document.querySelectorAll('.main-nav .nav-item');
    navItems.forEach(item => {
      const text = item.textContent;
      item.textContent = ''; // Clear the text
      
      // Wrap each character (including spaces) in a span
      text.split('').forEach((char) => {
        const span = document.createElement('span');
        
        // FIX: If the character is a space, use a non-breaking space code
        if (char === ' ') {
          span.textContent = '\u00A0'; 
        } else {
          span.textContent = char;
        }
        
        item.appendChild(span);
      });
      
      item.classList.add('letter-animated');
    });
  }
  
  animateNavLetters();
  
  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.querySelector('.scroll-progress-bar');
  if(progressBar){
    window.addEventListener('scroll', function(){
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
  
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

  // ===== 2. PARTICLE CONSTELLATION BACKGROUND (INTERACTIVE) =====
  (function(){
    const canvas = document.getElementById('particles-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Config for the effect
    const config = {
      particleColor: 'rgba(255, 255, 255, 0.8)', // White dots
      lineColor: '255, 255, 255', // White lines
      particleAmount: 90,       
      defaultSpeed: 0.5,        
      variantSpeed: 0.5,        
      defaultRadius: 2,         
      variantRadius: 2,         
      linkRadius: 130,
      mouseRadius: 150,      // Range of mouse influence
      mousePushSpeed: 5      // How fast particles move away from mouse
    };

    // Mouse Tracker
    let mouse = { x: null, y: null };

    window.addEventListener('mousemove', function(e){
      mouse.x = e.x;
      mouse.y = e.y;
    });

    // Reset mouse when leaving window so particles don't get stuck
    window.addEventListener('mouseout', function(){
      mouse.x = null;
      mouse.y = null;
    });
    
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
        this.vx = (Math.random() - 0.5) * config.defaultSpeed;
        this.vy = (Math.random() - 0.5) * config.defaultSpeed;
        this.radius = Math.random() * config.defaultRadius + 1; 
      }
      update(){
        // 1. Normal Movement
        this.x += this.vx;
        this.y += this.vy;

        // 2. Mouse Interaction (Repulsion)
        if (mouse.x != null) {
          let dx = this.x - mouse.x;
          let dy = this.y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.mouseRadius) {
            // Calculate vector pointing away from mouse
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            
            // Stronger force when closer
            const force = (config.mouseRadius - distance) / config.mouseRadius;
            
            // Move particle away
            const directionX = forceDirectionX * force * config.mousePushSpeed;
            const directionY = forceDirectionY * force * config.mousePushSpeed;

            this.x += directionX;
            this.y += directionY;
          }
        }
        
        // 3. Bounce off edges
        if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if(this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = config.particleColor;
        ctx.fill();
      }
    }

    function initParticles(){
      particles = [];
      let amount = canvas.width > 800 ? config.particleAmount : config.particleAmount / 2;
      for(let i = 0; i < amount; i++) particles.push(new Particle());
    }

    function animateParticles(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for(let i = 0; i < particles.length; i++){
        particles[i].update();
        particles[i].draw();

        for(let j = i + 1; j < particles.length; j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if(distance < config.linkRadius){
            const opacity = 1 - (distance / config.linkRadius);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
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

  // ===== 6. DYNAMIC BACKGROUND COLOR CHANGER =====
  const sections = document.querySelectorAll('section[data-bgcolor]');
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const newColor = entry.target.getAttribute('data-bgcolor');
        if (newColor) {
          document.body.style.backgroundColor = newColor;
        }
      }
    });
  }, {
    threshold: 0.5 
  });

  sections.forEach(section => {
    scrollObserver.observe(section);
  });

  // ===== 7. REFERENCES & CREDITS TABS =====
  const refTabs = document.querySelectorAll('.ref-tab');
  const refPanels = document.querySelectorAll('.ref-panel');

  refTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Remove active class from all tabs
      refTabs.forEach(t => t.classList.remove('active'));
      // 2. Add active class to clicked tab
      tab.classList.add('active');

      // 3. Hide all panels
      refPanels.forEach(panel => panel.classList.remove('active'));
      
      // 4. Show the target panel
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
  
  // ===== 8. SMART NAVIGATION (Auto-switch tabs) =====
  const navCredits = document.getElementById('nav-credits');
  const navRefs = document.getElementById('nav-refs');
  
  // When "CREDITS" nav is clicked -> Switch to Credits Tab
  if(navCredits){
    navCredits.addEventListener('click', () => {
      const creditsTabBtn = document.querySelector('.ref-tab[data-target="cred-content"]');
      if(creditsTabBtn) creditsTabBtn.click();
    });
  }

  // When "REFERENCES" nav is clicked -> Switch to References Tab
  if(navRefs){
    navRefs.addEventListener('click', () => {
      const refTabBtn = document.querySelector('.ref-tab[data-target="ref-content"]');
      if(refTabBtn) refTabBtn.click();
    });
  }


});