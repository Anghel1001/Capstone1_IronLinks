(function(){

const params =
new URLSearchParams(window.location.search);

const modelPath =
params.get("model") || "gates/gate_classic";

const title =
document.getElementById("title");

const glb =
"/models/" + modelPath + ".glb";

const usdz =
"/models/" + modelPath + ".usdz";


// Device Detection

const ua =
navigator.userAgent || navigator.vendor;

const isAndroid =
/Android/i.test(ua);

const isIOS =
/iPhone|iPad|iPod/i.test(ua);

const isDesktop =
!isAndroid && !isIOS;


// Desktop Message

if(isDesktop){

document.getElementById("box").innerHTML =

`
<h2>Open on Mobile Device</h2>

<p>Please scan this QR using your phone</p>

<p>AR works on:</p>

<p>• Android (Chrome)</p>
<p>• iPhone (Safari)</p>
`;

return;

}


// Launch AR

window.launchAR = function(){


// iPhone Quick Look

if(isIOS){

const a =
document.createElement("a");

a.rel="ar";
a.href =
location.origin + usdz;

document.body.appendChild(a);

a.click();

return;

}


// Android Scene Viewer

if(isAndroid){

const intent =

`intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(location.origin + glb)}&mode=ar_preferred`

+

`#Intent;scheme=https;package=com.google.android.googlequicksearchbox;end`;


window.location.replace(intent);

return;

}

};

})();