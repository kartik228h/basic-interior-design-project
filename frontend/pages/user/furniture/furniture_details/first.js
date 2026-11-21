const furnitureId = new URLSearchParams(window.location.search).get("id");
const selectedFurniture = JSON.parse(
    sessionStorage.getItem("selectedFurniture") || "null"
);

const fakeReviews = [
    { name: "Rahul Sharma", text: "Quality is good and delivery was on time." },
    { name: "Priya Mehta", text: "Looks premium and matches the room perfectly." },
    { name: "Arjun Singh", text: "Good material and comfortable to use." }
];

function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

if (!selectedFurniture || selectedFurniture.id !== furnitureId) {
    const page = document.getElementById("details-page");
    if (page) {
        page.innerHTML =
            '<h1>Furniture not found</h1><a href="../../furniture_list/index.html">Back to furniture</a>';
    }
} else {
    const image = document.getElementById("details-image");

    if (image) {
        image.src = selectedFurniture.image.startsWith("../../../../asset/")
            ? selectedFurniture.image.replace("../../../../asset/", "../../../../../asset/")
            : selectedFurniture.image;
        image.alt = selectedFurniture.name;
    }

    setText("details-name", selectedFurniture.name);
    setText("details-category", selectedFurniture.category);
    setText("details-price", `₹${selectedFurniture.price.toLocaleString("en-IN")}`);
    setText("details-rating", `Rating: ★ ${selectedFurniture.rating}`);
    setText("details-material", `Material: ${selectedFurniture.material}`);
    setText("details-id", `Product ID: ${selectedFurniture.id}`);

    const reviewsContainer = document.getElementById("details-reviews");
    if (reviewsContainer) {
        reviewsContainer.innerHTML =
            "<h3>Customer Reviews</h3>" +
            fakeReviews.map((review) =>
                `<article class="review-card">
                    <strong>${review.name}</strong>
                    <p>${review.text}</p>
                </article>`
            ).join("");
    }

    document.title = `${selectedFurniture.name} | AI Decor`;
}
