document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash) {
        const token = hash.split('=')[1];
        if (token) {
            localStorage.setItem('token', token);
        }
    }
    window.location.href = 'index.html';
});