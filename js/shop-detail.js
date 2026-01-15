function getShopDetailHTML(shop) {
    const openStatus = isShopOpen(shop.openingHours);
    const itemName = getLocalized(shop, 'name');
    const itemPromo = getLocalized(shop, 'promotion');
    const itemDesc = getLocalized(shop, 'description');
    const itemLocation = getLocalized(shop, 'location');
    
    // Localize openStatus text if possible
    let openStatusText = openStatus.text;
    if (openStatusText === "Open Now") openStatusText = t('open_now');
    else if (openStatusText === "Closed") openStatusText = t('closed');
    else if (openStatusText.startsWith("Closed (Opens at")) {
        const time = openStatusText.match(/(\d{2}:\d{2})/)[1];
        openStatusText = t('opens_at', { time });
    }

    return `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="closeDetail()">
                <i data-lucide="arrow-left" size="20"></i> ${t('back_to_explore')}
            </button>
        </div>
        <div class="card card-custom">
            <img src="${shop.image}" class="card-img-top" style="height: 250px" alt="${itemName}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="fw-bold mb-0">${itemName}</h2>
                    <span class="promo-badge">${itemPromo}</span>
                </div>
                
                <div class="d-flex align-items-center mb-3">
                    <span class="badge ${openStatus.open ? 'bg-success' : 'bg-danger'} me-2">${openStatusText}</span>
                    <span class="text-muted small"><i data-lucide="clock" size="14" class="me-1 d-inline"></i> ${shop.openingHours || '09:00 - 18:00'}</span>
                </div>

                <p class="text-muted">${t(shop.category)} • ★ ${shop.rating} • <span class="text-accent fw-bold">${formatDistance(calculateDistance(USER_DATA.lat, USER_DATA.lng, shop.lat, shop.lng))}</span></p>
                <div class="d-flex align-items-center text-muted mb-3">
                    <i data-lucide="map-pin" size="18" class="me-2"></i>
                    <span class="small">${itemLocation}</span>
                    <button class="btn btn-sm btn-outline-custom ms-auto" onclick="openOnMap('place', ${shop.id})" style="font-size: 0.7rem; border-radius: 8px;">
                        <i data-lucide="map" size="12" class="me-1"></i> ${t('map')}
                    </button>
                </div>
                <div class="p-3 mb-3 rounded-3" style="background-color: #FFF0ED; border: 1px solid var(--accent-color)">
                    <h6 class="fw-bold text-accent" style="color: var(--accent-color)">${t('exclusive_offer')}</h6>
                    <p class="mb-0 small">${itemPromo}. ${t('claim_qr_instruction')}</p>
                </div>
                <p class="mb-4">${itemDesc}</p>
                
                    <button class="btn btn-primary-custom flex-grow-1" onclick="showToast(t('shared_toast'))">
                        <i data-lucide="share-2" size="18" class="me-2"></i> ${t('share')}
                    </button>

                <h5 class="fw-bold mb-3">${t('community_voice')}</h5>
                <div class="mb-4">
                    ${(shop.reviews && shop.reviews.length > 0) ? shop.reviews.map(review => `
                        <div class="bg-light p-3 rounded-3 mb-2">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="fw-bold small">${review.user}</span>
                                <span class="text-warning small">${'★'.repeat(review.rating)}</span>
                            </div>
                            <p class="small mb-0 italic">"${review.comment}"</p>
                        </div>
                    `).join('') : `<p class="text-muted small">${t('no_reviews')}</p>`}
                </div>
                <button class="btn btn-outline-secondary w-100" style="border-radius: 12px; padding: 12px" onclick="closeDetail()">${t('close')}</button>
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

