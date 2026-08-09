const API_BASE = 'http://localhost:5000/api';

let products = [];
let suppliers = [];
let isAdminLoggedIn = localStorage.getItem("is_admin") === "true" || !!localStorage.getItem("admin_token");
let uploadedImageBase64 = "";
let editingProductId = null;
let editingSupplierId = null;
let currentViewingProduct = null;

function saveAllData() {
    localStorage.setItem("is_admin", isAdminLoggedIn ? "true" : "false");
}

async function loadDataFromBackend() {
    try {
        const itemRes = await fetch(`${API_BASE}/items`);
        if (itemRes.ok) {
            const data = await itemRes.json();
            products = data.map(item => ({
                id: item.id,
                name: item.name,
                desc: item.image ? "Product image uploaded." : "No description available.",
                price: item.price,
                stock: item.stock,
                shop: item.Category ? item.Category.name : "BerryCo 🍒",
                categoryId: item.categoryId,
                image: item.image || "BerryTotebag.webp"
            }));
        }

        const catRes = await fetch(`${API_BASE}/categories`);
        if (catRes.ok) {
            const catData = await catRes.json();
            suppliers = catData.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email || "shop@email.com",
                phone: c.phone || "+977-9812345678"
            }));
        } else {
            suppliers = [
                { id: 1, name: "BerryCo 🍒", email: "berry@berryco.com", phone: "+977-9812345678" },
                { id: 2, name: "BeeHive 🐝", email: "buzz@beehive.com", phone: "+977-9845678901" },
                { id: 3, name: "SillyStuff 🎪", email: "hehe@sillystuff.com", phone: "+977-9867891234" }
            ];
        }

        updateSupplierDropdowns();
        renderGrid(products);
        renderSuppliers();
    } catch (err) {
        console.error("Error connecting to backend server:", err);
    }
}

