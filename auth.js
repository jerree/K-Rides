/* =========================================================
   K-RIDES AUTH - TOGGLE + LOCALSTORAGE FUNCTIONAL
   ========================================================= */

/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */
function getUsers(){ try{ return JSON.parse(localStorage.getItem('krides_users')||'[]'); }catch(e){ return []; } }
function saveUsers(u){ localStorage.setItem('krides_users', JSON.stringify(u)); }
function setCurrent(u){ localStorage.setItem('krides_current_user', JSON.stringify(u)); }
function getCurrent(){ try{ return JSON.parse(localStorage.getItem('krides_current_user')||'null'); }catch(e){ return null; } }
function clearCurrent(){ localStorage.removeItem('krides_current_user'); }

/* =========================================================
   NAV UPDATE - SHOW USER / LOGOUT
   ========================================================= */
function updateAuthNav(){
  const user = getCurrent();
  const nav = document.querySelector('.nav-buttons');
  if(!nav) return;
  const carsLink = nav.querySelector('a[href="cars.html"]');
  const carsHTML = carsLink ? carsLink.outerHTML : '<a href="cars.html" class="btn btn-cars">Cars</a>';
  if(user){
    const display = user.name || user.email.split('@')[0];
    nav.innerHTML = `${carsHTML}<span class="nav-user"><i class="fa-regular fa-user"></i> ${display}</span><a href="#" class="btn btn-login" id="logoutBtn">Logout</a>`;
    const lb = document.getElementById('logoutBtn');
    if(lb) lb.addEventListener('click', (e)=>{ e.preventDefault(); clearCurrent(); updateAuthNav();
      if(location.pathname.includes('auth.html')) location.reload(); else location.reload();
    });
  }
}

/* =========================================================
   MAIN - TOGGLE & FORMS
   ========================================================= */
