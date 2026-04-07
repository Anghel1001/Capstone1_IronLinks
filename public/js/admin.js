async function loadGallery(){

    try{
    
    const res = await fetch('/gallery');
    const data = await res.json();
    
    
    const categories = ["Gate","Grill","Railing"];
    
    categories.forEach(cat => {
    
    const container =
    document.getElementById(cat);
    
    container.innerHTML = "";
    
    const filtered =
    data.filter(item => item.category === cat);
    
    filtered.forEach(item => {
    
    const div =
    document.createElement("div");
    
    const img =
    document.createElement("img");
    
    img.src =
    item.image_url;
    
    const remove =
    document.createElement("button");
    
    remove.textContent =
    "Remove";
    
    remove.className =
    "remove-btn";
    
    remove.onclick =
    ()=>deleteImage(item.id);
    
    div.appendChild(img);
    div.appendChild(remove);
    
    container.appendChild(div);
    
    });
    
    });
    
    }catch(err){
    console.error(err);
    }
    
    }
    
    
    
    async function uploadImage(e,category){
    
    const file =
    e.target.files[0];
    
    if(!file) return;
    
    const formData =
    new FormData();
    
    formData.append("image",file);
    formData.append("category",category);
    
    await fetch("/gallery",{
    method:"POST",
    body:formData
    });
    
    loadGallery();
    
    }
    
    
    
    async function deleteImage(id){
    
    await fetch("/gallery/"+id,{
    method:"DELETE"
    });
    
    loadGallery();
    
    }
    
    
    
    document.addEventListener(
    "DOMContentLoaded",
    loadGallery
    );