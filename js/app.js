document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderSection('explore');
    setupNavigation();
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

