// Obtiene el modal y el botón de cierre
const modal = document.getElementById('project-modal');
const closeButton = document.querySelector('.close-button');

// Obtén el elemento que activa el modal (por ejemplo, una imagen de un proyecto)
// Reemplaza 'miElemento' con la clase o ID que activará el modal
const triggerElement = document.getElementById('miElemento');

// Función para abrir el modal
if (triggerElement) {
    triggerElement.onclick = () => {
        modal.style.display = "block";
    }
}

// Función para cerrar el modal
const closeModal = () => {
    modal.style.display = "none";
};

// Cierra el modal al hacer clic en el botón de cierre
if (closeButton) {
    closeButton.onclick = closeModal;
}

// Cierra el modal al hacer clic fuera del contenido
window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};

