import FortuneWidget from '@/components/FortuneWidget'

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fce4ec] via-[#e8eaf6] to-[#e0f7fa] py-12 md:py-20">
      {/* Decorative circles */}
      <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/20" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-white/10" />
      <div className="absolute top-[50%] right-[20%] w-[100px] h-[100px] rounded-full bg-[#e75a7c]/5" />

      <div className="max-w-[var(--max-width)] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">神秘据点</h1>
          <p className="text-[var(--text-light)] text-sm md:text-base mb-6 max-w-lg">
            这里是东方动漫社的线上基地，汇聚活动、集市、月刊、同人创作与社群交流。无论你是萌新还是老司机，都能在这里找到属于你的角落。
          </p>
          <div className="mb-6">
            <FortuneWidget />
          </div>
        </div>
        <div className="shrink-0">
          <img
            src="/assets/mascot1.png"
            alt="吉祥物"
            className="w-48 md:w-64 hover:-translate-y-1 hover:scale-[1.03] transition-transform duration-300 drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}
