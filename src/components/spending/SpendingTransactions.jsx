import React, { useMemo, useState } from 'react';
import { PanelSurface, SectionBlock } from '../notebook';
import './spending-transactions.css';

function money(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value ?? '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function SpendingTransactions({ transactions = [], merchantActivity = [] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [account, setAccount] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState({ field: 'date', direction: 'desc' });

  const categories = useMemo(
    () => [...new Set(transactions.map((item) => item.category).filter(Boolean))].sort(),
    [transactions],
  );
  const accounts = useMemo(
    () => [...new Set(transactions.map((item) => item.account).filter(Boolean))].sort(),
    [transactions],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (account !== 'all' && item.account !== account) return false;
      if (!needle) return true;
      return [item.name, item.category, item.account, item.detail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [transactions, query, category, account]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    const direction = sort.direction === 'asc' ? 1 : -1;

    next.sort((a, b) => {
      if (sort.field === 'amount') {
        const aAmount = Number(a.amount) || 0;
        const bAmount = Number(b.amount) || 0;
        if (aAmount !== bAmount) return (aAmount - bAmount) * direction;
      } else {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        const safeA = Number.isFinite(aDate) ? aDate : 0;
        const safeB = Number.isFinite(bDate) ? bDate : 0;
        if (safeA !== safeB) return (safeA - safeB) * direction;
      }

      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    });

    return next;
  }, [filtered, sort]);

  const toggleSort = (field) => {
    setSort((current) => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortIndicator = (field) => {
    if (sort.field !== field) return '↕';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  if (!transactions.length && !merchantActivity.length) return null;

  const visible = expanded ? sorted : sorted.slice(0, 40);
  const filteredTotal = filtered.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <SectionBlock label="All Spending Transactions" className="spending-transactions-section">
      <PanelSurface className="spending-transactions-panel">
        <div className="spending-transactions-intro">
          <div>
            <strong>{filtered.length} transactions</strong>
            <span>{money(filteredTotal)} shown by the current filters</span>
          </div>
          <p>
            The callouts above are the shortlist. This is the underlying monthly spending ledger so you can dig deeper whenever something sparks a question.
          </p>
        </div>

        {merchantActivity.length > 0 && (
          <div className="spending-merchant-activity">
            <h3>Merchant activity worth context</h3>
            <div className="spending-merchant-grid">
              {merchantActivity.slice(0, 12).map((merchant) => (
                <div key={merchant.name} className="spending-merchant-card">
                  <strong>{merchant.name}</strong>
                  <span>{merchant.count} transaction{merchant.count === 1 ? '' : 's'}</span>
                  <b>{money(merchant.total)}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="spending-transaction-filters" aria-label="Transaction filters">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search merchant, category, or account"
            aria-label="Search transactions"
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={account} onChange={(event) => setAccount(event.target.value)} aria-label="Filter by account">
            <option value="all">All accounts</option>
            {accounts.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="spending-transaction-table-wrap">
          <table className="spending-transaction-table">
            <thead>
              <tr>
                <th aria-sort={sort.field === 'date' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="spending-transaction-sort" onClick={() => toggleSort('date')}>
                    Date <span aria-hidden="true">{sortIndicator('date')}</span>
                  </button>
                </th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Account</th>
                <th aria-sort={sort.field === 'amount' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="spending-transaction-sort spending-transaction-sort--amount" onClick={() => toggleSort('amount')}>
                    Amount <span aria-hidden="true">{sortIndicator('amount')}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item, index) => (
                <tr key={item.id ?? `${item.date}-${item.name}-${index}`}>
                  <td>{item.date}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category || 'Other'}</td>
                  <td>{item.account || '—'}</td>
                  <td>{money(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 40 && (
          <button type="button" className="notebook-link-btn spending-transactions-toggle" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Show first 40' : `Show all ${filtered.length} transactions →`}
          </button>
        )}
      </PanelSurface>
    </SectionBlock>
  );
}
