/**
 * Main dashboard component for Orbital Copilot usage tracking.
 */

import { useMemo } from 'react';
import { CreditsChart, UsageTable, StatCard, BackgroundGraphics, ExportButton } from './';
import { WarningIcon, InboxIcon, OrbitalIcon, CreditsIcon, MessageIcon, ReportIcon, TrendIcon } from './icons';
import { useUsageData } from '../hooks';

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
        <div className="text-center relative z-10" role="status" aria-live="polite" aria-label="Loading usage data">
          <div className="relative w-16 h-16 mx-auto mb-6" aria-hidden="true">
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
        <div className="glass-card p-8 max-w-md text-center animate-scale-in relative z-10" role="alert" aria-live="assertive">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <WarningIcon className="w-6 h-6 text-red-600" />
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
            <InboxIcon className="w-6 h-6 text-accent-600" />
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
      
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-surface-100/80 backdrop-blur-md border-b border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg" aria-hidden="true">
              <OrbitalIcon className="w-6 h-6 text-white" aria-hidden />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Orbital Copilot</h1>
              <p className="text-surface-600 text-sm">
                Usage Dashboard • <span className="text-surface-800 font-medium">{billingPeriod}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <ExportButton data={data} filename={exportFilename} />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm" aria-label="User profile" role="img">
                <span aria-hidden="true">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 py-8 px-4 sm:px-6 lg:px-8" tabIndex={-1}>
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Total Credits Used" 
              value={stats.totalCredits.toFixed(2)} 
              delay={100} 
              highlight
              icon={<CreditsIcon />}
            />
            <StatCard 
              label="Messages" 
              value={stats.totalMessages} 
              delay={200}
              icon={<MessageIcon />}
            />
            <StatCard 
              label="Reports Generated" 
              value={stats.reportsGenerated} 
              delay={300}
              icon={<ReportIcon />}
            />
            <StatCard 
              label="Avg Credits/Message" 
              value={stats.avgCreditsPerMessage.toFixed(2)} 
              delay={400}
              icon={<TrendIcon />}
            />
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
