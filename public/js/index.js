async function loadDynamicGallery() {

    try {
    
    const res = await fetch('/gallery');
    const data = await res.json();
    
    const container = document.getElementById('dynamicGallery');
    container.innerHTML = '';
    
    if (!data.length) {
    container.innerHTML = '<p>No gallery images available.</p>';
    return;
    }
    
    const grouped = {};
    
    data.forEach(item => {
    
    if (!grouped[item.category]) {
    grouped[item.category] = [];
    }
    
    grouped[item.category].push(item.image_url);
    
    });
    
    
    Object.keys(grouped).forEach(category => {
    
    const title = document.createElement('h3');
    title.textContent = category;
    
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    
    grouped[category].forEach(url => {
    
        const img = document.createElement('img');
        img.src = url;
        img.alt = `${category} design`;
        img.style.cursor = "pointer";
        
        img.onclick = () => openImageModal(url);
    
    grid.appendChild(img);
    
    });
    
    container.appendChild(title);
    container.appendChild(grid);
    
    });
    
    }
    
    catch(err){
    console.error("Gallery error",err);
    }
    
    }
    
    document.addEventListener("DOMContentLoaded",loadDynamicGallery);

    function openImageModal(src){
        document.getElementById("modalImage").src = src;
        document.getElementById("imageModal").classList.add("show");
        }
        
        function closeImageModal(){
        document.getElementById("imageModal").classList.remove("show");
        }

        document.addEventListener("DOMContentLoaded", () => {

            document.getElementById("closeImageModal").onclick = closeImageModal;
            
            document.getElementById("imageModal").onclick = (e)=>{
            if(e.target.id === "imageModal"){
                closeImageModal();
            }
            };
            
            document.addEventListener("keydown",(e)=>{
            if(e.key === "Escape"){
                closeImageModal();
            }
            });
            
            });