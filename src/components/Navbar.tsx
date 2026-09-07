import React from 'react';
import { User } from 'firebase/auth';
import {
  Wallet,
  LogIn,
  LogOut,
  Database,
  CloudCheck,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { logoutUser, FIREBASE_PROJECT_ID } from '../lib/firebase';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  isLiveConnected: boolean;
  isLoggingIn: boolean;
  onLogin: (useRedirect?: boolean) => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  isLiveConnected,
  isLoggingIn,
  onLogin,
  onOpenAddModal,
}) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-blue-500/25">
              <img
                src="/pvclogo.png"
                alt="วิทยาลัยอาชีวศึกษาแพร่"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-950 via-blue-900 to-sky-600 bg-clip-text text-transparent">
                  MoneyDB
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                  Firebase Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-tight hidden sm:block">
                ระบบจัดการรายรับ-รายจ่าย สรุปผล & วิเคราะห์ข้อมูล
              </p>
            </div>
          </div>

          {/* Center Info / DB Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Database:</span>
            <span className="font-semibold text-slate-800 font-mono text-[11px]">MoneyDB</span>
            <span className="text-slate-300">|</span>
            {user ? (
              isLiveConnected ? (
                <span className="flex items-center gap-1 text-sky-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                  เรียลไทม์ (Cloud)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  กำลังซิงค์...
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                โหมดจำลอง (ออฟไลน์)
              </span>
            )}
          </div>

          {/* Right Actions: Add Tx & User Auth */}
          <div className="flex items-center gap-3">
            <button
              id="btn-navbar-add"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-sm shadow-sm shadow-blue-600/20 transition duration-150 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>

            {loadingAuth ? (
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="relative group">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`}
                    alt={user.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/50 ring-2 ring-sky-100"
                  />
                  <div className="absolute right-0 top-11 hidden group-hover:block z-50 min-w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-left">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mb-2 font-mono">
                      {user.email}
                    </p>
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        id="btn-profile-logout"
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-navbar-logout"
                  type="button"
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="hidden lg:inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                type="button"
                disabled={isLoggingIn}
                onClick={() => onLogin(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium shadow-xs transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    {/* Google "G" Icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>เข้าสู่ระบบด้วย Gmail</span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
