// Get backend URL from environment or fallback
const BACKEND_URL = 'https://college-scout-hub-1.preview.emergentagent.com';
const API_URL = `${BACKEND_URL}/api`;

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        // Re-initialize icons after DOM change
        lucide.createIcons();
    });
}

// Newsletter form submission
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMessage = document.getElementById('newsletter-message');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value;
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        newsletterMessage.textContent = '';
        newsletterMessage.className = 'text-sm mb-2';
        
        try {
            const response = await fetch(`${API_URL}/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                newsletterMessage.textContent = "Thanks for subscribing! We'll be in touch soon.";
                newsletterMessage.classList.add('text-volt');
                emailInput.value = '';
            } else {
                const error = await response.json();
                newsletterMessage.textContent = error.detail || 'Something went wrong. Please try again.';
                newsletterMessage.classList.add('text-red-500');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            newsletterMessage.textContent = 'Something went wrong. Please try again.';
            newsletterMessage.classList.add('text-red-500');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get Early Access';
        }
    });
}

// Check if user is already logged in
const token = localStorage.getItem('token');
if (token) {
    // User is logged in, optionally update nav buttons
    const navButtons = document.querySelectorAll('[onclick*="auth.html"]');
    navButtons.forEach(btn => {
        btn.textContent = 'Dashboard';
        btn.onclick = () => {
            // Verify token and redirect to appropriate dashboard
            verifyAndRedirect();
        };
    });
}

async function verifyAndRedirect() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            if (user.profile_complete) {
                window.location.href = `${user.role}-dashboard.html`;
            } else {
                window.location.href = `${user.role}-profile.html`;
            }
        } else {
            localStorage.removeItem('token');
            window.location.href = 'auth.html';
        }
    } catch (error) {
        console.error('Verification error:', error);
        window.location.href = 'auth.html';
    }
}
