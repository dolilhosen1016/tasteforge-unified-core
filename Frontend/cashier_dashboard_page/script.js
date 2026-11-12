document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const token = localStorage.getItem('tasteforge_token');
    const userData = JSON.parse(localStorage.getItem('tasteforge_user'));

    if (!token || !userData || (userData.role !== 'cashier' && userData.role !== 'admin')) {
        alert("Access Denied! Only authorized cashiers can access this page.");
        window.location.href = '../sign_in_page/sign_in_index.html';
        return;
    }

    // Display Name
    document.getElementById('cashierName').innerText = userData.name;

    // Logout Functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('tasteforge_token');
        localStorage.removeItem('tasteforge_user');
        window.location.href = '../sign_in_page/sign_in_index.html';
    });
});

// 2. Payment Processing (Dummy integration for now)
function processPayment(tokenId) {
    const confirmation = confirm(`Receive payment and close order ${tokenId}?`);
    
    if (confirmation) {
        // পরবর্তীতে এখানে Backend API Call বসবে (Status Update: Completed)
        console.log(`Payment confirmed for: ${tokenId}`);
        
        alert(`✅ Payment received successfully! Order ${tokenId} is closed. Receipt is generating...`);
        
        // বিলটা স্ক্রিন থেকে রিমুভ করার ইফেক্ট
        const btn = event.target;
        btn.closest('.bill-card').style.opacity = '0';
        setTimeout(() => {
            btn.closest('.bill-card').remove();
        }, 300);
    }
}
