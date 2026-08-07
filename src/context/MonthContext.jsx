import React, { createContext, useContext } from 'react';
import { DEFAULT_WORKFLOW } from '../data/defaultWorkflow';

/** @type {React.Context<{ monthId: string, month: object, workflow: typeof DEFAULT_WORKFLOW } | null>} */
const MonthContext = createContext(null);

export function MonthProvider({ monthId, month, workflow, children }) {
    const value = { monthId, month, workflow };
    return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonthContext() {
    const context = useContext(MonthContext);
    if (!context) {
        throw new Error('useMonthContext must be used within a MonthProvider');
    }
    return context;
}

/** Safe accessor for components that may render outside a month scope. */
export function useOptionalMonthContext() {
    return useContext(MonthContext);
}
