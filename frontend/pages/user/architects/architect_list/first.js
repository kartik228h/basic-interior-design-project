//array containing the data of the architects
const architects = [
    {name:"adarsh", experience:12, rating:4.5, location:"delhi", specialization:"residential", image:"../../../asset/architects/adarsh.jpg"},
    {name:"lakshay", experience:8, rating:4.2, location:"mumbai", specialization:"commercial", image:"../../../asset/architects/lakshay.jpg"},
    {name:"samit", experience:15, rating:4.4, location:"bangalore", specialization:"industrial", image:"../../../asset/architects/samit.jpg"},
    {name:"kartik", experience:10, rating:4.8, location:"delhi", specialization:"residential", image:"../../../asset/architects/kartik.jpg"},
    {name:"priyanshu", experience:7, rating:4.1, location:"mumbai", specialization:"commercial", image:"../../../asset/architects/priyanshu.jpg"},
    {name:"siddharth", experience:20, rating:4.0, location:"bangalore", specialization:"industrial", image:"../../../asset/architects/siddharth.jpg"},
    {name:"rohit", experience:5, rating:4.0, location:"delhi", specialization:"residential", image:"../../../asset/architects/rohit.jpg"},
    {name:"srishti", experience:12, rating:4.6, location:"mumbai", specialization:"commercial", image:"../../../asset/architects/srishti.jpg"},
    {name:"sandhya", experience:9, rating:4.4, location:"bangalore", specialization:"industrial", image:"../../../asset/architects/sandhya.jpg"},
    {name:"harshit", experience:11, rating:4.5, location:"delhi", specialization:"residential", image:"../../../asset/architects/harshit.jpg"},
    {name:"ananya", experience:14, rating:4.7, location:"pune", specialization:"residential", image:"../../../asset/architects/ananya.jpg"},
    {name:"vikram", experience:18, rating:4.7, location:"hyderabad", specialization:"commercial", image:"../../../asset/architects/vikram.jpg"},
    {name:"neha", experience:6, rating:4.1, location:"delhi", specialization:"interior", image:"../../../asset/architects/neha.jpg"},
    {name:"arjun", experience:13, rating:4.5, location:"mumbai", specialization:"industrial", image:"../../../asset/architects/arjun.jpg"},
    {name:"meera", experience:16, rating:4.7, location:"bangalore", specialization:"landscape", image:"../../../asset/architects/meera.jpg"},
    {name:"rahul", experience:9, rating:4.2, location:"pune", specialization:"commercial", image:"../../../asset/architects/rahul.jpg"},
    {name:"isha", experience:11, rating:4.4, location:"hyderabad", specialization:"residential", image:"../../../asset/architects/isha.jpg"},
    {name:"karan", experience:22, rating:4.0, location:"delhi", specialization:"industrial", image:"../../../asset/architects/karan.jpg"},
    {name:"tanvi", experience:8, rating:4.3, location:"mumbai", specialization:"interior", image:"../../../asset/architects/tanvi.jpg"},
    {name:"yash", experience:10, rating:4.0, location:"bangalore", specialization:"landscape", image:"../../../asset/architects/yash.jpg"}
];

const architectCount = document.getElementById("architect-count");
architectCount.textContent = `${architects.length} architects`;

const architectList = document.getElementById("architect-list");
//function to display the architects in the architect list
function displayArchitects(architects){
architectList.replaceChildren();
for(let i=0; i<architects.length; i++){
    const architect = document.createElement("article");
    architect.className = "architect-card";
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