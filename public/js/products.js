document.addEventListener("DOMContentLoaded", function () {


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
  isHidden ? "Image View" : "3D View";
  
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
  
  qrImage.src =
  button.getAttribute("data-qr");
  
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
  
  
  generateBtn?.addEventListener("click", async () => {
  
  if (!description.value.trim()) {
  alert("Please describe your design");
  return;
  }
  
  result.innerHTML = "Generating...";
  
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
  
  generatedImage =
  data.generated_image;
  
  
  /* SAVE IMAGE */
  
  localStorage.setItem(
  "generatedDesign",
  generatedImage
  );
  
  
  result.innerHTML =
  `<img src="${generatedImage}"
  class="generated-image">`;
  
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
  
  localStorage.setItem(
  "generatedDesign",
  generatedImage
  );
  
  alert("Design saved");
  
  });
  
  
  /* ========================================
  BOOKING POPUP
  ======================================== */
  
  const bookingPopup =
  document.getElementById("bookingPopup");
  
  const closeBooking =
  document.getElementById("closeBooking");
  
  
  document
  .querySelectorAll(".openBooking")
  .forEach(btn=>{
  
  btn.addEventListener("click",()=>{
  
  bookingPopup.style.display="flex";
  
  document
  .querySelector("#bookingPopup iframe")
  .contentWindow.location.reload();
  
  });
  
  });
  
  
  document
  .getElementById("proceedBooking")
  ?.addEventListener("click",()=>{
  
  bookingPopup.style.display="flex";
  
  document
  .querySelector("#bookingPopup iframe")
  .contentWindow.location.reload();
  
  });
  
  
  closeBooking?.addEventListener("click",()=>{
  
  bookingPopup.style.display="none";
  
  });
  
  
  window.addEventListener("click",(e)=>{
  
  if(e.target === bookingPopup){
  bookingPopup.style.display="none";
  }
  
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
  
  resultCost.textContent =
  "₱ "+cost.toLocaleString();
  
  }
  
  
  width?.addEventListener("input",calculate);
  height?.addEventListener("input",calculate);
  type?.addEventListener("change",calculate);
  
  
  /* ========================================
PHOTO VIEW
======================================== */

document.querySelectorAll(".viewScale")
.forEach(button => {

button.addEventListener("click", () => {

const photoUrl =
button.getAttribute("data-photo")

window.open(photoUrl, "_blank")

})

})
  });