document.addEventListener('DOMContentLoaded', ()=>{
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const authTitle = document.getElementById('authTitle');
  const authSub = document.getElementById('authSub');

  updateAuthNav();

  /* =========================================================
     ALREADY LOGGED IN STATE
     ========================================================= */
  const cur = getCurrent();
  const authCard = document.getElementById('authCard');
  if(cur && authCard && loginPanel && registerPanel){
    authCard.innerHTML = `<div style="text-align:center; padding:20px 0;">
      <i class="fa-solid fa-circle-check" style="font-size:3rem; color:#28a745; margin-bottom:16px;"></i>
      <h2 style="color:var(--primary); margin-bottom:8px;">You're signed in</h2>
      <p style="color:var(--light-text); margin-bottom:20px;">Welcome, <strong>${cur.name || cur.email}</strong></p>
      <a href="cars.html" class="btn btn-primary" style="width:100%; margin-bottom:10px; display:block;">Browse Cars</a>
      <button class="btn" style="width:100%; border:2px solid var(--primary); background:transparent; color:var(--primary);" id="authLogout">Logout</button>
    </div>`;
    document.getElementById('authLogout').addEventListener('click', ()=>{ clearCurrent(); location.reload(); });
    return;
  }

  /* =========================================================
     TOGGLE PANELS - LOGIN / REGISTER
     ========================================================= */
  function showLoginPanel(){
    if(!loginPanel || !registerPanel) return;
    registerPanel.classList.add('hidden');
    loginPanel.classList.remove('hidden');
    if(authTitle) authTitle.textContent = 'Welcome Back';
    if(authSub) authSub.textContent = 'Sign in to your K-Rides account';
    history.replaceState(null,'','#login');
  }
  function showRegisterPanel(){
    if(!loginPanel || !registerPanel) return;
    loginPanel.classList.add('hidden');
    registerPanel.classList.remove('hidden');
    if(authTitle) authTitle.textContent = 'Create Account';
    if(authSub) authSub.textContent = 'Join K-Rides and find your dream car';
    history.replaceState(null,'','#register');
  }

  if(showRegister) showRegister.addEventListener('click', (e)=>{ e.preventDefault(); showRegisterPanel(); });
  if(showLogin) showLogin.addEventListener('click', (e)=>{ e.preventDefault(); showLoginPanel(); });
  if(location.hash === '#register') showRegisterPanel(); else showLoginPanel();

  /* =========================================================
     PASSWORD TOGGLE - EYE ICON
     ========================================================= */
  document.querySelectorAll('.toggle-pass').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const targetId = btn.dataset.target;
      const inp = document.getElementById(targetId);
      if(!inp) return;
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  });

  /* =========================================================
     FORGOT PASSWORD MODAL (CONTENT ONLY)
     ========================================================= */
  const forgotModal = document.getElementById('forgotModal');
  const forgotLink = document.querySelector('.forgot-link');
  const closeForgot = document.getElementById('closeForgot');
  const forgotForm = document.getElementById('forgotForm');
  const forgotSuccess = document.getElementById('forgotSuccess');
  const forgotDone = document.getElementById('forgotDone');
  const forgotToLogin = document.getElementById('forgotToLogin');
  function openForgot(e){ if(e) e.preventDefault(); if(forgotModal){ forgotModal.style.display='flex'; forgotModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; } }
  function closeForgotModal(){ if(forgotModal){ forgotModal.style.display='none'; forgotModal.setAttribute('aria-hidden','true'); if(forgotForm){ forgotForm.classList.remove('hidden'); forgotForm.style.display=''; } if(forgotSuccess) forgotSuccess.classList.add('hidden'); document.body.style.overflow=''; } }
  if(forgotLink) forgotLink.addEventListener('click', openForgot);
  if(closeForgot) closeForgot.addEventListener('click', closeForgotModal);
  if(forgotDone) forgotDone.addEventListener('click', closeForgotModal);
  if(forgotToLogin) forgotToLogin.addEventListener('click', (e)=>{ e.preventDefault(); closeForgotModal(); });
  if(forgotModal) forgotModal.addEventListener('click', (e)=>{ if(e.target===forgotModal) closeForgotModal(); });
  if(forgotForm){
    forgotForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const em=document.getElementById('forgotEmail');
      const err=document.getElementById('forgotEmailError');
      if(!em.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){ err.textContent='Enter a valid email'; return; }
      err.textContent='';
      forgotForm.classList.add('hidden'); forgotForm.style.display='none';
      if(forgotSuccess) forgotSuccess.classList.remove('hidden');
    });
  }
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && forgotModal && forgotModal.style.display==='flex') closeForgotModal(); });

  /* =========================================================
     LOGIN SUBMIT - LOCALSTORAGE CHECK
     ========================================================= */
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = document.getElementById('loginEmail');
      const pass = document.getElementById('loginPassword');
      const eErr = document.getElementById('loginEmailError');
      const pErr = document.getElementById('loginPasswordError');
      const btn = document.getElementById('loginBtn');
      let ok=true;
      eErr.textContent=''; pErr.textContent='';
      if(!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){ eErr.textContent='Enter a valid email'; ok=false; }
      if(!pass.value || pass.value.length<6){ pErr.textContent='Password must be at least 6 characters'; ok=false; }
      if(!ok) return;
      const users = getUsers();
      const found = users.find(u=> u.email.toLowerCase() === email.value.toLowerCase());
      if(!found){ eErr.textContent='No account with this email. Please register.'; return; }
      if(found.password !== pass.value){ pErr.textContent='Incorrect password'; return; }
      btn.textContent='Signing in...'; btn.disabled=true;
      setTimeout(()=>{
        setCurrent(found);
        localStorage.setItem('krides_user', JSON.stringify(found));
        btn.textContent='Success!'; btn.style.background='#28a745';
        updateAuthNav();
        setTimeout(()=> window.location.href='index.html', 700);
      }, 700);
    });
  }

  /* =========================================================
     REGISTER SUBMIT - SAVE TO LOCALSTORAGE
     ========================================================= */
  const regForm = document.getElementById('registerForm');
  if(regForm){
    regForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fields = [
        ['regName', 'regNameError', v=> v.trim().length>=2, 'Enter full name'],
        ['regEmail', 'regEmailError', v=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Valid email required'],
        ['regPhone', 'regPhoneError', v=> /^\+?[0-9\s\-]{10,15}$/.test(v), 'Enter valid phone'],
        ['regPass', 'regPassError', v=> v.length>=6, 'Min 6 chars'],
      ];
      let ok=true;
      fields.forEach(([inpId, errId, test, msg])=>{
        const inp=document.getElementById(inpId);
        const err=document.getElementById(errId);
        if(!test(inp.value)){ err.textContent=msg; ok=false; } else err.textContent='';
      });
      const confirm = document.getElementById('regConfirm');
      const cErr = document.getElementById('regConfirmError');
      const pass = document.getElementById('regPass');
      if(confirm.value !== pass.value || !confirm.value){ cErr.textContent='Passwords must match'; ok=false; } else cErr.textContent='';
      const agree=document.getElementById('agree');
      const agreeErr=document.getElementById('agreeError');
      if(agreeErr) agreeErr.textContent='';
      if(!agree.checked){ if(agreeErr) agreeErr.textContent='You must agree to Terms & Privacy'; ok=false; }
      if(!ok) return;
      const emailVal = document.getElementById('regEmail').value.trim().toLowerCase();
      const users = getUsers();
      if(users.some(u=> u.email.toLowerCase() === emailVal)){
        document.getElementById('regEmailError').textContent='Email already registered. Please sign in.';
        return;
      }
      const btn=document.getElementById('regBtn');
      btn.textContent='Creating...'; btn.disabled=true;
      setTimeout(()=>{
        const newUser = {
          name: document.getElementById('regName').value.trim(),
          email: emailVal,
          phone: document.getElementById('regPhone').value.trim(),
          password: pass.value
        };
        users.push(newUser);
        saveUsers(users);
        setCurrent(newUser);
        localStorage.setItem('krides_user', JSON.stringify(newUser));
        btn.textContent='Account created!'; btn.style.background='#28a745';
        updateAuthNav();
        setTimeout(()=> { showLoginPanel(); window.scrollTo({top:0, behavior:'smooth'}); btn.textContent='Create Account'; btn.disabled=false; btn.style.background=''; }, 700);
      }, 700);
    });
  }
});

// also update nav on pages without auth.html (index, cars) - run again if indexjs loads after
setTimeout(updateAuthNav, 200);
