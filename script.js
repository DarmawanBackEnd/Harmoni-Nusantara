// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const languageSelect = document.getElementById('language-select');
const languageSelectMobile = document.getElementById('language-select-mobile');

// Navbar is solid by default now (no transition on scroll)

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Observe collection cards
    const collectionCards = document.querySelectorAll('.collection-card');
    collectionCards.forEach(card => {
        observer.observe(card);
    });

    // Observe value cards
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach(card => {
        observer.observe(card);
    });

    // Observe testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        observer.observe(card);
    });

    // Observe about section
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        observer.observe(aboutSection);
    }

    // Observe contact section
    const contactSection = document.querySelector('.contact');
    if (contactSection) {
        observer.observe(contactSection);
    }
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
});

// Search overlay
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

function openSearch() {
    searchOverlay.classList.add('active');
    searchOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput.focus(), 150);
}

function closeSearch() {
    searchOverlay.classList.remove('active');
    searchOverlay.setAttribute('aria-hidden', 'true');
    if (searchResults) searchResults.innerHTML = '';
}

if (searchToggle) searchToggle.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (searchOverlay) searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
});

// Build product index from collection cards
function getAllProducts() {
    const products = [];
    document.querySelectorAll('.collection-card').forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const price = Number(card.getAttribute('data-price') || 0);
        // Try image src if exists
        const imgEl = card.querySelector('.card-image img');
        const img = imgEl ? imgEl.getAttribute('src') : '';
        products.push({ name, price, img });
    });
    return products;
}

function renderSearchResults(items) {
    if (!searchResults) return;
    if (!items.length) {
        searchResults.innerHTML = '';
        return;
    }
    searchResults.innerHTML = items.map((p, idx) => `
        <div class="search-result-item" data-index="${idx}">
            <div class="search-result-main">
                <div class="search-result-name">${p.name}</div>
                <div class="search-result-price">${formatRupiah(p.price)}</div>
            </div>
            <div class="search-result-actions">
                <button class="search-add-btn" data-action="add" data-name="${p.name}" data-price="${p.price}">Tambah</button>
            </div>
        </div>
    `).join('');
}

let productIndex = getAllProducts();

function handleSearchInput() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (!q) {
        renderSearchResults([]);
        return;
    }
    const results = productIndex.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
    renderSearchResults(results);
}

if (searchInput) searchInput.addEventListener('input', handleSearchInput);

// Delegate add from search results
if (searchResults) {
    searchResults.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="add"]');
        if (!btn) return;
        const name = btn.getAttribute('data-name');
        const price = Number(btn.getAttribute('data-price') || 0);
        if (name && price) addToCart(name, price);
    });
}

// Cart drawer
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const whatsappCheckout = document.getElementById('whatsapp-checkout');

const cart = [];

function openCart() {
    cartDrawer.classList.add('active');
    cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartDrawer.setAttribute('aria-hidden', 'true');
}

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

function updateCartUI() {
    // Count
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;

    // Items
    cartItemsEl.innerHTML = '';
    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" data-action="dec" data-index="${index}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="inc" data-index="${index}">+</button>
                    <button class="qty-btn" data-action="remove" data-index="${index}">×</button>
                </div>
            </div>
            <div class="cart-item-price">${formatRupiah(item.price * item.qty)}</div>
        `;
        cartItemsEl.appendChild(row);
    });

    // Total
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = formatRupiah(total);

    // WhatsApp link (localized)
    const phone = '6289607793513';
    const lines = cart.map(i => `- ${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}`);
    const lang = localStorage.getItem('hn_lang') || 'id';
    const header = lang==='id' ? 'Halo Harmoni Nusantara,' : 'Hello Harmoni Nusantara,';
    const want = lang==='id' ? 'Saya ingin memesan:' : 'I would like to order:';
    const nameLbl = lang==='id' ? 'Nama' : 'Name';
    const addrLbl = lang==='id' ? 'Alamat' : 'Address';
    const payLbl = lang==='id' ? 'Metode Pembayaran' : 'Payment Method';
    const totalLbl = lang==='id' ? 'Total' : 'Total';
    const message = `${encodeURIComponent(header)}%0A${encodeURIComponent(want)}%0A${encodeURIComponent(lines.join('\n'))}${lines.length ? '%0A' : ''}${encodeURIComponent(totalLbl + ': ' + formatRupiah(total))}%0A%0A${encodeURIComponent(nameLbl)}:%0A${encodeURIComponent(addrLbl)}:%0A${encodeURIComponent(payLbl)}:`;
    whatsappCheckout.href = `https://wa.me/${phone}?text=${message}`;
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty += 1; else cart.push({ name, price: Number(price), qty: 1 });
    updateCartUI();
    openCart();
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
        const card = btn.closest('.collection-card');
        const name = card?.getAttribute('data-name');
        const price = Number(card?.getAttribute('data-price') || 0);
        if (name && price) addToCart(name, price);
    }

    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
        const index = Number(qtyBtn.getAttribute('data-index'));
        const action = qtyBtn.getAttribute('data-action');
        if (action === 'inc') cart[index].qty += 1;
        if (action === 'dec') cart[index].qty = Math.max(1, cart[index].qty - 1);
        if (action === 'remove') cart.splice(index, 1);
        updateCartUI();
    }
});

