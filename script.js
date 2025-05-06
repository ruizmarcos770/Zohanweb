document.addEventListener('DOMContentLoaded', function() {
  // Variables globales
  const header = document.querySelector('.main-header');
  const navMenu = document.getElementById('navMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const dropdowns = document.querySelectorAll('.dropdown');
  const sliderContainer = document.querySelector('.slider-container');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const dots = document.querySelectorAll('.dot');
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const categoryContents = document.querySelectorAll('.category-content');
  const contactForm = document.getElementById('contactForm');
  const newsletterForm = document.getElementById('newsletterForm');
  const statNumbers = document.querySelectorAll('.stat-number');
  const animatedElements = document.querySelectorAll('.service-card, .product-card, .about-image, .mission-card, .contact-card');
  
  // Actualizar año en el footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Detectar scroll para cambiar el estilo del header
  function checkScroll() {
    const topBarHeight = document.querySelector('.top-bar') ? document.querySelector('.top-bar').offsetHeight : 0;
    
    if (window.scrollY > topBarHeight) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Comprobar elementos para animación al scroll
    animateOnScroll();
  }
  
  // Ejecutar al cargar la página
  checkScroll();
  
  // Ejecutar cuando se hace scroll
  window.addEventListener('scroll', function() {
    checkScroll();
    
    // Comprobar cuando los números estadísticos son visibles
    checkStatsVisibility();
  });
  
  // Menú móvil
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      
      // Animación del botón hamburguesa
      const bars = mobileMenuBtn.querySelectorAll('.bar');
      if (bars.length > 0) {
        bars[0].classList.toggle('bar-top-active');
        bars[1].classList.toggle('bar-middle-active');
        bars[2].classList.toggle('bar-bottom-active');
      }
    });
  }

  // Gestión de dropdowns en móvil
  if (window.innerWidth <= 768) {
    dropdowns.forEach(dropdown => {
      const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
      
      if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        });
      }
    });
  }
  
  // Función para animar elementos al hacer scroll
  function animateOnScroll() {
    animatedElements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('show');
      }
    });
  }
  // Hero Slider
  let currentSlide = 0;
  const slideCount = slides.length;
  let slideInterval;
  
  function showSlide(index) {
    // Ocultar todas las diapositivas
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Desactivar todos los dots
    dots.forEach(dot => {
      dot.classList.remove('active');
    });
    
    // Mostrar la diapositiva actual
    if (slides[index]) {
      slides[index].classList.add('active');
    }
    
    if (dots[index]) {
      dots[index].classList.add('active');
    }
    
    currentSlide = index;
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    showSlide(currentSlide);
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    showSlide(currentSlide);
  }
  
  // Inicializar slider
  if (slides.length > 0) {
    // Configurar navegación con flechas
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        prevSlide();
        resetSliderInterval();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        nextSlide();
        resetSliderInterval();
      });
    }
    
    // Configurar dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        showSlide(index);
        resetSliderInterval();
      });
    });
    
    // Autoplay del slider
    startSliderInterval();
  }
  
  function startSliderInterval() {
    slideInterval = setInterval(nextSlide, 6000);
  }
  
  function resetSliderInterval() {
    clearInterval(slideInterval);
    startSliderInterval();
  }
  // Pestañas de categorías de productos
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Quitar clase active de todas las pestañas
      categoryTabs.forEach(t => {
        t.classList.remove('active');
      });
      
      // Agregar clase active a la pestaña actual
      this.classList.add('active');
      
      // Mostrar el contenido correspondiente
      const category = this.getAttribute('data-category');
      
      // Ocultar todos los contenidos
      categoryContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Mostrar el contenido seleccionado
      const contentToShow = document.getElementById(`${category}-content`);
      if (contentToShow) {
        contentToShow.classList.add('active');
      }
    });
  });
  
  // Animación de conteo para estadísticas
  function animateCountUp(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = 2000; // 2 segundos
    const step = target / (duration / 16); // 16 ms es aproximadamente 60 fps
    let current = 0;
    
    const timer = setInterval(function() {
      current += step;
      element.textContent = Math.round(current);
      
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      }
    }, 16);
  }
  
  function checkStatsVisibility() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;
    
    const statsSectionPosition = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (statsSectionPosition < windowHeight - 100) {
      statNumbers.forEach(number => {
        if (!number.classList.contains('counted')) {
          animateCountUp(number);
          number.classList.add('counted');
        }
      });
    }
  }
  // Validación del formulario de contacto
  // Validación del formulario de contacto
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    // No uses e.preventDefault() - permite que el formulario se envíe normalmente a Formspree
    
    let isValid = true;
    const requiredFields = contactForm.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    
    // Validación de email
    const emailField = contactForm.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
      }
    }
    
    // Validación de teléfono
    const phoneField = contactForm.querySelector('input[type="tel"]');
    if (phoneField && phoneField.value) {
      const phonePattern = /^[0-9\+\s\-]+$/;
      if (!phonePattern.test(phoneField.value)) {
        isValid = false;
        phoneField.classList.add('error');
      }
    }
    
    // Si no es válido, detén el envío
    if (!isValid) {
      e.preventDefault(); // Ahora sí prevenimos el envío solo si hay errores
      alert('Por favor complete todos los campos requeridos correctamente.');
    }
    
    // Ya no necesitas el bloque para mostrar el éxito, Formspree redirigirá 
    // o mostrará su propio mensaje de confirmación
  });
  
  // Mantén esto igual - Quitar clase de error cuando el usuario empieza a escribir
  const formFields = contactForm.querySelectorAll('input, textarea, select');
  formFields.forEach(field => {
    field.addEventListener('input', function() {
      this.classList.remove('error');
    });
  });
}

// Puedes eliminar o comentar esta función ya que Formspree manejará la confirmación
/*
function showFormSuccess(form) {
  // Código de la función anterior...
}
*/
  
  // Formulario de newsletter
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        alert('¡Gracias por suscribirse a nuestro newsletter!');
        newsletterForm.reset();
      }
    });
  }
  
  // Animación suave de scroll para los enlaces de navegación
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Solo para enlaces que apuntan a secciones dentro de la misma página
      if (this.getAttribute('href').startsWith('#') && this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Cerrar menú móvil si está abierto
          if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
          }
          
          // Scroll suave
          const headerHeight = header.offsetHeight;
          
          window.scrollTo({
            top: targetElement.offsetTop - headerHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  });

}); // Fin de DOMContentLoaded
