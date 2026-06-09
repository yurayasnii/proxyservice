import MarketingNav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main className="flex-1 page-enter">{children}</main>
      <Footer />
    </>
  )
}
