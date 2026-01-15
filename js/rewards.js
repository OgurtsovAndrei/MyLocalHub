function renderRewards(container) {
    const content = `
        <div class="mb-4">
            <h2 class="fw-bold">Your Rewards</h2>
            <p class="text-muted">You're making a difference!</p>
        </div>
        <div class="points-widget">
            <p class="mb-1">Available Points</p>
            <div class="points-value" id="current-points">${USER_DATA.points}</div>
            <p class="small mt-2">You're close to a free coffee!</p>
            <div class="progress mt-3" style="height: 8px; border-radius: 4px; background: rgba(255,255,255,0.3)">
                <div class="progress-bar bg-white" role="progressbar" style="width: 80%" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        </div>

        <div class="card card-custom p-3 mb-4 border-0 shadow-sm animate__animated animate__pulse animate__infinite animate__slow" style="background-color: #FFF9E6; border-left: 5px solid var(--gold-color) !important;">
            <div class="d-flex align-items-center gap-3">
                <div class="bg-white p-2 rounded-circle shadow-sm">
                    <i data-lucide="flame" style="color: #F2994A" size="24"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0">${USER_DATA.streak} Week Streak!</h6>
                    <p class="small text-muted mb-0">Visit one more shop to keep it alive.</p>
                </div>
                <div class="ms-auto text-end">
                    <span class="badge bg-warning text-dark" style="font-size: 0.6rem;">+20 PTS</span>
                </div>
            </div>
        </div>

        <div class="d-grid gap-3">
            <button class="btn btn-primary-custom" onclick="toggleQR()">
                <i data-lucide="qr-code" size="20" class="me-2"></i> Show My QR
            </button>
            <button class="btn btn-primary-custom" style="background-color: var(--secondary-color)" onclick="claimReward()">
                Claim Weekly Bonus
            </button>
        </div>
        <h4 class="fw-bold mt-4 mb-3">Recent Activity</h4>
        <div id="activity-list"></div>
    `;
    container.innerHTML = content;

    const activityList = document.getElementById('activity-list');
    USER_DATA.history.forEach(item => {
        const row = `
            <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm">
                <div>
                    <p class="fw-bold mb-0">${item.shopName}</p>
                    <p class="text-muted small mb-0">${item.date}</p>
                </div>
                <div class="fw-bold text-success">+${item.pointsEarned} pts</div>
            </div>
        `;
        activityList.innerHTML += row;
    });
}

function claimReward() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C65A3A', '#2F6F6D', '#F2C94C']
    });
    
    USER_DATA.points += 50;
    const pointsDisplay = document.getElementById('current-points');
    if (pointsDisplay) {
        pointsDisplay.innerText = USER_DATA.points;
    }
    
    showToast('Weekly bonus +50 points claimed!');
}
