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
const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");

let selectedStyleName = "Modern";
let uploadedImageUrl = "";
const defaultRoomImage = "../../../asset/IMAGES/home_image/DECORA_IMAGE_AI.png";

function showUploadedRoom(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        uploadTitle.textContent = "Please choose an image";
        uploadSubtitle.textContent = "PNG, JPG or WEBP only";
        previewStatus.textContent = "Unsupported file";
        generateButton.disabled = true;
        return;
    }

    if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
    }

    uploadedImageUrl = URL.createObjectURL(file);
    roomPreview.hidden = false;
    roomIllustration.hidden = true;
    aiResult.hidden = true;
    roomPreview.src = uploadedImageUrl;
    uploadTitle.textContent = file.name;
    uploadSubtitle.textContent = "Image ready for AI styling";
    previewStatus.textContent = "Room photo uploaded";
    generateButton.disabled = false;
    resetPreview.hidden = false;

    roomPreview.onload = () => {
        roomPreview.hidden = false;
        roomIllustration.hidden = true;
        aiResult.hidden = true;
        uploadTitle.textContent = file.name;
        uploadSubtitle.textContent = "Image ready for AI styling";
        previewStatus.textContent = "Room photo uploaded";
        generateButton.disabled = false;
        resetPreview.hidden = false;
    };
    roomPreview.onerror = () => {
        previewStatus.textContent = "Could not preview this image";
        generateButton.disabled = true;
    };
    roomPreview.src = uploadedImageUrl;
}

roomInput.addEventListener("change", (event) => {
    showUploadedRoom(event.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.add("dragging");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragging");
    });
});

dropzone.addEventListener("drop", (event) => {
    showUploadedRoom(event.dataTransfer.files[0]);
});

document.querySelectorAll(".style-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        document.querySelector(".style-chip.active")?.classList.remove("active");
        chip.classList.add("active");
        selectedStyleName = chip.dataset.style;
        selectedStyle.textContent = selectedStyleName;
    });
});

generateButton.addEventListener("click", () => {
    generateButton.disabled = true;
    generateButton.querySelector("span").textContent = "Generating your room...";
    previewStatus.textContent = `Applying ${selectedStyleName.toLowerCase()} style`;

    window.setTimeout(() => {
        aiResult.hidden = false;
        generateButton.disabled = false;
        generateButton.querySelector("span").textContent = "Generate another look";
        previewStatus.textContent = `${selectedStyleName} design complete`;
    }, 900);
});

resetPreview.addEventListener("click", () => {
    if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
        uploadedImageUrl = "";
    }
    roomInput.value = "";
    roomPreview.src = defaultRoomImage;
    roomPreview.hidden = false;
    roomIllustration.hidden = true;
    aiResult.hidden = true;
    uploadTitle.textContent = "Upload a room photo";
    uploadSubtitle.textContent = "PNG, JPG or WEBP";
    previewStatus.textContent = "Ready to transform";
    generateButton.disabled = true;
    generateButton.querySelector("span").textContent = "Generate my room";
    resetPreview.hidden = true;
});

menuButton.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});