export const NAV_LINKS = [
  { path: '/', label: '首页' },
  { path: '/activities', label: '活动合集' },
  { path: '/market', label: '动漫集市' },
  { path: '/monthly', label: '社团月刊' },
  { path: '/fanworks', label: '创作广场' },
  { path: '/guestbook', label: '留言板' },
  { path: '/members', label: '成员' },
]

export const FORTUNE_YI_POOL = [
  '写代码', '追番', '打游戏', '泡图书馆', '摸鱼创作',
  'COS出片', '逛漫展', '社团面基', '补旧番', '氪金抽卡',
  '约饭', '睡懒觉', '听歌循环', '肝论文', '逛B站',
  '看漫画', '吃谷', '画同人', '整理收藏', '出门走走',
  '剪视频', '学日语', '拍正片', '临摹', '买手办',
  '喝茶发呆', '拼胶', '刷剧场版', '清理硬盘', '调设备',
]

export const FORTUNE_JI_POOL = [
  '点外卖', '熬夜', '翘课', '冲动氪金', '剧透别人',
  '乱立flag', '刷手机摸鱼', '通宵赶DDL', '赖床不起',
  '吵架', '删库跑路', '一日三餐泡面', '看原作毁动画',
  '抢尾款犹豫', '跟风黑角色', '云玩家指点江山',
  '半途而废', '拖延症发作', '只收藏不学习',
]

export const MARKET_TAGS = ['吧唧', '手办', '色纸', '立牌', '娃娃', '其他']

export const MARKET_TAG_COLORS: Record<string, string> = {
  '吧唧': '#fce4ec',
  '手办': '#e8f5e9',
  '色纸': '#e3f2fd',
  '立牌': '#fff3e0',
  '娃娃': '#f3e5f5',
  '其他': '#f5f5f5',
}

export const FANWORK_TAGS = ['原创', '同人', '画', 'COS', '文章', '其他']

export const ACTIVITY_STATUS = {
  upcoming: { label: '即将开始', color: 'bg-green-100 text-green-700' },
  ongoing: { label: '进行中', color: 'bg-orange-100 text-orange-700' },
  past: { label: '已结束', color: 'bg-gray-100 text-gray-500' },
}
