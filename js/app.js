document.addEventListener('DOMContentLoaded', () => {
    initAccessibilityMode();
    initApp();
});

function initAccessibilityMode() {
    const isEnabled = localStorage.getItem('accessibilityMode') === 'true';
    if (isEnabled) {
        document.body.classList.add('accessibility-mode');
    }
}

function toggleAccessibilityMode() {
    const isEnabled = document.body.classList.toggle('accessibility-mode');
    localStorage.setItem('accessibilityMode', isEnabled);
    showToast(isEnabled ? 'Accessibility Mode On' : 'Accessibility Mode Off');
    
    // Re-render current section to apply changes if needed (e.g. icons resize)
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        renderSection(activeNav.getAttribute('data-section'));
    }
}

function toggleOfflineMode() {
    const isOffline = document.body.classList.toggle('offline-mode');
    showToast(isOffline ? 'Offline Simulation: ON' : 'Offline Simulation: OFF');
    
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        renderSection(activeNav.getAttribute('data-section'));
    }
}

function initApp() {
    renderSection('explore');
    setupNavigation();

    // Persuasive design: Urgency reminder simulation
    setTimeout(() => {
        showToast("Friendly reminder: Your free coffee reward at 'Larnaca Coffee Roasters' expires in 2 days! ☕");
    }, 5000);
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            showToast(`Opening ${section.charAt(0).toUpperCase() + section.slice(1)}`);
            renderSection(section);
        });
    });
}

function renderSection(section) {
    const appContainer = document.getElementById('app-content');
    appContainer.innerHTML = '';

    switch (section) {
        case 'explore':
            renderExplore(appContainer);
            break;
        case 'rewards':
            renderRewards(appContainer);
            break;
        case 'profile':
            renderProfile(appContainer);
            break;
    }
    lucide.createIcons();
}

