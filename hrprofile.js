document.addEventListener('DOMContentLoaded', () => {
  fetchProfile();

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    updateProfile();
  });
});

async function fetchProfile() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    document.getElementById('name').value = data.name || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('department').value = data.department || '';
    document.getElementById('position').value = data.position || '';
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Could not load profile');
  }
}

async function updateProfile() {
  const token = localStorage.getItem('token');

  const body = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    department: document.getElementById('department').value,
    position: document.getElementById('position').value
  };

  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    alert('✅ Profile updated successfully');
  } catch (err) {
    console.error('Update failed:', err);
    alert('❌ Failed to update profile');
  }
}
