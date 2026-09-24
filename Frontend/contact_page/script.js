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

    // 2. Professional Form Submit Animation
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // পেজ রিলোড হওয়া বন্ধ করবে
            
            // বাটনের টেক্সট পরিবর্তন করে সেন্ডিং ইফেক্ট
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.style.opacity = '0.8';

            // ফেক ডিলে (Fake Delay) দিয়ে প্রফেশনাল সাকসেস মেসেজ শো করানো
            setTimeout(() => {
                submitBtn.classList.add('success');
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
                submitBtn.style.opacity = '1';
                
                // ফর্মের ফিল্ডগুলো ক্লিয়ার করে দেওয়া
                contactForm.reset();

                // ৩ সেকেন্ড পর আবার আগের অবস্থায় ফিরে আসা
                setTimeout(() => {
                    submitBtn.classList.remove('success');
                    submitBtn.innerHTML = originalText;
                }, 3000);

            }, 1500); // ১.৫ সেকেন্ডের জন্য সেন্ডিং অ্যানিমেশন চলবে
        });
    }

});