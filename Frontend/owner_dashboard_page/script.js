document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. STRICT ADMIN AUTH CHECK
    // =========================================
    const userDataString = localStorage.getItem('tasteforge_user');
    const token = localStorage.getItem('tasteforge_token');

    if (!token || !userDataString || token === "null") {
        window.location.href = '../sign_in_page/sign_in_index.html';
        return;
    }

    const userData = JSON.parse(userDataString);
    // যদি সাধারণ ইউজার এখানে ঢোকার চেষ্টা করে, তবে কিক আউট করবে
    if (userData.role === 'user') {
        alert("Access Denied! You are not an Admin.");
        window.location.href = '../dashboard_page/index.html';
        return;
    }

    const storedName = userData.name || 'Admin';
    const adminSidebarName = document.getElementById('adminSidebarName');
    if(adminSidebarName) adminSidebarName.innerText = storedName.split(' ')[0];

    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const adminOrderList = document.getElementById('adminOrderList');
    const adminCustomerList = document.getElementById('adminCustomerList');
    const headerNotiBadge = document.getElementById('headerNotiBadge');

    // ==============================================================
    // 2. FETCH REAL-TIME ORDERS FROM DATABASE
    // ==============================================================
    window.loadAdminOrders = async function() {
        try {
            const response = await fetch('http://localhost:5000/api/orders/all');
            if (!response.ok) throw new Error("Failed to fetch");
            const orderHistory = await response.json();
            
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

            orderHistory.forEach(order => {
                const amount = parseFloat(order.totalAmount || 0);
                totalRev += amount;
                
                const status = order.status || 'Pending';
                if (status !== 'Completed') activeOrdersCount++;

                let statusBadge = '';
                if (status === 'Pending') {
                    statusBadge = `<span class="status-badge" style="background: rgba(255, 177, 66, 0.1); color: #ffb142; border: 1px solid #ffb142;"><i class="fa-solid fa-fire"></i> New/Cooking</span>`;
                } else if (status === 'Prepared' || status === 'Handover') {
                    statusBadge = `<span class="status-badge" style="background: rgba(0, 210, 255, 0.1); color: #00d2ff; border: 1px solid #00d2ff;"><i class="fa-solid fa-bell-concierge"></i> Handover</span>`;
                } else {
                    statusBadge = `<span class="status-badge completed"><i class="fa-solid fa-check"></i> Completed</span>`;
                }

                const displayId = order.tableNoOrTokenId || '#' + order._id.substring(0, 6).toUpperCase();
                const orderDate = new Date(order.createdAt).toLocaleDateString();

                htmlOrders += `
                    <tr>
                        <td style="font-weight: 600;">${displayId}</td>
                        <td>${orderDate}</td>
                        <td><span style="font-size:0.8rem; color:var(--text-muted)">${order.orderType}</span></td>
                        <td style="color: var(--accent); font-weight: 600;">$${amount.toFixed(2)}</td>
                        <td>${statusBadge}</td>
                        <td><button class="action-btn" disabled style="background: #333; color: #777;">Auto Managed</button></td>
                    </tr>
                `;
                
                const custEmail = order.userEmail || 'Guest / Walk-in';
                htmlCustomers += `
                    <tr>
                        <td><i class="fa-solid fa-user" style="color: var(--text-muted); margin-right: 8px;"></i> Customer</td>
                        <td style="color: var(--text-muted);">${custEmail}</td>
                        <td style="font-weight: 600; color: #fff;">${displayId}</td>
                        <td style="color: var(--accent); font-weight: 600;">$${amount.toFixed(2)}</td>
                    </tr>
                `;
            });

            adminOrderList.innerHTML = htmlOrders;
            if(adminCustomerList) adminCustomerList.innerHTML = htmlCustomers;
            updateStats(totalRev, orderHistory.length, activeOrdersCount);

        } catch (error) {
            console.error(error);
            adminOrderList.innerHTML = `<tr><td colspan="6" class="empty-msg" style="color:red;">Error connecting to database.</td></tr>`;
        }
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
    // 3. STAFF CREATION LOGIC (API)
    // ==============================================================
    const staffForm = document.getElementById('staffForm');
    if (staffForm) {
        staffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('staffName').value;
            const email = document.getElementById('staffEmail').value;
            const password = document.getElementById('staffPassword').value;
            const role = document.getElementById('staffRole').value;

            const submitBtn = staffForm.querySelector('button');
            submitBtn.innerText = "Creating...";

            try {
                const response = await fetch('http://localhost:5000/api/users/create-staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(`✅ Success: ${data.message}`);
                    staffForm.reset();
                } else {
                    alert(`❌ Error: ${data.error}`);
                }
            } catch (error) {
                alert("Server error while creating staff.");
            } finally {
                submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Create Account`;
            }
        });
    }

    // ==============================================================
    // 4. LOAD MENU ITEMS FROM DB
    // ==============================================================
    async function loadAdminMenu() {
        const adminMenuList = document.getElementById('adminMenuList');
        if(!adminMenuList) return;
        try {
            const response = await fetch('http://localhost:5000/api/menuitems/get-all');
            if(!response.ok) throw new Error("API Fetch Failed");
            const data = await response.json();
            
            adminMenuList.innerHTML = '';
            data.forEach(item => {
                adminMenuList.innerHTML += `
                    <div class="admin-menu-card">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <h4>${item.name || 'Unknown Item'}</h4>
                        <p style="color: var(--accent);">$${parseFloat(item.price || 0).toFixed(2)}</p>
                        <button onclick="alert('Menu editing unlocked in v2.0!')">Edit Item</button>
                    </div>
                `;
            });
        } catch(err) {
            console.error(err);
            adminMenuList.innerHTML = `<p class="empty-msg" style="grid-column: 1 / -1;">Database connection failed.</p>`;
        }
    }

    // ==============================================================
    // 5. SIDEBAR TAB SWITCHING LOGIC
    // ==============================================================
    const tabs = {
        'tabOverview': ['overviewSection'],
        'tabOrders': ['ordersSection'],
        'tabMenu': ['menuSection'],
        'tabCustomers': ['customersSection'],
        'tabSettings': ['settingsSection'],
        'tabStaff': ['staffSection']
    };

    function switchAdminTab(activeTabId) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const allSections = ['overviewSection', 'ordersSection', 'menuSection', 'customersSection', 'settingsSection', 'staffSection'];
        allSections.forEach(sec => {
            if(document.getElementById(sec)) document.getElementById(sec).style.display = 'none';
        });

        const activeBtn = document.getElementById(activeTabId);
        if (activeBtn) activeBtn.classList.add('active');
        
        if (tabs[activeTabId]) {
            tabs[activeTabId].forEach(sec => {
                if (document.getElementById(sec)) {
                    document.getElementById(sec).style.display = sec === 'overviewSection' ? 'grid' : 'block';
                }
            });
        }

        if(activeTabId === 'tabMenu') loadAdminMenu();
        if(activeTabId === 'tabOrders' || activeTabId === 'tabOverview') loadAdminOrders();
    }
    
    Object.keys(tabs).forEach(tabId => {
        const btn = document.getElementById(tabId);
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); switchAdminTab(tabId); });
    });

    // ==============================================================
    // 6. ADMIN LOGOUT & PROFILE DROPDOWN
    // ==============================================================
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
        adminLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to exit the Owner Workspace?")) {
                localStorage.removeItem('tasteforge_token');
                localStorage.removeItem('tasteforge_user');
                window.location.href = '../index.html'; 
            }
        });
    }

    const adminProfileBtn = document.getElementById('adminProfileBtn');
    const adminProfileDropdown = document.getElementById('adminProfileDropdown');
    const dropdownAdminName = document.getElementById('dropdownAdminName');
    const dropdownAdminEmail = document.getElementById('dropdownAdminEmail');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');

    if (adminProfileBtn && adminProfileDropdown) {
        if (dropdownAdminName) dropdownAdminName.innerText = storedName;
        if (dropdownAdminEmail) dropdownAdminEmail.innerText = userData.email || 'admin@tasteforge.com';

        adminProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminProfileDropdown.style.display = adminProfileDropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            adminProfileDropdown.style.display = 'none';
        });

        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Are you sure you want to exit the Owner Workspace?")) {
                    localStorage.removeItem('tasteforge_token');
                    localStorage.removeItem('tasteforge_user');
                    window.location.href = '../index.html'; 
                }
            });
        }
    }

    // Initialize View
    loadAdminOrders();
    switchAdminTab('tabOverview');
});