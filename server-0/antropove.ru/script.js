// Developed with ❤️ by DosX :: https://dosx.su

// Initialize social links from resources
function initializeSocialLinks() {
    if (typeof RESOURCES === 'undefined') {
        console.warn('⚠️ RESOURCES не загружены. Проверьте script.resources.js');
        return;
    }

    // Подстановка ссылок на соц. сети
    document.querySelectorAll('.social-card[data-social]').forEach(card => {
        const socialType = card.getAttribute('data-social');
        if (RESOURCES.social[socialType]) {
            card.href = RESOURCES.social[socialType];
        }
    });

    // Подстановка ссылки "Другие услуги"
    const otherServicesLink = document.querySelector('.other-services .btn-link');
    if (otherServicesLink && RESOURCES.otherServices) {
        otherServicesLink.href = RESOURCES.otherServices;
    }

    // Подстановка ссылок на портфолио (если нужно)
    const portfolioLinks = document.querySelectorAll('.portfolio-link');
    const portfolioKeys = ['webDesign', 'logos', 'banners', 'socialMedia', 'creatives', 'other'];
    portfolioLinks.forEach((link, index) => {
        if (RESOURCES.portfolio[portfolioKeys[index]]) {
            link.href = RESOURCES.portfolio[portfolioKeys[index]];
        }
    });

    console.log('🔗 Ссылки инициализированы из resources');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeSocialLinks);

// Burger Menu Toggle
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.querySelector('.nav-menu');

burgerMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        burgerMenu.classList.remove('active');
    });
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 26, 0.98)';
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 14, 26, 0.95)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animations
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Hero section is always visible
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

// Particle effect for hero section (optional enhancement)
function createParticles() {
    const hero = document.querySelector('.hero');
    const particlesCount = 30;

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(0, 168, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';

        hero.appendChild(particle);
    }
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        50% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles
createParticles();

console.log('🎨 ANTROPOVE Website loaded successfully!');

// Winter Snow Effect
let snowInterval = null;
let snowContainer = null;
let isSnowing = false;

function isWinter() {
    const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
    // Winter months: December (11), January (0), February (1)
    return currentMonth === 11 || currentMonth === 0 || currentMonth === 1;
}

function createSnowflake() {
    if (!snowContainer) {
        snowContainer = document.createElement('div');
        snowContainer.id = 'snow-container';
        snowContainer.style.transition = 'opacity 1s ease';
        document.body.appendChild(snowContainer);
    }

    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = '❄';
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.animationDuration = Math.random() * 7.5 + 10 + 's'; // 10-17.5s (в 2.5 раза медленнее)
    snowflake.style.opacity = (Math.random() * 0.3 + 0.2) * 0.5; // 0.1-0.25 (50% прозрачности)
    snowflake.style.fontSize = Math.random() * 10 + 10 + 'px'; // 10-20px

    snowContainer.appendChild(snowflake);

    // Remove snowflake after animation with fade out
    const duration = parseFloat(snowflake.style.animationDuration) * 1000;
    setTimeout(() => {
        snowflake.style.transition = 'opacity 0.8s ease';
        snowflake.style.opacity = '0';
        setTimeout(() => snowflake.remove(), 800);
    }, duration - 800);
}

function startSnow() {
    if (!isSnowing && isWinter()) {
        isSnowing = true;

        if (!snowContainer) {
            snowContainer = document.createElement('div');
            snowContainer.id = 'snow-container';
            snowContainer.style.opacity = '0';
            snowContainer.style.transition = 'opacity 1s ease';
            document.body.appendChild(snowContainer);
        }

        // Fade in snow container
        setTimeout(() => {
            if (snowContainer) snowContainer.style.opacity = '1';
        }, 50);

        // Create initial snowflakes
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createSnowflake(), i * 300);
        }

        // Continue creating snowflakes
        snowInterval = setInterval(() => {
            createSnowflake();
        }, 1000);

        console.log('❄️ Winter mode activated!');
    }
}

function stopSnow() {
    if (isSnowing) {
        isSnowing = false;

        // Stop creating new snowflakes
        if (snowInterval) {
            clearInterval(snowInterval);
            snowInterval = null;
        }

        // Fade out existing snowflakes
        if (snowContainer) {
            snowContainer.style.opacity = '0';
            setTimeout(() => {
                if (snowContainer) {
                    snowContainer.innerHTML = '';
                }
            }, 1000);
        }
    }
}

// Handle scroll for snow effect
if (isWinter()) {
    let heroHeight = 0;

    window.addEventListener('load', () => {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroHeight = heroSection.offsetHeight;
        }
    });

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;

        if (scrollPosition > heroHeight * 0.7) {
            startSnow();
        } else {
            stopSnow();
        }
    });
}