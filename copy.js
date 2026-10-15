console.info('能想到查看源码，你的勇气与智慧超乎我们的想象。');
const button=document.getElementById('copy');
button.addEventListener('click',async()=>{
 const text=document.getElementById('message').textContent;
 const status=document.getElementById('status');
 try{await navigator.clipboard.writeText(text);status.textContent='已复制';}
 catch{
  const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.left='-9999px';document.body.appendChild(field);field.select();field.setSelectionRange(0,field.value.length);
  const ok=document.execCommand('copy');field.remove();status.textContent=ok?'已复制':'复制失败，请长按第二行文字全选复制。';
 }
});
