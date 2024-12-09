// popup de navigation
document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementById('menuButton');
    const popup = document.getElementById('popup');

    menuButton.addEventListener('click', function () {
        popup.classList.toggle('show');
    });

    window.addEventListener('click', function (event) {
        if (!event.target.matches('#menuButton')) {
            if (popup.classList.contains('show')) {
                popup.classList.remove('show');
            }
        }
    });
});

// Changement d'unité
document.getElementById("unitSelect").addEventListener("change", function () {
    const unit = this.value;
    document.getElementById("speedValue").innerText = `0 ${unit}`;
});

