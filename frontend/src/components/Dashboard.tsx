/**
 * Main dashboard component for Orbital Copilot usage tracking.
 * Features a premium dark theme with animated transitions.
 */

import { CreditsChart } from './CreditsChart';
import { UsageTable } from './UsageTable';
import { useUsageData } from '../hooks/useUsageData';

// Summary stat card component
function StatCard({ 
  label, 
  value, 
  suffix = '',
  delay = 0 
}: { 
  label: string; 
  value: string | number; 
  suffix?: string;
  delay?: number;
}) {
  return (
    <div 
      className="glass-card p-5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white font-mono">
        {value}
        {suffix && <span className="text-slate-400 text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

export function Dashboard() {
  const { data, isLoading, error } = useUsageData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Animated orbital loader */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-orbital-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orbital-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-orbital-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 rounded-full bg-orbital-500/20 animate-pulse"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center animate-scale-in">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-semibold mb-2">Error loading data</p>
          <p className="text-slate-400">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center animate-scale-in">
          <div className="w-12 h-12 rounded-full bg-orbital-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-orbital-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg">No usage data available</p>
          <p className="text-slate-500 text-sm mt-1">Usage will appear here once you start using Orbital Copilot</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalCredits = data.reduce((sum, item) => sum + item.credits_used, 0);
  const totalMessages = data.length;
  const reportsGenerated = data.filter(item => item.report_name).length;
  const avgCreditsPerMessage = totalCredits / totalMessages;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orbital-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-orbital-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <header className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            {/* Orbital logo/icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orbital-500 to-orbital-700 flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Usage Dashboard
              </h1>
              <p className="text-slate-400 text-sm">Orbital Copilot • Current Billing Period</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Credits Used" 
            value={totalCredits.toFixed(2)} 
            delay={100}
          />
          <StatCard 
            label="Messages" 
            value={totalMessages} 
            delay={200}
          />
          <StatCard 
            label="Reports Generated" 
            value={reportsGenerated} 
            delay={300}
          />
          <StatCard 
            label="Avg Credits/Message" 
            value={avgCreditsPerMessage.toFixed(2)} 
            delay={400}
          />
        </div>
        
        {/* Chart Section */}
        <section 
          className="glass-card p-6 mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Daily Credits Consumption</h2>
              <p className="text-sm text-slate-400">Credit usage breakdown by day</p>
            </div>
            <span className="badge badge-orbital">
              <span className="w-1.5 h-1.5 rounded-full bg-orbital-400 mr-1.5 animate-pulse"></span>
              Live
            </span>
          </div>
          <CreditsChart data={data} />
        </section>

        {/* Table Section */}
        <section 
          className="glass-card p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Usage Details</h2>
            <p className="text-sm text-slate-400">Click column headers to sort • Multi-column sorting supported</p>
          </div>
          <UsageTable data={data} />
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-slate-500 opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p>Orbital Copilot © {new Date().getFullYear()} • AI-powered due diligence for real estate law</p>
        </footer>
      </div>
    </div>
  );
}
