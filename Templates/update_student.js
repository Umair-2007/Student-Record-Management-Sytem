document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('updateStudentForm');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const rollNo = document.getElementById('rollNo').value;
        
        // First, fetch the student by roll number
        fetch(`/students`)
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
                    alert('Student not found with this roll number');
                    return;
                }
                
                // Prepare the update data
                const updateData = {
                    name: document.getElementById('name').value || student.name,
                    class: document.getElementById('class').value || student.class,
                    roll: rollNo,
                    marks: document.getElementById('marks').value || student.marks
                };
                
                // Send the update request
                return fetch(`/students/${student.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
            })
            .then(response => {
                if (!response || !response.ok) {
                    throw new Error('Update failed');
                }
                return response.json();
            })
            .then(data => {
                alert('Student updated successfully!');
                form.reset();
            })
            .catch(error => {
                console.error('Error updating student:', error);
                alert('Error updating student: ' + error.message);
            });
    });
});