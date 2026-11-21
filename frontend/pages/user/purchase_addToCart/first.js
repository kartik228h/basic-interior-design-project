let cart = JSON.parse(localStorage.getItem("furnitureCart") || "[]");
const purchaseItem = JSON.parse(localStorage.getItem("purchaseFurniture") || "null");

if (purchaseItem && !cart.some((item) => item.id === purchaseItem.id)) {
    cart.unshift({ ...purchaseItem, quantity: 1 });
    localStorage.setItem("furnitureCart", JSON.stringify(cart));
}
if (purchaseItem) {
    localStorage.removeItem("purchaseFurniture");
}

function formatPrice(price) {
    return `₹${Number(price).toLocaleString("en-IN")}`;
}

function getImageUrl(image) {
    if (/^https?:\/\//i.test(image)) {
        return image;
    }

    if (image && image.includes("asset/")) {
        return "../../../asset/" + image.split("asset/")[1];
    }

    return image;
}

function saveCart() {
    localStorage.setItem("furnitureCart", JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const subtotal = document.getElementById("subtotal");
    const total = document.getElementById("total");
    const checkoutButton = document.getElementById("checkout-button");

    cartItems.replaceChildren();

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<div class="empty-cart"><h3>Your cart is empty</h3><p>Add a furniture item to continue.</p><a href="../furniture/furniture_list/index.html">Browse furniture</a></div>';
        cartCount.textContent = "0 items";
        subtotal.textContent = "₹0";
        total.textContent = "₹0";
        checkoutButton.disabled = true;
        return;
    }

    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

    cart.forEach((item) => {
        const card = document.createElement("article");
        card.className = "cart-item";

        const image = document.createElement("img");
        image.className = "cart-item-image";
        image.src = getImageUrl(item.image);
        image.alt = item.name;

        const details = document.createElement("div");
        details.innerHTML =
            `<p class="cart-item-category">${item.category}</p>` +
            `<h3 class="cart-item-name">${item.name}</h3>` +
            `<p class="cart-item-price">${formatPrice(item.price * item.quantity)}</p>`;

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";

        const quantity = document.createElement("div");
        quantity.className = "quantity-control";

        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.className = "quantity-button";
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", `Decrease quantity of ${item.name}`);
        decrease.addEventListener("click", () => {
            const cartItem = cart.find((cartProduct) => cartProduct.id === item.id);
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                saveCart();
            }
        });

        const quantityText = document.createElement("span");
        quantityText.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.type = "button";
        increase.className = "quantity-button";
        increase.textContent = "+";
        increase.setAttribute("aria-label", `Increase quantity of ${item.name}`);
        increase.addEventListener("click", () => {
            const cartItem = cart.find((cartProduct) => cartProduct.id === item.id);
            cartItem.quantity += 1;
            saveCart();
        });

        quantity.append(decrease, quantityText, increase);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-button";
        remove.dataset.action = "remove";
        remove.dataset.id = item.id;
        remove.textContent = "Remove";

        actions.append(quantity, remove);
        card.append(image, details, actions);
        cartItems.appendChild(card);
    });

    subtotal.textContent = formatPrice(cartTotal);
    total.textContent = formatPrice(cartTotal);
    checkoutButton.disabled = false;
}

document.getElementById("checkout-button").addEventListener("click", () => {
    alert("Checkout is ready for the selected furniture items.");
});

document.getElementById("cart-items").addEventListener("click", (event) => {
    const removeButton = event.target.closest('[data-action="remove"]');

    if (!removeButton) {
        return;
    }

    cart = cart.filter((item) => item.id !== removeButton.dataset.id);
    saveCart();
});

renderCart();