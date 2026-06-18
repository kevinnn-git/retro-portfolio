/* ============================================================
   Portfolio Website — Main Script
   Vanilla JS · ES6+ · No Dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     Utility: Debounce
  ---------------------------------------------------------- */
  const debounce = (fn, ms = 16) => {
    let timer;
    return (...args) => {
      cancelAnimationFrame(timer);
      timer = requestAnimationFrame(() => fn(...args));
    };
  };

  /* ----------------------------------------------------------
     Utility: Desktop media query
  ---------------------------------------------------------- */
  const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

  /* ==========================================================
     1. Preloader
  ========================================================== */
  (() => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hidePreloader = () => {
      if (preloader.classList.contains('preloader--hidden')) return;
      preloader.classList.add('preloader--hidden');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800); // matches CSS transition duration
    };

    // Hide on window load OR after 2.5 s — whichever fires first
    window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 2500);
  })();

  /* ==========================================================
     2. Scroll-Triggered Reveal Animations (Intersection Observer)
  ========================================================== */
  (() => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            revealObserver.unobserve(entry.target); // one-shot
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => revealObserver.observe(el));
  })();

  /* ==========================================================
     3. Navigation Scroll Effect
  ========================================================== */
  (() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = () => {
      if (window.scrollY > 80) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  })();

  /* ==========================================================
     4. Active Navigation Link
  ========================================================== */
  (() => {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileLinks = document.querySelectorAll('.mobile-menu-links a');
    const allLinks = [...navLinks, ...mobileLinks];

    const highlightNav = () => {
      const midpoint = window.innerHeight / 2;
      let currentId = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < midpoint) {
          currentId = section.getAttribute('id');
        }
      });

      allLinks.forEach((link) => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${currentId}`
        );
      });
    };

    window.addEventListener('scroll', debounce(highlightNav), { passive: true });
    highlightNav(); // initial check
  })();

  /* ==========================================================
     5. Smooth Scroll for Navigation Links
  ========================================================== */
  (() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    const mobileMenu = document.querySelector('.mobile-menu');
    const navToggle = document.querySelector('.nav-toggle');

    const closeMobileMenu = () => {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return; // skip bare hashes

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      });
    });
  })();

  /* ==========================================================
     6. Mobile Menu Toggle
  ========================================================== */
  (() => {
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!navToggle || !mobileMenu) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link inside it is clicked
    const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-links a');
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  })();

  /* ==========================================================
     7. Typed Text Effect on Hero Tagline
  ========================================================== */
  (() => {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;

    const strings = [
      'Data Analyst',
      'Storyteller with Data',
      'Passionate About Gen AI',
      'Turning Data into Insights',
    ];

    // Create cursor span
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    cursor.textContent = '|';
    tagline.appendChild(cursor);

    // We'll type into a text node before the cursor
    const textNode = document.createTextNode('');
    tagline.insertBefore(textNode, cursor);

    let stringIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const type = () => {
      const current = strings[stringIdx];

      if (!isDeleting) {
        // Typing forward
        charIdx++;
        textNode.textContent = current.slice(0, charIdx);

        if (charIdx === current.length) {
          // Finished typing — pause then start deleting
          isDeleting = true;
          setTimeout(type, 2000);
          return;
        }
        setTimeout(type, 50);
      } else {
        // Deleting
        charIdx--;
        textNode.textContent = current.slice(0, charIdx);

        if (charIdx === 0) {
          isDeleting = false;
          stringIdx = (stringIdx + 1) % strings.length;
          setTimeout(type, 500);
          return;
        }
        setTimeout(type, 30);
      }
    };

    // Kick off after a tiny delay so the page settles
    setTimeout(type, 600);
  })();

  /* ==========================================================
     8. Cursor Glow Effect (Desktop Only)
  ========================================================== */
  (() => {
    if (!isDesktop()) return;

    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    document.body.appendChild(glow);

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId = null;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      currentX = lerp(currentX, mouseX, 0.15);
      currentY = lerp(currentY, mouseY, 0.15);
      glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      glow.style.opacity = '1';
    });

    rafId = requestAnimationFrame(animate);

    // Cleanup on resize to non-desktop
    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
      if (!e.matches) {
        cancelAnimationFrame(rafId);
        glow.style.opacity = '0';
      } else {
        rafId = requestAnimationFrame(animate);
      }
    });
  })();

  /* ==========================================================
     9. Project Card Expand / Collapse
  ========================================================== */
  (() => {
    const toggles = document.querySelectorAll('.project-card-toggle');
    if (!toggles.length) return;

    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.project-card');
        if (!card) return;

        const body = card.querySelector('.project-card-body');
        const isExpanded = card.classList.toggle('expanded');

        if (body) {
          body.style.maxHeight = isExpanded ? `${body.scrollHeight}px` : '0';
        }
      });
    });
  })();

  /* ==========================================================
     10. Skill Tags Stagger Animation
  ========================================================== */
  (() => {
    const categories = document.querySelectorAll('.skill-category');
    if (!categories.length) return;

    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tags = entry.target.querySelectorAll('.skill-tag');
            tags.forEach((tag, i) => {
              tag.style.transitionDelay = `${i * 30}ms`;
              tag.classList.add('skill-tag--visible');
            });
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    categories.forEach((cat) => skillObserver.observe(cat));
  })();

  /* ==========================================================
     11. Parallax Background (Subtle · Desktop Only)
  ========================================================== */
  (() => {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    const desktopMQ = window.matchMedia('(min-width: 769px)');
    let rafId = null;
    let ticking = false;

    const updateParallax = () => {
      if (!desktopMQ.matches) return;
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    if (desktopMQ.matches) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    desktopMQ.addEventListener('change', (e) => {
      if (e.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
      } else {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(rafId);
        heroBg.style.transform = '';
      }
    });
  })();

  /* ==========================================================
     12. Full-Page Starfield — Animated Stars with Twinkling
  ========================================================== */
  (() => {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isMobile = !window.matchMedia('(min-width: 769px)').matches;

    // Star counts per layer (reduced on mobile)
    const LAYER_CONFIG = [
      { count: isMobile ? 80 : 200, speed: 0.02, sizeMin: 0.3, sizeMax: 1.0, twinkleSpeed: 0.008 },  // distant
      { count: isMobile ? 40 : 100, speed: 0.05, sizeMin: 0.8, sizeMax: 1.8, twinkleSpeed: 0.015 },  // mid
      { count: isMobile ? 15 : 35,  speed: 0.1,  sizeMin: 1.2, sizeMax: 2.5, twinkleSpeed: 0.025 },  // close/bright
    ];

    let layers = [];
    let animId = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      layers = LAYER_CONFIG.map((cfg) => {
        const stars = [];
        for (let i = 0; i < cfg.count; i++) {
          // Assign some stars a warm/cool tint for visual variety
          const colorRoll = Math.random();
          let r, g, b;
          if (colorRoll < 0.1) {
            // Gold-tinted star
            r = 255; g = 220; b = 160;
          } else if (colorRoll < 0.2) {
            // Blue-tinted star
            r = 180; g = 200; b = 255;
          } else if (colorRoll < 0.25) {
            // Red-tinted star
            r = 255; g = 180; b = 160;
          } else {
            // White
            r = 255; g = 255; b = 255;
          }

          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * (cfg.sizeMax - cfg.sizeMin) + cfg.sizeMin,
            baseOpacity: Math.random() * 0.5 + 0.3,
            opacity: 0,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: cfg.twinkleSpeed * (0.7 + Math.random() * 0.6),
            color: { r, g, b },
          });
        }
        return { ...cfg, stars };
      });
    };

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      layers.forEach((layer) => {
        layer.stars.forEach((star) => {
          // Twinkle via sine wave
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          star.opacity = star.baseOpacity + twinkle * 0.25;
          star.opacity = Math.max(0.05, Math.min(1, star.opacity));

          const { r, g, b } = star.color;

          // Draw glow for brighter stars
          if (star.r > 1.5) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.06})`;
            ctx.fill();
          }

          // Draw star core
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity})`;
          ctx.fill();

          // Draw cross sparkle for the brightest stars
          if (star.r > 2.0 && star.opacity > 0.5) {
            const sparkleLen = star.r * 2.5 * star.opacity;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x - sparkleLen, star.y);
            ctx.lineTo(star.x + sparkleLen, star.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(star.x, star.y - sparkleLen);
            ctx.lineTo(star.x, star.y + sparkleLen);
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    createStars();
    draw();

    window.addEventListener('resize', debounce(() => {
      resize();
      createStars();
    }));
  })();

  /* ==========================================================
     13. Hero Canvas — Nebula Glow Effect
  ========================================================== */
  (() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId = null;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    const PARTICLE_COUNT = window.matchMedia('(min-width: 769px)').matches ? 30 : 12;

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.15,
          dy: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.35 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw very subtle nebula clouds
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.4;
      const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.45);
      nebula.addColorStop(0, 'rgba(139, 126, 200, 0.03)');
      nebula.addColorStop(0.4, 'rgba(201, 169, 110, 0.015)');
      nebula.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
      });

      // Faint connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 169, 110, ${0.03 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', debounce(() => {
      resize();
      createParticles();
    }));
  })();

  /* ==========================================================
     14. Shooting Stars — More Frequent Shooting Stars
  ========================================================== */
  (() => {
    let activeCount = 0;
    const MAX_ACTIVE = 15;

    const launchShootingStar = () => {
      if (activeCount >= MAX_ACTIVE) return;
      activeCount++;

      const star = document.createElement('div');
      star.classList.add('shooting-star');

      // Spawn from top/right quadrant so they can streak down-left
      star.style.top = `${-10 + Math.random() * 50}%`;
      star.style.left = `${40 + Math.random() * 70}%`;
      star.style.width = `${60 + Math.random() * 120}px`;

      // Fixed angle for all shooting stars
      const angle = -35;
      star.style.setProperty('--angle', `${angle}deg`);

      document.body.appendChild(star);

      setTimeout(() => {
        if (star.parentNode) star.parentNode.removeChild(star);
        activeCount--;
      }, 1600);
    };

    // Launch 2-5 shooting stars per burst, every 0.8-2 seconds
    const scheduleNext = () => {
      const delay = 800 + Math.random() * 1200;
      setTimeout(() => {
        const burstCount = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < burstCount; i++) {
          setTimeout(launchShootingStar, i * 150);
        }
        scheduleNext();
      }, delay);
    };

    setTimeout(scheduleNext, 1000);
  })();

  /* ==========================================================
     15. Crosshair Lines — Follow Mouse / Touch
  ========================================================== */
  (() => {
    // Create crosshair elements
    const hLine = document.createElement('div');
    const vLine = document.createElement('div');
    hLine.classList.add('crosshair', 'crosshair-h');
    vLine.classList.add('crosshair', 'crosshair-v');
    document.body.appendChild(hLine);
    document.body.appendChild(vLine);

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let visible = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);

      hLine.style.top = `${currentY}px`;
      vLine.style.left = `${currentX}px`;

      requestAnimationFrame(animate);
    };

    const show = () => {
      if (!visible) {
        visible = true;
        hLine.style.opacity = '1';
        vLine.style.opacity = '1';
      }
    };

    const hide = () => {
      visible = false;
      hLine.style.opacity = '0';
      vLine.style.opacity = '0';
    };

    // Mouse events (desktop)
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      show();
    }, { passive: true });

    document.addEventListener('mouseleave', hide);

    // Touch events (mobile)
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      targetX = touch.clientX;
      targetY = touch.clientY;
      currentX = targetX;
      currentY = targetY;
      show();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      targetX = touch.clientX;
      targetY = touch.clientY;
      show();
    }, { passive: true });

    document.addEventListener('touchend', () => {
      setTimeout(hide, 800);
    });

    requestAnimationFrame(animate);
  })();

  /* ==========================================================
     11. 3D Data Intelligence Core (Canvas)
  ========================================================== */
  (() => {
    const canvas = document.getElementById('c');
    const wrap = document.getElementById('canvas-wrap');
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');

    let W, H, cx, cy;
    function resize() {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    const R = 120;
    let t = 0;
    let mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / W - 0.5) * 2;
      mouse.y = ((e.clientY - r.top) / H - 0.5) * 2;
    });

    const GOLDS = ['#fff8e7', '#f5d56e', '#e8b930', '#c9941a', '#a07012', '#f0e2a0'];

    const RINGS = [
      { rx: 155, ry: 42,  tilt:  0.22, speed:  0.007, color: '#e8b930', dash: [] },
      { rx: 140, ry: 58,  tilt: -0.44, speed: -0.009, color: '#f5d56e', dash: [8, 4] },
      { rx: 170, ry: 30,  tilt:  0.70, speed:  0.005, color: '#fff8e7', dash: [4, 8] },
    ];

    const NODES = [
      { ring: 0, phase: 0,             label: 'SQL', col: '#fff8e7' },
      { ring: 0, phase: Math.PI,       label: 'ETL', col: '#f5d56e' },
      { ring: 1, phase: 0.5,           label: 'ML',  col: '#e8b930' },
      { ring: 1, phase: 0.5+Math.PI,   label: 'BI',  col: '#fff8e7' },
      { ring: 2, phase: 1.2,           label: 'API', col: '#f5d56e' },
      { ring: 2, phase: 1.2+Math.PI,   label: 'AI',  col: '#e8b930' },
    ];

    const PARTS = Array.from({ length: 48 }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi:   Math.acos(2 * Math.random() - 1),
      r:     R + 10 + Math.random() * 60,
      speed: (Math.random() - 0.5) * 0.012,
      size:  1 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.5,
      col:   GOLDS[Math.floor(Math.random() * GOLDS.length)]
    }));

    function spherePt(theta, phi, r) {
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta)
      };
    }

    function project(p, rotY, rotX) {
      let x1 = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
      let z1 = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
      let y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = p.y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const fov = 600;
      const scale = fov / (fov + z2 + 200);
      return { sx: x1 * scale + cx, sy: y2 * scale + cy, z: z2, scale };
    }

    function drawSphere(rotY, rotX) {
      const LATS = 10, LONS = 16;
      for (let lon = 0; lon < LONS; lon++) {
        const theta = (lon / LONS) * Math.PI * 2;
        const pts = [];
        for (let i = 0; i <= 24; i++) {
          pts.push(project(spherePt(theta, (i/24)*Math.PI, R), rotY, rotX));
        }
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i+1];
          const fade = Math.max(0, Math.min(1, ((a.z+b.z)/2 + R) / (2*R)));
          ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy);
          ctx.strokeStyle = `rgba(232,185,48,${0.08+fade*0.18})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      for (let lat = 1; lat < LATS; lat++) {
        const phi = (lat / LATS) * Math.PI;
        const pts = [];
        for (let i = 0; i <= 32; i++) {
          pts.push(project(spherePt((i/32)*Math.PI*2, phi, R), rotY, rotX));
        }
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i+1];
          const fade = Math.max(0, Math.min(1, ((a.z+b.z)/2 + R) / (2*R)));
          ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy);
          ctx.strokeStyle = `rgba(255,248,231,${0.05+fade*0.12})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    function drawGlow() {
      const g = ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.35);
      g.addColorStop(0,  'rgba(232,185,48,0.18)');
      g.addColorStop(0.5,'rgba(201,148,26,0.08)');
      g.addColorStop(1,  'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R*1.35,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }

    function drawCore() {
      const g = ctx.createRadialGradient(cx-R*0.25,cy-R*0.25,R*0.05,cx,cy,R);
      g.addColorStop(0,   'rgba(255,255,230,0.97)');
      g.addColorStop(0.18,'rgba(255,248,200,0.88)');
      g.addColorStop(0.45,'rgba(232,185,48,0.60)');
      g.addColorStop(0.8, 'rgba(160,112,18,0.25)');
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }

    function drawRing(ring, rotY, rotX, time) {
      const steps = 80, back = [], front = [];
      const angle = time * ring.speed;
      for (let i = 0; i <= steps; i++) {
        const a = (i/steps)*Math.PI*2 + angle;
        const proj = project({
          x: ring.rx * Math.cos(a),
          y: ring.ry * Math.sin(a) * Math.sin(ring.tilt),
          z: ring.ry * Math.sin(a) * Math.cos(ring.tilt)
        }, rotY, rotX);
        (proj.z > 0 ? front : back).push(proj);
      }
      [back, front].forEach((seg, isFront) => {
        if (seg.length < 2) return;
        ctx.beginPath(); ctx.moveTo(seg[0].sx, seg[0].sy);
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].sx, seg[i].sy);
        ctx.strokeStyle = ring.color + (isFront ? 'cc' : '44');
        ctx.lineWidth = isFront ? 1.5 : 0.8;
        ctx.setLineDash(ring.dash); ctx.stroke(); ctx.setLineDash([]);
      });
    }

    function drawNode(node, rotY, rotX, time) {
      const ring = RINGS[node.ring];
      const angle = time * ring.speed + node.phase;
      const proj = project({
        x: ring.rx * Math.cos(angle),
        y: ring.ry * Math.sin(angle) * Math.sin(ring.tilt),
        z: ring.ry * Math.sin(angle) * Math.cos(ring.tilt)
      }, rotY, rotX);
      const r = 14 * proj.scale;
      ctx.beginPath(); ctx.arc(proj.sx, proj.sy, r, 0, Math.PI*2);
      const ng = ctx.createRadialGradient(proj.sx-r*0.3, proj.sy-r*0.3, r*0.1, proj.sx, proj.sy, r);
      ng.addColorStop(0,   '#fffce0');
      ng.addColorStop(0.4,  node.col);
      ng.addColorStop(1,   '#7a5210');
      ctx.fillStyle = ng; ctx.fill();
      ctx.strokeStyle = 'rgba(255,248,220,0.8)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = proj.z > 0 ? '#2a1800' : 'rgba(42,24,0,0.4)';
      ctx.font = `${Math.round(8*proj.scale+3)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.label, proj.sx, proj.sy);
    }

    function drawParticles(rotY, rotX) {
      for (const p of PARTS) {
        p.theta += p.speed;
        const proj = project({
          x: p.r * Math.sin(p.phi) * Math.cos(p.theta),
          y: p.r * Math.cos(p.phi),
          z: p.r * Math.sin(p.phi) * Math.sin(p.theta)
        }, rotY, rotX);
        const fade = Math.max(0, (proj.z + p.r) / (2*p.r)) * p.alpha;
        const alpha = Math.round(fade*255).toString(16).padStart(2,'0');
        ctx.beginPath(); ctx.arc(proj.sx, proj.sy, p.size*proj.scale, 0, Math.PI*2);
        ctx.fillStyle = p.col + alpha; ctx.fill();
      }
    }

    function drawDataStreams(rotY, rotX, time) {
      for (let i = 0; i < 6; i++) {
        const theta = (i/6)*Math.PI*2 + time*0.003*(i%2===0?1:-1);
        const phi = Math.PI*0.3 + i*0.18;
        const r1 = R*0.95, r2 = R*1.5 + i*8;
        const a = project({ x:r1*Math.sin(phi)*Math.cos(theta), y:r1*Math.cos(phi), z:r1*Math.sin(phi)*Math.sin(theta) }, rotY, rotX);
        const b = project({ x:r2*Math.sin(phi)*Math.cos(theta), y:r2*Math.cos(phi), z:r2*Math.sin(phi)*Math.sin(theta) }, rotY, rotX);
        const alpha = (0.15 + 0.1*Math.sin(time*0.04+i)).toFixed(2);
        ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy);
        ctx.strokeStyle = `rgba(245,213,110,${alpha})`;
        ctx.lineWidth = 0.8; ctx.setLineDash([4,6]); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t++;
      const rotY = t*0.008 + mouse.x*0.5;
      const rotX = mouse.y*0.4 - 0.1;

      drawGlow();
      drawDataStreams(rotY, rotX, t);
      drawParticles(rotY, rotX);
      // for (const ring of RINGS) drawRing(ring, rotY, rotX, t);
      drawSphere(rotY, rotX);
      drawCore();
      // for (const ring of RINGS) drawRing(ring, rotY, rotX, t);
      for (const node of NODES) drawNode(node, rotY, rotX, t);

      const ch = ctx.createRadialGradient(cx-22,cy-22,2,cx,cy,55);
      ch.addColorStop(0,'rgba(255,255,240,0.55)');
      ch.addColorStop(1,'rgba(255,255,240,0)');
      ctx.beginPath(); ctx.arc(cx,cy,55,0,Math.PI*2);
      ctx.fillStyle = ch; ctx.fill();

      requestAnimationFrame(draw);
    }

    draw();
  })();
});
