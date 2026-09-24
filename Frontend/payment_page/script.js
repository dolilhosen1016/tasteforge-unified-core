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
    // 3. CONFIRM ORDER LOGIC (🔥 FIXED: SAVING USER DATA)
    // =========================================
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const paymentSection = document.getElementById('paymentSection');
    const confirmationSection = document.getElementById('confirmationSection');
    
    const displayOrderId = document.getElementById('displayOrderId');
    const displayQueue = document.getElementById('displayQueue');

    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => {
            if (localCart.length === 0) {
                alert("Your cart is empty! Please add items before checkout.");
                window.location.href = '../menu_page/index.html';
                return;
            }

            confirmPaymentBtn.innerText = "Processing...";
            
            setTimeout(() => {
                const newOrderId = '#TFP' + Math.floor(1000 + Math.random() * 9000);
                const queueNumber = Math.floor(1 + Math.random() * 50);

                // 🔥 FIXED: বর্তমান লগ-ইন করা ইউজারের ডেটা টেনে আনা হলো
                const activeUserName = localStorage.getItem('tasteForgeUserName') || 'Guest Customer';
                const activeUserEmail = localStorage.getItem('tasteForgeUserEmail') || 'guest@tasteforge.com';

                let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
                
                localCart.forEach(item => {
                    orderHistory.push({
                        id: newOrderId,
                        date: new Date().toLocaleDateString(),
                        amount: item.price,
                        name: item.name,
                        status: 'Pending',
                        // 🔥 FIXED: অর্ডারের সাথে ইউজারের নাম ও ইমেইল পারমানেন্টলি সেভ করে দেওয়া হলো
                        customerName: activeUserName,
                        customerEmail: activeUserEmail
                    });
                });
                
                localStorage.setItem('tasteForgeOrders', JSON.stringify(orderHistory));

                if(displayOrderId) displayOrderId.innerText = newOrderId;
                if(displayQueue) displayQueue.innerText = queueNumber;

                localStorage.removeItem('tasteForgeCartItems');
                
                if(paymentSection) paymentSection.style.display = 'none';
                if(confirmationSection) confirmationSection.style.display = 'block';

            }, 1200); 
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