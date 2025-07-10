const token = localStorage.getItem("token");

  async function fetchLeaveData() {
    try {
      const res = await fetch("https://hrms-project-8b8h.onrender.com/leave/requests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      let total = data.length;
      let approved = data.filter(d => d.status === 'approved').length;
      let pending = data.filter(d => d.status === 'pending').length;
      let rejected = data.filter(d => d.status === 'rejected').length;

      document.getElementById('total').innerText = total;
      document.getElementById('approved').innerText = approved;
      document.getElementById('pending').innerText = pending;
      document.getElementById('rejected').innerText = rejected;

      renderLeaveRequests(data);
    } catch (err) {
      alert("Failed to load leave data.");
      console.error(err);
    }
  }

  function renderLeaveRequests(requests) {
    const container = document.getElementById("leaveList");
    container.innerHTML = "";

    requests.forEach(req => {
      const name = req.employeeId?.name || "Unknown";
      const reason = req.reason;
      const start = new Date(req.startDate).toDateString();
      const end = new Date(req.endDate).toDateString();
      const dateRange = start === end ? start : `${start} - ${end}`;
      const status = req.status;

      const div = document.createElement("div");
      div.className = "request";
      div.innerHTML = `
        <div class="top">
          <strong>${name}</strong>
          <span>ID: ${req._id.slice(-5)}</span>
        </div>
        <div class="reason">${reason}</div>
        <div class="reason">${dateRange}</div>
        <div class="actions">
          ${status === 'pending' ? `
            <button class="btn reject" onclick="updateStatus('${req._id}', 'rejected')">Reject</button>
            <button class="btn accept" onclick="updateStatus('${req._id}', 'approved')">Accept</button>
          ` : `<span>Status: <strong>${status}</strong></span>`}
        </div>
      `;

      container.appendChild(div);
    });
  }

  async function updateStatus(requestId, status) {
    try {
      const res = await fetch("https://hrms-project-8b8h.onrender.com/leave/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, status })
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Leave request ${status} successfully.`);
        fetchLeaveData(); // Refresh the list
      } else {
        alert(result.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Server error.");
    }
  }

  // Call on page load
  fetchLeaveData();