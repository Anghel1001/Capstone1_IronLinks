document.addEventListener("DOMContentLoaded", initPage);

let allBookings = [];


/* ===============================
INIT
=============================== */

function initPage(){
loadUser();
loadGeneratedImage();
initCalendar();
}


/* ===============================
LOAD USER
=============================== */

function loadUser(){

const user =
JSON.parse(localStorage.getItem("user"));

if(!user) return;

document.getElementById("userName").value =
user.name;

document.getElementById("userEmail").value =
user.email;

}


/* ===============================
GENERATED IMAGE
=============================== */

function loadGeneratedImage(){

const generated =
localStorage.getItem("generatedDesign");

const estimatedCost =
localStorage.getItem("estimatedCost");

const preview =
document.getElementById("bookingPreview");

const costPreview =
document.getElementById("estimatedCostPreview");

if(generated){

preview.src = generated;
preview.style.display = "block";

}

if(estimatedCost){

costPreview.textContent = estimatedCost;

}

}   


function removeAI(){

localStorage.removeItem("generatedDesign");

document.getElementById("generatedPreview")
.innerHTML="";

}


/* ===============================
CALENDAR
=============================== */

async function initCalendar(){

const calendarEl =
document.getElementById("calendar");

if(!calendarEl) return;

try{

const res =
await fetch("/bookings");

allBookings =
await res.json();

}catch(err){

console.error("Fetch error", err);

}


const calendar =
new FullCalendar.Calendar(calendarEl, {

initialView: "dayGridMonth",

height:"auto",

events: allBookings.map(b => ({

title:
b.status === "approved"
? "Unavailable"
: "Pending",

start: b.date,

color:
b.status === "approved"
? "#dc3545"
: "#fd7e14"

})),

dateClick: function(info){

const selectedDate = info.dateStr;


// ======================
// BLOCK SUNDAY
// ======================

const day =
new Date(selectedDate).getDay();

if(day === 0){

alert("Closed on Sundays");

return;

}


// ======================
// HIGHLIGHT SELECTED
// ======================

document
.querySelectorAll(".fc-daygrid-day")
.forEach(day=>{
day.classList.remove("selected");
});

info.dayEl.classList.add("selected");

document
.getElementById("dateInput")
.value = selectedDate;


// ======================
// BLOCK BOOKED TIMES
// ======================

updateTimeSlots(selectedDate);

}

});

calendar.render();

}



/* ===============================
TIME SLOT BLOCKER
=============================== */

function updateTimeSlots(date){

const bookedTimes =
allBookings
.filter(b => b.date === date)
.map(b => b.time);


const select =
document.querySelector(
"select[name='time']"
);

[...select.options].forEach(option => {

if(!option.value) return;

if(bookedTimes.includes(option.value)){

option.disabled = true;
option.text =
option.value + " (Booked)";

}else{

option.disabled = false;
option.text =
formatTime(option.value);

}

});

}



/* ===============================
FORMAT TIME
=============================== */

function formatTime(time){

const [hour, minute] =
time.split(":");

const h =
parseInt(hour);

const suffix =
h >= 12 ? "PM" : "AM";

const hour12 =
((h + 11) % 12 + 1);

return `${hour12}:${minute} ${suffix}`;

}



/* ===============================
BASE64 TO FILE
=============================== */

function base64ToFile(base64, filename){

const arr = base64.split(",");

const mime =
arr[0].match(/:(.*?);/)[1];

const bstr =
atob(arr[1]);

let n = bstr.length;

const u8arr =
new Uint8Array(n);

while(n--){
u8arr[n] =
bstr.charCodeAt(n);
}

return new File(
[u8arr],
filename,
{ type: mime }
);

}



/* ===============================
SUBMIT BOOKING
=============================== */

document
.getElementById("bookingForm")
.addEventListener(
"submit",
async function(e){

e.preventDefault();

const user =
JSON.parse(localStorage.getItem("user"));

const file =
document
.getElementById("referenceImage")
.files[0];

const formData =
new FormData();

formData.append("name", user.name);
formData.append("email", user.email);
formData.append(
"phone",
bookingForm.phone.value
);

formData.append(
"date",
document
.getElementById("dateInput")
.value
);

formData.append(
"time",
bookingForm.time.value
);

formData.append(
"request",
bookingForm.request.value
);


/* ===============================
GENERATED IMAGE
=============================== */

const generated =
localStorage.getItem("generatedDesign");

if(generated){

const generatedFile =
base64ToFile(
generated,
"generated-design.png"
);

formData.append(
"reference_image",
generatedFile
);

}


/* ===============================
MANUAL IMAGE
=============================== */

if(file){
formData.append(
"reference_image",
file
);
}


await fetch("/book", {
method:"POST",
body:formData
});


alert("Booking submitted!");

localStorage.removeItem("generatedDesign");

location.reload();

});