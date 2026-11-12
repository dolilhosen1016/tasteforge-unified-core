// =========================================
// 1. INITIALIZE URL TAB & SWITCHING LOGIC
// =========================================
function initializeTab() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'user';
    switchTab(tab);
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabElement = document.getElementById('tab-' + tabId);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    const signupLink = document.getElementById('signupLink');
    if (signupLink) {
        if (tabId === 'user') {
            signupLink.href = '../sign_up_page/user_index.html';
        } else if (tabId === 'owner') {
            signupLink.href = '../sign_up_page/owner_index.html';
        }
    }
};

// =========================================
// 2. PASSWORD VISIBILITY TOGGLE
// =========================================
window.togglePassword = function() {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
        } else {
            passwordInput.type = 'password';
            eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
        }
    }
};

// =========================================
// 3. ROLE-BASED REDIRECT HELPER (All 5 Roles)
// =========================================
function redirectUserByRole(user) {
    const role = (user.role || 'user').toLowerCase();
    
    if (role === 'admin') {
        window.location.href = '../owner_dashboard_page/index.html';
    } else if (role === 'chef') {
        window.location.href = '../chef_dashboard_page/index.html';
    } else if (role === 'waiter') {
        window.location.href = '../waiter_dashboard_page/index.html';
    } else if (role === 'cashier') {
        window.location.href = '../cashier_dashboard_page/index.html';
    } else {
        window.location.href = '../dashboard_page/index.html';
    }
}

// =========================================
// 4. SECURE LOGIN API CONNECTION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeTab();

    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.onsubmit = async function(event) {
            event.preventDefault(); 
            
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = document.getElementById('passwordInput');
            const loginBtn = document.getElementById('loginBtn');
            
            loginBtn.innerHTML = "Logging in...";
            loginBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput.value.trim(),
                        passwordHash: passwordInput.value.trim()
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('tasteforge_token', data.token);
                    localStorage.setItem('tasteforge_user', JSON.stringify(data.user));
                    redirectUserByRole(data.user);
                } else {
                    alert('❌ Login Failed: ' + (data.error || 'Invalid credentials'));
                }
            } catch (error) {
                console.error('Login Error:', error);
                alert('❌ Server is down! Please run backend on port 5000.');
            } finally {
                loginBtn.innerHTML = "Login";
                loginBtn.disabled = false;
            }
        };
    }

    // সোশ্যাল লগইন বাটনগুলোর জন্য ইভেন্ট হ্যান্ডলার
    const socialBtns = document.querySelectorAll('.social-btn');
    if (socialBtns.length >= 3) {
        socialBtns[0].onclick = () => window.triggerSocialLogin('google');
        socialBtns[1].onclick = () => window.triggerSocialLogin('facebook');
        socialBtns[2].onclick = () => window.triggerSocialLogin('github');
    }
});


// 5. SOCIAL LOGIN (GOOGLE / FACEBOOK / GITHUB)
// =========================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDVeh0kj9FxDNVE-s24jHPygicNzP0kt2A",
    authDomain: "tasteforge-f302f.firebaseapp.com",
    projectId: "tasteforge-f302f",
    storageBucket: "tasteforge-f302f.firebasestorage.app",
    messagingSenderId: "132906934141",
    appId: "1:132906934141:web:173bd4c716f28c075b7614",
    measurementId: "G-YBDRJVFHHC"
};

// পুরনো HTML-এ onclick="triggerGoogleLogin()" থাকলে যেন এরর না দেয়:
window.triggerGoogleLogin = function() {
    window.triggerSocialLogin('google');
};

window.triggerSocialLogin = async function(providerType) {
    try {
        // ফায়ারবেস মডিউল লোড করা এবং পপআপ ওপেন করা
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

        const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
        const auth = getAuth(app);

        let provider;
        if (providerType === 'google') provider = new GoogleAuthProvider();
        else if (providerType === 'github') provider = new GithubAuthProvider();
        else if (providerType === 'facebook') provider = new FacebookAuthProvider();

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await syncSocialUserWithBackend(
            user.displayName || 'TasteForge User',
            user.email,
            user.uid,
            providerType
        );
    } catch (error) {
        console.error("Social Auth Error:", error);
        alert(`❌ ${providerType.toUpperCase()} Login failed: ` + error.message);
    }
};

async function syncSocialUserWithBackend(name, email, socialId, authProvider) {
    try {
        const res = await fetch('http://localhost:5000/api/users/social-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, socialId, authProvider })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('tasteforge_token', data.token);
            localStorage.setItem('tasteforge_user', JSON.stringify(data.user));
            redirectUserByRole(data.user);
        } else {
            alert('❌ Social Login Sync Failed: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('❌ Cannot connect to backend server on port 5000!');
    }
}