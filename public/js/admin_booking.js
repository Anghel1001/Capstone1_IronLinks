const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Please login first.");
    window.location.href = "book.html";
    throw new Error("Unauthorized");
}

if (user.email !== "ironlinksadmin@gmail.com") {
    alert("Access denied.");
    window.location.href = "index.html";
    throw new Error("Unauthorized");
}

let allBookings = [];
let currentTab = "approved";

/* INIT */
async function loadAdmin(){

const res = await fetch("/bookings");
allBookings = await res.json();

/* CALENDAR */
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

eventClick:function(info){

const b = info.event.extendedProps;

document.getElementById("popupName").textContent = b.name;
document.getElementById("popupDate").textContent = "Date: "+b.date;
document.getElementById("popupTime").textContent = "Time: "+formatTime(b.time);
document.getElementById("popupStatus").textContent = "Status: "+b.status;

document.getElementById("bookingPopup").classList.add("show");
document.getElementById("popupOverlay").classList.add("show");

document.getElementById("approveBtn").onclick = ()=>approve(b.id);
document.getElementById("rejectBtn").onclick = ()=>reject(b.id);

}
});

calendar.render();

renderTable();
}

/* TAB SWITCH */
function switchTab(status,e){

currentTab = status;

document.querySelectorAll(".tab-btn").forEach(btn=>{
btn.classList.remove("active");
});

if(e) e.target.classList.add("active");

document.getElementById("tableTitle").textContent =
status.charAt(0).toUpperCase()+status.slice(1)+" Bookings";

renderTable();
}

/* TABLE */
function renderTable(){

const tbody = document.querySelector("#bookingsTable tbody");
tbody.innerHTML="";

const filtered = allBookings.filter(b=>b.status===currentTab);

if(!filtered.length){
tbody.innerHTML=`<tr><td colspan="7">No data</td></tr>`;
return;
}

filtered.forEach(b=>{

let reference = "—";

if(b.reference_image_url){
reference = `
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
<td>${b.status}</td>
<td>${reference}</td>
</tr>
`;

});
}

/* POPUP */
function closePopup(){
document.getElementById("bookingPopup").classList.remove("show");
document.getElementById("popupOverlay").classList.remove("show");
}

document.getElementById("popupOverlay").onclick = closePopup;

/* IMAGE MODAL */
function openModal(src){
document.getElementById("modalImg").src = src;
document.getElementById("modal").classList.add("show");
}

document.getElementById("modal").onclick = ()=>{
document.getElementById("modal").classList.remove("show");
};

/* APPROVE */
async function approve(id){

await fetch(`/bookings/${id}`,{
method:"PATCH",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({status:"approved"})
});

allBookings = allBookings.map(b=>{
if(b.id===id) b.status="approved";
return b;
});

closePopup();
renderTable();
}

/* REJECT */
async function reject(id){

    const reason =
    prompt("Enter rejection reason:");
    
    if(!reason) return;
    
    await fetch(`/bookings/${id}`,{
    method:"PATCH",
    headers:{
    "Content-Type":"application/json"
    },
    body:JSON.stringify({
    status:"rejected",
    reason
    })
    });

allBookings = allBookings.map(b=>{
if(b.id===id) b.status="rejected";
return b;
});

closePopup();
renderTable();
}

/* TIME FORMAT */
function formatTime(time){
const [h,m]=time.split(":");
const hour=parseInt(h);
const suffix=hour>=12?"PM":"AM";
const h12=((hour+11)%12+1);
return `${h12}:${m} ${suffix}`;
}

document.addEventListener("DOMContentLoaded",loadAdmin);