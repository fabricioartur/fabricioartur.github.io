document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. BACKGROUND CANVAS (PARTICLES & MATRIX)
  // ==========================================
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let animationFrameId;
  let isMatrixMode = false;
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Accessibility Check: Prefers Reduced Motion
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', () => {
    prefersReducedMotion = motionQuery.matches;
    if (prefersReducedMotion) {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    } else {
      loop();
    }
  });

  // Mouse space tracker
  const mouse = { x: null, y: null, radius: 100 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (isMatrixMode) initMatrix();
  });

  // Particle Engine Configurations
  const particles = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 20000));
  const connectionDist = 120;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      // Bounce off screen boundaries
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive push/pull effect
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.5;
          this.y += (dy / dist) * force * 0.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
    }
  }

  // Populate particles list
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw each particle
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.stroke();
        }
      }
    }
  }

  // Matrix Rain Engine Configurations
  const matrixChars = '0101010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fontSize = 14;
  let columns = [];

  function initMatrix() {
    columns = [];
    const cols = Math.floor(width / fontSize) + 1;
    for (let i = 0; i < cols; i++) {
      columns.push({
        y: Math.random() * -100,
        speed: Math.random() * 2 + 1
      });
    }
  }

  function drawMatrix() {
    // Semi-transparent background overlay to create fading trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = `${fontSize}px monospace`;

    columns.forEach((col, index) => {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = index * fontSize;
      const y = col.y * fontSize;

      ctx.fillText(char, x, y);

      if (y > height && Math.random() > 0.985) {
        col.y = 0;
      } else {
        col.y += 0.35 * col.speed;
      }
    });
  }

  function toggleMatrixMode() {
    isMatrixMode = !isMatrixMode;
    if (isMatrixMode) {
      initMatrix();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Core Animation Loop
  function loop() {
    if (prefersReducedMotion) return;
    
    if (isMatrixMode) {
      drawMatrix();
    } else {
      drawParticles();
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  // Init loops
  if (!prefersReducedMotion) {
    loop();
  }


  // ==========================================
  // 2. TERMINAL EMULATOR
  // ==========================================
  const terminalOverlay = document.getElementById('terminal-overlay');
  const terminalTrigger = document.getElementById('terminal-trigger');
  const terminalClose = document.getElementById('terminal-close');
  const terminalDotClose = document.getElementById('terminal-dot-close');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');

  // Open Terminal Function
  function openTerminal() {
    terminalOverlay.removeAttribute('hidden');
    terminalInput.focus();
    // Render initial banner once
    if (terminalOutput.children.length === 0) {
      printLine('Fabricio Puliafico Artur - Interactive Terminal v1.0.0');
      printLine("Type 'help' to view all available commands.");
      printLine('--------------------------------------------------');
    }
  }

  // Close Terminal Function
  function closeTerminal() {
    terminalOverlay.setAttribute('hidden', '');
  }

  // Helper function to print lines to terminal output
  function printLine(text, cssClass = '') {
    const line = document.createElement('div');
    line.className = `terminal-output-line ${cssClass}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
    // Auto-scroll to bottom of terminal body
    const terminalBody = terminalOutput.parentElement;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Open/Close listeners
  terminalTrigger.addEventListener('click', openTerminal);
  terminalClose.addEventListener('click', closeTerminal);
  terminalDotClose.addEventListener('click', closeTerminal);

  // Close on backdrop click
  terminalOverlay.addEventListener('click', (e) => {
    if (e.target === terminalOverlay) {
      closeTerminal();
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === '`') {
      // If we are not actively typing in an input field, toggle terminal
      if (document.activeElement !== terminalInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (terminalOverlay.hasAttribute('hidden')) {
          openTerminal();
        } else {
          closeTerminal();
        }
      }
    } else if (e.key === 'Escape' && !terminalOverlay.hasAttribute('hidden')) {
      closeTerminal();
    }
  });

  // Command Data Definitions
  const data = {
    about: `Fabricio Puliafico Artur
------------------------
Senior Pre-Sales Engineer & Solutions Architect specialized in Cloud & Edge Platforms, Distributed Systems, Secure Connectivity, and Agentic AI.
Connecting deep technical logic, customer success, and Silicon Valley innovations.`,
    skills: `Technical Expertise:
--------------------
- Frontend: Next.js, React, TypeScript, Modern CSS, HTML5
- Backend & Cloud: Node.js, Python, Distributed Systems, Cloud Architecture
- Tools & IA: Git, GitHub Actions, AI Agents SDK, LLMs, Linux`,
    projects: `Featured Repositories:
---------------------
1. register (Fork)
   DNS automation for is-a.dev subdomains. Points to Vercel custom deployments.
2. pre-sales-document-assistant (Public)
   CLI tool written in Python to analyze technical pre-sales documents via Gemini LLM.
3. codex-excalidraw-skill (Public)
   Custom AI Agent skill to generate editable software architecture diagrams on Excalidraw.`,
    contact: `Connect with me:
-----------------
- Website:  https://fabricioartur.com
- GitHub:   https://github.com/fabricioartur
- LinkedIn: https://www.linkedin.com/in/fartur/
- Email:    fabricio@fabricioartur.com`
  };

  // Input interpreter
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';

      if (command === '') return;

      // Echo command
      printLine(`fabricioartur@terminal:~$ ${command}`, 'terminal-prompt');

      // Routing
      switch(command) {
        case 'help':
          printLine('Available Commands:');
          printLine('  about    - Technical profile summary');
          printLine('  projects - List of repositories');
          printLine('  skills   - Technical skills');
          printLine('  contact  - Contact information');
          printLine('  matrix   - Toggle canvas Matrix background effect');
          printLine('  hack     - Alias for matrix');
          printLine('  clear    - Clear terminal logs');
          printLine('  exit     - Close this terminal overlay');
          break;
        case 'about':
          printLine(data.about);
          break;
        case 'skills':
          printLine(data.skills);
          break;
        case 'projects':
          printLine(data.projects);
          break;
        case 'contact':
          printLine(data.contact);
          break;
        case 'matrix':
        case 'hack':
          toggleMatrixMode();
          printLine(isMatrixMode ? 'Matrix Mode: Enabled' : 'Matrix Mode: Disabled');
          break;
        case 'clear':
          terminalOutput.innerHTML = '';
          break;
        case 'exit':
          closeTerminal();
          break;
        default:
          printLine(`Command not found: '${command}'. Type 'help' to see valid commands.`);
      }
    }
  });


  // ==========================================
  // 3. DEVTOOLS CONSOLE API
  // ==========================================
  // Print stylized message on load
  const headerStyles = `
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #ffffff;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 6px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  `;
  const infoStyle = 'color: #94a3b8; font-size: 13px; line-height: 1.6;';
  const highlightStyle = 'color: #6366f1; font-weight: bold;';

  console.log('%cFabricio Puliafico Artur — Pre-Sales & AI Engineer', headerStyles);
  console.log(
    '%cHello curious developer! I have exposed a set of global variables for you here.\n' +
    'Type any of the following functions and hit Enter:\n' +
    '  - %cabout()%c\n' +
    '  - %cprojects()%c\n' +
    '  - %cskills()%c\n' +
    '  - %ccontact()%c\n' +
    '  - %cmatrix()%c (Toggles background Matrix code rain effect)\n' +
    '  - %chelp()%c',
    infoStyle,
    highlightStyle, infoStyle,
    highlightStyle, infoStyle,
    highlightStyle, infoStyle,
    highlightStyle, infoStyle,
    highlightStyle, infoStyle,
    highlightStyle, infoStyle
  );

  // Bind functions on window object
  window.about = () => {
    console.log(data.about);
    return 'Done.';
  };

  window.projects = () => {
    console.log(data.projects);
    return 'Done.';
  };

  window.skills = () => {
    console.log(data.skills);
    return 'Done.';
  };

  window.contact = () => {
    console.log(data.contact);
    return 'Done.';
  };

  window.matrix = () => {
    toggleMatrixMode();
    console.log(isMatrixMode ? 'Matrix digital rain mode activated!' : 'Matrix mode deactivated.');
    return 'Done.';
  };
  window.hack = window.matrix;

  window.help = () => {
    return 'Type: about(), projects(), skills(), contact(), matrix() or hack().';
  };
});
