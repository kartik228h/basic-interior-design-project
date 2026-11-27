const params = new URLSearchParams(window.location.search);
const name = params.get("name");
const experience = params.get("experience");
const rating = params.get("rating");
const architectLocation = params.get("location");
const specialization = params.get("specialization");
const image = params.get("image");

const profile = document.getElementById("architect-profile");
const errorMessage = document.getElementById("profile-error");

if (
  !name ||
  !experience ||
  !rating ||
  !architectLocation ||
  !specialization ||
  !image
) {
  errorMessage.hidden = false;
} else {
  document.getElementById("architect-name").textContent = name;

  const profileImage = document.getElementById("architect-image");
  profileImage.src = image;
  profileImage.alt = `${name}'s profile`;

  document.getElementById("architect-experience").textContent =
    `${experience} years`;
  document.getElementById("architect-rating").textContent = `${rating}/5`;
  document.getElementById("architect-location").textContent = architectLocation;
  document.getElementById("architect-specialization").textContent =
    specialization;

  document.title = `${name} | Architect Details`;
  profile.hidden = false;
}

const workSection = document.getElementById("work");

if (name && name.toLowerCase() === "adarsh") {
  workSection.hidden = false;

  const addReviewButton = document.getElementById("add-review-button");
  const reviewForm = document.getElementById("review-form");
  const reviewList = document.getElementById("review-list");
  const emptyReviews = document.getElementById("empty-reviews");

  addReviewButton.hidden = false;
  addReviewButton.addEventListener("click", () => {
    reviewForm.hidden = !reviewForm.hidden;
    addReviewButton.setAttribute("aria-expanded", String(!reviewForm.hidden));
  });

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const reviewerName = formData.get("reviewer").trim();
    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment").trim();

    const review = document.createElement("article");
    review.className = "review-item";

    const heading = document.createElement("div");
    heading.className = "review-heading";

    const reviewer = document.createElement("strong");
    reviewer.textContent = reviewerName;
    heading.appendChild(reviewer);

    const stars = document.createElement("span");
    stars.className = "review-stars";
    stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
    stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    heading.appendChild(stars);

    const reviewText = document.createElement("p");
    reviewText.textContent = comment;
    review.append(heading, reviewText);
    reviewList.prepend(review);

    emptyReviews.hidden = true;
    reviewForm.reset();
    reviewForm.hidden = true;
    addReviewButton.setAttribute("aria-expanded", "false");
  });
}
