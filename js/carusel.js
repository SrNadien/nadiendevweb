// Carousel
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const indicatorsContainer = document.querySelector('.carousel-indicators');

let currentIndex = 0;

// Crear indicadores dinámicos
slides.forEach((_, i) => {
    const btn = document.createElement('button');
    if (i === 0) btn.classList.add('active');
    indicatorsContainer.appendChild(btn);
});

const indicators = Array.from(indicatorsContainer.children);

function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((btn, i) => {
        btn.classList.toggle('active', i === currentIndex);
    });
}

// Botón siguiente
nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
});

// Botón anterior
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
});

// Indicadores clicables
indicators.forEach((btn, i) => {
    btn.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
    });
});
