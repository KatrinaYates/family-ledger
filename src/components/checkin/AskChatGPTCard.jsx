import React, { useCallback, useState } from 'react';
import { buildCheckInPrompt } from '../../data/enrichCheckIn';
import { PromptActionPanel } from '../content/NotebookPrimitives';

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
    <PromptActionPanel
      className="check-in-card check-in-ask-card"
      fieldClassName="check-in-ask-field"
      title="Ask the financial advisor"
      lead="Prepare a question about your current situation. Copy the prepared prompt to share with your financial advisor."
      value={question}
      onChange={setQuestion}
      placeholder="I'm thinking about buying back-porch furniture for about $1,200. Can we afford it without hurting our debt payoff plan?"
      primaryLabel="Ask the financial advisor →"
      onPrimaryClick={openChatGPT}
      secondaryLabel={copied ? 'Copied!' : 'Copy prepared prompt'}
      onSecondaryClick={copyPrompt}
    />
  );
}
