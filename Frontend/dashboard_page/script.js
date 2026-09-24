document.addEventListener('DOMContentLoaded', () => {

    const storedName = localStorage.getItem('tasteForgeUserName') || 'Guest User'; 
    const storedEmail = localStorage.getItem('tasteForgeUserEmail') || 'guest@tasteforge.com';

    document.getElementById('userNameDisplay').textContent = storedName.split(' ')[0];
    document.getElementById('dropdownName').textContent = storedName;
    
    const settingsNameInput = document.getElementById('settingsInputName');
    if(settingsNameInput) settingsNameInput.value = storedName;

    const dropdownEmail = document.getElementById('dropdownEmail');
    if(dropdownEmail) dropdownEmail.textContent = storedEmail;

    const settingsEmailInput = document.querySelector('.setting-group input[type="email"]');
    if(settingsEmailInput) settingsEmailInput.value = storedEmail;

    const currentHour = new Date().getHours();
    let timeGreeting = 'Good Evening';
    if (currentHour < 12) timeGreeting = 'Good Morning';
    else if (currentHour < 18) timeGreeting = 'Good Afternoon';
    document.getElementById('greetingMsg').innerHTML = `${timeGreeting}, <span id="userNameDisplay" style="color: white;">${storedName.split(' ')[0]}</span> <span class="wave">👋</span>`;

    // 2. FETCH JSON DATA FOR SAVED BUILDS
    async function loadSavedBuildsDashboard() {
        const buildsContainer = document.getElementById('savedBuildsContainer');
        try {
            const response = await fetch('../menu_page/data.json');
            if (!response.ok) throw new Error('JSON load failed');
            
            const menuData = await response.json();
            const selectedBuilds = menuData.filter(item => [2, 5, 9].includes(item.id));
            renderBuilds(selectedBuilds, buildsContainer);
        } catch (error) {
            const fallbackData = [
                { "id": 2, "name": "Midnight Craving Pizza", "category": "Cheat Day", "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80" },
                { "id": 5, "name": "Gym Fuel Platter", "category": "High Protein", "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80" },
                { "id": 9, "name": "Double Smash Cheeseburger", "category": "Cheat Day", "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" }
            ];
            renderBuilds(fallbackData, buildsContainer);
        }
    }

    function renderBuilds(builds, container) {
        if (!container) return;
        container.innerHTML = ''; 
        builds.forEach(build => {
            const cardHTML = `
                <div class="build-card" onclick="window.location.href='../menu_page/index.html'">
                    <img src="${build.imageUrl}" alt="${build.name}" class="build-img">
                    <button class="fav-btn"><i class="fa-solid fa-heart"></i></button>
                    <div class="build-info">
                        <h4>${build.name}</h4>
                        <p>${build.category}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
    loadSavedBuildsDashboard();

    // 3. DYNAMIC LOYALTY POINTS & ORDER TRACKING (🔥 LIVE SYNC UPDATED)
    const orderListContainer = document.getElementById('orderListContainer');
    const orderViewAllBtn = document.getElementById('orderViewAllBtn');
    const totalOrdersCount = document.getElementById('totalOrdersCount');
    const loyaltyPointsDisplay = document.getElementById('loyaltyPointsDisplay');
    const pointsProgressFill = document.getElementById('pointsProgressFill');
    const nextRewardText = document.getElementById('nextRewardText');
    
    window.renderOrderHistory = function(showAll = false) {
        if (!orderListContainer) return;
        
        let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
        let myOrders = orderHistory.filter(order => order.customerEmail === storedEmail);
        
        let totalItemsCrafted = myOrders?.length || 0; 
        let pointsPerMeal = 20; 
        let currentPoints = totalItemsCrafted * pointsPerMeal;
        let rewardMilestoneTarget = 500; 

        if (totalOrdersCount) totalOrdersCount.textContent = totalItemsCrafted;
        if (loyaltyPointsDisplay) loyaltyPointsDisplay.textContent = currentPoints;

        let progressPercentage = (currentPoints / rewardMilestoneTarget) * 100;
        progressPercentage = Math.min(progressPercentage, 100);
        if (pointsProgressFill) pointsProgressFill.style.width = `${progressPercentage}%`;
        if (nextRewardText) nextRewardText.textContent = `Next Reward: ${rewardMilestoneTarget} pts`;

        if (myOrders.length === 0) {
            orderListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-receipt"></i>
                    <p>You haven't crafted any meals yet.</p>
                    <a href="../menu_page/index.html" class="btn primary-btn" style="margin-top: 10px;">Craft Your First Meal</a>
                </div>
            `;
            if (orderViewAllBtn) orderViewAllBtn.style.display = 'none';
        } else {
            let htmlContent = '';
            let recentOrders = myOrders.slice().reverse(); 

            if (!showAll) {
                recentOrders = recentOrders.slice(0, 3);
                if (orderViewAllBtn) orderViewAllBtn.style.display = 'inline-block';
            } else {
                if (orderViewAllBtn) orderViewAllBtn.style.display = 'none';
            }
            
            recentOrders.forEach(order => {
                // 🔥 Dynamic Status Badge Logic
                let statusBadge = '';
                const status = order.status || 'Pending';

                if (status === 'Pending') {
                    statusBadge = `<span class="badge" style="background: rgba(255, 177, 66, 0.1); color: #ffb142; border: 1px solid rgba(255, 177, 66, 0.3);"><i class="fa-solid fa-fire"></i> Cooking</span>`;
                } else if (status === 'Prepared') {
                    statusBadge = `<span class="badge" style="background: rgba(0, 210, 255, 0.1); color: #00d2ff; border: 1px solid rgba(0, 210, 255, 0.3);"><i class="fa-solid fa-bell-concierge"></i> Ready to Serve</span>`;
                } else {
                    statusBadge = `<span class="badge delivered" style="background: rgba(212, 247, 81, 0.1); color: var(--brand-color); border: 1px solid rgba(212, 247, 81, 0.3);"><i class="fa-solid fa-check"></i> Completed</span>`;
                }

                htmlContent += `
                    <div class="order-row dash-card">
                        <div class="order-id">${order.id || '#TFP' + Math.floor(1000 + Math.random() * 9000)}</div>
                        <div class="order-date">${order.date || 'Today'}</div>
                        <div class="order-amount">$${parseFloat(order.amount).toFixed(2)}</div>
                        <div class="order-status">${statusBadge}</div>
                    </div>
                `;
            });
            orderListContainer.innerHTML = htmlContent;
        }
    };
    renderOrderHistory(false);

    // 🔥 MAGIC REAL-TIME SYNC: Listens for changes in localStorage from other tabs!
    window.addEventListener('storage', (e) => {
        if (e.key === 'tasteForgeOrders') {
            const isOrdersTabActive = document.querySelector('.sidebar-nav .nav-item:nth-child(3)').classList.contains('active');
            renderOrderHistory(isOrdersTabActive);
        }
    });

    // 4. ACTION DROPDOWNS
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notiDot = document.getElementById('notiDot');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
            if (notificationDropdown) notificationDropdown.classList.remove('active'); 
        });
    }
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            if (profileDropdown) profileDropdown.classList.remove('active'); 
            if(notiDot) notiDot.style.display = 'none';
        });
    }
    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('active');
        if (notificationDropdown) notificationDropdown.classList.remove('active');
    });

    // 5. SETTINGS POP-UP MODAL
    const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    if (settingsModal) {
        const openSettingsModal = (e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsModal.classList.add('active');
        };
        const closeSettingsModal = () => settingsModal.classList.remove('active');

        if(sidebarSettingsBtn) sidebarSettingsBtn.addEventListener('click', openSettingsModal);
        if(profileSettingsBtn) profileSettingsBtn.addEventListener('click', openSettingsModal);
        if(closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
        if(cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeSettingsModal);
        if(saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                alert('Changes saved successfully!');
                closeSettingsModal();
            });
        }
    }

    // 6. REWARDS POP-UP MODAL
    const sidebarRewardsBtn = document.getElementById('sidebarRewardsBtn');
    const rewardsModal = document.getElementById('rewardsModal');
    const closeRewardsBtn = document.getElementById('closeRewardsBtn');
    const modalRewardsPoints = document.getElementById('modalRewardsPoints');
    const rewardClaimButtons = document.querySelectorAll('.btn-claim-reward');

    if (sidebarRewardsBtn && rewardsModal) {
        sidebarRewardsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            let orderHistory = JSON.parse(localStorage.getItem('tasteForgeOrders')) || [];
            let currentPoints = orderHistory.filter(o => o.customerEmail === storedEmail).length * 20;
            if (modalRewardsPoints) modalRewardsPoints.textContent = `${currentPoints} PTS`;

            rewardClaimButtons.forEach(btn => {
                const cost = parseInt(btn.getAttribute('data-cost'));
                if (currentPoints >= cost) {
                    btn.classList.remove('locked');
                    btn.classList.add('unlocked');
                    btn.textContent = 'Claim';
                    btn.disabled = false;
                } else {
                    btn.classList.remove('unlocked');
                    btn.classList.add('locked');
                    btn.textContent = 'Locked';
                    btn.disabled = true;
                }
            });
            rewardsModal.classList.add('active');
        });

        if (closeRewardsBtn) closeRewardsBtn.addEventListener('click', () => rewardsModal.classList.remove('active'));
        window.addEventListener('click', (e) => {
            if (e.target === rewardsModal) rewardsModal.classList.remove('active');
        });
    }

    rewardClaimButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.classList.contains('unlocked')) {
                alert('Success! Reward voucher unlocked. Coupon code added to your active notification dashboard tray.');
                this.classList.remove('unlocked');
                this.classList.add('claimed');
                this.textContent = 'Claimed';
                this.disabled = true;
            }
        });
    });

    // 7. LOAD SAVED BUILDS LOGIC
    const userSavedBuildsContainer = document.getElementById('savedBuildsContainer');

    function loadUserSavedBuilds() {
        if (!userSavedBuildsContainer) return;

        let savedBuilds = JSON.parse(localStorage.getItem('tasteForgeSavedBuilds')) || [];

        if (savedBuilds.length === 0) {
            userSavedBuildsContainer.innerHTML = `<p style="color: #8e8e93; font-size: 1rem; grid-column: 1 / -1;">You haven't saved any custom builds yet.</p>`;
            return;
        }

        userSavedBuildsContainer.innerHTML = '';

        savedBuilds.forEach((build, index) => {
            userSavedBuildsContainer.innerHTML += `
                <div class="dash-card" style="background: #1c1c1e; padding: 20px; border-radius: 16px; border: 1px solid #2a2a2a;">
                    <h3 style="color: #fff; margin-bottom: 5px;">${build.name}</h3>
                    <p style="color: #8e8e93; font-size: 0.85rem; margin-bottom: 15px;">Saved on: ${build.savedDate}</p>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: var(--accent-lime, #c8fb2e); font-weight: bold; font-size: 1.2rem;">$${build.totalPrice.toFixed(2)}</span>
                        <span style="color: #fff; font-size: 0.9rem;">${build.totalCalories} kcal</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="orderSavedBuild(${index})" style="flex: 1; background: var(--accent-lime, #c8fb2e); color: #000; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Order Now</button>
                        <button onclick="deleteSavedBuild(${index})" style="background: rgba(255, 71, 87, 0.1); color: #ff4757; padding: 10px 15px; border: none; border-radius: 8px; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.orderSavedBuild = function(index) {
        let savedBuilds = JSON.parse(localStorage.getItem('tasteForgeSavedBuilds')) || [];
        let localCart = JSON.parse(localStorage.getItem('tasteForgeCartItems')) || [];
        localCart.push(savedBuilds[index]);
        localStorage.setItem('tasteForgeCartItems', JSON.stringify(localCart));
        alert("✨ Masterpiece added to your basket!");
    };

    window.deleteSavedBuild = function(index) {
        if(confirm("Are you sure you want to delete this build?")) {
            let savedBuilds = JSON.parse(localStorage.getItem('tasteForgeSavedBuilds')) || [];
            savedBuilds.splice(index, 1);
            localStorage.setItem('tasteForgeSavedBuilds', JSON.stringify(savedBuilds));
            loadUserSavedBuilds(); 
        }
    };
    loadUserSavedBuilds();

    // 8. LEFT SIDEBAR TAB LOGIC
    const tabDashBtn = document.querySelector('.sidebar-nav .nav-item:first-child');
    const tabOrdersBtn = document.querySelector('.sidebar-nav .nav-item:nth-child(3)');
    const tabSavedBtn = document.getElementById('sidebarSavedBtn');
    
    const sectionOverview = document.querySelector('.overview-cards');
    const sectionOrders = document.querySelector('.recent-orders-section');
    const sectionSavedBuilds = document.querySelector('.saved-builds-section');
    
    if(sectionSavedBuilds) sectionSavedBuilds.style.display = 'none';

    function switchDashboardTab(tabName) {
        if(tabDashBtn) tabDashBtn.classList.remove('active');
        if(tabOrdersBtn) tabOrdersBtn.classList.remove('active');
        if(tabSavedBtn) tabSavedBtn.classList.remove('active');

        if(tabName === 'dashboard') {
            if(tabDashBtn) tabDashBtn.classList.add('active');
            if(sectionOverview) sectionOverview.style.display = ''; 
            if(sectionOrders) sectionOrders.style.display = '';
            if(sectionSavedBuilds) sectionSavedBuilds.style.display = 'none';
            renderOrderHistory(false);
        } 
        else if (tabName === 'orders') {
            if(tabOrdersBtn) tabOrdersBtn.classList.add('active');
            if(sectionOverview) sectionOverview.style.display = 'none'; 
            if(sectionOrders) sectionOrders.style.display = '';
            if(sectionSavedBuilds) sectionSavedBuilds.style.display = 'none';
            renderOrderHistory(true);
        }
        else if (tabName === 'saved') {
            if(tabSavedBtn) tabSavedBtn.classList.add('active');
            if(sectionOverview) sectionOverview.style.display = 'none';
            if(sectionOrders) sectionOrders.style.display = 'none';
            if(sectionSavedBuilds) sectionSavedBuilds.style.display = 'block';
            if (typeof loadUserSavedBuilds === "function") loadUserSavedBuilds();
        }
    }

    if (tabDashBtn) tabDashBtn.onclick = (e) => { e.preventDefault(); switchDashboardTab('dashboard'); };
    if (tabOrdersBtn) tabOrdersBtn.onclick = (e) => { e.preventDefault(); switchDashboardTab('orders'); };
    if (tabSavedBtn) tabSavedBtn.onclick = (e) => { e.preventDefault(); switchDashboardTab('saved'); };

    if (orderViewAllBtn) {
        orderViewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchDashboardTab('orders');
        });
    }

    // 9. SECURE LOGOUT LOGIC (SNIPER MODE)
    const logoutButtons = document.querySelectorAll('.logout-btn, .logout');

    if (logoutButtons.length > 0) {
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("Are you sure you want to sign out?")) {
                    localStorage.removeItem('tasteForgeUserName');
                    localStorage.removeItem('tasteForgeUserEmail');
                    localStorage.removeItem('tasteForgeUserPassword');
                    localStorage.removeItem('tasteForgeCartItems');
                    window.location.href = '../index.html'; 
                }
            });
        });
    }
});