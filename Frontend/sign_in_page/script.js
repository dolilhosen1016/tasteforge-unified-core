// =========================================
// ✅ INITIALIZE URL TAB
// =========================================
function initializeTab() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'user';
    switchTab(tab);
}

// =========================================
// ✅ TAB SWITCHING LOGIC (Cleaned up)
// =========================================
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabElement = document.getElementById('tab-' + tabId);
    if(tabElement) {
        tabElement.classList.add('active');
    }
    
    const signupLink = document.getElementById('signupLink');
    if (tabId === 'user') {
        signupLink.href = '../sign_up_page/user_index.html';
    } else if (tabId === 'owner') {
        signupLink.href = '../sign_up_page/owner_index.html';
    }
};

// =========================================
// ✅ PASSWORD VISIBILITY TOGGLE
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
// ✅ SECURE LOGIN API CONNECTION
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
                // ব্যাকএন্ড API তে ডেটা পাঠানো
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
                    // টোকেন সেভ করা
                    localStorage.setItem('tasteforge_token', data.token);
                    localStorage.setItem('tasteforge_user', JSON.stringify(data.user));
                    
                    // রোল অনুযায়ী ড্যাশবোর্ডে রিডাইরেক্ট করা
                    if (data.user.role === 'Admin') {
                        window.location.href = '../owner_dashboard_page/index.html';
                    } else if (data.user.role === 'Chef') {
                        window.location.href = '../chef_dashboard_page/index.html'; // শেফরা লগিন করলে এখানে যাবে
                    } else {
                        window.location.href = '../dashboard_page/index.html';
                    }
                } else {
                    alert('❌ Login Failed: ' + data.error);
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
});

// =========================================
// ✅ GOOGLE LOGIN FUNCTIONALITY
// =========================================
window.triggerGoogleLogin = function() {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com", 
        callback: handleGoogleResponse
    });
    google.accounts.id.prompt(); 
}

async function handleGoogleResponse(response) {
    try {
        const res = await fetch('http://localhost:5000/api/users/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('tasteforge_token', data.token);
            localStorage.setItem('tasteforge_user', JSON.stringify(data.user));
            window.location.href = '../dashboard_page/index.html'; 
        } else {
            alert('Google Login Failed!');
        }
    } catch (error) {
        console.error(error);
    }
}