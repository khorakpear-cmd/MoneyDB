import { CategoryInfo, PaymentMethod } from '../types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'transport', name: 'เดินทาง / น้ำมัน', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'housing', name: 'ค่าบ้าน / หอพัก / บิล', type: 'expense', icon: 'Home', color: '#8b5cf6' },
  { id: 'entertainment', name: 'บันเทิง / ท่องเที่ยว', type: 'expense', icon: 'Gamepad2', color: '#06b6d4' },
  { id: 'health', name: 'สุขภาพ / ยา / ประกัน', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'education', name: 'การศึกษา / หนังสือ', type: 'expense', icon: 'GraduationCap', color: '#10b981' },
  { id: 'family', name: 'ครอบครัว / สัตว์เลี้ยง', type: 'expense', icon: 'Smile', color: '#f59e0b' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือนประจำ', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'bonus', name: 'โบนัส / ค่าล่วงเวลา', type: 'income', icon: 'Gift', color: '#059669' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#0284c7' },
  { id: 'freelance', name: 'ฟรีแลนซ์ / งานเสริม', type: 'income', icon: 'Laptop', color: '#6366f1' },
  { id: 'investment', name: 'การลงทุน / ดอกเบี้ย / ปันผล', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'allowance', name: 'เงินช่วยเหลือ / ให้พิเศษ', type: 'income', icon: 'HeartHandshake', color: '#ec4899' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'Coins', color: '#14b8a6' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
  { id: 'transfer', label: 'โอนเงิน / บัญชี', icon: 'Smartphone' },
  { id: 'credit_card', label: 'บัตรเครดิต', icon: 'CreditCard' },
  { id: 'promptpay', label: 'พร้อมเพย์', icon: 'QrCode' },
];

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10) + 543; // Buddhist Era
  const month = THAI_MONTHS[parseInt(monthStr, 10) - 1] || monthStr;
  const day = parseInt(dayStr, 10);
  return `${day} ${month} ${year}`;
}
