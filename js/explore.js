let currentViewMode = 'list';
let mapInstance = null;
let markersMap = {};
let currentDateFilter = null;
let currentFilter = 'all';
let currentTypeFilter = 'all';
let currentDetailItem = null; // { type, id }

// Global hook for calendar month change
window.updateCalendar = function(date) {
    const appContainer = document.getElementById('app-content');
    renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter, date);
};

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
    if (currentTypeFilter === 'all') {
        currentTypeFilter = 'event';
    }
    setViewMode('calendar');
}

function closeDetail() {
    currentDetailItem = null;
    const appContainer = document.getElementById('app-content');
    if (appContainer) {
        renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter);
    }
}

function renderExplore(container, filter = 'all', typeFilter = 'all', dateFilter = null, calendarViewDate = null) {
    currentFilter = filter;
    currentTypeFilter = typeFilter;
    currentDateFilter = dateFilter;
    
    // Reset view mode if not available for current type
    if (currentViewMode === 'calendar' && typeFilter !== 'event') {
        currentViewMode = 'list';
    }

    const allData = [...SHOPS_DATA, ...EVENTS_DATA];
    
    // Dynamic categories based on current type filter
    let categories = ['all'];
    if (typeFilter === 'all') {
        categories.push(...new Set(allData.map(i => i.category)));
    } else if (typeFilter === 'place') {
        categories.push(...new Set(SHOPS_DATA.map(s => s.category)));
    } else if (typeFilter === 'event') {
        categories.push(...new Set(EVENTS_DATA.map(e => e.category)));
    } else if (typeFilter === 'new') {
        categories.push(...new Set(allData.filter(i => i.isNew).map(i => i.category)));
    }
    
    const header = `
        <div class="mb-4">
            <h2 class="fw-bold">${t('welcome', { name: USER_DATA.name })}</h2>
            <p class="text-muted mb-0">${t('explore_subtitle')}</p>
        </div>
        
        <div class="d-flex align-items-center mb-4 gap-2">
            <button class="btn-map-toggle ${currentViewMode === 'map' ? 'active' : ''}" onclick="setViewMode('map')" title="${t('map')}">
                <i data-lucide="map"></i>
                <span class="button-label">${t('map')}</span>
            </button>
            ${(typeFilter === 'event' || typeFilter === 'all') ? `
            <button class="btn-map-toggle ${currentViewMode === 'calendar' ? 'active' : ''}" onclick="handleCalendarClick()" title="${t('calendar')}">
                <i data-lucide="calendar"></i>
                <span class="button-label">${t('calendar')}</span>
            </button>
            ` : ''}
            <div class="search-bar mb-0 flex-grow-1">
                <i data-lucide="search" size="20"></i>
                <input type="text" placeholder="${t('search_placeholder')}">
                <i data-lucide="mic" size="20" class="text-muted cursor-pointer ms-2" onclick="showToast(t('voice_search_active'))"></i>
            </div>
        </div>

        <div class="d-flex gap-2 mb-3">
            <button class="btn btn-sm ${typeFilter === 'all' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'all', 'all')">${t('all')}</button>
            <button class="btn btn-sm ${typeFilter === 'place' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'all', 'place')">${t('places')}</button>
            <button class="btn btn-sm ${typeFilter === 'event' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'all', 'event')">${t('events')}</button>
            <button class="btn btn-sm ${typeFilter === 'new' ? 'btn-accent-active' : 'btn-outline-custom'}" onclick="renderExplore(document.getElementById('app-content'), 'all', 'new')">${t('new')}</button>
        </div>

        <div class="category-scroll mb-4">
            ${categories.map(cat => `
                <div class="category-item ${filter === cat ? 'active' : ''}" onclick="renderExplore(document.getElementById('app-content'), '${cat}', '${typeFilter}')">${t(cat)}</div>
            `).join('')}
        </div>
        <h4 class="fw-bold mb-3">
            ${dateFilter ? t('events_on', { date: dateFilter.toLocaleDateString(USER_DATA.language === 'el' ? 'el-GR' : (USER_DATA.language === 'ru' ? 'ru-RU' : 'en-US'), { month: 'short', day: 'numeric', year: 'numeric' }) }) : 
              (filter === 'all' ? (typeFilter === 'all' ? t('everything') : (typeFilter === 'place' ? t('featured_places') : t('upcoming_events'))) : t(filter))}
        </h4>
    `;
    container.innerHTML = header;

    let filteredItems = allData;
    if (typeFilter === 'new') {
        filteredItems = filteredItems.filter(item => item.isNew);
    } else if (typeFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === typeFilter);
    }
    if (filter !== 'all') {
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

    // Add distance to each item and sort
    const userLat = USER_DATA.lat;
    const userLng = USER_DATA.lng;
    const now = new Date("2026-01-15"); // Use consistent current date

    filteredItems.forEach(item => {
        item.distance = calculateDistance(userLat, userLng, item.lat, item.lng);
        if (item.type === 'event') {
            const eventDate = new Date(item.date);
            // Time weight: events in the future are preferred, closer in time preferred
            const timeDiff = eventDate.getTime() - now.getTime();
            item.timeScore = timeDiff > 0 ? timeDiff / (1000 * 60 * 60 * 24) : 1000; // Penalize past events
        } else {
            item.timeScore = 0; // Places are always available
        }
    });

    // Sort by distance primarily
    filteredItems.sort((a, b) => {
        // Distance weight is high
        if (Math.abs(a.distance - b.distance) > 0.1) { // 100m difference matters
            return a.distance - b.distance;
        }
        // If distances are very close, use timeScore for events
        return a.timeScore - b.timeScore;
    });

    if (currentViewMode === 'calendar' && typeFilter === 'event') {
        const exploreContent = document.createElement('div');
        exploreContent.className = 'explore-split-view animate__animated animate__fadeIn';

        const listSide = document.createElement('div');
        listSide.className = 'explore-list-side';
        
        if (currentDetailItem) {
            renderDetailInSide(listSide);
        } else {
            renderItems(listSide, filteredItems);
        }
        
        const calSide = document.createElement('div');
        calSide.className = 'explore-map-side';
        calSide.innerHTML = `
            <button class="btn-map-close" onclick="setViewMode('calendar')" title="Close Calendar">
                <i data-lucide="x"></i>
            </button>
            <div id="calendar-mount"></div>
        `;
        const calDiv = calSide.querySelector('#calendar-mount');
        
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
        listSide.className = 'explore-list-side';
        
        if (currentDetailItem) {
            renderDetailInSide(listSide);
        } else {
            listSide.classList.add('d-none', 'd-lg-block');
            renderItems(listSide, filteredItems);
        }
        
        const mapSide = document.createElement('div');
        mapSide.className = 'explore-map-side';
        mapSide.innerHTML = `
            <button class="btn-map-close" onclick="setViewMode('map')" title="Close Map">
                <i data-lucide="x"></i>
            </button>
            <div id="map-container"></div>
        `;
        
        exploreContent.appendChild(listSide);
        exploreContent.appendChild(mapSide);
        container.appendChild(exploreContent);
        
        initMap(filteredItems);
    } else {
        const itemGrid = document.createElement('div');
        if (currentDetailItem) {
            itemGrid.className = 'detail-view-container animate__animated animate__fadeIn';
            renderDetailInSide(itemGrid);
        } else {
            itemGrid.className = 'shop-grid';
            renderItems(itemGrid, filteredItems);
        }
        container.appendChild(itemGrid);
    }
    lucide.createIcons();
}

