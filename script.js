// script.js - simple tab switching and hash handling
document.addEventListener('DOMContentLoaded', function(){
  // ===== PARTICLE BACKGROUND ANIMATION =====
  (function(){
    const canvas = document.getElementById('particles-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

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
      for(let i = 0; i < particleCount; i++){
        particles.push(new Particle());
      }
    }

    function animateParticles(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      for(let i = 0; i < particles.length; i++){
        for(let j = i + 1; j < particles.length; j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if(distance < 150){
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 209, 255, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
  })();

  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.tab-panel');

  function showTab(tab){
    // update nav
    navItems.forEach(n=> n.classList.toggle('active', n.dataset.tab===tab));
    // update panels
    panels.forEach(p=> p.classList.toggle('hidden', p.id !== tab));
    // toggle hero layout for gallery tab
    const hero = document.querySelector('.hero');
    if(hero){
      hero.classList.toggle('gallery-mode', tab === 'gallery');
      // ensure hero-left only shows on homepage
      hero.classList.toggle('home-mode', tab === 'home');
    }
  }

  // click handlers
  navItems.forEach(item=>{
    item.addEventListener('click', ()=>{
      const tab = item.dataset.tab;
      history.replaceState(null,'', '#'+tab);
      showTab(tab);
    });
  });

  // check hash on load
  const hash = (location.hash || '#home').replace('#','');
  const known = Array.from(panels).map(p=>p.id);
  showTab( known.includes(hash) ? hash : 'home');
  
  // --- Logo sizing handling ---
  // Behavior:
  // - If an <img> has `data-width`/`data-height`, we set the corresponding CSS variables
  //   (`--site-logo-width`, `--site-logo-height`, `--hero-logo-width`, `--hero-logo-height`).
  //   That way editing `styles.css` and reloading the page will reflect stylesheet values
  //   unless you overwrite them via data attributes or the JS helper.
  // - If no data attributes are present, the CSS variables from `styles.css` control sizes.

  const logoMappings = [
    {id: 'site-logo', varW: '--site-logo-width', varH: '--site-logo-height'},
    {id: 'hero-logo', varW: '--hero-logo-width', varH: '--hero-logo-height'}
  ];

  function normalizeValue(v){
    if(v==null) return null;
    v = String(v).trim();
    if(v === '') return null;
    // if purely numeric, treat as pixels
    if(/^\d+$/.test(v)) return v + 'px';
    return v;
  }

  function setCssVar(name, value){
    if(value==null) return;
    document.documentElement.style.setProperty(name, value);
  }

  logoMappings.forEach(m=>{
    const img = document.getElementById(m.id);
    if(!img) return;
    const dw = normalizeValue(img.getAttribute('data-width'));
    const dh = normalizeValue(img.getAttribute('data-height'));
    if(dw) setCssVar(m.varW, dw);
    if(dh) setCssVar(m.varH, dh);
  });

  // Provide a helper to update logo sizes. By default this updates the CSS variables
  // so the values are controlled by CSS (and will reflect in the layout immediately).
  // Call with useCssVar=false to set inline styles on the element instead.
  window.setLogoSize = function(id, width, height, useCssVar = true){
    const map = logoMappings.find(m => m.id === id);
    if(!map) return false;
    const w = normalizeValue(width);
    const h = normalizeValue(height);
    if(useCssVar){
      if(w) setCssVar(map.varW, w);
      if(h) setCssVar(map.varH, h);
    } else {
      const el = document.getElementById(id);
      if(!el) return false;
      if(w) el.style.width = w;
      if(h) el.style.height = h;
    }
    return true;
  };

  // --- Live control panel integration ---
  // Save initial CSS vars for reset
  const initialVars = {};
  logoMappings.forEach(m => {
    const vW = getComputedStyle(document.documentElement).getPropertyValue(m.varW).trim();
    const vH = getComputedStyle(document.documentElement).getPropertyValue(m.varH).trim();
    initialVars[m.varW] = vW || null;
    initialVars[m.varH] = vH || null;
  });

  // Helper to strip units for inputs (keeps unitless numbers as-is)
  function stripUnits(val){
    if(!val) return '';
    return String(val).trim();
  }

  // Initialize control values
  const siteWInput = document.getElementById('site-w');
  const siteHInput = document.getElementById('site-h');
  const heroWInput = document.getElementById('hero-w');
  const heroHInput = document.getElementById('hero-h');

  function initControls(){
    try{
      const sW = getComputedStyle(document.documentElement).getPropertyValue('--site-logo-width').trim();
      const sH = getComputedStyle(document.documentElement).getPropertyValue('--site-logo-height').trim();
      const hW = getComputedStyle(document.documentElement).getPropertyValue('--hero-logo-width').trim();
      const hH = getComputedStyle(document.documentElement).getPropertyValue('--hero-logo-height').trim();
      if(siteWInput) siteWInput.value = sW || '';
      if(siteHInput) siteHInput.value = sH || '';
      if(heroWInput) heroWInput.value = hW || '';
      if(heroHInput) heroHInput.value = hH || '';
    }catch(e){/*ignore*/}
  }

  // Toggle panel
  const lcToggle = document.getElementById('lc-toggle');
  const lcPanel = document.querySelector('.logo-controls');
  if(lcToggle && lcPanel){
    // initialize collapsed state from localStorage
    const storedCollapsed = localStorage.getItem('logoControlsCollapsed');
    if(storedCollapsed === 'true'){
      lcPanel.classList.add('collapsed');
      lcToggle.setAttribute('aria-expanded','false');
      lcToggle.textContent = 'Logo Controls ▸';
    } else {
      lcPanel.classList.remove('collapsed');
      lcToggle.setAttribute('aria-expanded','true');
      lcToggle.textContent = 'Logo Controls ▾';
    }

    lcToggle.addEventListener('click', ()=>{
      const expanded = lcToggle.getAttribute('aria-expanded') === 'true';
      const willExpanded = !expanded;
      lcToggle.setAttribute('aria-expanded', String(willExpanded));
      lcPanel.classList.toggle('collapsed', !willExpanded);
      lcToggle.textContent = willExpanded ? 'Logo Controls ▾' : 'Logo Controls ▸';
      // persist collapsed state
      localStorage.setItem('logoControlsCollapsed', String(!willExpanded));
    });
  }

  // Apply and reset buttons
  const applyBtn = document.getElementById('lc-apply');
  const resetBtn = document.getElementById('lc-reset');
  if(applyBtn){
    applyBtn.addEventListener('click', ()=>{
      const sW = stripUnits(siteWInput && siteWInput.value);
      const sH = stripUnits(siteHInput && siteHInput.value);
      const hW = stripUnits(heroWInput && heroWInput.value);
      const hH = stripUnits(heroHInput && heroHInput.value);
      if(sW) setLogoSize('site-logo', sW, sH);
      if(hW) setLogoSize('hero-logo', hW, hH);
      // persist values to localStorage so they survive reloads
      const data = {siteW: sW || null, siteH: sH || null, heroW: hW || null, heroH: hH || null};
      localStorage.setItem('logoSizes', JSON.stringify(data));
    });
  }
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      // restore initial css vars
      Object.keys(initialVars).forEach(k => {
        const v = initialVars[k];
        if(v) document.documentElement.style.setProperty(k, v);
        else document.documentElement.style.removeProperty(k);
      });
      initControls();
      // clear persisted values
      localStorage.removeItem('logoSizes');
      localStorage.removeItem('logoControlsCollapsed');
    });
  }

  // run initial fill
  // On load, if user-saved sizes exist, apply them; otherwise use CSS variables or data-attrs
  try{
    const saved = localStorage.getItem('logoSizes');
    if(saved){
      const obj = JSON.parse(saved);
      if(obj.siteW || obj.siteH) setLogoSize('site-logo', obj.siteW || null, obj.siteH || null);
      if(obj.heroW || obj.heroH) setLogoSize('hero-logo', obj.heroW || null, obj.heroH || null);
    }
  }catch(e){/* ignore parse errors */}
  initControls();

  // --- Gallery tabs interactivity ---
  (function(){
    const tabs = Array.from(document.querySelectorAll('.gallery-tabs .gtab'));
    const panels = Array.from(document.querySelectorAll('.gallery-content .category-panel'));
    if(!tabs.length || !panels.length) return;

    // map by data-cat-index to avoid order issues
    function showCategory(idx){
      const s = String(idx);
      tabs.forEach(t => t.classList.toggle('active', String(t.dataset.catIndex) === s));
      panels.forEach(p => p.classList.toggle('hidden', String(p.dataset.catIndex) !== s));
      try{ localStorage.setItem('gallerySelected', s); }catch(e){}
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', ()=> {
        const idx = tab.dataset.catIndex || '0';
        showCategory(idx);
      });
    });

    // on load, if a saved selection exists use it, otherwise ensure first visible
    try{
      const saved = localStorage.getItem('gallerySelected');
      const idx = (saved != null) ? String(saved) : '0';
      // validate idx exists among tabs
      const valid = tabs.some(t => String(t.dataset.catIndex) === idx) ? idx : '0';
      showCategory(valid);
    }catch(e){ showCategory('0'); }
  })();

