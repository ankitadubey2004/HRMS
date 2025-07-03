document.getElementById('registerHrForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = e.target.hrEmail.value.trim();
  const password = e.target.hrPassword.value.trim();

  if (!email || !password) {
    alert('Please fill all fields.');
    return;
  }

  // Get the admin token stored after admin login
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not authorized. Please login as Admin first.');
    return;
  }

  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/super-admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Add token here
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('HR registered successfully!');
      e.target.reset();
    } else {
      alert('Registration failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error connecting to server. Try again later.');
  }
});
