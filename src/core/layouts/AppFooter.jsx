import { cn } from '@core/lib/utils'
import { MapPin } from 'lucide-react'

export function AppFooter({ className }) {
  const version = '1.0.0'
  const currentYear = 2026

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

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20">
              TT
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-white tracking-wide">
                Trung Tâm Dạy Học
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                Biên Hòa, Đồng Nai
              </p>
            </div>
          </div>

          {/* CENTER */}
          <nav className="flex items-center gap-2">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/contact">Liên hệ</FooterLink>
          </nav>

          {/* RIGHT */}
          <div className="flex flex-col md:items-end gap-3">

            {/* Social icons with brand colors */}
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition-all duration-200 hover:scale-110"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white transition-all duration-200 hover:scale-110"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:scale-110"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Copyright & Version */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">
                © {currentYear}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                v{version}
              </span>
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
      className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
    >
      {children}
    </a>
  )
}


