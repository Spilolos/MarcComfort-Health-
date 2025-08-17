// Utility functions
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));
const toast = (msg) => alert(msg);

const storage = {
  read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};
const uid = () => 'u_' + Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();

// Auth
const Auth = {
  usersKey: 'eclinic_users',
  sessionKey: 'eclinic_session',

  _hash(str) { let h=0; for (let i=0;i<str.length;i++){ h=(h<<5)-h+str.charCodeAt(i); h|=0; } return 'h'+Math.abs(h); },
  get users(){ return storage.read(this.usersKey, []); },
  set users(v){ storage.write(this.usersKey, v); },

  current(){
    const s = JSON.parse(sessionStorage.getItem(this.sessionKey) || localStorage.getItem(this.sessionKey) || 'null');
    if (!s) return null;
    return this.users.find(u => u.uid === s.uid) || null;
  },

  login({ email, password, remember }){
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No account with that email');
    if (user.passHash !== this._hash(password)) throw new Error('Wrong password');
    const session = { uid: user.uid, at: nowISO() };
    if (remember) localStorage.setItem(this.sessionKey, JSON.stringify(session));
    else { sessionStorage.setItem(this.sessionKey, JSON.stringify(session)); localStorage.removeItem(this.sessionKey); }
    return user;
  },

  signup({ name, email, password, role='patient' }){
    if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered');
    const user = { uid: uid(), name, email, passHash: this._hash(password), role };
    const users = this.users; users.push(user); this.users = users;
    localStorage.setItem(this.sessionKey, JSON.stringify({ uid: user.uid, at: nowISO() }));
    return user;
  },

  logout(){ localStorage.removeItem(this.sessionKey); sessionStorage.removeItem(this.sessionKey); }
};

// Data model & CRUD
const DB = {
  keys: { doctors:'eclinic_doctors', appts:'eclinic_appointments' },
  listDoctors(){ return storage.read(this.keys.doctors, []); },
  saveDoctors(v){ storage.write(this.keys.doctors, v); },
  listAppts(){ return storage.read(this.keys.appts, []); },
  saveAppts(v){ storage.write(this.keys.appts, v); },
  chatKey(aptId){ return `eclinic_chat_${aptId}`; },
  listMsgs(aptId){ return storage.read(this.chatKey(aptId), []); },
  saveMsgs(aptId,v){ storage.write(this.chatKey(aptId), v); }
};

// View state & router
const State = {
  view: 'home',
  user: null,
  geocode: null,
  open(view){
    State.view = view;
    $$('.view').forEach(v => v.classList.remove('active'));
    $(`#view-${view}`).classList.add('active');
    if (view === 'doctors') { renderDoctors(); populateDoctorSelect(); }
    if (view === 'appointments') { renderAppointments(); populateDoctorSelect(); }
    if (view === 'chat') { populateApptSelect(); renderChat(); }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  $$('.nav-link, footer a, .quick-actions .btn').forEach(b => b.addEventListener('click', (e) => {
    const v = e.currentTarget.getAttribute('data-view'); if (v) State.open(v);
  }));
  $('#authBtn').addEventListener('click', () => $('#authCard').classList.toggle('hidden'));
  $('#logoutBtn').addEventListener('click', () => { Auth.logout(); location.reload(); });

  // tabs
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active');
    const panel = t.getAttribute('data-tab');
    $$('.tab-content form').forEach(f => f.classList.add('hidden'));
    $(`form[data-panel="${panel}"]`).classList.remove('hidden');
  }));

  // forms
  $('#loginForm').addEventListener('submit', onLogin);
  $('#signupForm').addEventListener('submit', onSignup);
  $('#doctorForm').addEventListener('submit', onSaveDoctor);
  $('#resetDocForm').addEventListener('click', resetDoctorForm);
  $('#geocodeBtn').addEventListener('click', onGeocode);
  $('#docSearch').addEventListener('input', renderDoctors);
  $('#apptForm').addEventListener('submit', onBook);
  $('#chatAppt').addEventListener('change', renderChat);
  $('#chatForm').addEventListener('submit', onSendMsg);

  const me = Auth.current(); if (me) signedIn(me); else signedOut();
  State.open('home');
});

// Auth handlers & profile fill
function onLogin(e){
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  const remember = $('#rememberMe').checked;
  try {
    const user = Auth.login({ email, password, remember });
    signedIn(user); $('#authCard').classList.add('hidden'); State.open('home');
  } catch (err) { toast(err.message); }
}

function onSignup(e){
  e.preventDefault();
  const name = $('#signupName').value.trim();
  const email = $('#signupEmail').value.trim();
  const password = $('#signupPassword').value;
  const role = $('#signupRole').value;
  try {
    const user = Auth.signup({ name, email, password, role });
    signedIn(user); $('#authCard').classList.add('hidden'); State.open('home');
  } catch (err) { toast(err.message); }
}

