document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('dateInput');
  const attendanceList = document.getElementById('attendanceList');

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // Initial fetch
  fetchAttendance(today);

  // Fetch on date change
  dateInput.addEventListener('change', () => {
    fetchAttendance(dateInput.value);
  });

  function fetchAttendance(date) {
    attendanceList.innerHTML = '<p>Loading attendance...</p>';

    const token = localStorage.getItem('token');
    if (!token) {
      attendanceList.innerHTML = '<p>Token missing. Please log in as HR.</p>';
      return;
    }

fetch(`https://hrms-project-8b8h.onrender.com/attendance/all?date=${date}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch attendance');
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          attendanceList.innerHTML = '<p>No records found.</p>';
          return;
        }

        attendanceList.innerHTML = '';

        if (data.length === 0) {
          attendanceList.innerHTML = '<p>No attendance records for this date.</p>';
          return;
        }

        const officeStart = new Date(`${date}T09:00:00`);

        data.forEach(entry => {
          const employeeName = entry.employeeId?.name || 'Unknown';
          const checkin = entry.checkinTime ? new Date(entry.checkinTime) : null;
          const timeStr = checkin
            ? checkin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '00:00';

          let statusText = '';
          let statusClass = '';

         if (!checkin || (checkin.getHours() === 0 && checkin.getMinutes() === 0)) {
  statusText = '🟡 On Leave';
  statusClass = 'leave';
} else if (checkin > officeStart) {
  statusText = '🔴 Late';
  statusClass = 'late';
} else {
  statusText = '🟢 On Time';
  statusClass = 'ontime';
}


          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div>
              <div class="name">${employeeName}</div>
              <div class="time">${timeStr}</div>
            </div>
            <div class="status ${statusClass}">${statusText}</div>
          `;
          attendanceList.appendChild(card);
        });
      })
      .catch(error => {
        console.error('Error fetching attendance:', error);
        attendanceList.innerHTML = '<p>Error loading attendance data.</p>';
      });
  }
});
