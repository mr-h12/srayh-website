// Renders listings.json into #listings. Lang from <html lang>. Filters optional (#f-type, #f-status).
const L = document.documentElement.lang === 'ar' ? 'ar' : 'en';
const T = {
  ar: { sale: 'للبيع', rent: 'للإيجار', villa: 'فيلا', apartment: 'شقة', chalet: 'شاليه', land: 'أرض', duplex: 'دوبلكس',
        area: 'م²', beds: 'غرف', price: 'اتصل للسعر', wa: 'واتساب', call: 'اتصال', empty: 'لا توجد عقارات مطابقة.',
        msg: 'مرحباً، مهتم بـ: ', photos: 'صور' },
  en: { sale: 'For sale', rent: 'For rent', villa: 'Villa', apartment: 'Apartment', chalet: 'Chalet', land: 'Land', duplex: 'Duplex',
        area: 'm²', beds: 'beds', price: 'Call for price', wa: 'WhatsApp', call: 'Call', empty: 'No matching properties.',
        msg: 'Hello, I am interested in: ', photos: 'photos' },
}[L];
const WA = 'https://wa.me/201066699577', TEL = 'tel:+201066699577';
const ICON = {
  pin: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  ruler: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0L2.7 18.7a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/></svg>',
  bed: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  home: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function card(l) {
  const chips = [
    `<span class="chip">${ICON.home}${T[l.type] || esc(l.type)}</span>`,
    l.area ? `<span class="chip">${ICON.ruler}${l.area} ${T.area}</span>` : '',
    l.bedrooms ? `<span class="chip">${ICON.bed}${l.bedrooms} ${T.beds}</span>` : '',
  ].join('');
  const msg = encodeURIComponent(T.msg + l.title[L]);
  return `<article class="card" data-id="${esc(l.id)}">
    <button class="card-media" type="button" style="border:0;padding:0;width:100%;text-align:inherit" aria-label="${esc(l.title[L])}"><span class="badge">${T[l.status]}</span>
      <img src="../assets/img/${l.photos[0]}" alt="${esc(l.title[L])}" loading="lazy">
      ${l.photos.length > 1 ? `<span class="count">${ICON.cam}${l.photos.length} ${T.photos}</span>` : ''}</button>
    <div class="card-body">
      <h3>${esc(l.title[L])}</h3>
      <div class="loc">${ICON.pin}<span>${esc(l.location[L])}</span></div>
      <div class="chips">${chips}</div>
      <p>${esc(l.desc[L])}</p>
      <div class="price">${l.price ? esc(l.price[L]) : T.price}</div>
      <div class="card-actions">
        <a class="btn btn-wa" href="${WA}?text=${msg}" target="_blank" rel="noopener">${T.wa}</a>
        <a class="btn btn-outline" href="${TEL}">${T.call}</a>
      </div>
    </div></article>`;
}

async function render() {
  const el = document.getElementById('listings');
  if (!el) return;
  const all = await fetch('../data/listings.json').then(r => r.json());
  const byId = Object.fromEntries(all.map(l => [l.id, l]));
  el.addEventListener('click', e => {
    const m = e.target.closest('.card-media'); if (!m) return;
    openLightbox(byId[m.closest('.card').dataset.id]);
  });
  const limit = +el.dataset.limit || Infinity;
  const ft = document.getElementById('f-type'), fs = document.getElementById('f-status');
  const draw = () => {
    const rows = all.filter(l => (!ft || !ft.value || l.type === ft.value) && (!fs || !fs.value || l.status === fs.value)).slice(0, limit);
    el.innerHTML = rows.length ? rows.map(card).join('') : `<p class="empty">${T.empty}</p>`;
  };
  [ft, fs].forEach(s => s && s.addEventListener('change', draw));
  draw();
}
render();

// Lightbox — native <dialog>, prev/next, keyboard arrows
const lb = document.getElementById('lightbox');
let lbList = [], lbIdx = 0, lbTitle = '';
function lbShow() {
  lb.querySelector('img').src = '../assets/img/' + lbList[lbIdx];
  lb.querySelector('figcaption').textContent = `${lbTitle} — ${lbIdx + 1} / ${lbList.length}`;
  lb.querySelectorAll('.lb-nav').forEach(b => b.hidden = lbList.length < 2);
}
function openLightbox(l) { lbList = l.photos; lbIdx = 0; lbTitle = l.title[L]; lbShow(); lb.showModal(); }
if (lb) {
  lb.addEventListener('click', e => {
    const a = e.target.closest('[data-lb]')?.dataset.lb;
    if (a === 'close' || e.target === lb) lb.close();
    if (a === 'prev') { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; lbShow(); }
    if (a === 'next') { lbIdx = (lbIdx + 1) % lbList.length; lbShow(); }
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') lb.querySelector(L === 'ar' ? '.lb-prev' : '.lb-next').click();
    if (e.key === 'ArrowLeft') lb.querySelector(L === 'ar' ? '.lb-next' : '.lb-prev').click();
  });
}

// Mobile menu
const mb = document.querySelector('.menu-btn'), menu = document.getElementById('nav-menu');
mb?.addEventListener('click', () => { const o = menu.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
menu?.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });

// Scroll reveal + counters
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const arDigits = n => L === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
function count(b) {
  const end = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), dur = 1200;
  const step = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    b.textContent = arDigits(v) + suf; if (p < 1) requestAnimationFrame(step); };
  reduce ? (b.textContent = arDigits(end) + suf) : requestAnimationFrame(step);
}
const io = new IntersectionObserver(es => es.forEach(x => { if (!x.isIntersecting) return;
  x.target.classList.add('in'); x.target.querySelectorAll('[data-count]').forEach(count); io.unobserve(x.target); }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(s => io.observe(s));

// Back to top
const toTop = document.querySelector('.to-top');
addEventListener('scroll', () => toTop?.classList.toggle('show', scrollY > 600), { passive: true });
toTop?.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