function signedIn(user){
  State.user = user;
  $('#authBtn').classList.add('hidden');
  $('#logoutBtn').classList.remove('hidden');
  const b = $('#userBadge'); b.classList.remove('hidden'); b.textContent = `${user.name} (${user.role})`;
  $('#profileCard').classList.remove('hidden');
  $('#profName').textContent = user.name; $('#profEmail').textContent = user.email; $('#profRole').textContent = user.role;
  $('#apptRoleNote').textContent = user.role === 'doctor'
    ? 'You are a doctor. Patients will book with you; you can confirm/complete appointments.'
    : 'You are a patient. Book appointments below.';
  renderDoctors(); populateDoctorSelect(); renderAppointments(); populateApptSelect();
}
function signedOut(){
  State.user = null;
  $('#authBtn').classList.remove('hidden'); $('#logoutBtn').classList.add('hidden'); $('#userBadge').classList.add('hidden');
}

// Doctors CRUD (+ geocoding)
function renderDoctors(){
  const listEl = $('#doctorList'); const q = $('#docSearch').value?.toLowerCase() || '';
  const docs = DB.listDoctors().filter(d => !q || d.name.toLowerCase().includes(q) || (d.specialty||'').toLowerCase().includes(q));
  listEl.innerHTML = docs.length ? '' : '<div class="muted">No doctors yet.</div>';
  for (const d of docs){
    const owned = State.user && d.ownerUid === State.user.uid;
    const div = document.createElement('div'); div.className = 'card-item';
    div.innerHTML = `
      <div><strong>${d.name}</strong> ${d.specialty?`• ${d.specialty}`:''}</div>
      <div class="muted">${d.location?.display || d.address || '—'}</div>
      <div class="item-actions">
        ${d.location ? `<a class="btn btn-ghost" target="_blank" href="https://www.openstreetmap.org/?mlat=${d.location.lat}&mlon=${d.location.lon}#map=18/${d.location.lat}/${d.location.lon}">Map</a>`:''}
        ${owned ? `<button class="btn btn-secondary" data-act="edit" data-id="${d.id}">Edit</button>
                   <button class="btn btn-ghost" data-act="del" data-id="${d.id}">Delete</button>`:''}
      </div>`;
    listEl.appendChild(div);
  }
  $$('#doctorList [data-act]').forEach(b => b.addEventListener('click', onDoctorAction));
}

function onDoctorAction(e){
  const id = e.currentTarget.getAttribute('data-id');
  const act = e.currentTarget.getAttribute('data-act');
  if (act === 'edit'){
    const d = DB.listDoctors().find(x => x.id === id); if (!d) return;
    $('#doctorId').value = d.id; $('#doctorName').value = d.name;
    $('#doctorSpecialty').value = d.specialty || ''; $('#doctorAddress').value = d.address || '';
    $('#geocodeResult').textContent = d.location?.display || '';
    State.open('doctors');
  } else if (act === 'del'){
    DB.saveDoctors(DB.listDoctors().filter(x => x.id !== id));
    renderDoctors(); populateDoctorSelect();
  }
}

