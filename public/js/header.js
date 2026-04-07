/* ===============================
HEADER LOAD
================================ */

fetch("header.html")
.then(res => res.text())
.then(data => {

document.getElementById("header").innerHTML = data

loadProfileCircle?.()

})


/* ===============================
PROFILE DROPDOWN
================================ */

function toggleProfileMenu(){

document
.getElementById("profileMenu")
.classList.toggle("hidden")

}

window.addEventListener("click", function(e){

const dropdown =
document.querySelector(".profile-dropdown")

if(dropdown && !dropdown.contains(e.target)){

document
.getElementById("profileMenu")
?.classList.add("hidden")

}

})


/* ===============================
PROFILE CIRCLE
================================ */

function loadProfileCircle(){

const user =
JSON.parse(localStorage.getItem("user"))

if(!user) return

const initial =
document.getElementById("profileInitial")

const image =
document.getElementById("profileImage")

if(user.profileImage){

image.src = user.profileImage
image.classList.remove("hidden")
initial.classList.add("hidden")

}else{

initial.textContent =
user.name.charAt(0).toUpperCase()

}

}


/* ===============================
LOGIN CHECK
================================ */

function isLoggedIn(){
return localStorage.getItem("user") !== null
}

/* ===============================
LOGOUT (GLOBAL)
================================ */

window.logout = function(){

localStorage.removeItem("user")

// redirect to home page (optional)
window.location.href = "index.html"

}

/* ===============================
GLOBAL BOOKING POPUP
================================ */

window.openBooking = function(){

// NOT LOGGED IN
if(!isLoggedIn()){

window.location.href = "book.html"
return

}

let popup =
document.getElementById("globalBookingPopup")

// CREATE POPUP
if(!popup){

popup = document.createElement("div")

popup.id = "globalBookingPopup"

popup.innerHTML = `

<div class="popup-overlay">

<div class="popup-content">

<button class="close-btn" onclick="closeBooking()">✕</button>

<iframe src="book_popup.html"></iframe>

</div>

</div>

`

document.body.appendChild(popup)

}

popup.style.display = "flex"

}


/* ===============================
CLOSE BOOKING
================================ */

window.closeBooking = function(){

document
.getElementById("globalBookingPopup")
.style.display = "none"

}


/* ===============================
GLOBAL BOOKING BUTTONS
================================ */

document.addEventListener("click", function(e){

if(e.target.classList.contains("openBooking")){
openBooking()
}

})