document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addStudentForm');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('first_name').value,
            class: document.getElementById('last_name').value,
            roll: document.getElementById('email').value,
            marks: document.getElementById('date_of_birth').value || null
        };
        
        fetch('http://localhost:5001/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Student added successfully!');
            form.reset();
        })
        .catch(error => {
            console.error('Error adding student:', error);
            alert('Error adding student: ' + error.message);
        });
    });
});