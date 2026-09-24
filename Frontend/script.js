document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const startBtn = document.getElementById('startBtn');
    const loginBtn = document.getElementById('loginBtn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    console.log('Menu Button:', menuBtn);
    console.log('Dropdown Menu:', dropdownMenu);

    // Add interactivity to the Primary Button - navigate to Menu Page
    if (startBtn && startBtn.tagName !== 'A') {
        startBtn.addEventListener('click', () => {
            window.location.href = 'menu_page/index.html';
        });
    }

    // Add interactivity to the Secondary Button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Opening authentication modal...');
        });
    }

    // Handle Active State for Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // e.preventDefault();  <--- DELETE OR COMMENT OUT THIS LINE
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu Dropdown Toggle - Simplified
    if (menuBtn) {
        console.log('Adding click listener to menu button');
        menuBtn.addEventListener('click', function(e) {
            console.log('Menu button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            if (dropdownMenu) {
                console.log('Toggling dropdown');
                dropdownMenu.classList.toggle('active');
                console.log('Dropdown active:', dropdownMenu.classList.contains('active'));
            }
        });
    }

    // Close dropdown when clicking outside
    if (dropdownMenu) {
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
});