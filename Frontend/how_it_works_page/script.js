document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Menu Dropdown Toggle
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // 2. Timeline Card Floating Animation
    const stepCards = document.querySelectorAll(".step-column");
    if (stepCards.length > 0) {
        // Hide them initially
        stepCards.forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(40px)";
            card.style.transition = `all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.2}s`;
        });

        // Show them with a slight delay
        setTimeout(() => {
            stepCards.forEach(card => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            });
        }, 200);
    }
});