document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const token = localStorage.getItem('tasteforge_token');
    const userData = JSON.parse(localStorage.getItem('tasteforge_user'));

    if (!token || !userData || (userData.role !== 'waiter' && userData.role !== 'admin')) {
        alert("Access Denied! Only authorized waitstaff can access this page.");
        window.location.href = '../sign_in_page/sign_in_index.html';
        return;
    }

    // Display Name
    document.getElementById('waiterName').innerText = userData.name;

    // Logout Functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('tasteforge_token');
        localStorage.removeItem('tasteforge_user');
        window.location.href = '../sign_in_page/sign_in_index.html';
    });
});

// 2. Cart Logic
let cart = [];

function addToCart(itemName, itemPrice) {
    cart.push({ name: itemName, price: itemPrice });
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    const totalPriceEl = document.getElementById('totalPrice');
    
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: #777; text-align: center;">No items added yet.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>
                        $${item.price.toFixed(2)} 
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
                    </span>
                </div>
            `;
        });
    }

    totalPriceEl.innerText = total.toFixed(2);
}

// 3. Send Order to Kitchen (Dummy integration for now)
function sendToKitchen() {
    const tableNumber = document.getElementById('tableNumber').value;
    
    if (!tableNumber) {
        alert("Please enter a Table Number!");
        return;
    }
    if (cart.length === 0) {
        alert("Cart is empty! Please add items first.");
        return;
    }

    // পরবর্তীতে এখানে Backend API Call বসবে (Order Placed)
    console.log("Sending to API:", { table: tableNumber, items: cart });
    
    alert(`✅ Order for Table ${tableNumber} sent to Kitchen (KDS) successfully!`);
    
    // Clear Cart After Order
    cart = [];
    document.getElementById('tableNumber').value = '';
    updateCartUI();
}