if (cartToggle) cartToggle.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);

// CTA button interactions
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .cta-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Collection card hover effects
const collectionCards = document.querySelectorAll('.collection-card');
collectionCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Slider logic for collections
const track = document.getElementById('collections-track');
const prevBtn = document.getElementById('slider-prev');
const nextBtn = document.getElementById('slider-next');

function slideByViewport(direction) {
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const gap = 32; // 2rem
    const cardWidth = (trackRect.width - 3 * gap) / 4; // 4 per view
    const delta = direction * (cardWidth + gap);
    track.scrollBy({ left: delta, behavior: 'smooth' });
}

if (prevBtn) prevBtn.addEventListener('click', () => slideByViewport(-1));
if (nextBtn) nextBtn.addEventListener('click', () => slideByViewport(1));

// Populate visible prices from data-price (format Rupiah)
function syncCardPrices() {
    document.querySelectorAll('.collection-card').forEach(card => {
        const price = Number(card.getAttribute('data-price') || 0);
        const priceEl = card.querySelector('.card-price');
        if (priceEl) priceEl.textContent = formatRupiah(price);
    });
}

document.addEventListener('DOMContentLoaded', syncCardPrices);

// Value card hover effects
const valueCards = document.querySelectorAll('.value-card');
valueCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('.value-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('.value-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Contact item hover effects
const contactItems = document.querySelectorAll('.contact-item');
contactItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('.contact-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1)';
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('.contact-icon');
        if (icon) {
            icon.style.transform = 'scale(1)';
        }
    });
});

// Smooth reveal animation for sections
const revealElements = document.querySelectorAll('.about, .collections, .values, .contact');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)';
    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    revealObserver.observe(element);
});

// Navbar link active state
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Add active state styles
const activeStyle = document.createElement('style');
activeStyle.textContent = `
    .nav-link.active {
        color: #E95420;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeStyle);

// Preloader (optional)
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add loaded class styles
const loadedStyle = document.createElement('style');
loadedStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadedStyle);

// Scroll to top functionality
const scrollToTopButton = document.createElement('button');
scrollToTopButton.innerHTML = '↑';
scrollToTopButton.className = 'scroll-to-top';
scrollToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #E95420 0%, #B53629 100%);
    color: #FFFFFF;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 5px 20px rgba(102, 102, 102, 0.3);
`;

document.body.appendChild(scrollToTopButton);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollToTopButton.style.opacity = '1';
        scrollToTopButton.style.visibility = 'visible';
    } else {
        scrollToTopButton.style.opacity = '0';
        scrollToTopButton.style.visibility = 'hidden';
    }
});

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect for scroll to top button
scrollToTopButton.addEventListener('mouseenter', () => {
    scrollToTopButton.style.transform = 'scale(1.1)';
});

scrollToTopButton.addEventListener('mouseleave', () => {
    scrollToTopButton.style.transform = 'scale(1)';
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    // Navbar scroll effect
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Parallax effect
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
    
    // Scroll to top button visibility
    if (window.scrollY > 500) {
        scrollToTopButton.style.opacity = '1';
        scrollToTopButton.style.visibility = 'visible';
    } else {
        scrollToTopButton.style.opacity = '0';
        scrollToTopButton.style.visibility = 'hidden';
    }
}, 10);

window.addEventListener('scroll', throttledScrollHandler);

