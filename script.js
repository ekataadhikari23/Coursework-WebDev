const API_BASE = "api/";

let products = [];
let suppliers = [];
let isAdminLoggedIn = false;

let uploadedPhotoFile = null;   // the actual File object to upload
let editingProductId = null;
let editingSupplierId = null;
let currentViewingProduct = null;


//async used so we can use await inside it to pause and wait for something slow (like a network request) without freezzingthe whole page.
async function apiGet(endpoint) {
    const res = await fetch(API_BASE + endpoint);
    return res.json();
}

async function apiPostJSON(endpoint, data) {
    const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}


// FormData is the only way my app uploads product photos.
async function apiPostForm(endpoint, formData) {
    const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        body: formData
    });
    return res.json();
}

async function loadProducts() {
    const result = await apiGet("get_products.php");
    products = result.success ? result.data : [];
    renderGrid(products);
}

async function loadSuppliers() {
    const result = await apiGet("get_suppliers.php");
    suppliers = result.success ? result.data : [];
    updateSupplierDropdowns();
    renderSuppliers();
}

async function checkSession() {
    const result = await apiGet("check_session.php");
    isAdminLoggedIn = !!result.loggedIn; // no matter what type result.loggedIn actually was !! force it into a clean, real true or false."
    updateAdminUI();
}

// Updates dropdowns dynamically with suppliers from the DB
function updateSupplierDropdowns() {
    const filterSelect = document.getElementById("shopfilter");
    const formSelect = document.getElementById("prodSupplier");

    if (filterSelect) {
        filterSelect.innerHTML = `<option value="">All Suppliers</option>`;
        suppliers.forEach(sup => {
            const opt = document.createElement("option");
            opt.value = sup.id;
            opt.textContent = sup.name;
            filterSelect.appendChild(opt);
        });
    }

    if (formSelect) {
        formSelect.innerHTML = `<option value="">Select a supplier</option>`;
        suppliers.forEach(sup => {
            const opt = document.createElement("option");
            opt.value = sup.id;
            opt.textContent = sup.name;
            formSelect.appendChild(opt);
        });
    }
}

