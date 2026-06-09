import Link from 'next/link'
import { LogoIcon } from '@/components/Logo'

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: '#080808' }}>

      {/* Grain overlay — animated film grain */}
      <div
        className="fixed pointer-events-none z-[2]"
        style={{
          inset: '-50%',
          width: '200%',
          height: '200%',
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px 250px',
          opacity: 0.045,
          animation: 'auth-grain 8s steps(1) infinite',
        }}
      />

      {/* Color glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left white glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '65%',
          height: '65%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 65%)',
          animation: 'auth-glow-1 22s ease-in-out infinite alternate',
        }} />
        {/* Bottom-right white glow */}
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 65%)',
          animation: 'auth-glow-2 28s ease-in-out infinite alternate',
        }} />
        {/* Center subtle white */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/"
          className="flex items-center gap-2.5 mb-10 justify-center animate-fade-in-up">
          <LogoIcon size={44} />
          <span className="font-bold text-xl tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
            ProxyService
          </span>
        </Link>

        <div className="animate-fade-in-up delay-100">{children}</div>
      </div>
    </div>
  )
}
