let allBookings = [];

async function loadAdmin() {

const res = await fetch("/bookings");
allBookings = await res.json();

/* ================= CALENDAR ================= */

const calendar = new FullCalendar.Calendar(
document.getElementById("admin-calendar"),
{
initialView:"dayGridMonth",
height:"auto",

events: allBookings.map(b=>({
title:b.name,
start:b.date,
extendedProps:b,
color:
b.status==="approved"?"#198754":
b.status==="pending"?"#ffc107":
"#dc3545"
})),

/* 🔥 CLICK POPUP */
eventClick: function(info){

const b = info.event.extendedProps;

document.getElementById("popupName").textContent = b.name;
document.getElementById("popupDate").textContent = "Date: " + b.date;
document.getElementById("popupTime").textContent = "Time: " + formatTime(b.time);
document.getElementById("popupStatus").textContent = "Status: " + b.status;

document.getElementById("bookingPopup").classList.remove("hidden");
document.getElementById("popupOverlay").classList.remove("hidden");

/* BUTTONS */
document.getElementById("approveBtn").onclick = ()=>approve(b.id);
document.getElementById("rejectBtn").onclick = ()=>reject(b.id);

}

});

calendar.render();


/* ================= TABLE (APPROVED ONLY) ================= */

const tbody = document.querySelector("#bookingsTable tbody");
tbody.innerHTML = "";

const approved = allBookings.filter(b=>b.status==="approved");

approved.forEach(b=>{

let reference="—";

if(b.reference_image_url){
reference=`
<img src="${b.reference_image_url}" 
class="reference-img"
onclick="openModal('${b.reference_image_url}')">
`;
}

tbody.innerHTML+=`
<tr>
<td>${b.name}</td>
<td>${b.email}</td>
<td>${b.phone}</td>
<td>${b.date}</td>
<td>${formatTime(b.time)}</td>
<td class="status-approved">${b.status}</td>
<td>${reference}</td>
</tr>
`;

});

}


/* ================= POPUP ================= */

function closePopup(){
document.getElementById("bookingPopup").classList.add("hidden");
document.getElementById("popupOverlay").classList.add("hidden");
}


/* ================= APPROVE ================= */

async function approve(id){

await fetch(`/bookings/${id}`,{
method:"PATCH",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ status:"approved" })
});

location.reload();
}

/* ================= REJECT ================= */

async function reject(id){

await fetch(`/bookings/${id}`,{
method:"PATCH",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ status:"rejected" })
});

location.reload();
}


/* ================= FORMAT TIME ================= */

function formatTime(time){

const [hour, minute] = time.split(":");
const h = parseInt(hour);

const suffix = h >= 12 ? "PM" : "AM";
const hour12 = ((h + 11) % 12 + 1);

return `${hour12}:${minute} ${suffix}`;
}


document.addEventListener("DOMContentLoaded",loadAdmin);