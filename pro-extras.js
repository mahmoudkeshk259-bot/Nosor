/* pro-extras.js v1 — نظرة 360° في بروفايل المندوب + بطاقة أداء PNG + قياس أثر رسائل واتساب + شارة تنبيهات القائمة.
   يُحمَّل بعد السكربت الرئيسي وبعد wa-center.js. لا يغيّر البيانات (قراءة فقط). */
(function(){
const N=x=>{const n=typeof num==='function'?num(x):Number(x);return n==null||isNaN(n)?0:n};
const oid=(m,id)=>(cumAll(m).out[String(id)]||{o:0}).o;
function pxStats(r){const ms=cumMonths(),m=ms[ms.length-1];if(!m)return null;const C=cumAll(m),o=C.out[String(r.riderId)],c=o?o.o:0,t=tgt(r),e=new Date(C.last),dim=new Date(e.getFullYear(),e.getMonth()+1,0).getDate(),d=e.getDate()||1;
const rank=Object.values(C.out).filter(x=>x.o>c).length+1,tot=Object.keys(C.out).length,pe=db.riders.filter(x=>x.city===r.city&&C.out[String(x.riderId)]);
return{m,c,t,pct:t?Math.round(c/t*100):null,proj:Math.round(c/d*dim),rank,tot,avg:pe.length?Math.round(pe.reduce((a,x)=>a+C.out[String(x.riderId)].o,0)/pe.length):null}}
function pxBlock(r){const s=pxStats(r),ms=cumMonths().slice(-6),t=tgt(r),v=ms.map(m=>oid(m,r.riderId)),mx=Math.max(1,t,...v);
const bars=ms.map((m,i)=>`<div style="flex:1;text-align:center"><div style="height:60px;display:flex;align-items:flex-end;justify-content:center"><i style="display:block;width:70%;height:${Math.max(3,v[i]/mx*60)}px;border-radius:5px 5px 0 0;background:${t&&v[i]>=t?'#3ecf8e':'#2f6bff'}"></i></div><div class="m" style="font-size:11px">${m.slice(5)}<br>${v[i]}</div></div>`).join('');
const lg=(db.cfg.waLog||[]).filter(x=>x.rid===r.id).slice(-3).reverse().map(x=>`<div class="m">💬 ${new Date(x.t).toLocaleDateString('ar-SA')} — ${esc(x.type)}</div>`).join('');
const tk=db.tickets.filter(x=>x.rid===r.id&&x.status!=='مغلقة').length,dx=db.docs.filter(d=>d.rid===r.id&&docStatus(d)[1]!=='ok').length;
return`<div class="c"><b>📌 نظرة 360°</b>${s?`<div class="row" style="margin-top:6px"><div><div class="m">المنجز</div><b>${s.c}</b> / ${s.t||'—'}${s.pct!=null?' ('+s.pct+'%)':''}</div><div><div class="m">المتوقع نهاية الشهر</div><b class="${s.t&&s.proj>=s.t?'ok':'wn'}">${s.proj}</b></div><div><div class="m">الترتيب</div><b>${s.rank}</b> من ${s.tot}</div><div><div class="m">متوسط المنطقة</div><b>${s.avg==null?'—':s.avg}</b></div></div>`:'<div class="m">لا توجد بيانات أداء مستوردة</div>'}<div style="display:flex;gap:6px;align-items:flex-end;margin:8px 0">${bars}</div><div class="m">بلاغات مفتوحة: ${tk} · مستندات تحتاج انتباه: ${dx}</div>${lg}<div class="row" style="margin-top:8px"><button onclick="pxCard('${r.id}')">🪪 بطاقة الأداء (صورة)</button>${r.wa&&typeof waQuick==='function'?`<button onclick="waQuick('${r.id}')">💬 رسالة سريعة</button>`:''}</div></div>`}
const P=window.prof;
if(typeof P==='function')window.prof=function(id,t){P.apply(this,arguments);try{if(tab!=='data')return;const r=db.riders.find(x=>x.id===id),rows=$('#mc').querySelectorAll(':scope>.row');
if(r&&rows.length)rows[rows.length-1].insertAdjacentHTML('beforebegin',pxBlock(r))}catch(e){}};
window.pxCard=async function(id){const r=db.riders.find(x=>x.id===id),s=r&&pxStats(r);if(!s)return toast('لا توجد بيانات أداء');
try{await document.fonts.load('700 40px Cairo')}catch(e){}
const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#050d24');g.addColorStop(1,'#154099');x.fillStyle=g;x.fillRect(0,0,W,H);
x.direction='rtl';x.textAlign='right';const T=(s0,y,z,w,col)=>{x.font=(w||400)+' '+z+'px Cairo,Tahoma,sans-serif';x.fillStyle=col||'#fff';x.fillText(s0,W-80,y)},R=(a,b,w,h,col)=>{x.fillStyle=col;x.beginPath();x.roundRect?x.roundRect(a,b,w,h,18):x.rect(a,b,w,h);x.fill()};
T((db.cfg.company||'نسور التوصيل')+' 🦅',120,46,700,'#cfe0ff');T(r.nameAr,270,78,700);T('Rider ID: '+r.riderId+'  ·  '+s.m,340,36,400,'#9fb2d4');
const p=Math.min(1,(s.pct||0)/100),bw=W-160;R(80,430,bw,40,'#ffffff22');if(p>0)R(80+bw*(1-p),430,bw*p,40,s.t&&s.c>=s.t?'#3ecf8e':'#5b8dff');
T((s.pct==null?'—':s.pct+'%'),560,110,700,s.t&&s.c>=s.t?'#3ecf8e':'#fff');T('نسبة تحقيق التارجت',620,36,400,'#9fb2d4');
[['الطلبات المنجزة',s.c+' / '+(s.t||'—')],['المتوقع نهاية الشهر',s.proj],['ترتيبك بين المناديب',s.rank+' من '+s.tot],['متوسط المنطقة',s.avg==null?'—':s.avg]].forEach((a,i)=>{const y=730+i*110;R(80,y-60,bw,90,'#ffffff12');T(a[0],y,36,400,'#cfe0ff');x.textAlign='left';x.font='700 44px Cairo,Tahoma,sans-serif';x.fillStyle='#fff';x.fillText(String(a[1]),110,y+2);x.textAlign='right'});
T('شكرًا لجهدك وتميّزك 💙',1250,40,700,'#cfe0ff');T(new Date().toLocaleDateString('ar-SA'),1305,28,400,'#9fb2d4');
cv.toBlob(async b=>{const f=new File([b],'card_'+r.riderId+'.png',{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:r.nameAr});return}}catch(e){if(e&&e.name==='AbortError')return}saveFile(f.name,b)},'image/png')};
function pxImpact(){const D={},out={};db.snaps.forEach(s=>{if(s.from!==s.to)return;(D[s.rid]=D[s.rid]||{})[s.from]=N(s.v['Completed Deliveries'])});
(db.cfg.waLog||[]).forEach(x=>{const r=db.riders.find(y=>y.id===x.rid),d=r&&D[String(r.riderId)];if(!d)return;const t0=new Date(new Date(x.t).toISOString().slice(0,10)+'T00:00:00Z').getTime(),
avg=k=>{let a=0,n=0;for(let i=1;i<=3;i++){const v=d[new Date(t0+k*i*864e5).toISOString().slice(0,10)];if(v!=null){a+=v;n++}}return n?a/n:null},b=avg(-1),f=avg(1);if(b==null||f==null)return;const o=out[x.tpl]||(out[x.tpl]={n:0,b:0,a:0});o.n++;o.b+=b;o.a+=f});return out}
const L0=window.waLg;
if(typeof L0==='function')window.waLg=function(){const I=pxImpact(),N0=Object.fromEntries(waTpl().map(x=>[x.id,x.n]));
return`<div class="c"><b>📈 أثر الرسائل</b><div class="m">متوسط الطلبات اليومي: 3 أيام قبل ← 3 أيام بعد الرسالة</div>${Object.keys(I).map(t=>{const o=I[t],b=o.b/o.n,a=o.a/o.n,p=b?Math.round((a-b)/b*100):null;return`<div class="li"><div class="n"><b>${esc(N0[t]||t)}</b><span class="m">${o.n} رسالة</span></div><span>${b.toFixed(1)} ← ${a.toFixed(1)}</span><span class="${p>=0?'ok':'er'}">${p==null?'':(p>0?'+':'')+p+'%'}</span></div>`}).join('')||'<div class="m">يحتاج تقارير يومية مستوردة بعد الإرسال لحساب الأثر</div>'}</div>`+L0()};
const NV=window.nav;
if(typeof NV==='function'&&typeof waAlerts==='function')window.nav=function(){NV();try{const n=waAlerts().filter(a=>a.s==='c'&&!a.rec).length,b=[...document.querySelectorAll('#nav button')].find(x=>/'wa'/.test(x.getAttribute('onclick')||''));if(n&&b)b.insertAdjacentHTML('beforeend','<span class="bd">'+n+'</span>')}catch(e){}};
try{render()}catch(e){}
})();
