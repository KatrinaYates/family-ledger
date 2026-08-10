import React, { useCallback, useState } from 'react';
import { buildCheckInPrompt } from '../../data/enrichCheckIn';
import { PanelCard } from '../content/NotebookPrimitives';

const CHATGPT_URL = 'https://chatgpt.com/';

export function AskChatGPTCard({ enriched }) {
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  const preparedPrompt = buildCheckInPrompt(question, enriched);

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preparedPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [preparedPrompt]);

  const openChatGPT = useCallback(() => {
    window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <PanelCard
      title="Ask the financial advisor"
      className="check-in-card check-in-ask-card"
    >
      <p className="check-in-card-lead">
        Prepare a question about your current situation. Copy the prepared prompt to share with your financial advisor.
      </p>
      <label className="prompt-field check-in-ask-field">
        <span className="prompt-field-label">Your question</span>
        <textarea
          rows={4}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="I'm thinking about buying back-porch furniture for about $1,200. Can we afford it without hurting our debt payoff plan?"
        />
      </label>
      <div className="check-in-ask-actions">
        <button type="button" className="check-in-btn check-in-btn-primary" onClick={openChatGPT}>
          Ask the financial advisor →
        </button>
        <button type="button" className="check-in-btn check-in-btn-secondary" onClick={copyPrompt}>
          {copied ? 'Copied!' : 'Copy prepared prompt'}
        </button>
      </div>
    </PanelCard>
  );
}
