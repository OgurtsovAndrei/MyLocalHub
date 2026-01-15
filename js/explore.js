let currentViewMode = 'list';
let mapInstance = null;
let markersMap = {};
let currentDateFilter = null;
let currentFilter = 'All';
let currentTypeFilter = 'All';

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
                <span class="button-label">Map</span>
            </button>
            ${(typeFilter === 'event' || typeFilter === 'All') ? `
            <button class="btn-map-toggle ${currentViewMode === 'calendar' ? 'active' : ''}" onclick="handleCalendarClick()" title="Toggle Calendar">
                <i data-lucide="calendar"></i>
                <span class="button-label">Calendar</span>
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
                        <button class="btn btn-primary-custom" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showEventDetail(${item.id})`}">
                            ${isPlace ? 'View Place' : 'View Event'}
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
                        <button class="btn btn-primary-custom btn-sm py-1" style="${!isPlace ? 'background-color: var(--secondary-color)' : ''}" onclick="${isPlace ? `showShopDetail(${item.id})` : `showEventDetail(${item.id})`}">
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
