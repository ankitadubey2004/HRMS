document.addEventListener('DOMContentLoaded', fetchPerformance);

let scoreChartInstance = null;

async function fetchPerformance() {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch('https://hrms-project-8b8h.onrender.com/performance/me?start=2025-07-01&end=2025-07-07', {
      method: 'GET',
      headers
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();

    // Dynamically populate data
    document.getElementById('empName').innerText = data.name || 'Employee';
    document.getElementById('empRole').innerText = data.role || 'Employee Role';
    document.getElementById('lastReview').innerText = `Last review: ${data.lastReviewDate || '--'}`;

    const score = data.score || 0;
    document.getElementById('scorePercent').innerText = `${score}%`;

    document.getElementById('selfReview').innerText = data.selfReview?.text || '--';
    document.getElementById('selfReviewDate').innerText = `${data.selfReview?.date || '--'} | By: Self`;

    document.getElementById('managerFeedback').innerText = data.managerReview?.text || '--';
    document.getElementById('managerReviewDate').innerText = `${data.managerReview?.date || '--'} | By: ${data.managerReview?.by || 'Manager'}`;

    drawChart(score);
  } catch (err) {
    console.error('Error fetching performance:', err);
    alert('Failed to load performance data. Please try again later.');
  }
}

function drawChart(score) {
  const canvas = document.getElementById('scoreChart');
  const ctx = canvas.getContext('2d');

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 120, 120);
  gradient.addColorStop(0, '#4a6cf7');
  gradient.addColorStop(1, '#00c6ff');

  if (scoreChartInstance) scoreChartInstance.destroy();

  scoreChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [gradient, '#e0e0e0'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}
