// Performance optimizations
let animationId;
let isScrolling = false;
let resizeTimer;

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM Elements - Use lazy loading
const getDOMElements = () => ({
    menuToggle: document.getElementById('menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    projectCards: document.querySelectorAll('.project-card'),
    contactForm: document.getElementById('contact-form'),
    formMessage: document.getElementById('form-message'),
    loading: document.getElementById('loading')
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    const elements = getDOMElements();
    
    // Enhanced loading screen with minimum display time
    if (elements.loading) {
        const minLoadTime = 1500; // Minimum time to show loader
        const startTime = Date.now();
        
        // Wait for images and resources to load
        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - elapsedTime);
            
            setTimeout(() => {
                elements.loading.classList.add('hide');
                setTimeout(() => {
                    elements.loading.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 600);
            }, remainingTime);
        });
        
        // Fallback: Force hide after 4 seconds
        setTimeout(() => {
            if (elements.loading.style.display !== 'none') {
                elements.loading.classList.add('hide');
                setTimeout(() => {
                    elements.loading.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 600);
            }
        }, 4000);
    }
    
    // Initialize components
    initializeNavigation(elements);
    initializeContactForm(elements);
    initializeAnimations();
    initializeBouncingText();
}

// Bouncing letters effect for hero name
function initializeBouncingText() {
    const nameElement = document.getElementById('hero-name');
    const subtitleElement = document.getElementById('hero-subtitle');
    const navbarLogo = document.getElementById('navbar-logo');
    
    if (!nameElement || !subtitleElement || !navbarLogo) return;
    
    const name = 'Aditya Raj';
    const subtitle = 'Full Stack Developer';
    
    // Animation types: 'bounce', 'wave', 'flip', 'slide'
    const animationType = 'bounce'; // Change this to switch animations
    
    // Keep navbar logo static (no animation)
    if (navbarLogo) {
        navbarLogo.textContent = name;
    }
    
    // Create bouncing letters for name
    function createBouncingText(text, container, delayMultiplier = 1, animType = 'bounce') {
        // Keep backup of original content
        const originalContent = container.innerHTML;
        
        container.innerHTML = ''; // Clear existing content
        const letters = text.split('');
        
        // Animation class mapping
        const animationClasses = {
            'bounce': 'bounce-letter',
            'wave': 'wave-letter',
            'flip': 'flip-letter',
            'slide': 'slide-letter'
        };
        
        letters.forEach((letter, index) => {
            const span = document.createElement('span');
            span.textContent = letter === ' ' ? '\u00A0' : letter; // Non-breaking space
            span.className = animationClasses[animType] || 'bounce-letter';
            span.style.animationDelay = `${index * 0.1 * delayMultiplier}s`;
            
            // Ensure visibility
            span.style.display = 'inline-block';
            span.style.color = 'inherit';
            
            container.appendChild(span);
        });
        
        // Fallback: Show original text after animation completes
        setTimeout(() => {
            const allLettersVisible = Array.from(container.children).every(
                child => window.getComputedStyle(child).opacity !== '0'
            );
            if (!allLettersVisible) {
                container.innerHTML = originalContent;
            }
        }, (letters.length * 100 * delayMultiplier) + 2000);
    }
    
    // Add animation effect to hero section after a small delay
    setTimeout(() => {
        createBouncingText(name, nameElement, 1, animationType);
        // Start subtitle after name animation
        setTimeout(() => {
            createBouncingText(subtitle, subtitleElement, 0.8, animationType);
        }, name.length * 100 + 300);
    }, 500);
}

function initializeNavigation(elements) {
    if (!elements.menuToggle || !elements.navLinks) return;
    
    // Responsive Navbar Toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            elements.navLinks.classList.remove('active');
        });
    });

    // Optimized Smooth Scrolling
    const links = document.querySelectorAll('.nav-links a, .btn-primary, .btn-secondary');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;
                    
                    // Use requestAnimationFrame for smooth scrolling
                    if ('scrollBehavior' in document.documentElement.style) {
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // Fallback for older browsers
                        window.scrollTo(0, offsetPosition);
                    }
                }
            }
        });
    });
}

