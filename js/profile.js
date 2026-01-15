function renderProfile(container) {
    const hasOwnedShops = USER_DATA.ownedShops && USER_DATA.ownedShops.length > 0;
    const content = `
        <div class="mb-4">
            <h2 class="fw-bold">${t('my_profile')}</h2>
        </div>
        <div class="card card-custom p-4 mb-4 text-center shadow-sm" style="background: linear-gradient(135deg, var(--bg-color) 0%, #fff 100%); border-top: 5px solid var(--accent-color)">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge" style="background-color: var(--accent-color); font-size: 0.7rem;">JANUARY 2026 IMPACT</span>
                <i data-lucide="share-2" size="18" class="text-muted cursor-pointer" onclick="showToast(t('summary_ready_share'))"></i>
            </div>
            <h4 class="fw-bold mb-1">${t('impact_title')}</h4>
            <p class="text-muted small mb-4">${t('impact_subtitle')}</p>
            
            <div class="row g-2 mb-3">
                <div class="col-4">
                    <div class="h2 fw-bold mb-0" style="color: var(--accent-color)">${USER_DATA.supportedBusinesses}</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">${t('shops_count')}</p>
                </div>
                <div class="col-4 border-start border-end">
                    <div class="h2 fw-bold mb-0" style="color: var(--secondary-color)">4</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">${t('events_count')}</p>
                </div>
                <div class="col-4">
                    <div class="h2 fw-bold mb-0" style="color: var(--gold-color)">240€</div>
                    <p class="text-muted" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700;">${t('local_economy')}</p>
                </div>
            </div>
            
            <div class="p-2 rounded-3" style="background-color: rgba(198, 90, 58, 0.05);">
                <p class="small mb-0 text-secondary" style="font-style: italic;">"${t('impact_summary', { count: 3 })}"</p>
            </div>
        </div>

        <div class="mb-4">
            ${hasOwnedShops ? `
            <button class="btn btn-primary-custom mb-2" style="background-color: var(--secondary-color)" onclick="renderBusinessDashboard()">
                <i data-lucide="layout-dashboard" size="20" class="me-2"></i> ${t('business_dashboard')}
            </button>
            ` : ''}
            <button class="btn btn-primary-custom" onclick="renderAddBusiness()">
                <i data-lucide="plus-circle" size="20" class="me-2"></i> ${t('add_your_business')}
            </button>
            <p class="small text-muted text-center mt-2">${t('join_owner_community')}</p>
        </div>

        <div class="mb-4">
            <h4 class="fw-bold mb-3">${t('app_settings')}</h4>
            <div class="card card-custom p-3 mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${t('accessibility_mode')}</div>
                        <div class="small text-muted">${t('accessibility_subtitle')}</div>
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
                        <div class="fw-bold">${t('app_language')}</div>
                        <div class="small text-muted">${t('choose_language')}</div>
                    </div>
                    <select class="form-select form-select-sm w-auto border-0 fw-bold text-accent" style="color: var(--accent-color); cursor: pointer;" onchange="setLanguage(this.value)">
                        <option value="en" ${USER_DATA.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="el" ${USER_DATA.language === 'el' ? 'selected' : ''}>Ελληνικά</option>
                        <option value="ru" ${USER_DATA.language === 'ru' ? 'selected' : ''}>Русский</option>
                        <option value="fr" ${USER_DATA.language === 'fr' ? 'selected' : ''}>Français</option>
                    </select>
                </div>
            </div>
        </div>

        <h4 class="fw-bold mb-3">${t('your_badges')}</h4>
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
