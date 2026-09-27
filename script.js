/* =========================================================
   TEAM SEARCH CS2 — Часть 1: база
   ========================================================= */

// ===== ХРАНИЛИЩЕ (localStorage) =====
const DB = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem('tscs2_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try {
      localStorage.setItem('tscs2_' + key, JSON.stringify(value));
    } catch (e) {}
  }
};

// ===== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ =====
let currentUser = DB.get('currentUser', null);
let teams = DB.get('teams', []);
let invites = DB.get('invites', []);

// ===== ЯЗЫК =====
let currentLang = DB.get('lang', 'ru');

// ===== ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ =====
function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Обновление данных при переходе
  if (page === 'home' || page === 'teams') renderTeams();
  if (page === 'invites') renderInvites();
  if (page === 'profile') renderProfile();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ТОСТ (уведомление) =====
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ===== МОДАЛКА =====
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-bg').classList.add('show');
}
function closeModal() {
  document.getElementById('modal-bg').classList.remove('show');
}

// ===== ПЕРЕВОДЫ =====
const I18N = {
  ru: {
    nav_teams: 'Команды',
    nav_invites: 'Приглашения',
    nav_profile: 'Профиль',
    nav_login: 'Войти',
    nav_logout: 'Выйти',
    hero_title: 'Найди свою команду в CS2',
    hero_sub: 'Платформа для поиска тиммейтов. Создавай команду, отправляй приглашения, играй вместе.',
    hero_create: 'Создать команду',
    hero_browse: 'Смотреть команды',
    home_recent: 'Недавние команды',
    home_all: 'Все команды →',
    teams_title: 'Команды',
    filter_all_roles: 'Все роли',
    filter_any_elo: 'Любое ЭЛО',
    create_title: 'Создать команду',
    create_sub: 'Заполни информацию о команде. Макс. ЭЛО — 5000.',
    f_name: 'Название команды',
    f_desc: 'Описание',
    f_elo: 'Максимальное ЭЛО',
    f_elo_hint: 'От 0 до 5000',
    f_req: 'Требования к игрокам',
    f_req_hint: 'Не более 250 символов',
    f_roles: 'Нужные роли',
    f_password: 'Пароль',
    f_nick: 'Никнейм',
    create_btn: 'Создать команду',
    auth_login: 'Вход',
    auth_register: 'Регистрация',
    login_title: 'С возвращением',
    login_sub: 'Войди, чтобы продолжить поиск команды.',
    login_btn: 'Войти',
    reg_title: 'Создать аккаунт',
    reg_sub: 'Подтверждение придёт на Gmail.',
    reg_btn: 'Зарегистрироваться',
    discord_login: 'Войти через Discord',
    or: 'или',
    invites_title: 'Приглашения',
    invites_in: 'Входящие',
    invites_out: 'Исходящие',
    pf_elo: 'ЭЛО',
    pf_role: 'Роль',
    pf_team: 'Команда',
    pf_status: 'Статус',
    pf_my_teams: 'Мои команды',
    pf_new_team: '+ Создать команду',
    footer_text: 'Найди свою команду'
  },
  en: {
    nav_teams: 'Teams',
    nav_invites: 'Invites',
    nav_profile: 'Profile',
    nav_login: 'Login',
    nav_logout: 'Logout',
    hero_title: 'Find your CS2 team',
    hero_sub: 'Platform for finding teammates. Create a team, send invites, play together.',
    hero_create: 'Create team',
    hero_browse: 'Browse teams',
    home_recent: 'Recent teams',
    home_all: 'All teams →',
    teams_title: 'Teams',
    filter_all_roles: 'All roles',
    filter_any_elo: 'Any ELO',
    create_title: 'Create team',
    create_sub: 'Fill in team info. Max ELO — 5000.',
    f_name: 'Team name',
    f_desc: 'Description',
    f_elo: 'Max ELO',
    f_elo_hint: 'From 0 to 5000',
    f_req: 'Player requirements',
    f_req_hint: 'Max 250 characters',
    f_roles: 'Needed roles',
    f_password: 'Password',
    f_nick: 'Nickname',
    create_btn: 'Create team',
    auth_login: 'Login',
    auth_register: 'Register',
    login_title: 'Welcome back',
    login_sub: 'Log in to continue finding a team.',
    login_btn: 'Log in',
    reg_title: 'Create account',
    reg_sub: 'Confirmation will be sent to Gmail.',
    reg_btn: 'Register',
    discord_login: 'Login with Discord',
    or: 'or',
    invites_title: 'Invites',
    invites_in: 'Incoming',
    invites_out: 'Outgoing',
    pf_elo: 'ELO',
    pf_role: 'Role',
    pf_team: 'Team',
    pf_status: 'Status',
    pf_my_teams: 'My teams',
    pf_new_team: '+ Create team',
    footer_text: 'Find your team'
  }
};

