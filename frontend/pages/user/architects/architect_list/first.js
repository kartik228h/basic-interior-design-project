//array containing the data of the architects
const architects = [
    {name:"adarsh", experience:12, rating:4.5, location:"delhi", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/aadarsh%20verma.jpg"},
    {name:"lakshi", experience:8, rating:4.2, location:"mumbai", specialization:"commercial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_02.png"},
    {name:"samit", experience:15, rating:4.4, location:"bangalore", specialization:"industrial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/samit.jpg"},
    {name:"chavvi", experience:10, rating:4.8, location:"delhi", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_01.png"},
    {name:"priyanshi", experience:7, rating:4.1, location:"mumbai", specialization:"commercial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_05.png"},
    {name:"siddharth", experience:20, rating:4.0, location:"bangalore", specialization:"industrial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_06.png"},
    {name:"rohit", experience:5, rating:4.0, location:"delhi", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_07.png"},
    {name:"srishti", experience:12, rating:4.6, location:"mumbai", specialization:"commercial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_08.png"},
    {name:"sandhya", experience:9, rating:4.4, location:"bangalore", specialization:"industrial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_09.png"},
    {name:"harshit", experience:11, rating:4.5, location:"delhi", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_10.png"},
    {name:"sanyam", experience:14, rating:4.7, location:"pune", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/sanyam%20goel.jpg"},
    {name:"vikrami", experience:18, rating:4.7, location:"hyderabad", specialization:"commercial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_12.png"},
    {name:"neha", experience:6, rating:4.1, location:"delhi", specialization:"interior", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_13.png"},
    {name:"arya", experience:13, rating:4.5, location:"mumbai", specialization:"industrial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_14.png"},
    {name:"meera", experience:16, rating:4.7, location:"bangalore", specialization:"landscape", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_11.png"},
    {name:"riha", experience:9, rating:4.2, location:"pune", specialization:"commercial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_03.png"},
    {name:"isha", experience:11, rating:4.4, location:"hyderabad", specialization:"residential", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_17.png"},
    {name:"karan", experience:22, rating:4.0, location:"delhi", specialization:"industrial", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_18.png"},
    {name:"danav", experience:8, rating:4.3, location:"mumbai", specialization:"interior", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_19.png"},
    {name:"yash", experience:10, rating:4.0, location:"bangalore", specialization:"landscape", image:"../../../../asset/IMAGES/architects_images/architect_identity_images/architect_20.png"}
];

const architectCount = document.getElementById("architect-count");
architectCount.textContent = `${architects.length} architects`;

const architectList = document.getElementById("architect-list");
//function to display the architects in the architect list
function displayArchitects(architects){
architectList.replaceChildren();
for(let i=0; i<architects.length; i++){
    const architect = document.createElement("a");
    architect.className = "architect-card";
    const detailsUrl = new URL("../architect_details/index.html", window.location.href);
    detailsUrl.search = new URLSearchParams({
        name: architects[i].name,
        experience: architects[i].experience,
        rating: architects[i].rating,
        location: architects[i].location,
        specialization: architects[i].specialization,
        image: architects[i].image
    }).toString();
    architect.href = detailsUrl.toString();
    const architect_details = document.createElement("div");
    architect_details.className = "architect-details";
    //details of the architect
    const architect_name = document.createElement("h3");
    const architect_experience = document.createElement("p");
    const architect_rating = document.createElement("p");
    const architect_location = document.createElement("p");
    const architect_specialization = document.createElement("p");
    const img = document.createElement("img");
    img.src = architects[i].image;
    img.alt = architects[i].name;
    img.className = "architect-image";
    //adding the details to the architect card
    architect_name.textContent = architects[i].name;
    architect_experience.textContent = `${architects[i].experience} years experience`;
    architect_rating.textContent = `Rating ${architects[i].rating}/5`;
    architect_location.textContent = architects[i].location;
    architect_specialization.textContent = architects[i].specialization;
    //adding the details to the architect card
    architect.appendChild(img);
    architect_details.appendChild(architect_name);
    architect_details.appendChild(architect_experience);
    architect_details.appendChild(architect_rating);
    architect_details.appendChild(architect_location);
    architect_details.appendChild(architect_specialization);
    architect.appendChild(architect_details);
    architectList.appendChild(architect);
}}
displayArchitects(architects);

//help to sort architects based on experience or rating
const sortSelect = document.getElementById("sort-architects");
sortSelect.addEventListener("change",(event)=>{
    const selectedValue = event.target.value;
    // Implement sorting logic based on the selected value
    // For example, you can sort the architects array based on the selected value
    if(selectedValue === "experience"){
        architects.sort((a,b)=>b.experience-a.experience);
    }
    else if(selectedValue === "rating"){
        architects.sort((a,b)=>b.rating-a.rating);
    }
    displayArchitects(architects);
})