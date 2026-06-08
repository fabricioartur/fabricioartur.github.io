document.addEventListener('DOMContentLoaded', () => {
  // 1. Typewriter Effect
  const typewriterElement = document.getElementById('typewriter-text');
  const words = [
    'Cloud Specialist',
    'Software Engineer',
    'Solutions Architect',
    'AI Integrator'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 100;
  let eraseDelay = 50;
  let wordDelay = 2000;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      // Erase character
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(type, eraseDelay);
    } else {
      // Type character
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(type, typingDelay);
    }

    // Determine state switches
    if (!isDeleting && charIndex === currentWord.length) {
      // Finished typing, pause before deleting
      isDeleting = true;
      setTimeout(type, wordDelay);
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, move to next word
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 500); // Small pause before starting next word
    }
  }

  // Start the typewriter effect
  if (typewriterElement) {
    type();
  }

  // 2. Navigation Active Scroll Spy
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  function activeMenuOnScroll() {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200; // Offset for triggers

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', activeMenuOnScroll);

  // 3. Card Spotlight / Glow Effect
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
