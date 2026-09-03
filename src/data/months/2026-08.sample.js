/** Blank ledger month — 2026-08. Add real source data in a gitignored *.local.js file. */
export default {
  "schemaVersion": 1,
  "monthId": "2026-08",
  "workflow": {
    "status": "draft",
    "sourceAsOf": null,
    "reviewedAt": null,
    "lockedAt": null
  },
  "generation": {
    "source": "sample",
    "version": 1,
    "generatedAt": null
  },
  "dataQuality": {
    "staleConnections": [],
    "missingAccounts": [],
    "warnings": []
  },
  "sourceData": {
    "meta": {
      "month": "August",
      "year": 2026,
      "meetingLength": "",
      "motto": "",
      "intention": "",
      "focus": "",
      "biggestWin": "",
      "biggestFocus": "",
      "names": ""
    },
    "snapshot": {
      "netWorth": {
        "value": "—",
        "insight": "",
        "components": [],
        "status": "",
        "caveat": ""
      },
      "cash": {
        "total": "—",
        "totalExact": "—",
        "status": "",
        "insight": "",
        "kpis": [],
        "accounts": []
      },
      "retirement": {
        "total": "—",
        "totalExact": "—",
        "monthContributions": "—",
        "accounts": []
      },
      "emergencyFund": {
        "value": "—",
        "description": ""
      },
      "debt": {
        "total": "—",
        "groups": []
      }
    },
    "story": {
      "income": {
        "total": "—",
        "period": "",
        "groups": []
      },
      "bills": {
        "groups": []
      },
      "lifestyle": {
        "groups": []
      },
      "endingPosition": {
        "totalCash": "—",
        "billsAccount": "—",
        "available": "—"
      },
      "explanation": {
        "items": [],
        "closing": ""
      }
    },
    "spending": {
      "total": "—",
      "priorMonth": "—",
      "change": "—",
      "changePercent": "—",
      "topCategories": [],
      "momChanges": [],
      "bigPurchases": []
    },
    "cfo": {
      "recommendations": [
        {
          "id": "sample-cfo-rec-1",
          "rank": 1,
          "type": "spending_pause",
          "headline": "Pause one flexible category for a week",
          "action": "Use the verified demo trend to redirect a sample $75 toward the current payoff target.",
          "timeframe": "7 days",
          "amountFreed": 75,
          "target": {
            "type": "debt",
            "name": "Sample Card",
            "currentBalance": 1200,
            "projectedBalance": 1125
          },
          "evidence": [
            {
              "label": "Sample flexible spending",
              "value": 75
            }
          ],
          "calculationLine": "$75 avoided sample spending → $75 sample card payment",
          "assumptions": [
            "All values in this public record are fictional examples."
          ],
          "confidence": "sample",
          "visualization": {
            "type": "balance_comparison",
            "currentValue": 1200,
            "projectedValue": 1125,
            "currentLabel": "Current sample balance",
            "projectedLabel": "After sample payment"
          }
        }
      ]
    },
    "future": {
      "goals": [],
      "upcoming": [],
      "debtPayoffPlan": {
        "strategy": "Sample snowball order",
        "currentTarget": "Sample Card",
        "queue": [
          {
            "name": "Sample Card",
            "balance": 1200
          }
        ],
        "planningSnapshot": {
          "asOf": "2026-08-31",
          "baselineMonthlyBudget": 250,
          "baselineLabel": "Fictional repeatable monthly amount for the public sample.",
          "debts": [
            {
              "id": "sample-card",
              "name": "Sample Card",
              "balance": 1200,
              "apr": 18.5,
              "minimum": 50,
              "priority": 1
            }
          ]
        }
      },
      "retirement": {
        "balance": "—",
        "monthContributions": "—",
        "projectionNote": ""
      }
    },
    "meeting": {
      "questions": []
    },
    "retrospective": {
      "subtitle": "A fictional example of the monthly reflection contract.",
      "questionsToConsider": [
        {
          "id": "sample-least-value",
          "question": "Which sample purchase gave us the least value?",
          "context": "This is generic public demo content, not household analysis.",
          "allowResponse": true
        }
      ]
    },
    "actions": {
      "items": [
        {
          "id": "sample-action-1",
          "action": "Redirect the fictional $75 to the sample payoff target",
          "owner": "Person A",
          "dueDate": null,
          "status": "not_started"
        }
      ],
      "monthlyFocus": "Use the public sample recommendation as a contract example only."
    },
    "celebrate": {
      "biggestWin": "—",
      "bestHabit": "—",
      "moneySaved": "—",
      "debtReduced": "—"
    },
    "handoff": {
      "summary": "",
      "carryForward": [],
      "revisit": []
    }
  }
};
