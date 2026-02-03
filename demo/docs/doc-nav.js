// Simple navigation highlight for docs
document.querySelectorAll('.docs-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    document.querySelectorAll('.docs-nav a').forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Highlight current section on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      document.querySelectorAll('.docs-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
