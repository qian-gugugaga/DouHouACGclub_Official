/* ========================================
   东方动漫社「神秘据点」— 主脚本 (API版)
   ======================================== */

// ---- API Helper ----
var API = {
  base: '',
  token: localStorage.getItem('dfdm_token') || '',
  setToken: function(t) { this.token = t; localStorage.setItem('dfdm_token', t); },
  clearToken: function() { this.token = ''; localStorage.removeItem('dfdm_token'); },
  headers: function() {
    var h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = this.token;
    return h;
  },
  get: function(url) { return fetch(this.base + url, { headers: this.headers() }).then(function(r) { return r.json(); }); },
  post: function(url, data) { return fetch(this.base + url, { method: 'POST', headers: this.headers(), body: JSON.stringify(data) }).then(function(r) { return r.json(); }); },
  put: function(url, data) { return fetch(this.base + url, { method: 'PUT', headers: this.headers(), body: JSON.stringify(data) }).then(function(r) { return r.json(); }); },
  del: function(url) { return fetch(this.base + url, { method: 'DELETE', headers: this.headers() }).then(function(r) { return r.json(); }); }
};

// ---- Auth State ----
var currentUser = null;
var unreadCount = 0;

function fetchUser() {
  if (!API.token) { updateHeaderAuth(); return Promise.resolve(null); }
  return API.get('/api/auth/me').then(function(data) {
    if (data.user) { currentUser = data.user; updateHeaderAuth(); }
    return data.user || null;
  }).catch(function() {
    API.clearToken();
    updateHeaderAuth();
    return null;
  });
}

function fetchNotifications() {
  if (!API.token) return;
  API.get('/api/notifications').then(function(data) {
    unreadCount = data.unreadCount || 0;
    updateNotifyBadge();
  });
}

