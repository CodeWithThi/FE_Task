/**
 * AuthLayout - Enterprise split-screen layout with wave edge on blue section
 * Left: Blue branding with wave edge built into the section itself
 * Right: Clean white rectangular form area
 */
export function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-[#F8FAFC]">
            {/* Left Section - Blue branding with wave edge (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[48%] min-h-screen relative items-center justify-center">
                {/* Blue background with wave edge */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 500 800"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,0 L400,0 
               C450,100 480,200 450,300 
               C420,400 480,500 450,600 
               C420,700 450,800 400,800 
               L0,800 Z"
                        fill="url(#blueGradient)"
                    />
                    <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1E40AF" />
                            <stop offset="50%" stopColor="#2563EB" />
                            <stop offset="100%" stopColor="#1E40AF" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Subtle radial light effect */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-white/5 blur-2xl"></div>

                {/* Content */}
                <div className="relative z-10 text-center px-12 space-y-4">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-2">
                        <span className="text-white font-bold text-3xl tracking-tighter">TT</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Trung Tâm Dạy Học
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm text-blue-100 font-medium max-w-xs mx-auto leading-relaxed">
                        Hệ thống quản lý nội bộ & công việc
                    </p>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="flex-1 lg:w-[52%] flex items-center justify-center px-6 py-8 lg:px-12">
                <div className="w-full max-w-[480px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-3">
                            <span className="text-white font-bold text-xl">TT</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-900">Trung Tâm Dạy Học</h1>
                    </div>

                    {/* Auth Card Container */}
                    {children}

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            © 2026 Trung Tâm Dạy Học • Phiên bản 1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
