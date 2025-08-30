document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');
    
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        if (!searchInput) {
            searchResults.innerHTML = '<p>Please enter a search term</p>';
            return;
        }
        
        // Show loading message
        searchResults.innerHTML = '<p>Searching...</p>';
        
        // Fetch all students
        fetch('http://localhost:5001/students')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(students => {
                // Filter students based on search input
                const filteredStudents = students.filter(student => 
                    student.name.toLowerCase().includes(searchInput) || 
                    student.roll.toLowerCase().includes(searchInput)
                );
                
                if (filteredStudents.length === 0) {
                    searchResults.innerHTML = '<p>No students found matching your search</p>';
                    return;
                }
                
                // Display results
                let resultsHTML = '<h2>Search Results</h2><table><thead><tr><th>Name</th><th>Class</th><th>Roll No</th><th>Marks</th></tr></thead><tbody>';
                
                filteredStudents.forEach(student => {
                    resultsHTML += `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.class}</td>
                            <td>${student.roll}</td>
                            <td>${student.marks || 'Not provided'}</td>
                        </tr>
                    `;
                });
                
                resultsHTML += '</tbody></table>';
                searchResults.innerHTML = resultsHTML;
            })
            .catch(error => {
                console.error('Error searching students:', error);
                searchResults.innerHTML = `<p>Error searching students: ${error.message}</p>`;
            });
    });
});