// 1. Get elements
const modal = document.getElementById('details-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalScamdetailsSection = document.getElementById('modal-scamdetails-section');
const modalScamdetails = document.getElementById('modal-scamdetails');
const closeBtn = document.getElementById('close-modal');

// 2. Add click event to all "VIEW DETAILS" buttons
document.querySelectorAll('.view-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    // Find the card that contains this button
    const card = e.target.closest('.example-card');
    
    // Get data from the card
    const imgSrc = card.querySelector('img').src;
    const titleText = card.querySelector('.caption').innerText;
    const description = button.getAttribute('data-desc');
    const scamdetails = button.getAttribute('data-scamdetails');
    
    // Set the modal content
    modalImg.src = imgSrc;
    modalTitle.innerText = titleText;
    modalDesc.innerText = description ? description : "No detailed explanation provided for this example yet.";
    
    // Handle scam details section
    if(scamdetails){
      modalScamdetails.innerHTML = scamdetails;
      modalScamdetailsSection.style.display = 'block';
    } else {
      modalScamdetailsSection.style.display = 'none';
    }
    
    // Show the modal
    modal.classList.add('active');
  });
});

// 3. Close Modal Logic

// Close when clicking the 'X' button
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Close if clicking anywhere on the transparent modal backdrop (the area outside the glass container)
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Optional: Close on ESC key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.classList.remove('active');
  }
});

});
