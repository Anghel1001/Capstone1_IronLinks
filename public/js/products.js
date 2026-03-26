document.addEventListener("DOMContentLoaded", function () {


    // ========================================
    // TAB SWITCHING
    // ========================================
    
    const tabs = document.querySelectorAll(".product-tab");
    const sections = document.querySelectorAll(".product-tab-content");
    
    tabs.forEach(tab => {
    
    tab.addEventListener("click", () => {
    
    tabs.forEach(t => t.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));
    
    tab.classList.add("active");
    
    const target = tab.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
    
    });
    
    });
    
    
    
    // ========================================
    // OPEN TAB FROM URL
    // ========================================
    
    const hash = window.location.hash.replace("#","");
    
    if(hash){
    const tab = document.querySelector(`[data-tab="${hash}"]`);
    
    if(tab){
    tab.click();
    }
    }
    
    
    
    // ========================================
    // STYLE SWITCHING
    // ========================================
    
    const styleButtons = document.querySelectorAll(".style-btn");
    
    styleButtons.forEach(btn => {
    
    btn.addEventListener("click",()=>{
    
    const container = btn.closest(".product-container");
    
    const img = container.querySelector(".mainImage");
    const model = container.querySelector(".model3D");
    const title = container.querySelector(".product-title");
    const price = container.querySelector(".product-price");
    
    container.querySelectorAll(".style-btn")
    .forEach(b=>b.classList.remove("active"));
    
    btn.classList.add("active");
    
    img.src = btn.dataset.img;
    model.src = btn.dataset.model;
    
    title.textContent = btn.dataset.title;
    price.textContent = btn.dataset.price;
    
    });
    
    });
    
    
    
    // ========================================
    // 3D VIEW
    // ========================================
    
    const view3dButtons = document.querySelectorAll(".view3d");
    
    view3dButtons.forEach(button => {
    
    button.addEventListener("click", () => {
    
    const container = button.closest(".product-image");
    
    const model = container.querySelector(".model3D");
    const image = container.querySelector(".mainImage");
    
    const isHidden =
    model.style.display === "none" ||
    model.style.display === "";
    
    model.style.display = isHidden ? "block" : "none";
    image.style.display = isHidden ? "none" : "block";
    
    button.textContent = isHidden
    ? "Image View"
    : "3D View";
    
    });
    
    });
    
    
    
    // ========================================
    // PHOTO VIEW
    // ========================================
    
    const photoButtons = document.querySelectorAll(".viewScale");
    
    photoButtons.forEach(button => {
    
    button.addEventListener("click", () => {
    
    const page = button.getAttribute("data-photo");
    window.location.href = page;
    
    });
    
    });
    
    
    
    // ========================================
    // QR MODAL
    // ========================================
    
  /* ================= QR MODAL ================= */

const qrModal = document.getElementById("qrModal");
const qrImage = document.getElementById("qrImage");
const closeQR = document.getElementById("closeQR");

const qrButtons = document.querySelectorAll(".viewQR");

qrButtons.forEach(button => {

button.addEventListener("click", () => {

const qr = button.getAttribute("data-qr");

qrImage.src = qr;

qrModal.style.display = "flex";

});

});


closeQR.addEventListener("click", () => {
qrModal.style.display = "none";
});

window.addEventListener("click", (e) => {
if (e.target === qrModal) {
qrModal.style.display = "none";
}
});
    
    
    
    // ========================================
    // PRODUCT FINDER
    // ========================================
    
    const generateBtn = document.getElementById("generateBtn");
    const result = document.getElementById("result");
    const description = document.getElementById("description");
    
    if(generateBtn){
    
    generateBtn.addEventListener("click", async () => {
    
    if (!description.value.trim()) {
    alert("Please describe your design");
    return;
    }
    
    result.innerHTML = "Generating...";
    
    try {
    
    const res = await fetch("/design-finder", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify({
    description: description.value
    })
    });
    
    const data = await res.json();
    
    result.innerHTML =
    `<img src="${data.generated_image}" 
    class="generated-image">`;
    
    }catch(err){
    
    result.innerHTML="Failed to generate design";
    
    }
    
    });
    
    }
    
    
    });
    /* ================= COST ESTIMATOR ================= */

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const productType = document.getElementById("productType");
const estimatedCost = document.getElementById("estimatedCost");

function calculateCost(){

const width = parseFloat(widthInput?.value);
const height = parseFloat(heightInput?.value);

if(!width || !height){
estimatedCost.textContent = "₱ 0";
return;
}

let rate = 350;

if(productType.value === "gate"){
rate = 350;
}

if(productType.value === "grill"){
rate = 250;
}

if(productType.value === "railing"){
rate = 250;
}

const area = width * height;
const cost = area * rate;

estimatedCost.textContent =
"₱ " + cost.toLocaleString();

}


widthInput?.addEventListener("input", calculateCost);
heightInput?.addEventListener("input", calculateCost);
productType?.addEventListener("change", calculateCost);