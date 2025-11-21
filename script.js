function showToast(message, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error-circle' : 'bx-info-circle';
    toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

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

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

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
                const submitButton = form.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<div class="loading-spinner show"></div>';
                
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    
                    showToast('Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
                    form.reset();
                    
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 1500);
            } else {
                showToast('Veuillez remplir tous les champs requis correctement.', 'error');
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
