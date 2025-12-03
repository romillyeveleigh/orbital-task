/**
 * Main dashboard component for Orbital Copilot usage tracking.
 */

import { useMemo } from 'react';
import { CreditsChart } from './CreditsChart';
import { UsageTable } from './UsageTable';
import { StatCard } from './StatCard';
import { BackgroundGraphics } from './BackgroundGraphics';
import { ExportButton } from './ExportButton';
import { useUsageData } from '../hooks/useUsageData';

export function Dashboard() {
  const { data, isLoading, error } = useUsageData();

  // Calculate stats and billing period from data
  const { stats, billingPeriod, formatDate } = useMemo(() => {
    if (data.length === 0) {
      return { stats: null, billingPeriod: '', formatDate: () => '' };
    }

    const totalCredits = data.reduce((sum, item) => sum + item.credits_used, 0);
    const totalMessages = data.length;
    const reportsGenerated = data.filter(item => item.report_name).length;
    const avgCreditsPerMessage = totalCredits / totalMessages;

    const dates = data.map(item => new Date(item.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const formatDateFn = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      stats: { totalCredits, totalMessages, reportsGenerated, avgCreditsPerMessage, startDate, endDate },
      billingPeriod: `${formatDateFn(startDate)} – ${formatDateFn(endDate)}`,
      formatDate: formatDateFn,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundGraphics />
        <div className="text-center relative z-10">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-accent-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 rounded-full bg-accent-100 animate-pulse" />
          </div>
          <p className="text-surface-600 font-medium">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BackgroundGraphics />
        <div className="glass-card p-8 max-w-md text-center animate-scale-in relative z-10">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-700 text-lg font-semibold mb-2">Error loading data</p>
          <p className="text-surface-600">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BackgroundGraphics />
        <div className="glass-card p-8 text-center animate-scale-in relative z-10">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-surface-800 text-lg">No usage data available</p>
          <p className="text-surface-600 text-sm mt-1">Usage will appear here once you start using Orbital Copilot</p>
        </div>
      </div>
    );
  }

  const exportFilename = `orbital-usage-${formatDate(stats.startDate).replace(/\s/g, '-')}-to-${formatDate(stats.endDate).replace(/\s/g, '-')}.csv`;

  return (
    <div className="min-h-screen relative">
      <BackgroundGraphics />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-surface-100/80 backdrop-blur-md border-b border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Orbital Copilot</h1>
              <p className="text-surface-600 text-sm">
                Usage Dashboard • <span className="text-surface-800 font-medium">{billingPeriod}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <ExportButton data={data} filename={exportFilename} />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Credits Used" value={stats.totalCredits.toFixed(2)} delay={100} highlight />
            <StatCard label="Messages" value={stats.totalMessages} delay={200} />
            <StatCard label="Reports Generated" value={stats.reportsGenerated} delay={300} />
            <StatCard label="Avg Credits/Message" value={stats.avgCreditsPerMessage.toFixed(2)} delay={400} />
          </div>
          
          {/* Chart Section */}
          <section className="glass-card-gradient p-6 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-surface-900">Daily Credits Consumption</h2>
              <p className="text-sm text-surface-600">Credit usage breakdown by day</p>
            </div>
            <CreditsChart data={data} />
          </section>

          {/* Table Section */}
          <section className="glass-card-gradient p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-surface-900">Usage Details</h2>
              <p className="text-sm text-surface-600">Click column headers to sort • Multi-column sorting supported</p>
            </div>
            <UsageTable data={data} />
          </section>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-surface-600 opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <p>Orbital Copilot © {new Date().getFullYear()} • AI-powered due diligence for real estate law</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
