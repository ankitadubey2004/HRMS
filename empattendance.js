const token = localStorage.getItem("token");

async function fetchMyAttendance() {
  try {
    const res = await fetch("https://hrms-project-8b8h.onrender.com/attendance/records", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const container = document.getElementById("attendanceList");
    container.innerHTML = "";

    if (!Array.isArray(data)) {
      container.innerHTML = "<p>No records found.</p>";
      return;
    }

    data.reverse().forEach((record) => {
      const card = document.createElement("div");
      card.className = "attendance-card";

      const date = new Date(record.date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
      });

      const checkin = record.checkinTime ? new Date(record.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00 am";

      const officeTime = "06:00 am"; // fixed office time

      let statusText = record.status === "Absent" ? "On Leave" : (record.isLate ? "Late" : "On Time");
      let statusClass = record.status === "Absent" ? "leave" : (record.isLate ? "late" : "ontime");

      card.innerHTML = `
        <h3>${date}</h3>
        <div class="attendance-row">
          <span><i class="fa-regular fa-clock icon"></i>${checkin}</span>
          <span><i class="fa-solid fa-building icon"></i>${officeTime}</span>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
  }
}

fetchMyAttendance();
