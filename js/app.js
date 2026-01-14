document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentViewMode = 'list';
let mapInstance = null;
let markersMap = {};
let currentDateFilter = null;
let selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Default to Larnaca center

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

function handleCalendarClick() {
    if (currentTypeFilter === 'All') {
        currentTypeFilter = 'event';
    }
    setViewMode('calendar');
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
            <p class="text-muted mb-0">Explore your local community</p>
        </div>
        
        <div class="d-flex align-items-center mb-4 gap-2">
            <button class="btn-map-toggle ${currentViewMode === 'map' ? 'active' : ''}" onclick="setViewMode('map')" title="Toggle Map">
                <i data-lucide="map"></i>
            </button>
            ${(typeFilter === 'event' || typeFilter === 'All') ? `
            <button class="btn-map-toggle ${currentViewMode === 'calendar' ? 'active' : ''}" onclick="handleCalendarClick()" title="Toggle Calendar">
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
    const hasOwnedShops = USER_DATA.ownedShops && USER_DATA.ownedShops.length > 0;
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

        <div class="mb-4">
            ${hasOwnedShops ? `
            <button class="btn btn-primary-custom mb-2" style="background-color: var(--secondary-color)" onclick="renderBusinessDashboard()">
                <i data-lucide="layout-dashboard" size="20" class="me-2"></i> Business Dashboard
            </button>
            ` : ''}
            <button class="btn btn-primary-custom" onclick="renderAddBusiness()">
                <i data-lucide="plus-circle" size="20" class="me-2"></i> Add Your Business
            </button>
            <p class="small text-muted text-center mt-2">Join our community as a shop owner</p>
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
    lucide.createIcons();
}

function renderAddBusiness() {
    selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Reset to default
    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderSection('profile')">
                <i data-lucide="arrow-left" size="20"></i> Back to Profile
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Add Your Business</h2>
            <p class="text-muted">Fill in the details to list your shop on MyLocalHub</p>
        </div>
        
        <div class="card card-custom p-4">
            <form id="add-business-form" onsubmit="handleBusinessSubmit(event)">
                <div class="mb-3">
                    <label class="form-label fw-bold small">Business Name</label>
                    <input type="text" class="form-control custom-input" placeholder="e.g., Georgios' Bakery" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Category</label>
                    <select class="form-select custom-input" required>
                        <option value="">Select Category</option>
                        <option value="Food & Drink">Food & Drink</option>
                        <option value="Crafts">Crafts</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Leisure">Leisure</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Description</label>
                    <textarea class="form-control custom-input" rows="3" placeholder="Tell us about your unique shop..." required></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Business Address</label>
                    <input type="text" id="business-address" class="form-control custom-input" placeholder="Larnaca, Cyprus" required>
                    <div id="add-business-map" class="mt-2" style="height: 200px; border-radius: 12px; border: 1px solid #E0E0E0; z-index: 1;"></div>
                    <div class="form-text small mt-1">Tap on the map to pin your exact location.</div>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-bold small">Shop Photo URL</label>
                    <input type="url" class="form-control custom-input" placeholder="https://images.unsplash.com/..." required>
                    <div class="form-text small">Use a high-quality photo of your shop front or products.</div>
                </div>
                
                <button type="submit" class="btn btn-primary-custom">Submit for Review</button>
            </form>
        </div>
    `;
    lucide.createIcons();
    initAddBusinessMap();
    window.scrollTo(0, 0);
}

function initAddBusinessMap() {
    setTimeout(() => {
        const mapContainer = document.getElementById('add-business-map');
        if (!mapContainer) return;

        const map = L.map('add-business-map', {
            zoomControl: false
        }).setView([selectedBusinessLocation.lat, selectedBusinessLocation.lng], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        let marker = L.marker([selectedBusinessLocation.lat, selectedBusinessLocation.lng], {
            draggable: true
        }).addTo(map);

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            selectedBusinessLocation = { lat, lng };
            
            const addressInput = document.getElementById('business-address');
            if (addressInput && !addressInput.value) {
                addressInput.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
            showToast('Location pinned!');
        });

        marker.on('dragend', () => {
            const position = marker.getLatLng();
            selectedBusinessLocation = { lat: position.lat, lng: position.lng };
            
            const addressInput = document.getElementById('business-address');
            if (addressInput && (!addressInput.value || addressInput.value.includes(','))) {
                addressInput.value = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
            }
            showToast('Location updated!');
        });
    }, 100);
}

function handleBusinessSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const category = form.querySelector('select').value;
    const description = form.querySelector('textarea').value;
    const image = form.querySelector('input[type="url"]').value;

    // Create new shop object
    const newShop = {
        id: SHOPS_DATA.length + 1,
        name: name,
        category: category,
        type: 'place',
        promotion: 'New Business Offer!',
        rating: 5.0,
        visits: 0,
        image: image || "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=400",
        description: description,
        lat: selectedBusinessLocation.lat,
        lng: selectedBusinessLocation.lng
    };

    // Add to mock data
    SHOPS_DATA.push(newShop);
    
    // Add to user's owned shops
    if (!USER_DATA.ownedShops) USER_DATA.ownedShops = [];
    USER_DATA.ownedShops.push(newShop.id);

    // Show confetti for emotional feedback as per spec
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C65A3A', '#2F6F6D', '#F2C94C']
    });

    showToast('Business added successfully!');
    
    // Redirect to setup after a short delay
    setTimeout(() => {
        renderShopSetup(newShop.id);
    }, 2000);
}

