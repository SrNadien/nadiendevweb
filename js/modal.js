 const modal = document.getElementById("descripcionModal");
    const img = document.getElementById("descripcionImg");
    const span = document.querySelector(".modal .close");

    img.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if(event.target == modal) {
            modal.style.display = "none";
        }
    }