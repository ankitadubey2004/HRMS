function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

let pieChart = null;

async function fetchPerformance() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('performanceContent');

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authorized. Please login.');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // last 7 days

    const params = new URLSearchParams({
      start: formatDate(startDate),
      end: formatDate(endDate)
    });

    const url = 'https://hrms-project-8b8h.onrender.com/performance/me?' + params.toString();

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch data');
    }

    const data = await res.json();

    // Update cards
    document.getElementById('tasksCompleted').textContent = data.tasksCompleted;
    document.getElementById('tasksOnTime').textContent = data.tasksOnTime;
    document.getElementById('totalAttendance').textContent = data.totalAttendance;
    document.getElementById('onTimeAttendance').textContent = data.onTimeAttendance;
    document.getElementById('scoreNumber').textContent = `${data.score} / 100`;
    document.getElementById('scoreProgress').value = data.score;

    // Prepare pie chart data (example: completed tasks vs not completed, attendance on time vs late)
    const tasksNotCompleted = data.tasksCompleted - data.tasksOnTime;
    const attendanceLate = data.totalAttendance - data.onTimeAttendance;

    // Destroy old chart if exists
    if (pieChart) pieChart.destroy();

    const ctx = document.getElementById('performancePieChart').getContext('2d');
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Tasks On Time', 'Tasks Late', 'On-Time Attendance', 'Late Attendance'],
        datasets: [{
          label: 'Performance Metrics',
          data: [data.tasksOnTime, tasksNotCompleted > 0 ? tasksNotCompleted : 0, data.onTimeAttendance, attendanceLate > 0 ? attendanceLate : 0],
          backgroundColor: ['#4a90e2', '#e14a4a', '#7ed957', '#f5b942'],
          hoverOffset: 20,
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 14 }
            }
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });

    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'block';

  } catch (err) {
    loadingEl.style.display = 'none';
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

fetchPerformance();