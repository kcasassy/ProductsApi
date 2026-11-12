
const token = localStorage.getItem("token");

const productList = document.getElementById("productList");
const productMessage = document.getElementById("productMessage");
const adminSection = document.getElementById("adminSection");
const productForm = document.getElementById("productForm");
const logoutBtn = document.getElementById("logoutBtn");

const API_URL = "/api/Products";

let currentPage = 1;
const pageSize = 10;

function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(base64);
        const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

if (!token) {
    logout();
}

const userInfo = decodeToken(token);

if (!userInfo || !userInfo.exp || userInfo.exp * 1000 <= Date.now()) {
    logout();
}

const username = userInfo["unique_name"] || userInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
const role = userInfo["role"] || userInfo["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

if (!username || !role) {
    logout();
}

const isAdmin = role === "Admin";

const welcomeSection = document.querySelector(".welcome-section");
const welcomeText = document.createElement("p");

welcomeText.textContent = `Welcome, ${username} | Role: ${role}`;
welcomeSection.appendChild(welcomeText);

if (isAdmin) {
    adminSection.hidden = false;
}

async function apiRequest(url, options = {}) {
    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
        throw new Error("You are not authorized to perform this action.");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Something went wrong.");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function formatPrice(price) {
    return Number(price).toFixed(2);
}

function displayProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.textContent = "No products available.";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = `Price: ₱${formatPrice(product.price)}`;

        card.appendChild(name);
        card.appendChild(price);

        if (product.salePrice !== null && product.salePrice !== undefined) {
            const salePrice = document.createElement("p");
            salePrice.textContent = `Sale Price: ₱${formatPrice(product.salePrice)}`;
            card.appendChild(salePrice);
        }

        if (isAdmin) {
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editProduct(product));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteProduct(product.id));

            card.appendChild(editButton);
            card.appendChild(deleteButton);
        }

        productList.appendChild(card);
    });
}

async function loadProducts() {
    try {
        productMessage.textContent = "Loading products...";

        const result = await apiRequest(
            `${API_URL}?page=${currentPage}&pageSize=${pageSize}`
        );

        displayProducts(result.data);

        productMessage.textContent =
            `Page ${result.meta.page} of ${result.meta.totalPages} | Total products: ${result.meta.totalCount}`;

    } catch (error) {
        productMessage.textContent = error.message;
    }
}

productForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isAdmin) {
        productMessage.textContent = "Only Admin can add products.";
        return;
    }

    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const salePriceInput = document.getElementById("salePrice").value;

    if (!name || !Number.isFinite(price) || price < 0) {
        productMessage.textContent = "Please enter valid product information.";
        return;
    }

    const salePrice = salePriceInput === ""
        ? null
        : Number(salePriceInput);

    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
        productMessage.textContent = "Please enter a valid sale price.";
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({
                name,
                price,
                salePrice
            })
        });

        productForm.reset();
        productMessage.textContent = "Product added successfully.";

        await loadProducts();
    } catch (error) {
        productMessage.textContent = error.message;
    }
});

async function editProduct(product) {
    if (!isAdmin) {
        return;
    }

    const name = prompt("Enter new product name:", product.name);

    if (name === null) {
        return;
    }

    if (!name.trim()) {
        productMessage.textContent = "Product name cannot be empty.";
        return;
    }

    const priceInput = prompt("Enter new price:", product.price);

    if (priceInput === null) {
        return;
    }

    const price = Number(priceInput);

    if (priceInput.trim() === "" || !Number.isFinite(price) || price < 0) {
        productMessage.textContent = "Please enter a valid price.";
        return;
    }

    const salePriceInput = prompt(
        "Enter new sale price (leave blank for none):",
        product.salePrice ?? ""
    );

    if (salePriceInput === null) {
        return;
    }

    const salePrice = salePriceInput.trim() === ""
        ? null
        : Number(salePriceInput);

    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
        productMessage.textContent = "Please enter a valid sale price.";
        return;
    }

    try {
        await apiRequest(`${API_URL}/${product.id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: name.trim(),
                price,
                salePrice
            })
        });

        productMessage.textContent = "Product updated successfully.";

        await loadProducts();
    } catch (error) {
        productMessage.textContent = error.message;
    }
}

async function deleteProduct(id) {
    if (!isAdmin) {
        return;
    }

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        productMessage.textContent = "Product deleted successfully.";

        await loadProducts();
    } catch (error) {
        productMessage.textContent = error.message;
    }
}

logoutBtn.addEventListener("click", logout);

loadProducts();
