function getShopDetailHTML(shop) {
    return `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="closeDetail()">
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
                <p class="text-muted">${shop.category} • ★ ${shop.rating} • <span class="text-accent fw-bold">${formatDistance(calculateDistance(USER_DATA.lat, USER_DATA.lng, shop.lat, shop.lng))}</span></p>
                <div class="d-flex align-items-center text-muted mb-3">
                    <i data-lucide="map-pin" size="18" class="me-2"></i>
                    <span class="small">${shop.location}</span>
                    <button class="btn btn-sm btn-outline-custom ms-auto" onclick="openOnMap('place', ${shop.id})" style="font-size: 0.7rem; border-radius: 8px;">
                        <i data-lucide="map" size="12" class="me-1"></i> View on Map
                    </button>
                </div>
                <div class="p-3 mb-3 rounded-3" style="background-color: #FFF0ED; border: 1px solid var(--accent-color)">
                    <h6 class="fw-bold text-accent" style="color: var(--accent-color)">Exclusive Offer</h6>
                    <p class="mb-0 small">${shop.promotion}. Show your QR code at the counter to claim.</p>
                </div>
                <p class="mb-4">${shop.description}</p>
                <button class="btn btn-primary-custom mb-2" onclick="showToast('Shared!')">Share with Friends</button>
                <button class="btn btn-outline-secondary w-100" style="border-radius: 12px; padding: 12px" onclick="closeDetail()">Close</button>
            </div>
        </div>
    `;
}

function showShopDetail(shopId) {
    const shop = SHOPS_DATA.find(s => s.id === shopId);
    if (!shop) return;

    currentDetailItem = { type: 'place', id: shopId };
    const appContainer = document.getElementById('app-content');
    
    // If we are already in explore section, just re-render to support split view
    if (appContainer && (currentViewMode === 'map' || currentViewMode === 'calendar')) {
        renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter);
        // Ensure map is focused
        if (currentViewMode === 'map') {
            setTimeout(() => focusItemOnMap('place', shopId), 300);
        }
    } else {
        // Full screen or simple list view
        renderExplore(appContainer, currentFilter, 'place');
    }
    
    window.scrollTo(0,0);
}