function updateNotifyBadge() {
  var badge = document.getElementById('notifyBadge');
  if (badge) {
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
}

function renderNotifyDropdown() {
  API.get('/api/notifications').then(function(data) {
    var list = document.getElementById('notifyList');
    if (!list) return;
    unreadCount = data.unreadCount || 0;
    updateNotifyBadge();
    var notifs = data.notifications || [];
    if (notifs.length === 0) {
      list.innerHTML = '<div class="notify-empty">暂无通知~</div>';
    } else {
      list.innerHTML = notifs.map(function(n) {
        var link = '';
        if (n.type === 'reply' || n.type === 'like') link = '/guestbook.html?thread=' + n.related_id;
        else if (n.type === 'comment' || n.type === 'comment_reply') {
          if (n.content.indexOf('创作') > -1) link = '/fanworks.html?id=' + n.related_id;
          else if (n.content.indexOf('集市') > -1) link = '/market.html?id=' + n.related_id;
        } else if (n.type === 'approve' && n.content.indexOf('创作') > -1) link = '/fanworks.html?id=' + n.related_id;
        else if (n.type === 'approve' && n.content.indexOf('集市') > -1) link = '/market.html?id=' + n.related_id;
        var icon = n.type === 'like' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="#fb7299" stroke="#fb7299" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' : '';
        return '<div class="notify-item' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '"' +
          (link ? ' style="cursor:pointer;" data-link="' + link + '"' : '') + '>' +
          icon + escapeHTML(n.content) + '<br><span style="font-size:11px;color:#999;">' + n.created_at + '</span></div>';
      }).join('');
      list.querySelectorAll('.notify-item').forEach(function(item) {
        item.addEventListener('click', function() {
          API.put('/api/notifications/' + this.dataset.id + '/read');
          this.classList.remove('unread');
          unreadCount = Math.max(0, unreadCount - 1);
          updateNotifyBadge();
          if (this.dataset.link) {
            var dd = document.getElementById('notifyDropdown');
            if (dd) dd.classList.remove('open');
            window.location.href = this.dataset.link;
          }
        });
      });
    }
  });
}

function updateHeaderAuth() {
  var authEl = document.getElementById('headerAuth');
  if (!authEl) return;
  if (currentUser) {
    authEl.innerHTML = '<div class="header-user-area">' +
      '<a href="profile.html?id=' + currentUser.id + '" class="username" title="个人主页">' + escapeHTML(currentUser.username) + '</a>' +
      '<span class="notify-bell" id="notifyBell" title="通知">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
      '<span class="badge" id="notifyBadge" style="display:none;">0</span>' +
      '</span>' +
      (currentUser.role === 'admin' ? '<a href="admin.html" style="font-size:12px;color:#e65100;text-decoration:none;font-weight:500;margin:0 4px;" title="管理后台">后台</a>' : '') +
      '<span style="font-size:12px;color:var(--text-muted);cursor:pointer;" id="logoutLink">登出</span>' +
      '<div class="notify-dropdown" id="notifyDropdown">' +
      '<div class="notify-header"><span>消息通知</span><span class="mark-read" id="markAllRead">全部已读</span></div>' +
      '<div id="notifyList"></div></div>' +
      '</div>';
    document.getElementById('notifyBell').addEventListener('click', function(e) {
      e.stopPropagation();
      var dd = document.getElementById('notifyDropdown');
      dd.classList.toggle('open');
      if (dd.classList.contains('open')) renderNotifyDropdown();
    });
    document.getElementById('markAllRead').addEventListener('click', function(e) {
      e.stopPropagation();
      API.put('/api/notifications/read-all').then(function() {
        unreadCount = 0; updateNotifyBadge();
        renderNotifyDropdown();
      });
    });
    document.getElementById('logoutLink').addEventListener('click', function() {
      API.post('/api/auth/logout').finally(function() {
        API.clearToken(); currentUser = null; updateHeaderAuth();
      });
    });
    document.addEventListener('click', function(e) {
      var dd = document.getElementById('notifyDropdown');
      if (dd && !e.target.closest('.notify-bell') && !e.target.closest('.notify-dropdown')) {
        dd.classList.remove('open');
      }
    });
    fetchNotifications();
  } else {
    authEl.innerHTML = '<button class="auth-btn" id="btnLogin">登录</button>' +
      '<button class="auth-btn primary" id="btnRegister">注册</button>';
    document.getElementById('btnLogin').addEventListener('click', function() { openAuthModal('login'); });
    document.getElementById('btnRegister').addEventListener('click', function() { openAuthModal('register'); });
  }
}

// ---- Login / Register / Account Recovery Modal ----
var AUTH_MODES = { login: 1, register: 1, resetPassword: 1, recoverUsername: 1 };

function openAuthModal(mode) {
  if (typeof mode !== 'string' || !AUTH_MODES[mode]) mode = 'login';
  var modal = document.getElementById('authModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal';
    modal.innerHTML = '<div class="auth-box">' +
      '<button class="auth-close">&times;</button>' +
      '<h2 id="authTitle">登录</h2>' +
      '<div class="form-group" id="userGroup"><label>用户名</label><input type="text" id="authUsername" placeholder="请输入用户名" maxlength="20"></div>' +
      '<div class="form-group" id="pwdGroup"><label id="pwdLabel">密码</label><input type="password" id="authPassword" placeholder="请输入密码"></div>' +
      '<div class="form-group" id="phoneGroup" style="display:none;"><label>手机号</label><input type="text" id="authPhone" placeholder="注册时填写的手机号" maxlength="15"></div>' +
      '<div class="form-group" id="qqGroup" style="display:none;"><label>QQ号</label><input type="text" id="authQQ" placeholder="注册时填写的QQ号" maxlength="20"></div>' +
      '<div class="form-group" id="pass2Group" style="display:none;"><label>确认密码</label><input type="password" id="authPassword2" placeholder="请再次输入新密码"></div>' +
      '<div id="authHint" style="display:none;font-size:12px;line-height:1.7;color:#8a8a93;background:#fafafa;border-radius:6px;padding:8px 10px;margin:2px 0 10px;"></div>' +
      '<div id="authResult" style="display:none;text-align:center;margin:2px 0 10px;"></div>' +
      '<button class="auth-submit-btn" id="authSubmitBtn">登 录</button>' +
      '<div class="auth-msg" id="authMsg"></div>' +
      '<div class="auth-switch" id="authSwitch">没有账号？<a id="authSwitchLink">立即注册</a></div>' +
      '<div class="auth-switch" id="authLinks" style="margin-top:8px;display:flex;gap:18px;justify-content:center;">' +
      '<a id="forgotPwdLink" style="font-size:13px;color:var(--accent);cursor:pointer;">忘记密码？</a>' +
      '<a id="forgotUserLink" style="font-size:13px;color:var(--accent);cursor:pointer;">忘记用户名？</a>' +
      '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.auth-close').addEventListener('click', function() { modal.classList.remove('open'); });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });
    document.getElementById('authSubmitBtn').addEventListener('click', function() { handleAuthSubmit(); });
    document.getElementById('authPassword').addEventListener('keydown', function(e) { if (e.key === 'Enter') handleAuthSubmit(); });
    document.getElementById('authPhone').addEventListener('keydown', function(e) { if (e.key === 'Enter') handleAuthSubmit(); });
    document.getElementById('authQQ').addEventListener('keydown', function(e) { if (e.key === 'Enter') handleAuthSubmit(); });
    document.getElementById('authSwitch').addEventListener('click', function(e) {
      if (e.target.id === 'authSwitchLink') {
        var m = document.getElementById('authModal')._mode;
        openAuthModal(m === 'login' ? 'register' : 'login');
      }
    });
    document.getElementById('forgotPwdLink').addEventListener('click', function() { openAuthModal('resetPassword'); });
    document.getElementById('forgotUserLink').addEventListener('click', function() { openAuthModal('recoverUsername'); });
  }

  var title = document.getElementById('authTitle');
  var btn = document.getElementById('authSubmitBtn');
  var switchText = document.getElementById('authSwitch');
  var links = document.getElementById('authLinks');
  var hint = document.getElementById('authHint');
  var result = document.getElementById('authResult');
  var msg = document.getElementById('authMsg');

  var TITLES = { login: '登录', register: '注册', resetPassword: '重置密码', recoverUsername: '找回用户名' };
  var BTNS = { login: '登 录', register: '注 册', resetPassword: '重 置', recoverUsername: '查 找' };
  var SWITCH = {
    login: '没有账号？<a id="authSwitchLink">立即注册</a>',
    register: '已有账号？<a id="authSwitchLink">去登录</a>',
    resetPassword: '想起密码了？<a id="authSwitchLink">去登录</a>',
    recoverUsername: '想起用户名了？<a id="authSwitchLink">去登录</a>'
  };
  var HINTS = {
    resetPassword: '需要验证你注册时填写的手机号和 QQ 号。两个都忘了的话，请联系社团管理员人工处理。',
    recoverUsername: '填写注册时填写的手机号和 QQ 号，即可查出对应的用户名。'
  };

  if (title) title.textContent = TITLES[mode];
  if (btn) btn.textContent = BTNS[mode];
  if (switchText) switchText.innerHTML = SWITCH[mode];
  if (links) links.style.display = mode === 'login' ? 'flex' : 'none';
  if (hint) {
    hint.textContent = HINTS[mode] || '';
    hint.style.display = HINTS[mode] ? 'block' : 'none';
  }
  if (result) { result.style.display = 'none'; result.innerHTML = ''; }
  if (msg) { msg.textContent = ''; msg.className = 'auth-msg'; }

  var showUser = mode !== 'recoverUsername';
  var showPwd = mode !== 'recoverUsername';
  var showPass2 = mode === 'register' || mode === 'resetPassword';
  var showContact = mode === 'register' || mode === 'resetPassword' || mode === 'recoverUsername';

  var userGroup = document.getElementById('userGroup');
  var pwdGroup = document.getElementById('pwdGroup');
  if (userGroup) userGroup.style.display = showUser ? 'block' : 'none';
  if (pwdGroup) pwdGroup.style.display = showPwd ? 'block' : 'none';
  document.getElementById('phoneGroup').style.display = showContact ? 'block' : 'none';
  document.getElementById('qqGroup').style.display = showContact ? 'block' : 'none';
  document.getElementById('pass2Group').style.display = showPass2 ? 'block' : 'none';
  var pwdLabel = document.getElementById('pwdLabel');
  if (pwdLabel) pwdLabel.textContent = mode === 'resetPassword' ? '新密码' : '密码';
  var pwdEl = document.getElementById('authPassword');
  if (pwdEl) pwdEl.placeholder = mode === 'resetPassword' ? '请输入新密码' : '请输入密码';

  // 用 flex order 让字段顺序随模式变化（用户名 → 手机号 → QQ号 → 密码 → 确认密码）
  var box = modal.querySelector('.auth-box');
  if (box) { box.style.display = 'flex'; box.style.flexDirection = 'column'; }
  var FIXED_ORDER = { authTitle: 1, authHint: 7, authResult: 8, authSubmitBtn: 9, authMsg: 10, authSwitch: 11, authLinks: 12 };
  var GROUP_ORDER = { userGroup: 2, phoneGroup: 3, qqGroup: 4, pwdGroup: 5, pass2Group: 6 };
  Object.keys(FIXED_ORDER).forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.order = FIXED_ORDER[id];
  });
  Object.keys(GROUP_ORDER).forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.order = GROUP_ORDER[id];
  });

  modal._mode = mode;
  modal.classList.add('open');
}

