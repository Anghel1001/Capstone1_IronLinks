fetch("header.html")
.then(res => res.text())
.then(data => {

document.getElementById("header").innerHTML = data

loadProfileCircle?.()

})

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
GLOBAL BOOKING POPUP
================================ */

function isLoggedIn(){

    const user =
    localStorage.getItem("user")
    
    return user !== null
    
    }
    
    
    window.openBooking = function(){
    
    // LOGIN CHECK
    if(!isLoggedIn()){
    
    // redirect to login
    window.location.href =
    "book.html"
    
    return
    
    }
    
    
    let popup =
    document.getElementById("globalBookingPopup")
    
    // create popup if not exists
    if(!popup){
    
    popup =
    document.createElement("div")
    
    popup.id =
    "globalBookingPopup"
    
    popup.innerHTML = `
    <div class="popup-overlay">
    
    <div class="popup-content">
    
    <button class="close-btn" onclick="closeBooking()">✕</button>
    
    <iframe 
    src="book_popup.html"
    width="100%"
    height="650px"
    style="border:none;">
    </iframe>
    
    </div>
    
    </div>
    `
    
    document.body.appendChild(popup)
    
    }
    
    popup.style.display = "flex"
    
    }
    
    
    window.closeBooking = function(){
    
    document
    .getElementById("globalBookingPopup")
    .style.display = "none"
    
    }