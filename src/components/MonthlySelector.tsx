import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { THAI_MONTHS } from '../lib/constants';

interface MonthlySelectorProps {
  selectedYear: number;
  selectedMonth: number; // 1-12
  onChangeMonth: (year: number, month: number) => void;
  transactionCount: number;
}

export const MonthlySelector: React.FC<MonthlySelectorProps> = ({
  selectedYear,
  selectedMonth,
  onChangeMonth,
  transactionCount,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const handlePrev = () => {
    if (selectedMonth === 1) {
      onChangeMonth(selectedYear - 1, 12);
    } else {
      onChangeMonth(selectedYear, selectedMonth - 1);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 12) {
      onChangeMonth(selectedYear + 1, 1);
    } else {
      onChangeMonth(selectedYear, selectedMonth + 1);
    }
  };

  const handleResetCurrent = () => {
    onChangeMonth(currentYear, currentMonth);
  };

  const thaiYear = selectedYear + 543;
  const monthName = THAI_MONTHS[selectedMonth - 1];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
      
      {/* Month Navigator */}
      <div className="flex items-center gap-2">
        <button
          id="btn-prev-month"
          type="button"
          onClick={handlePrev}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition active:scale-95 cursor-pointer"
          title="เดือนก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-base sm:text-lg">
            {monthName} {thaiYear}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({selectedYear})
          </span>
        </div>

        <button
          id="btn-next-month"
          type="button"
          onClick={handleNext}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition active:scale-95 cursor-pointer"
          title="เดือนถัดไป"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {!isCurrentMonth && (
          <button
            id="btn-current-month"
            type="button"
            onClick={handleResetCurrent}
            className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>เดือนปัจจุบัน</span>
          </button>
        )}
      </div>

      {/* Transaction counter in month */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>รายการประจำเดือน:</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold">
          {transactionCount} รายการ
        </span>
      </div>

    </div>
  );
};
