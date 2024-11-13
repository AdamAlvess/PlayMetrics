// mode sombre
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode'); 

    const isDarkModeEnabled = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkModeEnabled);
}

document.addEventListener('DOMContentLoaded', function() {
    const isDarkModeEnabled = JSON.parse(localStorage.getItem('darkMode'));
    if (isDarkModeEnabled) {
        document.body.classList.add('dark-mode'); 
    }
});


document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);

document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const popup = document.querySelector('.popup');

    menuIcon.addEventListener('mouseenter', function() {
        popup.style.display = 'block';
    });

    menuIcon.addEventListener('mouseleave', function() {
        popup.style.display = 'none';
    });
});

// popup de navigation
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menuButton');
    const popup = document.getElementById('popup');

    menuButton.addEventListener('click', function() {
        popup.classList.toggle('show');
    });

    window.addEventListener('click', function(event) {
        if (!event.target.matches('#menuButton')) {
            if (popup.classList.contains('show')) {
                popup.classList.remove('show');
            }
        }
    });
});

// Changement d'unité
document.getElementById("unitSelect").addEventListener("change", function() {
    const unit = this.value;
    document.getElementById("speedValue").innerText = `0 ${unit}`;
});

