// Get backend URL
const API_URL = `${BACKEND_URL}/api`;

// Tab switching
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    // Reinitialize icons
    lucide.createIcons();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    // Reinitialize icons
    lucide.createIcons();
});

// Role selection for registration
let selectedRole = 'athlete';
const athleteBtn = document.getElementById('role-athlete');
const coachBtn = document.getElementById('role-coach');

athleteBtn.addEventListener('click', () => {
    selectedRole = 'athlete';
    athleteBtn.className = 'role-btn p-4 rounded-sm border transition-all bg-volt/10 border-volt text-volt';
    coachBtn.className = 'role-btn p-4 rounded-sm border transition-all bg-obsidian border-white/10 text-gray-400 hover:border-white/30';
});

coachBtn.addEventListener('click', () => {
    selectedRole = 'coach';
    coachBtn.className = 'role-btn p-4 rounded-sm border transition-all bg-electric/10 border-electric text-electric';
    athleteBtn.className = 'role-btn p-4 rounded-sm border transition-all bg-obsidian border-white/10 text-gray-400 hover:border-white/30';
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit');
    
    // Clear previous errors
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Signing in...</span>';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            console.log('Login successful, token stored');
            
            // Redirect based on profile completion
            if (data.user.profile_complete) {
                window.location.href = `${data.user.role}-dashboard.html`;
            } else {
                window.location.href = `${data.user.role}-profile.html`;
            }
        } else {
            errorMsg.textContent = data.detail || 'Login failed. Please check your credentials.';
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        lucide.createIcons();
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorMsg = document.getElementById('register-error');
    const submitBtn = document.getElementById('register-submit');
    
    // Clear previous errors
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        errorMsg.classList.remove('hidden');
        return;
    }
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Creating account...</span>';
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password, 
                name, 
                role: selectedRole 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            console.log('Registration successful, token stored');
            
            // Redirect to profile creation
            window.location.href = `${data.user.role}-profile.html`;
        } else {
            errorMsg.textContent = data.detail || 'Registration failed. Please try again.';
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMsg.textContent = 'An error occurred. Please try again.';
        errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        lucide.createIcons();
    }
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                // Redirect to appropriate page
                if (user.profile_complete) {
                    window.location.href = `${user.role}-dashboard.html`;
                } else {
                    window.location.href = `${user.role}-profile.html`;
                }
            } else {
                // Invalid token, clear it
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('token');
        }
    }
});
