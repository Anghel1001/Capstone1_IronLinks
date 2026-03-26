/* ========================================
   ELEMENT REFERENCES
======================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("imageInput");
const placeBtn = document.getElementById("placeBtn");
const resetBtn = document.getElementById("resetBtn");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const backBtn = document.getElementById("backBtn");


/* ========================================
   VARIABLES
======================================== */

let img = null;
let corners = [];
let viewer = null;


/* ========================================
   URL PARAMETERS
======================================== */

const params = new URLSearchParams(window.location.search);

const modelType = params.get("model");
const from = params.get("from");


/* ========================================
   BACK BUTTON (RETURN TO SAME TAB)
======================================== */

if(backBtn){

backBtn.addEventListener("click", ()=>{

if(from){
window.location.href = "products.html#" + from;
}else{
window.location.href = "products.html";
}

});

}


/* ========================================
   MODEL SWITCH
======================================== */

let modelPath = "models/gate1.glb";

if(modelType === "grills"){
modelPath = "models/window1.glb";
title.textContent = "IronLinks Grill Preview";
subtitle.textContent = "Preview iron grills in your space";
}

if(modelType === "railings"){
modelPath = "models/grill2.glb";
title.textContent = "IronLinks Railing Preview";
subtitle.textContent = "Preview railings in your space";
}

if(modelType === "gates"){
modelPath = "models/gate1.glb";
title.textContent = "IronLinks Gate Preview";
subtitle.textContent = "Preview iron gates in your space";
}



/* ========================================
   LOAD IMAGE
======================================== */

imageInput.addEventListener("change", (e) => {

const file = e.target.files[0];
if (!file) return;

img = new Image();
img.src = URL.createObjectURL(file);

img.onload = () => {

const containerWidth =
document.querySelector(".container").clientWidth;

let width = img.width;
let height = img.height;

if (width > containerWidth) {

const ratio = containerWidth / width;
width = containerWidth;
height = height * ratio;

}

canvas.width = width;
canvas.height = height;

ctx.clearRect(0, 0, width, height);
ctx.drawImage(img, 0, 0, width, height);

corners = [];

if (viewer) {
viewer.remove();
viewer = null;
}

};

});



/* ========================================
   CANVAS CLICK (SELECT CORNERS)
======================================== */

canvas.addEventListener("click", (e) => {

if (!img) return;
if (corners.length >= 4) return;

const rect = canvas.getBoundingClientRect();

const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const x = (e.clientX - rect.left) * scaleX;
const y = (e.clientY - rect.top) * scaleY;

corners.push({ x, y });

redraw();

});



/* ========================================
   DRAW CORNER POINTS
======================================== */

function redraw() {

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#3b82f6";

corners.forEach(p => {

ctx.beginPath();
ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
ctx.fill();

});

}



/* ========================================
   PLACE 3D MODEL
======================================== */

placeBtn.addEventListener("click", () => {

if (corners.length !== 4) {
alert("Select 4 points first.");
return;
}

const xs = corners.map(p => p.x);
const ys = corners.map(p => p.y);

const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);

if (viewer) viewer.remove();

viewer = document.createElement("model-viewer");

viewer.src = modelPath;

viewer.setAttribute("camera-controls", "");
viewer.setAttribute("auto-rotate", "");

viewer.style.position = "absolute";
viewer.style.left = canvas.offsetLeft + minX + "px";
viewer.style.top = canvas.offsetTop + minY + "px";

viewer.style.width = (maxX - minX) + "px";
viewer.style.height = (maxY - minY) + "px";

document.body.appendChild(viewer);

});



/* ========================================
   RESET
======================================== */

resetBtn.addEventListener("click", () => {

corners = [];

if (viewer) {
viewer.remove();
viewer = null;
}

redraw();

});