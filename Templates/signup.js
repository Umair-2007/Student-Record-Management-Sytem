document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return; // Prevent errors if not on signup page
    const signupMessage = document.getElementById('signupMessage');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        if(password !== confirmPassword) {
            signupMessage.innerHTML = '<span style="color:red">Passwords do not match.</span>';
            return;
        }
        fetch('https://localhost:5001/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => {
            return response.text().then(text => {
                try {
                    const data = JSON.parse(text);
                    return { status: response.status, body: data };
                } catch (e) {
                    return { status: response.status, body: { error: 'Server returned invalid response.' } };
                }
            });
        })
        .then(res => {
            if(res.status === 201) {
                signupMessage.innerHTML = '<span style="color:green">Signup successful! Redirecting to login...</span>';
                setTimeout(() => { window.location.href = 'login.html'; }, 1000);
            } else {
                signupMessage.innerHTML = `<span style="color:red">${res.body.error}</span>`;
            }
        })
        .catch(() => {
            signupMessage.innerHTML = '<span style="color:red">Network/server error. Please try again.</span>';
        });
    });

    document.getElementById('googleSignupBtn').onclick = function() {
        window.location.href = 'https://localhost:5001/auth/google';
    };
});