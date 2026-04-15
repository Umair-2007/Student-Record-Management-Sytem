document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded, fetching user data...');
    
    // Add a loading indicator
    document.getElementById('profileUsername').textContent = 'Loading...';
    document.getElementById('profileEmail').textContent = 'Loading...';
    document.getElementById('profileRole').textContent = 'Loading...';
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        document.getElementById('profileUsername').textContent = 'Not logged in';
        document.getElementById('profileEmail').textContent = 'Please log in to view your profile';
        document.getElementById('profileRole').textContent = 'Unknown';
        return;
    }

    fetch('https://localhost:5001/profile', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${token}`
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

    // Edit Profile Modal Logic
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeModal = document.getElementById('closeEditModal');
    const editForm = document.getElementById('editProfileForm');
    const editMsg = document.getElementById('editProfileMsg');

    if (editBtn && modal && closeModal && editForm) {
        const modalContent = document.getElementById('editProfileModalContent');
        editBtn.addEventListener('click', function() {
            // Pre-fill form with current values
            document.getElementById('editUsername').value = document.getElementById('profileUsername').textContent;
            document.getElementById('editEmail').value = document.getElementById('profileEmail').textContent;
            document.getElementById('editPassword').value = '';
            editMsg.textContent = '';
            modal.style.display = 'block';
            // Trigger iOS pop animation
            if (modalContent) {
                modalContent.style.opacity = '0';
                modalContent.style.animation = 'none';
                // Force reflow
                void modalContent.offsetWidth;
                modalContent.style.animation = 'iosModalPop 0.6s cubic-bezier(.23,1.12,.32,1) forwards';
            }
        });
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('editUsername').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const password = document.getElementById('editPassword').value;
            fetch('https://localhost:5001/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, email, password: password || undefined })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    editMsg.style.color = 'green';
                    editMsg.textContent = data.message;
                    // Update profile display
                    document.getElementById('profileUsername').textContent = username;
                    document.getElementById('profileEmail').textContent = email;
                    setTimeout(() => { modal.style.display = 'none'; }, 1000);
                } else {
                    editMsg.style.color = 'red';
                    editMsg.textContent = data.error || 'Failed to update profile.';
                }
            })
            .catch(error => {
                editMsg.style.color = 'red';
                editMsg.textContent = 'Server error. Please try again.';
            });
        });
    }

    // Delete Account Logic
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                fetch('https://localhost:5001/delete_account', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert('Account deleted successfully.');
                        localStorage.removeItem('token');
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