function handleAuthSubmit() {
  var modal = document.getElementById('authModal');
  var mode = modal._mode || 'login';
  var username = document.getElementById('authUsername').value.trim();
  var password = document.getElementById('authPassword').value.trim();
  var qqEl = document.getElementById('authQQ'); var qq = qqEl ? qqEl.value.trim() : '';
  var phoneEl = document.getElementById('authPhone'); var phone = phoneEl ? phoneEl.value.trim() : '';
  var pass2El = document.getElementById('authPassword2'); var pass2 = pass2El ? pass2El.value : '';
  var msg = document.getElementById('authMsg');
  var btn = document.getElementById('authSubmitBtn');
  var label = { login: '登 录', register: '注 册', resetPassword: '重 置', recoverUsername: '查 找' }[mode] || '登 录';
  msg.textContent = ''; msg.className = 'auth-msg';

  if (mode !== 'recoverUsername') {
    if (!username) { msg.textContent = '请输入用户名'; msg.className = 'auth-msg error'; return; }
    if (!password) { msg.textContent = '请输入密码'; msg.className = 'auth-msg error'; return; }
  }
  if (mode === 'resetPassword') {
    if (!phone) { msg.textContent = '请输入手机号以验证身份'; msg.className = 'auth-msg error'; return; }
    if (!qq) { msg.textContent = '请输入QQ号以验证身份'; msg.className = 'auth-msg error'; return; }
    if (password !== pass2) { msg.textContent = '两次密码输入不一致'; msg.className = 'auth-msg error'; return; }
  }
  if (mode === 'recoverUsername') {
    if (!phone) { msg.textContent = '请输入注册时填写的手机号'; msg.className = 'auth-msg error'; return; }
    if (!qq) { msg.textContent = '请输入注册时填写的QQ号'; msg.className = 'auth-msg error'; return; }
  }

  btn.disabled = true; btn.textContent = '处理中...';
  var endpoint = '/api/auth/login';
  var payload = { username: username, password: password, password2: pass2, phone: phone, qq: qq };
  if (mode === 'register') endpoint = '/api/auth/register';
  else if (mode === 'resetPassword') { endpoint = '/api/auth/reset-password'; payload = { username: username, phone: phone, qq: qq, newPassword: password }; }
  else if (mode === 'recoverUsername') { endpoint = '/api/auth/find-username'; payload = { phone: phone, qq: qq }; }

  API.post(endpoint, payload).then(function(data) {
    btn.disabled = false; btn.textContent = label;
    if (data.error) { msg.textContent = data.error; msg.className = 'auth-msg error'; return; }
    if (mode === 'register') {
      msg.textContent = '注册成功！请登录'; msg.className = 'auth-msg success';
      setTimeout(function() { openAuthModal('login'); }, 1000);
    } else if (mode === 'resetPassword') {
      msg.textContent = '密码重置成功！请用新密码登录'; msg.className = 'auth-msg success';
      setTimeout(function() { openAuthModal('login'); document.getElementById('authUsername').value = username; }, 1500);
    } else if (mode === 'recoverUsername') {
      var result = document.getElementById('authResult');
      result.style.display = 'block';
      result.innerHTML = '<div style="font-size:12px;color:var(--text-muted);">匹配到的用户名</div>' +
        '<div style="font-size:20px;font-weight:600;color:var(--accent);margin:6px 0 2px;">' + escapeHTML(data.username) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + escapeHTML(data.hint || '') + '</div>';
    } else {
      API.setToken(data.token);
      currentUser = data.user;
      updateHeaderAuth();
      modal.classList.remove('open');
      document.getElementById('authUsername').value = '';
      document.getElementById('authPassword').value = '';
    }
  }).catch(function() {
    btn.disabled = false; btn.textContent = label;
    msg.textContent = '网络错误，请重试'; msg.className = 'auth-msg error';
  });
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function titleBadge(title) {
  if (!title) return '<span class="user-badge badge-member">东方社员</span>';
  if (title === '社长' || title === 'legend') return '<span class="user-badge badge-leader">' + escapeHTML(title) + '</span>';
  return '<span class="user-badge badge-custom">' + escapeHTML(title) + '</span>';
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function() {

  // --- Header Auth ---
  fetchUser().then(function() {
    window.currentUser = currentUser;
  });

  // --- Mobile Menu Toggle ---
  var menuBtn = document.getElementById('mobileMenuBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function() { mobileNav.classList.toggle('open'); });
    mobileNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() { mobileNav.classList.remove('open'); });
    });
  }

  // --- Back to Top ---
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() { backToTop.classList.toggle('visible', window.scrollY > 400); });
    backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // --- Stats Counter (waits for API data, then animates) ---
  var statEls = document.querySelectorAll('#statMembers, #statWorks, #statEvents, #statMonths');
  if (statEls.length > 0) {
    var animateStats = function() {
      statEls.forEach(function(el) {
        var raw = el.textContent.replace(/,/g, '');
        var target = parseInt(raw, 10);
        if (isNaN(target) || target <= 0) return;
        var current = 0, step = Math.ceil(target / 60);
        var timer = setInterval(function() {
          current += step;
          if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); }
          else { el.textContent = current.toLocaleString(); }
        }, 30);
      });
    };
    var tryAnimate = function(attempts) {
      attempts = attempts || 0;
      // Check if API data has arrived
      var first = document.getElementById('statMembers');
      if (first && parseInt(first.textContent) > 0) { animateStats(); return; }
      if (attempts < 20) setTimeout(function() { tryAnimate(attempts + 1); }, 150);
      else animateStats(); // fallback after 3s
    };
    var statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if (e.isIntersecting) { tryAnimate(); observer.unobserve(e.target); } });
      }, { threshold: 0.5 });
      observer.observe(statsSection);
    } else { tryAnimate(); }
  }

  // --- Stats Counter (reads from API-populated values) ---

  // --- Lazy Load ---
  document.querySelectorAll('img.lazy').forEach(function(img) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { if (img.dataset.src) img.src = img.dataset.src; img.classList.add('loaded'); }
        });
      }, { rootMargin: '200px' }).observe(img);
    }
  });

  // --- Lightbox ---
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var closeLb = function() { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
    lightbox.querySelector('.close-btn').addEventListener('click', closeLb);
    lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb(); });
  }

  // --- Like Button (event delegation + bounce animation) ---
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.like-btn');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    if (!API.token) { openAuthModal('login'); return; }
    var postId = btn.dataset.post;
    if (!postId) return;
    var self = btn;
    self.classList.add('bounce');
    setTimeout(function() { self.classList.remove('bounce'); }, 400);
    API.post('/api/guestbook/' + postId + '/like').then(function(d) {
      if (d.error) return;
      self.querySelector('.count').textContent = d.likes;
      if (d.liked) self.classList.add('liked'); else self.classList.remove('liked');
    });
  });

  // --- Guestbook ---
  var commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!API.token) { openAuthModal('login'); return; }
      var textarea = this.querySelector('textarea');
      var text = textarea ? textarea.value.trim() : '';
      if (!text) return;
      var parentId = this.dataset.replyTo || null;
      API.post('/api/guestbook', { text: text, parentId: parentId ? parseInt(parentId) : null }).then(function(data) {
        if (data.error) return;
        if (textarea) textarea.value = '';
        delete commentForm.dataset.replyTo;
        var ri = document.getElementById('replyIndicator');
        if (ri) ri.style.display = 'none';
        if (typeof loadGuestbookMessages === 'function') loadGuestbookMessages();
      });
    });
  }

  // --- Submission Modal ---
  setupSubmissionModal();
  // --- Market Submission ---
  setupMarketSubmission();
  // --- Content Detail Modal ---
  setupContentModal();
  // --- Market Detail Modal ---
  setupMarketDetail();

  // Expose
  window.API = API;
  window.currentUser = currentUser;
  window.openAuthModal = openAuthModal;
  window.escapeHTML = escapeHTML;
});