function renderBusinessDashboard() {
    const appContainer = document.getElementById('app-content');
    const ownedShops = SHOPS_DATA.filter(s => USER_DATA.ownedShops.includes(s.id));
    
    let content = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderSection('profile')">
                <i data-lucide="arrow-left" size="20"></i> Back to Profile
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Business Dashboard</h2>
            <p class="text-muted">Manage your local presence and community impact</p>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">Total Visits</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--secondary-color)">
                        ${ownedShops.reduce((acc, s) => acc + s.visits, 0)}
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">Avg. Rating</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--gold-color)">
                        ${ownedShops.length > 0 ? (ownedShops.reduce((acc, s) => acc + s.rating, 0) / ownedShops.length).toFixed(1) : '0.0'}
                    </div>
                </div>
            </div>
        </div>

        <h4 class="fw-bold mb-3">My Businesses</h4>
    `;

    if (ownedShops.length === 0) {
        content += `
            <div class="card card-custom p-4 text-center">
                <p class="text-muted mb-3">You haven't listed any businesses yet.</p>
                <button class="btn btn-primary-custom" onclick="renderAddBusiness()">Add Your First Business</button>
            </div>
        `;
    } else {
        ownedShops.forEach(shop => {
            content += `
                <div class="card card-custom p-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${shop.image}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
                        <div class="flex-grow-1">
                            <h6 class="fw-bold mb-1">${shop.name}</h6>
                            <p class="small text-muted mb-0">${shop.category} • ${shop.promotion}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary-custom" onclick="renderShopSetup(${shop.id})">
                            <i data-lucide="settings" size="16"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        content += `
            <button class="btn btn-outline-secondary w-100 mt-2" style="border-radius: 12px; padding: 12px" onclick="renderAddBusiness()">
                <i data-lucide="plus" size="18" class="me-2"></i> Add Another Business
            </button>
        `;
    }

    appContainer.innerHTML = content;
    lucide.createIcons();
    window.scrollTo(0, 0);
}

function renderShopSetup(shopId) {
    const shop = SHOPS_DATA.find(s => s.id === shopId);
    const appContainer = document.getElementById('app-content');
    
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderBusinessDashboard()">
                <i data-lucide="arrow-left" size="20"></i> Back to Dashboard
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Business Setup</h2>
            <p class="text-muted">Configure ${shop.name} for the community</p>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">Active Promotion</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">Promotion Text</label>
                <input type="text" id="promo-input" class="form-control custom-input" value="${shop.promotion}" placeholder="e.g., -20% on all crafts">
            </div>
            <button class="btn btn-primary-custom" onclick="updatePromotion(${shop.id})">Update Promotion</button>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">Business Details</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">Description</label>
                <textarea id="desc-input" class="form-control custom-input" rows="3">${shop.description}</textarea>
            </div>
            <button class="btn btn-outline-primary-custom w-100" onclick="updateDetails(${shop.id})">Save Details</button>
        </div>

        <div class="card card-custom p-4 bg-light border-0">
            <h5 class="fw-bold mb-3">Marketing Insights</h5>
            <p class="small text-muted mb-3">Boost your reach by joining community events.</p>
            <button class="btn btn-secondary-custom w-100" style="background-color: var(--secondary-color); color: #fff; border-radius: 12px; padding: 12px; border: none;" onclick="renderSection('explore')">
                Browse Community Events
            </button>
        </div>
    `;
    lucide.createIcons();
    window.scrollTo(0, 0);
}

window.updatePromotion = function(shopId) {
    const input = document.getElementById('promo-input');
    const shop = SHOPS_DATA.find(s => s.id === shopId);
    if (shop && input) {
        shop.promotion = input.value;
        showToast('Promotion updated!');
        confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#F2C94C']
        });
    }
};

window.updateDetails = function(shopId) {
    const input = document.getElementById('desc-input');
    const shop = SHOPS_DATA.find(s => s.id === shopId);
    if (shop && input) {
        shop.description = input.value;
        showToast('Details saved!');
    }
};

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
