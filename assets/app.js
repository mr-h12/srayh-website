// Renders listings.json into #listings. Lang from <html lang>. Filters optional (#f-type, #f-status).
const L = document.documentElement.lang === 'ar' ? 'ar' : 'en';
const T = {
  ar: { sale: 'للبيع', rent: 'للإيجار', villa: 'فيلا', apartment: 'شقة', chalet: 'شاليه', land: 'أرض', duplex: 'دوبلكس',
        area: 'م²', beds: 'غرف', price: 'اتصل للسعر', wa: 'واتساب', call: 'اتصال', empty: 'لا توجد عقارات مطابقة.',
        msg: 'مرحباً، مهتم بـ: ' },
  en: { sale: 'For sale', rent: 'For rent', villa: 'Villa', apartment: 'Apartment', chalet: 'Chalet', land: 'Land', duplex: 'Duplex',
        area: 'm²', beds: 'beds', price: 'Call for price', wa: 'WhatsApp', call: 'Call', empty: 'No matching properties.',
        msg: 'Hello, I am interested in: ' },
}[L];
const WA = 'https://wa.me/201066699577', TEL = 'tel:+201066699577';
const ICON = {
  pin: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  ruler: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0L2.7 18.7a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/></svg>',
  bed: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>',
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
  return `<article class="card">
    <div class="card-media"><span class="badge">${T[l.status]}</span>
      <img src="../assets/img/${l.photos[0]}" alt="${esc(l.title[L])}" loading="lazy"></div>
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
