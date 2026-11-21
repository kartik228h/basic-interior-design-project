const furnitureId = new URLSearchParams(window.location.search).get("id");
const product = JSON.parse(sessionStorage.getItem("selectedFurniture") || "null");

const reviews = [
    { name: "Rahul Sharma", rating: 5, text: "Quality is good and delivery was on time." },
    { name: "Priya Mehta", rating: 5, text: "Looks premium and matches the room perfectly." },
    { name: "Arjun Singh", rating: 4, text: "Good material and comfortable to use." }
];

function showText(id, text) {
    document.getElementById(id).textContent = text;
}

if (!product || product.id !== furnitureId) {
    document.getElementById("details-page").innerHTML =
        '<h1>Furniture not found</h1><a href="../../furniture_list/index.html">Back to furniture</a>';
} else {
    const image = document.getElementById("details-image");
    if (product.image.startsWith("http")) {
        image.src = product.image;
    } else {
        image.src = "../../../../../asset/" + product.image.split("asset/")[1];
    }
    image.alt = product.name;
    showText("details-name", product.name);
    showText("details-category", product.category);
    showText("details-price", `₹${product.price.toLocaleString("en-IN")}`);
    showText("details-rating", `Rating: ★ ${product.rating}`);
    showText("details-material", `Material: ${product.material}`);
    showText("details-id", `Product ID: ${product.id}`);
    document.getElementById("details-reviews").innerHTML =
        "<h3>Customer Reviews</h3>" +
        reviews.map((review) => `<article class="review-card"><strong>${review.name}</strong><span class="review-rating">${"★".repeat(review.rating)}</span><p>${review.text}</p></article>`).join("");
    document.getElementById("add-to-cart").addEventListener("click", () => {
        window.purchaseAddToCart.addToCart(product);
        alert(`${product.name} added to cart`);
    });
    document.getElementById("purchase-now").addEventListener("click", () => {
        window.purchaseAddToCart.purchase(product);
        alert(`Purchase started for ${product.name}`);
    });
    document.title = `${product.name} | AI Decor`;
}
