const token = localStorage.getItem("token");
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
async function loadUserProfile() {
    try {
        const res = await fetch("https://hrms-project-8b8h.onrender.com/profile/me", {
            headers,
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const user = await res.json();

        // Set name and position in header
        document.querySelector(".user-header strong").innerText = user.name || "Employee";
        document.querySelector(".user-header small").innerText = user.position || user.role || "Staff";

    } catch (err) {
        console.error("❌ Error loading user profile:", err);
    }
}


// -------------------- Attendance --------------------
async function checkIn() {
    const currentTime = new Date().toISOString(); // current time as checkin

    const res = await fetch('https://hrms-project-8b8h.onrender.com/attendance/mark', {
        method: 'POST',
        headers,
        body: JSON.stringify({ checkinTime: currentTime })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message); // Show "Attendance already marked for today"
        return;
    }

    document.getElementById('attendance-status').textContent = `Checked in at: ${new Date().toLocaleTimeString()}`;
}


async function checkOut() {
    const currentTime = new Date().toISOString(); // Send the checkout time
    const res = await fetch('https://hrms-project-8b8h.onrender.com/attendance/checkout', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ checkoutTime: currentTime })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Checkout failed');
    }

    document.getElementById('attendance-status').textContent = `Checked out at: ${new Date().toLocaleTimeString()}`;
}
// -------------------- Tasks --------------------


// Fetch tasks assigned to logged-in employee
// -------------------- Tasks --------------------

async function loadTasks() {
  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/tasks/my-tasks', {
      method: 'GET',
      headers,
    });

    if (!res.ok) throw new Error('Failed to fetch tasks');

    const tasks = await res.json();
    const container = document.getElementById('task-list');
    container.innerHTML = '';

    if (!tasks.length) {
      container.innerHTML = '<p>No tasks assigned yet.</p>';
      return;
    }

    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task';
      div.innerHTML = `
        <div class="task-header">
          <strong>${task.title}</strong>
          <span class="task-due">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="status-btns">
          <button class="${task.status === 'pending' ? 'active' : ''}" onclick="updateTaskStatus('${task._id}', 'pending')">Pending</button>
          <button class="${task.status === 'in-progress' ? 'active' : ''}" onclick="updateTaskStatus('${task._id}', 'in-progress')">In Progress</button>
          <button class="${task.status === 'completed' ? 'active' : ''}" onclick="updateTaskStatus('${task._id}', 'completed')">Completed</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error loading tasks:", err.message);
    alert("Failed to load tasks. Please try again.");
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    // Basic status validation
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      alert("Invalid status value.");
      return;
    }

    const res = await fetch(`https://hrms-project-8b8h.onrender.com/tasks/update-status/${taskId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Task update error:", data.message);
      throw new Error(data.message || 'Failed to update task status');
    }

    console.log(`✅ Task ${taskId} updated to ${status}`);
    loadTasks(); // Refresh task list
  } catch (err) {
    console.error("❌ Error updating task status:", err.message);
    alert("Could not update task status. Please try again.");
  }
}
loadTasks();


// -------------------- Leave Status --------------------
async function loadLeaves() {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/leave/my-requests', {
        method: 'GET',
        headers
    });
    const leaves = await res.json();
    const container = document.getElementById('leave-status-list');
    container.innerHTML = '';
    leaves.forEach(lv => {
        const div = document.createElement('div');
        div.className = `leave-card ${lv.status}`;
        div.innerHTML = `
        <div class="leave-dates">
            <strong>${new Date(lv.startDate).toDateString()}</strong>
            <span>to</span>
            <strong>${new Date(lv.endDate).toDateString()}</strong>
        </div>
        <div class="leave-status-label ${lv.status}">
            ${lv.status.charAt(0).toUpperCase() + lv.status.slice(1)}
        </div>
    `;
        container.appendChild(div);
    });

}
// -------------------- Notes --------------------

async function fetchNotes() {
    try {
        const res = await fetch("https://hrms-project-8b8h.onrender.com/notes/get", { headers });
        if (!res.ok) throw new Error("Failed to load notes");

        const data = await res.json();
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

    } catch (err) {
        console.error("❌ Error loading notes:", err);
    }
}

async function deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        const res = await fetch(`https://hrms-project-8b8h.onrender.com/notes/delete/${noteId}`, {
            method: "DELETE",
            headers
        });

        if (!res.ok) throw new Error("Failed to delete note");
        fetchNotes();
    } catch (err) {
        console.error("❌ Error deleting note:", err);
    }
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
        if (!noteText) return alert("Note content is required.");

        try {
            const res = await fetch("https://hrms-project-8b8h.onrender.com/notes/create", {
                method: "POST",
                headers,
                body: JSON.stringify({ content: noteText })
            });

            if (!res.ok) throw new Error("Failed to create note");

            noteForm.reset();
            noteModal.style.display = "none";
            fetchNotes();
        } catch (err) {
            console.error("❌ Error saving note:", err);
        }
    };
}

// Initial Load
renderDateBar();   // <-- Add this line

loadTasks();
loadLeaves();
fetchNotes();
setupNoteModal();
loadUserProfile();
