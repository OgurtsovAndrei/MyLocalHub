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
