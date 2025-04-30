// =============================
// MENÚ RESPONSIVO PARA MÓVILES
// =============================

const mobileBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// =============================
// SCROLL SUAVE PARA ENLACES
// =============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');

    // Validar destino válido
    if (targetId.length > 1 && document.querySelector(targetId)) {
      e.preventDefault();
      document.querySelector(targetId).scrollIntoView({
        behavior: 'smooth'
      });

      // Cerrar menú en móvil
      navLinks.classList.remove('active');
    }
  });
});
