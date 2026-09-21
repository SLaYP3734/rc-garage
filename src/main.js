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

const card = (p) => `
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

window.like = (button) => {
  button.classList.toggle('liked');
  button.textContent = button.classList.contains('liked') ? '♥' : '♡';
};

document.querySelector('#app').innerHTML = `
  <div class="app">

    <header>
      <strong><i>RC</i> GARAGE</strong>
      <button id="profileBtn">👤</button>
    </header>

    <main id="homeScreen">

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

  <!-- PROFİL EKRANI -->
  <div id="profileScreen" class="profile-screen">

    <div class="profile-header">
      <button id="profileBack">←</button>
      <strong>Profil</strong>
      <button id="profileLogout">Çıkış</button>
    </div>

    <div class="profile-content">

      <div class="profile-top">

        <div class="profile-avatar" id="profileAvatar">
          S
        </div>

        <div class="profile-info">
          <h2 id="profileUsername">SLaYP</h2>
          <p>RC Garage üyesi</p>
        </div>

      </div>

      <div class="profile-stats">
        <div>
          <strong>0</strong>
          <span>Paylaşım</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Araç</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Takipçi</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Takip</span>
        </div>
      </div>

      <button class="edit-profile">
        ✏️ Profili Düzenle
      </button>

      <div class="garage-section">

        <div class="garage-title">
          <h2>Garajım</h2>
          <button id="addGarageCar">＋ Araç Ekle</button>
        </div>

        <div class="empty-garage">
          <div>🏎️</div>
          <h3>Garajın henüz boş</h3>
          <p>RC araçlarını ekleyerek kendi garajını oluştur.</p>
          <button id="emptyGarageAdd">＋ İlk Aracını Ekle</button>
        </div>

      </div>

    </div>

  </div>

  <style>

  .profile-screen {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 100%;
  max-width: 430px;
  transform: translateX(-50%);
  background: #101010;
  z-index: 100;
  overflow-y: auto;
}

    .profile-screen.show {
      display: block;
    }

    .profile-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
      border-bottom: 1px solid #292929;
      position: sticky;
      top: 0;
      background: #101010;
      z-index: 5;
    }

    .profile-header button {
      border: 0;
      background: transparent;
      color: white;
      font-size: 15px;
      cursor: pointer;
    }

    .profile-header button:first-child {
      font-size: 26px;
    }

    .profile-header button:last-child {
      color: #ff6a00;
      font-weight: 700;
    }

    .profile-content {
      max-width: 600px;
      margin: auto;
      padding: 25px 18px 100px;
    }

    .profile-top {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .profile-avatar {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background: #ff6a00;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      font-weight: 800;
    }

    .profile-info h2 {
      margin: 0 0 5px;
      font-size: 23px;
    }

    .profile-info p {
      margin: 0;
      color: #888;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 28px 0 18px;
      padding: 18px 5px;
      background: #181818;
      border-radius: 15px;
    }

    .profile-stats div {
      text-align: center;
    }

    .profile-stats strong {
      display: block;
      font-size: 20px;
    }

    .profile-stats span {
      display: block;
      color: #888;
      font-size: 12px;
      margin-top: 4px;
    }

    .edit-profile {
      width: 100%;
      padding: 13px;
      border: 1px solid #333;
      border-radius: 10px;
      background: #181818;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .garage-section {
      margin-top: 32px;
    }

    .garage-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .garage-title h2 {
      margin: 0;
    }

    .garage-title button,
    .empty-garage button {
      border: 0;
      border-radius: 9px;
      background: #ff6a00;
      color: white;
      padding: 10px 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .empty-garage {
      border: 1px dashed #333;
      border-radius: 16px;
      padding: 38px 20px;
      text-align: center;
      background: #151515;
    }

    .empty-garage > div {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .empty-garage h3 {
      margin: 8px 0;
    }

    .empty-garage p {
      color: #888;
      font-size: 14px;
      margin: 0 auto 20px;
      max-width: 280px;
    }

    @media (max-width: 480px) {

      .profile-stats {
        gap: 2px;
      }

      .profile-stats strong {
        font-size: 18px;
      }

      .profile-stats span {
        font-size: 11px;
      }

    }

  </style>
`;

const profileScreen = document.querySelector('#profileScreen');
const profileBtn = document.querySelector('#profileBtn');
const navProfile = document.querySelector('#navProfile');
const profileBack = document.querySelector('#profileBack');
const profileLogout = document.querySelector('#profileLogout');
const profileUsername = document.querySelector('#profileUsername');
const profileAvatar = document.querySelector('#profileAvatar');

async function openProfile() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    openAuth();
    return;
  }

  await loadProfile(user.id);

  homeScreen.style.display = 'none';
  profileScreen.classList.add('show');
}

async function loadProfile(userId) {

  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Profil alınamadı:', error);
    return;
  }

  if (data?.username) {
    profileUsername.textContent = data.username;
    profileAvatar.textContent = data.username.charAt(0).toUpperCase();
  }
}

function closeProfile() {
  profileScreen.classList.remove('show');
}

profileBtn.addEventListener('click', openProfile);
navProfile.addEventListener('click', openProfile);
profileBack.addEventListener('click', closeProfile);

profileLogout.addEventListener('click', async () => {

  await supabase.auth.signOut();

  closeProfile();
  updateUserState();

});

const overlay = document.createElement('div');

overlay.id = 'authOverlay';
overlay.className = 'auth-overlay';

overlay.innerHTML = `
  <div class="auth-box">

    <button id="closeAuth" class="auth-close">×</button>

    <div class="auth-logo">
      <strong><i>RC</i> GARAGE</strong>
    </div>

    <h2 id="authTitle">Giriş Yap</h2>

    <p id="authDescription">
      RC Garage'a hoş geldin.
    </p>

    <input
      id="authEmail"
      type="email"
      placeholder="E-posta adresin"
    >

    <input
      id="authPassword"
      type="password"
      placeholder="Şifren"
    >

    <input
      id="authUsername"
      type="text"
      placeholder="Kullanıcı adı"
      style="display:none"
    >

    <button id="authSubmit" class="auth-submit">
      Giriş Yap
    </button>

    <p id="authMessage" class="auth-message"></p>

    <button id="authSwitch" class="auth-switch">
      Hesabın yok mu? Kayıt Ol
    </button>

  </div>
`;

document.body.appendChild(overlay);

const closeAuth = document.querySelector('#closeAuth');
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

    authDescription.textContent =
      'RC Garage ailesine katıl.';

    authSubmit.textContent = 'Kayıt Ol';

    authUsername.style.display = 'block';

    authSwitch.textContent =
      'Zaten hesabın var mı? Giriş Yap';

  } else {

    authTitle.textContent = 'Giriş Yap';

    authDescription.textContent =
      "RC Garage'a hoş geldin.";

    authSubmit.textContent = 'Giriş Yap';

    authUsername.style.display = 'none';

    authSwitch.textContent =
      'Hesabın yok mu? Kayıt Ol';

  }

}

closeAuth.addEventListener('click', closeAuthBox);

overlay.addEventListener('click', (event) => {

  if (event.target === overlay) {
    closeAuthBox();
  }

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

    authMessage.textContent =
      'E-posta ve şifre alanlarını doldur.';

    return;

  }

  authSubmit.disabled = true;

  authMessage.textContent =
    'İşlem yapılıyor...';

  try {

    if (registerMode) {

      const username = authUsername.value.trim();

      if (!username) {

        authMessage.textContent =
          'Kullanıcı adı gir.';

        authSubmit.disabled = false;

        return;

      }

      const { error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });

      if (error) {
        throw error;
      }

      authMessage.textContent =
        'Kayıt başarılı! Şimdi giriş yapabilirsin.';

      registerMode = false;

      updateAuthMode();

    } else {

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      authMessage.textContent =
        'Giriş başarılı!';

      setTimeout(() => {

        closeAuthBox();

        updateUserState();

      }, 700);

    }

  } catch (error) {

    authMessage.textContent =
      error.message || 'Bir hata oluştu.';

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

.hidden {
  display: none !important;
}
