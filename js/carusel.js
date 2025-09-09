document.addEventListener('DOMContentLoaded', () => {
    // 1. Selección de elementos y variables
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    let currentCardIndex = 0;
    const intervalTime = 5000;
    let autoSlideInterval;

    // 2. Crea los indicadores de posición (un botón por cada tarjeta)
    cards.forEach((card, index) => {
        const indicator = document.createElement('button');
        indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
        indicatorsContainer.appendChild(indicator);
    });

    const indicators = Array.from(indicatorsContainer.children);

    // 3. Función principal para actualizar el carrusel
    function updateCarousel() {
        const transformValue = `translateX(-${currentCardIndex * 100}%)`;
        track.style.transform = transformValue;

        // El botón 'anterior' se deshabilita si no hay funcionalidad de bucle invertido.
        // Como el bucle invertido está implementado, no es necesario deshabilitarlo.
        // prevButton.disabled = currentCardIndex === 0;

        // Actualiza los indicadores
        indicators.forEach((indicator, index) => {
            if (index === currentCardIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    // 4. Lógica de avance automático
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            if (currentCardIndex >= cards.length - 1) {
                currentCardIndex = 0; // Vuelve al inicio
            } else {
                currentCardIndex++;
            }
            updateCarousel();
        }, intervalTime);
    }

    // 5. Reinicia el temporizador al interactuar con los botones
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // 6. Funcionalidad de los botones
    nextButton.addEventListener('click', () => {
        if (currentCardIndex >= cards.length - 1) {
            currentCardIndex = 0; // Si llega al final, vuelve al inicio
        } else {
            currentCardIndex++;
        }
        updateCarousel();
        resetAutoSlide();
    });

    prevButton.addEventListener('click', () => {
        if (currentCardIndex <= 0) {
            currentCardIndex = cards.length - 1; // Si está en la primera, va a la última
        } else {
            currentCardIndex--;
        }
        updateCarousel();
        resetAutoSlide();
    });

    // 7. Funcionalidad de los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentCardIndex = index;
            updateCarousel();
            resetAutoSlide();
        });
    });

    // 8. Inicializa el carrusel y el avance automático
    window.addEventListener('resize', updateCarousel);
    updateCarousel();
    startAutoSlide();
});