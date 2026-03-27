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

        
        