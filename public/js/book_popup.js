const supabaseUrl = "https://ntuikmoiajlqlzehqwkw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dWlrbW9pYWpscWx6ZWhxd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTQ2MjUsImV4cCI6MjA3OTAzMDYyNX0.Zxrk09S04mRqjbCih9MlZ43YPaw6VUV0obR9qzxQ2Fk";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", initPage);

let allBookings = [];

/* ===============================
   INIT
=============================== */
async function initPage(){
    loadUser();
    loadGeneratedImage();
    await loadBookings();
    initCalendar();
}

/* ===============================
   LOAD USER
=============================== */
function loadUser(){
    const user = JSON.parse(localStorage.getItem("user"));

    if(!user){
        alert("Login required");
        window.location.href = "book.html";
        return;
    }

    document.getElementById("userName").textContent = user.name || "-";
    document.getElementById("userEmail").textContent = user.email || "-";
    document.getElementById("userPhone").value = user.phone || "";
    document.getElementById("userLocation").value = user.location || "";
}

/* ===============================
   LOAD BOOKINGS
=============================== */
async function loadBookings(){
    const { data, error } = await supabaseClient
        .from("bookings")
        .select("*");

    if(error){
        console.error(error);
        return;
    }

    allBookings = data || [];
}

/* ===============================
   PREVIEW
=============================== */
function loadGeneratedImage(){
    const generated = localStorage.getItem("generatedDesign");
    const cost = localStorage.getItem("estimatedCost");

    if(generated){
        const preview = document.getElementById("bookingPreview");
        preview.src = generated;
        preview.style.display = "block";
    }

    document.getElementById("estimatedCostPreview").textContent = cost || "₱ 0";
}

/* ===============================
   CALENDAR (FIXED)
=============================== */
function initCalendar(){
    
    const dateMap = {};
    const user = JSON.parse(localStorage.getItem("user"));

    allBookings.forEach(b => {

        const dbDate = b.date;

        if(!dateMap[dbDate]){
            dateMap[dbDate] = { approved:false, pending:false };
        }

        // 🔴 approved always visible
        if(b.status === "approved"){
            dateMap[dbDate].approved = true;
        }

        // 🟠 only YOUR pending
        else if(
            b.status === "pending" &&
            b.email === user.email
        ){
            dateMap[dbDate].pending = true;
        }
    });

    // 🔥 FIXED EVENTS (no default green)
    const events = Object.keys(dateMap)
    .map(date => {

        let color = null;

        if(dateMap[date].approved) color = "#dc3545";
        else if(dateMap[date].pending) color = "#fd7e14";

        if(!color) return null;

        return { start: date, title: "●", color };
    })
    .filter(e => e !== null);

    const calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"),
        {
            initialView:"dayGridMonth",
            height:"auto",
            events: events,

            validRange:{
                start: new Date().toISOString().split('T')[0]
            },

            dateClick(info){

                const today = new Date();
                today.setHours(0,0,0,0);

                const clicked = new Date(info.dateStr);
                
                // 🔒 CLOSED SUNDAYS
                if(clicked.getDay() === 0){
                     alert("Closed on Sundays");
                    return;
                }

                if(clicked < today){
                    alert("Cannot select past date");
                    return;
                }

                document.querySelectorAll(".fc-daygrid-day")
                    .forEach(d => d.classList.remove("selected"));

                info.dayEl.classList.add("selected");

                openTimeModal(info.dateStr);
            }
        }
    );

    
    calendar.render();
}