function setLang(lang) {
  currentLang = lang;
  DB.set('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang][key]) el.textContent = I18N[lang][key];
  });

  // Обновляем кнопку входа/выхода
  const authBtn = document.getElementById('nav-auth-btn');
  if (authBtn) {
    authBtn.textContent = currentUser
      ? I18N[lang].nav_logout
      : I18N[lang].nav_login;
  }

  // Активная вкладка языка
  document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');

  // Перерисовка динамики
  renderTeams();
  renderInvites();
  renderProfile();
}/* =========================================================
   ЧАСТЬ 2: команды, приглашения, рендер
   ========================================================= */

// ===== ОТРИСОВКА КОМАНД =====
function renderTeams() {
  const homeGrid = document.getElementById('home-grid');
  const teamsGrid = document.getElementById('teams-grid');
  if (!homeGrid || !teamsGrid) return;

  // Фильтры (только для страницы teams)
  const search = (document.getElementById('search')?.value || '').toLowerCase();
  const filterRole = document.getElementById('filter-role')?.value || '';
  const filterElo = parseInt(document.getElementById('filter-elo')?.value || '0', 10);

  let filtered = teams.filter(t => {
    if (search && !t.name.toLowerCase().includes(search)) return false;
    if (filterRole && !t.roles.includes(filterRole)) return false;
    if (filterElo && t.maxElo < filterElo) return false;
    return true;
  });

  // Сортируем: сначала новые
  filtered = [...filtered].reverse();

  // Главная — 3 последних
  const homeTeams = filtered.slice(0, 3);
  homeGrid.innerHTML = homeTeams.length
    ? homeTeams.map(teamCard).join('')
    : '<div class="empty">Пока нет команд. Создай первую!</div>';

  // Страница teams — все
  teamsGrid.innerHTML = filtered.length
    ? filtered.map(teamCard).join('')
    : '<div class="empty">Ничего не найдено</div>';
}

// ===== HTML КАРТОЧКИ КОМАНДЫ =====
function teamCard(t) {
  const filled = t.members.length;
  const total = t.slots;
  const dots = Array.from({ length: total }, (_, i) =>
    `<div class="slot-dot ${i < filled ? 'filled' : ''}"></div>`
  ).join('');

  const rolesHtml = t.roles.map(r => `<span class="role-tag">${r}</span>`).join('');

  return `
    <div class="card" onclick="showTeam('${t.id}')">
      <div class="card-head">
        <div class="card-title">${escapeHtml(t.name)}</div>
        <div class="elo-badge">${t.maxElo}</div>
      </div>
      <div class="card-desc">${escapeHtml(t.desc || 'Без описания')}</div>
      <div class="roles">${rolesHtml || '<span class="role-tag">—</span>'}</div>
      <div class="card-foot">
        <div class="slots">${dots}<span style="margin-left:6px;">${filled}/${total}</span></div>
        <div>${t.ownerName}</div>
      </div>
    </div>
  `;
}

