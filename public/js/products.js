document.addEventListener("DOMContentLoaded", function () {

/* ========================================
RESTORE TAB FROM URL
======================================== */

const params = new URLSearchParams(window.location.search);
const tab = params.get("tab");

if(tab){

document.querySelectorAll(".product-tab")
.forEach(t=>t.classList.remove("active"));

document.querySelectorAll(".product-tab-content")
.forEach(s=>s.classList.remove("active"));

document.querySelector(`[data-tab="${tab}"]`)
?.classList.add("active");

document.getElementById(tab)
?.classList.add("active");

}


/* ========================================
TAB SWITCHING
======================================== */

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
  
  /* ========================================
  STYLE SWITCHING
  ======================================== */
  
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
  
  
  /* ========================================
  3D VIEW
  ======================================== */
  
  document.querySelectorAll(".view3d").forEach(button => {
  
  button.addEventListener("click", () => {
  
  const container = button.closest(".product-image");
  
  const model = container.querySelector(".model3D");
  const image = container.querySelector(".mainImage");
  
  const isHidden =
  model.style.display === "none" ||
  model.style.display === "";
  
  model.style.display = isHidden ? "block" : "none";
  image.style.display = isHidden ? "none" : "block";
  
  button.textContent =
  isHidden ? "View Image" : "View in 3D";
  
  });
  
  });
  
  
  /* ========================================
  QR MODAL
  ======================================== */
  
  const qrModal = document.getElementById("qrModal");
  const qrImage = document.getElementById("qrImage");
  
document.querySelectorAll(".viewQR")
.forEach(button => {

button.addEventListener("click", () => {

const container =
button.closest(".product-container");

const activeStyle =
container.querySelector(".style-btn.active");

const modelPath =
activeStyle.dataset.model;

// remove models/ and .glb
const model =
modelPath
.replace("models/","")
.replace(".glb","");

const link =
location.origin +
"/redirect.html?model=" +
encodeURIComponent(model);

qrImage.src =
"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="
+ encodeURIComponent(link);

qrModal.style.display = "flex";

});
});
  
  
  document.getElementById("closeQR")
  ?.addEventListener("click",()=>{
  
  qrModal.style.display="none";
  
  });
  
  
  /* ========================================
  GENERATE DESIGN
  ======================================== */
  
  let generatedImage = null;
  
  const generateBtn =
  document.getElementById("generateBtn");
  
  const result =
  document.getElementById("result");
  
  const description =
  document.getElementById("description");

  const referenceImage =
document.getElementById("referenceImage");
  
generateBtn?.addEventListener("click", async () => {

  if (!description.value.trim() && !referenceImage?.files[0]) {
  alert("Add description or upload image");
  return;z
  }
  
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("generatedResult").style.display = "none";
  document.getElementById("loadingDesign").style.display = "block";
  
  const formData = new FormData();
  
  formData.append(
  "description",
  description.value
  );
  
  if(referenceImage?.files[0]){
  formData.append(
  "reference_image",
  referenceImage.files[0]
  );
  }
  
  const res = await fetch("/design-finder", {
  
  method: "POST",
  body: formData
  
  });
  
  const data = await res.json();
  
  generatedImage = data.generated_image;
  
  document.getElementById("loadingDesign").style.display = "none";
  document.getElementById("generatedResult").style.display = "block";
  
  document.getElementById("generatedResult").innerHTML =
  `<img src="${generatedImage}" class="generated-image">`;
  
  });
  
  
  /* ========================================
  SAVE DESIGN
  ======================================== */
  
  document
  .getElementById("saveDesign")
  ?.addEventListener("click",()=>{
  
  if(!generatedImage){
  alert("Generate design first");
  return;
  }
  
  // create download link
  const link = document.createElement("a");
  
  link.href = generatedImage;
  link.download = "ironlinks-custom-design.png";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert("Design saved to device");
  
  });
  
  
  /* ========================================
  COST ESTIMATOR
  ======================================== */
  
  const width =
  document.getElementById("width");
  
  const height =
  document.getElementById("height");
  
  const type =
  document.getElementById("productType");
  
  const resultCost =
  document.getElementById("estimatedCost");
  
  
  function calculate(){
  
  const w =
  parseFloat(width?.value);
  
  const h =
  parseFloat(height?.value);
  
  if(!w || !h){
  resultCost.textContent="₱ 0";
  return;
  }
  
  let rate=350;
  
  if(type.value==="grill") rate=250;
  if(type.value==="railing") rate=250;
  
  const cost = w*h*rate;
  
const formattedCost =
"₱ " + cost.toLocaleString();

resultCost.textContent = formattedCost;

// SAVE COST
localStorage.setItem("estimatedCost", formattedCost);
  
  }
  
  
  width?.addEventListener("input",calculate);
  height?.addEventListener("input",calculate);
  type?.addEventListener("change",calculate);

  /* ========================================
PROCEED BOOKING
======================================== */

document
.getElementById("proceedBooking")
?.addEventListener("click",()=>{

const storedCost = localStorage.getItem("estimatedCost");

if(storedCost){
    localStorage.setItem("estimatedCost", storedCost);
}

// ✅ SAVE GENERATED IMAGE
if(generatedImage){
    localStorage.setItem("generatedDesign", generatedImage);
}

openBooking();

});
  
  /* ========================================
PHOTO VIEW
======================================== */

document.querySelectorAll(".viewScale")
.forEach(button => {

button.addEventListener("click", () => {

const model =
button.getAttribute("data-model")

const photoUrl =
button.getAttribute("data-photo") +
"&model=" + encodeURIComponent(model)

window.open(photoUrl, "_blank")

})
})


window.addEventListener("beforeunload", () => {
    localStorage.removeItem("generatedDesign");
});

});