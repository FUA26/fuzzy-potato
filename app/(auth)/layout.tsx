import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

const features = [
  'Layanan Administrasi Kependudukan',
  'Perizinan Usaha Online',
  'Pembayaran Pajak & Retribusi',
  'Pengaduan Masyarakat',
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form Content */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="mb-8">
            <Link
              href="/"
              className="group mb-6 inline-flex items-center gap-3"
            >
              <div className="shadow-primary/5 relative flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
                <Image
                  src="/naiera.png"
                  alt="Naiera Logo"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div>
                <h1 className="group-hover:text-primary text-lg font-bold text-slate-800 transition-colors">
                  Super App Naiera
                </h1>
                <p className="text-xs text-slate-500">Kabupaten Naiera</p>
              </div>
            </Link>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Decorative Panel */}
      <div className="from-primary relative hidden items-center justify-center overflow-hidden bg-gradient-to-br via-teal-600 to-cyan-700 p-12 lg:flex lg:flex-1">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/10 blur-2xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-lg text-white">
          <h2 className="mb-4 text-3xl leading-tight font-bold xl:text-4xl">
            Akses Semua Layanan dalam{' '}
            <span className="text-cyan-200">Satu Aplikasi</span>
          </h2>
          <p className="mb-8 text-base leading-relaxed text-white/80 xl:text-lg">
            Lebih dari 100+ layanan pemerintahan Kabupaten Naiera siap melayani
            Anda 24/7 dengan cepat, mudah, dan aman.
          </p>

          <div className="space-y-3">
            {features.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-white/90 xl:text-base"
              >
                <Check size={16} className="shrink-0 text-cyan-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <p className="mb-1 text-xs text-white/70">Dipercaya oleh</p>
            <p className="text-2xl font-bold xl:text-3xl">50.000+ Pengguna</p>
          </div>
        </div>
      </div>
    </div>
  )
}
