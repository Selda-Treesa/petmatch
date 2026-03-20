// auth.js - User authentication using LocalStorage

const USERS_KEY = 'petmatch_users';
const CURRENT_USER_KEY = 'petmatch_current_user';

// Get all users
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current logged in user
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Register new user
function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    
    // Validation
    if (!username || !email || !password) {
        showToast('Please fill in all fields');
        return false;
    }
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showToast('Email already registered');
        return false;
    }
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        showToast('Username already taken');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: btoa(password), // Simple encoding (not secure for production!)
        pets: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after register
    setCurrentUser(newUser);
    showToast('Registration successful!');
    updateNav();
    navigate('home');
    
    return false;
}

// Login user
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (user) {
        setCurrentUser(user);
        showToast('Login successful!');
        updateNav();
        navigate('home');
    } else {
        showToast('Invalid email or password');
    }
    
    return false;
}

// Logout user
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('Logged out successfully');
    updateNav();
    navigate('home');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Update navigation based on login status
function updateNav() {
    const user = getCurrentUser();
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');
    const navAddPet = document.getElementById('nav-add-pet');
    
    if (user) {
        navLogin.style.display = 'none';
        navRegister.style.display = 'none';
        navLogout.style.display = 'block';
        navAddPet.style.display = 'block';
    } else {
        navLogin.style.display = 'block';
        navRegister.style.display = 'block';
        navLogout.style.display = 'none';
        navAddPet.style.display = 'none';
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNav();
});
// Simple feedback helper
function showToast(message) {
    alert(message); // You can replace this later with a pretty Bootstrap toast/alert
}