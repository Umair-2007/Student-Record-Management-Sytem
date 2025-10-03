document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                logout(); // Token is invalid or expired
            }
        })
        .then(data => {
            if (data) {
                const logoutButton = document.createElement('button');
                logoutButton.id = 'logoutBtn';
                logoutButton.textContent = 'Logout';
                logoutButton.onclick = logout;
                document.body.appendChild(logoutButton);
            }
        })
        .catch(() => {
            logout();
        });
    } else {
        window.location.href = 'login.html';
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}