// i18n translations
const translations = {
    id: {
        'nav.home': 'Beranda',
        'nav.about': 'Tentang',
        'nav.collections': 'Koleksi',
        'nav.contact': 'Kontak',
        'hero.title': 'Keanggunan Buatan Tangan,\nTerinspirasi oleh Indonesia',
        'hero.subtitle': 'Setiap karya adalah kisah, dibuat dengan cinta dan tradisi',
        'cta.button': 'Jelajahi Koleksi',
        'about.title': 'Harmoni Nusantara',
        'about.description1': 'Lahir dari apresiasi mendalam terhadap kerajinan Indonesia, Harmoni Nusantara merayakan warisan kaya kepulauan kita. Setiap karya dalam koleksi kami menceritakan kisah tradisi, keterampilan, dan keindahan abadi yang ditemukan dalam seni buatan tangan.',
        'about.description2': 'Kami bekerja langsung dengan perajin lokal di seluruh Indonesia, memastikan praktik perdagangan yang adil sekaligus melestarikan teknik yang telah berusia berabad-abad. Dari motif batik yang rumit hingga perhiasan yang halus, setiap produk mencerminkan jiwa budaya Indonesia.',
        'owner.title': 'Dari Pendiri',
        'owner.description1': 'Harmoni Nusantara lahir dari visi untuk melestarikan dan berbagi keindahan abadi kerajinan Indonesia kepada dunia. Sebagai pendiri, saya percaya setiap karya buatan tangan tidak hanya memiliki nilai seni tetapi juga jiwa perajin yang menciptakannya.',
        'owner.description2': 'Melalui perjalanan ini, tujuan saya adalah memberdayakan perajin lokal, merayakan warisan budaya, dan membawa kehangatan Indonesia ke dalam kehidupan sehari-hari Anda.',
        'values.title': 'Janji Kami',
        'values.quality.title': 'Kualitas Buatan Tangan',
        'values.quality.desc': 'Setiap karya dibuat dengan hati-hati oleh perajin terampil menggunakan teknik tradisional yang diwariskan dari generasi ke generasi.',
        'values.artisans.title': 'Memberdayakan Perajin',
        'values.artisans.desc': 'Kami mendukung komunitas lokal dengan memberikan upah yang adil dan peluang pendapatan berkelanjutan bagi perajin Indonesia.',
        'values.shipping.title': 'Pengiriman Dunia',
        'values.shipping.desc': 'Kami mengirimkan karya indah kami ke seluruh dunia dengan penuh perhatian, membawa seni Indonesia ke depan pintu Anda.',
        'values.payment.title': 'Pembayaran Aman',
        'values.payment.desc': 'Berbelanja dengan percaya diri mengetahui informasi pembayaran Anda dilindungi dengan standar keamanan industri.',
        'collections.title': 'Koleksi Kami',
        'collections.subtitle': 'Temukan keindahan kerajinan Indonesia',
        'partners.title': 'Mitra Kami',
        'partners.subtitle': 'Dipercaya oleh komunitas perajin dan merek kreatif di seluruh Indonesia.',
        'col.asacinta.title': 'Asa Cinta',
        'col.asacinta.desc': 'Karya elegan terinspirasi motif tradisional Indonesia, dibuat dengan logam mulia dan batu alam.',
        'col.adiningrum.title': 'Adiningrum',
        'col.adiningrum.desc': 'Interpretasi modern dari pola batik klasik dalam syal, tas, dan dekorasi rumah.',
        'col.andhini.title': 'Andhini',
        'col.andhini.desc': 'Karya unik yang menampilkan ragam keterampilan para perajin Indonesia.',
        'col.selaras.title': 'Selaras',
        'col.selaras.desc': 'Hadirkan kehangatan dan keanggunan Indonesia ke ruang tinggal Anda.',
        'col.mangunkarsa.title': 'Mangun Karsa',
        'col.mangunkarsa.desc': 'Hadirkan kehangatan dan keanggunan Indonesia ke ruang tinggal Anda.',
        'col.banyubiru.title': 'Banyu Biru',
        'col.banyubiru.desc': 'Hadirkan kehangatan dan keanggunan Indonesia ke ruang tinggal Anda.',
        'button.addToCart': 'Tambah ke Keranjang',
        'cart.title': 'Keranjang',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout via WhatsApp',
        'search.placeholder': 'Cari produk...',
        'search.add': 'Tambah',
        'testimonials.title': 'Suara Pelanggan Kami',
        'testimonials.subtitle': 'Apa kata mereka tentang pengalaman dengan Harmoni Nusantara',
        'story.title': 'Kisah Kami',
        'story.subtitle': 'Setiap karya Harmoni Nusantara lebih dari sekadar buatan tangan — ia membawa hati dan jiwa para perajin kami, melestarikan tradisi dan membaginya kepada dunia.',
        'contact.title': 'Hubungi Kami',
        'contact.subtitle': 'Kami senang mendengar dari Anda — untuk kolaborasi, pesanan, atau sekadar menyapa.',
        'contact.email': 'Email',
        'contact.phone': 'Telepon',
        'contact.location': 'Lokasi',
        'footer.brand.desc': 'Dari Indonesia dengan cinta',
        'footer.menu': 'Menu',
        'footer.collections': 'Koleksi',
        'footer.follow': 'Ikuti Kami',
        'footer.home': 'Beranda',
        'footer.about': 'Tentang',
        'footer.contact': 'Kontak',
        'footer.batik': 'Batik',
        'footer.jewelry': 'Perhiasan',
        'footer.accessories': 'Aksesori',
        'footer.homeDecor': 'Dekorasi Rumah'
    },
    en: {
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.collections': 'Collections',
        'nav.contact': 'Contact',
        'hero.title': 'Handmade Elegance,\nInspired by Indonesia',
        'hero.subtitle': 'Each piece is a story, crafted with love and tradition',
        'about.title': 'Harmoni Nusantara',
        'about.description1': 'Born from a deep appreciation for Indonesian craftsmanship, Harmoni Nusantara celebrates the rich heritage of our archipelago. Each piece in our collection tells a story of tradition, skill, and the timeless beauty found in handmade artistry.',
        'about.description2': 'We work directly with local artisans across Indonesia, ensuring fair trade practices while preserving centuries-old techniques. From intricate batik patterns to delicate jewelry, every item reflects the soul of Indonesian culture.',
        'owner.title': 'From the Founder',
        'owner.description1': 'Harmoni Nusantara was born from a vision to preserve and share the timeless beauty of Indonesian craftsmanship with the world. As the founder, I believe every handmade piece carries not only artistry but also the soul of the artisan who created it.',
        'owner.description2': 'Through this journey, my goal is to empower local artisans, celebrate cultural heritage, and bring the warmth of Indonesia into your everyday life.',
        'cta.button': 'Explore Collection',
        'values.title': 'Our Promise',
        'values.quality.title': 'Handmade Quality',
        'values.quality.desc': 'Every piece is carefully crafted by skilled artisans using traditional techniques passed down through generations.',
        'values.artisans.title': 'Empowering Artisans',
        'values.artisans.desc': 'We support local communities by providing fair wages and sustainable income opportunities for Indonesian craftspeople.',
        'values.shipping.title': 'Worldwide Shipping',
        'values.shipping.desc': 'We deliver our beautiful pieces worldwide with care and attention, bringing Indonesian artistry to your doorstep.',
        'values.payment.title': 'Secure Payment',
        'values.payment.desc': 'Shop with confidence knowing your payment information is protected with industry-standard security measures.',
        'collections.title': 'Our Collections',
        'collections.subtitle': 'Discover the beauty of Indonesian craftsmanship',
        'partners.title': 'Our Partners',
        'partners.subtitle': 'Trusted by artisan communities and creative brands across Indonesia.',
        'col.asacinta.title': 'Asa Cinta',
        'col.asacinta.desc': 'Elegant pieces inspired by traditional Indonesian motifs, crafted with precious metals and natural stones.',
        'col.adiningrum.title': 'Adiningrum',
        'col.adiningrum.desc': 'Modern interpretations of classic batik patterns in scarves, bags, and home decor items.',
        'col.andhini.title': 'Andhini',
        'col.andhini.desc': 'Unique handmade items that showcase the diverse skills of Indonesian craftspeople.',
        'col.selaras.title': 'Selaras',
        'col.selaras.desc': 'Beautiful decorative pieces that bring Indonesian warmth and elegance to your living space.',
        'col.mangunkarsa.title': 'Mangun Karsa',
        'col.mangunkarsa.desc': 'Bring the warmth and elegance of Indonesia into your living space.',
        'col.banyubiru.title': 'Banyu Biru',
        'col.banyubiru.desc': 'Bring the warmth and elegance of Indonesia into your living space.',
        'button.addToCart': 'Add to Cart',
        'cart.title': 'Cart',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout via WhatsApp',
        'search.placeholder': 'Search products...',
        'search.add': 'Add',
        'testimonials.title': 'Hear from Our Customers',
        'testimonials.subtitle': 'What our customers say about their experience with Harmoni Nusantara',
        'story.title': 'Our Story',
        'story.subtitle': 'Every piece of Harmoni Nusantara is more than just handmade — it carries the heart and soul of our artisans, preserving traditions and sharing them with the world.',
        'contact.title': 'Get in Touch',
        'contact.subtitle': 'We’d love to hear from you! Reach out for collaborations, orders, or just to say hello.',
        'contact.email': 'Email',
        'contact.phone': 'Phone',
        'contact.location': 'Location',
        'footer.brand.desc': 'From Indonesia with love',
        'footer.menu': 'Menu',
        'footer.collections': 'Collections',
        'footer.follow': 'Follow Us',
        'footer.home': 'Home',
        'footer.about': 'About',
        'footer.contact': 'Contact',
        'footer.batik': 'Batik',
        'footer.jewelry': 'Jewelry',
        'footer.accessories': 'Accessories',
        'footer.homeDecor': 'Home Decor'
    }
};

