document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded, fetching user data...');
    
    // Add a loading indicator
    document.getElementById('profileUsername').textContent = 'Loading...';
    document.getElementById('profileEmail').textContent = 'Loading...';
    document.getElementById('profileRole').textContent = 'Loading...';
    
    fetch('https://localhost:5001/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => {
        console.log('Profile response status:', response.status);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile data received:', data);
        if (data.error) {
            throw new Error(data.error);
        }
        document.getElementById('profileUsername').textContent = data.username || 'Not available';
        document.getElementById('profileEmail').textContent = data.email || 'Not available';
        document.getElementById('profileRole').textContent = data.role || 'Not available';
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        document.getElementById('profileUsername').textContent = 'Error loading profile';
        document.getElementById('profileEmail').textContent = 'Please try logging in again';
        document.getElementById('profileRole').textContent = 'Unknown';
        
        // Add a visible error message
        const profileInfo = document.querySelector('.profile-info');
        const errorMsg = document.createElement('p');
        errorMsg.style.color = '#e74c3c';
        errorMsg.textContent = `Error: ${error.message}`;
        profileInfo.appendChild(errorMsg);
    });

    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                fetch('https://localhost:5001/delete_account', {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Account deleted successfully.');
                        window.location.href = 'signup.html';
                    } else {
                        alert(data.error || 'Failed to delete account.');
                    }
                })
                .catch((error) => {
                    alert('Server error. Please try again. ' + error);
                });
            }
        });
    }
});
