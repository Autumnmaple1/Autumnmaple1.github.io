console.info('能想到查看源码，你的勇气与智慧超乎我们的想象。');
const form=document.getElementById('unlock');
const status=document.getElementById('status');
const button=document.getElementById('submit');
const download=document.getElementById('download');
let assetPromise,downloadURL;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(button.disabled)return;
 button.disabled=true;status.textContent='正在解密…';download.hidden=true;
 if(downloadURL){URL.revokeObjectURL(downloadURL);downloadURL=undefined;download.removeAttribute('href');}
 try{
  if(!globalThis.crypto?.subtle){status.textContent='请通过 HTTPS 访问此页面。';return;}
  if(!assetPromise)assetPromise=fetch('../assets/archive.bin').then(r=>{if(!r.ok)throw Error('asset');return r.arrayBuffer();}).catch(e=>{assetPromise=undefined;throw e;});
  let data;try{data=new Uint8Array(await assetPromise);}catch{status.textContent='文件加载失败，请稍后重试。';return;}
  if(new TextDecoder().decode(data.slice(0,8))!=='NOVAARG1'){status.textContent='文件异常，请联系活动组织者。';return;}
  const input=document.getElementById('password');
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(input.value),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:data.slice(8,24),iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  let plaintext;try{plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(24,36)},key,data.slice(36));}catch{status.textContent='密码错误或文件损坏。';return;}
  input.value='';const jpeg=globalThis.NovaZip?NovaZip.renameEntry(new Uint8Array(plaintext)):new Uint8Array(plaintext);downloadURL=URL.createObjectURL(new Blob([jpeg],{type:'image/jpeg'}));download.href=downloadURL;download.hidden=false;status.textContent='解密成功';
 }catch{status.textContent='无法解密，请重试或更换浏览器。';}
 finally{button.disabled=false;}
});
window.addEventListener('pagehide',()=>{if(downloadURL)URL.revokeObjectURL(downloadURL);});
