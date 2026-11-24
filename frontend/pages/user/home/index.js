const API_URL = "http://localhost:5000/api/ai/design";
const catalogPageUrl = new URL("../furniture/furniture_list/index.html", window.location.href);
const fallbackProductImage = "../../../asset/IMAGES/home_image/DECORA_IMAGE_AI.png";

const roomInput = document.querySelector("#room-image");
const dropzone = document.querySelector("#dropzone");
const uploadTitle = document.querySelector("#upload-title");
const uploadSubtitle = document.querySelector("#upload-subtitle");
const generateButton = document.querySelector("#generate-button");
const roomPreview = document.querySelector("#room-preview");
const roomIllustration = document.querySelector("#room-illustration");
const aiResult = document.querySelector("#ai-result");
const previewStatus = document.querySelector("#preview-status");
const resetPreview = document.querySelector("#reset-preview");
const selectedStyle = document.querySelector("#selected-style");
const resultActions = document.querySelector("#result-actions");
const downloadResult = document.querySelector("#download-result");
const tryAnother = document.querySelector("#try-another");
const message = document.querySelector("#ai-message");
const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");
const furnitureGrid = document.querySelector("#home-furniture-grid");
const furnitureSearch = document.querySelector("#furniture-search");
const selectionSummary = document.querySelector("#selection-summary");
const selectedProductsContainer = document.querySelector("#selected-products");
const furnitureModal = document.querySelector("#furniture-modal");
const modalClose = document.querySelector("#modal-close");
const modalBackdrop = document.querySelector("#modal-backdrop");

let selectedStyleName = "Modern";
let uploadedImageUrl = "";
let uploadedRoomFile = null;
let homeSelectedCategory = "all";
const selectedProducts = new Map();
const defaultRoomImage = "../../../asset/IMAGES/home_image/DECORA_IMAGE_AI.png";

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("error", isError);
}

function resolveCatalogImage(image) {
    try {
        return new URL(image, catalogPageUrl).href;
    } catch {
        return fallbackProductImage;
    }
}

function showUploadedRoom(file) {
    if (!file) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
        uploadTitle.textContent = "Please choose an image";
        uploadSubtitle.textContent = "PNG, JPG or WEBP only";
        previewStatus.textContent = "Unsupported file";
        generateButton.disabled = true;
        return;
    }

    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    uploadedRoomFile = file;
    uploadedImageUrl = URL.createObjectURL(file);
    roomPreview.hidden = false;
    roomIllustration.hidden = true;
    aiResult.hidden = true;
    roomPreview.src = uploadedImageUrl;
    uploadTitle.textContent = file.name;
    uploadSubtitle.textContent = "Image ready for AI styling";
    previewStatus.textContent = "Room photo uploaded";
    generateButton.disabled = selectedProducts.size === 0;
    resetPreview.hidden = false;
    resultActions.hidden = true;
    showMessage("");
    openFurnitureModal();
}

function openFurnitureModal() {
    furnitureModal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeFurnitureModal() {
    furnitureModal.hidden = true;
    document.body.style.overflow = "";
}

function renderFurniture() {
    if (!furnitureGrid || typeof window.getFurnitureProducts !== "function") return;

    const searchTerm = furnitureSearch.value.trim().toLowerCase();
    const products = window.getFurnitureProducts().filter((product) => {
        const categoryMatches = homeSelectedCategory === "all" || product.category === homeSelectedCategory;
        return categoryMatches && product.name.toLowerCase().includes(searchTerm);
    });

    furnitureGrid.replaceChildren();
    products.forEach((product) => {
        const card = document.createElement("article");
        const isSelected = selectedProducts.has(product.id);
        card.className = `home-furniture-card${isSelected ? " selected" : ""}`;
        card.dataset.id = product.id;

        const image = document.createElement("img");
        image.src = resolveCatalogImage(product.image);
        image.alt = product.name;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.src = fallbackProductImage;
        }, { once: true });

        const details = document.createElement("div");
        details.className = "home-furniture-details";
        details.innerHTML = `
          <p>${product.category}</p>
          <h3>${product.name}</h3>
          <p class="card-price">₹${product.price.toLocaleString("en-IN")}</p>
          <p>${product.material} · ★ ${product.rating}</p>
        `;

        const button = document.createElement("button");
        button.className = "select-furniture";
        button.type = "button";
        button.textContent = isSelected ? "Deselect" : "Select";
        button.addEventListener("click", () => toggleProduct(product));
        details.appendChild(button);
        card.append(image, details);
        furnitureGrid.appendChild(card);
    });
}

