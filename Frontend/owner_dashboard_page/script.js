document.addEventListener('DOMContentLoaded', () => {

    const storedName = localStorage.getItem('tasteForgeOwnerName') || 'Owner';
    const adminSidebarName = document.getElementById('adminSidebarName');
    if(adminSidebarName) adminSidebarName.innerText = storedName.split(' ')[0];

    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const adminOrderList = document.getElementById('adminOrderList');
    const adminCustomerList = document.getElementById('adminCustomerList');
    const headerNotiBadge = document.getElementById('headerNotiBadge');

    // ==============================================================
    // 1. LOAD AND RENDER ORDERS & CUSTOMERS (🔥 SYNCED WITH CHEF)
    // ==============================================================
    window.loadAdminOrders = function() {
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        
        let totalRev = 0;
        let activeOrdersCount = 0;
        let htmlOrders = '';
        let htmlCustomers = '';
        
        if (orderHistory.length === 0) {
            adminOrderList.innerHTML = `<tr><td colspan="6" class="empty-msg">No orders have been placed yet.</td></tr>`;
            if(adminCustomerList) adminCustomerList.innerHTML = `<tr><td colspan="4" class="empty-msg">No customers found.</td></tr>`;
            updateStats(0, 0, 0);
            return;
        }

        orderHistory.slice().reverse().forEach(order => {
            const amount = parseFloat(order.amount || 0);
            totalRev += amount;
            
            const status = order.status || 'Pending';
            if (status === 'Pending' || status === 'Prepared') activeOrdersCount++;

            // 🔥 Dynamic Status Badge and Action Buttons Logic
            let statusBadge = '';
            let actionBtn = '';

            if (status === 'Pending') {
                // Chef is cooking, Owner cannot complete it yet
                statusBadge = `<span class="status-badge" style="background: rgba(255, 177, 66, 0.1); color: #ffb142; border: 1px solid #ffb142;"><i class="fa-solid fa-fire"></i> Cooking</span>`;
                actionBtn = `<button class="action-btn" disabled style="background: #333; color: #888; cursor: not-allowed;"><i class="fa-solid fa-hourglass-half"></i> Waiting for Chef</button>`;
            } else if (status === 'Prepared') {
                // Chef is done, Owner can now Complete & Cash Out
                statusBadge = `<span class="status-badge" style="background: rgba(0, 210, 255, 0.1); color: #00d2ff; border: 1px solid #00d2ff;"><i class="fa-solid fa-bell-concierge"></i> Ready to Serve</span>`;
                actionBtn = `<button class="action-btn" onclick="markAsComplete('${order.id}')" style="background: var(--accent); color: #000;"><i class="fa-solid fa-check-double"></i> Complete & Cash</button>`;
            } else {
                // Already completed
                statusBadge = `<span class="status-badge completed"><i class="fa-solid fa-check"></i> Completed</span>`;
                actionBtn = `<button class="action-btn" disabled style="background: rgba(46, 213, 115, 0.2); color: var(--status-completed);"><i class="fa-solid fa-receipt"></i> Paid</button>`;
            }

            htmlOrders += `
                <tr>
                    <td style="font-weight: 600;">${order.id}</td>
                    <td>${order.date}</td>
                    <td>${order.name}</td>
                    <td style="color: var(--accent); font-weight: 600;">$${amount.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
            
            const custName = order.customerName || 'Guest Customer';
            const custEmail = order.customerEmail || 'guest@tasteforge.com';
            
            htmlCustomers += `
                <tr>
                    <td><i class="fa-solid fa-user" style="color: var(--text-muted); margin-right: 8px;"></i> ${custName}</td>
                    <td style="color: var(--text-muted);">${custEmail}</td>
                    <td style="font-weight: 600; color: #fff;">${order.id}</td>
                    <td style="color: var(--accent); font-weight: 600;">$${amount.toFixed(2)}</td>
                </tr>
            `;
        });

        adminOrderList.innerHTML = htmlOrders;
        if(adminCustomerList) adminCustomerList.innerHTML = htmlCustomers;
        
        updateStats(totalRev, orderHistory.length, activeOrdersCount);
    };

    function updateStats(revenue, total, pending) {
        if(totalRevenueEl) totalRevenueEl.innerText = `$${revenue.toFixed(2)}`;
        if(totalOrdersEl) totalOrdersEl.innerText = total;
        if(pendingOrdersEl) pendingOrdersEl.innerText = pending;

        if(headerNotiBadge) {
            if (pending > 0) {
                headerNotiBadge.innerText = pending;
                headerNotiBadge.style.display = 'inline-block';
            } else {
                headerNotiBadge.style.display = 'none';
            }
        }
    }

    // ==============================================================
    // 2. MARK ORDER AS COMPLETE
    // ==============================================================
    window.markAsComplete = function(orderId) {
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        let updated = false;
        orderHistory = orderHistory.map(order => {
            if (order.id === orderId) {
                order.status = 'Completed';
                updated = true;
            }
            return order;
        });

        if (updated) {
            localStorage.setItem('tasteForgeOrders', JSON.stringify(orderHistory));
            loadAdminOrders();
        }
    };

    // ==============================================================
    // 3. LOAD MENU ITEMS FROM JSON (USING data.json)
    // ==============================================================
    async function loadAdminMenu() {
        const adminMenuList = document.getElementById('adminMenuList');
        if(!adminMenuList) return;
        try {
            // 🔥 Using data.json exactly as you requested
            const response = await fetch('../menu_page/data.json');
            if(!response.ok) throw new Error("JSON Fetch Failed");
            const data = await response.json();
            
            adminMenuList.innerHTML = '';
            data.forEach(item => {
                // Magic Image Fixer
                let imgData = item.image || item.img || item.picture || item.pic || item.imageUrl;
                let imageSrc = '../sign_up_page/TasteForge_Logo.png'; 
                if (imgData) {
                    if (imgData.startsWith('http') || imgData.startsWith('../')) {
                        imageSrc = imgData;
                    } else {
                        imageSrc = `../menu_page/${imgData}`;
                    }
                }

                adminMenuList.innerHTML += `
                    <div class="admin-menu-card">
                        <img src="${imageSrc}" alt="${item.name}">
                        <h4>${item.name || 'Unknown Item'}</h4>
                        <p style="color: var(--accent);">$${parseFloat(item.price || 0).toFixed(2)}</p>
                        <button onclick="alert('Edit feature coming soon!')">Edit Item</button>
                    </div>
                `;
            });
        } catch(err) {
            console.error(err);
            adminMenuList.innerHTML = `<p class="empty-msg" style="grid-column: 1 / -1;">Could not load menu data. Ensure your JSON file path is correct.</p>`;
        }
    }

    // ==============================================================
    // 4. SIDEBAR TAB SWITCHING LOGIC
    // ==============================================================
    const tabs = {
        'tabOverview': ['overviewSection'],
        'tabOrders': ['ordersSection'],
        'tabMenu': ['menuSection'],
        'tabCustomers': ['customersSection'],
        'tabSettings': ['settingsSection']
    };

    function switchAdminTab(activeTabId) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const allSections = ['overviewSection', 'ordersSection', 'menuSection', 'customersSection', 'settingsSection'];
        allSections.forEach(sec => {
            if(document.getElementById(sec)) document.getElementById(sec).style.display = 'none';
        });

        document.getElementById(activeTabId).classList.add('active');
        tabs[activeTabId].forEach(sec => {
            if (document.getElementById(sec)) {
                document.getElementById(sec).style.display = sec === 'overviewSection' ? 'grid' : 'block';
            }
        });

        if(activeTabId === 'tabMenu') loadAdminMenu();
    }
    
    Object.keys(tabs).forEach(tabId => {
        const btn = document.getElementById(tabId);
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); switchAdminTab(tabId); });
    });

    // ==============================================================
    // 5. HEADER NOTIFICATION CLICK
    // ==============================================================
    const headerNotiBtn = document.getElementById('headerNotiBtn');
    if(headerNotiBtn) {
        headerNotiBtn.addEventListener('click', () => {
            switchAdminTab('tabOrders');
        });
    }

    // ==============================================================
    // 6. ADMIN LOGOUT LOGIC
    // ==============================================================
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
        adminLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to exit the Owner Workspace?")) {
                localStorage.removeItem('tasteForgeOwnerName');
                localStorage.removeItem('tasteForgeOwnerEmail');
                localStorage.removeItem('tasteForgeOwnerPassword');
                window.location.href = '../index.html'; 
            }
        });
    }

    loadAdminOrders();
    switchAdminTab('tabOverview');
    
    // ==============================================================
    // 7. PROFILE DROPDOWN LOGIC
    // ==============================================================
    const adminProfileBtn = document.getElementById('adminProfileBtn');
    const adminProfileDropdown = document.getElementById('adminProfileDropdown');
    const dropdownAdminName = document.getElementById('dropdownAdminName');
    const dropdownAdminEmail = document.getElementById('dropdownAdminEmail');
    const dropdownSettingsBtn = document.getElementById('dropdownSettingsBtn');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

    if (adminProfileBtn && adminProfileDropdown) {
        if (dropdownAdminName) dropdownAdminName.innerText = storedName;
        const storedEmail = localStorage.getItem('tasteForgeOwnerEmail') || 'owner@tasteforge.com';
        if (dropdownAdminEmail) dropdownAdminEmail.innerText = storedEmail;

        adminProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminProfileDropdown.style.display = adminProfileDropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            adminProfileDropdown.style.display = 'none';
        });

        if (dropdownSettingsBtn) {
            dropdownSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchAdminTab('tabSettings'); 
                adminProfileDropdown.style.display = 'none';
            });
        }

        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Are you sure you want to exit the Owner Workspace?")) {
                    localStorage.removeItem('tasteForgeOwnerName');
                    localStorage.removeItem('tasteForgeOwnerEmail');
                    localStorage.removeItem('tasteForgeOwnerPassword');
                    window.location.href = '../index.html'; 
                }
            });
        }
    }
});