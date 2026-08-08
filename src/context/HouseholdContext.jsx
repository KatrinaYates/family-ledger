import React, { createContext, useContext } from 'react';

/** @typedef {import('../repository/types.js').HouseholdSummary} HouseholdSummary */

/**
 * @typedef {Object} HouseholdContextValue
 * @property {HouseholdSummary} activeHousehold
 * @property {HouseholdSummary[]} households
 * @property {boolean} busy
 * @property {string} error
 * @property {{ url: string, expiresAt: string } | null} createdInvite
 * @property {() => Promise<void>} createInvitation
 * @property {() => Promise<void>} copyInviteLink
 * @property {(householdId: string) => Promise<void>} chooseHousehold
 * @property {() => Promise<void>} signOut
 */

/** @type {React.Context<HouseholdContextValue | null>} */
const HouseholdContext = createContext(null);

/** @param {HouseholdContextValue} value */
export function HouseholdProvider({ value, children }) {
    return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold() {
    return useContext(HouseholdContext);
}