// Displays the sdmin controls depending on login status
function updateAdminUI() {
    if (isAdminLoggedIn) {
        document.getElementById("navSuppliers").style.display = "inline";
        document.getElementById("navAddProduct").style.display = "inline";
        document.getElementById("navLogin").innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
    } else {
        document.getElementById("navSuppliers").style.display = "none";
        document.getElementById("navAddProduct").style.display = "none";
        document.getElementById("navLogin").innerHTML = `<i class="fa-regular fa-user"></i> Login`;
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
                <p class="itemshop">${item.supplier ?? "Unknown supplier"}</p>
                <h3 class="itemname">${item.name}</h3>
                <p class="itemprice">Rs. ${item.price}</p>
                <p class="itemstock ${isLow ? 'almostgone' : ''}">${isLow ? `Only ${item.stock} left!` : `In stock: ${item.stock}`}</p>
                <button class="peekbtn" type="button">View Product</button>
            </div>
        `;

        const viewButton = card.querySelector(".peekbtn");
        viewButton.addEventListener("click", () => openSingleProduct(item.id));

        grid.appendChild(card);
    });
}



// actually opens the view page and shows the detals of the product
function openSingleProduct (id) {
    const item = products.find(p => p.id === id);
    if (!item) return;

    currentViewingProduct = item;

    document.getElementById("bigphoto").src = item.image;
    document.getElementById("breadcrumb").innerText = `Home > ${item.supplier ?? ""} > ${item.name}`;
    document.getElementById("itemheading").innerText = item.name;
    document.getElementById("itembigprice").innerText = `Rs. ${item.price}`;
    document.getElementById("itemdesc").innerText = item.desc || "No detailed description available.";
    document.getElementById("singleSupplier").innerText = item.supplier ?? "Unknown";

    const warn = document.getElementById("stockwarning");
    if (item.stock < 5) {
        warn.style.display = "block";
        warn.innerText = `⚠ Only ${item.stock} left in stock`;
    } else {
        warn.style.display = "none";
    }

    showPage("singleitem");
};



//if a regular visitor clicks editproduct, they get my "Admin Access Required" popup
document.getElementById("fixbtn").addEventListener("click", () => {
    if (!isAdminLoggedIn) {
        document.getElementById("loginModal").style.display = "flex";
        return;
    }
    if (currentViewingProduct) {
        openEditProductForm(currentViewingProduct);
    }
});


//edit page opens and this decides what to show
function openEditProductForm(item) {
    editingProductId = item.id;
    document.getElementById("prodName").value = item.name;
    document.getElementById("prodDesc").value = item.desc || "";
    document.getElementById("prodPrice").value = item.price;
    document.getElementById("prodQty").value = item.stock;
    document.getElementById("prodSupplier").value = item.supplier_id ?? "";
    uploadedPhotoFile = null;
    document.getElementById("deletebtn").style.display = "inline-block";
    document.getElementById("formTitle").innerText = "Edit Product";
    showPage("addstuff");
}



//big manageproduct button
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

// Click on "cancel" or "Go to login page" popup controller
document.getElementById("modalCloseBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});

document.getElementById("modalLoginBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
    showPage("loginpage");
});



// if clicked logout removes admin previleges
document.getElementById("navLogin").addEventListener("click", async () => {
    if (isAdminLoggedIn) {
        await apiPostJSON("logout.php", {});
        isAdminLoggedIn = false;
        updateAdminUI();
        alert("Logged out successfully!");
        showPage("allproducts");
    } else {
        showPage("loginpage");
    }
});


// clicking on inventory
document.getElementById("navInventory").addEventListener("click", () => {
    renderGrid(products);
    showPage("allproducts");
});

// clicking on suppliers
document.getElementById("navSuppliers").addEventListener("click", () => {
    renderSuppliers();
    showPage("shoplist");
});

//Clicking add product
document.getElementById("navAddProduct").addEventListener("click", () => {
    clearProductForm();
    editingProductId = null;
    document.getElementById("formTitle").innerText = "Add Product";
    showPage("addstuff");
});


// Clicking back to products
document.getElementById("backBtn").addEventListener("click", () => showPage("allproducts"));


// Clicking "add supplier"
document.getElementById("addShopBtn").addEventListener("click", () => {
    clearSupplierForm();
    editingSupplierId = null;
    document.getElementById("supplierFormTitle").innerText = "Add Supplier";
    showPage("addshop");
});


document.getElementById("cancelbtn").addEventListener("click", () => showPage("allproducts"));
document.getElementById("cancelshopbtn").addEventListener("click", () => showPage("shoplist"));

// Admin Login Handler
document.getElementById("enterbtn").addEventListener("click", async function () {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();

    const result = await apiPostJSON("login.php", { username: user, password: pass });

    if (result.success) {
        isAdminLoggedIn = true;
        updateAdminUI();
        document.getElementById("wrongmsg").style.display = "none";
        alert("Login successful! Admin features are unlocked.");
        showPage("allproducts");
    } else {
        document.getElementById("wrongmsg").innerText = result.message || "Wrong username or password.";
        document.getElementById("wrongmsg").style.display = "block";
    }
});

// photo adding on "Add product"
document.getElementById("photoupload").addEventListener("change", function (e) {
    uploadedPhotoFile = e.target.files[0] || null;
});

// Save or Edit Product
document.getElementById("savebtn").addEventListener("click", async function () {
    const name = document.getElementById("prodName").value.trim();
    const desc = document.getElementById("prodDesc").value.trim();
    const price = document.getElementById("prodPrice").value;
    const qty = document.getElementById("prodQty").value;
    const supplierId = document.getElementById("prodSupplier").value;
    

    if (!name || !supplierId || price === "" || qty === "") {
        alert("Please fill out all required fields.");
        return;
    }

    if (parseFloat(price) < 0 || parseInt(qty) < 0) {
        alert("Price and Quantity cannot be negative numbers.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("desc", desc);
    formData.append("price", price);
    formData.append("stock", qty);
    formData.append("supplier_id", supplierId);
    if (uploadedPhotoFile) {
        formData.append("photo", uploadedPhotoFile);
    }

    //update or edit 
    let result;
    if (editingProductId) {
        formData.append("id", editingProductId);
        result = await apiPostForm("update_product.php", formData);
    } else {
        result = await apiPostForm("add_product.php", formData);
    }

    if (!result.success) {
        alert(result.message || "Something went wrong saving the product.");
        return;
    }

    await loadProducts();
    showPage("allproducts");
    clearProductForm();
});


//delete product button
document.getElementById("deletebtn").addEventListener("click", async function () {
    if (!editingProductId) {
        return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const result = await apiPostJSON("delete_product.php", { id: editingProductId });
    if (!result.success) {
        alert(result.message || "Could not delete product.");
        return;
    }

    await loadProducts();
    showPage("allproducts");
    clearProductForm();
});

function clearProductForm() {
    document.getElementById("prodName").value = "";
    document.getElementById("prodDesc").value = "";
    document.getElementById("prodPrice").value = "";
    document.getElementById("prodQty").value = "";
    document.getElementById("prodSupplier").value = "";
    document.getElementById("photoupload").value = "";
    document.getElementById("deletebtn").style.display = "none";
    uploadedPhotoFile = null;
    editingProductId = null;
}

// this builds my Supplier List table one row for each supplier
function renderSuppliers() {
    const tbody = document.getElementById("supplierTableBody");
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


//Edit supplier page opens
window.editSupplier = function (id) {
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;

    editingSupplierId = id;
    document.getElementById("supName").value = sup.name;
    document.getElementById("supEmail").value = sup.email;
    document.getElementById("supPhone").value = sup.phone;

    document.getElementById("supplierFormTitle").innerText = "Edit Supplier";
    showPage("addshop");
};


// delete supplier btn
window.deleteSupplier = async function (id) {
    if (!confirm("Are you sure you want to remove this supplier?")) return;

    const result = await apiPostJSON("delete_supplier.php", { id });
    if (!result.success) {
        alert(result.message || "Could not delete supplier.");
        return;
    }

    await loadSuppliers();
    await loadProducts(); // some products may now show "Unknown supplier"
};


// edit supplier
document.getElementById("saveshopbtn").addEventListener("click", async function () {
    const name = document.getElementById("supName").value.trim();
    const email = document.getElementById("supEmail").value.trim();
    const phone = document.getElementById("supPhone").value.trim();

    if (!name || !email || !phone) {
        alert("Please complete all supplier details.");
        return;
    }

    let result;
    if (editingSupplierId) {
        result = await apiPostJSON("update_supplier.php", { id: editingSupplierId, name, email, phone });
    } else {
        result = await apiPostJSON("add_supplier.php", { name, email, phone });
    }

    if (!result.success) {
        alert(result.message || "Something went wrong saving the supplier.");
        return;
    }

    await loadSuppliers();
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
    const selectedShopId = document.getElementById("shopfilter").value;
    const sort = document.getElementById("sortpick").value;

    let filtered = products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesShop = selectedShopId === "" || String(p.supplier_id) === String(selectedShopId);
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


//runs the moment my website is opened
(async function init() {
    await checkSession();
    await loadSuppliers();
    await loadProducts();
    showPage("allproducts");
})();