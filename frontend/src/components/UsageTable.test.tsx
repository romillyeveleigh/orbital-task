/**
 * Tests for UsageTable component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { UsageTable } from './UsageTable';
import { UsageItem } from '../types';

const mockData: UsageItem[] = [
  {
    id: 1000,
    timestamp: '2024-04-29T02:08:29.375Z',
    report_name: 'Tenant Obligations Report',
    credits_used: 79.00,
  },
  {
    id: 1001,
    timestamp: '2024-04-29T03:25:03.613Z',
    credits_used: 5.80,
  },
  {
    id: 1002,
    timestamp: '2024-04-29T07:27:34.985Z',
    report_name: 'Short Lease Report',
    credits_used: 61.00,
  },
];

describe('UsageTable', () => {
  it('renders table headers', () => {
    render(<UsageTable data={mockData} />);
    
    expect(screen.getByText('Message ID')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Report Name')).toBeInTheDocument();
    expect(screen.getByText('Credits Used')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<UsageTable data={mockData} />);
    
    expect(screen.getByText('#1000')).toBeInTheDocument();
    expect(screen.getByText('#1001')).toBeInTheDocument();
    expect(screen.getByText('#1002')).toBeInTheDocument();
  });

  it('displays report names correctly', () => {
    render(<UsageTable data={mockData} />);
    
    expect(screen.getByText('Tenant Obligations Report')).toBeInTheDocument();
    expect(screen.getByText('Short Lease Report')).toBeInTheDocument();
  });

  it('displays dash for missing report names', () => {
    render(<UsageTable data={mockData} />);
    
    // The second item has no report_name
    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('formats credits to 2 decimal places', () => {
    render(<UsageTable data={mockData} />);
    
    expect(screen.getByText('79.00')).toBeInTheDocument();
    expect(screen.getByText('5.80')).toBeInTheDocument();
    expect(screen.getByText('61.00')).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    render(<UsageTable data={mockData} />);
    
    // Should format as DD-MM-YYYY HH:mm in UTC
    expect(screen.getByText('29-04-2024 02:08')).toBeInTheDocument();
    expect(screen.getByText('29-04-2024 03:25')).toBeInTheDocument();
  });

  it('shows entry count', () => {
    render(<UsageTable data={mockData} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/entries/)).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<UsageTable data={[]} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

