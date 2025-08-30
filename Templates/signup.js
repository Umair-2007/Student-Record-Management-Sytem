document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return; // Prevent errors if not on signup page
    const signupMessage = document.getElementById('signupMessage');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        if(password !== confirmPassword) {
            signupMessage.innerHTML = '<span style="color:red">Passwords do not match.</span>';
            return;
        }
        fetch('http://192.168.1.10:5001/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(res => {
            if(res.status === 201) {
                signupMessage.innerHTML = '<span style="color:green">Signup successful! Redirecting to login...</span>';
                setTimeout(() => { window.location.href = 'login.html'; }, 1000);
            } else {
                signupMessage.innerHTML = `<span style="color:red">${res.body.error}</span>`;
            }
        })
        .catch(() => {
            signupMessage.innerHTML = '<span style="color:red">Server error. Please try again.</span>';
        });
    });
});