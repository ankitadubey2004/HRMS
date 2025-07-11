const token = localStorage.getItem('token');
const totalLeaveBalance = 11;

const leaveBalanceBox = document.getElementById('leave-balance');
const approvedBox = document.getElementById('approved-leaves');
const pendingBox = document.getElementById('pending-leaves');
const totalBox = document.getElementById('total-requests');
const leaveContainer = document.getElementById('leave-requests');

// Fetch leave requests of the logged-in employee
async function fetchEmployeeLeaves() {
  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/leave/my-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid data format");

    let approvedCount = 0, pendingCount = 0;
    leaveContainer.innerHTML = '';

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

    leaveBalanceBox.textContent = totalLeaveBalance;
    approvedBox.textContent = approvedCount;
    pendingBox.textContent = pendingCount;
    totalBox.textContent = data.length;

  } catch (error) {
    console.error("Error fetching leave data:", error);
  }
}

// Calculate total leave days
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
  return diff === 1 ? '01 Day' : `${String(diff).padStart(2, '0')} Days`;
}

// Prevent selecting past dates
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").setAttribute("min", today);
  document.getElementById("endDate").setAttribute("min", today);
  fetchEmployeeLeaves();
});

// Show the leave request modal
document.getElementById('openLeaveForm').addEventListener('click', () => {
  document.getElementById('leaveModal').style.display = 'flex';
});

// Hide the leave request modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('leaveModal').style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('leaveModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Submit leave request
document.getElementById('leaveForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const reason = document.getElementById('reason').value;

  // Validate date order
  if (new Date(startDate) > new Date(endDate)) {
    alert("End Date must be after or equal to Start Date.");
    return;
  }

  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/leave/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ startDate, endDate, reason })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Leave request submitted ✅');
      document.getElementById('leaveModal').style.display = 'none';
      document.getElementById('leaveForm').reset();
      fetchEmployeeLeaves();
    } else {
      alert(data.message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Error submitting leave:', err);
    alert('Error submitting leave request');
  }
});
