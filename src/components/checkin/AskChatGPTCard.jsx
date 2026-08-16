import React, { useCallback, useState } from 'react';
import { buildCheckInPrompt } from '../../data/enrichCheckIn';
import { PromptActionPanel } from '../content/NotebookPrimitives';

const CHATGPT_URL = 'https://chatgpt.com/';

function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

export function AskChatGPTCard({ enriched }) {
  const [question, setQuestion] = useState('');
  const [copyState, setCopyState] = useState('idle');

  const preparedPrompt = buildCheckInPrompt(question, enriched);

  const askFinancialAdvisor = useCallback(() => {
    setCopyState('idle');

    let copiedSynchronously = false;
    try {
      copiedSynchronously = copyTextFallback(preparedPrompt);
    } catch {
      copiedSynchronously = false;
    }

    let clipboardPromise = null;
    if (!copiedSynchronously && navigator.clipboard?.writeText) {
      try {
        clipboardPromise = navigator.clipboard.writeText(preparedPrompt);
      } catch {
        clipboardPromise = null;
      }
    }

    window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer');

    if (copiedSynchronously) {
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 4000);
      return;
    }

    if (clipboardPromise) {
      clipboardPromise
        .then(() => {
          setCopyState('copied');
          window.setTimeout(() => setCopyState('idle'), 4000);
        })
        .catch(() => setCopyState('failed'));
      return;
    }

    setCopyState('failed');
  }, [preparedPrompt]);

  const primaryLabel = copyState === 'copied'
    ? 'Prompt copied ✓'
    : copyState === 'failed'
      ? 'Open advisor — copy failed'
      : 'Ask the financial advisor →';

  return (
    <PromptActionPanel
      className="check-in-card check-in-ask-card"
      fieldClassName="check-in-ask-field"
      title="Ask the financial advisor"
      lead="Prepare a question about your current situation, then open ChatGPT with the full financial context ready to paste."
      value={question}
      onChange={setQuestion}
      placeholder="I'm thinking about buying back-porch furniture for about $1,200. Can we afford it without hurting our debt payoff plan?"
      primaryLabel={primaryLabel}
      onPrimaryClick={askFinancialAdvisor}
    />
  );
}
