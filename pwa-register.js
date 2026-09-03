"use strict";
if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    try{
      await navigator.serviceWorker.register("/service-worker.js",{ scope: "/" });
      console.log("PWA Service Worker 已註冊。");
    }catch(error){
      console.warn("PWA Service Worker 註冊失敗：",error);
    }
  });
}