// Function to update dropdowns dynamically with saved suppliers
function updateSupplierDropdowns() {
    const filterSelect = document.getElementById("shopfilter");
    const formSelect = document.getElementById("prodSupplier");
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="">All Suppliers</option>`;
        suppliers.forEach(sup => {
            const opt = document.createElement("option");
            opt.value = sup.name;
            opt.textContent = sup.name;
            filterSelect.appendChild(opt);
        });
    }
    if (formSelect) {
        formSelect.innerHTML = `<option value="">Select a supplier</option>`;
        suppliers.forEach(sup => {
            const opt = document.createElement("option");
            opt.value = sup.id; // Store ID for relational backend mapping
            opt.textContent = sup.name;
            formSelect.appendChild(opt);
        });
    }
}

// Display Admin controls depending on login status
function updateAdminUI() {
    const navSuppliers = document.getElementById("navSuppliers");
    const navAddProduct = document.getElementById("navAddProduct");
    const navLogin = document.getElementById("navLogin");

    if (isAdminLoggedIn) {
        if (navSuppliers) navSuppliers.style.display = "inline";
        if (navAddProduct) navAddProduct.style.display = "inline";
        if (navLogin) navLogin.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
    } else {
        if (navSuppliers) navSuppliers.style.display = "none";
        if (navAddProduct) navAddProduct.style.display = "none";
        if (navLogin) navLogin.innerHTML = `<i class="fa-regular fa-user"></i> Login`;
    }
}

// Navigation between sections
function showPage(pageId) {
    const sections = ["herobanner", "filterstrip", "allproducts", "singleitem", "addstuff", "shoplist", "addshop", "loginpage"];
    
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = "none";
    });
    if (pageId === "allproducts") {
        document.getElementById("herobanner").style.display = "block";
        document.getElementById("filterstrip").style.display = "flex";
        document.getElementById("allproducts").style.display = "block";
    } else {
        const target = document.getElementById(pageId);
        if (target) target.style.display = "block";
    }
}

// Render Products Grid
function renderGrid(items) {
    const grid = document.getElementById("cardgrid");
    if (!grid) return;
    grid.innerHTML = "";
    if (items.length === 0) {
        grid.innerHTML = "<p style='padding:20px;'>No items found matching your filter.</p>";
        return;
    }
    items.forEach(item => {
        const isLow = item.stock < 5;
        const card = document.createElement("div");
        card.className = "itemcard";
        card.innerHTML = `
            <div class="photowrapper">
                <img src="${item.image}" alt="${item.name}" class="itemphoto" onerror="this.src='BerryTotebag.webp'">
                ${isLow ? `<span class="badgelabel almostgonebadge">Low Stock</span>` : ''}
            </div>
            <div class="iteminfo">
                <p class="itemshop">${item.shop}</p>
                <h3 class="itemname">${item.name}</h3>
                <p class="itemprice">Rs. ${item.price}</p>
                <p class="itemstock ${isLow ? 'almostgone' : ''}">${isLow ? `Only ${item.stock} left!` : `In stock: ${item.stock}`}</p>
                <button class="peekbtn" onclick="openSingleProduct(${item.id})">View Product</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Single Product Page
window.openSingleProduct = function(id) {
    const item = products.find(p => p.id === id);
    if (!item) return;
    currentViewingProduct = item;
    document.getElementById("bigphoto").src = item.image;
    document.getElementById("breadcrumb").innerText = `Home > ${item.shop} > ${item.name}`;
    document.getElementById("itemheading").innerText = item.name;
    document.getElementById("itembigprice").innerText = `Rs. ${item.price}`;
    document.getElementById("itemdesc").innerText = item.desc || "No detailed description available.";
    document.getElementById("singleSupplier").innerText = item.shop;
    const warn = document.getElementById("stockwarning");
    if (item.stock < 5) {
        warn.style.display = "block";
        warn.innerText = `⚠ Only ${item.stock} left in stock`;
    } else {
        warn.style.display = "none";
    }
    showPage("singleitem");
};

document.getElementById("fixbtn").addEventListener("click", () => {
    if (!isAdminLoggedIn) {
        document.getElementById("loginModal").style.display = "flex";
        return;
    }
    if (currentViewingProduct) {
        openEditProductForm(currentViewingProduct);
    }
});

function openEditProductForm(item) {
    editingProductId = item.id;
    document.getElementById("prodName").value = item.name;
    document.getElementById("prodDesc").value = item.desc || "";
    document.getElementById("prodPrice").value = item.price;
    document.getElementById("prodQty").value = item.stock;
    document.getElementById("prodSupplier").value = item.categoryId || "";
    uploadedImageBase64 = item.image;
    
    document.getElementById("formTitle").innerText = "Edit Product";
    showPage("addstuff");
}

document.getElementById("herobtn").addEventListener("click", () => {
    if (!isAdminLoggedIn) {
        document.getElementById("loginModal").style.display = "flex";
    } else {
        clearProductForm();
        editingProductId = null;
        document.getElementById("formTitle").innerText = "Add Product";
        showPage("addstuff");
    }
});

// Modal Logic
document.getElementById("modalCloseBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});
document.getElementById("modalLoginBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
    showPage("loginpage");
});

// Navigation Click Actions
document.getElementById("navLogin").addEventListener("click", () => {
    if (isAdminLoggedIn) {
        isAdminLoggedIn = false;
        localStorage.removeItem("admin_token");
        saveAllData();
        updateAdminUI();
        alert("Logged out successfully!");
        showPage("allproducts");
    } else {
        showPage("loginpage");
    }
});

document.getElementById("navInventory").addEventListener("click", () => {
    renderGrid(products);
    showPage("allproducts");
});
document.getElementById("navSuppliers").addEventListener("click", () => {
    renderSuppliers();
    showPage("shoplist");
});
document.getElementById("navAddProduct").addEventListener("click", () => {
    clearProductForm();
    editingProductId = null;
    document.getElementById("formTitle").innerText = "Add Product";
    showPage("addstuff");
});
document.getElementById("backBtn").addEventListener("click", () => showPage("allproducts"));
document.getElementById("addShopBtn").addEventListener("click", () => {
    clearSupplierForm();
    editingSupplierId = null;
    document.getElementById("supplierFormTitle").innerText = "Add Supplier";
    showPage("addshop");
});
document.getElementById("cancelbtn").addEventListener("click", () => showPage("allproducts"));
document.getElementById("cancelshopbtn").addEventListener("click", () => showPage("shoplist"));

// Admin Login Handler with Backend API
document.getElementById("enterbtn").addEventListener("click", async function() {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();

        if (response.ok) {
            isAdminLoggedIn = true;
            localStorage.setItem("admin_token", data.token);
            saveAllData();
            updateAdminUI();
            document.getElementById("wrongmsg").style.display = "none";
            
            alert("Login successful! Admin features are unlocked.");
            showPage("allproducts");
        } else {
            document.getElementById("wrongmsg").style.display = "block";
            document.getElementById("wrongmsg").innerText = data.error || "Wrong username or password.";
        }
    } catch (err) {
        console.error("Login request error:", err);
        document.getElementById("wrongmsg").style.display = "block";
        document.getElementById("wrongmsg").innerText = "Connection error with server.";
    }
});

