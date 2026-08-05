// Default Products Array
let defaultProducts = [
    { id: 1, name: "Berry Tote Bag", shop: "BerryCo", price: 799, stock: 3, image: "BerryTotebag.webp", desc: "A soft berry-toned tote bag with strong handles and a roomy interior." },
    { id: 2, name: "Sparky Notebook", shop: "BeeHive", price: 499, stock: 20, image: "SparkyNotebook.webp", desc: "Grid paper notebook for thoughts and design ideas." },
    { id: 3, name: "Turbo Wash 5000", shop: "SillyStuff", price: 56900, stock: 2, image: "TurboWash.avif", desc: "High performance washing machine unit." },
    { id: 4, name: "Bees Glass Necklace", shop: "BerryCo", price: 569, stock: 15, image: "BeesGlassNecklace.webp", desc: "Handcrafted crystal necklace." },
    { id: 5, name: "Mug", shop: "SillyStuff", price: 499, stock: 2, image: "BeesMug.jpeg", desc: "Ceramic coffee mug." },
    { id: 6, name: "RosyHair Clips", shop: "BerryCo", price: 640, stock: 50, image: "RosyHairClip.jpg", desc: "Cute hair accessory set." },
    { id: 7, name: "Cute Sticker Pack", shop: "BeeHive", price: 339, stock: 100, image: "StickerPack.webp", desc: "Vinyl aesthetic stickers." },
    { id: 8, name: "Fluffy Pen", shop: "SillyStuff", price: 99, stock: 4, image: "FluffySillyPen.jpg", desc: "Fun fluffy ballpoint pen." }
];

// Default Suppliers Array
let defaultSuppliers = [
    { id: 1, name: "BerryCo 🍒", email: "berry@berryco.com", phone: "+977-9812345678" },
    { id: 2, name: "BeeHive 🐝", email: "buzz@beehive.com", phone: "+977-9845678901" },
    { id: 3, name: "SillyStuff 🎪", email: "hehe@sillystuff.com", phone: "+977-9867891234" }
];

// Load saved data from localStorage or use defaults
let products = JSON.parse(localStorage.getItem("my_products")) || defaultProducts;
let suppliers = JSON.parse(localStorage.getItem("my_suppliers")) || defaultSuppliers;
let isAdminLoggedIn = localStorage.getItem("is_admin") === "true";

let uploadedImageBase64 = "";
let editingProductId = null;
let editingSupplierId = null;
let currentViewingProduct = null;

// Helper to save data back to localStorage
function saveAllData() {
    localStorage.setItem("my_products", JSON.stringify(products));
    localStorage.setItem("my_suppliers", JSON.stringify(suppliers));
    localStorage.setItem("is_admin", isAdminLoggedIn ? "true" : "false");
}

// Check and display Admin UI status on start
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

// Page Navigation Logic
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

// View Single Product Page
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

// Open Product Edit Form directly from View Page
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
    document.getElementById("prodSupplier").value = item.shop.replace(/ 🍒| 🐝| 🎪/g, "");
    uploadedImageBase64 = item.image;
    
    document.getElementById("formTitle").innerText = "Edit Product";
    showPage("addstuff");
}

// Manage Products Button on Hero Banner
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

// Modal Actions
document.getElementById("modalCloseBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});

document.getElementById("modalLoginBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
    showPage("loginpage");
});

// Top Navigation Links & Logout Toggle
document.getElementById("navLogin").addEventListener("click", () => {
    if (isAdminLoggedIn) {
        isAdminLoggedIn = false;
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

// Admin Login Handler
document.getElementById("enterbtn").addEventListener("click", function() {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();

    if (user === "admin" && pass === "admin123") {
        isAdminLoggedIn = true;
        saveAllData();
        updateAdminUI();
        document.getElementById("wrongmsg").style.display = "none";
        
        alert("Login successful! Admin features are unlocked.");
        showPage("allproducts");
    } else {
        document.getElementById("wrongmsg").style.display = "block";
    }
});

// Image Upload Handler
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

// Save / Update Product
document.getElementById("savebtn").addEventListener("click", function() {
    const name = document.getElementById("prodName").value.trim();
    const desc = document.getElementById("prodDesc").value.trim();
    const price = parseFloat(document.getElementById("prodPrice").value);
    const qty = parseInt(document.getElementById("prodQty").value);
    const shop = document.getElementById("prodSupplier").value;

    if (!name || !shop || isNaN(price) || isNaN(qty)) {
        alert("Please fill out all required fields.");
        return;
    }

    if (price < 0 || qty < 0) {
        alert("Price and Quantity cannot be negative numbers.");
        return;
    }

    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index].name = name;
            products[index].desc = desc;
            products[index].price = price;
            products[index].stock = qty;
            products[index].shop = shop;
            if (uploadedImageBase64) {
                products[index].image = uploadedImageBase64;
            }
        }
    } else {
        const newProduct = {
            id: Date.now(),
            name: name,
            desc: desc,
            price: price,
            stock: qty,
            shop: shop,
            image: uploadedImageBase64 || "BerryTotebag.webp"
        };
        products.unshift(newProduct);
    }

    saveAllData();
    renderGrid(products);
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
    uploadedImageBase64 = "";
    editingProductId = null;
}

// Supplier Table Operations
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

window.editSupplier = function(id) {
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;

    editingSupplierId = id;
    document.getElementById("supName").value = sup.name.replace(/ 🍒| 🐝| 🎪/g, "");
    document.getElementById("supEmail").value = sup.email;
    document.getElementById("supPhone").value = sup.phone;

    document.getElementById("supplierFormTitle").innerText = "Edit Supplier";
    showPage("addshop");
};

window.deleteSupplier = function(id) {
    if (confirm("Are you sure you want to remove this supplier?")) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveAllData();
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

    saveAllData();
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

// Search and Filter Logic
function filterProducts() {
    const query = document.getElementById("searchBox").value.toLowerCase();
    const selectedShop = document.getElementById("shopfilter").value;
    const sort = document.getElementById("sortpick").value;

    let filtered = products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesShop = selectedShop === "" || p.shop.includes(selectedShop);
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

// Initial Load Setup
updateAdminUI();
renderGrid(products);
renderSuppliers();
showPage("allproducts");