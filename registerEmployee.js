document.getElementById('registerEmployeeForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = e.target.empEmail.value.trim();
  const password = e.target.empPassword.value.trim();

  if (!email || !password) {
    alert('Please fill all fields.');
    return;
  }

  // Get the token from localStorage (HR should have logged in already)
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as HR to register an employee.');
    return;
  }

  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/hr/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`   // <-- Send token here
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert('Employee registered successfully!');
      e.target.reset();
    } else {
      alert('Registration failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error connecting to server. Try again later.');
  }
});
