const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const itemForm = document.getElementById('item-form');
  if (itemForm) {
    itemForm.addEventListener('submit', handleAddItem);
  }
});

// 1. Fetch and Display Items
async function fetchItems() {
  try {
    const response = await fetch(`${API_BASE}/items`);
    const items = await response.json();
    
    const container = document.getElementById('item-list');
    if (!container) return;

    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
        <p>Stock: ${item.stock}</p>
        <button onclick="deleteItem(${item.id})">Delete</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching items:', err);
  }
}

// 2. Handle Admin Login
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
  }
}

// 3. Handle Add Item (with Client-Side Validation)
async function handleAddItem(e) {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const price = parseFloat(document.getElementById('item-price').value);
  const stock = parseInt(document.getElementById('item-stock').value);
  const categoryId = document.getElementById('item-category').value;

  // Client-side validation
  if (!name || isNaN(price) || isNaN(stock)) {
    alert('Please fill in all required fields properly.');
    return;
  }
  if (price < 0 || stock < 0) {
    alert('Price and stock cannot be negative numbers.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as an admin to add items.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, stock, categoryId })
    });

    if (response.ok) {
      alert('Item added successfully!');
      fetchItems();
      e.target.reset();
    } else {
      const errData = await response.json();
      alert(errData.error || 'Failed to add item');
    }
  } catch (err) {
    console.error('Error adding item:', err);
  }
}

// 4. Delete Item
async function deleteItem(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as an admin to delete items.');
    return;
  }

  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const response = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      fetchItems();
    } else {
      alert('Failed to delete item');
    }
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}