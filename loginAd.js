// 
function toggleDropdown() {
  const dropdown = document.getElementById("myDropdown");
  const arrow = document.getElementById("arrowIcon");
  dropdown.classList.toggle("show");
  arrow.classList.toggle("rotate");
}

function selectRole(role) {
  document.getElementById("selectedRole").innerText = role;
  document.getElementById("role").value = role;
  document.getElementById("myDropdown").classList.remove("show");
  document.getElementById("arrowIcon").classList.remove("rotate");
}

window.onclick = function (e) {
  if (!e.target.closest('.dropdown')) {
    document.getElementById("myDropdown").classList.remove("show");
    document.getElementById("arrowIcon").classList.remove("rotate");
  }
};

window.onload = () => {
  if (!document.getElementById("role").value) {
    document.getElementById("selectedRole").innerText = "Select Role";
  }
};

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role.");
    return;
  }

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const loginUrl = "https://hrms-project-8b8h.onrender.com/auth/login";
  let redirectPage = "";

  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful!");

      if (data.token) localStorage.setItem("token", data.token);

      // 🚀 Redirect logic based on role and first login
      if (role === "Admin") {
        redirectPage = "registerHr.html";
      } else if (role === "HR") {
        redirectPage = data.isFirstLogin ? "registerEmployee.html" : "hrDashboard.html";
      } else if (role === "Employee") {
        redirectPage = data.isFirstLogin ? "completeProfile.html" : "empDashboard.html";
      }

      window.location.href = redirectPage;
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (error) {
    console.error(error);
    alert("Server error. Please try again.");
  }
});
