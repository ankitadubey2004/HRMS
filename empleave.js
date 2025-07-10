document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const totalLeaveBalance = 11;

  const leaveBalanceBox = document.getElementById('leave-balance');
  const approvedBox = document.getElementById('approved-leaves');
  const pendingBox = document.getElementById('pending-leaves');
  const totalBox = document.getElementById('total-requests');
  const leaveContainer = document.getElementById('leave-requests');

  async function fetchEmployeeLeaves() {
    try {
      const res = await fetch('https://hrms-project-8b8h.onrender.com/leave/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Leave request data is not an array");
      }

      let approvedCount = 0;
      let pendingCount = 0;

      leaveContainer.innerHTML = ''; // Clear old cards

      data.forEach(leave => {
        if (leave.status === 'approved') approvedCount++;
        if (leave.status === 'pending') pendingCount++;

        const start = new Date(leave.startDate).toDateString();
        const end = new Date(leave.endDate).toDateString();
        const isSingleDay = start === end;

        const card = document.createElement('div');
        card.className = `leave-card ${leave.status}`;

       card.innerHTML = `
  <div class="card-center">
    <p><strong>Reason:</strong> <span class="highlight-reason">${leave.reason || "Not provided"}</span></p>
    <p class="date"><i class="fas fa-calendar-day"></i> ${isSingleDay ? start : `${start} - ${end}`}</p>
    <p><strong>Days:</strong> ${calculateDays(leave.startDate, leave.endDate)}</p>
  </div>
  <div class="card-right">
    <span class="status-badge">${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
  </div>
`;



        leaveContainer.appendChild(card);
      });

      // Set values
      leaveBalanceBox.textContent = totalLeaveBalance;
      approvedBox.textContent = approvedCount;
      pendingBox.textContent = pendingCount;
      totalBox.textContent = data.length;

    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  }

  function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff === 1 ? '01 Day' : `${String(diff).padStart(2, '0')} Days`;
  }

  fetchEmployeeLeaves();
});
