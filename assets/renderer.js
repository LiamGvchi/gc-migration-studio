/* Migration Studio. Offline, deterministic migration-only Canvas renderer. */
(() => {
'use strict';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const make=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
function shape(c,type,r){c.beginPath();if(type==='bird'){c.moveTo(0,r*.25);c.bezierCurveTo(-r*.2,-r*.7,-r*.7,-r*.3,-r,-r*.72);c.quadraticCurveTo(-r*.65,r*.25,-r*.14,r*.22);c.lineTo(-r*.16,r*.65);c.lineTo(0,r*.46);c.lineTo(r*.17,r*.65);c.lineTo(r*.13,r*.2);c.quadraticCurveTo(r*.7,r*.2,r,-r*.72);c.bezierCurveTo(r*.5,-r*.2,r*.17,-r*.6,0,r*.25);}else if(type==='leaf'||type==='petal'||type==='seed'){let thin=type==='seed'?.3:type==='leaf'?.5:.7;c.moveTo(0,-r);c.bezierCurveTo(r*thin,-r*.7,r*thin,r*.6,0,r);c.bezierCurveTo(-r*thin,r*.4,-r*thin,-r*.6,0,-r);}else if(type==='window'){c.rect(-r*.65,-r,r*1.3,r*2);}else if(type==='shard'){c.moveTo(-r,-r*.4);c.lineTo(r*.25,-r);c.lineTo(r,r*.35);c.lineTo(-r*.3,r);c.closePath();}else{c.arc(0,0,r,0,TAU);}c.closePath();}
function birdPath(c,r){
 c.beginPath();c.moveTo(0,-r*.23);c.quadraticCurveTo(-r*.18,-r*.32,-r*.36,-r*.45);
 c.lineTo(-r,-r*.73);c.quadraticCurveTo(-r*.78,-r*.01,-r*.15,r*.17);
 c.lineTo(-r*.19,r*.53);c.lineTo(0,r*.34);c.lineTo(r*.19,r*.53);c.lineTo(r*.15,r*.17);
 c.quadraticCurveTo(r*.78,-r*.01,r,-r*.73);c.lineTo(r*.36,-r*.45);c.quadraticCurveTo(r*.18,-r*.32,0,-r*.23);c.closePath();
}
const ELEMENTS=[
 {id:'bird',name:'飞鸟',motion:'分批起飞，沿弧线迁徙',speed:'扑翼速度'},
 {id:'heart',name:'爱心',motion:'轻轻起伏，带着原图纹理漂走',speed:'轻跳速度'},
 {id:'maple',name:'枫叶',motion:'侧摆与翻转，像一片被风带走的叶子',speed:'摆动速度'},
 {id:'swallow',name:'燕子',motion:'尖翼与长叉尾，轻快振翅',speed:'振翅速度'},
 {id:'butterfly',name:'蝴蝶',motion:'双翼开合，伴随轻微上下浮动',speed:'翼动速度'},
 {id:'petal',name:'花瓣',motion:'柔和翻卷，沿路径飘散',speed:'飘动速度'},
 {id:'star',name:'星星',motion:'缓慢旋转，形成一串星形碎片',speed:'旋转速度'},
 {id:'blossom',name:'樱花',motion:'五瓣花朵轻轻翻转，离开照片时显出粉色',speed:'飘动速度'}
];
ELEMENTS.push({id:'emoji',name:'自选 Emoji',motion:'沿路径轻轻漂移，保留表情完整轮廓',speed:'飘动速度'});
ELEMENTS.push({id:'zany',name:'滑稽',motion:'轻轻摇头，伴随弹性起伏',speed:'摇摆速度',emojiOnly:true});
const EMOJI={heart:'❤️',maple:'🍁',butterfly:'🦋',blossom:'🌸',zany:'🤪'};
const emojiKey=s=>s.replace(/[\uFE0E\uFE0F]/g,'');
const emojiEntries=new Map(EMOJI_CATALOG.entries.map(e=>[emojiKey(e[0]),{glyph:e[0],name:e[1],english:e[2],group:e[3],keywords:e[4]}]));
function normalizeEmoji(value){if(typeof value!=='string'||value.length>64)return null;return emojiEntries.get(emojiKey(value.trim()))?.glyph||null}
const emojiInfo=value=>emojiEntries.get(emojiKey(value||''));
const emojiElement=value=>Object.keys(EMOJI).find(id=>EMOJI[id]===value)||'emoji';
const emojiCache=new Map();
function emojiGlyph(id){
 const glyph=normalizeEmoji(EMOJI[id]||id);if(!glyph)return null;
 if(emojiCache.has(glyph))return emojiCache.get(glyph);
 const canvas=make(640,640),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const font=n=>n+'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
 ctx.font=font(480);const width=ctx.measureText(glyph).width;if(width>560)ctx.font=font(Math.floor(480*560/width));
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(glyph,320,320);
 const data=ctx.getImageData(0,0,640,640).data;let x0=640,y0=640,x1=-1,y1=-1;
 for(let y=0;y<640;y++)for(let x=0;x<640;x++)if(data[(y*640+x)*4+3]>3){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 if(x1<x0)return null;
 const w=x1-x0+1,h=y1-y0+1,crop=make(w,h);crop.getContext('2d').drawImage(canvas,x0,y0,w,h,0,0,w,h);
 if(emojiCache.size>=24)emojiCache.delete(emojiCache.keys().next().value);
 emojiCache.set(glyph,crop);return crop;
}

function elementPath(c,id,r){
 if(id==='bird')return birdPath(c,r);
 c.beginPath();
 if(id==='heart'){
  c.moveTo(0,r*.92);c.bezierCurveTo(-r*.22,r*.62,-r,-r*.02,-r,-r*.40);c.bezierCurveTo(-r,-r*.99,-r*.31,-r*1.05,0,-r*.54);c.bezierCurveTo(r*.31,-r*1.05,r,-r*.99,r,-r*.40);c.bezierCurveTo(r,-r*.02,r*.22,r*.62,0,r*.92);
 }else if(id==='maple'){
  const points=[[0,-1],[-.16,-.59],[-.31,-.75],[-.28,-.22],[-.56,-.53],[-.61,-.28],[-.95,-.43],[-.80,-.06],[-.96,.03],[-.39,.40],[-.46,.60],[-.08,.52],[-.10,.99],[.015,.99],[.08,.52],[.46,.60],[.39,.40],[.96,.03],[.80,-.06],[.95,-.43],[.61,-.28],[.56,-.53],[.28,-.22],[.31,-.75],[.16,-.59]];
  points.forEach(([x,y],i)=>i?c.lineTo(x*r,y*r):c.moveTo(x*r,y*r));
 }else if(id==='swallow'){
  c.moveTo(0,-r*.51);c.lineTo(-r*.10,-r*.25);c.bezierCurveTo(-r*.37,-r*.54,-r*.76,-r*.83,-r,-r*.94);c.quadraticCurveTo(-r*.82,-r*.27,-r*.17,r*.16);c.lineTo(-r*.32,r*.95);c.lineTo(0,r*.53);c.lineTo(r*.32,r*.95);c.lineTo(r*.17,r*.16);c.quadraticCurveTo(r*.82,-r*.27,r,-r*.94);c.bezierCurveTo(r*.76,-r*.83,r*.37,-r*.54,r*.1,-r*.25);c.closePath();
 }else if(id==='butterfly'){
  c.moveTo(0,-r*.50);c.bezierCurveTo(-r*.40,-r*1.10,-r*1.09,-r*1.03,-r*.93,-r*.28);c.quadraticCurveTo(-r*.87,r*.02,-r*.55,r*.05);c.bezierCurveTo(-r*1.03,r*.38,-r*.50,r*1.09,-r*.10,r*.43);c.lineTo(0,r*.62);c.lineTo(r*.10,r*.43);c.bezierCurveTo(r*.50,r*1.09,r*1.03,r*.38,r*.55,r*.05);c.quadraticCurveTo(r*.87,r*.02,r*.93,-r*.28);c.bezierCurveTo(r*1.09,-r*1.03,r*.40,-r*1.10,0,-r*.50);
 }else if(id==='petal'){
  c.moveTo(-r*.07,r*.98);c.bezierCurveTo(-r*.94,r*.16,-r*.79,-r*.81,-r*.10,-r*.97);c.bezierCurveTo(r*.74,-r*1.04,r*.98,r*.09,-r*.07,r*.98);
 }else if(id==='blossom'){
  for(let i=0;i<100;i++){let a=-Math.PI/2+i*TAU/100,rad=r*(.78+.21*Math.cos((a+Math.PI/2)*5));i?c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):c.moveTo(Math.cos(a)*rad,Math.sin(a)*rad)}
 }else if(id==='star'){
  for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,rad=r*(i%2?.43:1);i?c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):c.moveTo(Math.cos(a)*rad,Math.sin(a)*rad)}
 }
 c.closePath();
}

