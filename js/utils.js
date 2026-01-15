function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'bg-dark text-white p-3 rounded-3 mb-2 shadow animate__animated animate__fadeInUp';
    toast.style.minWidth = '200px';
    toast.style.textAlign = 'center';
    toast.innerText = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function toggleQR() {
    const modal = document.getElementById('qr-modal');
    const qrData = document.getElementById('qr-user-data');
    qrData.innerText = `User ID: ${USER_DATA.name.toUpperCase()}-${USER_DATA.points}`;
    modal.style.display = 'flex';
}

function closeQR() {
    const modal = document.getElementById('qr-modal');
    modal.style.display = 'none';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function formatDistance(dist) {
    if (dist < 1) {
        return Math.round(dist * 1000) + ' m away';
    }
    return dist.toFixed(1) + ' km away';
}