// ---- Submission Modal ----
function setupSubmissionModal() {
  var submitBtn = document.getElementById('openSubmitModal');
  var submitModal = document.getElementById('submitModal');
  if (!submitBtn || !submitModal) return;
  submitBtn.addEventListener('click', function() {
    if (!API.token) { openAuthModal('login'); return; }
    submitModal.classList.add('open'); document.body.style.overflow = 'hidden';
  });
  var close = function() { submitModal.classList.remove('open'); document.body.style.overflow = ''; };
  submitModal.querySelector('.modal-close').addEventListener('click', close);
  submitModal.addEventListener('click', function(e) { if (e.target === submitModal) close(); });
  submitModal.querySelectorAll('.tag-options').forEach(function(g) {
    g.querySelectorAll('.tag-option').forEach(function(o) {
      o.addEventListener('click', function() { g.querySelectorAll('.tag-option').forEach(function(x) { x.classList.remove('selected'); }); this.classList.add('selected'); });
    });
  });
  var submissionImages = [];
  var imgInput = document.getElementById('submissionImages');
  var imgPreviews = document.getElementById('submissionImgPreviews');
  if (imgInput && imgPreviews) {
    document.getElementById('imgUploadTrigger').addEventListener('click', function() { imgInput.click(); });
    imgInput.addEventListener('change', function() {
      imgListToDataURL(Array.from(imgInput.files)).then(function(list) { if (list.length) { submissionImages = submissionImages.concat(list); renderSI(); } });
      imgInput.value = '';
    });
  }
  function renderSI() {
    imgPreviews.innerHTML = submissionImages.map(function(s, i) { return '<div class="img-preview-item"><img src="' + s + '"><button class="remove-img" data-idx="' + i + '">&times;</button></div>'; }).join('');
    imgPreviews.querySelectorAll('.remove-img').forEach(function(b) { b.addEventListener('click', function(e) { e.stopPropagation(); submissionImages.splice(parseInt(this.dataset.idx), 1); renderSI(); }); });
  }
  var sfBtn = document.getElementById('submitFormBtn');
  var sfMsg = document.createElement('div');
  sfMsg.style.cssText = 'text-align:center;padding:10px;border-radius:6px;font-size:13px;margin-top:12px;display:none;';
  if (sfBtn) {
    sfBtn.parentNode.insertBefore(sfMsg, sfBtn.nextSibling);
    sfBtn.addEventListener('click', function() {
      var t1 = submitModal.querySelector('#tagGroup1 .tag-option.selected');
      var t2 = submitModal.querySelector('#tagGroup2 .tag-option.selected');
      var txt = document.getElementById('submissionText'); var text = txt ? txt.value.trim() : '';
      var sm = function(t, ty) { sfMsg.textContent = t; sfMsg.style.display = 'block'; sfMsg.style.background = ty === 'success' ? '#e8f5e9' : '#ffebee'; sfMsg.style.color = ty === 'success' ? '#2e7d32' : '#c62828'; };
      if (!t1) { sm('请选择创作性质', 'error'); return; }
      if (!t2) { sm('请选择作品类型', 'error'); return; }
      if (submissionImages.length === 0) { sm('请上传图片', 'error'); return; }
      if (!text) { sm('请输入正文', 'error'); return; }
      this.disabled = true; this.textContent = '上传图片中...'; var self = this;
      // Upload images first, get URLs instead of storing base64
      API.post('/api/upload', { images: submissionImages.slice() }).then(function(uploadRes) {
        if (uploadRes.error) { sm(uploadRes.error, 'error'); self.disabled = false; self.textContent = '提交投稿'; return; }
        var urls = uploadRes.urls || [];
        self.textContent = '提交中...';
        return API.post('/api/fanworks', { tag1: t1.textContent, tag2: t2.textContent, images: urls, text: text });
      }).then(function(d) {
        if (!d) return;
        if (d.error) { sm(d.error, 'error'); self.disabled = false; self.textContent = '提交投稿'; return; }
        sm('投稿已提交~', 'success'); submissionImages = []; renderSI();
        submitModal.querySelectorAll('.tag-option').forEach(function(o) { o.classList.remove('selected'); });
        if (txt) txt.value = '';
        setTimeout(function() { self.disabled = false; self.textContent = '提交投稿'; close(); sfMsg.style.display = 'none'; }, 1200);
      }).catch(function() { sm('网络错误', 'error'); self.disabled = false; self.textContent = '提交投稿'; });
    });
  }
}

