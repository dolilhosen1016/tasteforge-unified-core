document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Menu Dropdown Toggle (Navbar)
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // ড্রপডাউনের বাইরে ক্লিক করলে মেনু বন্ধ হবে
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // 2. Professional FAQ Accordion Animation
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // যদি অন্য কোনো FAQ খোলা থাকে, সেটা বন্ধ করে দেবে (স্মুথ প্রফেশনাল ফিল)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // যেটাতে ক্লিক করা হয়েছে, সেটাকে টগল (খুলবে/বন্ধ হবে) করবে
            item.classList.toggle('active');
        });
    });

});