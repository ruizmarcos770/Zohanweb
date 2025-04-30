document.addEventListener('DOMContentLoaded', function() {
  // Variables
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const dropdowns = document.querySelectorAll('.dropdown');
  const sliderContainer = document.querySelector('.slider-container');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const dots = document.querySelectorAll('.dot');
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const categoryContents = document.querySelectorAll('.category-content');
  const contactForm = document.getElementById('contactForm');

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
      
      dropdownToggle.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
    });
  }

  // Hero Slider
  let currentSlide = 0;
  const slideCount = slides.length;
  
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
    slides[index].classList.add('active');
    dots[index].classList.add('active');
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
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        nextSlide();
      });
    }
    
    // Configurar dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });
    
    // Autoplay del slider
    setInterval(nextSlide, 6000);
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
      document.getElementById(`${category}-content`).classList.add('active');
    });
  });

  // Animación de elementos al hacer scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .product-card, .stat-item, .about-image, .contact-card');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('animate');
      }
    });
  }
  
  // Ejecutar cuando se hace scroll
  window.addEventListener('scroll', animateOnScroll);
  
  // Ejecutar una vez al cargar la página
  animateOnScroll();

  // Validación del formulario de contacto
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
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
      
      if (isValid) {
        // Aquí iría la lógica para enviar el formulario
        alert('¡Gracias por su mensaje! Nos pondremos en contacto pronto.');
        contactForm.reset();
      } else {
        alert('Por favor complete todos los campos requeridos correctamente.');
      }
    });
    
    // Quitar clase de error cuando el usuario empieza a escribir
    const formFields = contactForm.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
      field.addEventListener('input', function() {
        this.classList.remove('error');
      });
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
          if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
          }
          
          // Scroll suave
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Ajustar para el header fijo
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
