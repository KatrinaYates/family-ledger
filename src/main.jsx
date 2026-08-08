import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import paperGrain from './assets/textures/paper-grain.svg';
import fabricWeave from './assets/textures/fabric-weave.svg';
import { isSupabaseBackend } from './repository';
import { SupabaseAuthGate } from './supabase/SupabaseAuthGate.jsx';
import { HouseholdGate } from './supabase/HouseholdGate.jsx';
import './styles.css';
import './usability.css';
import './auth.css';
import './household.css';

document.documentElement.style.setProperty('--paper-grain', `url("${paperGrain}")`);
document.documentElement.style.setProperty('--fabric-weave', `url("${fabricWeave}")`);

const app = isSupabaseBackend ? (
  <SupabaseAuthGate>
    <HouseholdGate>
      <App />
    </HouseholdGate>
  </SupabaseAuthGate>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