function renderSelection() {
    const count = selectedProducts.size;
    selectionSummary.textContent = `${count} product${count === 1 ? "" : "s"} selected`;
    selectedProductsContainer.replaceChildren();
    selectedProducts.forEach((product) => {
        const chip = document.createElement("span");
        chip.className = "selected-product-chip";
        chip.textContent = product.name;
        selectedProductsContainer.appendChild(chip);
    });
    generateButton.disabled = !uploadedRoomFile || count === 0;
    renderFurniture();
}

function toggleProduct(product) {
    if (selectedProducts.has(product.id)) selectedProducts.delete(product.id);
    else selectedProducts.set(product.id, product);
    renderSelection();
}

async function fetchReferenceImage(product) {
    const url = resolveCatalogImage(product.image);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        return { blob, name: `${product.id}.${blob.type.split("/")[1] || "jpg"}` };
    } catch {
        return null;
    }
}

async function generateRoom() {
    if (!uploadedRoomFile || selectedProducts.size === 0) {
        showMessage("Upload a room image and select at least one product.", true);
        return;
    }

    generateButton.disabled = true;
    generateButton.querySelector("span").textContent = "Generating your room...";
    previewStatus.textContent = `Applying ${selectedStyleName.toLowerCase()} style`;
    showMessage("Sending your room and furniture references to the AI. This can take up to a minute...");

    try {
        const formData = new FormData();
        formData.append("roomImage", uploadedRoomFile);
        formData.append("style", selectedStyleName);
        const products = Array.from(selectedProducts.values()).map((product) => ({ ...product }));
        const referenceResults = await Promise.all(products.map(fetchReferenceImage));
        const missingReferences = [];

        referenceResults.forEach((reference, index) => {
            if (reference) {
                formData.append("furnitureImages", reference.blob, reference.name);
                products[index].referenceImageName = reference.name;
            } else {
                missingReferences.push(products[index].name);
            }
        });
        formData.append("furniture", JSON.stringify(products));

        let response;
        try {
            response = await fetch(API_URL, { method: "POST", body: formData });
        } catch {
            throw new Error("Cannot reach the backend at http://localhost:5000. Start the backend server, then try again.");
        }
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success || !result.generatedImage) {
            throw new Error(result.message || "The design could not be generated.");
        }

        roomPreview.src = result.generatedImage;
        roomPreview.hidden = false;
        aiResult.hidden = true;
        resultActions.hidden = false;
        downloadResult.href = result.generatedImage;
        previewStatus.textContent = `${selectedStyleName} design complete`;
        showMessage(missingReferences.length
            ? `Design generated. Reference images unavailable for: ${missingReferences.join(", ")}.`
            : "Your AI room design is ready.");
        generateButton.querySelector("span").textContent = "Generate another look";
    } catch (error) {
        previewStatus.textContent = "Generation failed";
        showMessage(error.message, true);
        generateButton.querySelector("span").textContent = "Generate my room";
    } finally {
        generateButton.disabled = false;
    }
}

function resetAll() {
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    uploadedImageUrl = "";
    uploadedRoomFile = null;
    selectedProducts.clear();
    roomInput.value = "";
    roomPreview.src = defaultRoomImage;
    roomPreview.hidden = false;
    roomIllustration.hidden = true;
    aiResult.hidden = true;
    resultActions.hidden = true;
    uploadTitle.textContent = "Upload a room photo";
    uploadSubtitle.textContent = "PNG, JPG or WEBP";
    previewStatus.textContent = "Ready to transform";
    generateButton.disabled = true;
    generateButton.querySelector("span").textContent = "Generate my room";
    showMessage("");
    renderSelection();
}

roomInput.addEventListener("change", (event) => showUploadedRoom(event.target.files[0]));
["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
}));
["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
}));
dropzone.addEventListener("drop", (event) => showUploadedRoom(event.dataTransfer.files[0]));

document.querySelectorAll(".style-chip").forEach((chip) => chip.addEventListener("click", () => {
    document.querySelector(".style-chip.active")?.classList.remove("active");
    chip.classList.add("active");
    selectedStyleName = chip.dataset.style;
    selectedStyle.textContent = selectedStyleName;
}));

document.querySelectorAll(".home-category-button").forEach((button) => button.addEventListener("click", () => {
    document.querySelector(".home-category-button.active")?.classList.remove("active");
    button.classList.add("active");
    homeSelectedCategory = button.dataset.category;
    renderFurniture();
}));

furnitureSearch.addEventListener("input", renderFurniture);
generateButton.addEventListener("click", generateRoom);
resetPreview.addEventListener("click", resetAll);
tryAnother.addEventListener("click", () => {
    resultActions.hidden = true;
    previewStatus.textContent = "Ready to transform";
    showMessage("");
});
modalClose.addEventListener("click", closeFurnitureModal);
modalBackdrop.addEventListener("click", closeFurnitureModal);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !furnitureModal.hidden) closeFurnitureModal();
});
menuButton.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

renderSelection();
