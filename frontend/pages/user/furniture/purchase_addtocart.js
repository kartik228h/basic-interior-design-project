window.purchaseAddToCart = {
    cart: JSON.parse(localStorage.getItem("furnitureCart") || "[]"),
    purchaseItem: JSON.parse(localStorage.getItem("purchaseFurniture") || "null"),

    addToCart(product) {
        const alreadyAdded = this.cart.some((item) => item.id === product.id);

        if (!alreadyAdded) {
            this.cart.push({ ...product, quantity: 1 });
            localStorage.setItem("furnitureCart", JSON.stringify(this.cart));
        }
    },

    purchase(product) {
        this.purchaseItem = { ...product, quantity: 1 };
        localStorage.setItem(
            "purchaseFurniture",
            JSON.stringify(this.purchaseItem)
        );
    }
};
