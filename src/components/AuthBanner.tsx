import React from 'react';
import { User } from 'firebase/auth';
import { AppUserProfile } from '../types';
import { Cloud, ShieldCheck, Database, ArrowRight, Loader2 } from 'lucide-react';

interface AuthBannerProps {
  user: User | AppUserProfile | null;
  loadingAuth: boolean;
  isLoggingIn: boolean;
  onLogin: (useRedirect?: boolean) => void;
  onOpenAddModal: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({
  user,
  loadingAuth,
  isLoggingIn,
  onLogin,
  onOpenAddModal,
}) => {
  if (loadingAuth) return null;

  if (user) {
    return (
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-300">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-sky-100">
                เชื่อมต่อฐานข้อมูล MoneyDB สำเร็จ
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/30 text-sky-200 border border-sky-400/30">
                Firestore Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ข้อมูลถูกจัดเก็บและซิงค์แบบเรียลไทม์ในบัญชี <span className="text-white font-medium">{user.email}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition cursor-pointer self-stretch sm:self-auto justify-center shadow-xs"
        >
          <span>+ บันทึกรายการใหม่</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Not logged in banner
  return (
    <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-500/30 mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Cloud Firestore : MoneyDB</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            จัดการรายรับ-รายจ่าย สรุปผลแม่นยำ พร้อมกราฟวิเคราะห์
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            บันทึกการเงินง่ายๆ ได้ทุกวัน พร้อมรายงานสรุปรายเดือนแบบไดนามิก ข้อมูลจะถูกบันทึกสดบน Firebase ปลอดภัยแยกตามบัญชีของคุณ
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>เข้าสู่ระบบด้วย Google ปลอดภัย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>ซิงค์ข้อมูลสดทุกอุปกรณ์</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
          <button
            id="btn-banner-google-login"
            type="button"
            disabled={isLoggingIn}
            onClick={() => onLogin(false)}
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-semibold text-sm shadow-lg transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span>กำลังเชื่อมต่อบัญชี Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>ลงชื่อเข้าใช้ด้วย Gmail</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            หรือสามารถทดลองบันทึกข้อมูลโหมดจำลองด้านล่างได้ทันที
          </p>
        </div>
      </div>
    </div>
  );
};
