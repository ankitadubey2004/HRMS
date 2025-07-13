// document.addEventListener('DOMContentLoaded', () => {
//   fetchProfile();

//   document.getElementById('profileForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     updateProfile();
//   });
// });

// async function fetchProfile() {
//   const token = localStorage.getItem('token');
//   try {
//     const res = await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     const data = await res.json();

//     document.getElementById('name').value = data.name || '';
//     document.getElementById('phone').value = data.phone || '';
//     document.getElementById('department').value = data.department || '';
//     document.getElementById('position').value = data.position || '';
//   } catch (err) {
//     console.error('Error loading profile:', err);
//     alert('Could not load profile');
//   }
// }

// async function updateProfile() {
//   const token = localStorage.getItem('token');

//   const body = {
//     name: document.getElementById('name').value,
//     phone: document.getElementById('phone').value,
//     department: document.getElementById('department').value,
//     position: document.getElementById('position').value
//   };

//   try {
//     const res = await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(body)
//     });

//     const data = await res.json();
//     alert('✅ Profile updated successfully');
//   } catch (err) {
//     console.error('Update failed:', err);
//     alert('❌ Failed to update profile');
//   }
// }
document.addEventListener('DOMContentLoaded', () => {
  fetchProfile();

  const editBtn = document.getElementById('editBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');

  editBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateProfile();
    modal.classList.add('hidden');
  });
});

async function fetchProfile() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    document.getElementById('dispName').textContent = data.name || '';
    document.getElementById('dispPhone').textContent = data.phone || '';
    document.getElementById('dispDepartment').textContent = data.department || '';
    document.getElementById('dispPosition').textContent = data.position || '';

    document.getElementById('name').value = data.name || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('department').value = data.department || '';
    document.getElementById('position').value = data.position || '';
  } catch (err) {
    console.error('Profile fetch failed:', err);
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
    await fetch('https://hrms-project-8b8h.onrender.com/profile/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    alert('✅ Profile updated');
    fetchProfile();
  } catch (err) {
    alert('❌ Failed to update');
    console.error(err);
  }
}
