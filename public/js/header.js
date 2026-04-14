/* ===============================
HEADER LOAD
================================ */

fetch("header.html")
.then(res => res.text())
.then(data => {

document.getElementById("header").innerHTML = data

loadProfileCircle?.()
loadAuthMenu?.()

})

/* ===============================
active page highlight
================================ */

document.addEventListener("DOMContentLoaded", function () {

const links = document.querySelectorAll(".nav-link");
const currentPage = window.location.pathname.split("/").pop();

links.forEach(link => {
const linkPage = link.getAttribute("href");

if(linkPage === currentPage){
link.classList.add("active");
}
});

});

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
AUTH MENU (LOGIN / LOGOUT)
================================ */

function loadAuthMenu(){

const auth =
document.getElementById("authLinks")

if(!auth) return

if(isLoggedIn()){

auth.innerHTML = `
<a href="book.html">Profile</a>
<a href="#" id="logoutBtn">Logout</a>
`

document
.getElementById("logoutBtn")
.addEventListener("click", logout)

}else{

auth.innerHTML = `
<a href="book.html">Login</a>
`

}

}


/* ===============================
LOGOUT (GLOBAL)
================================ */

window.logout = function(){

localStorage.removeItem("user")

window.location.href = "index.html"

}


/* ===============================
GLOBAL BOOKING POPUP
================================ */

window.openBooking = function(){

if(!isLoggedIn()){

window.location.href = "book.html"
return

}

let popup =
document.getElementById("globalBookingPopup")

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
