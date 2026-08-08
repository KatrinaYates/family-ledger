import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import paperGrain from './assets/textures/paper-grain.svg';
import fabricWeave from './assets/textures/fabric-weave.svg';
import { isSupabaseBackend } from './repository';
import { SupabaseAuthGate } from './supabase/SupabaseAuthGate.jsx';
import './styles.css';
import './usability.css';

document.documentElement.style.setProperty('--paper-grain', `url("${paperGrain}")`);
document.documentElement.style.setProperty('--fabric-weave', `url("${fabricWeave}")`);

const app = isSupabaseBackend ? (
  <SupabaseAuthGate><App /></SupabaseAuthGate>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