// ---- Market Submission ----
function setupMarketSubmission() {
  var btn = document.getElementById('openMarketSubmitModal');
  var modal = document.getElementById('marketSubmitModal');
  if (!btn || !modal) return;
  btn.addEventListener('click', function() {
    if (!API.token) { openAuthModal('login'); return; }
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  });
  var close = function() { modal.classList.remove('open'); document.body.style.overflow = ''; };
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', function(e) { if (e.target === modal) close(); });
  modal.querySelectorAll('.tag-options').forEach(function(g) {
    g.querySelectorAll('.tag-option').forEach(function(o) {
      o.addEventListener('click', function() { g.querySelectorAll('.tag-option').forEach(function(x) { x.classList.remove('selected'); }); this.classList.add('selected'); });
    });
  });
  var images = [];
  var inp = document.getElementById('marketImages');
  var prev = document.getElementById('marketImgPreviews');
  if (inp && prev) {
    document.getElementById('marketImgUploadTrigger').addEventListener('click', function() { inp.click(); });
    inp.addEventListener('change', function() {
      imgListToDataURL(Array.from(inp.files)).then(function(list) { if (list.length) { images = images.concat(list); renderMI(); } });
      inp.value = '';
    });
  }
  function renderMI() {
    prev.innerHTML = images.map(function(s, i) { return '<div class="img-preview-item"><img src="' + s + '"><button class="remove-img" data-idx="' + i + '">&times;</button></div>'; }).join('');
    prev.querySelectorAll('.remove-img').forEach(function(b) { b.addEventListener('click', function(e) { e.stopPropagation(); images.splice(parseInt(this.dataset.idx), 1); renderMI(); }); });
  }
  // 价格自动加￥
  var priceInput = document.getElementById('marketPrice');
  if (priceInput) {
    priceInput.addEventListener('blur', function() {
      var v = this.value.trim();
      if (v && v.charAt(0) !== '￥' && v.charAt(0) !== '¥') {
        this.value = '￥' + v;
      }
    });
  }
  var fBtn = document.getElementById('marketSubmitBtn');
  var fMsg = document.createElement('div');
  fMsg.style.cssText = 'text-align:center;padding:10px;border-radius:6px;font-size:13px;margin-top:12px;display:none;';
  if (fBtn) {
    fBtn.parentNode.insertBefore(fMsg, fBtn.nextSibling);
    fBtn.addEventListener('click', function() {
      var title = document.getElementById('marketItemTitle'); var price = document.getElementById('marketPrice');
      var qq = document.getElementById('marketQQ'); var ip = document.getElementById('marketIP');
      var text = document.getElementById('marketText'); var tag = modal.querySelector('#marketTagGroup .tag-option.selected');
      var sm = function(t, ty) { fMsg.textContent = t; fMsg.style.display = 'block'; fMsg.style.background = ty === 'success' ? '#e8f5e9' : '#ffebee'; fMsg.style.color = ty === 'success' ? '#2e7d32' : '#c62828'; };
      if (!title.value.trim()) { sm('请输入名称', 'error'); return; }
      if (!price.value.trim()) { sm('请输入价格', 'error'); return; }
      if (!tag) { sm('请选择类型', 'error'); return; }
      if (images.length === 0) { sm('请上传图片', 'error'); return; }
      this.disabled = true; this.textContent = '上传图片中...'; var self = this;
      // Upload images first, get URLs instead of storing base64
      API.post('/api/upload', { images: images.slice() }).then(function(uploadRes) {
        if (uploadRes.error) { sm(uploadRes.error, 'error'); self.disabled = false; self.textContent = '提交发布'; return; }
        var urls = uploadRes.urls || [];
        self.textContent = '提交中...';
        return API.post('/api/market', { title: title.value.trim(), price: price.value.trim(), qq: qq.value.trim(), tag: tag.textContent, ip: ip.value.trim(), images: urls, text: text.value.trim() });
      }).then(function(d) {
        if (!d) return;
        if (d.error) { sm(d.error, 'error'); self.disabled = false; self.textContent = '提交发布'; return; }
        sm('已提交~', 'success'); images = []; renderMI();
        modal.querySelectorAll('.tag-option').forEach(function(o) { o.classList.remove('selected'); });
        title.value = ''; price.value = ''; qq.value = ''; ip.value = ''; text.value = '';
        setTimeout(function() { self.disabled = false; self.textContent = '提交发布'; close(); fMsg.style.display = 'none'; }, 1200);
      }).catch(function() { sm('网络错误', 'error'); self.disabled = false; self.textContent = '提交发布'; });
    });
  }
}

