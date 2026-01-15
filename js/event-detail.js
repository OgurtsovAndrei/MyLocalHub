function getEventDetailHTML(event) {
    return `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="closeDetail()">
                <i data-lucide="arrow-left" size="20"></i> Back to Explore
            </button>
        </div>
        <div class="card card-custom event-detail-card">
            <img src="${event.image}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${event.title}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="fw-bold mb-0">${event.title}</h2>
                    <span class="badge" style="background-color: var(--secondary-color); color: #fff; border-radius: 20px; padding: 8px 15px;">${event.category}</span>
                </div>
                
                <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex align-items-center text-muted">
                        <i data-lucide="calendar" size="18" class="me-2"></i>
                        <span>${event.date}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted">
                        <i data-lucide="map-pin" size="18" class="me-2"></i>
                        <span>${event.location}</span>
                        <button class="btn btn-sm btn-outline-custom ms-auto" onclick="openOnMap('event', ${event.id})" style="font-size: 0.7rem; border-radius: 8px; color: var(--secondary-color); border-color: var(--secondary-color);">
                            <i data-lucide="map" size="12" class="me-1"></i> View on Map
                        </button>
                    </div>
                </div>

                <div class="p-3 mb-4 rounded-3" style="background-color: #f0f7ff; border: 1px solid #cfe2ff">
                    <h6 class="fw-bold" style="color: var(--secondary-color)">Event Information</h6>
                    <p class="mb-0 small text-dark">Join your community for this exciting ${event.category.toLowerCase()} event. Don't forget to register!</p>
                </div>

                <h5 class="fw-bold mb-3">About the Event</h5>
                <p class="mb-4 text-secondary">${event.description}</p>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-primary-custom" style="background-color: var(--secondary-color)" onclick="showToast('Registered for ${event.title.replace(/'/g, "\\'")}!')">Register Now</button>
                    <button class="btn btn-outline-custom" onclick="showToast('Added to Calendar!')">Add to Calendar</button>
                    <button class="btn btn-outline-secondary" style="border-radius: 12px; padding: 12px" onclick="closeDetail()">Back</button>
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
