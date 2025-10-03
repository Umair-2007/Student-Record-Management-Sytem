document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('deleteForm');
    const messageElement = document.getElementById('message');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const rollNo = document.getElementById('rollNo').value;
        if (!rollNo) {
            messageElement.textContent = 'Please enter a roll number';
            messageElement.style.color = 'red';
            return;
        }
        
        // First, fetch the student by roll number
        fetch(`https://localhost:5001/students`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(students => {
                // Find the student with the matching roll number
                const student = students.find(s => s.roll === rollNo);
                
                if (!student) {
                    messageElement.textContent = 'Student not found with this roll number';
                    messageElement.style.color = 'red';
                    return;
                }
                
                // Confirm deletion
                if (confirm(`Are you sure you want to delete student ${student.name}?`)) {
                    // Send the delete request
                    return fetch(`https://localhost:5001/students/${student.id}`, {
                        method: 'DELETE'
                    });
                }
            })
            .then(response => {
                if (!response || !response.ok) {
                    throw new Error('Delete failed');
                }
                return response.json();
            })
            .then(data => {
                messageElement.textContent = 'Student deleted successfully!';
                messageElement.style.color = 'green';
                form.reset();
            })
            .catch(error => {
                console.error('Error deleting student:', error);
                messageElement.textContent = 'Error deleting student: ' + error.message;
                messageElement.style.color = 'red';
            });
    });
});