function applyTranslations(lang) {
  // Save language preference
  localStorage.setItem('hn_lang', lang);
  
  // Apply translations to all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[lang][key];
    if (translation) {
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Special handling for elements that need innerHTML (like hero title with <br>)
  const heroTitle = document.querySelector('#home .hero-title');
  if (heroTitle && translations[lang]['hero.title']) {
    heroTitle.innerHTML = translations[lang]['hero.title'].replace('\\n', '<br>');
  }

  // Update search placeholder
  const searchInput = document.getElementById('search-input');
  if (searchInput && translations[lang]['search.placeholder']) {
    searchInput.placeholder = translations[lang]['search.placeholder'];
  }

  // Update cart elements
  const cartTitle = document.querySelector('#cart-drawer h3');
  if (cartTitle && translations[lang]['cart.title']) {
    cartTitle.textContent = translations[lang]['cart.title'];
  }

  const cartTotal = document.querySelector('#cart-drawer .cart-summary span');
  if (cartTotal && translations[lang]['cart.total']) {
    cartTotal.textContent = translations[lang]['cart.total'];
  }

  const cartCheckout = document.querySelector('#cart-drawer .checkout');
  if (cartCheckout && translations[lang]['cart.checkout']) {
    cartCheckout.textContent = translations[lang]['cart.checkout'];
  }

  // Update add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    if (translations[lang]['button.addToCart']) {
      button.textContent = translations[lang]['button.addToCart'];
    }
  });

  // Update search add buttons
  document.querySelectorAll('.search-add-btn').forEach(button => {
    if (translations[lang]['search.add']) {
      button.textContent = translations[lang]['search.add'];
    }
  });
}