// ---- Content Detail Modal ----
function setupContentModal() {
  var modal = document.getElementById('contentModal');
  if (!modal) return;
  var carousel = modal.querySelector('.carousel-track');
  var dots = modal.querySelector('.carousel-dots');
  var author = modal.querySelector('.cm-author');
  var text = modal.querySelector('.cm-text');
  var tags = modal.querySelector('.cm-tags');
  var likeBtn = modal.querySelector('.cm-like-btn');
  var idx = 0, imgs = [];
  function open(data) {
    imgs = data.images || []; idx = 0;
    carousel.innerHTML = imgs.map(function(s) { return '<div class="carousel-slide"><img src="' + s + '"></div>'; }).join('');
    dots.innerHTML = imgs.map(function(_, i) { return '<div class="dot' + (i === 0 ? ' active' : '') + '"></div>'; }).join('');
    update();
    var p = modal.querySelector('.carousel-btn.prev'), n = modal.querySelector('.carousel-btn.next');
    if (imgs.length <= 1) { p.style.display = 'none'; n.style.display = 'none'; dots.style.display = 'none'; }
    else { p.style.display = 'flex'; n.style.display = 'flex'; dots.style.display = 'flex'; }
    tags.innerHTML = '<span class="cm-tag">' + escapeHTML(data.tag1||'') + '</span><span class="cm-tag">' + escapeHTML(data.tag2||'') + '</span>';
    author.innerHTML = escapeHTML(data.author_name || data.cn || '') + titleBadge(data.author_title);
    text.textContent = data.text || '';
    likeBtn.classList.remove('liked'); likeBtn.querySelector('.count').textContent = data.likes || 0;
    modal._targetType = 'fanwork';
    modal._targetId = data.id;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    loadCommentList('fanwork', data.id, 'fanworkCommentList');
  }
  function close() { modal.classList.remove('open'); document.body.style.overflow = ''; }
  function update() { carousel.style.transform = 'translateX(-' + (idx * 100) + '%)'; dots.querySelectorAll('.dot').forEach(function(d, i) { d.classList.toggle('active', i === idx); }); }
  modal.querySelector('.carousel-btn.prev').addEventListener('click', function() { if (idx > 0) { idx--; update(); } });
  modal.querySelector('.carousel-btn.next').addEventListener('click', function() { if (idx < imgs.length - 1) { idx++; update(); } });
  var tx = 0;
  modal.querySelector('.cm-carousel').addEventListener('touchstart', function(e) { tx = e.changedTouches[0].screenX; });
  modal.querySelector('.cm-carousel').addEventListener('touchend', function(e) { var d = tx - e.changedTouches[0].screenX; if (Math.abs(d) > 60) { if (d > 0 && idx < imgs.length - 1) idx++; else if (d < 0 && idx > 0) idx--; update(); } });
  modal.querySelector('.cm-close').addEventListener('click', close);
  modal.addEventListener('click', function(e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  window.openContentModal = open;
}

// ---- Market Detail Modal ----
function setupMarketDetail() {
  var modal = document.getElementById('marketDetailModal');
  if (!modal) return;
  var carousel = modal.querySelector('.carousel-track');
  var dots = modal.querySelector('.carousel-dots');
  var author = modal.querySelector('.cm-author');
  var text = modal.querySelector('.cm-text');
  var tags = modal.querySelector('.cm-tags');
  var price = modal.querySelector('.cm-price');
  var qq = modal.querySelector('.cm-qq');
  var idx = 0, imgs = [];
  function open(data) {
    imgs = data.images || []; idx = 0;
    carousel.innerHTML = imgs.map(function(s) { return '<div class="carousel-slide"><img src="' + s + '"></div>'; }).join('');
    dots.innerHTML = imgs.map(function(_, i) { return '<div class="dot' + (i === 0 ? ' active' : '') + '"></div>'; }).join('');
    update();
    var p = modal.querySelector('.carousel-btn.prev'), n = modal.querySelector('.carousel-btn.next');
    if (imgs.length <= 1) { p.style.display = 'none'; n.style.display = 'none'; dots.style.display = 'none'; }
    else { p.style.display = 'flex'; n.style.display = 'flex'; dots.style.display = 'flex'; }
    tags.innerHTML = '<span class="cm-tag">' + escapeHTML(data.tag) + '</span>' + (data.ip ? '<span class="cm-tag" style="background:#e3f2fd;color:#1e88e5;">' + escapeHTML(data.ip) + '</span>' : '');
    author.textContent = data.title || '';
    price.textContent = data.price || '';
    qq.innerHTML = 'QQ：<strong>' + escapeHTML(data.qq||'') + '</strong>';
    text.textContent = data.text || '';
    modal._targetType = 'market';
    modal._targetId = data.id;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    loadCommentList('market', data.id, 'marketCommentList');
  }
  function close() { modal.classList.remove('open'); document.body.style.overflow = ''; }
  function update() { carousel.style.transform = 'translateX(-' + (idx * 100) + '%)'; dots.querySelectorAll('.dot').forEach(function(d, i) { d.classList.toggle('active', i === idx); }); }
  modal.querySelector('.carousel-btn.prev').addEventListener('click', function() { if (idx > 0) { idx--; update(); } });
  modal.querySelector('.carousel-btn.next').addEventListener('click', function() { if (idx < imgs.length - 1) { idx++; update(); } });
  var tx = 0;
  modal.querySelector('.cm-carousel').addEventListener('touchstart', function(e) { tx = e.changedTouches[0].screenX; });
  modal.querySelector('.cm-carousel').addEventListener('touchend', function(e) { var d = tx - e.changedTouches[0].screenX; if (Math.abs(d) > 60) { if (d > 0 && idx < imgs.length - 1) idx++; else if (d < 0 && idx > 0) idx--; update(); } });
  modal.querySelector('.cm-close').addEventListener('click', close);
  modal.addEventListener('click', function(e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  window.openMarketDetail = open;
}

// ---- Comments ----
var avatarColorsC = ['#fce4ec,#e8eaf6', '#e8f5e9,#fff3e0', '#e3f2fd,#f3e5f5', '#fff3e0,#fce4ec', '#f3e5f5,#e8eaf6', '#e0f7fa,#fff9c4'];

function loadCommentList(targetType, targetId, listId) {
  var list = document.getElementById(listId);
  if (!list) return;
  API.get('/api/comments/' + targetType + '/' + targetId).then(function(comments) {
    if (!comments || comments.length === 0) {
      list.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">暂无评论~</p>';
      return;
    }
    list.innerHTML = comments.map(function(c) {
      var size = 28; var fontSize = 12;
      var avDefault = 'background:linear-gradient(135deg,' + avatarColorsC[(c.author_id || 0) % avatarColorsC.length] + ');';
      var avatarHTML = c.avatar
        ? '<img src="' + escapeHTML(c.avatar) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;flex-shrink:0;">'
        : '<div style="' + avDefault + ';width:' + size + 'px;height:' + size + 'px;font-size:' + fontSize + 'px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;">' + escapeHTML((c.author_name || '?').charAt(0)) + '</div>';
      var indent = c.parent_id ? 'margin-left:36px;' : '';
      var replyTo = c.parent_id ? comments.find(function(x) { return x.id === c.parent_id; }) : null;
      var replyToHTML = replyTo ? '<div style="font-size:11px;color:var(--accent);margin-bottom:2px;">↳ 回复 @' + escapeHTML(replyTo.author_name || '匿名') + '</div>' : '';
      return '<div class="comment-item" style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #f5f5f5;' + indent + '" data-comment-id="' + c.id + '" data-author="' + escapeHTML(c.author_name || '匿名') + '">' +
        avatarHTML +
        '<div style="flex:1;">' +
        '<div style="font-size:12px;font-weight:600;">' + escapeHTML(c.author_name || '匿名') + (typeof titleBadge==='function' ? titleBadge(c.author_title) : '') +
        '<span style="font-weight:400;color:var(--text-muted);margin-left:6px;font-size:10px;">' + c.created_at + '</span></div>' +
        replyToHTML +
        '<div style="font-size:12px;color:var(--text-light);margin-top:2px;">' + escapeHTML(c.text) + '</div>' +
        '<button class="comment-reply-btn" data-comment-id="' + c.id + '" data-author="' + escapeHTML(c.author_name || '匿名') + '" style="font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;padding:0;margin-top:3px;">回复</button>' +
        '</div></div>';
    }).join('');
    list.querySelectorAll('.comment-reply-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!API.token) { openAuthModal('login'); return; }
        var commentId = parseInt(this.dataset.commentId);
        var author = this.dataset.author;
        var input = document.getElementById('fanworkCommentInput') || document.getElementById('marketCommentInput');
        if (input) {
          input.dataset.replyTo = commentId;
          input.placeholder = '回复 @' + author + '...';
          input.focus();
        }
      });
    });
  });
}

function postComment(targetType, targetId, inputId, listId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;
  if (!API.token) { openAuthModal('login'); return; }
  var parentId = input.dataset.replyTo ? parseInt(input.dataset.replyTo) : null;
  var btn = document.getElementById(targetType === 'fanwork' ? 'fanworkCommentBtn' : 'marketCommentBtn');
  var origText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '发送中...'; }
  API.post('/api/comments', { targetType: targetType, targetId: targetId, text: text, parentId: parentId }).then(function(data) {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
    if (data.error) {
      var msgEl = document.getElementById((targetType === 'fanwork' ? 'fanwork' : 'market') + 'CommentMsg');
      if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = (targetType === 'fanwork' ? 'fanwork' : 'market') + 'CommentMsg';
        msgEl.style.cssText = 'font-size:12px;margin-top:6px;';
        if (btn) btn.parentNode.insertBefore(msgEl, btn.nextSibling);
      }
      msgEl.textContent = data.error;
      msgEl.style.color = '#c62828';
      return;
    }
    input.value = '';
    delete input.dataset.replyTo;
    input.placeholder = '写下你的评论...';
    var msgEl = document.getElementById((targetType === 'fanwork' ? 'fanwork' : 'market') + 'CommentMsg');
    if (msgEl) { msgEl.textContent = ''; }
    loadCommentList(targetType, targetId, listId);
  }).catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
    var msgEl = document.getElementById((targetType === 'fanwork' ? 'fanwork' : 'market') + 'CommentMsg');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = (targetType === 'fanwork' ? 'fanwork' : 'market') + 'CommentMsg';
      msgEl.style.cssText = 'font-size:12px;margin-top:6px;';
      if (btn) btn.parentNode.insertBefore(msgEl, btn.nextSibling);
    }
    msgEl.textContent = '网络错误，请重试';
    msgEl.style.color = '#c62828';
  });
}

// Fanworks comment form
document.addEventListener('DOMContentLoaded', function() {
  var fanworkBtn = document.getElementById('fanworkCommentBtn');
  if (fanworkBtn) {
    fanworkBtn.addEventListener('click', function() {
      var modal = document.getElementById('contentModal');
      if (!modal || !modal._targetId) return;
      postComment('fanwork', modal._targetId, 'fanworkCommentInput', 'fanworkCommentList');
    });
  }
  // Enter key to submit fanwork comment
  var fanworkInput = document.getElementById('fanworkCommentInput');
  if (fanworkInput) {
    fanworkInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        var modal = document.getElementById('contentModal');
        if (!modal || !modal._targetId) return;
        postComment('fanwork', modal._targetId, 'fanworkCommentInput', 'fanworkCommentList');
      }
    });
  }
  // Market comment form (wired in market.html DOM ready)
});
