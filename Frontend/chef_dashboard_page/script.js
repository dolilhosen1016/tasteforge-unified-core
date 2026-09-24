document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. AUTHENTICATION & PROFILE SETUP
    // ==========================================
    const chefEmail = localStorage.getItem('tasteForgeChefEmail');
    const chefName = localStorage.getItem('tasteForgeChefName') || 'Master Chef';
    
    if (!chefEmail) {
        alert("Unauthorized Access! Please sign in as a Chef.");
        window.location.href = '../sign_in_page/sign_in_index.html?tab=chef';
        return;
    }
    
    const chefNameDisplay = document.getElementById('chefNameDisplay');
    const topbarChefName = document.getElementById('topbarChefName');
    if (chefNameDisplay) chefNameDisplay.textContent = chefName;
    if (topbarChefName) topbarChefName.textContent = chefName;


    // ==========================================
    // 2. TAB SWITCHING LOGIC & FETCH RECIPES
    // ==========================================
    const navKitchen = document.getElementById('navKitchen');
    const navHistory = document.getElementById('navHistory');
    const navRecipes = document.getElementById('navRecipes'); 
    const navInventory = document.getElementById('navInventory'); 
    
    const pendingSection = document.getElementById('pendingSection');
    const historySection = document.getElementById('historySection');
    const recipesSection = document.getElementById('recipesSection'); 
    const inventorySection = document.getElementById('inventorySection'); 

    function resetTabs() {
        if(navKitchen) navKitchen.classList.remove('active');
        if(navHistory) navHistory.classList.remove('active');
        if(navRecipes) navRecipes.classList.remove('active');
        if(navInventory) navInventory.classList.remove('active'); 
        
        if(pendingSection) pendingSection.style.display = 'none';
        if(historySection) historySection.style.display = 'none';
        if(recipesSection) recipesSection.style.display = 'none';
        if(inventorySection) inventorySection.style.display = 'none'; 
    }

    if (navKitchen && navHistory && navRecipes) {
        navKitchen.addEventListener('click', (e) => {
            e.preventDefault(); resetTabs();
            navKitchen.classList.add('active'); pendingSection.style.display = 'block';
            renderPendingOrders();
        });

        navHistory.addEventListener('click', (e) => {
            e.preventDefault(); resetTabs();
            navHistory.classList.add('active'); historySection.style.display = 'block';
            renderCookedHistory();
        });

        navRecipes.addEventListener('click', (e) => {
            e.preventDefault(); resetTabs();
            navRecipes.classList.add('active'); recipesSection.style.display = 'block';
            renderRecipes();
        });
        
        if (navInventory) {
            navInventory.addEventListener('click', (e) => {
                e.preventDefault(); resetTabs();
                navInventory.classList.add('active'); inventorySection.style.display = 'block';
                renderChefInventory();
            });
        }
    }


    // ==========================================
    // 3. RENDER PENDING ORDERS
    // ==========================================
    const pendingOrdersContainer = document.getElementById('pendingOrdersContainer');
    const pendingCount = document.getElementById('pendingCount');
    const navNotifyBadge = document.getElementById('navNotifyBadge'); 

    window.renderPendingOrders = function() {
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        let pendingOrders = orderHistory.filter(order => !order.status || order.status === 'Pending');
        
        if (pendingCount) pendingCount.textContent = pendingOrders.length;
        if (navNotifyBadge) navNotifyBadge.textContent = pendingOrders.length;

        if (pendingOrders.length === 0) {
            pendingOrdersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-mug-hot"></i>
                    <h3>Kitchen is clear!</h3>
                    <p>No pending orders at the moment. Take a breather.</p>
                </div>
            `;
            return;
        }

        let htmlContent = '';
        pendingOrders.forEach((order) => {
            let itemsList = "Standard Meal";
            if(order.items && Array.isArray(order.items)) {
                itemsList = order.items.map(item => `• ${item.name}`).join('<br>');
            } else if (order.name) {
                itemsList = `• ${order.name}`;
            }

            const currentOrderId = order.id || 'UNKNOWN';

            htmlContent += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">${currentOrderId}</span>
                        <span class="order-time">${order.date || 'Just Now'}</span>
                    </div>
                    <div class="order-items">
                        <strong>Order Details:</strong><br>
                        ${itemsList}
                    </div>
                    <button class="btn-cook" onclick="markAsCooked('${currentOrderId}')">
                        <i class="fa-solid fa-check-double"></i> MARK AS COOKED
                    </button>
                </div>
            `;
        });
        
        pendingOrdersContainer.innerHTML = htmlContent;
    };


    // ==========================================
    // 4. MARK AS COOKED LOGIC
    // ==========================================
    window.markAsCooked = function(orderId) {
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        let isUpdated = false;
        
        orderHistory = orderHistory.map(order => {
            if (order.id === orderId) {
                order.status = 'Prepared';
                isUpdated = true;
            }
            return order;
        });

        if (isUpdated) {
            localStorage.setItem('tasteForgeOrders', JSON.stringify(orderHistory));
            renderPendingOrders(); 
        }
    };


    // ==========================================
    // 5. RENDER COOKED HISTORY
    // ==========================================
    const historyOrdersContainer = document.getElementById('historyOrdersContainer');
    const historyCount = document.getElementById('historyCount');

    window.renderCookedHistory = function() {
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        let cookedOrders = orderHistory.filter(order => order.status === 'Prepared' || order.status === 'Completed');
        
        if (historyCount) historyCount.textContent = cookedOrders.length;

        if (cookedOrders.length === 0) {
            historyOrdersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-file-circle-check"></i>
                    <h3>No history yet!</h3>
                    <p>You haven't cooked any meals today. Get to work, Chef!</p>
                </div>
            `;
            return;
        }

        let htmlContent = '';
        cookedOrders.slice().reverse().forEach((order) => {
            let itemsList = "Standard Meal";
            if(order.items && Array.isArray(order.items)) {
                itemsList = order.items.map(item => `• ${item.name}`).join('<br>');
            } else if (order.name) {
                itemsList = `• ${order.name}`;
            }

            htmlContent += `
                <div class="order-card" style="border-color: rgba(40, 167, 69, 0.3);">
                    <div class="order-header">
                        <span class="order-id" style="color: #28a745;">${order.id || '#UNKNOWN'}</span>
                        <span class="order-time" style="color: #fff; background: rgba(40, 167, 69, 0.2);">${order.date || 'Today'}</span>
                    </div>
                    <div class="order-items">
                        <strong>Order Details:</strong><br>
                        ${itemsList}
                    </div>
                    <div style="width: 100%; text-align: center; padding: 12px; background: rgba(40, 167, 69, 0.1); color: #28a745; border-radius: 10px; font-weight: bold;">
                        <i class="fa-solid fa-check"></i> Cooked Successfully
                    </div>
                </div>
            `;
        });
        
        historyOrdersContainer.innerHTML = htmlContent;
    };


    // ==========================================
    // 6. RENDER RECIPES FROM JSON
    // ==========================================
    window.renderRecipes = function() {
        const recipesContainer = document.getElementById('recipesContainer');
        const recipesCount = document.getElementById('recipesCount');

        fetch('../menu_page/data.json') 
            .then(response => response.json())
            .then(data => {
                if (recipesCount) recipesCount.textContent = data.length;
                
                let htmlContent = '';
                data.forEach(item => {
                    let imgData = item.image || item.img || item.picture || item.pic || item.imageUrl;
                    let imageSrc = '../sign_up_page/TasteForge_Logo.png'; 
                    
                    if (imgData) {
                        if (imgData.startsWith('http') || imgData.startsWith('../')) {
                            imageSrc = imgData;
                        } else {
                            imageSrc = `../menu_page/${imgData}`;
                        }
                    }

                    htmlContent += `
                        <div class="order-card" style="display: flex; flex-direction: column; gap: 15px; border-color: rgba(255, 115, 0, 0.3);">
                            <div style="width: 100%; height: 160px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                                <img src="${imageSrc}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            </div>
                            <div class="order-header" style="margin-bottom: 0; padding-bottom: 0; border: none;">
                                <span class="order-id" style="color: #fff; font-size: 20px;">${item.name || 'Special Item'}</span>
                                <span class="order-time" style="color: #000; background: var(--accent); font-weight: bold; font-size: 14px; padding: 4px 12px;">$ ${item.price || '0'}</span>
                            </div>
                            <div class="order-items" style="margin-bottom: 10px; flex-grow: 1;">
                                <strong style="color: var(--accent);">Category:</strong> ${item.category || 'General'}<br>
                                <strong style="color: var(--accent);">Details:</strong> <span style="font-size: 13px; color: #ccc;">${item.description || 'Secret recipe details...'}</span>
                            </div>
                            <div style="width: 100%; text-align: center; padding: 12px; background: rgba(255, 115, 0, 0.1); color: var(--accent); border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: auto;">
                                <i class="fa-solid fa-fire"></i> Ready to Cook
                            </div>
                        </div>
                    `;
                });
                recipesContainer.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error('Error fetching JSON:', error);
                recipesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #ff4757;"></i>
                        <h3>Menu not found!</h3>
                        <p>Check the JSON file path in script.js (fetch URL).</p>
                    </div>
                `;
            });
    };


    // ==========================================
    // 7. INTERACTIVE ELEMENTS (DYNAMIC MODALS)
    // ==========================================
    const customModal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalIcon = document.getElementById('closeModalIcon');
    const modalBox = document.querySelector('.custom-modal-box');

    function showCustomAlert(titleHTML, bodyHTML, positionClass) {
        if(!customModal) return;
        modalTitle.innerHTML = titleHTML;
        modalBody.innerHTML = bodyHTML;
        modalBox.className = 'custom-modal-box ' + positionClass;
        
        const modalFooter = document.querySelector('.modal-footer-custom');
        if (modalFooter) modalFooter.style.display = 'none';
        customModal.classList.add('active');
    }

    function closeModal() {
        if(customModal) customModal.classList.remove('active');
    }
    if (closeModalIcon) closeModalIcon.addEventListener('click', closeModal);
    if (customModal) {
        customModal.addEventListener('click', (e) => {
            if (e.target === customModal) closeModal();
        });
    }

    const notifyBell = document.querySelector('.notification-bell');
    if (notifyBell) {
        notifyBell.addEventListener('click', () => {
            const pendingCountVal = document.getElementById('navNotifyBadge').textContent;
            if (parseInt(pendingCountVal) > 0) {
                showCustomAlert(
                    `<i class="fa-solid fa-bell" style="color: var(--accent);"></i> Order Notifications`, 
                    `<div style="padding: 15px; background: rgba(255,115,0,0.1); border-left: 4px solid var(--accent); border-radius: 4px;">
                        You have <strong>${pendingCountVal}</strong> new orders waiting to be prepared.
                    </div>`,
                    'modal-right'
                );
            } else {
                showCustomAlert(
                    `<i class="fa-regular fa-bell-slash" style="color: var(--text-muted);"></i> No Notifications`, 
                    `<div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <i class="fa-solid fa-mug-hot" style="font-size: 30px; margin-bottom: 10px; opacity: 0.5;"></i><br>
                        The kitchen is clear.
                    </div>`,
                    'modal-right'
                );
            }
        });
    }

    const profileMenu = document.querySelector('.profile-menu');
    if (profileMenu) {
        profileMenu.addEventListener('click', () => {
            showCustomAlert(
                `<i class="fa-solid fa-user-tie" style="color: var(--accent);"></i> Chef Profile`, 
                `<div style="display: flex; flex-direction: column; gap: 10px;">
                    <div class="setting-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span><strong>Name:</strong></span> <span>${chefName}</span></div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span><strong>Email:</strong></span> <span>${chefEmail}</span></div>
                    <div class="setting-item" style="display: flex; justify-content: space-between; padding: 8px 0;"><span><strong>Role:</strong></span> <span style="color: var(--success);">Master Chef</span></div>
                </div>`,
                'modal-right'
            );
        });
    }

    const settingsLinks = document.querySelectorAll('.nav-links a');
    settingsLinks.forEach(link => {
        if (link.textContent.includes('Settings')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const settingsHTML = `
                    <div class="settings-list" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-bell"></i> Push Notifications</span>
                            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                        </div>
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-moon"></i> Dark Theme</span>
                            <label class="switch"><input type="checkbox" checked disabled><span class="slider"></span></label>
                        </div>
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-volume-high"></i> Kitchen Sounds</span>
                            <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
                        </div>
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-print"></i> Auto-Print KOT</span>
                            <label class="switch"><input type="checkbox"><span class="slider"></span></label>
                        </div>
                    </div>
                `;
                showCustomAlert(
                    `<i class="fa-solid fa-sliders" style="color: var(--success);"></i> Preferences`, 
                    settingsHTML,
                    'modal-left'
                );
            });
        }
    });


    // ==========================================
    // 8. SECURE LOGOUT LOGIC
    // ==========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to clock out?")) {
                localStorage.removeItem('tasteForgeChefName');
                localStorage.removeItem('tasteForgeChefEmail');
                localStorage.removeItem('tasteForgeChefPassword');
                window.location.href = '../index.html'; 
            }
        });
    }

    // ==========================================
    // 9. KITCHEN INVENTORY LOGIC
    // ==========================================
    window.renderChefInventory = function() {
        const container = document.getElementById('chefInventoryContainer');
        if(!container) return;

        let inventoryData = JSON.parse(localStorage.getItem('tasteForgeInventory'));
        if (!inventoryData || inventoryData.length === 0) {
            inventoryData = [
                { name: 'Premium Beef Patties', category: 'Meat', stock: 45, unit: 'pcs' },
                { name: 'Fresh Mozzarella', category: 'Dairy', stock: 12, unit: 'kg' },
                { name: 'Organic Quinoa', category: 'Grains', stock: 8, unit: 'kg' },
                { name: 'Cherry Tomatoes', category: 'Vegetables', stock: 3, unit: 'kg' },
                { name: 'Peri-Peri Sauce', category: 'Sauce', stock: 15, unit: 'L' }
            ];
            localStorage.setItem('tasteForgeInventory', JSON.stringify(inventoryData));
        }

        let html = '';
        inventoryData.forEach((item, index) => {
            let statusColor = '';
            let statusText = '';
            let icon = '';

            if (item.stock > 15) {
                statusColor = '#cbf122'; 
                statusText = 'In Stock';
                icon = 'fa-check-circle';
            } else if (item.stock > 5) {
                statusColor = '#ffb142'; 
                statusText = 'Low Stock';
                icon = 'fa-triangle-exclamation';
            } else {
                statusColor = '#ff4757'; 
                statusText = 'Critical';
                icon = 'fa-circle-xmark';
            }

            html += `
                <div class="order-card" style="border-color: rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;">
                    <div class="order-header" style="margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                        <span class="order-id" style="font-size: 18px;">${item.name}</span>
                        <span class="order-time" style="background: rgba(255,255,255,0.1); color: #ccc;">${item.category}</span>
                    </div>
                    <div style="flex-grow: 1; margin-bottom: 20px;">
                        <p style="font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 5px;">${item.stock} <span style="font-size: 14px; color: #888; font-weight: normal;">${item.unit}</span></p>
                        <p style="color: ${statusColor}; font-weight: 600; font-size: 14px;"><i class="fa-solid ${icon}"></i> ${statusText}</p>
                    </div>
                    <button class="btn-cook" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid rgba(255,255,255,0.1);" onclick="restockChefItem(${index})">
                        <i class="fa-solid fa-boxes-packing"></i> Update Stock
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    };

    window.restockChefItem = function(index) {
        let inventoryData = JSON.parse(localStorage.getItem('tasteForgeInventory')) || [];
        inventoryData[index].stock += 20; 
        localStorage.setItem('tasteForgeInventory', JSON.stringify(inventoryData));
        renderChefInventory(); 
        alert(`Stock updated for ${inventoryData[index].name}!`);
    };

    // Initialize Dashboard
    renderPendingOrders();
});