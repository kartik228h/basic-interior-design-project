const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.href = "/frontend/pages/home/index.html";
});