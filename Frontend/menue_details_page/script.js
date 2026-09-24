document.addEventListener('DOMContentLoaded', () => {

    const workspaceRoot = document.getElementById('detailsWorkspaceRoot');
    const cartCountBadge = document.getElementById('cartCountBadge');
    
    // =========================================
    // 1. CART INITIALIZATION & NAVIGATION
    // =========================================
    let localCart = JSON.parse(localStorage.getItem('tasteForgeCartItems')) || [];
    if(cartCountBadge) cartCountBadge.textContent = localCart.length;

    const backBtn = document.getElementById('detailsBackBtn');
    if(backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../menu_page/index.html';
        });
    }

    // =========================================
    // 2. FETCH MEAL DATA
    // =========================================
    const urlParams = new URLSearchParams(window.location.search);
    const targetMealId = parseInt(urlParams.get('id')) || 1; 
    let currentMeal = null;

    async function loadMealDetails() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Data fetch failed');
            
            const data = await response.json();
            const meal = data.find(item => item.id === targetMealId);
            
            if (meal) {
                currentMeal = {
                    id: meal.id,
                    name: meal.name,
                    basePrice: meal.price,
                    totalPrice: meal.price,
                    baseCalories: meal.calories,
                    totalCalories: meal.calories,
                    category: meal.category,
                    imageUrl: meal.imageUrl,
                    description: meal.longDescription || meal.description,
                    ingredients: meal.ingredients ? JSON.parse(JSON.stringify(meal.ingredients)) : []
                };
                renderWorkspace();
            } else {
                if(workspaceRoot) workspaceRoot.innerHTML = `<h2 style="color:red; text-align:center; width:100%;">Item not found!</h2>`;
            }
        } catch (error) {
            console.error(error);
            if(workspaceRoot) workspaceRoot.innerHTML = `<h2 style="color:red; text-align:center; width:100%;">Error loading menu data.</h2>`;
        }
    }

    // =========================================
    // 3. RENDER WORKSPACE UI
    // =========================================
    function renderWorkspace() {
        if(!workspaceRoot) return;
        
        // 🔥 FIXED: নতুন স্টোরেজ কি (tasteForgeUserName) চেক করা হচ্ছে
        const isRegistered = localStorage.getItem('tasteForgeUserName') !== null;
        let ingredientsHTML = '';
        
        if (currentMeal.ingredients.length > 0) {
            currentMeal.ingredients.forEach((ing, index) => {
                const disableMinus = !isRegistered || (ing.defaultQty <= ing.minQty);
                const disablePlus = !isRegistered || (ing.defaultQty >= ing.maxQty);
                
                ingredientsHTML += `
                    <div class="ing-row">
                        <div class="ing-info">
                            <div class="ing-icon">🥗</div>
                            <div>
                                <div class="ing-name">${ing.name}</div>
                                <div class="ing-price">+$${ing.extraPrice.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty(${index}, -1)" ${disableMinus ? 'disabled' : ''}>-</button>
                            <span class="qty-val" id="qty-${index}">${ing.defaultQty}</span>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)" ${disablePlus ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                `;
            });
        } else {
            ingredientsHTML = `<p style="color: var(--text-muted);">No custom ingredients available.</p>`;
        }

        const guestWarning = !isRegistered 
            ? `<div class="guest-lock-msg"><i class="fa-solid fa-lock"></i> Please Sign In/Sign Up to customize ingredients.</div>` 
            : '';
            
        workspaceRoot.innerHTML = `
            <div class="left-panel">
                <img src="${currentMeal.imageUrl}" alt="${currentMeal.name}" class="food-image">
                <div class="floating-price-card">
                    <p>Total Price</p>
                    <div class="total-price" id="livePrice">$${currentMeal.totalPrice.toFixed(2)}</div>
                    <div class="macro-stats">
                        <div class="macro-item">
                            <p>Calories</p>
                            <h4 id="liveCal">${currentMeal.totalCalories} kcal</h4>
                        </div>
                        <div class="macro-item">
                            <p>Category</p>
                            <h4>${currentMeal.category}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right-panel">
                <div class="food-header">
                    <h1>${currentMeal.name}</h1>
                    <span class="badge">Bestseller</span>
                </div>
                <p class="food-desc">${currentMeal.description}</p>
                
                ${guestWarning}

                <div class="builder-tabs">
                    <span class="tab active">Ingredients</span>
                    <span class="tab">Nutrition</span>
                </div>
                
                <div class="ingredients-list">
                    ${ingredientsHTML}
                </div>

                <div class="action-footer">
                    <button class="btn-save" id="saveBuildBtn">Save Build</button>
                    <button class="btn-add-cart" id="addToCartBtn">
                        Add to Cart <span>$${currentMeal.totalPrice.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        `;
        
        const addToCartBtnEl = document.getElementById('addToCartBtn');
        const saveBuildBtnEl = document.getElementById('saveBuildBtn');
        
        if(addToCartBtnEl) addToCartBtnEl.addEventListener('click', window.addToCart);
        if(saveBuildBtnEl) saveBuildBtnEl.addEventListener('click', window.saveBuildToDashboard);
    }

    // =========================================
    // 4. INGREDIENT MATH ENGINE
    // =========================================
    window.updateQty = function(index, change) {
        let ing = currentMeal.ingredients[index];
        let newQty = ing.defaultQty + change;

        if (newQty >= ing.minQty && newQty <= ing.maxQty) {
            let priceChange = change * ing.extraPrice;
            let calChange = change * ing.extraCalories;

            ing.defaultQty = newQty;
            currentMeal.totalPrice += priceChange;
            currentMeal.totalCalories += calChange;

            document.getElementById(`qty-${index}`).innerText = newQty;
            document.getElementById('livePrice').innerText = `$${currentMeal.totalPrice.toFixed(2)}`;
            document.getElementById('liveCal').innerText = `${currentMeal.totalCalories} kcal`;
            
            const addBtnSpan = document.querySelector('.btn-add-cart span');
            if(addBtnSpan) addBtnSpan.innerText = `$${currentMeal.totalPrice.toFixed(2)}`;

            const qtySpan = document.getElementById(`qty-${index}`);
            qtySpan.previousElementSibling.disabled = (newQty <= ing.minQty);
            qtySpan.nextElementSibling.disabled = (newQty >= ing.maxQty);
        }
    };

    // =========================================
    // 5. ADD TO CART LOGIC
    // =========================================
    window.addToCart = function() {
        const payload = {
            id: currentMeal.id,
            name: currentMeal.name,
            price: currentMeal.totalPrice,
            calories: currentMeal.totalCalories,
            customizedData: currentMeal.ingredients
        };

        localCart.push(payload);
        localStorage.setItem('tasteForgeCartItems', JSON.stringify(localCart));
        if(cartCountBadge) cartCountBadge.textContent = localCart.length;

        const btn = document.getElementById('addToCartBtn');
        if(btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `Added to Basket! <i class="fa-solid fa-check"></i>`;
            btn.style.background = "#fff";
            btn.style.color = "#000";
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = "var(--accent)";
                btn.style.color = "";
            }, 1500);
        }
    };

    // =========================================
    // 6. SAVE BUILD LOGIC
    // =========================================
    window.saveBuildToDashboard = function() {
        // 🔥 FIXED: নতুন স্টোরেজ কি (tasteForgeUserName) চেক করা হচ্ছে
        const isRegistered = localStorage.getItem('tasteForgeUserName') !== null;
        
        if (!isRegistered) {
            alert("🔒 Please Sign In or Create an Account to save your custom masterpiece!");
            return;
        }

        let savedBuilds = JSON.parse(localStorage.getItem('tasteForgeSavedBuilds')) || [];
        const buildPayload = {
            buildId: 'TF-BUILD-' + Date.now(),
            baseMealId: currentMeal.id,
            name: "Custom " + currentMeal.name,
            totalPrice: currentMeal.totalPrice,
            totalCalories: currentMeal.totalCalories,
            category: currentMeal.category,
            imageUrl: currentMeal.imageUrl,
            savedDate: new Date().toLocaleDateString(),
            ingredients: currentMeal.ingredients
        };
        
        savedBuilds.push(buildPayload);
        localStorage.setItem('tasteForgeSavedBuilds', JSON.stringify(savedBuilds));

        const saveBtn = document.getElementById('saveBuildBtn');
        if (saveBtn) {
            saveBtn.innerHTML = `Saved <i class="fa-solid fa-heart"></i>`;
            saveBtn.style.color = "var(--accent)";
            saveBtn.style.borderColor = "var(--accent)";

            setTimeout(() => {
                alert("✨ Masterpiece saved securely in your Dashboard's 'Saved Builds' section!");
                saveBtn.innerHTML = `Save Build`;
                saveBtn.style.color = "";
                saveBtn.style.borderColor = "";
            }, 500);
        }
    };

    // =========================================
    // 7. CART MODAL LOGIC & CONFIRM ORDER
    // =========================================
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    document.addEventListener('click', function(e) {
        if (e.target.closest('.cart-btn')) {
            e.preventDefault();
            updateCartUI();
            if(cartModal) cartModal.classList.add('show');
        }
    });

    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            if(cartModal) cartModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });

    function updateCartUI() {
        if (!cartItemsContainer || !cartTotalEl) return;
        
        if (localCart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your basket is empty.</p>';
            cartTotalEl.innerText = '0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        localCart.forEach((item, index) => {
            const itemPrice = parseFloat(item.price || item.totalPrice || 0);
            const itemCalories = item.calories || item.totalCalories || 0;
            
            total += itemPrice;
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${itemPrice.toFixed(2)} | ${itemCalories} kcal</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">X</button>
                </div>
            `;
        });
        
        cartTotalEl.innerText = total.toFixed(2);
    }

    window.removeFromCart = function(index) {
        localCart.splice(index, 1);
        localStorage.setItem('tasteForgeCartItems', JSON.stringify(localCart));
        if (cartCountBadge) cartCountBadge.textContent = localCart.length;
        updateCartUI();
    };

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            if (localCart.length === 0) {
                alert("Please add some meals to your basket first!");
                return;
            }
            
            // 🔥 FIXED: নতুন স্টোরেজ কি (tasteForgeUserName) চেক করা হচ্ছে
            const isLoggedIn = localStorage.getItem('tasteForgeUserName') !== null;
            
            if (!isLoggedIn) {
                alert("Please Sign In to proceed to payment!");
                    window.location.href = '../sign_in_page/sign_in_index.html';
                return; 
            }
            
            confirmOrderBtn.innerText = "Proceeding to Pay...";
            setTimeout(() => {
                window.location.href = '../payment_page/index.html';
            }, 600);
        });
    }

    // Initialize Page Data Fetch
    loadMealDetails();
});