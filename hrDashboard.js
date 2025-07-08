const token = localStorage.getItem("token");
const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};

let editingNoteId = null;

function renderDateBar() {
  const dateBar = document.getElementById("dateBar");
  const today = new Date();
  for (let i = -2; i <= 2; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const div = document.createElement("div");
    div.className = "date";
    if (i === 0) div.classList.add("selected");
    div.innerHTML = `${date.getDate()}<br><small>${date.toLocaleString("default", { weekday: "short" })}</small>`;
    dateBar.appendChild(div);
  }
}

async function fetchDashboardData() {
  try {
    const [empRes, leaveRes, newRes, notesRes, taskRes] = await Promise.all([
      fetch("https://hrms-project-8b8h.onrender.com/hr/employees/count", { headers }),
      fetch("https://hrms-project-8b8h.onrender.com/hr/employees-on-leave/count", { headers }),
      fetch("https://hrms-project-8b8h.onrender.com/hr/new-employees/count", { headers }),
      fetch("https://hrms-project-8b8h.onrender.com/notes/get", { headers }),
      fetch("https://hrms-project-8b8h.onrender.com/tasks/all-tasks", { headers })
    ]);

    if (empRes.ok) {
      const data = await empRes.json();
      document.getElementById("empCount").innerText = data.count || 0;
    }

    if (leaveRes.ok) {
      const data = await leaveRes.json();
      document.getElementById("leaveCount").innerText = data.count || 0;
    }

    if (newRes.ok) {
      const data = await newRes.json();
      document.getElementById("newCount").innerText = data.count || 0;
    }

    if (notesRes.ok) {
      const data = await notesRes.json();
      const notesList = document.getElementById("hrNotesList");
      notesList.innerHTML = "";

      data.forEach(note => {
        const div = document.createElement("div");
        div.className = "note-item";
        div.innerHTML = `
          <div class="note-content">📝 ${note.content}</div>
          <div class="note-actions">
            <button class="delete-note" data-id="${note._id}">🗑️</button>
          </div>
        `;
        notesList.appendChild(div);
      });

      document.querySelectorAll(".delete-note").forEach(button => {
        button.addEventListener("click", () => {
          const noteId = button.getAttribute("data-id");
          deleteNote(noteId);
        });
      });
    }

    if (taskRes.ok) {
      const data = await taskRes.json();
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";

      data.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-card";

        const statusColor = {
          "pending": "orange",
          "in-progress": "blue",
          "completed": "green"
        };

        div.innerHTML = `
  <strong style="font-size:1.1rem; color:#222;">${task.title}</strong>
  <p style="margin:5px 0;"><b>Description:</b> ${task.description}</p>
<p style="margin:5px 0;"><b>Assigned To:</b> <span style="color:#555;">${task.assignedTo?.name || task.assignedTo || 'N/A'}</span></p>
  <p style="margin:5px 0;"><b>Due Date:</b> <span style="color:#555;">${new Date(task.dueDate).toLocaleDateString()}</span></p>
  <p style="margin:5px 0;">
    <b>Status:</b> 
    <span class="status-badge ${task.status}">${task.status}</span>
  </p>
`;



        taskList.appendChild(div);
      });
    }


  } catch (err) {
    console.error("❌ Error fetching dashboard data:", err);
  }

  renderLeaveRequests(); // call leave requests after everything
}

async function deleteNote(noteId) {
  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    const res = await fetch(`https://hrms-project-8b8h.onrender.com/notes/delete/${noteId}`, {
      method: "DELETE",
      headers
    });

    if (!res.ok) throw new Error("Failed to delete note");
    fetchDashboardData();
  } catch (err) {
    console.error("❌ Error deleting note:", err);
  }
}

