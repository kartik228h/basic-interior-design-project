const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.href = "../../index.html";
});