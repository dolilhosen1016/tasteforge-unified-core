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

        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // 2. Tab Navigation Logic (Switch between Help & Privacy)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // সব বাটন এবং কন্টেন্ট থেকে active ক্লাস সরিয়ে দেওয়া
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // যে বাটনে ক্লিক করা হয়েছে তাকে active করা
            btn.classList.add('active');
            
            // সেই অনুযায়ী কন্টেন্ট শো করানো
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Professional FAQ Accordion Animation
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // যদি অন্য কোনো FAQ খোলা থাকে, সেটা বন্ধ করে দেবে
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