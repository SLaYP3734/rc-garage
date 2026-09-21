```javascript
import './style.css';
import { supabase } from './supabase.js';

const posts = [
  {
    u: 'RC_Mert',
    m: 'Traxxas Maxx 4S',
    t: "2'den 3'e geçerken hafif vuruntu yapıyor. Sizce normal mi?",
    i: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    l: 24,
    c: 8
  },
  {
    u: 'GarageTR',
    m: 'Arrma Kraton 6S',
    t: 'Hafta sonu yeni setup ile ilk deneme. 🔥',
    i: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1000&q=80',
    l: 41,
    c: 12
  }
];

const card = p => `
<article class="post">
  <div class="head">
    <div class="avatar">${p.u[0]}</div>
    <div>
      <b>${p.u}</b>
      <small>${p.m}</small>
    </div>
    <button>•••</button>
  </div>

  <img class="pic" src="${p.i}" alt="${p.m}">

  <div class="actions">
    <button onclick="like(this)">♡</button>
    <button>💬</button>
    <button>↗</button>
  </div>

  <div class="body">
    <b>${p.l} beğeni</b>
    <p>${p.t}</p>
    <small>${p.c} yorumun tümünü gör</small>
  </div>
</article>
`;

window.like = b => {
  b.classList.toggle('liked');
  b.textContent = b.classList.contains('liked') ? '♥' : '♡';
};

document.querySelector('#app').innerHTML = `
<div class="app">

  <header>
    <strong><i>RC</i> GARAGE</strong>
    <button id="profileBtn">👤</button>
  </header>

  <main>
    <div class="search">
      ⌕
      <input placeholder="RC, model veya sorun ara...">
    </div>

    <div class="stories">
      <div class="story add">＋<small>Garajım</small></div>
      <div class="story">MAXX<small>Maxx</small></div>
      <div class="story">ARRMA<small>Arrma</small></div>
      <div class="story">4S<small>Setup</small></div>
      <div class="story">🔧<small>Teknik</small></div>
    </div>

    <div class="quick">
      <button>🔧 Sorun Sor</button>
      <button>🛒 Al / Sat</button>
    </div>

    <div class="title">
      <h2>Topluluk</h2>
      <button>Yeni ▾</button>
    </div>

    ${posts.map(card).join('')}
  </main>

  <nav>
    <button class="active">⌂<small>Akış</small></button>
    <button>🔧<small>Sorun</small></button>
    <button class="plus">＋</button>
    <button>🛒<small>Al / Sat</small></button>
    <button id="navProfile">👤<small>Profil</small></button>
  </nav>

</div>

<div id="authOverlay" class="auth-overlay">
  <div class="auth-box">

    <button id="closeAuth" class="auth-close">×</button>

    <div class="auth-logo">
      <strong><i>RC</i> GARAGE</strong>
    </div>

    <h2 id="authTitle">Giriş Yap</h2>
    <p id="authDescription">RC Garage'a hoş geldin.</p>

    <input id="authEmail" type="email" placeholder="E-posta adresin">

    <input id="authPassword" type="password" placeholder="Şifren">

    <input id="authUsername" type="text" placeholder="Kullanıcı adı" style="display:none">

    <button id="authSubmit" class="auth-submit">Giriş Yap</button>

    <p id="authMessage" class="auth-message"></p>

    <button id="authSwitch" class="auth-switch">
      Hesabın yok mu? Kayıt Ol
    </button>

  </div>
</div>

<style>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.82);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.auth-overlay.show {
  display: flex;
}

.auth-box {
  width: 100%;
  max-width: 390px;
  background: #181818;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 28px 22px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
}

.auth-close {
  position: absolute;
  right: 15px;
  top: 12px;
  border: 0;
  background: transparent;
  color: #aaa;
  font-size: 30px;
  cursor: pointer;
}

.auth-logo {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
}

.auth-logo i {
  color: #ff6a00;
  font-style: normal;
}

.auth-box h2 {
  text-align: center;
  margin: 0 0 6px;
}

.auth-box > p {
  text-align: center;
  color: #999;
  margin-bottom: 20px;
}

.auth-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #3a3a3a;
  background: #101010;
  color: white;
  outline: none;
}

.auth-submit {
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: 10px;
  background: #ff6a00;
  color: white;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
}

.auth-switch {
  width: 100%;
  margin-top: 16px;
  border: 0;
  background: transparent;
  color: #ff6a00;
  cursor: pointer;
}

.auth-message {
  min-height: 20px;
  margin: 10px 0 0 !important;
  font-size: 13px;
}
</style>
`;

const overlay = document.querySelector('#authOverlay');
const closeAuth = document.querySelector('#closeAuth');
const profileBtn = document.querySelector('#profileBtn');
const navProfile = document.querySelector('#navProfile');

const authTitle = document.querySelector('#authTitle');
const authDescription = document.querySelector('#authDescription');
const authSubmit = document.querySelector('#authSubmit');
const authSwitch = document.querySelector('#authSwitch');
const authEmail = document.querySelector('#authEmail');
const authPassword = document.querySelector('#authPassword');
const authUsername = document.querySelector('#authUsername');
const authMessage = document.querySelector('#authMessage');

let registerMode = false;

function openAuth() {
  overlay.classList.add('show');
  authMessage.textContent = '';
}

function closeAuthBox() {
  overlay.classList.remove('show');
}

function updateAuthMode() {
  if (registerMode) {
    authTitle.textContent = 'Kayıt Ol';
    authDescription.textContent = 'RC Garage ailesine katıl.';
    authSubmit.textContent = 'Kayıt Ol';
    authUsername.style.display = 'block';
    authSwitch.textContent = 'Zaten hesabın var mı? Giriş Yap';
  } else {
    authTitle.textContent = 'Giriş Yap';
    authDescription.textContent = 'RC Garage'a hoş geldin.';
    authSubmit.textContent = 'Giriş Yap';
    authUsername.style.display = 'none';
    authSwitch.textContent = 'Hesabın yok mu? Kayıt Ol';
  }
}

profileBtn.addEventListener('click', openAuth);
navProfile.addEventListener('click', openAuth);
closeAuth.addEventListener('click', closeAuthBox);

overlay.addEventListener('click', e => {
  if (e.target === overlay) closeAuthBox();
});

authSwitch.addEventListener('click', () => {
  registerMode = !registerMode;
  updateAuthMode();
  authMessage.textContent = '';
});

authSubmit.addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authMessage.textContent = 'E-posta ve şifre alanlarını doldur.';
    return;
  }

  authSubmit.disabled = true;
  authMessage.textContent = 'İşlem yapılıyor...';

  try {
    if (registerMode) {
      const username = authUsername.value.trim();

      if (!username) {
        authMessage.textContent = 'Kullanıcı adı gir.';
        authSubmit.disabled = false;
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) throw error;

      authMessage.textContent = 'Kayıt başarılı! Şimdi giriş yapabilirsin.';
      registerMode = false;
      updateAuthMode();

    } else {

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      authMessage.textContent = 'Giriş başarılı!';

      setTimeout(() => {
        closeAuthBox();
        updateUserState();
      }, 700);
    }

  } catch (error) {
    authMessage.textContent = error.message || 'Bir hata oluştu.';
  }

  authSubmit.disabled = false;
});

async function updateUserState() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    profileBtn.textContent = '✓';
  } else {
    profileBtn.textContent = '👤';
  }
}

supabase.auth.onAuthStateChange(() => {
  updateUserState();
});

updateAuthMode();
updateUserState();
```
