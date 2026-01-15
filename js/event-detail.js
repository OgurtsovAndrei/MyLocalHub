function getEventDetailHTML(event) {
    const itemTitle = getLocalized(event, 'title');
    const itemDesc = getLocalized(event, 'description');
    const itemLocation = getLocalized(event, 'location');
    const categoryName = t(event.category);

    return `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="closeDetail()">
                <i data-lucide="arrow-left" size="20"></i> ${t('back_to_explore')}
            </button>
        </div>
        <div class="card card-custom event-detail-card">
            <img src="${event.image}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${itemTitle}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="fw-bold mb-0">${itemTitle}</h2>
                    <span class="badge" style="background-color: var(--secondary-color); color: #fff; border-radius: 20px; padding: 8px 15px;">${categoryName}</span>
                </div>
                
                <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex align-items-center text-muted">
                        <i data-lucide="calendar" size="18" class="me-2"></i>
                        <span>${event.date} • <span class="text-accent fw-bold">${formatDistance(calculateDistance(USER_DATA.lat, USER_DATA.lng, event.lat, event.lng))}</span></span>
                    </div>
                    <div class="d-flex align-items-center text-muted">
                        <i data-lucide="map-pin" size="18" class="me-2"></i>
                        <span>${itemLocation}</span>
                        <button class="btn btn-sm btn-outline-custom ms-auto" onclick="openOnMap('event', ${event.id})" style="font-size: 0.7rem; border-radius: 8px; color: var(--secondary-color); border-color: var(--secondary-color);">
                            <i data-lucide="map" size="12" class="me-1"></i> ${t('map')}
                        </button>
                    </div>
                </div>

                <div class="p-3 mb-4 rounded-3" style="background-color: #f0f7ff; border: 1px solid #cfe2ff">
                    <h6 class="fw-bold" style="color: var(--secondary-color)">${t('event_info')}</h6>
                    <p class="mb-0 small text-dark">${t('event_instruction', { category: categoryName.toLowerCase() })}</p>
                </div>

                <h5 class="fw-bold mb-3">${t('about_event')}</h5>
                <p class="mb-4 text-secondary">${itemDesc}</p>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-primary-custom" style="background-color: var(--secondary-color)" onclick="showToast(t('registered_toast', { title: '${itemTitle.replace(/'/g, "\\'")}' }))">${t('register_now')}</button>
                    <button class="btn btn-outline-custom" onclick="showToast(t('added_calendar_toast'))">${t('add_to_calendar')}</button>
                    <button class="btn btn-outline-secondary" style="border-radius: 12px; padding: 12px" onclick="closeDetail()">${t('back')}</button>
                </div>
            </div>
        </div>
    `;
}

function showEventDetail(eventId) {
    const event = EVENTS_DATA.find(e => e.id === eventId);
    if (!event) return;

    currentDetailItem = { type: 'event', id: eventId };
    const appContainer = document.getElementById('app-content');

    // If we are already in explore section, just re-render to support split view
    if (appContainer && (currentViewMode === 'map' || currentViewMode === 'calendar')) {
        renderExplore(appContainer, currentFilter, currentTypeFilter, currentDateFilter);
        // Ensure map is focused
        if (currentViewMode === 'map') {
            setTimeout(() => focusItemOnMap('event', eventId), 300);
        }
    } else {
        // Full screen or simple list view
        renderExplore(appContainer, currentFilter, 'event');
    }
    
    window.scrollTo(0,0);
}
