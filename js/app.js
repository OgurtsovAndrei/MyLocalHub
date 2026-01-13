document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentViewMode = 'list';
let mapInstance = null;
let markersMap = {};
let currentDateFilter = null;

function initApp() {
    renderSection('explore');
    setupNavigation();
}

// Global hook for calendar month change
window.updateCalendar = function(date) {
    const appContainer = document.getElementById('app-content');
    renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter, date);
};

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
        case 'rewards':
            renderRewards(appContainer);
            break;
        case 'profile':
            renderProfile(appContainer);
            break;
    }
    lucide.createIcons();
}

let currentFilter = 'All';
let currentTypeFilter = 'All';

function setViewMode(mode) {
    if (currentViewMode === mode) {
        currentViewMode = 'list';
    } else {
        currentViewMode = mode;
    }
    const appContainer = document.getElementById('app-content');
    if (appContainer) {
        renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter);
    }
}

function toggleViewMode() {
    setViewMode('map');
}

function renderExplore(container, filter = 'All', typeFilter = 'All', dateFilter = null, calendarViewDate = null) {
    currentFilter = filter;
    currentTypeFilter = typeFilter;
    currentDateFilter = dateFilter;
    
    // Reset view mode if not available for current type
    if (currentViewMode === 'calendar' && typeFilter !== 'event') {
        currentViewMode = 'list';
    }

    const allData = [...SHOPS_DATA, ...EVENTS_DATA];
    
    // Dynamic categories based on current type filter
    let categories = ['All'];
    if (typeFilter === 'place') {
        categories.push(...new Set(SHOPS_DATA.map(s => s.category)));
    } else if (typeFilter === 'event') {
        categories.push(...new Set(EVENTS_DATA.map(e => e.category)));
    } else {
        categories.push(...new Set(allData.map(i => i.category)));
    }
    
    const header = `
        <div class="mb-4">
            <h2 class="fw-bold">Hello, ${USER_DATA.name}!</h2>
            <p class="text-muted">Explore your local community</p>
        </div>
        
        <div class="d-flex align-items-center mb-4 gap-2">
            <button class="btn-map-toggle ${currentViewMode === 'map' ? 'active' : ''}" onclick="setViewMode('map')" title="Toggle Map">
                <i data-lucide="map"></i>
            </button>
            ${typeFilter === 'event' ? `
            <button class="btn-map-toggle ${currentViewMode === 'calendar' ? 'active' : ''}" onclick="setViewMode('calendar')" title="Toggle Calendar" style="background-color: var(--secondary-color)">
                <i data-lucide="calendar"></i>
            </button>
            ` : ''}
            <div class="search-bar mb-0 flex-grow-1">
                <i data-lucide="search" size="20"></i>
                <input type="text" placeholder="Search places or events...">
            </div>
        </div>

        <div class="d-flex gap-2 mb-3">
            <button class="btn btn-sm ${typeFilter === 'All' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'All', 'All')">All</button>
            <button class="btn btn-sm ${typeFilter === 'place' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'All', 'place')">Places</button>
            <button class="btn btn-sm ${typeFilter === 'event' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'All', 'event')">Events</button>
        </div>

        <div class="category-scroll mb-4">
            ${categories.map(cat => `
                <div class="category-item ${filter === cat ? 'active' : ''}" onclick="renderExplore(document.getElementById('app-content'), '${cat}', '${typeFilter}')">${cat}</div>
            `).join('')}
        </div>
        <h4 class="fw-bold mb-3">
            ${dateFilter ? `Events on ${dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 
              (filter === 'All' ? (typeFilter === 'All' ? 'Everything' : (typeFilter === 'place' ? 'Featured Places' : 'Upcoming Events')) : filter)}
        </h4>
    `;
    container.innerHTML = header;

    let filteredItems = allData;
    if (typeFilter !== 'All') {
        filteredItems = filteredItems.filter(item => item.type === typeFilter);
    }
    if (filter !== 'All') {
        filteredItems = filteredItems.filter(item => item.category === filter);
    }
    if (dateFilter && typeFilter === 'event') {
        filteredItems = filteredItems.filter(item => {
            const d = new Date(item.date);
            return d.getDate() === dateFilter.getDate() && 
                   d.getMonth() === dateFilter.getMonth() && 
                   d.getFullYear() === dateFilter.getFullYear();
        });
    }

    if (currentViewMode === 'calendar' && typeFilter === 'event') {
        const exploreContent = document.createElement('div');
        exploreContent.className = 'explore-split-view animate__animated animate__fadeIn';

        const listSide = document.createElement('div');
        listSide.className = 'explore-list-side';
        renderItems(listSide, filteredItems);
        
        const calSide = document.createElement('div');
        calSide.className = 'explore-map-side'; // Reuse map side styling
        const calDiv = document.createElement('div');
        calDiv.id = 'calendar-mount';
        calSide.appendChild(calDiv);
        
        // In mobile view, we might want to swap order or stack them differently
        // For now, let's keep list on left/top and calendar on right/bottom (stack on mobile)
        if (window.innerWidth < 992) {
            exploreContent.appendChild(calSide);
            exploreContent.appendChild(listSide);
        } else {
            exploreContent.appendChild(listSide);
            exploreContent.appendChild(calSide);
        }
        
        container.appendChild(exploreContent);
        
        Calendar.render(calDiv, EVENTS_DATA, calendarViewDate, dateFilter, (date) => {
            renderExplore(document.getElementById('app-content'), filter, typeFilter, date);
        });
    } else if (currentViewMode === 'map') {
        const exploreContent = document.createElement('div');
        exploreContent.className = 'explore-split-view animate__animated animate__fadeIn';

        const listSide = document.createElement('div');
        listSide.className = 'explore-list-side d-none d-lg-block';
        renderItems(listSide, filteredItems);
        
        const mapSide = document.createElement('div');
        mapSide.className = 'explore-map-side';
        const mapDiv = document.createElement('div');
        mapDiv.id = 'map-container';
        mapSide.appendChild(mapDiv);
        
        exploreContent.appendChild(listSide);
        exploreContent.appendChild(mapSide);
        container.appendChild(exploreContent);
        
        initMap(filteredItems);
    } else {
        const itemGrid = document.createElement('div');
        itemGrid.className = 'shop-grid';
        renderItems(itemGrid, filteredItems);
        container.appendChild(itemGrid);
    }
    lucide.createIcons();
}

function renderItems(container, items) {
    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center my-5 animate__animated animate__fadeIn w-100">
                <i data-lucide="info" size="48" class="text-muted mb-3"></i>
                <p class="text-muted">No results found for this selection.</p>
                <button class="btn btn-link text-accent" onclick="renderExplore(document.getElementById('app-content'), 'All', 'All')">Reset filters</button>
            </div>
        `;
    } else {
        items.forEach(item => {
            const isPlace = item.type === 'place';
            const cardId = `item-card-${item.type}-${item.id}`;
            const card = `
                <div class="card card-custom ${!isPlace ? 'event-card' : ''} animate__animated animate__fadeIn" id="${cardId}" onclick="handleItemClick('${item.type}', ${item.id}, event)" style="cursor: pointer">
                    <img src="${item.image}" class="card-img-top" alt="${isPlace ? item.name : item.title}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${isPlace ? item.name : item.title}</h5>
                            ${isPlace ? `<span class="promo-badge">${item.promotion}</span>` : `<span class="badge" style="background-color: var(--secondary-color); color: #fff; border-radius: 20px; font-size: 0.7rem;">${item.category}</span>`}
                        </div>
                        <p class="text-muted small mb-2">
                            ${isPlace ? `${item.category} • ★ ${item.rating}` : `<i data-lucide="calendar" size="14" class="d-inline"></i> ${item.date}`}
                        </p>
                        <p class="small text-secondary mb-3">
                            ${isPlace ? `${item.visits} people visited this week` : `<i data-lucide="map-pin" size="14" class="d-inline"></i> ${item.location}`}
                        </p>
                        <button class="btn btn-primary-custom" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showToast('Registered!')`}">
                            ${isPlace ? 'View Place' : 'Join Event'}
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }
    lucide.createIcons();
}

