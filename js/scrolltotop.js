document.addEventListener('DOMContentLoaded', () => {
    // 1. Selecciona el botón del DOM
    const scrollTopBtn = document.getElementById('scrollTop');

    // 2. Muestra/oculta el botón al hacer scroll
    window.addEventListener('scroll', () => {
        // La condición para mostrar el botón
        if (window.scrollY > 300) { // El botón se muestra después de 300px de scroll
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    // 3. Agrega la funcionalidad de clic al botón
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Desplazamiento suave
        });
    });
});