import sample from './july2026.sample.js';
import { enrichJulyData } from './enrichJulyData.js';

const localModules = import.meta.glob('./july2026.local.js', { eager: true });
const local = localModules['./july2026.local.js']?.default;
const forceSample = import.meta.env.VITE_USE_SAMPLE_DATA === 'true';

/** True when gitignored local file is driving the UI (dev only). */
export const isUsingLocalData = Boolean(local && !forceSample);

const raw = forceSample ? sample : (local ?? sample);

export default enrichJulyData(raw);
