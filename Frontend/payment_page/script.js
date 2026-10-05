document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. INITIALIZE PAYMENT DATA
    // =========================================
    let localCart = JSON.parse(localStorage.getItem('tasteForgeCartItems')) || [];
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    let totalAmount = 0;

    if (localCart.length > 0) {
        localCart.forEach(item => {
            totalAmount += parseFloat(item.price || item.totalPrice || 0);
        });
    }
    if (checkoutTotalEl) {
        checkoutTotalEl.innerText = totalAmount.toFixed(2);
    }

    // =========================================
    // 2. TOAST NOTIFICATION LOGIC
    // =========================================
    const toast = document.getElementById('toastMessage');
    
    window.showToast = function() {
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // =========================================
    // 3. REAL BACKEND ORDER LOGIC (🔥 MONGODB INTEGRATION)
    // =========================================
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const paymentSection = document.getElementById('paymentSection');
    const confirmationSection = document.getElementById('confirmationSection');
    
    const displayOrderId = document.getElementById('displayOrderId');
    const displayQueue = document.getElementById('displayQueue');

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', async () => {
            if (localCart.length === 0) {
                alert("Your cart is empty! Please add items before checkout.");
                window.location.href = '../menu_page/index.html';
                return;
            }

            // নতুন অথেনটিকেশন থেকে ইউজারের ইমেইল নেওয়া
            const userDataString = localStorage.getItem('tasteforge_user');
            if (!userDataString) {
                alert("Authentication error! Please log in again.");
                window.location.href = '../sign_in_page/sign_in_index.html';
                return;
            }

            const userData = JSON.parse(userDataString);
            const userEmail = userData.email;

            confirmPaymentBtn.innerText = "Processing via Server...";
            confirmPaymentBtn.disabled = true;

            const tableOrToken = `TOKEN-${Math.floor(1000 + Math.random() * 9000)}`;

            try {
                // 🔥 BACKEND-এ ডাটাবেসে রিকোয়েস্ট পাঠানো হচ্ছে
                const response = await fetch('http://localhost:5000/api/orders/place', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userEmail: userEmail,
                        cartItems: localCart, // কার্টের ডেটা
                        totalAmount: totalAmount,
                        orderType: 'Online', 
                        tableNoOrTokenId: tableOrToken
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // অর্ডার সাকসেসফুল
                    if (displayOrderId) displayOrderId.innerText = tableOrToken;
                    if (displayQueue) displayQueue.innerText = Math.floor(1 + Math.random() * 50);

                    // কার্ট ক্লিয়ার করে দেওয়া
                    localStorage.removeItem('tasteForgeCartItems');
                    
                    if (paymentSection) paymentSection.style.display = 'none';
                    if (confirmationSection) confirmationSection.style.display = 'block';
                } else {
                    alert("Order Failed: " + data.error);
                    confirmPaymentBtn.innerText = "Confirm Order";
                    confirmPaymentBtn.disabled = false;
                }

            } catch (error) {
                console.error("Payment API Error:", error);
                alert("❌ Server Error! Backend is not responding.");
                confirmPaymentBtn.innerText = "Confirm Order";
                confirmPaymentBtn.disabled = false;
            }
        });
    }

    // =========================================
    // 4. DOWNLOAD RECEIPT (PRINT LOGIC)
    // =========================================
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', () => {
            window.print(); 
        });
    }
});