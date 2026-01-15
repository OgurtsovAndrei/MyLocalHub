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

        <div class="mb-4">
            <h4 class="fw-bold mb-3">App Settings</h4>
            <div class="card card-custom p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">Accessibility Mode</div>
                        <div class="small text-muted">Larger text and button labels</div>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="accessibilitySwitch" 
                               ${document.body.classList.contains('accessibility-mode') ? 'checked' : ''}
                               onchange="toggleAccessibilityMode()">
                    </div>
                </div>
            </div>
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
