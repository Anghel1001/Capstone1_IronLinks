const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Please login first.");
    window.location.href = "book.html";
}

if (user.email !== "ironlinksadmin@gmail.com") {
    alert("Access denied.");
    window.location.href = "index.html";
}

let postMode = false;
let deleteId = null;

/* TOGGLE POST MODE */
function togglePostMode(){
postMode = !postMode;
document.getElementById("postBtn").textContent =
postMode ? "Cancel" : "Post";
loadGallery();
}

/* LOAD GALLERY */
async function loadGallery(){

const res = await fetch('/gallery');
const data = await res.json();

const container = document.getElementById('Gallery');
container.innerHTML = '';

if (!data.length){
container.innerHTML = `
<div class="empty-state">
<p>No images yet</p>
<span>Click "Post" to start uploading</span>
</div>`;
return;
}

const grouped = {};

data.forEach(item=>{
if(!grouped[item.category]) grouped[item.category]=[];
grouped[item.category].push(item);
});

Object.keys(grouped).forEach(category=>{

const wrapper = document.createElement("div");
wrapper.className="category-wrapper";

/* HEADER */
const header = document.createElement("div");
header.className="category-header";

const title = document.createElement("h3");

title.innerHTML = `
${category}
<br>
<small>${grouped[category].length} Images</small>
`;

header.appendChild(title);

if(postMode){
const uploadBtn=document.createElement("button");
uploadBtn.innerHTML="＋ Upload";
uploadBtn.className="upload-btn";
uploadBtn.onclick=()=>uploadToCategory(category);
header.appendChild(uploadBtn);
}

wrapper.appendChild(header);

/* GRID */
const grid=document.createElement("div");
grid.className="gallery-grid";

grouped[category].forEach(item=>{

const div=document.createElement("div");
div.className="gallery-item";

/* IMAGE */
const img=document.createElement("img");
img.src=item.image_url;
img.style.cursor="pointer";

/* CLICK PREVIEW */
img.onclick=()=>openImageModal(item.image_url);

/* DELETE */
const overlay=document.createElement("div");
overlay.className="overlay";

const remove=document.createElement("button");
remove.textContent="✕";
remove.className="remove-btn";

remove.onclick=()=>openDeleteModal(item.id);

overlay.appendChild(remove);

div.appendChild(img);
div.appendChild(overlay);

grid.appendChild(div);

});

wrapper.appendChild(grid);
container.appendChild(wrapper);

});

}

/* DELETE MODAL */
function openDeleteModal(id){
deleteId=id;
document.getElementById("deleteModal").classList.add("show");
}

function closeDeleteModal(){
deleteId=null;
document.getElementById("deleteModal").classList.remove("show");
}

document.getElementById("cancelDelete").onclick=closeDeleteModal;

document.getElementById("confirmDelete").onclick=async ()=>{
if(deleteId){
await deleteImage(deleteId);
}
closeDeleteModal();
};

/* DELETE */
async function deleteImage(id){
await fetch("/gallery/"+id,{method:"DELETE"});
showToast("Image deleted");
loadGallery();
}

/* UPLOAD */
function uploadToCategory(category){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = async (e)=>{

        const files = e.target.files;

        if(files.length === 0) return;

        for(const file of files){

            const formData = new FormData();

            formData.append("image", file);
            formData.append("category", category);

            await fetch("/gallery",{
                method:"POST",
                body:formData
            });

        }

        showToast(`${files.length} image(s) uploaded`);

        loadGallery();

    };

    input.click();

}

/* IMAGE MODAL */
function openImageModal(src){
document.getElementById("modalImage").src = src;
document.getElementById("imageModal").classList.add("show");
}

function closeImageModal(){
document.getElementById("imageModal").classList.remove("show");
}

/* CLOSE BUTTON */
document.getElementById("closeImageModal").onclick = closeImageModal;

/* CLICK OUTSIDE */
document.getElementById("imageModal").onclick = (e)=>{
if(e.target.id === "imageModal"){
closeImageModal();
}
};

/* ESC KEY */
document.addEventListener("keydown",(e)=>{
if(e.key === "Escape"){
closeImageModal();
}
});

/* TOAST */
function showToast(message){
const toast=document.getElementById("toast");
toast.textContent=message;
toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},2000);
}

document.addEventListener("DOMContentLoaded", loadGallery);