import React, { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  X,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { FIREBASE_PROJECT_ID } from '../lib/firebase';

export interface AuthErrorInfo {
  code: string;
  message: string;
  hostname: string;
}

interface AuthErrorModalProps {
  isOpen: boolean;
  errorInfo: AuthErrorInfo | null;
  onClose: () => void;
  onRetryRedirect: () => void;
  onRetryPopup: () => void;
}

export const AuthErrorModal: React.FC<AuthErrorModalProps> = ({
  isOpen,
  errorInfo,
  onClose,
  onRetryRedirect,
  onRetryPopup,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !errorInfo) return null;

  const currentDomain = errorInfo.hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  const isUnauthorizedDomain = errorInfo.code === 'auth/unauthorized-domain';
  const isPopupClosed = errorInfo.code === 'auth/popup-closed-by-user';
  const isPopupBlocked = errorInfo.code === 'auth/popup-blocked';

  const consoleUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isUnauthorizedDomain
                  ? 'ยังไม่ได้เพิ่มโดเมนใน Firebase'
                  : isPopupClosed
                  ? 'หน้าต่างล็อกอินถูกปิดก่อนสำเร็จ'
                  : isPopupBlocked
                  ? 'เบราว์เซอร์บล็อกหน้าต่าง Pop-up'
                  : 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                รหัสข้อผิดพลาด: <span className="font-mono text-slate-700 font-semibold">{errorInfo.code}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600">
          {isUnauthorizedDomain ? (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-amber-800 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  สาเหตุ: โดเมนของ Vercel ยังไม่ได้รับอนุญาต
                </p>
                Firebase Authentication บล็อกการล็อกอินจากโดเมนนี้เพื่อความปลอดภัย กรุณาเพิ่มชื่อโดเมนนี้ใน <strong>Authorized domains</strong> ของ Firebase Console เพียง 1 ครั้ง
              </div>

              {/* Current Domain Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อโดเมนปัจจุบันที่ต้องนำไปใส่ใน Firebase Console:
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="font-mono text-sm font-bold text-blue-700 select-all truncate flex-1 pl-1">
                    {currentDomain}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Steps */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
                <div className="font-semibold text-slate-800 text-xs flex items-center justify-between">
                  <span>ขั้นตอนการเพิ่มโดเมน (ทำครั้งเดียว):</span>
                  <a
                    href={consoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline text-[11px]"
                  >
                    <span>เปิด Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
                  <li>
                    เปิดลิงก์{' '}
                    <a
                      href={consoleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Firebase Console โครงการ {FIREBASE_PROJECT_ID}
                    </a>
                  </li>
                  <li>
                    ไปที่เมนู <strong>Authentication</strong> &gt; แท็บ <strong>Settings</strong>
                  </li>
                  <li>
                    เลื่อนลงมาที่หัวข้อ <strong>Authorized domains</strong> (โดเมนที่ได้รับอนุญาต)
                  </li>
                  <li>
                    กดปุ่ม <strong>Add domain</strong> วางค่า <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-blue-600">{currentDomain}</code> แล้วกด <strong>Save</strong>
                  </li>
                  <li>กลับมากดปุ่มลองเข้าสู่ระบบอีกครั้ง</li>
                </ol>
              </div>
            </>
          ) : isPopupBlocked ? (
            <div className="space-y-3">
              <p>
                เบราว์เซอร์ของคุณมีการบล็อกหน้าต่าง Pop-up อัตโนมัติ กรุณาลองใช้วิธี <strong>เปลี่ยนหน้าไปยัง Google โดยตรง (Redirect)</strong> หรือปลดบล็อกป๊อปอัปในแถบ URL
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-words">
                {errorInfo.message || errorInfo.code}
              </div>
              <p className="text-xs text-slate-500">
                หากใช้งานบนมือถือหรือมีตัวบล็อกโฆษณา กรุณาลองใช้การเข้าสู่ระบบแบบ Redirect หรือใช้งานในโหมดจำลอง
              </p>
            </div>
          )}

          {/* Offline/Guest mode reassurance */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-900 text-xs flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>ยังสามารถใช้งานได้ปกติ:</strong> แม้ยังไม่ล็อกอิน ระบบจะบันทึกรายการลงในเครื่องของคุณ และสามารถใช้งานสรุปยอด กราฟวิเคราะห์ และส่งออก CSV ได้ครบถ้วน
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            ใช้งานในโหมดออฟไลน์
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetryRedirect}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>ลองแบบ Redirect</span>
            </button>

            <button
              type="button"
              onClick={onRetryPopup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ลองล็อกอินใหม่อีกครั้ง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
