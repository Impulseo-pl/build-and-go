(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* nawigacja */
  var nav=$('#nav');
  var onScroll=function(){nav.classList.toggle('is-scrolled',window.scrollY>40)};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  var burger=$('.burger',nav);
  burger.addEventListener('click',function(){
    var o=nav.classList.toggle('is-open');burger.setAttribute('aria-expanded',o);
    document.body.style.overflow=o?'hidden':'';
  });
  $$('.mobile-menu a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('is-open');burger.setAttribute('aria-expanded','false');document.body.style.overflow=''})});

  /* reveal */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    $$('.rv-up').forEach(function(el,i){el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
  } else $$('.rv-up').forEach(function(el){el.classList.add('is-in')});

  /* lightbox */
  var lb=$('#lb'),lbImg=$('img',lb),lbList=[],lbI=0;
  function lbShow(list,i){lbList=list;lbI=i;lbImg.src=list[i].src;lbImg.alt=list[i].alt||'';lb.classList.add('is-on');document.body.style.overflow='hidden'}
  function lbStep(d){lbI=(lbI+d+lbList.length)%lbList.length;lbImg.src=lbList[lbI].src;lbImg.alt=lbList[lbI].alt||''}
  function lbClose(){lb.classList.remove('is-on');document.body.style.overflow=''}
  $('.lb-close',lb).addEventListener('click',lbClose);
  $('.lb-prev',lb).addEventListener('click',function(){lbStep(-1)});
  $('.lb-next',lb).addEventListener('click',function(){lbStep(1)});
  lb.addEventListener('click',function(e){if(e.target===lb)lbClose()});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('is-on'))return;if(e.key==='Escape')lbClose();if(e.key==='ArrowLeft')lbStep(-1);if(e.key==='ArrowRight')lbStep(1)});

  $$('[data-lightbox]').forEach(function(g){
    var links=$$('a',g),list=links.map(function(a){var im=$('img',a);return{src:a.getAttribute('href'),alt:im?im.alt:''}});
    links.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();lbShow(list,i)})});
  });

  /* galerie busów */
  $$('[data-gallery]').forEach(function(g){
    var imgs=$$('.car-stage img',g),thumbs=$('.car-thumbs',g),cur=0,timer;
    var list=imgs.map(function(im){return{src:im.getAttribute('src'),alt:im.alt}});
    function go(i){imgs[cur].classList.remove('is-active');btns[cur].classList.remove('is-active');cur=i;imgs[cur].classList.add('is-active');btns[cur].classList.add('is-active')}
    var btns=imgs.map(function(im,i){
      var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Zdjęcie '+(i+1));
      b.innerHTML='<img src="'+im.getAttribute('src')+'" alt="" loading="lazy">';
      if(i===0)b.classList.add('is-active');
      b.addEventListener('click',function(){go(i);clearInterval(timer)});
      thumbs.appendChild(b);return b;
    });
    imgs.forEach(function(im,i){im.addEventListener('click',function(){lbShow(list,i)})});
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      timer=setInterval(function(){go((cur+1)%imgs.length)},4500);
      g.addEventListener('mouseenter',function(){clearInterval(timer)});
    }
  });

  /* zapytanie: wykończenia */
  var inq=$('#inq-form');
  if(inq)inq.addEventListener('submit',function(e){
    e.preventDefault();var ok=$('#inq-ok');
    if(!$('#q-name').value.trim()||!$('#q-tel').value.trim()){ok.textContent='Podaj imię i numer telefonu.';return}
    if(!inq.querySelector('[name="rodo"]').checked){ok.textContent='Zaznacz zgodę na przetwarzanie danych.';return}
    ok.textContent='Dziękujemy. Oddzwonimy, aby umówić oględziny. (Wersja demonstracyjna: zapytanie nie zostało wysłane.)';inq.reset();
  });

  /* rezerwacja */
  var form=$('#booking');
  if(!form)return;

  var CARS={
    bialy:{name:'Ford Transit Custom',img:'assets/img/bialy-przod.webp',tiers:[420,400,380],busy:[[3,5],[11,12],[19,23],[33,36],[47,50],[61,65]]},
    srebrny:{name:'Ford Tourneo Custom',img:'assets/img/srebrny-przod.webp',tiers:[390,370,350],busy:[[1,2],[8,10],[15,15],[26,30],[40,44],[55,57]]}
  };
  var PURPOSE={wynajem:'Wynajem bez kierowcy',wesele:'Wesele z kierowcą',transfer:'Transfer z lotniska',firma:'Wyjazd firmowy / wycieczka',inne:'Inne'};
  var TRANSFER={krk:300,ktw:550};
  var DEPOSIT=1500;
  var MONTHS=['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];

  var today=new Date();today.setHours(0,0,0,0);
  var view=new Date(today.getFullYear(),today.getMonth(),1);
  var start=null,end=null;

  var dayMs=864e5;
  function dkey(d){return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
  function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
  function diffDays(a,b){return Math.round((b-a)/dayMs)}
  function val(name){var el=form.querySelector('[name="'+name+'"]:checked')||form.querySelector('[name="'+name+'"]');return el?el.value:''}
  function car(){return CARS[val('car')]}
  function purpose(){return val('purpose')}
  function singleDay(){var p=purpose();return p==='wesele'||p==='transfer'}
  function fmt(d){return d.toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'short'})}
  function zl(n){return n.toLocaleString('pl-PL')+' zł'}

  var busySet={};
  function buildBusy(){
    busySet={};
    car().busy.forEach(function(r){for(var i=r[0];i<=r[1];i++)busySet[dkey(addDays(today,i))]=1});
  }
  function isBusy(d){return !!busySet[dkey(d)]}
  function rangeFree(a,b){for(var d=new Date(a);d<=b;d=addDays(d,1))if(isBusy(d))return false;return true}

  var cal=$('#cal'),msg=$('#cal-msg');
  function renderMonth(m){
    var y=m.getFullYear(),mo=m.getMonth();
    var first=new Date(y,mo,1),offset=(first.getDay()+6)%7,days=new Date(y,mo+1,0).getDate();
    var h='<div class="month"><h4>'+MONTHS[mo]+' '+y+'</h4><div class="grid7">';
    ['Pn','Wt','Śr','Cz','Pt','So','Nd'].forEach(function(d){h+='<span class="dow">'+d+'</span>'});
    for(var i=0;i<offset;i++)h+='<span></span>';
    for(var d=1;d<=days;d++){
      var dt=new Date(y,mo,d),cls=['day'],dis=false,lab=dt.toLocaleDateString('pl-PL',{day:'numeric',month:'long'});
      if(dt<today){cls.push('past');dis=true}
      else if(isBusy(dt)){cls.push('busy');dis=true;lab+=', zajęty'}
      if(+dt===+today)cls.push('today');
      if(start&&+dt===+start)cls.push('start');
      if((end&&+dt===+end)||(start&&!end&&+dt===+start&&singleDay()))cls.push('end');
      if(start&&end&&dt>start&&dt<end)cls.push('in-range');
      h+='<button type="button" class="'+cls.join(' ')+'" data-d="'+(+dt)+'"'+(dis?' disabled':'')+' aria-label="'+lab+'">'+d+'</button>';
    }
    return h+'</div></div>';
  }
  function renderCal(){
    var next=new Date(view.getFullYear(),view.getMonth()+1,1);
    cal.innerHTML=renderMonth(view)+renderMonth(next);
    $('#cal-prev').disabled=+view<=+new Date(today.getFullYear(),today.getMonth(),1);
    $('#cal-next').disabled=diffDays(today,view)>330;
  }
  cal.addEventListener('click',function(e){
    var b=e.target.closest('.day');if(!b||b.disabled)return;
    var d=new Date(+b.getAttribute('data-d'));msg.textContent='';
    if(singleDay()){start=d;end=d}
    else if(!start||end){start=d;end=null}
    else if(d<start){start=d}
    else if(!rangeFree(start,d)){msg.textContent='W wybranym okresie bus jest już zajęty. Wybierz inny termin lub drugi bus.';start=d;end=null}
    else end=d;
    renderCal();update();
  });
  $('#cal-prev').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()-1,1);renderCal()});
  $('#cal-next').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);renderCal()});

  /* godziny */
  var t1=$('#f-t1'),t2=$('#f-t2');
  for(var h=6;h<=22;h++){['00','30'].forEach(function(m){var t=(h<10?'0':'')+h+':'+m;t1.add(new Option(t,t));t2.add(new Option(t,t))})}
  t1.value='09:00';t2.value='18:00';

  function update(){
    var c=car(),p=purpose(),single=singleDay();
    $('#sum-car').textContent=c.name;
    $('#sum-img').src=c.img;
    $('#cal-hint').innerHTML='Wybrany bus: <b>'+c.name+'</b>';
    $('#sum-purpose').textContent=PURPOSE[p];
    $('#cal-sub').textContent=single?'Wybierz dzień przejazdu.':'Kliknij dzień odbioru, a następnie dzień zwrotu.';
    $('#l-t1').textContent=p==='transfer'?'Godzina wylotu / przylotu':p==='wesele'?'Godzina podstawienia':'Godzina odbioru';
    $('#w-t2').style.display=single?'none':'';
    $$('.cond[data-for]').forEach(function(el){el.classList.toggle('is-on',el.getAttribute('data-for')===p)});

    $('#sum-from').textContent=start?fmt(start)+', '+t1.value:'—';
    $('#sum-to').textContent=single?(start?'tego samego dnia':'—'):(end?fmt(end)+', '+t2.value:'—');
    var withDriver=p==='wesele'||p==='transfer'||(p==='firma'&&val('driver')==='Z kierowcą');
    $('#sum-dep').textContent=withDriver?'brak':zl(DEPOSIT);

    var total='—',days='—',unit='Liczba dób',note='Cena orientacyjna. Ostateczną kwotę potwierdzamy telefonicznie.';
    if(p==='transfer'){
      unit='Trasa';var a=val('airport'),dir=val('dir');
      days=a==='krk'?'Kraków-Balice':a==='ktw'?'Katowice-Pyrzowice':'inne lotnisko';
      if(TRANSFER[a]){var base=TRANSFER[a]*(dir==='W obie strony'?2:1);total='od '+zl(base)}else total='wycena';
    } else if(p==='wesele'){
      unit='Czas';days='do 8 godzin';total='od '+zl(900);
    } else if(p==='inne'||(p==='firma'&&withDriver)){
      unit='Liczba dób';if(start&&end)days=String(Math.max(1,diffDays(start,end)));total='wycena';
      note='Ten rodzaj przejazdu wyceniamy indywidualnie. Oddzwonimy z ofertą.';
    } else if(start&&end){
      var n=Math.max(1,diffDays(start,end)),rate=n<=3?c.tiers[0]:n<=7?c.tiers[1]:c.tiers[2];
      days=n+' × '+zl(rate);total=zl(n*rate);
    }
    $('#sum-unit-l').textContent=unit;$('#sum-days').textContent=days;
    $('#sum-total').textContent=total;$('#sum-note').textContent=note;
  }

  form.addEventListener('change',function(e){
    var n=e.target.name;
    if(n==='car'){buildBusy();if(start&&((end&&!rangeFree(start,end))||isBusy(start))){start=end=null;msg.textContent='Wybrany termin jest zajęty dla tego busa. Wybierz nowy termin.'}renderCal()}
    if(n==='purpose'){if(singleDay()&&start){end=start}else if(!singleDay()&&end&&+end===+start){end=null}renderCal()}
    update();
  });

  /* skróty z innych sekcji */
  function setRadio(name,v){var r=form.querySelector('[name="'+name+'"][value="'+v+'"]');if(r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}}
  $$('[data-car]').forEach(function(a){a.addEventListener('click',function(){setRadio('car',a.getAttribute('data-car'))})});
  $$('[data-purpose]').forEach(function(a){a.addEventListener('click',function(){setRadio('purpose',a.getAttribute('data-purpose'))})});

  form.addEventListener('submit',function(e){
    e.preventDefault();var err=$('#sum-err');err.textContent='';
    if(!start||(!singleDay()&&!end)){err.textContent='Wybierz termin w kalendarzu.';return}
    if(!$('#f-name').value.trim()||!$('#f-tel').value.trim()){err.textContent='Podaj imię i numer telefonu.';$('#f-name').focus();return}
    if(!form.querySelector('[name="rodo"]').checked){err.textContent='Zaznacz zgodę na przetwarzanie danych.';return}
    $('#done-txt').textContent='Zgłoszenie na '+car().name+' ('+PURPOSE[purpose()].toLowerCase()+', '+fmt(start)+(end&&+end!==+start?' – '+fmt(end):'')+') zostało przyjęte. Oddzwonimy pod numer '+$('#f-tel').value.trim()+', aby potwierdzić termin i warunki.';
    form.style.display='none';$('#bk-done').classList.add('is-on');
    $('#rezerwacja').scrollIntoView({behavior:'smooth'});
  });
  $('#bk-again').addEventListener('click',function(){form.reset();start=end=null;form.style.display='';$('#bk-done').classList.remove('is-on');t1.value='09:00';t2.value='18:00';buildBusy();renderCal();update()});

  buildBusy();renderCal();update();
})();
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if((document.referrer||'').indexOf('crm-newbeginning')>-1)return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/rest/v1/demo_views';var KEY='sb_publishable_MWwoyGlSCWnJ4awtOPF0ow_ZVS0Y8qK';function send(g){try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY,'Prefer':'return=minimal'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null),ip:(g&&g.ip)||null,country:(g&&g.cc)||null,city:(g&&g.city)||null})}).catch(function(){});}catch(e){}}var done=false;function once(g){if(done)return;done=true;send(g);}try{var t=setTimeout(function(){once(null);},1500);fetch('https://ipwho.is/?fields=ip,success,country_code,city',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){clearTimeout(t);once(d&&d.success!==false?{ip:d.ip,cc:d.country_code,city:d.city}:null);}).catch(function(){clearTimeout(t);once(null);});}catch(e){once(null);}}catch(e){}})();
