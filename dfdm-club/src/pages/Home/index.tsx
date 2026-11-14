import HeroBanner from './HeroBanner'
import FeatureCards from './FeatureCards'
import RecentActivities from './RecentActivities'
import RecentMonthly from './RecentMonthly'
import Sidebar from './Sidebar'

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <FeatureCards />
      <div className="max-w-[var(--max-width)] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-8">
          <RecentActivities />
          <RecentMonthly />
        </div>
        <Sidebar />
      </div>
    </div>
  )
}
