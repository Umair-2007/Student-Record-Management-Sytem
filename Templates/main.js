document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                logout(); // Token is invalid or expired
            }
        })
        .then(data => {
            if (data) {
                let logoutButton = document.getElementById('logoutBtn');
                if (!logoutButton) {
                    logoutButton = document.createElement('button');
                    logoutButton.id = 'logoutBtn';
                    logoutButton.textContent = 'Logout';
                    logoutButton.onclick = logout;
                    document.body.appendChild(logoutButton);
                }
            }
        })
        .catch(() => {
            logout();
        });
    } else {
        window.location.href = 'login.html';
    }

    // Enable pressing Enter to trigger askAI
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                askAI();
            }
        });
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function askAI() {
    const query = document.getElementById('aiInput').value;
    const aiResponse = document.getElementById('aiResponse');
    aiResponse.textContent = "Thinking...";
    fetch('https://localhost:5001/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        aiResponse.textContent = "";
        aiResponse.classList.remove("cool-animate");
        void aiResponse.offsetWidth; // trigger reflow for animation
        aiResponse.classList.add("cool-animate");
        aiResponse.innerHTML = `<span>${data.response || "No answer found."}</span>`;
    })
    .catch(() => {
        aiResponse.textContent = "AI service unavailable.";
    });
}

function loadAnalytics() {
    const analyticsContent = document.getElementById('analyticsContent');
    analyticsContent.textContent = "Loading analytics...";
    fetch('https://localhost:5001/student_analytics')
        .then(response => response.json())
        .then(data => {
            let html = `
                <strong>Total Students:</strong> ${data.total_students}<br>
                <strong>Average Marks:</strong> ${data.average_marks}<br>
                <strong>Highest Marks:</strong> ${data.highest_marks !== null ? data.highest_marks : 'N/A'}<br>
                <strong>Lowest Marks:</strong> ${data.lowest_marks !== null ? data.lowest_marks : 'N/A'}<br>
                <strong>Grade Distribution:</strong>
                <ul>
            `;
            for (const [grade, count] of Object.entries(data.grade_distribution)) {
                html += `<li>${grade}: ${count}</li>`;
            }
            html += '</ul>';
            analyticsContent.innerHTML = html;
        })
        .catch(() => {
            analyticsContent.textContent = "Unable to load analytics.";
        });
}