function handleItemClick(type, id, event) {
    if (event.target.closest('button')) return;

    if (currentViewMode === 'map' && window.innerWidth >= 992) {
        focusItemOnMap(type, id);
        highlightItemInList(type, id);
    } else {
        if (type === 'place') {
            showShopDetail(id);
        } else {
            showToast('Opening event details...');
        }
    }
}

function focusItemOnMap(type, id) {
    const markerKey = `${type}-${id}`;
    const marker = markersMap[markerKey];
    if (marker && mapInstance) {
        mapInstance.setView(marker.getLatLng(), 16);
        marker.openPopup();
    }
}

function highlightItemInList(type, id, scroll = false) {
    document.querySelectorAll('.card-custom').forEach(card => card.classList.remove('highlight-card'));
    
    const card = document.getElementById(`item-card-${type}-${id}`);
    if (card) {
        card.classList.add('highlight-card');
        if (scroll) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function initMap(items) {
    // Delay to ensure DOM element is ready
    setTimeout(() => {
        if (mapInstance) {
            mapInstance.remove();
        }

        markersMap = {};

        // Larnaca coordinates
        mapInstance = L.map('map-container', {
            zoomControl: false
        }).setView([34.915, 33.633], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(mapInstance);

        items.forEach(item => {
            const isPlace = item.type === 'place';
            const popupContent = `
                <div class="map-popup-card">
                    <img src="${item.image}" alt="${isPlace ? item.name : item.title}">
                    <div class="map-popup-content">
                        <h6 class="fw-bold mb-1">${isPlace ? item.name : item.title}</h6>
                        <p class="small text-muted mb-2">
                            ${isPlace ? `${item.category} • ★ ${item.rating}` : `<i data-lucide="calendar" size="12"></i> ${item.date}`}
                        </p>
                        <button class="btn btn-primary-custom btn-sm py-1" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showToast('Registered!')`}">
                            View Details
                        </button>
                    </div>
                </div>
            `;

            const marker = L.marker([item.lat, item.lng]).addTo(mapInstance);
            marker.bindPopup(popupContent);
            markersMap[`${item.type}-${item.id}`] = marker;

            marker.on('click', () => {
                if (currentViewMode === 'map' && window.innerWidth >= 992) {
                    highlightItemInList(item.type, item.id, true);
                }
            });
        });
    }, 100);
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