async function onGeocode(){
  const addr = $('#doctorAddress').value.trim(); if (!addr) return toast('Enter an address');
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`;
    const res = await fetch(url, { headers: { 'Accept-Language':'en', 'User-Agent':'eclinic-demo' } });
    const data = await res.json(); const first = data?.[0];
    if (!first){ $('#geocodeResult').textContent = 'No result'; State.geocode = null; return; }
    State.geocode = { lat:+first.lat, lon:+first.lon, display:first.display_name };
    $('#geocodeResult').textContent = State.geocode.display;
  } catch { toast('Geocoding failed'); }
}

function onSaveDoctor(e){
  e.preventDefault();
  if (!State.user || State.user.role !== 'doctor') return toast('Only doctors can add/edit doctors');
  const id = $('#doctorId').value || 'd_' + uid();
  const name = $('#doctorName').value.trim();
  const specialty = $('#doctorSpecialty').value.trim();
  const address = $('#doctorAddress').value.trim();
  const docs = DB.listDoctors();
  const existing = docs.find(d => d.id === id);
  const payload = existing || { id, createdAt: nowISO(), ownerUid: State.user.uid };
  payload.name = name; payload.specialty = specialty; payload.address = address;
  if (State.geocode) payload.location = { ...State.geocode };

  if (existing) DB.saveDoctors(docs.map(d => d.id === id ? { ...payload, updatedAt: nowISO() } : d));
  else DB.saveDoctors([payload, ...docs]);

  resetDoctorForm(); renderDoctors(); populateDoctorSelect();
}

function resetDoctorForm(){
  State.geocode = null; $('#doctorId').value=''; $('#doctorName').value=''; $('#doctorSpecialty').value='';
  $('#doctorAddress').value=''; $('#geocodeResult').textContent='';
}

// Appointments CRUD
function populateDoctorSelect(){
  const sel = $('#apptDoctor'); if (!sel) return;
  sel.innerHTML = '';
  for (const d of DB.listDoctors()){
    const opt = document.createElement('option'); opt.value = d.id; opt.textContent = `${d.name}${d.specialty?` • ${d.specialty}`:''}`;
    sel.appendChild(opt);
  }
}

function doctorIdMatchesUser(doctorId, uid){
  const d = DB.listDoctors().find(x => x.id === doctorId);
  return d && d.ownerUid === uid;
}

function renderAppointments(){
  const me = State.user; const listEl = $('#apptList'); listEl.innerHTML = '';
  if (!me){ listEl.innerHTML = '<div class="muted">Please sign in.</div>'; return; }
  const appts = DB.listAppts().filter(a => me.role==='doctor' ? doctorIdMatchesUser(a.doctorId, me.uid) : a.patientUid===me.uid);
  if (!appts.length){ listEl.innerHTML = '<div class="muted">No appointments yet.</div>'; return; }

  for (const a of appts){
    const doc = DB.listDoctors().find(d => d.id === a.doctorId);
    const owner = me.role === 'doctor';
    const div = document.createElement('div'); div.className='card-item';
    div.innerHTML = `
      <div><strong>${owner?'Patient':'Doctor'}:</strong> ${owner?(a.patientName||a.patientUid):(doc?.name||'—')}</div>
      <div class="muted">${a.date} at ${a.time} • ${a.reason||'—'}</div>
      <div class="muted">Status: <strong>${a.status}</strong></div>
      <div class="item-actions">
        ${owner?`<button class="btn btn-secondary" data-appt="${a.id}" data-act="confirm">Confirm</button>
                 <button class="btn btn-secondary" data-appt="${a.id}" data-act="complete">Complete</button>`:''}
        <button class="btn btn-ghost" data-appt="${a.id}" data-act="cancel">${owner?'Remove':'Cancel'}</button>
        <button class="btn btn-primary" data-appt="${a.id}" data-act="openChat">Open chat</button>
      </div>`;
    listEl.appendChild(div);
  }
  $$('#apptList [data-act]').forEach(b => b.addEventListener('click', onApptAction));
}

function onBook(e){
  e.preventDefault();
  const me = State.user;
  if (!me || me.role!=='patient') return toast('Only patients can book');
  const doctorId=$('#apptDoctor').value, date=$('#apptDate').value, time=$('#apptTime').value, reason=$('#apptReason').value.trim();
  if (!doctorId || !date || !time) return toast('Complete all fields');
  const appts = DB.listAppts();
  appts.unshift({ id:'a_'+uid(), doctorId, patientUid:me.uid, patientName:me.name, date, time, reason, status:'scheduled', createdAt:nowISO() });
  DB.saveAppts(appts); renderAppointments(); populateApptSelect(); State.open('appointments');
}

function onApptAction(e){
  const id = e.currentTarget.getAttribute('data-appt');
  const act = e.currentTarget.getAttribute('data-act');
  const appts = DB.listAppts(); const a = appts.find(x => x.id === id); if (!a) return;
  if (act==='confirm') a.status='confirmed';
  if (act==='complete') a.status='completed';
  if (act==='cancel') { DB.saveAppts(appts.filter(x=>x.id!==id)); renderAppointments(); populateApptSelect(); return; }
  if (act==='openChat') { $('#chatAppt').value = id; State.open('chat'); renderChat(); return; }
  DB.saveAppts(appts); renderAppointments();
}

// Chat (per appointment)
function populateApptSelect(){
  const me = State.user, sel = $('#chatAppt'); if (!me || !sel) return;
  sel.innerHTML = '';
  const appts = DB.listAppts().filter(a => me.role==='doctor' ? doctorIdMatchesUser(a.doctorId, me.uid) : a.patientUid===me.uid);
  for (const a of appts){
    const doc = DB.listDoctors().find(x => x.id === a.doctorId);
    const opt = document.createElement('option');
    opt.value = a.id; opt.textContent = `${a.date} ${a.time} — ${doc?.name || 'Doctor'}`;
    sel.appendChild(opt);
  }
}

function renderChat(){
  const apptId = $('#chatAppt').value, stream = $('#chatStream');
  stream.innerHTML = '';
  if (!apptId){ stream.innerHTML = '<div class="muted">Choose an appointment to chat.</div>'; return; }
  const msgs = DB.listMsgs(apptId);
  for (const m of msgs){
    const div = document.createElement('div');
    div.className = 'msg' + (m.senderUid === State.user?.uid ? ' mine' : '');
    div.textContent = m.text;
    stream.appendChild(div);
  }
  stream.scrollTop = stream.scrollHeight;
}

function onSendMsg(e){
  e.preventDefault();
  const text = $('#chatText').value.trim(), apptId = $('#chatAppt').value;
  if (!text || !apptId || !State.user) return;
  const msgs = DB.listMsgs(apptId); msgs.push({ id:'m_'+uid(), text, senderUid:State.user.uid, at:nowISO() });
  DB.saveMsgs(apptId, msgs); $('#chatText').value=''; renderChat();
}
