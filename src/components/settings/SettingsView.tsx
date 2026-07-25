'use client';

import { useRef, useState } from 'react';
import { useHabitStore } from '@/store/habit-store';
import { MONTHS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, Moon, Sun, Palette, Calendar, Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const {
    currentYear, currentMonth, setMonth,
    isDark, toggleDark,
    exportAllData, importAllData, resetData,
    habits, entries
  } = useHabitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${currentYear}-${String(currentMonth).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        importAllData(json);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your habit tracker
        </p>
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#4F6BED]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Toggle between light and dark themes
              </p>
            </div>
            <button
              onClick={toggleDark}
              className={cn(
                'w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-1',
                isDark ? 'bg-[#4F6BED]' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center"
                animate={{ x: isDark ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isDark ? <Sun className="w-3 h-3 text-[#F59E0B]" /> : <Moon className="w-3 h-3 text-gray-500" />}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4F6BED]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Calendar</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">
              Year
            </label>
            <select
              value={currentYear}
              onChange={(e) => setMonth(Number(e.target.value), currentMonth)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F6BED]/50"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">
              Month
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((month, i) => (
                <button
                  key={month}
                  onClick={() => setMonth(currentYear, i + 1)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    currentMonth === i + 1
                      ? 'bg-[#4F6BED] text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4F6BED]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Data</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{habits.length} habits</span>
            <span>{entries.length} entries</span>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-[#4F6BED]" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Export Data</p>
              <p className="text-xs text-gray-500">Download as JSON file</p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4 text-[#22C55E]" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Import Data</p>
              <p className="text-xs text-gray-500">Restore from JSON backup</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {importStatus === 'success' && (
            <div className="text-sm text-[#22C55E] bg-[#22C55E]/10 px-3 py-2 rounded-lg">
              Data imported successfully!
            </div>
          )}
          {importStatus === 'error' && (
            <div className="text-sm text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">
              Invalid file format. Please use a valid backup file.
            </div>
          )}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#EF4444]/20 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#EF4444]/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <h3 className="text-sm font-semibold text-[#EF4444]">Danger Zone</h3>
          </div>
        </div>
        <div className="p-5">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-3 px-4 py-3 bg-[#EF4444]/5 hover:bg-[#EF4444]/10 rounded-lg transition-colors text-[#EF4444]"
            >
              <Trash2 className="w-4 h-4" />
              <div className="text-left">
                <p className="text-sm font-medium">Reset All Data</p>
                <p className="text-xs opacity-70">This action cannot be undone</p>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure? This will delete all your habits and tracking data permanently.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#DC2626] transition-colors"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
