import HeroSection from '@/components/marketing/HeroSection'
import MarqueeStrip from '@/components/marketing/MarqueeStrip'
import TrustedBy from '@/components/marketing/TrustedBy'
import LiveStatus from '@/components/marketing/LiveStatus'
import StatsSection from '@/components/marketing/StatsSection'
import FeaturesGrid from '@/components/marketing/FeaturesGrid'
import ProxyTypesSection from '@/components/marketing/ProxyTypesSection'
import UseCasesSection from '@/components/marketing/UseCasesSection'
import IPChecker from '@/components/marketing/IPChecker'
import ComparisonTable from '@/components/marketing/ComparisonTable'
import BandwidthCalculator from '@/components/marketing/BandwidthCalculator'
import HowItWorks from '@/components/marketing/HowItWorks'
import PricingSection from '@/components/marketing/PricingSection'
import TestimonialsSection from '@/components/marketing/TestimonialsSection'
import FAQSection from '@/components/marketing/FAQSection'
import CTABanner from '@/components/marketing/CTABanner'

export default function LandingPage() {
  return (
    <div style={{ background: '#060606' }}>
      <HeroSection />
      <MarqueeStrip />
      <TrustedBy />
      <LiveStatus />
      <StatsSection />
      <FeaturesGrid />
      <ProxyTypesSection />
      <UseCasesSection />
      <IPChecker />
      <ComparisonTable />
      <BandwidthCalculator />
      <HowItWorks />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTABanner />
    </div>
  )
}
