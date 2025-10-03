document.addEventListener('DOMContentLoaded', function() {
    fetch('/profile')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                window.location.href = 'login.html';
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
            window.location.href = 'login.html';
        });
});

function logout() {
    fetch('/logout', {
        method: 'POST'
    }).then(() => {
        window.location.href = 'login.html';
    });
}
