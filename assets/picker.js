/* Offline Unicode catalog picker. The renderer receives one canonical sequence. */
(() => {
'use strict';
const {emojiCatalog:catalog,normalizeEmoji,emojiInfo}=Punch;
const strip=s=>s.replace(/[\uFE0E\uFE0F]/g,'');
const rows=catalog.entries.map(e=>({glyph:e[0],name:e[1],group:e[3],search:(e[1]+' '+e[2]+' '+e[4]).toLowerCase()}));
const storeKey='migration-studio-recent-emoji';
let recent=[];try{const saved=JSON.parse(localStorage.getItem(storeKey)||'[]');if(Array.isArray(saved))recent=[...new Set(saved.map(normalizeEmoji).filter(Boolean))].slice(0,16)}catch{}
const dialog=document.createElement('dialog');dialog.id='emojiPicker';dialog.className='emoji-dialog';dialog.setAttribute('aria-labelledby','emojiPickerTitle');
dialog.innerHTML=`<div class="emoji-dialog-head"><div><p class="eyebrow">CHOOSE YOUR EMOJI</p><h2 id="emojiPickerTitle">让哪一种表情飞走？</h2></div><button type="button" id="closeEmoji" class="emoji-close" aria-label="关闭 Emoji 选择器">×</button></div>
<div class="emoji-search-row"><input type="search" id="emojiSearch" placeholder="搜索中文 / English，或粘贴 Emoji" aria-label="搜索或粘贴 Emoji" autocomplete="off"><select id="emojiCategory" aria-label="Emoji 分类"><option value="all">全部分类</option></select></div>
<div class="emoji-recent"><span id="emojiRecentLabel">最近使用</span><div id="emojiRecent"></div></div>
<div class="emoji-result-heading"><span id="emojiResultCount" role="status" aria-live="polite"></span><span>方向键选择 · Enter 使用</span></div>
<div class="emoji-scroll"><div id="emojiResults" class="emoji-results" role="group" aria-label="Emoji 搜索结果"></div><p id="emojiEmpty" class="emoji-empty" hidden></p><button type="button" id="emojiMore" class="btn full">显示更多</button></div>
<div class="emoji-picker-foot"><span class="native-emoji" id="emojiPickerCurrent"></span><span id="emojiPickerName"></span></div>
<p class="emoji-font-note">包含 ${rows.length.toLocaleString('zh-CN')} 项与肤色、组合变体。外观由系统字体决定，部分新表情可能暂未支持。每次选择一个完整 Emoji。</p>`;
document.body.appendChild(dialog);
const $=id=>document.getElementById(id),search=$('emojiSearch'),category=$('emojiCategory'),grid=$('emojiResults');
catalog.groups.forEach((name,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=name;category.appendChild(option)});
let callback=null,selected='',filtered=[],limit=120,returnFocus=null;
Punch.rememberEmoji=value=>{const canonical=normalizeEmoji(value);if(!canonical)return;recent=[canonical,...recent.filter(x=>x!==canonical)].slice(0,16);try{localStorage.setItem(storeKey,JSON.stringify(recent))}catch{}};
function select(glyph){
 const canonical=normalizeEmoji(glyph);if(!canonical)return;
 Punch.rememberEmoji(canonical);
 dialog.close();callback?.(canonical);
 requestAnimationFrame(()=>document.getElementById('openEmoji')?.focus({preventScroll:true}));
}
function tile(glyph,compact=false){
 const info=emojiInfo(glyph),button=document.createElement('button');button.type='button';button.className='emoji-tile native-emoji';button.textContent=glyph;
 button.dataset.emoji=glyph;button.title=info.name+' / '+info.english;button.setAttribute('aria-label',info.name+' '+glyph);button.setAttribute('aria-pressed',String(glyph===selected));
 button.onclick=()=>select(glyph);if(!compact)button.tabIndex=-1;return button;
}
function updateRecent(){const holder=$('emojiRecent');holder.replaceChildren();$('emojiRecentLabel').textContent=recent.length?'最近使用':'灵感推荐';(recent.length?recent:['🍁','🦋','❤️','🤪','🌈','🪼','🐈','🪐']).forEach(e=>holder.appendChild(tile(e,true)));}
function render(){
 const raw=search.value.trim(),exact=normalizeEmoji(raw),query=raw.toLowerCase(),terms=query.split(/\s+/).filter(Boolean);
 const mixedEmoji=!exact&&/[\p{Extended_Pictographic}\p{Regional_Indicator}\u20e3]/u.test(raw);
 filtered=rows.filter(e=>(exact?e.glyph===exact:!mixedEmoji&&terms.every(t=>e.search.includes(t)||strip(e.glyph)===strip(t)))&&(category.value==='all'||e.group===+category.value));
 grid.replaceChildren();const visible=filtered.slice(0,limit);visible.forEach(e=>grid.appendChild(tile(e.glyph)));
 const active=grid.querySelector('[aria-pressed="true"]')||grid.firstElementChild;if(active)active.tabIndex=0;
 $('emojiResultCount').textContent=filtered.length?`${filtered.length.toLocaleString('zh-CN')} 个结果 · 已显示 ${visible.length}`:'没有找到匹配项';
 $('emojiEmpty').hidden=!!filtered.length;$('emojiEmpty').textContent=mixedEmoji?'请一次粘贴一个完整 Emoji；也可以输入中文或英文名称搜索。':category.value!=='all'?'这个分类中没有匹配项，试试「全部分类」。':'试试其他关键词，例如「花」「猫」「heart」，或直接粘贴一个 Emoji。';
 $('emojiMore').hidden=visible.length>=filtered.length;
}
search.addEventListener('input',()=>{limit=120;if(normalizeEmoji(search.value))category.value='all';render();dialog.querySelector('.emoji-scroll').scrollTop=0});
search.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Enter'&&(normalizeEmoji(search.value)||filtered.length===1)&&filtered.length){e.preventDefault();select(filtered[0].glyph)}else if(e.key==='ArrowDown'){e.preventDefault();grid.querySelector('[tabindex="0"]')?.focus()}});
category.onchange=()=>{limit=120;render();dialog.querySelector('.emoji-scroll').scrollTop=0};
$('emojiMore').onclick=()=>{const old=limit;limit+=120;render();grid.children[old]?.focus()};
grid.onkeydown=e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];if(!keys.includes(e.key))return;const buttons=[...grid.children],index=buttons.indexOf(document.activeElement);if(index<0)return;e.preventDefault();const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,index+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns}[e.key])));buttons.forEach(b=>b.tabIndex=-1);buttons[next].tabIndex=0;buttons[next].focus()};
$('closeEmoji').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
dialog.addEventListener('close',()=>{document.body.classList.remove('emoji-dialog-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})});
Punch.openEmojiPicker=(current,onSelect)=>{
 selected=normalizeEmoji(current)||'🍁';callback=onSelect;returnFocus=document.activeElement;search.value='';category.value='all';limit=120;
 $('emojiPickerCurrent').textContent=selected;$('emojiPickerName').textContent='当前：'+emojiInfo(selected).name;
 updateRecent();render();dialog.showModal();document.body.classList.add('emoji-dialog-open');dialog.querySelector('.emoji-scroll').scrollTop=0;search.focus();
};
})();
