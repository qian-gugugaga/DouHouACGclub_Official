import { Link } from 'react-router-dom'
import {
  MailOutlined,
  PhoneOutlined,
  QqOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const items = [
  {
    label: '电子邮箱',
    value: 'wjk18272327060@163.com',
    href: 'mailto:wjk18272327060@163.com',
    icon: <MailOutlined />,
    bg: '#fce4ec',
    color: '#e75a7c',
  },
  {
    label: '联系电话',
    value: '18272327060',
    href: 'tel:18272327060',
    icon: <PhoneOutlined />,
    bg: '#e8f5e9',
    color: '#4caf50',
  },
  {
    label: 'QQ',
    value: '1225607566',
    icon: <QqOutlined />,
    bg: '#e3f2fd',
    color: '#2196f3',
  },
  {
    label: '所在地区',
    value: '中国 湖北 十堰',
    icon: <EnvironmentOutlined />,
    bg: '#fff3e0',
    color: '#ff9800',
  },
  {
    label: '接受联系时间',
    value: '13:00 - 23:00',
    icon: <ClockCircleOutlined />,
    bg: '#f3e5f5',
    color: '#9c27b0',
  },
]

export default function Contact() {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-6">
      <div className="text-xs text-[var(--text-muted)] mb-4">
        <Link to="/" className="text-[var(--accent)] no-underline hover:underline">
          首页
        </Link>
        <span className="mx-1">/</span>
        <span>联系制作人</span>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
        <div className="px-6 py-8 text-center border-b border-[var(--border)] bg-gradient-to-b from-[var(--accent-light)] to-white">
          <div className="text-[13px] tracking-widest text-[var(--text-muted)] mb-2">
            网站主办者 / 制作人
          </div>
          <h1 className="text-[34px] leading-tight font-bold text-[var(--text)] tracking-[3px] m-0">
            王炯凯
          </h1>
          <div className="mt-2 text-sm text-[var(--text-light)]">
            网名「浅」· 东方动漫社 · 神秘据点
          </div>
        </div>

        <div className="p-4 sm:p-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const content = (
              <>
                <div
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-lg"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs text-[var(--text-muted)] mb-0.5">{item.label}</div>
                  <div className="text-[15px] font-semibold text-[var(--text)] break-all select-all">
                    {item.value}
                  </div>
                </div>
              </>
            )

            const base =
              'flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] transition-all duration-200'

            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                className={`${base} no-underline hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] hover:border-[var(--accent)]`}
              >
                {content}
              </a>
            ) : (
              <div key={item.label} className={base}>
                {content}
              </div>
            )
          })}
        </div>

        <div className="px-6 pb-6 text-xs leading-relaxed text-[var(--text-muted)]">
          本页面依据《计算机信息网络国际联网安全保护管理办法》及 ICP
          备案相关规定公示网站主办者真实身份与联系方式，供访问者及主管机关核验。
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-[var(--text-muted)]">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="no-underline hover:text-[var(--text)] hover:underline"
        >
          鄂ICP备2026040004号-1
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=42030002420406"
          target="_blank"
          rel="noreferrer"
          className="no-underline hover:text-[var(--text)] hover:underline"
        >
          鄂公网安备42030002420406号
        </a>
      </div>
    </div>
  )
}
