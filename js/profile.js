function renderProfile(container) {
    const hasOwnedShops = USER_DATA.ownedShops && USER_DATA.ownedShops.length > 0;
    const content = `
        <div class="mb-4">
            <h2 class="fw-bold">My Profile</h2>
        </div>
        <div class="card card-custom p-4 mb-4 text-center shadow-sm" style="background: linear-gradient(135deg, var(--bg-color) 0%, #fff 100%); border-top: 5px solid var(--accent-color)">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge" style="background-color: var(--accent-color); font-size: 0.7rem;">JANUARY 2026 IMPACT</span>
                <i data-lucide="share-2" size="18" class="text-muted cursor-pointer" onclick="showToast('Summary ready to share!')"></i>
            </div>
            <h4 class="fw-bold mb-1">Your Community Footprint</h4>
            <p class="text-muted small mb-4">Thank you for making Larnaca thrive!</p>
            
            <div class="row g-2 mb-3">
                <div class="col-4">
                    <div class="h2 fw-bold mb-0" style="color: var(--accent-color)">${USER_DATA.supportedBusinesses}</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">Shops</p>
                </div>
                <div class="col-4 border-start border-end">
                    <div class="h2 fw-bold mb-0" style="color: var(--secondary-color)">4</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">Events</p>
                </div>
                <div class="col-4">
                    <div class="h2 fw-bold mb-0" style="color: var(--gold-color)">240€</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">Local Economy</p>
                </div>
            </div>
            
            <div class="p-2 rounded-3" style="background-color: rgba(198, 90, 58, 0.05);">
                <p class="small mb-0 text-secondary" style="font-style: italic;">"You've helped sustain 3 family businesses this month!"</p>
            </div>
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
            <div class="card card-custom p-3 mb-2">
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

            <div class="card card-custom p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">App Language</div>
                        <div class="small text-muted">Choose your preferred language</div>
                    </div>
                    <select class="form-select form-select-sm w-auto border-0 fw-bold text-accent" style="color: var(--accent-color); cursor: pointer;" onchange="showToast('Language feature simulation: Setting to ' + this.options[this.selectedIndex].text)">
                        <option value="en">English</option>
                        <option value="el">Ελληνικά</option>
                        <option value="ru">Русский</option>
                        <option value="fr">Français</option>
                    </select>
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