// init language
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('hn_lang') || 'id';
    if (languageSelect) languageSelect.value = saved;
    if (languageSelectMobile) languageSelectMobile.value = saved;
    applyTranslations(saved);
});

if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        applyTranslations(languageSelect.value);
        if (languageSelectMobile) languageSelectMobile.value = languageSelect.value;
    });
}

if (languageSelectMobile) {
    languageSelectMobile.addEventListener('change', () => {
        applyTranslations(languageSelectMobile.value);
        if (languageSelect) languageSelect.value = languageSelectMobile.value;
    });
}

    //Artikel Coy
// ===== ARTICLE POPUP FUNCTIONALITY =====
    const articlesData = [
        {
            title: " Strategi Keuangan Pensiun yang Berkelanjutan",
            image: "aset/artikel-1.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Masa pensiun sering kali menjadi masa di mana pendapatan aktif berhenti, sehingga perencanaan keuangan menjadi lebih penting dari sebelumnya. Langkah pertama adalah memetakan semua sumber pendapatan yang akan Anda miliki, seperti dana pensiun dari perusahaan, tabungan pribadi, hasil investasi, atau penghasilan pasif dari properti dan usaha. Setelah itu, buatlah anggaran bulanan yang realistis dengan memprioritaskan kebutuhan pokok, biaya kesehatan, dan dana darurat. Jangan lupa untuk memperhitungkan inflasi yang dapat menggerus nilai uang di masa depan, serta mempersiapkan dana untuk pengeluaran tak terduga seperti perawatan medis.</p>
                <p>Selain itu, diversifikasi sumber pendapatan sangat disarankan agar Anda tidak bergantung pada satu sumber saja. Misalnya, kombinasikan dana pensiun dengan investasi pada instrumen berisiko rendah seperti obligasi pemerintah, deposito, atau reksa dana pasar uang. Lakukan evaluasi keuangan secara rutin setiap 6–12 bulan untuk memastikan rencana Anda tetap relevan. Dengan strategi yang terstruktur, masa pensiun bisa dijalani dengan tenang tanpa khawatir kehabisan dana.</p>
            `
        },
        {
            title: "Menjadi Pengusaha di Masa Pensiun",
            image: "aset/artikel-3.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Pensiun tidak harus berarti berhenti bekerja total. Justru, ini bisa menjadi kesempatan untuk memulai usaha yang sesuai passion tanpa tekanan seperti saat bekerja penuh waktu. Banyak pensiunan sukses menjalankan bisnis kuliner rumahan, usaha kerajinan, jasa konsultasi, hingga penyewaan properti. Kelebihannya, Anda bisa mengatur jam kerja sesuai kondisi fisik dan tetap merasa produktif. Modal usaha tidak selalu harus besar; yang penting adalah memanfaatkan keterampilan dan jaringan yang sudah dimiliki.</p>
                <p>Untuk memulai, lakukan riset pasar sederhana agar tahu apa yang dibutuhkan orang di sekitar Anda. Manfaatkan media sosial untuk promosi, karena biayanya minim tetapi jangkauannya luas. Jika memungkinkan, ikut program pelatihan kewirausahaan agar mendapat bimbingan dan jaringan baru. Usaha yang dikelola dengan baik tidak hanya memberi penghasilan tambahan, tetapi juga menjaga semangat hidup di masa pensiun.</p>
            `
        },
        {
            title: "Pentingnya Investasi untuk Pensiun Nyaman",
            image: "aset/artikel-4.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Investasi tetap relevan meskipun Anda sudah memasuki masa pensiun. Bedanya, fokus investasi sebaiknya beralih dari pertumbuhan agresif ke perlindungan aset. Instrumen seperti obligasi pemerintah, reksa dana pendapatan tetap, atau properti sewa dapat memberikan penghasilan pasif yang stabil. Jangan lupa untuk menyesuaikan portofolio dengan profil risiko Anda; di masa pensiun, keamanan modal menjadi prioritas utama dibandingkan mengejar keuntungan besar.</p>
                <p>Selain itu, selalu waspadai tawaran investasi yang menjanjikan keuntungan besar dalam waktu singkat. Banyak pensiunan menjadi target penipuan karena tergiur iming-iming return tinggi. Sebelum berinvestasi, lakukan pengecekan legalitas dan konsultasi dengan perencana keuangan atau pihak berpengalaman. Investasi yang tepat akan membantu menjaga kestabilan keuangan Anda hingga akhir hayat.</p>
            `
        },
        {
            title: "Menjaga Kesehatan Fisik dan Mental di Masa Pensiun",
            image: "aset/artikel-2.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Kesehatan adalah modal utama untuk menikmati masa pensiun. Jaga tubuh tetap bugar dengan olahraga ringan seperti jalan kaki, berenang, atau yoga yang dapat meningkatkan kebugaran tanpa membebani sendi. Perhatikan pola makan sehat dengan memperbanyak sayuran, buah, protein tanpa lemak, dan mengurangi gula serta garam. Pemeriksaan kesehatan rutin juga penting untuk mendeteksi penyakit sejak dini.</p>
                <p>Kesehatan mental pun tidak boleh diabaikan. Setelah pensiun, beberapa orang merasa kehilangan tujuan atau menjadi kesepian. Aktiflah di komunitas, ikuti kegiatan sosial, atau kembangkan hobi baru. Aktivitas sosial dapat mengurangi risiko depresi dan menjaga otak tetap aktif. Dengan tubuh yang sehat dan pikiran yang positif, masa pensiun akan terasa lebih bermakna.</p>
            `
        },
        {
            title: "Mempersiapkan Warisan untuk Keluarga",
            image: "aset/artikel-7.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Warisan adalah salah satu cara untuk memastikan kesejahteraan keluarga setelah Anda tiada. Persiapkan dokumen legal seperti surat wasiat atau akta hibah untuk memastikan pembagian aset berjalan lancar. Tentukan penerima warisan secara jelas dan pastikan mereka memahami prosesnya. Langkah ini penting untuk mencegah konflik keluarga di kemudian hari.</p>
                <p>Selain aset fisik, pertimbangkan juga untuk meninggalkan asuransi jiwa atau dana investasi yang dapat digunakan keluarga untuk melanjutkan kehidupan mereka. Warisan yang terencana bukan hanya soal harta, tetapi juga meninggalkan rasa aman dan kedamaian bagi orang-orang yang Anda cintai.</p>
            `
        },
        {
            title: "Menghadapi Tantangan Psikologis Pensiun",
            image: "aset/artikel-6.jpg",
            category: "Artikel",
            date: "28 Juli 2025",
            content: `
                <p>Pensiun membawa perubahan besar dalam kehidupan. Perubahan rutinitas dan hilangnya peran profesional bisa memicu stres atau depresi. Untuk mengatasinya, penting memiliki rencana aktivitas harian yang memberi makna, seperti berkebun, belajar hal baru, atau terlibat di kegiatan sosial. Menjaga hubungan dengan teman dan keluarga juga sangat membantu.</p>
                <p>Jika merasa kesulitan beradaptasi, jangan ragu untuk mencari bantuan profesional seperti psikolog atau konselor. Ingat, masa pensiun adalah kesempatan untuk membangun babak baru yang penuh kebebasan dan pilihan. Dengan sikap positif, Anda bisa menghadapi tantangan psikologis ini dan menjadikannya fase hidup yang memuaskan.</p>
            `
        }
    ];

    // Article popup functions
let scrollPosition = 0;

function openArticlePopup(index, event) {
  if (event) event.preventDefault();

  const popup = document.getElementById('popup-article');
  const article = articlesData[index];

  if (article) {
    document.getElementById('popup-hero-img').src = article.image;
    document.getElementById('popup-category').textContent = article.category;
    document.getElementById('popup-date').textContent = article.date;
    document.getElementById('popup-title').textContent = article.title;
    document.getElementById('popup-content-text').innerHTML = article.content;

    popup.classList.add('active');

    // Lock scroll
    scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  }
}

function closeArticlePopup() {
  const popup = document.getElementById('popup-article');
  popup.classList.remove('active');

  // Balikin scroll normal
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollPosition);
}



    function toggleAllArticles() {
        const hiddenArticles = document.getElementById('hidden-articles');
        const viewAllBtn = document.getElementById('view-all-btn');
        const btnText = viewAllBtn.querySelector('.btn-text');
        const btnIcon = viewAllBtn.querySelector('.btn-icon');
        
        if (hiddenArticles.classList.contains('hidden')) {
            hiddenArticles.classList.remove('hidden');
            btnText.textContent = 'Sembunyikan Artikel';
            btnIcon.textContent = '▲';
            viewAllBtn.classList.add('expanded');
        } else {
            hiddenArticles.classList.add('hidden');
            btnText.textContent = 'Lihat Semua Artikel';
            btnIcon.textContent = '▼';
            viewAllBtn.classList.remove('expanded');
        }
    }

    // Make functions globally available
    window.openArticlePopup = openArticlePopup;
    window.closeArticlePopup = closeArticlePopup;
    window.toggleAllArticles = toggleAllArticles;

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeArticlePopup();
        }
    });

    // Initialize impact slider after DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeImpactSlider();
    });

    function initializeImpactSlider() {
        const slider = document.getElementById('impact-slider');
        if (!slider) return;

        const track = slider.querySelector('.impact-track');
        const slides = Array.from(slider.querySelectorAll('.impact-slide'));
        const prev = slider.querySelector('.impact-prev');
        const next = slider.querySelector('.impact-next');

        let index = 0;

        function update() {
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
        }

        function goPrev() {
            index = (index - 1 + slides.length) % slides.length;
            update();
        }

        function goNext() {
            index = (index + 1) % slides.length;
            update();
        }

        prev && prev.addEventListener('click', goPrev);
        next && next.addEventListener('click', goNext);

        // swipe support
        let startX = 0; let isDown = false;
        slider.addEventListener('pointerdown', (e) => { isDown = true; startX = e.clientX; });
        slider.addEventListener('pointerup', (e) => {
            if (!isDown) return; isDown = false;
            const dx = e.clientX - startX;
            if (dx > 40) goPrev(); else if (dx < -40) goNext();
        });
        slider.addEventListener('pointerleave', () => { isDown = false; });

        update();
    }