function renderDetailInSide(container) {
    if (!currentDetailItem) return;
    
    if (currentDetailItem.type === 'place') {
        const shop = SHOPS_DATA.find(s => s.id === currentDetailItem.id);
        if (shop) {
            container.innerHTML = getShopDetailHTML(shop);
        }
    } else {
        const event = EVENTS_DATA.find(e => e.id === currentDetailItem.id);
        if (event) {
            container.innerHTML = getEventDetailHTML(event);
        }
    }
}

function renderItems(container, items) {
    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center my-5 animate__animated animate__fadeIn w-100">
                <i data-lucide="info" size="48" class="text-muted mb-3"></i>
                <p class="text-muted">${t('no_results')}</p>
                <button class="btn btn-link text-accent" onclick="renderExplore(document.getElementById('app-content'), 'all', 'all')">${t('reset_filters')}</button>
            </div>
        `;
    } else {
        items.forEach(item => {
            const isPlace = item.type === 'place';
            const cardId = `item-card-${item.type}-${item.id}`;
            const visitedToday = Math.floor(Math.random() * 15) + 3; 
            const itemName = getLocalized(item, isPlace ? 'name' : 'title');
            const itemPromo = getLocalized(item, 'promotion');
            const itemLocation = getLocalized(item, 'location');
            const card = `
                <div class="card card-custom ${!isPlace ? 'event-card' : ''} animate__animated animate__fadeIn" id="${cardId}" onclick="handleItemClick('${item.type}', ${item.id}, event)" style="cursor: pointer">
                    <img src="${item.image}" class="card-img-top" alt="${itemName}">
                    ${item.isNew ? `<span class="badge bg-success position-absolute m-2" style="top: 0; right: 0; border-radius: 8px; font-size: 0.7rem;">${t('new')}</span>` : ''}
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${itemName}</h5>
                            ${isPlace ? `<span class="promo-badge">${itemPromo}</span>` : `<span class="badge" style="background-color: var(--secondary-color); color: #fff; border-radius: 20px; font-size: 0.7rem;">${t(item.category)}</span>`}
                        </div>
                        <p class="text-muted small mb-2">
                            ${isPlace ? `${t(item.category)} • ★ ${item.rating}` : `<i data-lucide="calendar" size="14" class="d-inline"></i> ${item.date}`}
                            • <span class="text-accent fw-bold">${formatDistance(item.distance)}</span>
                        </p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="small text-secondary mb-0">
                                ${isPlace ? `<i data-lucide="users" size="14" class="d-inline"></i> ${item.visits} ${t('visits')}` : `<i data-lucide="map-pin" size="14" class="d-inline"></i> ${itemLocation}`}
                            </p>
                            ${isPlace ? `
                            <p class="small text-accent fw-bold mb-0 animate__animated animate__pulse animate__infinite" style="font-size: 0.7rem;">
                                <i data-lucide="footprints" size="12"></i> ${visitedToday} ${t('visited_today')}
                            </p>` : ''}
                        </div>
                        <button class="btn btn-primary-custom" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showEventDetail(${item.id})`}">
                            ${isPlace ? t('view_place') : t('view_event')}
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
            showEventDetail(id);
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

function getCategoryIcon(category) {
    const iconMap = {
        'cat_food_drink': 'utensils',
        'cat_crafts': 'scissors',
        'cat_beauty': 'sparkles',
        'cat_leisure': 'palmtree',
        'cat_souvenirs': 'gift',
        'default': 'map-pin'
    };
    return iconMap[category] || iconMap['default'];
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
            const iconName = getCategoryIcon(item.category);
            
            const markerIcon = L.divIcon({
                html: `<div class="custom-map-marker" style="background-color: ${isPlace ? 'var(--accent-color)' : 'var(--secondary-color)'}">
                        <i data-lucide="${iconName}" size="16" style="color: white"></i>
                       </div>`,
                className: 'custom-marker-wrapper',
                iconSize: [34, 34],
                iconAnchor: [17, 34]
            });

            const itemName = getLocalized(item, isPlace ? 'name' : 'title');
            const itemPromo = getLocalized(item, 'promotion');
            const popupContent = `
                <div class="map-popup-card">
                    <img src="${item.image}" alt="${itemName}">
                    <div class="map-popup-content">
                        <h6 class="fw-bold mb-1">${itemName}</h6>
                        <p class="small text-muted mb-2">
                            ${isPlace ? `${t(item.category)} • ★ ${item.rating}` : `<i data-lucide="calendar" size="12"></i> ${item.date}`}
                            • <span class="text-accent fw-bold">${formatDistance(item.distance)}</span>
                        </p>
                        <button class="btn btn-primary-custom btn-sm py-1" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showEventDetail(${item.id})`}">
                            ${t('view_details')}
                        </button>
                    </div>
                </div>
            `;

            const marker = L.marker([item.lat, item.lng], { icon: markerIcon }).addTo(mapInstance);
            marker.bindPopup(popupContent);
            markersMap[`${item.type}-${item.id}`] = marker;

            marker.on('click', () => {
                if (currentViewMode === 'map' && window.innerWidth >= 992) {
                    highlightItemInList(item.type, item.id, true);
                }
            });
        });
        lucide.createIcons();
    }, 100);
}

function openOnMap(type, id) {
    // 0. Set current detail
    currentDetailItem = { type, id };

    // 1. Update Navigation UI
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(i => i.classList.remove('active'));
    const exploreNav = document.querySelector('.nav-item[data-section="explore"]');
    if (exploreNav) exploreNav.classList.add('active');

    // 2. Set view mode and render
    currentViewMode = 'map';
    renderSection('explore');
    
    // 3. Focus on item after map is initialized
    setTimeout(() => {
        focusItemOnMap(type, id);
    }, 600);
}

window.openOnMap = openOnMap;
