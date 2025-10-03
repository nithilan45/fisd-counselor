// Project Origin Website JavaScript

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation link clicks
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navigation
    const nav = document.querySelector('.nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(10px)';
        } else {
            nav.style.backgroundColor = '#ffffff';
            nav.style.backdropFilter = 'none';
        }
        
        lastScrollY = currentScrollY;
    });

    // Scroll-based fade-in animations for statistics
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.stat-highlight');
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('scroll-fade-in');
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize scroll animations
    initScrollAnimations();

    // Alternating fly-in animations for "What It Looks Like" section
    function initFlyInAnimations() {
        const flyInElements = document.querySelectorAll('.model-item');
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-in');
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        flyInElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize fly-in animations
    initFlyInAnimations();

    // Timeline fly-in animations for challenge page
    function initTimelineAnimations() {
        const timelineElements = document.querySelectorAll('.timeline-item');
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-in');
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        timelineElements.forEach(el => {
            observer.observe(el);
        });
    }

// Initialize timeline animations
initTimelineAnimations();

// Feature card animations
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = Array.from(featureCards).indexOf(element) * 100;
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Initialize feature cards
initFeatureCards();

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.process-step, .point, .mentor-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });


    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherQuestion = otherItem.querySelector('.faq-question');
                otherAnswer.style.display = 'none';
                otherQuestion.classList.remove('active');
            });
            
            // Toggle current item
            if (!isOpen) {
                answer.style.display = 'block';
                question.classList.add('active');
            }
        });
    });

    // Contact form functionality
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Let Formspree handle the submission
            // Just show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Show success message after a delay (Formspree will redirect)
            setTimeout(() => {
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <h3>Message Sent!</h3>
                    <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                `;
                successMessage.style.cssText = `
                    background: #10b981;
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 20px 0;
                `;
                
                this.parentNode.insertBefore(successMessage, this);
                this.style.display = 'none';
            }, 1000);
        });
    }
});

// Utility function to check if user prefers reduced motion
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Adjust animations based on user preference
if (prefersReducedMotion()) {
    const style = document.createElement('style');
    style.textContent = `
        .globe-animation {
            animation: none !important;
        }
        .cta-button:hover,
        .process-step:hover,
        .point:hover,
        .mentor-card:hover {
            transform: none !important;
        }
    `;
    document.head.appendChild(style);
}
