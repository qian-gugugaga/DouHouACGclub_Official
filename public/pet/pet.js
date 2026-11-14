// dfdm.fun 页面角落的 Live2D 挂件（Amadeus 提供）
// 用 <script src="/pet/pet.js"></script> 引入；默认关闭，状态存 localStorage
(function () {
  // 手机上不启用：省流量，也避免在小屏挡内容
  if (window.matchMedia('(pointer: coarse)').matches) return

  var STORE = 'amadeus-pet-open'
  var PAGES = {
    index: '首页', activities: '活动', market: '市场', monthly: '月报',
    fanworks: '同人', guestbook: '留言板', members: '成员',
    profile: '个人', contact: '联系', admin: '管理',
  }

  var file = location.pathname.match(/([a-z]+)\.html$/)
  var page = file ? file[1] : 'index'
  var pageName = PAGES[page] || '首页'

  var btn = null
  var wrap = null
  var frame = null

  function addStyle() {
    var css =
      '#amadeus-pet-toggle{position:fixed;left:18px;bottom:18px;z-index:2147483000;' +
      'width:46px;height:46px;border-radius:50%;border:0;cursor:pointer;font-size:20px;' +
      'line-height:1;background:linear-gradient(145deg,#f27ba8,#e8508a);color:#fff;' +
      'box-shadow:0 6px 18px rgba(232,80,138,.28);transition:all .18s ease}' +
      '#amadeus-pet-toggle:hover{transform:scale(1.08)}' +
      // 打开时外部按钮隐藏，收起改由卡片内的 × 负责
      '#amadeus-pet-toggle.on{display:none}' +
      '#amadeus-pet-wrap{position:fixed;left:12px;bottom:12px;z-index:2147482999;' +
      'width:340px;height:560px;display:none;resize:both;overflow:hidden;' +
      'min-width:240px;min-height:320px;max-width:720px;max-height:900px}' +
      '#amadeus-pet-wrap.open{display:block}' +
      '#amadeus-pet-frame{width:100%;height:100%;border:0;background:transparent}'
    var el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
  }

  // 记住上次拖动后的尺寸，刷新后保持
  var SIZE_KEY = 'amadeus-pet-size'
  function applySavedSize(wrap) {
    try {
      var saved = JSON.parse(localStorage.getItem(SIZE_KEY) || 'null')
      if (Array.isArray(saved) && saved.length === 2) {
        wrap.style.width = saved[0] + 'px'
        wrap.style.height = saved[1] + 'px'
      }
    } catch (e) {
      /* 存坏了就用默认值 */
    }
    if (!('ResizeObserver' in window)) return
    var timer = 0
    var lastSize = wrap.offsetWidth + 'x' + wrap.offsetHeight
    new ResizeObserver(function () {
      clearTimeout(timer)
      timer = setTimeout(function () {
        localStorage.setItem(
          SIZE_KEY,
          JSON.stringify([wrap.offsetWidth, wrap.offsetHeight])
        )
        // 尺寸真变了才重载 iframe：canvas 尺寸在初始化时就定了，直接改容器会留黑区
        var now = wrap.offsetWidth + 'x' + wrap.offsetHeight
        if (now !== lastSize) {
          lastSize = now
          var f = wrap.querySelector('iframe')
          if (f && f.contentWindow) f.contentWindow.location.reload()
        }
      }, 500)
    }).observe(wrap)
  }

  // 抓当前页面的可见文字，给挂件当上下文（不含顶部导航，只取主内容区）
  function readPageText() {
    var el =
      document.querySelector('.page-wrapper') ||
      document.querySelector('main') ||
      document.body
    var t = (el.innerText || '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim()
    return t.slice(0, 2000)
  }

  function sendContext() {
    if (!frame || !frame.contentWindow) return
    frame.contentWindow.postMessage(
      { type: 'amadeus:context', page: page, text: readPageText() },
      '*'
    )
  }

  function sendPage() {
    if (!frame || !frame.contentWindow) return
    frame.contentWindow.postMessage({ type: 'amadeus:page', page: page, name: pageName }, '*')
    // 内容可能是异步渲染的，隔一会儿再补两次
    setTimeout(sendContext, 900)
    setTimeout(sendContext, 2600)
  }

  function build() {
    addStyle()

    wrap = document.createElement('div')
    wrap.id = 'amadeus-pet-wrap'
    document.body.appendChild(wrap)
    applySavedSize(wrap)

    btn = document.createElement('button')
    btn.id = 'amadeus-pet-toggle'
    btn.type = 'button'
    btn.title = '和大肥鱼聊聊'
    btn.textContent = '🐟'
    document.body.appendChild(btn)

    btn.addEventListener('click', function () {
      toggle(!wrap.classList.contains('open'))
    })

    // 挂件加载完会发 ready，收到后再告诉它当前是哪一页
    window.addEventListener('message', function (ev) {
      if (!ev.data) return
      if (ev.data.type === 'amadeus:ready') sendPage()
      if (ev.data.type === 'amadeus:need-context') sendContext()
      if (ev.data.type === 'amadeus:close') toggle(false)
    })
  }

  // 第一次打开时才创建 iframe：display:none 时初始化 pixi，画布尺寸会算成 0
  function ensureFrame() {
    if (frame) return
    frame = document.createElement('iframe')
    frame.id = 'amadeus-pet-frame'
    frame.title = '大肥鱼'
    frame.allow = 'autoplay'
    frame.src = '/pet/index.html?model=deepseek&widget=1'
    wrap.appendChild(frame)
  }

  function toggle(open) {
    if (open) ensureFrame()
    wrap.classList.toggle('open', open)
    btn.classList.toggle('on', open)
    localStorage.setItem(STORE, open ? '1' : '0')
  }

  function init() {
    build()
    toggle(localStorage.getItem(STORE) === '1')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
