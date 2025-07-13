let allEmployees = [];

window.onload = () => {
  fetchPerformanceData();
};

function fetchPerformanceData() {
  const token = localStorage.getItem('token'); // <-- Get your saved JWT here
  if (!token) {
    alert("You must be logged in as HR.");
    return;
  }

  fetch('https://hrms-project-8b8h.onrender.com/performance/employees?start=2025-07-01&end=2025-07-07', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data)) {
      alert("Unauthorized or invalid token.");
      return;
    }
    allEmployees = data;
    renderCounts(data);
    renderEmployees(data);
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });
}

function renderCounts(data) {
  const high = data.filter(e => e.score >= 80).length;
  const moderate = data.filter(e => e.score >= 50 && e.score < 80).length;
  const low = data.filter(e => e.score < 50).length;

  document.getElementById('completed-count').innerText = data.length;
  document.getElementById('pending-count').innerText = 100 - data.length;

  renderDonutChart(high, moderate, low);
}

function renderDonutChart(high, moderate, low) {
  const total = high + moderate + low;
  const highPercent = total > 0 ? Math.round((high / total) * 100) : 0;

  const ctx = document.getElementById('performanceChart').getContext('2d');

  // Destroy previous chart if already exists (optional, to avoid overlaps)
  if (window.performanceChartInstance) {
    window.performanceChartInstance.destroy();
  }

  window.performanceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High', 'Moderate', 'Low'],
      datasets: [{
        data: [high, moderate, low],
        backgroundColor: ['#17a2b8', '#f0ad4e', '#dc3545'],
        borderWidth: 1
      }]
    },
    options: {
      cutout: '80%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          enabled: true
        },
        centerText: {
          display: true,
          text: `${highPercent}%`
        }
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: (chart) => {
        const {width} = chart;
        const {height} = chart;
        const ctx = chart.ctx;
        ctx.restore();
        const fontSize = (height / 8).toFixed(2);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        const text = chart.options.plugins.centerText.text;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }]
  });
}

function renderEmployees(data) {
  const container = document.getElementById('employeeList');
  container.innerHTML = '';

  data.forEach(emp => {
    console.log("Employee data:", emp); // ✅ Safe here

    const div = document.createElement('div');
    div.className = 'employee-card';

    div.innerHTML = `
  <div class="card-header">
    <h4>${emp.name || 'Unknown Name'}</h4>
    <span class="badge ${emp.score >= 80 ? 'high' : emp.score >= 50 ? 'moderate' : 'low'}">${emp.score}%</span>
  </div>
  <p class="emp-meta">${emp.department || 'Unknown Dept'} • ${emp.position || 'Unknown Position'}</p>
  <div class="card-details">
    <p><strong>Tasks Completed:</strong> ${emp.tasksCompleted !== undefined ? emp.tasksCompleted : 'N/A'}</p>
    <p><strong>On-Time Attendance:</strong> ${emp.onTimeAttendance !== undefined ? emp.onTimeAttendance : 'N/A'}</p>
  </div>
`;

    container.appendChild(div);
  });
}
function filter(type) {
  let filtered;
  if (type === 'high') {
    filtered = allEmployees.filter(e => e.score >= 80);
  } else if (type === 'moderate') {
    filtered = allEmployees.filter(e => e.score >= 50 && e.score < 80);
  } else {
    filtered = allEmployees.filter(e => e.score < 50);
  }
  renderEmployees(filtered);
}
