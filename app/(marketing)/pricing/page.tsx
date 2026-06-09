import PricingSection from '@/components/marketing/PricingSection'
import FAQSection from '@/components/marketing/FAQSection'
import CTABanner from '@/components/marketing/CTABanner'

export const metadata = { title: 'Ціни — ProxyService' }

export default function PricingPage() {
  return (
    <div style={{ background: '#0A0A0A' }}>
      <PricingSection />
      <FAQSection />
      <CTABanner />
    </div>
  )
}