function initializeContactForm(elements) {
    if (!elements.contactForm || !elements.formMessage) return;
    
    // Enhanced Contact Form
    elements.contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const subject = formData.get('subject')?.trim();
        const message = formData.get('message')?.trim();
        
        // Reset previous states
        elements.formMessage.classList.remove('success', 'error');
        
        // Validation
        if (!name || !email || !subject || !message) {
            showFormMessage(elements.formMessage, 'Please fill in all fields.', 'error');
            return;
        }
        
        // Enhanced email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            showFormMessage(elements.formMessage, 'Please enter a valid email address.', 'error');
            return;
        }
        
        // Name validation (no numbers)
        if (/\d/.test(name)) {
            showFormMessage(elements.formMessage, 'Name should not contain numbers.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate sending (replace with actual form submission)
        setTimeout(() => {
            showFormMessage(elements.formMessage, 'Thank you for your message! I\'ll get back to you soon.', 'success');
            this.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

function showFormMessage(messageElement, text, type) {
    messageElement.textContent = text;
    messageElement.className = type;
    
    // Add styles for message types
    const styles = {
        success: {
            color: '#4caf50',
            background: '#e8f5e8',
            border: '1px solid #4caf50'
        },
        error: {
            color: '#f44336',
            background: '#ffeaea',
            border: '1px solid #f44336'
        }
    };
    
    Object.assign(messageElement.style, styles[type], {
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem',
        fontWeight: '600'
    });
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.style.opacity = '1';
            }, 300);
        }, 5000);
    }
}

function initializeAnimations() {
    // Optimized scroll animations with Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Animate skill bars when visible
                if (entry.target.classList.contains('skills-container')) {
                    animateSkillBars(entry.target);
                }
                
                // Animate stats when visible
                if (entry.target.classList.contains('about-stats')) {
                    animateStats(entry.target);
                    observer.unobserve(entry.target); // Only animate once
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatableElements = document.querySelectorAll('.section, .project-card, .education-item');
    animatableElements.forEach(el => observer.observe(el));
    
    // Special observers for skill bars and stats
    const skillsContainer = document.querySelector('.skills-container');
    const statsSection = document.querySelector('.about-stats');
    
    if (skillsContainer) observer.observe(skillsContainer);
    if (statsSection) observer.observe(statsSection);
}

function animateSkillBars(container) {
    const skillBars = container.querySelectorAll('.skill-progress');
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const progress = bar.getAttribute('data-progress');
            if (progress && !bar.classList.contains('animated')) {
                bar.style.width = progress;
                bar.classList.add('animated');
            }
        }, index * 200); // Stagger animation
    });
}

function animateStats(statsContainer) {
    const stats = statsContainer.querySelectorAll('.stat h3');
    stats.forEach((stat, index) => {
        setTimeout(() => {
            const target = parseInt(stat.textContent);
            if (target && !isNaN(target)) {
                countUpAnimation(stat, target);
            }
        }, index * 300); // Stagger animation
    });
}

// Optimized count up animation
function countUpAnimation(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function animate() {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start < target) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = target + '+';
        }
    }
    
    requestAnimationFrame(animate);
}

// Resume Print Function
function printResume() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Aditya Raj - Resume</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1, h2 { color: #4ecdc4; }
                    .section { margin-bottom: 30px; }
                    .contact-info { text-align: center; margin-bottom: 30px; }
                </style>
            </head>
            <body>
                <div class="contact-info">
                    <h1>Aditya Raj</h1>
                    <p>Full Stack Developer</p>
                    <p>Email: aditya.raj@email.com | Phone: +1 (555) 123-4567 | Location: India</p>
                </div>
                
                <div class="section">
                    <h2>Skills</h2>
                    <p>HTML5, CSS3, JavaScript, React, Node.js, Python, MongoDB, Express.js, Git, Docker, AWS</p>
                </div>
                
                <div class="section">
                    <h2>Education</h2>
                    <h3>Bachelor of Science in Computer Science</h3>
                    <p>University of Technology</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Optimized scroll events with throttling
const throttledScroll = throttle(() => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(30, 60, 114, 0.98)';
        } else {
            header.style.background = 'rgba(30, 60, 114, 0.15)';
        }
    }
}, 100);

// Add event listeners with passive option for better performance
window.addEventListener('scroll', throttledScroll, { passive: true });

// Optimized resize handler
const throttledResize = throttle(() => {
    // Handle any resize-specific logic here
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile', isMobile);
}, 250);

window.addEventListener('resize', throttledResize, { passive: true });

// Add CSS for fade-in animation and loading
const style = document.createElement('style');
style.textContent = `
    .section, .project-card, .education-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .skill-progress {
        transition: width 2s ease-in-out;
    }
    
    /* Reduce animations on mobile for better performance */
    @media (max-width: 768px) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .section, .project-card, .education-item {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Respect user's motion preferences */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

// Preload critical images
const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
};

// Preload profile image
preloadImage('images/personal_image.jpg');