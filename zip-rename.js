(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.NovaZip=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const OLD_NAME='archive.mp4',NEW_NAME='final_answer.mp4';
 const ascii=s=>Uint8Array.from(s,c=>c.charCodeAt(0));
 const oldName=ascii(OLD_NAME),newName=ascii(NEW_NAME);
 const matches=(data,start,name)=>name.every((value,index)=>data[start+index]===value);

 function renameEntry(input){
  const data=input instanceof Uint8Array?input:new Uint8Array(input);
  const view=new DataView(data.buffer,data.byteOffset,data.byteLength);
  const lowest=Math.max(0,data.length-22-0xffff);
  let eocd=-1;
  for(let offset=data.length-22;offset>=lowest;offset--){
   if(view.getUint32(offset,true)===0x06054b50){eocd=offset;break;}
  }
  if(eocd<0||view.getUint16(eocd+10,true)!==1)return data;
  const centralOffset=view.getUint32(eocd+16,true);
  if(centralOffset+46>data.length||view.getUint32(centralOffset,true)!==0x02014b50)return data;
  const method=view.getUint16(centralOffset+10,true);
  const flags=view.getUint16(centralOffset+8,true);
  const centralNameLength=view.getUint16(centralOffset+28,true);
  const centralExtraLength=view.getUint16(centralOffset+30,true);
  const centralCommentLength=view.getUint16(centralOffset+32,true);
  const compressedSize=view.getUint32(centralOffset+20,true);
  const localOffset=view.getUint32(centralOffset+42,true);
  if(method!==0||(flags&8)||localOffset+30>data.length||view.getUint32(localOffset,true)!==0x04034b50)return data;
  const localNameLength=view.getUint16(localOffset+26,true);
  const localExtraLength=view.getUint16(localOffset+28,true);
  if(centralNameLength!==oldName.length||localNameLength!==oldName.length)return data;
  if(!matches(data,centralOffset+46,oldName)||!matches(data,localOffset+30,oldName))return data;
  if(centralExtraLength||centralCommentLength||localExtraLength)return data;
  const videoStart=localOffset+30+localNameLength;
  if(videoStart+compressedSize>data.length)return data;

  const zipLength=30+newName.length+compressedSize+46+newName.length+22;
  const output=new Uint8Array(localOffset+zipLength);
  output.set(data.subarray(0,localOffset));
  let cursor=localOffset;
  output.set(data.subarray(localOffset,localOffset+26),cursor);
  new DataView(output.buffer).setUint16(cursor+26,newName.length,true);
  new DataView(output.buffer).setUint16(cursor+28,0,true);
  output.set(newName,cursor+30);
  cursor+=30+newName.length;
  output.set(data.subarray(videoStart,videoStart+compressedSize),cursor);
  cursor+=compressedSize;

  const newCentralOffset=cursor;
  output.set(data.subarray(centralOffset,centralOffset+28),cursor);
  new DataView(output.buffer).setUint16(cursor+28,newName.length,true);
  output.set(data.subarray(centralOffset+30,centralOffset+46),cursor+30);
  output.set(newName,cursor+46);
  cursor+=46+newName.length;

  output.set(data.subarray(eocd,eocd+20),cursor);
  const outView=new DataView(output.buffer);
  outView.setUint32(cursor+12,46+newName.length,true);
  outView.setUint32(cursor+16,newCentralOffset,true);
  outView.setUint16(cursor+20,0,true);
  return output;
 }

 return {renameEntry};
});
