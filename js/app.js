document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderSection('explore');
    setupNavigation();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            showToast(`Opening ${section.charAt(0).toUpperCase() + section.slice(1)}`);
            renderSection(section);
        });
    });
}

function renderSection(section) {
    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = '';

    switch (section) {
        case 'explore':
            renderExplore(appContainer);
            break;
        case 'events':
            renderEvents(appContainer);
            break;
        case 'rewards':
            renderRewards(appContainer);
            break;
        case 'profile':
            renderProfile(appContainer);
            break;
    }
    lucide.createIcons();
}

function renderExplore(container) {
    const header = `
        <div class="mb-4">
            <h2 class="fw-bold">Hello, ${USER_DATA.name}!</h2>
            <p class="text-muted">Find amazing local shops</p>
        </div>
        <div class="search-bar">
            <i data-lucide="search" size="20"></i>
            <input type="text" placeholder="Search shops, crafts...">
        </div>
        <div class="category-scroll mb-4">
            <div class="category-item">All</div>
            <div class="category-item">Food & Drink</div>
            <div class="category-item">Crafts</div>
            <div class="category-item">Beauty</div>
            <div class="category-item">Leisure</div>
        </div>
        <h4 class="fw-bold mb-3">Featured Shops</h4>
    `;
    container.innerHTML = header;

    const shopList = document.createElement('div');
    SHOPS_DATA.forEach(shop => {
        const card = `
            <div class="card card-custom">
                <img src="${shop.image}" class="card-img-top" alt="${shop.name}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${shop.name}</h5>
                        <span class="promo-badge">${shop.promotion}</span>
                    </div>
                    <p class="text-muted small mb-2">${shop.category} • ★ ${shop.rating}</p>
                    <p class="small text-secondary mb-3">${shop.visits} people visited this week</p>
                    <button class="btn btn-primary-custom" onclick="showShopDetail(${shop.id})">View Shop</button>
                </div>
            </div>
        `;
        shopList.innerHTML += card;
    });
    container.appendChild(shopList);
}

function renderEvents(container) {
    const header = `
        <div class="mb-4">
            <h2 class="fw-bold">Local Events</h2>
            <p class="text-muted">Connect with your community</p>
        </div>
    `;
    container.innerHTML = header;

    const eventList = document.createElement('div');
    EVENTS_DATA.forEach(event => {
        const card = `
            <div class="card card-custom event-card">
                <img src="${event.image}" class="card-img-top" alt="${event.title}">
                <div class="card-body">
                    <p class="text-uppercase small fw-bold text-teal mb-1" style="color: var(--secondary-color)">${event.category}</p>
                    <h5 class="card-title fw-bold">${event.title}</h5>
                    <p class="text-muted small mb-3">
                        <i data-lucide="calendar" size="14" class="d-inline"></i> ${event.date} | 
                        <i data-lucide="map-pin" size="14" class="d-inline"></i> ${event.location}
                    </p>
                    <button class="btn btn-primary-custom" style="background-color: var(--secondary-color)" onclick="showToast('Registered!')">Join Event</button>
                </div>
            </div>
        `;
        eventList.innerHTML += card;
    });
    container.appendChild(eventList);
}

function renderRewards(container) {
    const content = `
        <div class="mb-4">
            <h2 class="fw-bold">Your Rewards</h2>
            <p class="text-muted">You're making a difference!</p>
        </div>
        <div class="points-widget">
            <p class="mb-1">Available Points</p>
            <div class="points-value" id="current-points">${USER_DATA.points}</div>
            <p class="small mt-2">You're close to a free coffee!</p>
            <div class="progress mt-3" style="height: 8px; border-radius: 4px; background: rgba(255,255,255,0.3)">
                <div class="progress-bar bg-white" role="progressbar" style="width: 80%" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        </div>
        <div class="d-grid gap-3">
            <button class="btn btn-primary-custom" onclick="toggleQR()">
                <i data-lucide="qr-code" size="20" class="me-2"></i> Show My QR
            </button>
            <button class="btn btn-primary-custom" style="background-color: var(--secondary-color)" onclick="claimReward()">
                Claim Weekly Bonus
            </button>
        </div>
        <h4 class="fw-bold mt-4 mb-3">Recent Activity</h4>
        <div id="activity-list"></div>
    `;
    container.innerHTML = content;

    const activityList = document.getElementById('activity-list');
    USER_DATA.history.forEach(item => {
        const row = `
            <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm">
                <div>
                    <p class="fw-bold mb-0">${item.shopName}</p>
                    <p class="text-muted small mb-0">${item.date}</p>
                </div>
                <div class="fw-bold text-success">+${item.pointsEarned} pts</div>
            </div>
        `;
        activityList.innerHTML += row;
    });
}

