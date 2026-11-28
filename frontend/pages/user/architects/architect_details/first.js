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
if (name && !profile.hidden) {
  workSection.hidden = false;

  const portfolios = {
    adarsh: {
      label: "Featured project",
      title: "Hell Design",
      description:
        "Adarsh's Hell Design project turns Dante's Inferno into a striking visual world. Fiery landscapes, towering structures, and a dramatic entrance create an immersive journey through the nine circles. Carefully considered details and lighting give each scene its own atmosphere, showcasing his creativity and dedication.",
      directory: "adarsh_work",
      projects: [
        {
          image: "hell_design.jpg",
          alt: "Illustration of the nine circles of Hell",
          title: "The Nine Circles",
        },
        {
          image: "hell_design_1.jpg",
          alt: "Fiery interior landscape in the Hell Design project",
          title: "Infernal Landscape",
        },
        {
          image: "hell_design_2.jpg",
          alt: "Dark, towering architecture in a red sky",
          title: "Hellscape Architecture",
        },
        {
          image: "hell_design_3.jpg",
          alt: "A dramatic descent into a fiery underworld",
          title: "The Descent",
        },
        {
          image: "hell_gate.webp",
          alt: "A glowing gate surrounded by a dark stone archway",
          title: "The Hell Gate",
        },
      ],
    },
    samit: {
      label: "Portfolio",
      title: "Room Design Projects",
      description:
        "samit is skilled in interior kotha room designer, creating distinctive interiors through thoughtful layouts, materials, lighting, and atmosphere. his work includes a variety of room types, from intimate private spaces to larger institutional projects, each reflecting his creativity and attention to detail. he is good in creating couple rooms and private rooms.",
      directory: "samit_work",
      projects: [
        {
          image: "bdsm_rooms.jpg",
          alt: "Dark private room with custom furniture, chains, and red accent lighting",
          title: "",
        },
        {
          image: "mallu_kotha.jpg",
          alt: "Red room interior with a bed and accent lighting",
          title: "",
        },
        {
          image: "shabnam_ka_kotha.jpg",
          alt: "Room interior with a bed and wall text",
          title: "",
        },
        {
          image: "amity_university.jpg",
          alt: "Amity University building",
          title: "Amity University",
        },
        {
          image: "galgotias_university.jpg",
          alt: "Galgotias University entrance",
          title: "Galgotias University",
        },
      ],
    },
  };

  const portfolio = portfolios[name.toLowerCase()];
  const portfolioLabel = document.querySelector("#work .section-label");
  const workTitle = document.getElementById("work-title");
  const workDescription = document.getElementById("work-description");
  const portfolioEmpty = document.getElementById("portfolio-empty");
  const workGallery = document.getElementById("work-gallery");

  if (portfolio) {
    portfolioLabel.textContent = portfolio.label;
    workTitle.textContent = portfolio.title;
    workDescription.textContent = portfolio.description;
    workDescription.hidden = false;
    workGallery.hidden = false;
    portfolioEmpty.hidden = true;

    for (const project of portfolio.projects) {
      const figure = document.createElement("figure");
      figure.className = "work-project";

      const projectImage = document.createElement("img");
      projectImage.src =
        `../../../../asset/IMAGES/architects_images/architect_work_experience/${portfolio.directory}/${project.image}`;
      projectImage.alt = project.alt;
      projectImage.loading = "lazy";

      const caption = document.createElement("figcaption");
      caption.textContent = project.title;

      figure.append(projectImage, caption);
      workGallery.appendChild(figure);
    }
  } else {
    portfolioLabel.textContent = "Portfolio";
    workTitle.textContent = "Projects coming soon";
    workDescription.hidden = true;
    workGallery.hidden = true;
    portfolioEmpty.hidden = false;
  }
}

const addReviewButton = document.getElementById("add-review-button");
const reviewForm = document.getElementById("review-form");
const reviewList = document.getElementById("review-list");
const emptyReviews = document.getElementById("empty-reviews");

addReviewButton.hidden = profile.hidden;
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