// Image Upload
document.getElementById("photoupload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            uploadedImageBase64 = evt.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Save or Edit Product fromBackend API
document.getElementById("savebtn").addEventListener("click", async function() {
    const name = document.getElementById("prodName").value.trim();
    const desc = document.getElementById("prodDesc").value.trim();
    const price = parseFloat(document.getElementById("prodPrice").value);
    const qty = parseInt(document.getElementById("prodQty").value);
    const categoryId = document.getElementById("prodSupplier").value;

    if (!name || !categoryId || isNaN(price) || isNaN(qty)) {
        alert("Please fill out all required fields.");
        return;
    }
    if (price < 0 || qty < 0) {
        alert("Price and Quantity cannot be negative numbers.");
        return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
        alert("Admin authentication required.");
        showPage("loginpage");
        return;
    }

    const payload = {
        name,
        price,
        stock: qty,
        categoryId: parseInt(categoryId),
        image: uploadedImageBase64 || "BerryTotebag.webp"
    };

    try {
        let response;
        if (editingProductId) {
            response = await fetch(`${API_BASE}/items/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            alert("Product saved successfully!");
            loadDataFromBackend();
            showPage("allproducts");
            clearProductForm();
        } else {
            const errData = await response.json();
            alert(errData.error || "Failed to save product.");
        }
    } catch (err) {
        console.error("Error saving product:", err);
    }
});

function clearProductForm() {
    document.getElementById("prodName").value = "";
    document.getElementById("prodDesc").value = "";
    document.getElementById("prodPrice").value = "";
    document.getElementById("prodQty").value = "";
    document.getElementById("prodSupplier").value = "";
    document.getElementById("photoupload").value = "";
    uploadedImageBase64 = "";
    editingProductId = null;
}

// Supplier List Rendering & Actions
function renderSuppliers() {
    const tbody = document.getElementById("supplierTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    suppliers.forEach(sup => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${sup.name}</td>
            <td>${sup.email}</td>
            <td>${sup.phone}</td>
            <td>
                <button class="clickbtn tinybtn" onclick="editSupplier(${sup.id})">Edit</button>
                <button class="clickbtn tinybtn delbtn" onclick="deleteSupplier(${sup.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editSupplier = function(id) {
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;
    editingSupplierId = id;
    document.getElementById("supName").value = sup.name;
    document.getElementById("supEmail").value = sup.email;
    document.getElementById("supPhone").value = sup.phone;
    document.getElementById("supplierFormTitle").innerText = "Edit Supplier";
    showPage("addshop");
};

window.deleteSupplier = async function(id) {
    if (confirm("Are you sure you want to remove this supplier?")) {
        suppliers = suppliers.filter(s => s.id !== id);
        updateSupplierDropdowns();
        renderSuppliers();
    }
};

document.getElementById("saveshopbtn").addEventListener("click", function() {
    const name = document.getElementById("supName").value.trim();
    const email = document.getElementById("supEmail").value.trim();
    const phone = document.getElementById("supPhone").value.trim();
    if (!name || !email || !phone) {
        alert("Please complete all supplier details.");
        return;
    }
    if (editingSupplierId) {
        const sup = suppliers.find(s => s.id === editingSupplierId);
        if (sup) {
            sup.name = name;
            sup.email = email;
            sup.phone = phone;
        }
    } else {
        suppliers.push({
            id: Date.now(),
            name: name,
            email: email,
            phone: phone
        });
    }
    updateSupplierDropdowns();
    renderSuppliers();
    showPage("shoplist");
    clearSupplierForm();
});

function clearSupplierForm() {
    document.getElementById("supName").value = "";
    document.getElementById("supEmail").value = "";
    document.getElementById("supPhone").value = "";
    editingSupplierId = null;
}

// Search and Filter Functions
function filterProducts() {
    const query = document.getElementById("searchBox").value.toLowerCase();
    const selectedShop = document.getElementById("shopfilter").value;
    const sort = document.getElementById("sortpick").value;
    let filtered = products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesShop = selectedShop === "" || p.shop === selectedShop;
        return matchesName && matchesShop;
    });
    if (sort === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }
    renderGrid(filtered);
}

document.getElementById("gobutton").addEventListener("click", filterProducts);
document.getElementById("searchBox").addEventListener("keyup", filterProducts);
document.getElementById("shopfilter").addEventListener("change", filterProducts);
document.getElementById("sortpick").addEventListener("change", filterProducts);

// Initialization
updateSupplierDropdowns();
updateAdminUI();
loadDataFromBackend();
showPage("allproducts");