(function() {

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcCZYXfzsdOxTgDP9WYv8VpZQ4K5nyW264dBRz38uswZvT4GlOjGDX0fKfJjipfBgV/exec';

const SLOT_TIMES = ["6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"];

const ZONES = {
  "6:00 PM":{name:"Boppin",key:"boppin",bpm:"100–130 BPM",bpmPlaceholder:"e.g. 110–120",genre:"Soul, funk, disco, afrobeat, nu-disco, feel-good house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "6:30 PM":{name:"Boppin",key:"boppin",bpm:"100–130 BPM",bpmPlaceholder:"e.g. 110–120",genre:"Soul, funk, disco, afrobeat, nu-disco, feel-good house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "7:00 PM":{name:"Moovin",key:"moovin",bpm:"120–140 BPM",bpmPlaceholder:"e.g. 125–132",genre:"House, garage, funky/soulful house, breaks, Latin house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "7:30 PM":{name:"Moovin",key:"moovin",bpm:"120–140 BPM",bpmPlaceholder:"e.g. 125–132",genre:"House, garage, funky/soulful house, breaks, Latin house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "8:00 PM":{name:"Moovin",key:"moovin",bpm:"120–140 BPM",bpmPlaceholder:"e.g. 125–132",genre:"House, garage, funky/soulful house, breaks, Latin house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "8:30 PM":{name:"Moovin",key:"moovin",bpm:"120–140 BPM",bpmPlaceholder:"e.g. 125–132",genre:"House, garage, funky/soulful house, breaks, Latin house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "9:00 PM":{name:"Groovin",key:"groovin",bpm:"130–160 BPM",bpmPlaceholder:"e.g. 140–155",genre:"Drum & bass, jungle, dancehall, footwork, uptempo house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
  "9:30 PM":{name:"Groovin",key:"groovin",bpm:"130–160 BPM",bpmPlaceholder:"e.g. 140–155",genre:"Drum & bass, jungle, dancehall, footwork, uptempo house",notAllowed:"No techno, hard dance, or dark/heavy sounds"},
};

const WEDNESDAYS = [
  {id:1,month:"June",day:"4",label:"Wed 4 Jun",full:"Wednesday 4 June 2026"},
  {id:2,month:"June",day:"11",label:"Wed 11 Jun",full:"Wednesday 11 June 2026"},
  {id:3,month:"June",day:"18",label:"Wed 18 Jun",full:"Wednesday 18 June 2026"},
  {id:4,month:"June",day:"25",label:"Wed 25 Jun",full:"Wednesday 25 June 2026"},
  {id:5,month:"July",day:"2",label:"Wed 2 Jul",full:"Wednesday 2 July 2026"},
  {id:6,month:"July",day:"9",label:"Wed 9 Jul",full:"Wednesday 9 July 2026"},
  {id:7,month:"July",day:"16",label:"Wed 16 Jul",full:"Wednesday 16 July 2026"},
  {id:8,month:"July",day:"23",label:"Wed 23 Jul",full:"Wednesday 23 July 2026"},
  {id:9,month:"July",day:"30",label:"Wed 30 Jul",full:"Wednesday 30 July 2026"},
];

// Track taken slots fetched from Google Sheets
const takenSlots = {}; // { "Wednesday 4 June 2026": { "6:00 PM": true } }
WEDNESDAYS.forEach(w => { takenSlots[w.full] = {}; });

let selDate = null, selSlot = null;
let loadingSlots = false;

const CSS = `
#iww-root *{box-sizing:border-box;margin:0;padding:0;}
#iww-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;padding:1.5rem 0;}
#iww-root h1{font-size:22px;font-weight:500;line-height:1.25;margin-bottom:0.25rem;color:#111;}
#iww-root .tag{font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#185FA5;background:#E6F1FB;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:.6rem;}
#iww-root .venue{font-size:14px;color:#666;margin-bottom:1.5rem;}
#iww-root .sec{font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.65rem;}
#iww-root .step-bar{display:flex;align-items:center;gap:6px;margin-bottom:1.5rem;}
#iww-root .stp{display:flex;align-items:center;gap:5px;font-size:12px;color:#999;white-space:nowrap;}
#iww-root .stp.active{color:#185FA5;font-weight:600;}
#iww-root .stp-dot{width:18px;height:18px;border-radius:50%;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;}
#iww-root .stp.active .stp-dot{background:#185FA5;border-color:#185FA5;color:#fff;}
#iww-root .stp-line{flex:1;height:1px;background:#eee;min-width:6px;}
#iww-root .dates-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:1.5rem;}
#iww-root .month-lbl{font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.07em;margin:.5rem 0 .3rem;grid-column:1/-1;}
#iww-root .dcard{background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:.8rem .9rem;cursor:pointer;transition:border-color .15s;}
#iww-root .dcard:hover{border-color:#bbb;}
#iww-root .dcard.sel{border:2px solid #185FA5;}
#iww-root .dcard.full{opacity:.4;cursor:not-allowed;}
#iww-root .d-month{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#185FA5;margin-bottom:2px;}
#iww-root .dcard.full .d-month{color:#999;}
#iww-root .d-day{font-size:19px;font-weight:600;color:#111;line-height:1;margin-bottom:3px;}
#iww-root .d-sub{font-size:11px;color:#999;}
#iww-root .slots-sec{display:none;margin-bottom:1.5rem;}
#iww-root .slots-hdr{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.6rem;flex-wrap:wrap;gap:.5rem;}
#iww-root .slots-lbl{font-size:14px;font-weight:600;color:#111;}
#iww-root .legend{display:flex;gap:12px;}
#iww-root .leg-item{display:flex;align-items:center;gap:5px;font-size:11px;color:#888;}
#iww-root .leg-dot{width:8px;height:8px;border-radius:50%;}
#iww-root .slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
#iww-root .zone-lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;grid-column:1/-1;margin:.6rem 0 .2rem;display:flex;align-items:center;gap:8px;}
#iww-root .zone-pill{font-size:10px;padding:2px 10px;border-radius:20px;font-weight:600;}
#iww-root .zp-boppin .zone-pill{background:#E1F5EE;color:#085041;}
#iww-root .zp-moovin .zone-pill{background:#E6F1FB;color:#0C447C;}
#iww-root .zp-groovin .zone-pill{background:#FAEEDA;color:#633806;}
#iww-root .slotcard{border-radius:8px;border:1px solid #e5e5e5;padding:.65rem .75rem;cursor:pointer;background:#fff;transition:border-color .15s;}
#iww-root .slotcard:hover:not(.taken){border-color:#bbb;}
#iww-root .slotcard.sel{border:2px solid #185FA5;background:#E6F1FB;}
#iww-root .slotcard.taken{opacity:.38;cursor:not-allowed;background:#f5f5f5;}
#iww-root .slotcard.loading-slot{opacity:.5;cursor:wait;}
#iww-root .s-dot{width:8px;height:8px;border-radius:50%;margin-bottom:6px;}
#iww-root .s-dot.free{background:#3B6D11;}
#iww-root .s-dot.taken{background:#A32D2D;}
#iww-root .s-dot.picked{background:#185FA5;}
#iww-root .s-time{font-size:13px;font-weight:600;color:#111;}
#iww-root .s-status{font-size:11px;color:#888;margin-top:1px;}
#iww-root .slotcard.sel .s-status{color:#185FA5;}
#iww-root .zone-hint{display:none;border-radius:8px;padding:.85rem 1rem;margin-bottom:1.25rem;font-size:13px;line-height:1.6;}
#iww-root .zone-hint.boppin{background:#E1F5EE;color:#085041;}
#iww-root .zone-hint.moovin{background:#E6F1FB;color:#0C447C;}
#iww-root .zone-hint.groovin{background:#FAEEDA;color:#633806;}
#iww-root .zone-hint strong{font-weight:600;}
#iww-root .not-allowed{font-size:12px;margin-top:.4rem;display:flex;align-items:center;gap:5px;opacity:.8;}
#iww-root .form-sec{display:none;}
#iww-root .fcard{background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:1.25rem;margin-bottom:1.25rem;}
#iww-root .frow{margin-bottom:1rem;}
#iww-root .frow:last-child{margin-bottom:0;}
#iww-root .r2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
#iww-root label{display:block;font-size:13px;color:#666;margin-bottom:5px;}
#iww-root input,#iww-root textarea{width:100%;padding:8px 10px;font-size:14px;border:1px solid #ddd;border-radius:6px;background:#fff;color:#111;font-family:inherit;}
#iww-root textarea{resize:vertical;min-height:60px;}
#iww-root .hint-text{font-size:11px;color:#888;margin-top:4px;}
#iww-root .sum-card{border-radius:8px;padding:.9rem 1.1rem;margin-bottom:1.25rem;font-size:14px;line-height:1.7;}
#iww-root .sum-card.boppin{background:#E1F5EE;color:#085041;}
#iww-root .sum-card.moovin{background:#E6F1FB;color:#0C447C;}
#iww-root .sum-card.groovin{background:#FAEEDA;color:#633806;}
#iww-root .sum-card strong{font-weight:600;}
#iww-root .btn{width:100%;padding:12px;background:#185FA5;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s;}
#iww-root .btn:hover{opacity:.88;}
#iww-root .btn:disabled{opacity:.4;cursor:not-allowed;}
#iww-root .err{font-size:12px;color:#A32D2D;margin-top:4px;display:none;}
#iww-root .conf{display:none;text-align:center;padding:2rem 1rem;}
#iww-root .chk-circle{width:56px;height:56px;border-radius:50%;background:#EAF3DE;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:28px;}
#iww-root .conf-title{font-size:20px;font-weight:600;color:#111;margin-bottom:.4rem;}
#iww-root .conf-sub{font-size:14px;color:#666;margin-bottom:1.5rem;}
#iww-root .conf-card{background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:1.25rem;text-align:left;}
#iww-root .crow{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid #f0f0f0;}
#iww-root .crow:last-child{border-bottom:none;}
#iww-root .ck{color:#888;}
#iww-root .cv{color:#111;font-weight:600;}
#iww-root .spinner{display:inline-block;width:14px;height:14px;border:2px solid #ffffff44;border-top:2px solid #fff;border-radius:50%;animation:iww-spin .7s linear infinite;margin-right:8px;vertical-align:middle;}
@keyframes iww-spin{to{transform:rotate(360deg);}}
#iww-root .loading-bar{text-align:center;padding:1rem;font-size:13px;color:#888;}
`;

const HTML = `
<div id="iww-root">
  <div id="iww-booking-form">
    <div class="tag">Every Wednesday · June & July 2026</div>
    <h1>I Wub Wednesdays<br>@ Joey Smalls</h1>
    <div class="venue">📍 Joey Smalls · 30-min slots · 6 PM – 10 PM</div>

    <div class="step-bar">
      <div class="stp active" id="iww-s1"><span class="stp-dot">1</span> Date</div>
      <div class="stp-line"></div>
      <div class="stp" id="iww-s2"><span class="stp-dot">2</span> Slot</div>
      <div class="stp-line"></div>
      <div class="stp" id="iww-s3"><span class="stp-dot">3</span> Details</div>
      <div class="stp-line"></div>
      <div class="stp" id="iww-s4"><span class="stp-dot">4</span> Done</div>
    </div>

    <p class="sec">Choose a Wednesday</p>
    <div class="dates-grid" id="iww-dates-grid"></div>

    <div class="slots-sec" id="iww-slots-sec">
      <div class="slots-hdr">
        <span class="slots-lbl" id="iww-slots-chosen-date"></span>
        <div class="legend">
          <div class="leg-item"><div class="leg-dot" style="background:#3B6D11;"></div> Free</div>
          <div class="leg-item"><div class="leg-dot" style="background:#A32D2D;"></div> Taken</div>
          <div class="leg-item"><div class="leg-dot" style="background:#185FA5;"></div> Selected</div>
        </div>
      </div>
      <div class="slots-grid" id="iww-slots-grid"></div>
      <div class="zone-hint" id="iww-zone-hint"></div>
    </div>

    <div class="form-sec" id="iww-form-sec">
      <p class="sec">Your details</p>
      <div class="fcard">
        <div class="r2">
          <div class="frow"><label>First name</label><input type="text" id="iww-fname" placeholder="Jane"/></div>
          <div class="frow"><label>Last name</label><input type="text" id="iww-lname" placeholder="Smith"/></div>
        </div>
        <div class="frow"><label>Email address</label><input type="email" id="iww-email" placeholder="jane@example.com"/><span class="err" id="iww-email-err">Please enter a valid email address.</span></div>
        <div class="frow"><label>Phone (optional)</label><input type="tel" id="iww-phone" placeholder="+61 4xx xxx xxx"/></div>
        <div class="frow"><label>Instagram (optional)</label><input type="text" id="iww-instagram" placeholder="@yourhandle"/></div>
        <div class="frow">
          <label>Genre(s) you'll be playing</label>
          <input type="text" id="iww-genre" placeholder="e.g. deep house, soulful house"/>
          <div class="hint-text" id="iww-genre-hint"></div>
        </div>
        <div class="frow">
          <label>BPM range</label>
          <input type="text" id="iww-bpm" placeholder="e.g. 120–128"/>
          <div class="hint-text" id="iww-bpm-hint"></div>
        </div>
        <div class="frow"><label>Notes for the organiser (optional)</label><textarea id="iww-notes" placeholder="Anything we should know..."></textarea></div>
      </div>
      <div class="sum-card" id="iww-sum-card"></div>
      <button class="btn" id="iww-book-btn">Confirm booking</button>
      <span class="err" id="iww-submit-err" style="margin-top:.5rem;display:block;"></span>
    </div>
  </div>

  <div class="conf" id="iww-conf">
    <div class="chk-circle">✓</div>
    <div class="conf-title">You're in! See you Wednesday 🎶</div>
    <div class="conf-sub" id="iww-conf-email-line"></div>
    <div class="conf-card" id="iww-conf-details"></div>
    <button class="btn" style="margin-top:1.25rem;" id="iww-reset-btn">Book another slot</button>
  </div>
</div>
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

// Inject HTML
const target = document.getElementById('iww-booking');
if (!target) { console.error('IWW Booking: no element with id="iww-booking" found.'); return; }
target.innerHTML = HTML;

// --- State ---
function freeCount(dateId) {
  const w = WEDNESDAYS.find(x => x.id === dateId);
  if (!w) return 0;
  return SLOT_TIMES.filter(t => !takenSlots[w.full][t]).length;
}

// --- Fetch taken slots for a date from Google Sheets ---
async function fetchTakenSlots(dateFull) {
  // Check each slot
  const checks = SLOT_TIMES.map(slot =>
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'checkSlot', date: dateFull, slot }),
    })
    .then(r => r.json())
    .then(data => ({ slot, taken: data.taken }))
    .catch(() => ({ slot, taken: false }))
  );
  const results = await Promise.all(checks);
  results.forEach(({ slot, taken }) => {
    takenSlots[dateFull][slot] = taken;
  });
}

// --- Render dates ---
function renderDates() {
  const g = document.getElementById('iww-dates-grid');
  g.innerHTML = '';
  let lastMonth = null;
  WEDNESDAYS.forEach(w => {
    if (w.month !== lastMonth) {
      const ml = document.createElement('div');
      ml.className = 'month-lbl'; ml.textContent = w.month;
      g.appendChild(ml); lastMonth = w.month;
    }
    const free = freeCount(w.id);
    const isFull = free === 0;
    const card = document.createElement('div');
    card.className = 'dcard' + (isFull ? ' full' : '') + (selDate && selDate.id === w.id ? ' sel' : '');
    card.innerHTML = `<div class="d-month">${w.month}</div><div class="d-day">${w.day}</div><div class="d-sub">${isFull ? 'Fully booked' : free + ' slot' + (free !== 1 ? 's' : '') + ' free'}</div>`;
    if (!isFull) card.onclick = () => selectDate(w);
    g.appendChild(card);
  });
}

async function selectDate(w) {
  selDate = w; selSlot = null;
  renderDates();
  document.getElementById('iww-slots-sec').style.display = 'block';
  document.getElementById('iww-form-sec').style.display = 'none';
  document.getElementById('iww-slots-chosen-date').textContent = w.full;
  document.getElementById('iww-s2').classList.add('active');
  document.getElementById('iww-zone-hint').style.display = 'none';
  // Show loading state
  document.getElementById('iww-slots-grid').innerHTML = '<div class="loading-bar" style="grid-column:1/-1;">Checking availability...</div>';
  loadingSlots = true;
  await fetchTakenSlots(w.full);
  loadingSlots = false;
  renderSlots();
  document.getElementById('iww-slots-sec').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- Render slots ---
function renderSlots() {
  const g = document.getElementById('iww-slots-grid');
  g.innerHTML = '';
  let lastZone = null;
  SLOT_TIMES.forEach(t => {
    const z = ZONES[t];
    if (z.name !== lastZone) {
      const zl = document.createElement('div');
      zl.className = 'zone-lbl zp-' + z.key;
      zl.innerHTML = `<span class="zone-pill">${z.name}</span><span style="font-size:11px;color:#888;">${z.bpm}</span>`;
      g.appendChild(zl); lastZone = z.name;
    }
    const taken = !!(selDate && takenSlots[selDate.full][t]);
    const picked = selSlot === t;
    const card = document.createElement('div');
    card.className = 'slotcard' + (taken ? ' taken' : '') + (picked ? ' sel' : '');
    const dc = picked ? 'picked' : (taken ? 'taken' : 'free');
    card.innerHTML = `<div class="s-dot ${dc}"></div><div class="s-time">${t}</div><div class="s-status">${taken ? 'Booked' : picked ? 'Your pick' : 'Free'}</div>`;
    if (!taken) card.onclick = () => { selSlot = t; renderSlots(); showZoneHint(t); showForm(); };
    g.appendChild(card);
  });
}

function showZoneHint(t) {
  const z = ZONES[t];
  const hint = document.getElementById('iww-zone-hint');
  hint.className = 'zone-hint ' + z.key;
  hint.style.display = 'block';
  hint.innerHTML = `<strong>${z.name} zone · ${z.bpm}</strong><br>Suggested genres: ${z.genre}<div class="not-allowed">⛔ ${z.notAllowed}</div>`;
  document.getElementById('iww-genre-hint').textContent = 'Suggested for this slot: ' + z.genre;
  document.getElementById('iww-bpm-hint').textContent = 'Required range for this slot: ' + z.bpm;
  document.getElementById('iww-bpm').placeholder = z.bpmPlaceholder;
  document.getElementById('iww-genre').placeholder = 'e.g. ' + z.genre.split(',')[0].trim().toLowerCase();
}

function showForm() {
  document.getElementById('iww-form-sec').style.display = 'block';
  document.getElementById('iww-s3').classList.add('active');
  updateSum();
  document.getElementById('iww-form-sec').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateSum() {
  const z = ZONES[selSlot];
  const sc = document.getElementById('iww-sum-card');
  sc.className = 'sum-card ' + z.key;
  sc.innerHTML = `<strong>I Wub Wednesdays @ Joey Smalls</strong><br>${selDate.full} · ${selSlot} · 30 min · <strong>${z.name}</strong> zone (${z.bpm})`;
}

// --- Book ---
document.getElementById('iww-book-btn').onclick = async () => {
  const fn = document.getElementById('iww-fname').value.trim();
  const ln = document.getElementById('iww-lname').value.trim();
  const em = document.getElementById('iww-email').value.trim();
  const ee = document.getElementById('iww-email-err');
  const se = document.getElementById('iww-submit-err');
  if (!fn || !ln || !(/\S+@\S+\.\S+/.test(em))) { ee.style.display = 'block'; return; }
  ee.style.display = 'none'; se.style.display = 'none';

  const btn = document.getElementById('iww-book-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Confirming...';

  const z = ZONES[selSlot];
  const payload = {
    action: 'book',
    date: selDate.full,
    slot: selSlot,
    zone: z.name,
    bpmRange: document.getElementById('iww-bpm').value.trim() || z.bpm,
    firstName: fn,
    lastName: ln,
    email: em,
    phone: document.getElementById('iww-phone').value.trim(),
    instagram: document.getElementById('iww-instagram').value.trim(),
    genre: document.getElementById('iww-genre').value.trim(),
    notes: document.getElementById('iww-notes').value.trim(),
  };

  try {
    const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      takenSlots[selDate.full][selSlot] = true;
      document.getElementById('iww-conf-email-line').textContent = 'Confirmation sent to ' + em;
      document.getElementById('iww-conf-details').innerHTML = `
        <div class="crow"><span class="ck">Name</span><span class="cv">${fn} ${ln}</span></div>
        <div class="crow"><span class="ck">Event</span><span class="cv">I Wub Wednesdays @ Joey Smalls</span></div>
        <div class="crow"><span class="ck">Date</span><span class="cv">${selDate.full}</span></div>
        <div class="crow"><span class="ck">Slot</span><span class="cv">${selSlot} · ${z.name} zone</span></div>
        <div class="crow"><span class="ck">Genre</span><span class="cv">${payload.genre || '—'}</span></div>
        <div class="crow"><span class="ck">BPM range</span><span class="cv">${payload.bpmRange}</span></div>
        <div class="crow"><span class="ck">Booking ref</span><span class="cv">${data.ref}</span></div>`;
      document.getElementById('iww-booking-form').style.display = 'none';
      document.getElementById('iww-conf').style.display = 'block';
      document.getElementById('iww-s4').classList.add('active');
    } else {
      se.textContent = 'Something went wrong. Please try again.';
      se.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Confirm booking';
    }
  } catch (err) {
    se.textContent = 'Connection error. Please check your internet and try again.';
    se.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Confirm booking';
  }
};

// --- Reset ---
document.getElementById('iww-reset-btn').onclick = () => {
  selDate = null; selSlot = null;
  ['iww-fname','iww-lname','iww-email','iww-phone','iww-instagram','iww-genre','iww-bpm','iww-notes'].forEach(id => document.getElementById(id).value = '');
  ['iww-s2','iww-s3','iww-s4'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById('iww-slots-sec').style.display = 'none';
  document.getElementById('iww-form-sec').style.display = 'none';
  document.getElementById('iww-zone-hint').style.display = 'none';
  document.getElementById('iww-booking-form').style.display = 'block';
  document.getElementById('iww-conf').style.display = 'none';
  renderDates();
};

renderDates();

})();
