(function(){

    const params = new URLSearchParams(window.location.search);
    const modelType = params.get("model") || "gates";
    
    const title = document.getElementById("title");
    
    
    const MODELS = {
    
    gates:{
    title:"Preview Your Gate in AR",
    glb:"/models/gate1.glb",
    usdz:"/models/gate1.usdz?v=2"
    },
    
    grills:{
    title:"Preview Your Grill in AR",
    glb:"/models/window1.glb",
    usdz:"/models/window1.usdz"
    },
    
    railings:{
    title:"Preview Your Railing in AR",
    glb:"/models/grill2.glb",
    usdz:"/models/grill2.usdz"
    }
    
    };
    
    
    const model = MODELS[modelType];
    
    if(!model){
    document.getElementById("box").innerHTML=
    "<h2 class='error'>Unknown model</h2>";
    return;
    }
    
    
    title.textContent = model.title;
    
    const origin = location.origin;
    const glbUrl = origin + model.glb;
    const usdzUrl = origin + model.usdz;
    
    
    window.launchAR = function(){
    
    const ua = navigator.userAgent;
    
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    
    if(isIOS){
    
    const a = document.createElement("a");
    a.rel="ar";
    a.href=usdzUrl;
    
    document.body.appendChild(a);
    a.click();
    
    return;
    
    }
    
    
    if(isAndroid){
    
    const intent=
    `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_preferred`+
    `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;end`;
    
    window.location.replace(intent);
    
    return;
    
    }
    
    
    alert("Open on mobile device");
    
    };
    
    })();