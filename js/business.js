let selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Default to Larnaca center

function renderAddBusiness() {
    selectedBusinessLocation = { lat: 34.915, lng: 33.633 }; // Reset to default
    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderSection('profile')">
                <i data-lucide="arrow-left" size="20"></i> Back to Profile
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Add Your Business</h2>
            <p class="text-muted">Fill in the details to list your shop on MyLocalHub</p>
        </div>
        
        <div class="card card-custom p-4">
            <form id="add-business-form" onsubmit="handleBusinessSubmit(event)">
                <div class="mb-3">
                    <label class="form-label fw-bold small">Business Name</label>
                    <input type="text" class="form-control custom-input" placeholder="e.g., Georgios' Bakery" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Category</label>
                    <select class="form-select custom-input" required>
                        <option value="">Select Category</option>
                        <option value="Food & Drink">Food & Drink</option>
                        <option value="Crafts">Crafts</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Leisure">Leisure</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Description</label>
                    <textarea class="form-control custom-input" rows="3" placeholder="Tell us about your unique shop..." required></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold small">Business Address</label>
                    <input type="text" id="business-address" class="form-control custom-input" placeholder="Larnaca, Cyprus" required>
                    <div id="add-business-map" class="mt-2" style="height: 200px; border-radius: 12px; border: 1px solid #E0E0E0; z-index: 1;"></div>
                    <div class="form-text small mt-1">Tap on the map to pin your exact location.</div>
                </div>
                <div class="mb-4">
                    <label class="form-label fw-bold small">Shop Photo URL</label>
                    <input type="url" class="form-control custom-input" placeholder="https://images.unsplash.com/..." required>
                    <div class="form-text small">Use a high-quality photo of your shop front or products.</div>
                </div>
                
                <button type="submit" class="btn btn-primary-custom">Submit for Review</button>
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
                <i data-lucide="arrow-left" size="20"></i> Back to Profile
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Business Dashboard</h2>
            <p class="text-muted">Manage your local presence and community impact</p>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">Total Visits</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--secondary-color)">
                        ${ownedShops.reduce((acc, s) => acc + s.visits, 0)}
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card card-custom p-3 text-center h-100">
                    <div class="text-muted small mb-1">Avg. Rating</div>
                    <div class="h3 fw-bold mb-0" style="color: var(--gold-color)">
                        ${ownedShops.length > 0 ? (ownedShops.reduce((acc, s) => acc + s.rating, 0) / ownedShops.length).toFixed(1) : '0.0'}
                    </div>
                </div>
            </div>
        </div>

        <h4 class="fw-bold mb-3">My Businesses</h4>
    `;

    if (ownedShops.length === 0) {
        content += `
            <div class="card card-custom p-4 text-center">
                <p class="text-muted mb-3">You haven't listed any businesses yet.</p>
                <button class="btn btn-primary-custom" onclick="renderAddBusiness()">Add Your First Business</button>
            </div>
        `;
    } else {
        ownedShops.forEach(shop => {
            content += `
                <div class="card card-custom p-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${shop.image}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
                        <div class="flex-grow-1">
                            <h6 class="fw-bold mb-1">${shop.name}</h6>
                            <p class="small text-muted mb-0">${shop.category} • ${shop.promotion}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary-custom" onclick="renderShopSetup(${shop.id})">
                            <i data-lucide="settings" size="16"></i>
                            <span class="button-label">Settings</span>
                        </button>
                    </div>
                </div>
            `;
        });
        content += `
            <button class="btn btn-outline-secondary w-100 mt-2" style="border-radius: 12px; padding: 12px" onclick="renderAddBusiness()">
                <i data-lucide="plus" size="18" class="me-2"></i> Add Another Business
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
    
    appContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-link p-0 text-decoration-none text-dark" onclick="renderBusinessDashboard()">
                <i data-lucide="arrow-left" size="20"></i> Back to Dashboard
            </button>
        </div>
        <div class="mb-4">
            <h2 class="fw-bold">Business Setup</h2>
            <p class="text-muted">Configure ${shop.name} for the community</p>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">Active Promotion</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">Promotion Text</label>
                <input type="text" id="promo-input" class="form-control custom-input" value="${shop.promotion}" placeholder="e.g., -20% on all crafts">
            </div>
            <button class="btn btn-primary-custom" onclick="updatePromotion(${shop.id})">Update Promotion</button>
        </div>

        <div class="card card-custom p-4 mb-4">
            <h5 class="fw-bold mb-3">Business Details</h5>
            <div class="mb-3">
                <label class="form-label fw-bold small">Description</label>
                <textarea id="desc-input" class="form-control custom-input" rows="3">${shop.description}</textarea>
            </div>
            <button class="btn btn-outline-primary-custom w-100" onclick="updateDetails(${shop.id})">Save Details</button>
        </div>

        <div class="card card-custom p-4 bg-light border-0">
            <h5 class="fw-bold mb-3">Marketing Insights</h5>
            <p class="small text-muted mb-3">Boost your reach by joining community events.</p>
            <button class="btn btn-secondary-custom w-100" style="background-color: var(--secondary-color); color: #fff; border-radius: 12px; padding: 12px; border: none;" onclick="renderSection('explore')">
                Browse Community Events
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
        shop.promotion = input.value;
        showToast('Promotion updated!');
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
        shop.description = input.value;
        showToast('Details saved!');
    }
};
