import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-6 mt-8">
      <div className="max-w-[var(--max-width)] mx-auto px-4 text-center text-xs text-[var(--text-muted)]">
        <p>© 2024-2026 东方动漫社 · 神秘据点</p>
        <p className="mt-1">Powered by Love & ACG</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>
            制作人：浅 ——{' '}
            <Link to="/contact" className="hover:text-[var(--text)] hover:underline">
              联系制作人
            </Link>
          </span>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--text)] hover:underline"
          >
            鄂ICP备2026040004号-1
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=42030002420406"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--text)] hover:underline"
          >
            鄂公网安备42030002420406号
          </a>
        </div>
      </div>
    </footer>
  )
}
