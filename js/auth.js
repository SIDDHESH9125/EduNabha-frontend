// Authentication functionality for EduNabha

const API_URL = 'http://localhost:5000/api';
let currentUser = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (token && userInfo) {
        try {
            currentUser = JSON.parse(userInfo);
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error parsing user info:', error);
            logout();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

// Login function
async function login(email, password) {
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
            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            updateUIForLoggedInUser();
            return { success: true };
        } else {
            return { success: false, message: data.msg || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Register function
async function register(name, email, password, preferredLanguage = 'english') {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                preferredLanguage,
                role: 'student' // Default role
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token
            localStorage.setItem('token', data.token);
            
            // Fetch user info after registration
            await getUserInfo();
            
            updateUIForLoggedInUser();
            return { success: true };
        } else {
            return { success: false, message: data.msg || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error' };
    }
}

// Get user info
async function getUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data));
            currentUser = data;
            return data;
        } else {
            logout();
            return null;
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUIForLoggedOutUser();
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <div class="user-info">
                <span>Welcome, ${currentUser.name}</span>
                <button id="logout-btn" class="btn">Logout</button>
            </div>
        `;
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
    
    // Show teacher dashboard if user is teacher or admin
    if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
        const dashboardLink = document.querySelector('nav a[data-page="dashboard"]');
        if (dashboardLink) {
            dashboardLink.style.display = 'block';
        }
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <button id="login-btn" class="btn">Login</button>
            <button id="register-btn" class="btn btn-primary">Register</button>
        `;
        
        // Add login/register event listeners
        document.getElementById('login-btn').addEventListener('click', showLoginModal);
        document.getElementById('register-btn').addEventListener('click', showRegisterModal);
    }
    
    // Hide teacher dashboard
    const dashboardLink = document.querySelector('nav a[data-page="dashboard"]');
    if (dashboardLink) {
        dashboardLink.style.display = 'none';
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Login</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
                <div id="login-error" class="error-message"></div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on X click
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = await login(email, password);
        
        if (result.success) {
            document.body.removeChild(modal);
        } else {
            document.getElementById('login-error').textContent = result.message;
        }
    });
}

// Show register modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Register</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="language">Preferred Language</label>
                    <select id="language">
                        <option value="english">English</option>
                        <option value="punjabi">Punjabi</option>
                        <option value="hindi">Hindi</option>
                    </select>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Register</button>
                </div>
                <div id="register-error" class="error-message"></div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on X click
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle form submission
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const language = document.getElementById('language').value;
        
        const result = await register(name, email, password, language);
        
        if (result.success) {
            document.body.removeChild(modal);
        } else {
            document.getElementById('register-error').textContent = result.message;
        }
    });
}