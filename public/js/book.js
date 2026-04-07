const supabaseUrl = "https://ntuikmoiajlqlzehqwkw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dWlrbW9pYWpscWx6ZWhxd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTQ2MjUsImV4cCI6MjA3OTAzMDYyNX0.Zxrk09S04mRqjbCih9MlZ43YPaw6VUV0obR9qzxQ2Fk";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);



/* ===============================
AUTH SYSTEM
================================ */

let isLogin = true;

function toggleAuth(){

isLogin=!isLogin;

document.getElementById("authTitle").textContent =
isLogin?"Login":"Register";

document
.getElementById("authName")
.classList.toggle("hidden");

}

document
.getElementById("authForm")
?.addEventListener("submit", function(e){

e.preventDefault();
handleAuth();

});


/* ===============================
USEr auth
================================ */

async function handleAuth(){

const name =
document.getElementById("authName").value.trim();

const email =
document.getElementById("authEmail").value.trim();

const password =
document.getElementById("authPassword").value.trim();

if(!email || !password){
alert("Please fill all fields");
return;
}



if(!isLogin){

const { data, error } =
await supabaseClient
.from("users")
.insert([{ name,email,password }])
.select()
.single();

if(error){
alert(error.message);
return;
}

localStorage.setItem(
"user",
JSON.stringify(data)
);

loadUser();
return;

}



const { data, error } =
await supabaseClient
.from("users")
.select("*")
.eq("email", email)
.eq("password", password)
.single();


if(error){
alert("Invalid login credentials");
return;
}

localStorage.setItem(
"user",
JSON.stringify(data)
);

loadUser();

}



/* ===============================
LOAD USER
================================ */

function loadUser(){

const user =
JSON.parse(localStorage.getItem("user"));

if(!user){

document
.getElementById("authSection")
.classList.remove("hidden");

document
.getElementById("dashboardSection")
.classList.add("hidden");

return;

}

document
.getElementById("authSection")
.classList.add("hidden");

document
.getElementById("dashboardSection")
.classList.remove("hidden");


document
.getElementById("userName")
.textContent = user.name;

document
.getElementById("userEmail")
.textContent = user.email;


loadPastConsultations(user.email);
initCalendar();

}



/* ===============================
EDIT PROFILE
================================ */

let editMode=false;

function toggleEdit(){

editMode=!editMode;

const phone =
document.getElementById("userPhone");

const location =
document.getElementById("userLocation");

const btn =
document.querySelector(".edit-btn");


if(editMode){

phone.innerHTML =
`<input type="text"
id="editPhone"
placeholder="Enter phone">`;

location.innerHTML =
`<input type="text"
id="editLocation"
placeholder="Enter location">`;

btn.textContent="Save";

}else{

const newPhone =
document.getElementById("editPhone").value;

const newLocation =
document.getElementById("editLocation").value;

phone.textContent =
newPhone || "Not set";

location.textContent =
newLocation || "Not set";

btn.textContent="Edit";

}

}



/* ===============================
PAST CONSULTATIONS
================================ */

async function loadPastConsultations(email){

const { data } =
await supabaseClient
.from("bookings")
.select("*")
.eq("email", email)
.order("date",{ascending:false});

const container =
document.getElementById("pastConsultations");

if(!data || data.length===0){
container.innerHTML="No consultations yet";
return;
}

container.innerHTML="";

data.forEach(b=>{

container.innerHTML += `
<div class="consult-item">

<strong>${b.date}</strong>
<br>

${b.time}

<br>

<span class="status ${b.status}">
${b.status}
</span>

</div>
`;

});

}



/* ===============================
CALENDAR
================================ */

async function initCalendar(){

const { data:bookings } =
await supabaseClient
.from("bookings")
.select("*");

const calendar =
new FullCalendar.Calendar(
document.getElementById("calendar"),
{

initialView:"dayGridMonth",

events: bookings.map(b=>({

title:b.status==="approved"
?"Booked"
:"Pending",

start:b.date,

color:
b.status==="approved"
?"#dc3545"
:"#fd7e14"

})),

dateClick:function(info){

document
.querySelectorAll(".fc-daygrid-day")
.forEach(d=>d.classList.remove("selected"));

info.dayEl.classList.add("selected");

openBooking();

}

});

calendar.render();

}

loadUser();