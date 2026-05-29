import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIAKAD Login",
  description: "Masuk ke Sistem Informasi Akademik Terpadu",
};

export default function LoginPage() {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/50 dark:border-white/10 animate-slide-up">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Selamat Datang!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Silakan masuk dengan email dan password Anda untuk mengakses layanan akademik.
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6">
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Layanan Bantuan</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-200/80 mt-1">
            Jika Anda mengalami kendala atau lupa akun, silakan hubungi <a href="mailto:admin@sekolah.sch.id" className="underline hover:text-blue-800 dark:hover:text-blue-100 transition-colors">Administrator Sistem</a> sekolah.
          </p>
        </div>
      </div>
    </div>
  );
}