async function renderLeaveRequests() {
  try {
    const res = await fetch("https://hrms-project-8b8h.onrender.com/leave/requests", { headers });
    if (!res.ok) throw new Error("Failed to fetch leave requests");

    const data = await res.json();

    // Optional: Sort so pending comes on top
    data.sort((a, b) => {
      if (a.status === "pending") return -1;
      if (b.status === "pending") return 1;
      return 0;
    });

    const leaveContainer = document.getElementById("leaveRequests");
    leaveContainer.innerHTML = "";

    data.forEach(leave => {
      const div = document.createElement("div");
      div.className = "leave-request-card";
      div.innerHTML = `
        <div class="leave-header">
          <strong>${leave.employeeId?.name}</strong>
          <span class="leave-status ${leave.status}">${leave.status.toUpperCase()}</span>
        </div>
        <div class="leave-dates">
          🗓️ ${new Date(leave.startDate).toDateString()} → ${new Date(leave.endDate).toDateString()}
        </div>
        <div class="leave-reason">💬 ${leave.reason}</div>

        ${leave.status === 'pending'
          ? `<div class="leave-actions">
                <button class="approve-btn" onclick="updateLeaveStatus('${leave._id}', 'approved')">✅ Approve</button>
                <button class="reject-btn" onclick="updateLeaveStatus('${leave._id}', 'rejected')">❌ Reject</button>
              </div>`
          : ''
        }
      `;
      leaveContainer.appendChild(div);
    });

  } catch (err) {
    console.error("❌ Error rendering leave requests:", err);
  }
}

async function updateLeaveStatus(leaveId, status) {
  try {
    const res = await fetch("https://hrms-project-8b8h.onrender.com/leave/update-status", {
      method: "PUT",
      headers,
      body: JSON.stringify({ requestId: leaveId, status })
    });

    if (!res.ok) throw new Error("Failed to update leave status");
    fetchDashboardData();
  } catch (err) {
    console.error("❌ Error updating leave:", err);
  }
}

function setupModal() {
  const modal = document.getElementById("taskModal");
  document.getElementById("addTaskBtn").onclick = () => modal.style.display = "block";
  document.getElementById("closeModal").onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  document.getElementById("taskForm").onsubmit = async function (e) {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const assignedTo = document.getElementById("assignedTo").value; // make sure this is a valid _id
  const dueDate = document.getElementById("dueDate").value;
  const createdAt = document.getElementById("createdAt").value || new Date().toISOString();

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const body = JSON.stringify({
    title,
    description,
    assignedTo,
    dueDate,
    createdAt,
  });

  try {
    const response = await fetch("https://hrms-project-8b8h.onrender.com/tasks/assign", {
      method: "POST",
      headers,
      body,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Task not assigned");
    }

    alert("✅ Task assigned successfully!");
    document.getElementById("taskForm").reset();
    document.getElementById("taskModal").style.display = "none";
    // optionally refresh task list here
  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ " + err.message);
  }
};
}


function setupNoteModal() {
  const noteModal = document.getElementById("noteModal");
  const noteForm = document.getElementById("noteForm");

  document.getElementById("addNoteBtn").onclick = () => {
    editingNoteId = null;
    document.getElementById("noteText").value = "";
    noteModal.style.display = "block";
  };

  document.getElementById("closeNoteModal").onclick = () => noteModal.style.display = "none";
  window.onclick = (e) => { if (e.target === noteModal) noteModal.style.display = "none"; };

  noteForm.onsubmit = async (e) => {
    e.preventDefault();
    const noteText = document.getElementById("noteText").value.trim();
    if (!noteText) return alert("Note required");

    try {
      let res;
      if (editingNoteId) {
        res = await fetch(`https://hrms-project-8b8h.onrender.com/notes/update/${editingNoteId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ content: noteText })
        });
      } else {
        res = await fetch("https://hrms-project-8b8h.onrender.com/notes/create", {
          method: "POST",
          headers,
          body: JSON.stringify({ content: noteText })
        });
      }

      if (!res.ok) throw new Error("Note error");
      noteForm.reset();
      noteModal.style.display = "none";
      editingNoteId = null;
      fetchDashboardData();
    } catch (err) {
      console.error("❌ Note error:", err);
    }
  };
}

// INIT
renderDateBar();
fetchDashboardData();
setupModal();
setupNoteModal();

