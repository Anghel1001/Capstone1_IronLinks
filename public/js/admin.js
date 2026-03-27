/* ================= LOAD GALLERY ================= */

async function loadGallery(){

    const res = await fetch('/gallery');
    const data = await res.json();
    
    ['Gate','Grill','Railing'].forEach(cat=>{
    document.getElementById(cat).innerHTML='';
    });
    
    
    data.forEach(item=>{
    
    const wrapper=document.createElement('div');
    
    wrapper.innerHTML=`
    
    <img src="${item.image_url}">
    
    <span class="remove-btn"
    onclick="deleteImage(${item.id})">
    
    Remove
    
    </span>
    
    `;
    
    document
    .getElementById(item.category)
    .appendChild(wrapper);
    
    });
    
    }
    
    
    
    /* ================= UPLOAD IMAGE ================= */
    
    async function uploadImage(event,category){
    
    const file=event.target.files[0];
    
    if(!file) return;
    
    const formData=new FormData();
    
    formData.append('category',category);
    formData.append('image',file);
    
    
    await fetch('/gallery',{
    method:'POST',
    body:formData
    });
    
    
    event.target.value='';
    
    loadGallery();
    
    }
    
    
    
    /* ================= DELETE IMAGE ================= */
    
    async function deleteImage(id){
    
    if(!confirm('Remove this image?')) return;
    
    await fetch(`/gallery/${id}`,{
    method:'DELETE'
    });
    
    loadGallery();
    
    }
    
    
    /* ================= INITIAL LOAD ================= */
    
    loadGallery();