function renderProfile(container) {
    const content = `
        <div class="mb-4">
            <h2 class="fw-bold">My Profile</h2>
        </div>
        <div class="card card-custom p-4 mb-4 text-center" style="border-top: 5px solid var(--accent-color)">
            <h4 class="fw-bold mb-1">Impact Summary</h4>
            <p class="text-muted">Thank you for supporting local!</p>
            <div class="h1 fw-bold text-accent" style="color: var(--accent-color)">${USER_DATA.supportedBusinesses}</div>
            <p class="small text-muted">Local businesses supported this month</p>
        </div>
        <h4 class="fw-bold mb-3">Your Badges</h4>
        <div class="badge-grid">
            ${USER_DATA.badges.map(badge => `
                <div class="badge-item">
                    <div class="badge-icon">
                        <i data-lucide="${badge.icon}"></i>
                    </div>
                    <span>${badge.name}</span>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = content;
}

function showShopDetail(shopId) {
    const shop = SHOPS_DATA.find(s => s.id === shopId);
    if (!shop) return;

    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderSection('explore')">
                <i data-lucide="arrow-left" size="20"></i> Back to Explore
            </button>
        </div>
        <div class="card card-custom">
            <img src="${shop.image}" class="card-img-top" style="height: 250px" alt="${shop.name}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="fw-bold mb-0">${shop.name}</h2>
                    <span class="promo-badge">${shop.promotion}</span>
                </div>
                <p class="text-muted">${shop.category} • ★ ${shop.rating}</p>
                <div class="p-3 mb-3 rounded-3" style="background-color: #FFF0ED; border: 1px solid var(--accent-color)">
                    <h6 class="fw-bold text-accent" style="color: var(--accent-color)">Exclusive Offer</h6>
                    <p class="mb-0 small">${shop.promotion}. Show your QR code at the counter to claim.</p>
                </div>
                <p class="mb-4">${shop.description}</p>
                <button class="btn btn-primary-custom mb-2" onclick="showToast('Shared!')">Share with Friends</button>
                <button class="btn btn-outline-secondary w-100" style="border-radius: 12px; padding: 12px" onclick="renderSection('explore')">Close</button>
            </div>
        </div>
    `;
    lucide.createIcons();
    window.scrollTo(0,0);
}

function claimReward() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C65A3A', '#2F6F6D', '#F2C94C']
    });
    
    USER_DATA.points += 50;
    const pointsDisplay = document.getElementById('current-points');
    if (pointsDisplay) {
        pointsDisplay.innerText = USER_DATA.points;
    }
    
    showToast('Weekly bonus +50 points claimed!');
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'bg-dark text-white p-3 rounded-3 mb-2 shadow animate__animated animate__fadeInUp';
    toast.style.minWidth = '200px';
    toast.style.textAlign = 'center';
    toast.innerText = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function toggleQR() {
    const modal = document.getElementById('qr-modal');
    const qrData = document.getElementById('qr-user-data');
    qrData.innerText = `User ID: ${USER_DATA.name.toUpperCase()}-${USER_DATA.points}`;
    modal.style.display = 'flex';
}

function closeQR() {
    const modal = document.getElementById('qr-modal');
    modal.style.display = 'none';
}
