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