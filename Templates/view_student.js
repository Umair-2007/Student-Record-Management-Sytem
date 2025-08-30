function viewStudent() {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) {
        console.error("Table body with id 'studentTableBody' not found.");
        return;
    }
    tbody.innerHTML = "";

    // Show loading message
    tbody.innerHTML = "<tr><td colspan='6'>Loading students...</td></tr>";

    // Fetch students from the API
    fetch('http://localhost:5001/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(students => {
            console.log("Loaded students:", students);
            tbody.innerHTML = "";
            
            if (students.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6'>No students found</td></tr>";
                return;
            }
            
            // Function already defined above for sorting
            
            // Function to get grade priority (for sorting)
            function getGradePriority(grade) {
                const gradePriority = {
                    'A+': 1,
                    'A': 2,
                    'B': 3,
                    'C': 4,
                    'D': 5,
                    'E': 6,
                    'F': 7,
                    'N/A': 8
                };
                return gradePriority[grade] || 9;
            }
            
            // Sort students by grade (highest to lowest) and then by marks (highest to lowest)
            students.sort((a, b) => {
                // Calculate grades
                const gradeA = calculateGrade(a.marks);
                const gradeB = calculateGrade(b.marks);
                
                // Compare grades first
                const gradePriorityA = getGradePriority(gradeA);
                const gradePriorityB = getGradePriority(gradeB);
                
                if (gradePriorityA !== gradePriorityB) {
                    return gradePriorityA - gradePriorityB; // Sort by grade priority
                }
                
                // If grades are the same, sort by marks
                const marksA = a.marks !== null && a.marks !== undefined ? a.marks : -1;
                const marksB = b.marks !== null && b.marks !== undefined ? b.marks : -1;
                return marksB - marksA; // Descending order by marks
            });

            // Function to calculate grade based on marks
            function calculateGrade(marks) {
                if (marks === null || marks === undefined) return 'N/A';
                
                if (marks >= 90) return 'A+';
                if (marks >= 80) return 'A';
                if (marks >= 70) return 'B';
                if (marks >= 60) return 'C';
                if (marks >= 50) return 'D';
                if (marks >= 35) return 'E';
                return 'F';
            }
            
            students.forEach(student => {
                const grade = calculateGrade(student.marks);
                const row = `
                    <tr>
                        <td>${student.roll}</td>
                        <td>${student.name}</td>
                        <td>${student.class}</td>
                        <td>${student.marks !== null && student.marks !== undefined ? student.marks : 'Not provided'}</td>
                        <td>${grade}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            tbody.innerHTML = `<tr><td colspan='6'>Error loading students: ${error.message}</td></tr>`;
        });
}

document.addEventListener("DOMContentLoaded", viewStudent);