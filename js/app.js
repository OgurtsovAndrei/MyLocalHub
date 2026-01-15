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


function initApp() {
    initLanguage();
    renderSection('explore');
    setupNavigation();

    // Persuasive design: Urgency reminder simulation
    setTimeout(() => {
        showToast(t('reminder_coffee'));
    }, 5000);
}

function initLanguage() {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) {
        USER_DATA.language = savedLang;
    }
}

function setLanguage(lang) {
    USER_DATA.language = lang;
    localStorage.setItem('appLanguage', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Re-render current section
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        renderSection(activeNav.getAttribute('data-section'));
    }
    
    // Update bottom nav labels
    updateBottomNavLabels();
}

function updateBottomNavLabels() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const section = item.getAttribute('data-section');
        const span = item.querySelector('span');
        if (span) {
            span.innerText = t(section);
        }
    });
}

function t(key, params = {}) {
    const lang = USER_DATA.language || 'en';
    let msg = (MESSAGES[lang] && MESSAGES[lang][key]) || (MESSAGES['en'] && MESSAGES['en'][key]) || key;
    
    Object.keys(params).forEach(p => {
        msg = msg.replace(`{${p}}`, params[p]);
    });
    
    return msg;
}

function getLocalized(obj, field) {
    const lang = USER_DATA.language || 'en';
    const localizedField = `${field}_${lang}`;
    
    if (obj[localizedField]) {
        return obj[localizedField];
    }
    
    if (obj[field]) {
        return obj[field];
    }
    
    // Fallback: find any non-empty field starting with field_
    const fallbackKey = Object.keys(obj).find(k => k.startsWith(`${field}_`) && obj[k]);
    if (fallbackKey) {
        return obj[fallbackKey];
    }
    
    return '';
}

window.t = t;
window.getLocalized = getLocalized;
window.setLanguage = setLanguage;

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    updateBottomNavLabels();
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            showToast(t('opening_section', { section: t(section) }));
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

