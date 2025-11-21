document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#000000';
                }
                
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        input.style.borderColor = 'red';
                    }
                }
            });
            
            if (isValid) {
                let successMessage = form.querySelector('.success-message');
                if (!successMessage) {
                    successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.';
                    form.appendChild(successMessage);
                }
                
                successMessage.classList.add('show');
                form.reset();
                
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 5000);
                
                window.scrollTo({
                    top: successMessage.offsetTop - 100,
                    behavior: 'smooth'
                });
            } else {
                alert('Veuillez remplir tous les champs requis correctement.');
            }
        });
    });

    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        let lightbox = document.querySelector('.lightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <span class="lightbox-close">&times;</span>
                <div class="lightbox-content">Image Portfolio</div>
            `;
            document.body.appendChild(lightbox);
        }
        
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                lightbox.classList.add('active');
            });
        });
        
        lightboxClose.addEventListener('click', function() {
            lightbox.classList.remove('active');
        });
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    if (window.location.pathname.includes('fonctionnalités') || window.location.pathname.includes('fonctionnalites')) {
        const geoButton = document.getElementById('geo-test');
        if (geoButton) {
            geoButton.addEventListener('click', function() {
                if (navigator.geolocation) {
                    geoButton.textContent = 'Localisation en cours...';
                    navigator.geolocation.getCurrentPosition(
                        function(position) {
                            const lat = position.coords.latitude.toFixed(2);
                            const lon = position.coords.longitude.toFixed(2);
                            geoButton.textContent = `Position: ${lat}, ${lon}`;
                        },
                        function(error) {
                            geoButton.textContent = 'Simulation: Paris, France (48.85, 2.35)';
                        }
                    );
                } else {
                    geoButton.textContent = 'Géolocalisation non supportée';
                }
            });
        }
    }

    if (window.location.pathname.includes('404')) {
        let countdown = 10;
        const countdownElement = document.getElementById('countdown');
        
        if (countdownElement) {
            const timer = setInterval(function() {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    window.location.href = 'index.html';
                }
            }, 1000);
        }
    }
});
