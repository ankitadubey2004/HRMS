document.addEventListener('DOMContentLoaded', fetchPerformance);

let scoreChartInstance = null;

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { start, end };
}

async function fetchPerformance() {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const loader = createLoader();
  document.querySelector('.container').appendChild(loader);

  const { start, end } = getCurrentMonthRange();

  try {
    const response = await fetch(`https://hrms-project-8b8h.onrender.com/performance/me?start=${start}&end=${end}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    loader.remove();

    // Update UI with fetched data
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
    loader.remove();
    showError("Unable to load performance data. Please try again later.");
  }
}

function drawChart(score) {
  const canvas = document.getElementById('scoreChart');
  const ctx = canvas.getContext('2d');

  // Score-based dynamic color
  let mainColor = '#00c6ff';
  if (score < 60) mainColor = '#f44336'; // red
  else if (score < 80) mainColor = '#ffc107'; // yellow
  else mainColor = '#4caf50'; // green

  const gradient = ctx.createLinearGradient(0, 0, 120, 120);
  gradient.addColorStop(0, mainColor);
  gradient.addColorStop(1, '#e0e0e0');

  if (scoreChartInstance) scoreChartInstance.destroy();

  scoreChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [mainColor, '#e0e0e0'],
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

function createLoader() {
  const loader = document.createElement('div');
  loader.innerText = 'Loading...';
  loader.style.textAlign = 'center';
  loader.style.margin = '20px 0';
  loader.style.fontWeight = 'bold';
  loader.style.color = '#555';
  return loader;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerText = message;
  errorDiv.style.color = 'red';
  errorDiv.style.margin = '20px';
  errorDiv.style.textAlign = 'center';
  document.querySelector('.container').appendChild(errorDiv);
}
