import React from 'react';
import { AmountList, CardGrid, PanelSurface, SectionBlock } from '../notebook';
import { ProgressBar } from '../checkin/CheckInVisuals';
import { DebtPayoffCalculator } from './DebtPayoffCalculator';
import './future-financial-sections.css';

function hasValue(value) {
  return value != null && value !== '' && value !== '—';
}

function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value == null || value === '') return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function MoneyPair({ label, value, note }) {
  if (!hasValue(value)) return null;
  return (
    <div className="future-money-pair">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function DebtAmountList({ title, items = [], total, className = '' }) {
  const rows = items
    .filter((item) => hasValue(item.amount ?? item.balance))
    .map((item) => ({
      name: item.name,
      amount: item.amount ?? item.balance,
    }));

  if (!rows.length) return null;

  return (
    <div className={`future-financial-subsection future-debt-ledger-card ${className}`.trim()}>
      <AmountList
        heading={title}
        items={rows}
        total={total}
        className="future-debt-amount-list"
      />
    </div>
  );
}

function DebtSection({ debt, payoffPlan }) {
  if (!debt && !payoffPlan) return null;
  const paymentActivity = debt?.paymentActivity ?? [];
  const cardTotal = (debt?.creditCards ?? []).reduce((sum, item) => {
    const value = parseMoney(item.amount ?? item.balance);
    return value == null ? sum : sum + value;
  }, 0);
  const loanTotal = (debt?.loans ?? []).reduce((sum, item) => {
    const value = parseMoney(item.amount ?? item.balance);
    return value == null ? sum : sum + value;
  }, 0);

  const formatTotal = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

  return (
    <SectionBlock label="Debt" className="future-financial-section future-debt-section">
      <PanelSurface className="future-financial-panel">
        <div className="future-financial-kpis future-debt-kpis">
          <MoneyPair label="Ending connected debt" value={debt?.total} />
          <MoneyPair label="Paid toward debt this month" value={debt?.paidThisMonth} />
        </div>

        {debt?.insight && <p className="future-financial-note future-debt-insight">{debt.insight}</p>}

        <div className="future-debt-ledgers">
          <DebtAmountList
            title="Credit cards"
            items={debt?.creditCards ?? []}
            total={cardTotal > 0 ? formatTotal(cardTotal) : undefined}
          />
          <DebtAmountList
            title="Loans"
            items={debt?.loans ?? []}
            total={loanTotal > 0 ? formatTotal(loanTotal) : undefined}
          />
          {paymentActivity.length > 0 && (
            <div className="future-debt-ledger-card future-debt-payment-card">
              <AmountList
                heading="Loan payment activity this month"
                items={paymentActivity.map((item) => ({ name: item.name, amount: item.amount }))}
                className="future-debt-payment-activity"
              />
            </div>
          )}
        </div>

        <DebtPayoffCalculator planningSnapshot={payoffPlan?.planningSnapshot} />
      </PanelSurface>
    </SectionBlock>
  );
}

function EmergencyFundSection({ emergencyFund }) {
  if (!emergencyFund || (!hasValue(emergencyFund.balance) && !hasValue(emergencyFund.value))) return null;

  const balance = parseMoney(emergencyFund.balance ?? emergencyFund.value);
  const target = parseMoney(emergencyFund.target);
  const percent = balance != null && target != null && target > 0
    ? Math.min(100, Math.round((balance / target) * 100))
    : null;

  return (
    <SectionBlock label="Emergency Fund" className="future-financial-section">
      <PanelSurface className="future-financial-panel">
        <div className="future-financial-kpis">
          <MoneyPair label="Balance" value={emergencyFund.balance ?? emergencyFund.value} />
          <MoneyPair label="Target" value={emergencyFund.target} />
          <MoneyPair label="Gap" value={emergencyFund.gap} />
          <MoneyPair label="Added this month" value={emergencyFund.monthAdded ?? emergencyFund.monthContributions} />
        </div>

        {percent != null && (
          <div className="future-emergency-progress">
            <div className="future-financial-subheading-row">
              <strong>{percent}% funded</strong>
              <span>{emergencyFund.balance ?? emergencyFund.value} of {emergencyFund.target}</span>
            </div>
            <ProgressBar
              percent={percent}
              label={`${percent}% of emergency fund target`}
              tone="teal"
              ariaLabel={`Emergency fund ${emergencyFund.balance ?? emergencyFund.value} of ${emergencyFund.target}, ${percent}% funded`}
            />
          </div>
        )}

        {emergencyFund.account && <p className="future-financial-note"><strong>Account:</strong> {emergencyFund.account}</p>}
        {emergencyFund.description && <p className="future-financial-note">{emergencyFund.description}</p>}
      </PanelSurface>
    </SectionBlock>
  );
}

function SavingsSection({ savings }) {
  const kids = savings?.kids;
  const other = savings?.other ?? [];
  if (!kids && !other.length) return null;
  return (
    <SectionBlock label="Savings" className="future-financial-section">
      <PanelSurface className="future-financial-panel">
        {kids && (
          <div className="future-financial-subsection">
            <div className="future-financial-subheading-row">
              <h3>Kids savings</h3>
              {hasValue(kids.total) && <strong>{kids.total}</strong>}
            </div>
            {kids.note && <p className="future-financial-note">{kids.note}</p>}
            <CardGrid columns={2} className="future-savings-grid">
              {(kids.accounts ?? []).map((account) => (
                <div className="future-savings-card" key={account.name}>
                  <span>{account.name}</span>
                  <strong>{account.balance ?? account.amount}</strong>
                  {hasValue(account.monthAdded) && <small>{account.monthAdded} added this month</small>}
                  {hasValue(account.monthContributions) && <small>{account.monthContributions} contributed</small>}
                  {hasValue(account.monthInterest) && <small>{account.monthInterest} interest</small>}
                </div>
              ))}
            </CardGrid>
          </div>
        )}

        {other.length > 0 && (
          <DebtAmountList title="Other savings" items={other} />
        )}
      </PanelSurface>
    </SectionBlock>
  );
}

function RetirementSection({ retirement }) {
  if (!retirement || (!hasValue(retirement.balance) && !hasValue(retirement.monthContributions) && !(retirement.accounts ?? []).length)) return null;
  const accounts = retirement.accounts ?? [];
  const activity = retirement.accountActivity ?? [];
  const currentAccounts = retirement.currentAccounts ?? [];

  return (
    <SectionBlock label="Retirement" className="future-financial-section future-retirement-section">
      <PanelSurface className="future-financial-panel">
        <div className="future-financial-kpis">
          <MoneyPair label="Connected balance" value={retirement.balance} note={retirement.balanceAsOf} />
          <MoneyPair label="Contributed this month" value={retirement.monthContributions} />
          <MoneyPair label="Current connected total" value={retirement.currentConnectedTotal} note={retirement.currentBalanceAsOf} />
        </div>

        {retirement.projectionNote && <p className="future-financial-note">{retirement.projectionNote}</p>}

        {currentAccounts.length > 0 && (
          <div className="future-financial-subsection">
            <div className="future-financial-subheading-row">
              <h3>Current balance by retirement account</h3>
              {retirement.currentBalanceAsOf && <span>{retirement.currentBalanceAsOf}</span>}
            </div>
            <div className="future-retirement-balance-grid">
              {currentAccounts.map((account, index) => (
                <article key={account.name ?? index} className="future-retirement-balance-card">
                  <span>{account.name}</span>
                  <strong>{account.balance ?? account.amount}</strong>
                  {account.asOf && <small>{account.asOf}</small>}
                </article>
              ))}
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="future-financial-subsection">
            <h3>Historical month snapshot</h3>
            <div className="future-financial-account-list">
              {accounts.map((account, index) => (
                <div className="future-financial-account" key={account.name ?? index}>
                  <div>
                    <strong>{account.name}</strong>
                    {account.asOf && <span>{account.asOf}</span>}
                  </div>
                  {hasValue(account.amount ?? account.balance) && <b>{account.amount ?? account.balance}</b>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.length > 0 && (
          <div className="future-financial-subsection">
            <h3>What went into each retirement account this month</h3>
            <div className="future-retirement-activity">
              {activity.map((account, index) => (
                <article key={account.name ?? index} className="future-retirement-account-card">
                  <div className="future-financial-subheading-row">
                    <strong>{account.name}</strong>
                    {hasValue(account.contributed) && <b>{account.contributed}</b>}
                  </div>
                  {(account.funds ?? []).length > 0 && (
                    <ul>
                      {account.funds.map((fund, fundIndex) => (
                        <li key={fund.name ?? fundIndex}>
                          <span>{fund.name}{fund.ticker ? ` · ${fund.ticker}` : ''}</span>
                          {hasValue(fund.amount) && <strong>{fund.amount}</strong>}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </PanelSurface>
    </SectionBlock>
  );
}

export function FutureFinancialSections({ debt, payoffPlan, emergencyFund, savings, retirement }) {
  return (
    <div className="future-financial-sections">
      <DebtSection debt={debt} payoffPlan={payoffPlan} />
      <EmergencyFundSection emergencyFund={emergencyFund} />
      <SavingsSection savings={savings} />
      <RetirementSection retirement={retirement} />
    </div>
  );
}