function contour(c,q){
 if(q.element)return elementPath(c,q.element,q.r);
 if(q.type==='bird')return birdPath(c,q.r);
 if(q.vertices){c.beginPath();q.vertices.forEach(([x,y],i)=>i?c.lineTo(x*q.r,y*q.r):c.moveTo(x*q.r,y*q.r));c.closePath();return}
 shape(c,q.type,q.r);
}
function bezier(a,b,c,d,t){const u=1-t;return{x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y}}
const PHOTO_LAYOUTS=[
 {id:'top-left',name:'左上',x:.055,y:.05,w:.76,h:.76},
 {id:'top-right',name:'右上',x:.185,y:.05,w:.76,h:.76},
 {id:'bottom-left',name:'左下',x:.055,y:.19,w:.76,h:.76},
 {id:'bottom-right',name:'右下',x:.185,y:.19,w:.76,h:.76},
 {id:'center',name:'居中',x:.12,y:.12,w:.76,h:.76},
 {id:'full',name:'铺满',x:0,y:0,w:1,h:1},
 {id:'top-half',name:'上半幅',x:0,y:0,w:1,h:.5},
 {id:'bottom-half',name:'下半幅',x:0,y:.5,w:1,h:.5},
 {id:'left-half',name:'左半幅',x:0,y:0,w:.5,h:1},
 {id:'right-half',name:'右半幅',x:.5,y:0,w:.5,h:1}
];
const MOTIONS=[{id:'auto',name:'跟随元素'},{id:'float',name:'轻轻漂浮'},{id:'bounce',name:'弹性轻跳'},{id:'sway',name:'左右摇摆'},{id:'spin',name:'缓慢旋转'}];
function safePhotoBox(box){if(!box||!['x','y','w','h'].every(k=>Number.isFinite(box[k])))return null;const w=clamp(box.w,.05,1),h=clamp(box.h,.05,1);return{x:clamp(box.x,0,1-w),y:clamp(box.y,0,1-h),w,h}}
class Base {
 constructor(canvas){this.canvas=canvas;this.w=800;this.h=1000;this.maxLong=900;this.mode='migration';this.seed=240917;this.protect=[];this.strokes=[];this.region={x:.42,y:.49,rx:.35,ry:.27};this.path=null;this.density=.6;this.lower=null;this.lowerStyle='paper';this.edgeStyle='clean';this.sourceName='botanical';this.framePhoto=true;}
 async load(url,name='custom'){const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error('无法读取图片'));im.src=url});this.img=im;this.sourceName=name;this.w=Math.max(1,Math.round(this.maxLong*im.width/Math.max(im.width,im.height)));this.h=Math.max(1,Math.round(this.maxLong*im.height/Math.max(im.width,im.height)));this.canvas.width=this.w;this.canvas.height=this.h;this.src=make(this.w,this.h);this.src.getContext('2d').drawImage(im,0,0,this.w,this.h);this.layer=make(this.w,this.h);this.mask=make(this.w,this.h);this.pixel=this.src.getContext('2d',{willReadFrequently:true}).getImageData(0,0,this.w,this.h).data;this.prepare();}
 sourcePoint(q){let f=this.frame();return{x:(q.x-f.x)/f.s,y:(q.y-f.y)/f.s}}
 rasterMasks(){if(!this.src)return;this.allowMask=make(this.w,this.h);this.protectMask=make(this.w,this.h);let contexts={allow:this.allowMask.getContext('2d'),protect:this.protectMask.getContext('2d')};this.hasAllow=this.strokes.some(s=>s.target==='allow'&&!s.erase);for(const s of this.strokes){const c=contexts[s.target];if(!c||!s.points.length)continue;c.save();c.globalCompositeOperation=s.erase?'destination-out':'source-over';c.filter=s.softness?`blur(${s.softness*this.w}px)`:'none';c.lineCap='round';c.lineJoin='round';c.lineWidth=s.size*this.w;c.strokeStyle='white';c.fillStyle='white';c.beginPath();const start=s.points[0];c.moveTo(start.x*this.w,start.y*this.h);for(const q of s.points)c.lineTo(q.x*this.w,q.y*this.h);c.stroke();c.beginPath();c.arc(start.x*this.w,start.y*this.h,c.lineWidth/2,0,TAU);c.fill();c.restore();}for(const a of this.protect){const c=contexts.protect;c.beginPath();c.ellipse(a.x*this.w,a.y*this.h,a.rx*this.w,a.ry*this.h,0,0,TAU);c.fillStyle='white';c.fill()}this.allowData=contexts.allow.getImageData(0,0,this.w,this.h).data;this.protectData=contexts.protect.getImageData(0,0,this.w,this.h).data;}
 alphaAt(data,x,y){if(!data||x<0||y<0||x>=this.w||y>=this.h)return 0;return data[(Math.floor(y)*this.w+Math.floor(x))*4+3]/255}
 lum(x,y){let i=(Math.floor(clamp(y,0,this.h-1))*this.w+Math.floor(clamp(x,0,this.w-1)))*4;return(.2126*this.pixel[i]+.7152*this.pixel[i+1]+.0722*this.pixel[i+2])/255;}
 isProtected(x,y,pad=0){if(this.protect.some(a=>((x/this.w-a.x)/(a.rx+pad/this.w))**2+((y/this.h-a.y)/(a.ry+pad/this.h))**2<1))return true;return [[0,0],[pad,0],[-pad,0],[0,pad],[0,-pad]].some(([a,b])=>this.alphaAt(this.protectData,x+a,y+b)>.05)}
 eligible(q){if(this.isProtected(q.x,q.y,q.r))return false;return !this.hasAllow||[[0,0],[q.r,0],[-q.r,0],[0,q.r],[0,-q.r]].every(([a,b])=>this.alphaAt(this.allowData,q.x+a,q.y+b)>.85)}
 prepare(){if(!this.src)return;this.rasterMasks();let r=0,g=0,b=0,n=0;for(let i=0;i<this.pixel.length;i+=120){r+=this.pixel[i];g+=this.pixel[i+1];b+=this.pixel[i+2];n++}this.sampleColor=`rgb(${Math.round(r/n*.5)},${Math.round(g/n*.5)},${Math.round(b/n*.5)})`;this.restored=make(this.w,this.h);const c=this.restored.getContext('2d');c.drawImage(this.src,0,0);c.globalCompositeOperation='destination-in';c.drawImage(this.protectMask,0,0);}
 restoreConfig(c){for(const k of ['seed','region','path','density','lowerStyle','edgeStyle','framePhoto','strokes'])if(c[k]!==undefined)this[k]=structuredClone(c[k]);if(c.protection)this.protect=structuredClone(c.protection);this.prepare();}
 config(p){return{schema:8,mode:'migration',seed:this.seed,progress:p,sourceName:this.sourceName,region:structuredClone(this.region),path:structuredClone(this.path),protection:structuredClone(this.protect),strokes:structuredClone(this.strokes),density:this.density,lowerStyle:this.lowerStyle,edgeStyle:this.edgeStyle,framePhoto:this.framePhoto};}
}
const extra=['migrationExitScale','photoLayout','photoBox','photoFit','migrationMotion','migrationEmoji','migrationFinish','emojiBlend','migrationElement','migrationSize','pathBend','flockSpread','wingSpeed'];
class Renderer extends Base {
 constructor(c){super(c);this.migrationExitScale=1.4;this.photoLayout='bottom-left';this.photoBox=null;this.photoFit='cover';this.migrationMotion='auto';this.migrationEmoji='🦋';this.migrationFinish='emoji';this.emojiBlend=1;this.migrationElement='butterfly';this.migrationSize=1;this.pathBend=.32;this.flockSpread=.55;this.wingSpeed=1;this.focusSprites=new Map();}
 photoBounds(){
  if(this.mode!=='migration'||this.framePhoto===false)return{x:0,y:0,w:1,h:1};
  const b=this.photoLayout==='custom'?safePhotoBox(this.photoBox):PHOTO_LAYOUTS.find(b=>b.id===this.photoLayout);
  const v=b||PHOTO_LAYOUTS[2];return{x:v.x,y:v.y,w:v.w,h:v.h};
 }
 frame(){
  if(this.mode!=='migration')return{x:0,y:0,s:1};
  const b=this.photoBounds(),s=this.photoFit==='contain'?Math.min(b.w,b.h):Math.max(b.w,b.h);
  return{x:b.x+(b.w-s)/2,y:b.y+(b.h-s)/2,s,clip:Math.abs(b.w-b.h)>.000001?b:null};
 }
 clipPhoto(c){const f=this.frame(),b=f.clip;if(b){c.beginPath();c.rect((b.x-f.x)*this.w/f.s,(b.y-f.y)*this.h/f.s,b.w*this.w/f.s,b.h*this.h/f.s);c.clip()}}
 eligible(q){
  if(!super.eligible(q))return false;
  if(this.mode==='migration'){const f=this.frame(),b=f.clip;if(b){const x=f.x+q.x/this.w*f.s,y=f.y+q.y/this.h*f.s,rx=q.r/this.w*f.s,ry=q.r/this.h*f.s;if(x-rx<b.x||x+rx>b.x+b.w||y-ry<b.y||y+ry>b.y+b.h)return false}}
  return true;
 }
 setPhotoLayout(id){const b=PHOTO_LAYOUTS.find(b=>b.id===id);if(!b)return;this.photoLayout=id;this.photoBox=null;this.framePhoto=id!=='full';this.path=null;this.prepare()}
 migrationPath(){
  if(this.path)return this.path;
  const start={x:this.region.x,y:this.region.y},id=this.framePhoto===false?'full':this.photoLayout;
  const corner={'bottom-left':{x:1.08,y:-.12},'bottom-right':{x:-.08,y:-.12},'top-left':{x:1.08,y:1.12},'top-right':{x:-.08,y:1.12},full:{x:1.08,y:-.12}};
  if(corner[id])return[start,corner[id]];
  const b=this.photoBounds(),f=this.frame(),target={'top-half':{x:.74,y:.9},'bottom-half':{x:.74,y:.1},'left-half':{x:.88,y:.2},'right-half':{x:.12,y:.2},center:{x:.94,y:.03}}[id]||{x:b.x+b.w/2>.5?.08:.92,y:b.y+b.h/2>.5?.05:.95};
  return[start,{x:(target.x-f.x)/f.s,y:(target.y-f.y)/f.s}];
 }
 prepare(){super.prepare();if(!this.src)return;this.focusSprites=new Map();this.prepareBirds();}
 currentEmoji(){return normalizeEmoji(this.migrationEmoji)||EMOJI[this.migrationElement]||EMOJI.maple}
 prepareBirds(){
  if(this.migrationFinish==='emoji')this.migrationElement=emojiElement(this.currentEmoji());
  const random=rng(this.seed+208),pts=[],w=this.w,h=this.h,goal=Math.round(this.migrationFinish==='emoji'?8+this.density*12:10+this.density*23);
  for(let i=0;i<6000&&pts.length<goal;i++){
   const a=random()*TAU,d=Math.sqrt(random()),x=(this.region.x+Math.cos(a)*this.region.rx*d)*w,y=(this.region.y+Math.sin(a)*this.region.ry*d)*h;
   const r=(18+random()*16)*w/800*this.migrationSize*(this.migrationFinish==='emoji'?1.3:1),q={x,y,r,a:0,type:'bird',element:this.migrationElement,emoji:this.migrationFinish==='emoji'?this.currentEmoji():null,phase:random()*TAU,id:pts.length};
   if(this.lum(x,y)>.87||!this.eligible(q)||x<r||y<r||x>w-r||y>h-r)continue;
   if(pts.every(z=>Math.hypot(z.x-x,z.y-y)>(z.r+r)*1.22))pts.push(q);
  }
  const path=this.migrationPath(),dx=path[1].x-path[0].x,dy=path[1].y-path[0].y;
  pts.sort((a,b)=>(b.x/w*dx+b.y/h*dy)-(a.x/w*dx+a.y/h*dy));
  pts.forEach((q,i)=>{q.id=i;q.delay=(i/Math.max(1,pts.length-1))*.33;q.lane=((i%5)-2)/2;q.depth=.7+.3*random()});this.focusBirds=pts;
 }
 spriteData(q){
  const key=this.mode+q.id;if(this.focusSprites.has(key))return this.focusSprites.get(key);
  const pad=Math.ceil(q.r*1.5)+3,size=pad*2,mask=make(size,size),mc=mask.getContext('2d');
  let emoji=null;if(this.mode==='migration'&&this.migrationFinish==='emoji'&&q.emoji){
   const glyph=emojiGlyph(q.emoji);if(glyph){emoji=make(size,size);const ec=emoji.getContext('2d'),k=q.r*2/Math.max(glyph.width,glyph.height),gw=glyph.width*k,gh=glyph.height*k;ec.drawImage(glyph,pad-gw/2,pad-gh/2,gw,gh);mc.drawImage(emoji,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle='white';mc.fillRect(0,0,size,size);mc.globalCompositeOperation='source-over'}
  }
  if(!emoji){mc.translate(pad,pad);mc.rotate(q.a||0);contour(mc,q);mc.fillStyle='white';mc.fill();mc.setTransform(1,0,0,1,0,0);} 
  const texture=make(size,size),tc=texture.getContext('2d');tc.drawImage(this.src,pad-q.x,pad-q.y);tc.globalCompositeOperation='destination-in';tc.drawImage(mask,0,0);
  const value={mask,texture,pad,emoji,blend:emoji?make(size,size):null};this.focusSprites.set(key,value);return value;
 }
 cut(m,q,alpha=1){const s=this.spriteData(q);m.save();m.globalAlpha=alpha;m.drawImage(s.mask,q.x-s.pad,q.y-s.pad);m.restore()}
 paint(c,part,time,transparent){
  const {q,dx,dy,rotation=0,scale=1,lift=1}=part,s=this.spriteData(q);let surface=s.texture;
  if(s.emoji){const reveal=smooth(((part.travel??0)-.06)/.72)*this.emojiBlend,bc=s.blend.getContext('2d');bc.clearRect(0,0,s.blend.width,s.blend.height);bc.globalCompositeOperation='source-over';bc.globalAlpha=1-reveal;bc.drawImage(s.texture,0,0);bc.globalCompositeOperation='lighter';bc.globalAlpha=reveal;bc.drawImage(s.emoji,0,0);bc.globalAlpha=1;bc.globalCompositeOperation='source-over';surface=s.blend;}
  c.save();c.translate(q.x+dx,q.y+dy);c.rotate(rotation);c.scale(scale*(part.sx??1),scale*(part.sy??1));
  if(!transparent&&lift>.01){c.shadowColor=`rgba(15,30,25,${clamp(lift)*.23})`;c.shadowBlur=q.r*.17;c.shadowOffsetX=q.r*.06;c.shadowOffsetY=q.r*.09;}
  if(this.mode==='migration'&&this.migrationMotion==='auto'&&lift>.04&&['bird','swallow','butterfly'].includes(q.element||'bird')){
   const flap=Math.sin(time*TAU*(1.3+this.wingSpeed*1.2)+q.phase),fold=1-.42*lift*(.5+.5*flap),angle=.08*lift*flap;
   for(const sign of [-1,1]){c.save();c.rotate(sign*angle);if(q.element==='butterfly')c.scale(fold,1);else c.scale(1,fold);c.beginPath();c.rect(sign<0?-s.pad:-q.r*.10,-s.pad,sign<0?s.pad+q.r*.10:s.pad+q.r*.10,s.pad*2);c.clip();c.drawImage(surface,-s.pad,-s.pad);c.restore()}
  }else c.drawImage(surface,-s.pad,-s.pad);c.restore();
 }
 flockParts(p,time,m){
  const path=this.migrationPath(),w=this.w,h=this.h,dx=path[1].x-path[0].x,dy=path[1].y-path[0].y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  for(const q of this.focusBirds){if(!this.eligible(q))continue;let t=clamp((p-q.delay)/.62);if(t<=0)continue;let v=smooth(t),start={x:q.x/w,y:q.y/h};
   const fan=q.lane*this.flockSpread*.14,end={x:path[1].x-dx*(q.delay/.33)*.42+nx*fan+(q.depth-.85)*.18,y:path[1].y-dy*(q.delay/.33)*.42+ny*fan+(q.depth-.85)*.12};
   const b={x:start.x+dx*.24+nx*this.pathBend*.38,y:start.y+dy*.24+ny*this.pathBend*.38};
   const d={x:end.x-dx*.22+nx*this.pathBend*.30,y:end.y-dy*.22+ny*this.pathBend*.30};
   const pt=bezier(start,b,d,end,v),next=bezier(start,b,d,end,Math.min(1,v+.008)),previous=bezier(start,b,d,end,Math.max(0,v-.008));
   const rotation=clamp(Math.atan2((next.y-previous.y)*h,(next.x-previous.x)*w)+Math.PI/2,-1.25,1.25)*smooth(v*3);
   const element=q.element||'bird',speed=this.wingSpeed,osc=Math.sin(time*(1+speed*2)+q.phase),lift=smooth(t*4);let rx=rotation,ox=0,oy=0,sx=1,sy=1;
   if(element==='heart'){rx=osc*.12*lift;oy=osc*h*.009*lift;sx=sy=1+Math.sin(time*(1+speed*2.6)+q.phase)*.05*lift}
   else if(element==='maple'){rx=(osc*.7+v*.9)*lift;ox=Math.sin(v*6+q.phase)*w*.025*lift;oy=Math.sin(v*7+q.phase)*h*.013*lift;sx=1-(.5+.5*osc)*.28*lift}
   else if(element==='petal'){rx=(Math.sin(time*(.6+speed)+q.phase)*.5+v*.8)*lift;oy=osc*h*.01*lift;sx=1-(.5+.5*osc)*.22*lift}
   else if(element==='zany'){const z=Math.sin(time*(2+speed*3)+q.phase);rx=z*.2*lift;oy=-Math.abs(z)*h*.012*lift;sy=1+z*.05*lift;sx=1/sy}
   else if(element==='emoji'){rx=Math.sin(time*(.4+speed*.5)+q.phase)*.14*lift;oy=osc*h*.005*lift}
   else if(element==='blossom'){rx=(Math.sin(time*(.4+speed*.5)+q.phase)*.20+v*.20)*lift;oy=osc*h*.005*lift}
   else if(element==='star'){rx=(time*(.12+speed*.35)+q.phase*.15)*lift}
   else if(element==='butterfly'){rx=rotation*.45+osc*.12*lift;oy=osc*h*.012*lift}
   if(this.migrationMotion!=='auto'){
    const a=Math.sin(time*speed*2.2+q.phase);rx=0;ox=oy=0;sx=sy=1;
    if(this.migrationMotion==='float'){oy=a*h*.009*lift;rx=a*.08*lift}
    else if(this.migrationMotion==='bounce'){oy=-Math.abs(a)*h*.021*lift;sy=1+a*.055*lift;sx=1/sy}
    else if(this.migrationMotion==='sway'){rx=a*.4*lift;ox=a*w*.012*lift}
    else if(this.migrationMotion==='spin')rx=(time*speed*.75+q.phase*.12)*lift;
   }
   this.cut(m,q);this.fragments.push({q,dx:(pt.x-start.x)*w+ox,dy:(pt.y-start.y)*h+oy,rotation:rx,scale:this.migrationFinish==='emoji'?mix(1,this.migrationExitScale,smooth(v)):1-v*(.22+.15*q.depth),sx,sy,lift,travel:v});
  }
 }
 render(p=.6,time=0,options={}){
  if(!this.src)return;const {transparent=false,original=false}=options,w=this.w,h=this.h,c=this.canvas.getContext('2d'),m=this.mask.getContext('2d'),l=this.layer.getContext('2d'),f=this.frame();
  c.clearRect(0,0,w,h);m.clearRect(0,0,w,h);this.fragments=[];
  const plain=original||p<=0;
  if(!plain){this.flockParts(p,time,m);
   if(this.hasAllow){m.globalCompositeOperation='destination-in';m.drawImage(this.allowMask,0,0)}m.globalCompositeOperation='destination-out';m.drawImage(this.protectMask,0,0);m.globalCompositeOperation='source-over';}
  if(!transparent){c.fillStyle='#f0eadf';c.fillRect(0,0,w,h)}c.save();c.translate(f.x*w,f.y*h);c.scale(f.s,f.s);c.save();this.clipPhoto(c);
  if(!transparent){if(this.lower){let k=Math.max(w/this.lower.width,h/this.lower.height);c.drawImage(this.lower,(w-this.lower.width*k)/2,(h-this.lower.height*k)/2,this.lower.width*k,this.lower.height*k)}else{c.fillStyle=this.lowerStyle==='sample'?this.sampleColor:this.lowerStyle==='dark'?'#182e2d':'#eee8dc';c.fillRect(0,0,w,h)}}
  l.globalCompositeOperation='source-over';l.clearRect(0,0,w,h);l.drawImage(this.src,0,0);if(!plain){l.globalCompositeOperation='destination-out';l.drawImage(this.mask,0,0);l.globalCompositeOperation='source-over'}
  c.save();if(this.edgeStyle==='paper'&&!transparent&&!plain){c.shadowColor='rgba(65,44,23,.25)';c.shadowBlur=w*.003;c.shadowOffsetY=w*.001}c.drawImage(this.layer,0,0);c.restore();
  c.restore();
  for(const part of this.fragments)this.paint(c,part,time,transparent);
  if(!plain&&(this.strokes.some(s=>s.target==='protect')||this.protect.length)){c.save();this.clipPhoto(c);c.drawImage(this.restored,0,0);c.restore()}
  c.restore();return this.canvas;
 }
 restoreConfig(config){
  if(config.migrationEmoji&&!normalizeEmoji(config.migrationEmoji))throw Error('项目中的 Emoji 不在当前目录中，请使用一个完整表情');
  this.migrationElement=ELEMENTS.some(x=>x.id===config.migrationElement)?config.migrationElement:'bird';
  this.migrationSize=Number.isFinite(config.migrationSize)?clamp(config.migrationSize,.65,1.5):1;
  const safe={...config,migrationExitScale:Number.isFinite(config.migrationExitScale)?clamp(config.migrationExitScale,.6,2.5):1.4,photoLayout:PHOTO_LAYOUTS.some(b=>b.id===config.photoLayout)||config.photoLayout==='custom'?config.photoLayout:config.framePhoto===false?'full':'bottom-left',photoBox:safePhotoBox(config.photoBox),photoFit:config.photoFit==='contain'?'contain':'cover',migrationMotion:MOTIONS.some(m=>m.id===config.migrationMotion)?config.migrationMotion:'auto',migrationEmoji:normalizeEmoji(config.migrationEmoji)||'',migrationElement:this.migrationElement,migrationSize:this.migrationSize,migrationFinish:config.migrationFinish==='emoji'?'emoji':'texture',emojiBlend:Number.isFinite(config.emojiBlend)?clamp(config.emojiBlend):1};
  if(safe.migrationFinish==='emoji')safe.migrationElement=emojiElement(safe.migrationEmoji||EMOJI[safe.migrationElement]||EMOJI.maple);
  else if(['emoji','zany'].includes(safe.migrationElement))safe.migrationElement='bird';
  for(const key of extra)if(safe[key]!==undefined)this[key]=structuredClone(safe[key]);
  super.restoreConfig(safe);
 }

 config(p){const c={...super.config(p),schema:8,version:'1.0.0'};for(const key of extra)c[key]=structuredClone(this[key]??null);return c;}}
window.Punch={make,rng,clamp,Renderer,photoLayouts:PHOTO_LAYOUTS,migrationMotions:MOTIONS,normalizeEmoji,emojiInfo,emojiElement,emojiCatalog:EMOJI_CATALOG,emojiCharacters:EMOJI,emojiGlyph,migrationElements:ELEMENTS,drawMigrationShape:elementPath};
})();
