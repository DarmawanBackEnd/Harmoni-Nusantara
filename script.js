// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

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

    // WhatsApp link
    const phone = '6289607793513'; // TODO: replace with real number
    const lines = cart.map(i => `- ${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}`);
    const message = `Halo Harmoni Nusantara,%0ASaya ingin memesan:%0A${lines.join('%0A')}${lines.length ? '%0A' : ''}Total: ${formatRupiah(total)}%0A%0ANama:%0AAlamat:%0AMetode Pembayaran:`;
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
