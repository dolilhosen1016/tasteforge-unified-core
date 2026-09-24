// =========================================
// ✅ TAB SWITCHING LOGIC (For Sign In Page later)
// =========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const selectedTab = document.getElementById('tab-' + tabId);
    if(selectedTab) {
        selectedTab.classList.add('active');
    }
}

// =========================================
// ✅ PASSWORD VISIBILITY TOGGLE
// =========================================
function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput && eyeIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            passwordInput.type = 'password';
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    }
}

// =========================================
// ✅ SIGN UP LOGIC (Updated: Only Admin & Customer)
// =========================================
window.handleSignup = async function(event) {
    event.preventDefault(); 
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // ইনপুট ফিল্ডগুলো ধরা
    const nameInput = form.querySelector('input[placeholder="Full Name"]');
    const emailInput = form.querySelector('input[placeholder="Email Address"]');
    const passwordInput = form.querySelector('input[placeholder="Password"]') || document.getElementById('passwordInput');
    const confirmPasswordInput = form.querySelector('input[placeholder="Confirm Password"]');
    
    // শুধু ওনারের (Admin) ফর্মে এই ফিল্ডটা থাকবে
    const secretKeyInput = form.querySelector('input[placeholder="Secret Access Key"]');

    // ১. পাসওয়ার্ড ম্যাচিং চেক
    if (passwordInput.value !== confirmPasswordInput.value) {
        alert("❌ Passwords do not match!");
        return;
    }

    let userRole = 'Customer'; // ডিফল্ট রোল কাস্টমার

    // ২. সিক্রেট কি ভেরিফিকেশন (শুধু Admin এর জন্য)
    if (secretKeyInput) {
        if (secretKeyInput.value !== "TF_OWNER_61016") {
            alert("❌ Unauthorized Access! Invalid Secret Access Key.");
            return;
        }
        userRole = 'Admin'; 
    } 

    // বাটন লোডিং স্টেট 
    submitBtn.innerHTML = "Creating Account...";
    submitBtn.disabled = true;

    try {
        // ৩. ব্যাকএন্ড API তে রিকোয়েস্ট পাঠানো
        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                passwordHash: passwordInput.value.trim(),
                role: userRole
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`🎉 ${userRole} Registration Successful! Please sign in to continue.`);
            
            // সাইনআপ সফল হলে সাইন-ইন পেজে পাঠানো
            window.location.href = "../sign_in_page/sign_in_index.html"; 
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        console.error('Signup failed:', error);
        alert('❌ Server is down! Make sure backend is running on port 5000.');
    } finally {
        submitBtn.innerHTML = "Create Account";
        submitBtn.disabled = false;
    }
};