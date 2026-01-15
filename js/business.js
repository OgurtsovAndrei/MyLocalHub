let selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Default to Larnaca center

function renderAddBusiness() {
    selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Reset to default
    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderSection('profile')">
                <i data-lucide="arrow-left" size="20"></i> ${t('back_to_profile')}
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">${t('add_your_business')}</h2>
            <p class="text-muted">Fill in the details to list your shop on MyLocalHub</p>
        </div>
        
        <div class="card card-custom p-4">
            <form id="add-business-form" onsubmit="handleBusinessSubmit(event)">
                <div class="mb-3">
                    <label class="form-label fw-bold small">${t('business_name')}</label>
                    <input type="text" class="form-control custom-input" placeholder="e.g., Georgios' Bakery" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">${t('category')}</label>
                    <select class="form-select custom-input" required>
                        <option value="">Select Category</option>
                        <option value="cat_food_drink">${t('cat_food_drink')}</option>
                        <option value="cat_crafts">${t('cat_crafts')}</option>
                        <option value="cat_beauty">${t('cat_beauty')}</option>
                        <option value="cat_leisure">${t('cat_leisure')}</option>
                        <option value="cat_souvenirs">${t('cat_souvenirs')}</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">${t('description')}</label>
                    <textarea class="form-control custom-input" rows="3" placeholder="Tell us about your unique shop..." required></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">${t('business_address')}</label>
                    <input type="text" id="business-address" class="form-control custom-input" placeholder="Larnaca, Cyprus" required>
                    <div id="add-business-map" class="mt-2" style="height: 200px; border-radius: 12px; border: 1px solid #E0E0E0; z-index: 1;"></div>
                    <div class="form-text small mt-1">${t('map_pin_instruction')}</div>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-bold small">${t('shop_photo_url')}</label>
                    <input type="url" class="form-control custom-input" placeholder="https://images.unsplash.com/..." required>
                    <div class="form-text small">${t('photo_url_instruction')}</div>
                </div>
                
                <button type="submit" class="btn btn-primary-custom">${t('submit_review')}</button>
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
                <i data-lucide="arrow-left" size="20"></i> ${t('back_to_profile')}
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">${t('business_dashboard')}</h2>
            <p class="text-muted">Manage your local presence and community impact</p>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">${t('total_visits')}</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--secondary-color)">
                        ${ownedShops.reduce((acc, s) => acc + s.visits, 0)}
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">${t('avg_rating')}</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--gold-color)">
                        ${ownedShops.length > 0 ? (ownedShops.reduce((acc, s) => acc + s.rating, 0) / ownedShops.length).toFixed(1) : '0.0'}
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3 small text-uppercase" style="letter-spacing: 1px; color: var(--metadata-color)">${t('traffic_insights')}</h5>
            <div class="d-flex align-items-end justify-content-between" style="height: 120px; padding: 0 10px;">
                ${[45, 60, 35, 80, 55, 90, 75].map((val, i) => `
                    <div class="d-flex flex-column align-items-center" style="width: 10%;">
                        <div style="width: 100%; height: ${val}px; border-radius: 6px 6px 2px 2px; background-color: var(--secondary-color); opacity: ${0.4 + (val/150)}"></div>
                        <span class="text-muted mt-2" style="font-size: 0.6rem; font-weight: 600;">${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <h4 class="fw-bold mb-3">${t('my_businesses')}</h4>
    `;

    if (ownedShops.length === 0) {
        content += `
            <div class="card card-custom p-4 text-center">
                <p class="text-muted mb-3">You haven't listed any businesses yet.</p>
                <button class="btn btn-primary-custom" onclick="renderAddBusiness()">${t('add_your_business')}</button>
            </div>
        `;
    } else {
        ownedShops.forEach(shop => {
            const shopName = getLocalized(shop, 'name');
            const shopPromo = getLocalized(shop, 'promotion');
            content += `
                <div class="card card-custom p-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${shop.image}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
                        <div class="flex-grow-1">
                            <h6 class="fw-bold mb-1">${shopName}</h6>
                            <p class="small text-muted mb-0">${t(shop.category)} • ${shopPromo}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary-custom" onclick="renderShopSetup(${shop.id})">
                            <i data-lucide="settings" size="16"></i>
                            <span class="button-label">${t('settings')}</span>
                        </button>
                    </div>
                </div>
            `;
        });
        content += `
            <button class="btn btn-outline-secondary w-100 mt-2" style="border-radius: 12px; padding: 12px" onclick="renderAddBusiness()">
                <i data-lucide="plus" size="18" class="me-2"></i> ${t('add_another_business')}
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
    const shopName = getLocalized(shop, 'name');
    const shopPromo = getLocalized(shop, 'promotion');
    const shopDesc = getLocalized(shop, 'description');
    
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderBusinessDashboard()">
                <i data-lucide="arrow-left" size="20"></i> ${t('back_to_dashboard')}
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">${t('business_setup')}</h2>
            <p class="text-muted">${t('configure_business', { name: shopName })}</p>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">${t('active_promotion')}</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">${t('promotion_text')}</label>
                <input type="text" id="promo-input" class="form-control custom-input" value="${shopPromo}" placeholder="e.g., -20% on all crafts">
            </div>
            <button class="btn btn-primary-custom" onclick="updatePromotion(${shop.id})">${t('update_promotion')}</button>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">${t('business_details')}</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">${t('description')}</label>
                <textarea id="desc-input" class="form-control custom-input" rows="3">${shopDesc}</textarea>
            </div>
            <button class="btn btn-outline-primary-custom w-100" onclick="updateDetails(${shop.id})">${t('save_details')}</button>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">${t('inventory_management')}</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">${t('specials_items')}</label>
                <div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-light">
                    <span class="flex-grow-1 small fw-bold">Handmade Shell Necklace</span>
                    <span class="badge bg-success" style="font-size: 0.6rem;">${t('in_stock')}</span>
                    <i data-lucide="edit-2" size="14" class="text-muted cursor-pointer"></i>
                </div>
                <div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-light">
                    <span class="flex-grow-1 small fw-bold">Larnaca Postcards Set</span>
                    <span class="badge bg-success" style="font-size: 0.6rem;">${t('in_stock')}</span>
                    <i data-lucide="edit-2" size="14" class="text-muted cursor-pointer"></i>
                </div>
                <div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-light opacity-50">
                    <span class="flex-grow-1 small fw-bold">Sea Salt Soap Bar</span>
                    <span class="badge bg-danger" style="font-size: 0.6rem;">${t('out_of_stock')}</span>
                    <i data-lucide="edit-2" size="14" class="text-muted cursor-pointer"></i>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-primary-custom w-100" onclick="showToast('Feature coming soon!')">
                <i data-lucide="plus" size="14" class="me-1"></i> ${t('add_item')}
            </button>
        </div>

        <div class="card card-custom p-4 bg-light border-0">
            <h5 class="fw-bold mb-3">${t('marketing_insights')}</h5>
            <p class="small text-muted mb-3">${t('marketing_subtitle')}</p>
            <button class="btn btn-secondary-custom w-100" style="background-color: var(--secondary-color); color: #fff; border-radius: 12px; padding: 12px; border: none;" onclick="renderSection('explore')">
                ${t('browse_events')}
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
        // Update current language promotion
        const lang = USER_DATA.language || 'en';
        shop[`promotion_${lang}`] = input.value;
        if (lang === 'en') shop.promotion = input.value;
        
        showToast(t('promotion_updated'));
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
        // Update current language description
        const lang = USER_DATA.language || 'en';
        shop[`description_${lang}`] = input.value;
        if (lang === 'en') shop.description = input.value;
        
        showToast(t('details_saved'));
    }
};
