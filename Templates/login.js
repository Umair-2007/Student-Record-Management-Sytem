document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; // Prevent errors if not on login page
    const loginMessage = document.getElementById('loginMessage');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        fetch('https://localhost:5001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(res => {
            if(res.status === 200 && res.body.token) {
                localStorage.setItem('token', res.body.token);
                loginMessage.innerHTML = '<span style="color:green">Login successful! Redirecting...</span>';
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } else {
                loginMessage.innerHTML = `<span style="color:red">${res.body.error}</span>`;
            }
        })
        .catch(() => {
            loginMessage.innerHTML = '<span style="color:red">Server error. Please try again.</span>';
        });
    });

    document.getElementById('googleLoginBtn').onclick = function() {
        window.location.href = 'https://localhost:5001/auth/google';
    };
});