// ===== ПОКАЗ ДЕТАЛЕЙ КОМАНДЫ =====
function showTeam(id) {
  const t = teams.find(x => x.id === id);
  if (!t) return;

  const isOwner = currentUser && t.ownerId === currentUser.id;
  const isMember = currentUser && t.members.includes(currentUser.id);
  const alreadyInvited = currentUser && invites.some(i =>
    i.teamId === t.id && i.toUserId === currentUser.id && i.status === 'pending'
  );

  const rolesHtml = t.roles.map(r => `<span class="role-tag">${r}</span>`).join('');

  let actionBtn = '';
  if (!currentUser) {
    actionBtn = `<button class="btn btn-primary btn-block" onclick="closeModal(); go('auth')">Войти, чтобы подать заявку</button>`;
  } else if (isOwner) {
    actionBtn = `<button class="btn btn-block" disabled style="opacity:0.5;cursor:default;">Это ваша команда</button>`;
  } else if (isMember) {
    actionBtn = `<button class="btn btn-block" disabled style="opacity:0.5;cursor:default;">Вы уже в команде</button>`;
  } else if (alreadyInvited) {
    actionBtn = `<button class="btn btn-block" disabled style="opacity:0.5;cursor:default;">Заявка отправлена</button>`;
  } else if (t.members.length >= t.slots) {
    actionBtn = `<button class="btn btn-block" disabled style="opacity:0.5;cursor:default;">Команда заполнена</button>`;
  } else {
    actionBtn = `<button class="btn btn-primary btn-block" onclick="sendInvite('${t.id}')">Подать заявку</button>`;
  }

  openModal(`
    <h3>${escapeHtml(t.name)}</h3>
    <p class="sub">Владелец: ${escapeHtml(t.ownerName)} • Макс. ЭЛО: ${t.maxElo}</p>
    <p style="color:var(--text-dim);font-size:14px;margin-bottom:16px;">${escapeHtml(t.desc || 'Без описания')}</p>

    <div style="margin-bottom:16px;">
      <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Нужные роли</div>
      <div class="roles">${rolesHtml || '<span class="role-tag">—</span>'}</div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Требования</div>
      <div style="font-size:14px;color:var(--text);">${escapeHtml(t.req || 'Не указаны')}</div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Состав (${t.members.length}/${t.slots})</div>
      <div style="font-size:14px;">${t.memberNames.map(n => '• ' + escapeHtml(n)).join('<br>') || 'Пока никого'}</div>
    </div>

    ${actionBtn}
    <button class="btn btn-block" style="margin-top:8px;" onclick="closeModal()">Закрыть</button>
  `);
}

// ===== СОЗДАНИЕ КОМАНДЫ =====
function createTeam() {
  if (!currentUser) {
    toast('Сначала войди в аккаунт');
    go('auth');
    return;
  }

  const name = document.getElementById('t-name').value.trim();
  const desc = document.getElementById('t-desc').value.trim();
  const maxElo = parseInt(document.getElementById('t-elo').value, 10);
  const req = document.getElementById('t-req').value.trim();
  const roles = Array.from(document.querySelectorAll('.role-check input:checked')).map(c => c.value);

  if (!name) { toast('Введи название команды'); return; }
  if (name.length < 3) { toast('Название минимум 3 символа'); return; }
  if (!maxElo || maxElo < 0 || maxElo > 5000) { toast('ЭЛО от 0 до 5000'); return; }
  if (!roles.length) { toast('Выбери хотя бы одну роль'); return; }
  if (req.length > 250) { toast('Требования не более 250 символов'); return; }

  const team = {
    id: 't_' + Date.now(),
    name,
    desc,
    maxElo,
    req,
    roles,
    slots: 5,
    ownerId: currentUser.id,
    ownerName: currentUser.nick,
    members: [currentUser.id],
    memberNames: [currentUser.nick],
    createdAt: Date.now()
  };

  teams.push(team);
  DB.set('teams', teams);

  // Очистить форму
  document.getElementById('t-name').value = '';
  document.getElementById('t-desc').value = '';
  document.getElementById('t-elo').value = 2500;
  document.getElementById('t-req').value = '';
  document.querySelectorAll('.role-check input:checked').forEach(c => c.checked = false);
  document.getElementById('req-counter').textContent = '0 / 250';
  document.getElementById('elo-val').textContent = '2500';

  toast('Команда создана!');
  go('teams');
}

