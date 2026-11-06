const $ = id => document.getElementById(id);
const KEY = "carepoint_demo_v1";
const doctors = [
 {id:"D01",name:"Dr. Asha Reddy",specialty:"Cardiology",qualification:"MD · 12 years experience",fee:700},
 {id:"D02",name:"Dr. Rahul Mehta",specialty:"Dermatology",qualification:"MD · 8 years experience",fee:500},
 {id:"D03",name:"Dr. Nisha Rao",specialty:"Neurology",qualification:"DM · 10 years experience",fee:900},
 {id:"D04",name:"Dr. Kiran Kumar",specialty:"Orthopedics",qualification:"MS · 9 years experience",fee:650},
 {id:"D05",name:"Dr. Sana Ali",specialty:"Pediatrics",qualification:"MD · 7 years experience",fee:450}
];
const load = () => JSON.parse(localStorage.getItem(KEY) || '{"patients":[],"appointments":[]}');
const save = data => localStorage.setItem(KEY, JSON.stringify(data));
let currentUser = null;
function notify(msg,type="success"){ $("message").textContent=msg; $("message").className="notice "+type; $("message").classList.remove("hidden"); }
function clearNotify(){ $("message").classList.add("hidden"); }
function showSession(){ $("sessionArea").textContent=currentUser ? `${currentUser.name} · ${currentUser.role}` : "Guest"; }
function setView(view){
 $("authSection").classList.toggle("hidden",view!=="guest");
 $("patientApp").classList.toggle("hidden",view!=="patient");
 $("adminApp").classList.toggle("hidden",view!=="admin");
 showSession();
 if(view==="patient") renderDoctors();
 if(view==="admin") renderAdmin();
}
$("registerForm").addEventListener("submit",e=>{
 e.preventDefault(); clearNotify();
 const name=$("regName").value.trim(), email=$("regEmail").value.trim().toLowerCase(), password=$("regPassword").value;
 const db=load();
 if(db.patients.some(p=>p.email===email)){notify("An account with this email already exists.","error");return;}
 db.patients.push({name,email,password}); save(db); $("registerForm").reset();
 notify("Patient registration successful. You can now log in.");
});
$("loginForm").addEventListener("submit",e=>{
 e.preventDefault(); clearNotify();
 const email=$("loginEmail").value.trim().toLowerCase(), password=$("loginPassword").value;
 if(email==="admin@hospital.test" && password==="admin123"){currentUser={name:"Hospital Admin",email,role:"admin"};setView("admin");return;}
 const p=load().patients.find(x=>x.email===email && x.password===password);
 if(!p){notify("Invalid email or password.","error");return;}
 currentUser={...p,role:"patient"};setView("patient");
});
function logout(){currentUser=null;setView("guest");notify("You have logged out.");}
$("logoutBtn").addEventListener("click",logout); $("adminLogout").addEventListener("click",logout);
function renderDoctors(){
 const specialty=$("specialtyFilter").value, term=$("doctorSearch").value.toLowerCase();
 const filtered=doctors.filter(d=>(!specialty||d.specialty===specialty)&&d.name.toLowerCase().includes(term));
 $("doctorList").innerHTML=filtered.length?filtered.map(d=>`<article class="item"><div><h4>${d.name}</h4><p>${d.specialty} · ${d.qualification}</p><p>Consultation fee: ₹${d.fee}</p></div><button data-book="${d.id}" class="bookBtn">Book appointment</button></article>`).join(""):'<div class="empty">No doctors match your search.</div>';
 document.querySelectorAll("[data-book]").forEach(b=>b.addEventListener("click",()=>book(b.dataset.book)));
}
$("specialtyFilter").addEventListener("change",renderDoctors); $("doctorSearch").addEventListener("input",renderDoctors);
function book(id){
 const doctor=doctors.find(d=>d.id===id);
 const date=prompt(`Choose appointment date for ${doctor.name} (YYYY-MM-DD):`,new Date(Date.now()+86400000).toISOString().slice(0,10));
 if(!date)return;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<new Date().toISOString().slice(0,10)){notify("Enter a valid future date in YYYY-MM-DD format.","error");return;}
 const time=prompt("Choose a time (e.g. 10:30 AM):","10:00 AM"); if(!time)return;
 const db=load();
 const duplicate=db.appointments.some(a=>a.doctorId===id&&a.date===date&&a.time===time&&a.status==="Booked");
 if(duplicate){notify("That doctor slot is already booked. Choose another slot.","error");return;}
 db.appointments.push({id:"APT"+Date.now(),patientEmail:currentUser.email,patientName:currentUser.name,doctorId:id,doctorName:doctor.name,specialty:doctor.specialty,date,time,status:"Booked"});
 save(db); notify("Appointment confirmed successfully."); renderDoctors();
}
function renderMyAppointments(){
 const rows=load().appointments.filter(a=>a.patientEmail===currentUser.email);
 $("myAppointments").innerHTML=rows.length?rows.map(a=>`<article class="item"><div><h4>${a.doctorName}</h4><p>${a.specialty} · ${a.date} at ${a.time}</p><span class="pill">${a.status}</span></div>${a.status==="Booked"?`<button class="danger small" data-cancel="${a.id}">Cancel</button>`:""}</article>`).join(""):'<div class="empty">You have no appointments yet.</div>';
 document.querySelectorAll("[data-cancel]").forEach(b=>b.addEventListener("click",()=>{const db=load();const a=db.appointments.find(x=>x.id===b.dataset.cancel);if(a)a.status="Cancelled";save(db);notify("Appointment cancelled.");renderMyAppointments();}));
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));
 $("doctorsPanel").classList.toggle("hidden",b.dataset.tab!=="doctors");
 $("appointmentsPanel").classList.toggle("hidden",b.dataset.tab!=="appointments");
 if(b.dataset.tab==="appointments")renderMyAppointments();
}));
function renderAdmin(){
 const rows=load().appointments;
 $("adminAppointments").innerHTML=rows.length?`<table><thead><tr><th>Patient</th><th>Doctor</th><th>Date / Time</th><th>Status</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${a.patientName}<br>${a.patientEmail}</td><td>${a.doctorName}</td><td>${a.date}<br>${a.time}</td><td>${a.status}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">No appointments have been booked.</div>';
}
setView("guest");
