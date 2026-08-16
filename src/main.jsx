import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import paperGrain from './assets/textures/paper-grain.svg';
import fabricWeave from './assets/textures/fabric-weave.svg';
import { isSupabaseBackend } from './repository';
import { BootGateProvider } from './context/BootGate.jsx';
import { SupabaseAuthGate } from './supabase/SupabaseAuthGate.jsx';
import { HouseholdGate } from './supabase/HouseholdGate.jsx';
import './styles.css';
import './usability.css';
import './auth.css';
import './household.css';
import './household-members.css';
import './chart-components.css';

document.documentElement.style.setProperty('--paper-grain', `url("${paperGrain}")`);
document.documentElement.style.setProperty('--fabric-weave', `url("${fabricWeave}")`);

const app = isSupabaseBackend ? (
  <BootGateProvider>
    <SupabaseAuthGate>
      <HouseholdGate>
        <App />
      </HouseholdGate>
    </SupabaseAuthGate>
  </BootGateProvider>
) : (
  <BootGateProvider>
    <App />
  </BootGateProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