// ===== ОТПРАВКА ЗАЯВКИ =====
function sendInvite(teamId) {
  if (!currentUser) { go('auth'); return; }
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  if (team.members.includes(currentUser.id)) {
    toast('Ты уже в команде');
    return;
  }

  const exists = invites.some(i =>
    i.teamId === teamId && i.toUserId === currentUser.id && i.status === 'pending'
  );
  if (exists) { toast('Заявка уже отправлена'); return; }

  invites.push({
    id: 'i_' + Date.now(),
    teamId,
    teamName: team.name,
    fromUserId: currentUser.id,
    fromUserName: currentUser.nick,
    toUserId: team.ownerId,
    toUserName: team.ownerName,
    status: 'pending',
    createdAt: Date.now()
  });

  DB.set('invites', invites);
  closeModal();
  toast('Заявка отправлена!');
  renderTeams();
  renderInvites();
}

// ===== ОТРИСОВКА ПРИГЛАШЕНИЙ =====
function renderInvites() {
  const inBox = document.getElementById('invites-in');
  const outBox = document.getElementById('invites-out');
  if (!inBox || !outBox) return;

  if (!currentUser) {
    inBox.innerHTML = '<div class="empty">Войди, чтобы видеть приглашения</div>';
    outBox.innerHTML = '';
    return;
  }

  const incoming = invites.filter(i => i.toUserId === currentUser.id);
  const outgoing = invites.filter(i => i.fromUserId === currentUser.id);

  inBox.innerHTML = incoming.length
    ? incoming.map(inviteRowIn).join('')
    : '<div class="empty">Входящих приглашений нет</div>';

  outBox.innerHTML = outgoing.length
    ? outgoing.map(inviteRowOut).join('')
    : '<div class="empty">Исходящих заявок нет</div>';
}

function inviteRowIn(i) {
  const team = teams.find(t => t.id === i.teamId);
  const isPending = i.status === 'pending';

  let actions = '';
  if (isPending) {
    actions = `
      <button class="btn btn-primary btn-sm" onclick="acceptInvite('${i.id}')">Принять</button>
      <button class="btn btn-sm" onclick="declineInvite('${i.id}')">Отклонить</button>
    `;
  } else if (i.status === 'accepted') {
    actions = '<span style="color:var(--text-dim);font-size:13px;">✓ Принято</span>';
  } else {
    actions = '<span style="color:var(--text-dim);font-size:13px;">✕ Отклонено</span>';
  }

  return `
    <div class="invite-row">
      <div class="invite-info">
        <div class="name">${escapeHtml(i.fromUserName)}</div>
        <div class="meta">Хочет вступить в <b>${escapeHtml(i.teamName)}</b></div>
      </div>
      <div class="invite-actions">${actions}</div>
    </div>
  `;
}

function inviteRowOut(i) {
  const statusText = {
    pending: '⏳ Ожидает',
    accepted: '✓ Принято',
    declined: '✕ Отклонено'
  }[i.status] || '';

  return `
    <div class="invite-row">
      <div class="invite-info">
        <div class="name">${escapeHtml(i.teamName)}</div>
        <div class="meta">Владелец: ${escapeHtml(i.toUserName)}</div>
      </div>
      <div class="invite-actions">
        <span style="color:var(--text-dim);font-size:13px;">${statusText}</span>
      </div>
    </div>
  `;
}

// ===== ПРИНЯТЬ / ОТКЛОНИТЬ =====
function acceptInvite(inviteId) {
  const i = invites.find(x => x.id === inviteId);
  if (!i) return;
  const team = teams.find(t => t.id === i.teamId);
  if (!team) return;

  if (team.members.length >= team.slots) {
    toast('В команде нет свободных мест');
    return;
  }

  if (!team.members.includes(i.fromUserId)) {
    team.members.push(i.fromUserId);
    team.memberNames.push(i.fromUserName);
  }

  i.status = 'accepted';
  DB.set('teams', teams);
  DB.set('invites', invites);

  toast('Игрок принят в команду!');
  renderInvites();
  renderTeams();
}

function declineInvite(inviteId) {
  const i = invites.find(x => x.id === inviteId);
  if (!i) return;
  i.status = 'declined';
  DB.set('invites', invites);
  toast('Заявка отклонена');
  renderInvites();
}

// ===== БЕЗОПАСНОСТЬ HTML =====
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}/* =========================================================
   ЧАСТЬ 3: авторизация, профиль, обработчики, запуск
   ========================================================= */

// ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ВХОД/РЕГИСТРАЦИЯ =====
function switchAuth(mode) {
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-register');
  const loginBox = document.getElementById('auth-login');
  const regBox = document.getElementById('auth-register');

  if (mode === 'login') {
    loginTab.classList.add('active');
    regTab.classList.remove('active');
    loginBox.style.display = 'block';
    regBox.style.display = 'none';
  } else {
    regTab.classList.add('active');
    loginTab.classList.remove('active');
    loginBox.style.display = 'none';
    regBox.style.display = 'block';
  }
}

// ===== РЕГИСТРАЦИЯ =====
function doRegister() {
  const nick = document.getElementById('reg-nick').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const elo = parseInt(document.getElementById('reg-elo').value, 10) || 0;

  if (!nick || nick.length < 3) { toast('Никнейм минимум 3 символа'); return; }
  if (!email || !email.includes('@')) { toast('Введи корректный Email'); return; }
  if (!pass || pass.length < 6) { toast('Пароль минимум 6 символов'); return; }
  if (elo < 0 || elo > 5000) { toast('ЭЛО от 0 до 5000'); return; }

  const users = DB.get('users', []);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    toast('Этот Email уже зарегистрирован');
    return;
  }

  const user = {
    id: 'u_' + Date.now(),
    nick,
    email,
    pass,
    elo,
    role: 'Rifler',
    teamId: null,
    createdAt: Date.now()
  };

  users.push(user);
  DB.set('users', users);

  // Имитация подтверждения Gmail
  toast('Аккаунт создан! Подтверди Gmail (симуляция)');

  currentUser = user;
  DB.set('currentUser', user);

  setTimeout(() => {
    toast('Добро пожаловать, ' + nick + '!');
    go('profile');
    updateAuthUI();
  }, 1200);
}

// ===== ВХОД =====
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;

  if (!email || !pass) { toast('Заполни Email и пароль'); return; }

  const users = DB.get('users', []);
  const user = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.pass === pass
  );

  if (!user) { toast('Неверный Email или пароль'); return; }

  currentUser = user;
  DB.set('currentUser', user);
  toast('С возвращением, ' + user.nick + '!');
  go('profile');
  updateAuthUI();
}

// ===== ВЫХОД =====
function doLogout() {
  currentUser = null;
  DB.set('currentUser', null);
  toast('Ты вышел из аккаунта');
  updateAuthUI();
  go('home');
}

// ===== DISCORD (симуляция) =====
function discordAuth() {
  toast('Discord OAuth появится на реальном сервере');
  setTimeout(() => {
    const demoUser = {
      id: 'u_discord_' + Date.now(),
      nick: 'DiscordUser',
      email: 'discord@demo.local',
      pass: '',
      elo: 2500,
      role: 'Rifler',
      teamId: null,
      createdAt: Date.now()
    };
    currentUser = demoUser;
    DB.set('currentUser', demoUser);
    toast('Вход через Discord (демо)');
    go('profile');
    updateAuthUI();
  }, 1000);
}

// ===== ОБНОВЛЕНИЕ UI ПОСЛЕ ВХОДА =====
function updateAuthUI() {
  const authBtn = document.getElementById('nav-auth-btn');
  if (!authBtn) return;
  authBtn.textContent = currentUser
    ? (I18N[currentLang]?.nav_logout || 'Выйти')
    : (I18N[currentLang]?.nav_login || 'Войти');
}

// ===== ПРОФИЛЬ =====
function renderProfile() {
  const nickEl = document.getElementById('pf-nick');
  const emailEl = document.getElementById('pf-email');
  const avatarEl = document.getElementById('pf-avatar');
  const eloEl = document.getElementById('pf-elo');
  const roleEl = document.getElementById('pf-role');
  const teamEl = document.getElementById('pf-team');
  const statusEl = document.getElementById('pf-status');
  const grid = document.getElementById('profile-grid');

  if (!nickEl) return;

  if (!currentUser) {
    nickEl.textContent = 'Гость';
    emailEl.textContent = 'Войди в аккаунт';
    avatarEl.textContent = '?';
    eloEl.textContent = '—';
    roleEl.textContent = '—';
    teamEl.textContent = 'Нет';
    statusEl.textContent = '—';
    grid.innerHTML = '<div class="empty">Войди, чтобы увидеть свои команды</div>';
    return;
  }

  nickEl.textContent = currentUser.nick;
  emailEl.textContent = currentUser.email;
  avatarEl.textContent = currentUser.nick[0].toUpperCase();
  eloEl.textContent = currentUser.elo;
  roleEl.textContent = currentUser.role;

  const myTeams = teams.filter(t => t.members.includes(currentUser.id));
  teamEl.textContent = myTeams.length ? myTeams[0].name : 'Нет';
  statusEl.textContent = myTeams.length ? 'В команде' : 'Свободен';

  grid.innerHTML = myTeams.length
    ? myTeams.map(teamCard).join('')
    : '<div class="empty">У тебя пока нет команд. Создай первую!</div>';
}

