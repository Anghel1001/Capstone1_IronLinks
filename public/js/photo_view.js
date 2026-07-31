/* ========================================
   ELEMENT REFERENCES
======================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("imageInput");
const placeBtn = document.getElementById("placeBtn");
const resetBtn = document.getElementById("resetBtn");

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
   UI steps
======================================== */
function setStep(step){

document.querySelectorAll(".step")
.forEach(s => s.classList.remove("active"));

document.getElementById("step" + step)
.classList.add("active");

}


/* ========================================
   MODEL SWITCH
======================================== */

const modelPath = params.get("model");


/* ========================================
   LOAD IMAGE
======================================== */

imageInput.addEventListener("change", (e) => {

const file = e.target.files[0];
if (!file) return;

img = new Image();
img.src = URL.createObjectURL(file);

img.onload = () => {

const container = document.querySelector(".right");

const maxWidth = container.clientWidth - 10;

let width = img.width;
let height = img.height;

if(width > maxWidth){

const ratio = maxWidth / width;
width = width * ratio;
height = height * ratio;

}

canvas.width = width;
canvas.height = height;

canvas.style.width = width + "px";
canvas.style.height = height + "px";

ctx.clearRect(0,0,width,height);
ctx.drawImage(img,0,0,width,height);

canvas.style.display = "block";   // important

corners = [];

if(viewer){
viewer.remove();
viewer = null;
}

setStep(2);

};

});


// SELECT CORNERS 

canvas.addEventListener("click", (e)=>{

if(!img) return;
if(corners.length >= 4) return;

const rect = canvas.getBoundingClientRect();

const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const x = (e.clientX - rect.left) * scaleX;
const y = (e.clientY - rect.top) * scaleY;

corners.push({x,y});

redraw();

});


// REDRAW 

function redraw(){

ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.drawImage(img,0,0,canvas.width,canvas.height);

ctx.fillStyle="#3b82f6";

corners.forEach(p=>{

ctx.beginPath();
ctx.arc(p.x,p.y,7,0,Math.PI*2);
ctx.fill();

});

}


// PLACE MODEL 

placeBtn.addEventListener("click",()=>{

if(corners.length !== 4){
alert("Select 4 points first");
return;
}

const xs = corners.map(p => p.x);
const ys = corners.map(p => p.y);

const width = Math.max(...xs) - Math.min(...xs);
const height = Math.max(...ys) - Math.min(...ys);

// TRUE CENTER of 4 points
const centerX = xs.reduce((a,b)=>a+b,0) / 4;
const centerY = ys.reduce((a,b)=>a+b,0) / 4;

if(viewer) viewer.remove();

viewer = document.createElement("model-viewer");

viewer.src = modelPath;

viewer.setAttribute("camera-controls","");
viewer.setAttribute("auto-rotate","");
viewer.setAttribute("shadow-intensity","1");
viewer.setAttribute("camera-orbit", "0deg 75deg auto");
viewer.setAttribute("field-of-view", "20deg");
viewer.setAttribute("min-camera-orbit", "auto auto auto");
viewer.setAttribute("max-camera-orbit", "auto auto auto");
viewer.setAttribute("camera-controls", "");
viewer.setAttribute("interaction-prompt", "none");
viewer.setAttribute("camera-target", "0m 0m 0m");
viewer.setAttribute("scale", "1 1 1");


viewer.style.position = "absolute";

const canvasWrapper = canvas.parentElement;
canvasWrapper.style.position = "relative";

viewer.style.left = (centerX / canvas.width * 100) + "%";
viewer.style.top = (centerY / canvas.height * 100) + "%";

viewer.style.width = (width / canvas.width * 100) + "%";
viewer.style.height = (height / canvas.height * 100) + "%";

viewer.style.transform = "translate(-50%, -50%)";

viewer.style.display = "flex";
viewer.style.alignItems = "center";
viewer.style.justifyContent = "center";

viewer.style.zIndex = "5";

canvasWrapper.appendChild(viewer);

setStep(3);

});


// RESET 

resetBtn.addEventListener("click",()=>{

corners=[];

if(viewer){
viewer.remove();
viewer=null;
}

if(img){
ctx.drawImage(img,0,0,canvas.width,canvas.height);
}

});


// Simple memory back button 

function goBack(){

const from = new URLSearchParams(window.location.search).get("from");

if(from){
window.location.href = "products.html?tab=" + from;
}else{
history.back();
}

}