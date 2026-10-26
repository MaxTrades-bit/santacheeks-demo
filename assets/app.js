(function(){
  const FREE=50;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const fmt=n=>'$'+n.toFixed(2);
  const PANTS_IMG='img/new/studio-back-red.jpg';
  const ADDONS={hat:{name:'Matching Santa Hat',price:14.99,img:'img/new/addon-hat.svg'},socks:{name:'Festive Socks (2-pack)',price:9.99,img:'img/new/addon-socks.svg'},wrap:{name:'Gift Wrap',price:4.99,img:'img/new/addon-giftwrap.svg'}};
  const BUNDLES={1:{label:'1 Pair',price:49.99},2:{label:'2 Pairs (save 10%)',price:89.99},3:{label:'3 Pairs (save 20%)',price:119.99}};

  // gallery
  const thumbs=$$('.thumb'), main=$('#mainImg'), cap=$('#imgCaption'); let idx=0;
  function show(i){idx=(i+thumbs.length)%thumbs.length;const t=thumbs[idx];main.style.opacity=0;
    setTimeout(()=>{main.src=t.dataset.src;main.alt=t.querySelector('img').alt;cap.textContent=t.dataset.cap;main.style.opacity=1},150);
    thumbs.forEach(x=>x.classList.toggle('active',x===t));
    const box=t.parentElement; if(box.scrollWidth>box.clientWidth) box.scrollTo({left:t.offsetLeft-box.clientWidth/2+t.clientWidth/2,behavior:'smooth'}); else box.scrollTo({top:t.offsetTop-box.clientHeight/2,behavior:'smooth'});}
  thumbs.forEach((t,i)=>t.addEventListener('click',()=>show(i)));
  $('.nav-arrow.prev').onclick=()=>show(idx-1); $('.nav-arrow.next').onclick=()=>show(idx+1);
  let sx=null; const mi=$('.main-img');
  mi.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  mi.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)show(idx+(dx<0?1:-1));sx=null});

  // size
  let size='M';
  $$('#sizes button').forEach(b=>b.addEventListener('click',()=>{$$('#sizes button').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-checked')});b.classList.add('active');b.setAttribute('aria-checked','true');size=b.dataset.size;$('#sizeLabel').textContent=size;}));

  // bundles
  let bundle=1;
  $$('.bundle input').forEach(r=>r.addEventListener('change',()=>{
    bundle=+r.value; $$('.bundle').forEach(l=>l.classList.toggle('active',l.contains(r)));
    const p=+r.dataset.price,c=+r.dataset.compare;
    $('#btnPrice').textContent=fmt(p); $('#priceMain').textContent=fmt(p); $('#compareMain').textContent=fmt(c); $('#saveMain').textContent='Save '+fmt(c-p).replace('.00','');
  }));

  // FBT
  function fbtTotal(){let t=49.99;$$('.fbt-cb').forEach(c=>{if(c.checked)t+=ADDONS[c.dataset.id].price});$('#fbtTotal').textContent=fmt(t)}
  $$('.fbt-cb').forEach(c=>c.addEventListener('change',fbtTotal)); fbtTotal();

  // cart
  const cart=[]; // {key,name,meta,price,qty,img}
  const drawer=$('#drawer'), ov=$('#overlay');
  const open=()=>{drawer.classList.add('open');ov.classList.add('show');drawer.setAttribute('aria-hidden','false')};
  const close=()=>{drawer.classList.remove('open');ov.classList.remove('show');drawer.setAttribute('aria-hidden','true')};
  function addLine(item){const ex=cart.find(x=>x.key===item.key);if(ex)ex.qty+=1;else cart.push({...item,qty:1})}
  function addPants(){const b=BUNDLES[bundle];addLine({key:'p'+bundle+size,name:'SantaCheeks™ Santa Pants',meta:b.label+' · Size '+size,price:b.price,img:PANTS_IMG})}
  function addAddon(id){const a=ADDONS[id];addLine({key:id,name:a.name,meta:'Add-on',price:a.price,img:a.img})}
  function render(){
    let count=0,sub=0;
    $('#drawerItems').innerHTML=cart.length?cart.map((l,i)=>{count+=l.qty;sub+=l.qty*l.price;return `<div class="line"><img src="${l.img}" alt=""><div class="meta"><strong>${l.name}</strong><small>${l.meta}${l.qty>1?' · Qty '+l.qty:''}</small><br><button class="rm" data-i="${i}">Remove</button></div><div class="lp">${fmt(l.qty*l.price)}</div></div>`}).join(''):'<p class="empty">Your cart is empty.</p>';
    $('#cartCount').textContent=count; $('#subtotal').textContent=fmt(sub);
    const left=FREE-sub;
    $('#shipMsg').innerHTML=sub===0?`Free shipping on orders over $50`:(left>0?`You're <b>${fmt(left)}</b> away from free shipping`:'🎉 You unlocked <b>free shipping!</b>');
    $('#shipBar').style.width=Math.min(100,sub/FREE*100)+'%';
    $$('.rm').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.i,1);render()});
    const avail=Object.keys(ADDONS).filter(k=>!cart.find(l=>l.key===k));
    $('#upsell').style.display=(cart.length&&avail.length)?'':'none';
    $('#upsellItems').innerHTML=avail.map(k=>`<div class="up-item"><img src="${ADDONS[k].img}" alt=""><div><strong>${ADDONS[k].name}</strong><small>${fmt(ADDONS[k].price)}</small></div><button class="up-add" data-k="${k}">+ Add</button></div>`).join('');
    $$('.up-add').forEach(b=>b.onclick=()=>{addAddon(b.dataset.k);render()});
  }
  $('#addToCart').onclick=()=>{addPants();render();open()};
  $('#stickyBtn').onclick=()=>{addPants();render();open()};
  $('#fbtAdd').onclick=()=>{addLine({key:'p1'+size,name:'SantaCheeks™ Santa Pants',meta:'1 Pair · Size '+size,price:49.99,img:PANTS_IMG});$$('.fbt-cb').forEach(c=>{if(c.checked)addAddon(c.dataset.id)});render();open()};
  $('#cartOpen').onclick=()=>{render();open()}; $('#cartClose').onclick=close; ov.onclick=close;
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
  $('#checkoutBtn').onclick=()=>toast('🎄 Demo store: checkout is disabled');
  render();
  window.__demo={addPants,render,open};

  // sticky ATC
  const atc=$('#addToCart'), sticky=$('#stickyAtc');
  new IntersectionObserver(([e])=>sticky.classList.toggle('show',!e.isIntersecting&&e.boundingClientRect.top<0)).observe(atc);
  const v=document.querySelector('.phone video'); if(v){v.muted=true;const p=v.play();if(p&&p.catch)p.catch(()=>{})}
})();
document.getElementById('moreReviews').addEventListener('click',function(){document.querySelector('.review-grid').classList.add('expanded');this.remove()});
