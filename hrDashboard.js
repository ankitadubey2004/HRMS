const token = localStorage.getItem("token");
const headers = { "Authorization": `Bearer ${token}` };

function renderDateBar() {
    const dateBar = document.getElementById("dateBar");
    const today = new Date();
    for (let i = -2; i <= 2; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const div = document.createElement("div");
        div.className = "date";
        if (i === 0) div.classList.add("selected");

        const day = date.getDate();
        const weekday = date.toLocaleString("default", { weekday: "short" });

        div.innerHTML = `${day}<br><small>${weekday}</small>`;
        dateBar.appendChild(div);
    }
}

async function fetchDashboardData() {
    try {
        const [empRes, leaveRes, newRes] = await Promise.all([
            fetch("https://hrms-project-8b8h.onrender.com/hr/employees/count", { headers }),
            fetch("https://hrms-project-8b8h.onrender.com/hr/employees-on-leave/count", { headers }),
            fetch("https://hrms-project-8b8h.onrender.com/hr/new-employees/count", { headers }),
        ]);

        const empData = await empRes.json();
        const leaveData = await leaveRes.json();
        const newData = await newRes.json();

        // Update counts
        document.getElementById("empCount").innerText = empData.count || 0;
        document.getElementById("leaveCount").innerText = leaveData.count || 0;
        document.getElementById("newCount").innerText = newData.count || 0;

        // Clear previous leave requests
        const leaveContainer = document.getElementById("leaveRequests");
        leaveContainer.innerHTML = "";

        // Show leave requests with details
        leaveData.employees.forEach(emp => {
            const div = document.createElement("div");
            div.className = "leave-request";
            div.innerHTML = `
        <span>${emp.name} (${emp.leaveType || "Leave"}) - ${emp.leaveDate || ""}</span>
        <div class="actions">
          <button class="approve">✔</button>
          <button class="reject">✖</button>
        </div>`;
            leaveContainer.appendChild(div);
        });

        // You can do the same to show all employees or new employees elsewhere if you want

    } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
    }
}

renderDateBar();
fetchDashboardData();
