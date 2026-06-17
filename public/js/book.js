const supabaseUrl = "https://ntuikmoiajlqlzehqwkw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dWlrbW9pYWpscWx6ZWhxd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTQ2MjUsImV4cCI6MjA3OTAzMDYyNX0.Zxrk09S04mRqjbCih9MlZ43YPaw6VUV0obR9qzxQ2Fk";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

let isLogin = true;
let editMode = false; // Fixed: Declared editMode variable 

/* ===============================
   AUTH SYSTEM TOGGLE
   ================================ */
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById("authTitle").textContent = isLogin ? "Login" : "Register";
    document.getElementById("authBtn").textContent = isLogin ? "Login" : "Register";
    document.getElementById("toggleLink").textContent = isLogin ? "Create account" : "Already have an account? Login";

    document.getElementById("authName").classList.toggle("hidden", isLogin);
    document.getElementById("authPhone").classList.toggle("hidden", isLogin);
}

document.getElementById("authForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    handleAuth();
});

async function handleAuth() {
    const name = document.getElementById("authName").value.trim();
    const phone = document.getElementById("authPhone").value.trim();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value.trim();

    if (!email || !password) {
        alert("Please fill in email and password");
        return;
    }

    if (!isLogin) {
        const { data, error } = await supabaseClient
            .from("users")
            .insert([{ name, email, password, phone }])
            .select()
            .single();

        if (error) {
            alert(error.message);
            return;
        }
        localStorage.setItem("user", JSON.stringify(data));
        loadUser();
    } else {
        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .eq("email", email)
            .eq("password", password)
            .single();

        if (error || !data) {
            alert("Invalid login credentials");
            return;
        }
        
        localStorage.setItem("user", JSON.stringify(data));
        
        if (data.email === "ironlinksadmin@gmail.com") {
            window.location.href = "admin_booking.html";
        } else {
            loadUser();
        }
    }
}

function loadUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        document.getElementById("authSection").classList.remove("hidden");
        document.getElementById("dashboardSection").classList.add("hidden");
        return;
    }

    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.remove("hidden");

    document.getElementById("userName").textContent = user.name || "N/A";
    document.getElementById("userEmail").textContent = user.email || "N/A";
    document.getElementById("userPhone").textContent = user.phone || "Not set";
    document.getElementById("userLocation").textContent = user.location || "Not set";

    loadPastConsultations(user.email);
    initCalendar();
}

async function toggleEdit() {
    editMode = !editMode;
    const phoneEl = document.getElementById("userPhone");
    const locationEl = document.getElementById("userLocation");
    const btn = document.querySelector(".edit-btn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (editMode) {
        phoneEl.innerHTML = `<input type="text" id="editPhone" value="${phoneEl.textContent === 'Not set' ? '' : phoneEl.textContent}">`;
        locationEl.innerHTML = `<input type="text" id="editLocation" value="${locationEl.textContent === 'Not set' ? '' : locationEl.textContent}">`;
        btn.textContent = "Save";
    } else {
        const newPhone = document.getElementById("editPhone").value;
        const newLocation = document.getElementById("editLocation").value;

        const { data, error } = await supabaseClient
            .from("users")
            .update({ phone: newPhone, location: newLocation })
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            alert("Error updating profile: " + error.message);
            return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        phoneEl.textContent = data.phone || "Not set";
        locationEl.textContent = data.location || "Not set";
        btn.textContent = "Edit";
        alert("Profile updated successfully!");
    }
}

async function loadPastConsultations(email) {
    const { data } = await supabaseClient
        .from("bookings")
        .select("*")
        .eq("email", email)
        .order("date", { ascending: false });

    const container = document.getElementById("pastConsultations");
    if (!data || data.length === 0) {
        container.innerHTML = "No consultations yet";
        return;
    }

    container.innerHTML = "";
    data.forEach(b => {
        container.innerHTML += `
            <div class="consult-item">
                <strong>${b.date}</strong><br>
                ${b.time}<br>
                <span class="status ${b.status}">${b.status}</span>
            </div>
        `;
    });
}

/* ===============================
   FIXED CALENDAR INITIALIZATION
   ================================ */
async function initCalendar() {
    const { data: bookings } = await supabaseClient.from("bookings").select("*");
    const dateMap = {};

    bookings?.forEach(b => {
        if (!dateMap[b.date]) dateMap[b.date] = { approved: false, pending: false };
        if (b.status === "approved") dateMap[b.date].approved = true;
        if (b.status === "pending") dateMap[b.date].pending = true;
    });

    const events = Object.keys(dateMap).map(date => {
        let color = "#28a745"; 
        if (dateMap[date].approved) color = "#dc3545"; // Red [cite: 23]
        else if (dateMap[date].pending) color = "#fd7e14"; // Orange [cite: 23]
        return { title: "●", start: date, color: color };
    });

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        events: events,
        // Disable past dates visually 
        validRange: {
            start: new Date().toISOString().split('T')[0] 
        },
        dateClick: function(info) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const clickedDate = new Date(info.dateStr);

            // Error Handling: Prevent selecting a past date 
            if (clickedDate < today) {
                alert("Selection Error: You cannot select a date in the past.");
                return;
            }

            document.querySelectorAll(".fc-daygrid-day").forEach(d => d.classList.remove("selected"));
            info.dayEl.classList.add("selected");
            
            // Pass the date to your booking function
            if (typeof openBooking === "function") {
                openBooking(info.dateStr);
            }
        }
    });
    calendar.render();
}

document.addEventListener("DOMContentLoaded", loadUser);