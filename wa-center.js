/* wa-center.js v2 (عربي + English) — مركز رسائل واتساب التنبيهية لتطبيق نسور
   يُحمَّل قبل السكربت الرئيسي (apply-wa-center.py يركّبه). لا يغيّر هيكل البيانات:
   القوالب والسجل داخل db.cfg (waTpl, waLog, waCool, company, manager) فتتزامن مع Firestore تلقائيًا.
   يعتمد على دوال التطبيق: db, cumMonths, cumAll, tgt, stt, today, esc, modal, closeM, toast, save, render, $, riderForm */
const WA_DEF=[
{id:'pace',n:'تأخر عن التارجت',t:'السلام عليكم {الاسم} 👋\nأنجزت {الطلبات} من {التارجت} ({نسبة_الإنجاز}%). المتبقي {المتبقي} والمطلوب يوميًا ≈ {المطلوب_يوميا}.\nنقدر نساعدك بأي شيء؟ — {الشركة}',e:'Hello {الاسم} 👋\nYou completed {الطلبات} of {التارجت} ({نسبة_الإنجاز}%). Remaining: {المتبقي}, required daily ≈ {المطلوب_يوميا}.\nHow can we help? — {الشركة}',ne:'Behind target'},
{id:'win',n:'تشجيع (حقق التارجت)',t:'ما شاء الله {الاسم} 🔥 حققت تارجتك ({الطلبات}/{التارجت}). شكرًا على جهدك وتميّزك — {الشركة}',e:'Great job {الاسم} 🔥 You hit your target ({الطلبات}/{التارجت}). Thank you for your effort and excellence — {الشركة}',ne:'Encouragement (target hit)'},
{id:'doc',n:'مستند ينتهي',t:'السلام عليكم {الاسم}، تنبيه: {المستند} {الحالة}. نرجو التجديد وإرسال صورة المستند — {الشركة}',e:'Hello {الاسم}, reminder: your {المستند} {الحالة}. Please renew it and send us a photo — {الشركة}',ne:'Document expiring'},
{id:'ticket',n:'متابعة بلاغ',t:'السلام عليكم {الاسم}، بخصوص البلاغ #{رقم_البلاغ}: نحتاج تحديثًا منك لإغلاقه. شكرًا — {الشركة}',e:'Hello {الاسم}, regarding ticket #{رقم_البلاغ}: we need an update from you to close it. Thank you — {الشركة}',ne:'Ticket follow-up'},
{id:'task',n:'مهمة متأخرة',t:'السلام عليكم {الاسم}، تذكير بالمهمة «{المهمة}» وموعدها {الموعد}. نرجو إنجازها وإفادتنا — {الشركة}',e:'Hello {الاسم}, reminder about the task "{المهمة}" due {الموعد}. Please complete it and let us know — {الشركة}',ne:'Overdue task'},
{id:'welcome',n:'ترحيب وتفعيل',t:'أهلاً بك {الاسم} في {الشركة} 🦅 رقمك {رقم_المندوب}. نحتاج منك المستندات المطلوبة لتفعيل حسابك — {المسؤول}',e:'Welcome {الاسم} to {الشركة} 🦅 Your Rider ID is {رقم_المندوب}. Please send the required documents to activate your account — {المسؤول}',ne:'Welcome and activation'}
];
const WAS={tab:'al',f:'all',L:[],Q:[],qi:-1,a:null,ta:null};
const WA_SEV={c:['🔴','حرج'],w:['🟠','تحذير'],i:['🔵','معلومة'],p:['🟢','إيجابي']},WA_ORD={c:0,w:1,i:2,p:3};
const waTpl=()=>{const u=db.cfg.waTpl||[];return WA_DEF.map(d=>({...d,...(u.find(x=>x.id===d.id)||{})}))};
const waFill=(t,v)=>String(t).replace(/\{([^}]+)\}/g,(m,k)=>v[k]==null?'':v[k]);
const waQuiet=()=>{const h=new Date().getHours();return h>=22||h<8};
function waMonth(){const ms=cumMonths(),m=ms[ms.length-1];return m?cumAll(m):null}
function waVars(a,lg){const en=lg==='en',r=a.r,C=waMonth(),o=C&&C.out[String(r.riderId)],c=o?o.o:0,t=tgt(r);let need='';
if(C&&C.last&&t){const e=new Date(C.last),dim=new Date(e.getFullYear(),e.getMonth()+1,0).getDate();need=Math.ceil(Math.max(0,t-c)/Math.max(1,dim-e.getDate()))}
return{الاسم:((en&&r.nameEn)||r.nameAr||'').split(' ')[0],رقم_المندوب:r.riderId,الطلبات:c,التارجت:t||'',المتبقي:t?Math.max(0,t-c):'',نسبة_الإنجاز:t?Math.round(c/t*100):'',المطلوب_يوميا:need,المنطقة:r.city||'',الشركة:en?(db.cfg.companyEn||'Eagles Delivery'):(db.cfg.company||'نسور التوصيل'),المسؤول:db.cfg.manager||'',...(a.d||{}),...(en?(a.dE||{}):{})}}
function waAlerts(){const A=[],T=today(),C=waMonth(),R=db.cfg.waLog||[],cool=(+db.cfg.waCool||3)*864e5,rs=db.riders.filter(r=>r.status!=='مؤرشف'),rm=new Map(rs.map(r=>[r.id,r]));
rs.forEach(r=>{if(r.status==='بانتظار التفعيل'){A.push({k:'welcome',s:'i',r,why:'مندوب بانتظار التفعيل'});return}
if(r.status!=='نشط'||!C)return;const o=C.out[String(r.riderId)],t=tgt(r);if(!t)return;const c=o?o.o:0;
if(c>=t)A.push({k:'win',s:'p',r,why:'حقق التارجت ('+c+'/'+t+')'});
else if(stt(c,C.last,t)[0]==='يحتاج إلى متابعة'){const e=new Date(C.last),dim=new Date(e.getFullYear(),e.getMonth()+1,0).getDate(),q=c/(t*e.getDate()/dim);
A.push({k:'pace',s:q<.6?'c':'w',r,why:(o?'متأخر: ':'لا طلبات مسجلة: ')+c+' من '+t})}});
db.docs.forEach(d=>{const r=rm.get(d.rid);if(!r||!d.exp)return;const n=Math.floor((new Date(d.exp)-new Date(T))/864e5);if(n>(+db.cfg.warn||30))return;
A.push({k:'doc',s:n<=7?'c':'w',r,why:d.type+(n<0?' منتهي':' ينتهي بعد '+n+' يوم'),d:{المستند:d.type,الحالة:n<0?'منتهي منذ '+(-n)+' يوم':'ينتهي بتاريخ '+d.exp+' (باقي '+n+' يوم)'},dE:{الحالة:n<0?'expired '+(-n)+' days ago':'expires on '+d.exp+' ('+n+' days left)'}})});
db.tickets.forEach(x=>{const r=rm.get(x.rid);if(r&&x.status!=='مغلقة')A.push({k:'ticket',s:'i',r,why:'بلاغ مفتوح #'+x.no,d:{رقم_البلاغ:x.no}})});
db.tasks.forEach(x=>{const r=rm.get(x.rid);if(r&&x.due&&x.due<T&&!/مكتمل|منجز|مغلق/.test(x.status||''))A.push({k:'task',s:'w',r,why:'مهمة متأخرة: '+x.title,d:{المهمة:x.title,الموعد:x.due}})});
A.forEach(a=>{a.rec=R.some(x=>x.rid===a.r.id&&x.type===a.k&&Date.now()-x.t<cool)});
return A.sort((a,b)=>WA_ORD[a.s]-WA_ORD[b.s]||String(a.r.nameAr).localeCompare(String(b.r.nameAr),'ar'))}
function waCenter(){const T=WAS.tab,b=(k,n)=>`<button class="${T===k?'p':''}" onclick="WAS.tab='${k}';render()">${n}</button>`;
return`<div class="row">${b('al','🔔 التنبيهات')}${b('rd','👥 المناديب')}${b('tp','✏️ القوالب')}${b('lg','🕘 السجل')}</div>`+(T==='tp'?waTp():T==='lg'?waLg():T==='rd'?waRd():waAl())}
function waAl(){const all=waAlerts(),cnt=s=>all.filter(a=>a.s===s).length,L=WAS.L=all.filter(a=>WAS.f==='all'||a.s===WAS.f),qn=L.filter(a=>a.r.wa&&!a.rec).length;
const chip=(k,n)=>`<button class="${WAS.f===k?'on':''}" onclick="WAS.f='${k}';render()">${n}</button>`;
return`<div class="row" style="overflow-x:auto;flex-wrap:nowrap">${chip('all','الكل ('+all.length+')')}${Object.keys(WA_SEV).map(s=>chip(s,WA_SEV[s][0]+' '+WA_SEV[s][1]+' ('+cnt(s)+')')).join('')}</div>
<div class="row"><button class="p" onclick="waQStart()" ${qn?'':'disabled'}>▶ طابور الإرسال (${qn})</button></div>
${waQuiet()?'<div class="c wn">⏰ الوقت الآن خارج الساعات المناسبة للتواصل (10م–8ص).</div>':''}
${L.map((a,i)=>`<div class="c"><b>${WA_SEV[a.s][0]} ${esc(a.r.nameAr)}</b> <span class="m">${esc(a.r.riderId)}</span><div class="m">${esc(a.why)}${a.rec?' — ✔ أُرسل مؤخرًا':''}</div><div class="row" style="margin:6px 0 0">${a.r.wa?`<button onclick="waShow(WAS.L[${i}],0)">💬 تجهيز الرسالة</button>`:`<button onclick="riderForm('${a.r.id}')">➕ أضف رقم واتساب</button>`}</div></div>`).join('')||'<div class="c m">لا توجد تنبيهات 🎉 (تحتاج بيانات أداء مستوردة للشهر الحالي)</div>'}`}
function waBody(t,lg){return lg==='en'?(t.e||t.t):t.t}
function waShow(a,q){WAS.a=a;const tp=waTpl(),t=tp.find(x=>x.id===a.k)||tp[0],lg=(db.cfg.waLang||{})[a.r.id]==='en'?'en':'ar';
modal(`<h3>${esc(a.r.nameAr)} <span class="m">${esc(a.r.riderId)}</span></h3><div class="m">${esc(a.why||'')}</div><label>اللغة / Language</label><select id="walg" onchange="waLang(this.value)"><option value="ar" ${lg==='ar'?'selected':''}>عربي</option><option value="en" ${lg==='en'?'selected':''}>English</option></select><label>القالب</label><select id="wats" onchange="waRefill()">${tp.map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${esc(lg==='en'?(x.ne||x.n):x.n)}</option>`).join('')}</select><label>الرسالة (قابلة للتعديل)</label><textarea id="wat" rows="8" dir="${lg==='en'?'ltr':'rtl'}" style="width:100%">${esc(waFill(waBody(t,lg),waVars(a,lg)))}</textarea>
<div class="row"><button class="p" onclick="waSend(${q?1:0})">💬 إرسال عبر واتساب${q?' والتالي':''}</button><button onclick="waCopy()">نسخ</button>${q?'<button onclick="waNext()">تخطي ⏭</button>':''}<button onclick="closeM()">إغلاق</button></div>${q?`<div class="m">${WAS.qi+1} / ${WAS.Q.length}</div>`:''}`)}
function waRefill(){const lg=$('#walg').value,t=waTpl().find(x=>x.id===$('#wats').value);$('#wat').dir=lg==='en'?'ltr':'rtl';$('#wat').value=waFill(waBody(t,lg),waVars(WAS.a,lg))}
function waLang(v){const m=db.cfg.waLang=db.cfg.waLang||{};m[WAS.a.r.id]=v;save();const tp=waTpl();Array.from($('#wats').options).forEach(o=>{const x=tp.find(y=>y.id===o.value);o.textContent=v==='en'?(x.ne||x.n):x.n});waRefill()}
function waRL(id){const m=db.cfg.waLang=db.cfg.waLang||{};m[id]=m[id]==='en'?'ar':'en';save();render()}
function waCopy(){const v=$('#wat').value;try{navigator.clipboard.writeText(v).then(()=>toast('تم النسخ'))}catch(e){$('#wat').select()}}
function waSend(q){const a=WAS.a;if(!a||!a.r.wa)return toast('لا يوجد رقم واتساب');const L=db.cfg.waLog=db.cfg.waLog||[];
L.push({t:Date.now(),rid:a.r.id,type:a.k,tpl:$('#wats').value,lang:$('#walg').value,n:a.r.nameAr});if(L.length>400)L.splice(0,L.length-400);save();
window.open('https://wa.me/'+a.r.wa+'?text='+encodeURIComponent($('#wat').value),'_blank','noopener');if(q)waNext();else{closeM();render()}}
function waQStart(){WAS.Q=WAS.L.filter(a=>a.r.wa&&!a.rec);if(!WAS.Q.length)return toast('لا يوجد مناديب جاهزون للإرسال');WAS.qi=0;waShow(WAS.Q[0],1)}
function waNext(){WAS.qi++;if(WAS.qi>=WAS.Q.length){closeM();toast('انتهى الطابور');render();return}waShow(WAS.Q[WAS.qi],1)}
function waQuick(id,k){const r=db.riders.find(x=>x.id===id);if(!r)return;WAS.Q=[];WAS.qi=-1;waShow({k:k||'pace',s:'i',r,why:'رسالة سريعة'},0)}
function waTp(){const en=WAS.tl==='en',ph=['الاسم','رقم_المندوب','الطلبات','التارجت','المتبقي','نسبة_الإنجاز','المطلوب_يوميا','المنطقة','الشركة','المسؤول','المستند','الحالة','رقم_البلاغ','المهمة','الموعد'];
return`<div class="c"><div class="row"><div><label>اسم الشركة في الرسائل</label><input id="wco" value="${esc(db.cfg.company||'')}" placeholder="نسور التوصيل"></div><div><label>اسم المسؤول</label><input id="wmg" value="${esc(db.cfg.manager||'')}"></div><div><label>Company name (English)</label><input id="wcoe" value="${esc(db.cfg.companyEn||'')}" placeholder="Eagles Delivery"></div><div><label>أيام منع التكرار</label><input id="wcl" type="number" min="0" value="${+db.cfg.waCool||3}"></div></div><button onclick="waSet()">حفظ الإعدادات</button></div>
<div class="m" style="margin:8px 0">اضغط متغيرًا لإدراجه في المربع المحدد:</div><div class="row" style="flex-wrap:wrap">${ph.map(p=>`<button style="flex:none;min-height:34px;padding:4px 10px" onclick="waIns('{${p}}')">${p}</button>`).join('')}</div>
<div class="row"><button class="${en?'':'p'}" onclick="WAS.tl='ar';render()">عربي</button><button class="${en?'p':''}" onclick="WAS.tl='en';render()">English</button></div>
${waTpl().map(x=>`<div class="c"><b>${esc(en?(x.ne||x.n):x.n)}</b><textarea id="wtp_${x.id}" rows="4" dir="${en?'ltr':'rtl'}" style="width:100%;margin-top:6px" onfocus="WAS.ta=this">${esc(en?(x.e||''):x.t)}</textarea><div class="row"><button class="p" onclick="waTpSave('${x.id}')">حفظ</button><button onclick="waTpReset('${x.id}')">استرجاع الافتراضي</button></div></div>`).join('')}`}
function waIns(v){const t=WAS.ta;if(!t)return toast('اضغط داخل مربع الرسالة أولًا');const p=t.selectionStart==null?t.value.length:t.selectionStart;t.value=t.value.slice(0,p)+v+t.value.slice(p);t.focus()}
function waTpSave(id){const en=WAS.tl==='en',u=db.cfg.waTpl=db.cfg.waTpl||[],o={...(u.find(x=>x.id===id)||{}),id},v=$('#wtp_'+id).value;if(en)o.e=v;else o.t=v;db.cfg.waTpl=u.filter(x=>x.id!==id).concat([o]);save();toast(en?'Saved':'تم حفظ القالب')}
function waTpReset(id){const en=WAS.tl==='en';db.cfg.waTpl=(db.cfg.waTpl||[]).map(x=>{if(x.id!==id)return x;const o={...x};delete o[en?'e':'t'];return o}).filter(x=>x.t!=null||x.e!=null);save();render()}
function waSet(){db.cfg.company=$('#wco').value.trim();db.cfg.manager=$('#wmg').value.trim();db.cfg.companyEn=$('#wcoe').value.trim();db.cfg.waCool=Math.max(0,+$('#wcl').value||0);save();toast('تم الحفظ')}
function waLg(){const L=(db.cfg.waLog||[]).slice().reverse().slice(0,60),N=Object.fromEntries(waTpl().map(x=>[x.id,x.n]));
return L.map(x=>`<div class="c"><b>${esc(x.n)}</b> <span class="m">${new Date(x.t).toLocaleString('ar-SA')}</span><div class="m">${esc(N[x.tpl]||x.tpl)}</div></div>`).join('')||'<div class="c m">لا توجد رسائل مرسلة بعد</div>'}
function waRd(){const rs=db.riders.filter(r=>r.status!=='مؤرشف').slice().sort((a,b)=>String(a.nameAr).localeCompare(String(b.nameAr),'ar'));
return rs.map(r=>`<div class="c"><b>${esc(r.nameAr)}</b> <span class="m">${esc(r.riderId)}</span><div class="row" style="margin:6px 0 0"><button onclick="waRL('${r.id}')">🌐 ${(db.cfg.waLang||{})[r.id]==='en'?'EN':'عربي'}</button>${r.wa?`<button onclick="waQuick('${r.id}')">💬 رسالة</button>`:`<button onclick="riderForm('${r.id}')">➕ أضف رقم واتساب</button>`}</div></div>`).join('')||'<div class="c m">لا يوجد مناديب</div>'}
