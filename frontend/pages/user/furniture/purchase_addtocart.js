window.purchaseAddToCart = {
    cart: JSON.parse(localStorage.getItem("furnitureCart") || "[]"),
    purchaseItem: JSON.parse(localStorage.getItem("purchaseFurniture") || "null"),

    addToCart(product) {
        const alreadyAdded = this.cart.some((item) => item.id === product.id);

        if (!alreadyAdded) {
            this.cart.push({ ...product, quantity: 1 });
            localStorage.setItem("furnitureCart", JSON.stringify(this.cart));
        }
        this.openCart();
    },

    purchase(product) {
        this.purchaseItem = { ...product, quantity: 1 };
        localStorage.setItem(
            "purchaseFurniture",
            JSON.stringify(this.purchaseItem)
        );
        this.openCart();
    },

    openCart() {
        const furnitureIndex = window.location.href.indexOf("/furniture/");
        const cartUrl = furnitureIndex >= 0
            ? window.location.href.substring(0, furnitureIndex) + "/purchase_addToCart/index.html"
            : "../../../purchase_addToCart/index.html";
        window.location.href = cartUrl;
    }
};