/* ===============================
   TIME MODAL
=============================== */
function openTimeModal(date){

    const user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("timeModal").classList.remove("hidden");
    document.getElementById("selectedDateDisplay").textContent = "Date: " + date;

    const container = document.getElementById("timeSlots");
    container.innerHTML = "";

    const times = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    times.forEach(time => {

        const slotTime = new Date(date + "T" + time);

        const bookings = allBookings.filter(b =>
            b.date === date && b.time === time
        );

        const approvedBooking = bookings.find(b => b.status === "approved");

        const userPending = bookings.find(b =>
            b.status === "pending" && b.email === user.email
        );

        const div = document.createElement("div");
        div.classList.add("time-slot");

        // 🔴 approved
        if(approvedBooking){
            div.classList.add("slot-unavailable");
            div.textContent = formatTime(time) + " (Unavailable)";
            div.style.pointerEvents = "none";
        }

        // 🟠 your pending
        else if(userPending){
            div.classList.add("slot-pending");
            div.textContent = formatTime(time) + " (Your Pending)";
            div.style.pointerEvents = "none";
        }

        // ⛔ past
        else if(date === todayStr && slotTime < now){
            div.classList.add("slot-unavailable");
            div.textContent = formatTime(time) + " (Passed)";
            div.style.pointerEvents = "none";
        }

        // 🟢 available
        else{
            div.classList.add("slot-available");
            div.textContent = formatTime(time);

            div.onclick = () => {

    // ✅ set values (for backend)
    document.querySelector("select[name='time']").value = time;
    document.getElementById("dateInput").value = date;

    // 🔥 UPDATE UI DISPLAY (THIS IS WHAT YOU WERE MISSING)
    const dateDisplay = document.getElementById("appointmentDateDisplay");
    const timeDisplay = document.getElementById("appointmentTimeDisplay");

    if(dateDisplay && timeDisplay){
        dateDisplay.textContent = date;
        timeDisplay.textContent = formatTime(time);

        // optional highlight (looks nice)
        dateDisplay.style.color = "var(--success)";
        timeDisplay.style.color = "var(--success)";
    }

    closeTimeModal();
};
        }

        container.appendChild(div);
    });
}

/* CLOSE MODAL */
function closeTimeModal(){
    document.getElementById("timeModal").classList.add("hidden");
}

/* FORMAT TIME */
function formatTime(time){
    const [h,m] = time.split(":");
    const hour = parseInt(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12 + 1);
    return `${hour12}:${m} ${suffix}`;
}

/* SUBMIT*/
document.getElementById("bookingForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    const formData = new FormData();

    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append(
        "phone",
        document.getElementById("userPhone").value.trim());
    formData.append(
        "location",
        document.getElementById("userLocation").value.trim());
    formData.append("date", document.getElementById("dateInput").value);
    formData.append("time", e.target.time.value);
    formData.append("request", e.target.request.value);

    // Optional uploaded reference image
    const refFile =
        document.querySelector("input[name='ref_image']").files[0];

    if(refFile){
        formData.append("reference_image", refFile);
    }

// AI Generated Image
const generatedImage = localStorage.getItem("generatedDesign");

if (generatedImage) {

    const imageResponse = await fetch(generatedImage);

    const blob = await imageResponse.blob();

    formData.append(
        "reference_image",
        blob,
        "generated-design.png"
    );

}
console.log("====== FORM DATA ======");

for (const [key, value] of formData.entries()) {
    console.log(key, value);
}

const response = await fetch("/book", {
    method: "POST",
    body: formData
});

    if (!response.ok) {
    alert(await response.text());
    return;
}

// Clear local storage
localStorage.removeItem("generatedDesign");
localStorage.removeItem("estimatedCost");

// Change button
const btn = document.getElementById("confirmBookingBtn");

btn.innerHTML = "✓ BOOKING SUBMITTED";
btn.disabled = true;
btn.style.background = "#28a745";
btn.style.cursor = "not-allowed";

// Disable all form inputs
document.querySelectorAll("#bookingForm input, #bookingForm textarea, #bookingForm select")
    .forEach(el => el.disabled = true);

// Optional message below button
const msg = document.createElement("p");
msg.innerHTML =
    "<strong style='color:#28a745;'>Your consultation request has been submitted successfully.</strong><br>It is now pending approval.";
msg.style.textAlign = "center";
msg.style.marginTop = "15px";

btn.parentNode.insertBefore(msg, btn.nextSibling);

});