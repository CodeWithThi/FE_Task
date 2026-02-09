import { cn } from '@core/lib/utils'
import { Facebook, Instagram, Twitter, MapPin } from 'lucide-react'

export function AppFooter({ className }) {
  const version = '1.0.0'
  const currentYear = 2026

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
  ]

  return (
    <footer
      className={cn(
        'relative border-t border-slate-800 bg-[#0F172A] text-slate-300',
        className
      )}
      role="contentinfo"
    >
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm font-bold shadow-md">
              TT
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white tracking-wide">
                Trung Tâm Dạy Học
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                Biên Hòa, Đồng Nai
              </p>
            </div>
          </div>

          {/* CENTER */}
          <nav className="flex items-center gap-8 text-sm font-medium">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/contact">Liên hệ</FooterLink>
          </nav>

          {/* RIGHT */}
          <div className="flex flex-col md:items-end gap-3">

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  className="group flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 transition-all duration-300 hover:text-white hover:border-blue-500 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                >
                  <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>

            <div className="text-xs text-slate-500 tracking-wide">
              <span className="text-slate-400 font-medium">
                © {currentYear}
              </span>{' '}
              ·{' '}
              <span className="text-slate-300 font-semibold">
                TechCore
              </span>{' '}
              · v{version}
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="relative text-slate-400 hover:text-white transition-colors duration-300"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
    </a>
  )
}
