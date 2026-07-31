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
let currentSortField = null;
let currentSortDirection = "asc";


// INIT 
async function loadAdmin(){

const res = await fetch("/bookings");
allBookings = await res.json();

// Sort by date then time
allBookings.sort((a, b) => {
    return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
});

// CALENDAR 
const calendar = new FullCalendar.Calendar(
document.getElementById("admin-calendar"),
{
initialView:"dayGridMonth",
height:"auto",

events: allBookings
    .filter(b => b.status === "approved" || b.status === "pending")
    .map(b => ({
        title: `${b.name}\n${formatTime(b.time)}`,
        start: b.date,
        extendedProps: b,
        color: b.status === "approved"
            ? "#198754"
            : "#f7CB73"
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
document.getElementById("rejectBtn").onclick = () => rejectBooking(b.id);

}
});

calendar.render();

renderTable();
}

// TABLE 
function renderTable(){

    const tbody = document.querySelector("#bookingsTable tbody");
    tbody.innerHTML = "";

    const status = document.getElementById("statusFilter").value;
    const keyword = document
        .getElementById("searchBooking")
        .value
        .toLowerCase();

    // Change table title
    document.getElementById("tableTitle").textContent =
        status === "all"
            ? "All Bookings"
            : status.charAt(0).toUpperCase() + status.slice(1) + " Bookings";

    // Copy bookings array
    let filtered = [...allBookings];

    // Filter by status
    if(status !== "all"){
        filtered = filtered.filter(b => b.status === status);
    }

    // Search by name
    if(keyword){
        filtered = filtered.filter(b =>
            b.name.toLowerCase().includes(keyword)
        );
    }

    // Apply sorting
if(currentSortField){

    filtered.sort((a,b)=>{

        let valueA = a[currentSortField];
        let valueB = b[currentSortField];

        if(currentSortField === "phone"){

            valueA = Number(valueA.replace(/\D/g,""));
            valueB = Number(valueB.replace(/\D/g,""));

        }else{

            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();

        }

        if(valueA < valueB)
            return currentSortDirection === "asc" ? -1 : 1;

        if(valueA > valueB)
            return currentSortDirection === "asc" ? 1 : -1;

        return 0;

    });

}else{

    // Default sorting
    filtered.sort((a,b)=>{
        return new Date(b.created_at) - new Date(a.created_at);
    });

}

    if(filtered.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="7">No data</td>
            </tr>
        `;
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

        tbody.innerHTML += `
        <tr>
            <td>${b.name}</td>
            <td>${b.email}</td>
            <td>${b.phone}</td>
            <td>${b.date}</td>
            <td>${formatTime(b.time)}</td>
            <td>
            <span class="status-badge ${b.status}">
             ${b.status}
            </span>
            </td>
            <td>${reference}</td>
        </tr>
        `;
    });

}
// POPUP 
function closePopup(){
document.getElementById("bookingPopup").classList.remove("show");
document.getElementById("popupOverlay").classList.remove("show");
}

document.getElementById("popupOverlay").onclick = closePopup;

// IMAGE MODAL 
function openModal(src){
document.getElementById("modalImg").src = src;
document.getElementById("modal").classList.add("show");
}

document.getElementById("modal").onclick = ()=>{
document.getElementById("modal").classList.remove("show");
};

// APPROVE 
async function approve(id){

await fetch(`/bookings/${id}`,{
method:"PATCH",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({status:"approved"})
});

const res = await fetch("/bookings");
allBookings = await res.json();

closePopup();
await loadAdmin();
}

// REJECT 
async function rejectBooking(id) {

    await fetch(`/bookings/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "rejected",
            reason: "Rejected by the administrator."
        })
    });

    closePopup();
    await loadAdmin();
}

// TIME FORMAT 
function formatTime(time){
    return time;
}

document.addEventListener("DOMContentLoaded",loadAdmin);

// SORT DROPDOWN

document.querySelectorAll(".filter-btn").forEach(button=>{

    button.addEventListener("click",function(e){

        e.stopPropagation();

        document.querySelectorAll(".filter-menu").forEach(menu=>{

            if(menu!==this.nextElementSibling)
                menu.classList.remove("show");

        });

        this.nextElementSibling.classList.toggle("show");

    });

});

document.addEventListener("click",()=>{

    document.querySelectorAll(".filter-menu").forEach(menu=>{

        menu.classList.remove("show");

    });

});

// SORT FUNCTION

function sortBookings(field, direction){

    if(field === null){

        currentSortField = null;
        currentSortDirection = "asc";

    }else{

        currentSortField = field;
        currentSortDirection = direction;

    }

    renderTable();

}