// ===== ОБРАБОТЧИКИ ФОРМ =====
function initFormHandlers() {
  // Счётчик символов в требованиях
  const reqArea = document.getElementById('t-req');
  const reqCounter = document.getElementById('req-counter');
  if (reqArea && reqCounter) {
    reqArea.addEventListener('input', () => {
      const len = reqArea.value.length;
      reqCounter.textContent = len + ' / 250';
      reqCounter.classList.toggle('over', len > 250);
    });
  }

  // ЭЛО — живое значение
  const eloInput = document.getElementById('t-elo');
  const eloVal = document.getElementById('elo-val');
  if (eloInput && eloVal) {
    eloInput.addEventListener('input', () => {
      let v = parseInt(eloInput.value, 10);
      if (isNaN(v)) v = 0;
      if (v > 5000) { v = 5000; eloInput.value = 5000; }
      if (v < 0) { v = 0; eloInput.value = 0; }
      eloVal.textContent = v;
    });
  }

  // Фильтры
  ['search', 'filter-role', 'filter-elo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderTeams);
  });

  // Клик по кнопке "Войти/Выйти" в шапке
  const authBtn = document.getElementById('nav-auth-btn');
  if (authBtn) {
    authBtn.onclick = () => {
      if (currentUser) doLogout();
      else go('auth');
    };
  }
}

// ===== ДЕМО-КОМАНДЫ (если пусто) =====
function seedDemo() {
  if (teams.length > 0) return;

  const demo = [
    {
      id: 't_demo1',
      name: 'Dark Wolves',
      desc: 'Ищем AWPer и IGL для игры на Faceit Level 8+. Тренировки 3 раза в неделю.',
      maxElo: 3500,
      req: 'Возраст 16+, микрофон, Faceit 8+, Discord',
      roles: ['AWPer', 'IGL'],
      slots: 5,
      ownerId: 'u_demo',
      ownerName: 'NightHunter',
      members: ['u_demo'],
      memberNames: ['NightHunter'],
      createdAt: Date.now() - 100000
    },
    {
      id: 't_demo2',
      name: 'Silent Storm',
      desc: 'Казуальная команда для игры вечером. Без токсичности, главное — кайф.',
      maxElo: 2000,
      req: 'Адекватность, микрофон, Discord',
      roles: ['Rifler', 'Support'],
      slots: 5,
      ownerId: 'u_demo2',
      ownerName: 'GhostFrag',
      members: ['u_demo2', 'u_x1'],
      memberNames: ['GhostFrag', 'PlayerX'],
      createdAt: Date.now() - 50000
    },
    {
      id: 't_demo3',
      name: 'Prime Five',
      desc: 'Серьёзный состав для турниров. Только с опытом командной игры.',
      maxElo: 5000,
      req: 'Faceit 10, опыт турниров, 18+, 5+ часов в день',
      roles: ['IGL', 'AWPer', 'Entry', 'Support', 'Lurker'],
      slots: 5,
      ownerId: 'u_demo3',
      ownerName: 'ProPlayer',
      members: ['u_demo3', 'u_a', 'u_b'],
      memberNames: ['ProPlayer', 'Alpha', 'Bravo'],
      createdAt: Date.now() - 20000
    }
  ];

  teams = demo;
  DB.set('teams', teams);
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
  seedDemo();
  initFormHandlers();
  setLang(currentLang);
  updateAuthUI();
  renderTeams();
  renderInvites();
  renderProfile();
  go('home');
});