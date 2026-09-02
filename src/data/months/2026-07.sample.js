/** PLACEHOLDER DEMO DATA — contract shape. Not real. Used for GitHub Pages / public builds only. */
export default {
  schemaVersion: 1,
  monthId: '2026-07',
  workflow: {
    status: 'meeting_ready',
    sourceAsOf: null,
    reviewedAt: null,
    lockedAt: null,
  },
  generation: {
    source: 'sample',
    version: 1,
    generatedAt: null,
  },
  dataQuality: {
    staleConnections: [
      { institution: 'Sample Brokerage', lastSync: '2026-06-01' },
    ],
    missingAccounts: [
      { name: 'Mortgage', type: 'liability' },
    ],
    warnings: [
      {
        code: 'sample_data',
        message: 'SAMPLE DATA: All figures are placeholders. Connect real accounts in a local file for actual numbers.',
      },
      {
        code: 'stale_apr',
        message: 'Discover APR last verified August 6 — confirm before locking the month.',
      },
    ],
  },
  sourceData: {
  "meta": {
    "month": "July",
    "year": 2026,
    "meetingDate": "Lorem ipsum meeting date placeholder",
    "meetingLength": "00–00 minutes (sample)",
    "motto": "Lorem ipsum dolor sit amet — sample motto text only.",
    "intention": "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    "focus": "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.",
    "biggestWin": "Sample win text placeholder — $0 recorded.",
    "biggestFocus": "Sample focus text placeholder — replace with real data in local file.",
    "names": "Person A & Person B"
  },
  "snapshot": {
    "netWorth": {
      "label": "Connected Net Worth (sample)",
      "value": "$0",
      "components": [
        {
          "label": "Cash (placeholder)",
          "value": "$0"
        },
        {
          "label": "Retirement (placeholder)",
          "value": "$0"
        },
        {
          "label": "Connected debt (placeholder)",
          "value": "$0"
        }
      ],
      "status": "Lorem ipsum status line — demo data only.",
      "insight": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
      "caveat": "SAMPLE DATA: All figures are zero. Connect real accounts in 2026-07.local.js for actual numbers."
    },
    "cash": {
      "total": "$0",
      "status": "Placeholder status text for cash section.",
      "insight": "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.",
      "kpis": [
        {
          "label": "Sample KPI one",
          "value": "$0",
          "tone": "good"
        },
        {
          "label": "Sample KPI two",
          "value": "$0",
          "tone": "watch"
        },
        {
          "label": "Sample KPI three",
          "value": "$0",
          "tone": "yellow"
        },
        {
          "label": "Sample KPI four",
          "value": "$0",
          "tone": "blue"
        },
        {
          "label": "Sample KPI five",
          "value": "$0",
          "tone": "purple"
        }
      ],
      "accounts": [
        {
          "name": "Placeholder account alpha",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder account beta",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder account gamma",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder account delta",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder jar epsilon",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder jar zeta",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder jar eta",
          "amount": "$0.00"
        },
        {
          "name": "Placeholder app theta",
          "amount": "$0.00"
        }
      ]
    },
    "emergencyFund": {
      "value": "$0",
      "target": "$0",
      "monthContributions": "$0",
      "status": "Sample emergency fund status — lorem ipsum.",
      "insight": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
      "meetingNeeded": "Placeholder prompt: define sample emergency fund rules here."
    },
    "retirement": {
      "total": "$0",
      "monthContributions": "$0",
      "status": "Sample retirement status line.",
      "insight": "At vero eos et accusamus et iusto odio dignissimos ducimus.",
      "accounts": [
        {
          "name": "Sample retirement account 1",
          "amount": "$0"
        },
        {
          "name": "Sample retirement account 2",
          "amount": "$0"
        },
        {
          "name": "Sample retirement account 3",
          "amount": "$0"
        },
        {
          "name": "Sample retirement account 4",
          "amount": "$0"
        }
      ],
      "note": "Placeholder note — sample data only, all balances zero."
    },
    "debt": {
      "total": "$0",
      "monthPayments": "$0",
      "measurementStatus": null,
      "status": "Sample debt status — demo placeholder.",
      "insight": "Nam libero tempore cum soluta nobis est eligendi optio cumque.",
      "loans": [
        {
          "name": "Sample loan placeholder A",
          "amount": "$0"
        },
        {
          "name": "Sample loan placeholder B",
          "amount": "$0"
        },
        {
          "name": "Sample loan placeholder C",
          "amount": "$0"
        }
      ],
      "creditCards": [
        {
          "name": "Sample card placeholder 1",
          "amount": "$0"
        },
        {
          "name": "Sample card placeholder 2",
          "amount": "$0"
        },
        {
          "name": "Sample card placeholder 3",
          "amount": "$0"
        },
        {
          "name": "Sample card placeholder 4",
          "amount": "$0"
        }
      ]
    }
  },
  "story": {
    "income": {
      "total": "$0",
      "period": "Sample period text — lorem ipsum date range placeholder",
      "groups": [
        {
          "label": "Regular take-home",
          "items": [
            {
              "name": "Sample income source lorem",
              "amount": "$0"
            },
            {
              "name": "Sample income source ipsum",
              "amount": "$0"
            }
          ]
        },
        {
          "label": "Benefits income",
          "items": [
            {
              "name": "Sample benefit placeholder",
              "amount": "$0"
            }
          ]
        },
        {
          "label": "One-time income",
          "items": [
            {
              "name": "Sample one-time placeholder",
              "amount": "$0"
            }
          ]
        },
        {
          "label": "Interest",
          "items": [
            {
              "name": "Sample interest placeholder",
              "amount": "$0"
            }
          ]
        }
      ],
      "context": "Lorem ipsum context line — sample data, not real income narrative."
    },
    "bills": {
      "items": [
        {
          "name": "Sample bill category lorem",
          "amount": "$0"
        },
        {
          "name": "Sample bill category ipsum",
          "amount": "$0"
        },
        {
          "name": "Sample bill category dolor",
          "amount": "$0"
        },
        {
          "name": "Sample bill category sit",
          "amount": "$0"
        },
        {
          "name": "Sample bill category amet",
          "amount": "$0"
        },
        {
          "name": "Sample bill category consectetur",
          "amount": "$0"
        },
        {
          "name": "Sample bill TBD placeholder",
          "amount": "—"
        }
      ]
    },
    "lifestyle": {
      "items": [
        {
          "name": "Sample lifestyle alpha",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle beta",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle gamma",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle delta",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle epsilon",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle zeta",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle eta",
          "amount": "$0"
        },
        {
          "name": "Sample lifestyle theta",
          "amount": "$0"
        }
      ]
    },
    "savings": {
      "note": "Placeholder savings note — lorem ipsum dolor sit amet consectetur.",
      "missing": [
        "Sample missing item one",
        "Sample missing item two",
        "Sample missing item three"
      ]
    },
    "investments": {
      "monthContributions": "$0",
      "types": [
        "Sample type A",
        "Sample type B",
        "Sample type C",
        "Sample type D"
      ]
    },
    "debtPayments": {
      "items": [
        {
          "name": "Sample debt payment one",
          "amount": "$0"
        },
        {
          "name": "Sample debt payment two",
          "amount": "$0"
        },
        {
          "name": "Sample debt payment three",
          "amount": "$0"
        }
      ],
      "note": "Placeholder debt payment note — demo text only."
    },
    "endingPosition": {
      "totalCash": "$0",
      "billsAccount": "$0",
      "childrenSavings": "$0",
      "available": "$0",
      "summary": "Lorem ipsum ending position summary — all values are zero in sample data."
    },
    "explanation": {
      "title": "What explains this month? (sample)",
      "items": [
        {
          "name": "Sample explanation item one",
          "amount": "$0"
        },
        {
          "name": "Sample explanation item two",
          "amount": "$0"
        },
        {
          "name": "Sample explanation item three",
          "amount": "$0"
        },
        {
          "name": "Sample trend placeholder",
          "amount": "—"
        },
        {
          "name": "Sample trend placeholder two",
          "amount": "—"
        }
      ],
      "closing": "Closing lorem ipsum line — sample narrative placeholder text only."
    }
  },
  "spending": {
    "total": "$0",
    "priorMonth": "$0",
    "change": "$0",
    "changePercent": "0%",
    "topCategories": [
      {
        "rank": 1,
        "name": "Sample category lorem",
        "amount": "$0"
      },
      {
        "rank": 2,
        "name": "Sample category ipsum",
        "amount": "$0"
      },
      {
        "rank": 3,
        "name": "Sample category dolor",
        "amount": "$0"
      },
      {
        "rank": 4,
        "name": "Sample category sit",
        "amount": "$0"
      },
      {
        "rank": 5,
        "name": "Sample category amet",
        "amount": "$0"
      },
      {
        "rank": 6,
        "name": "Sample category elit",
        "amount": "$0"
      }
    ],
    "changes": [
      {
        "category": "Sample change alpha",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": "Lorem placeholder"
      },
      {
        "category": "Sample change beta",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": "Ipsum placeholder"
      },
      {
        "category": "Sample change gamma",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": ""
      },
      {
        "category": "Sample change delta",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": ""
      },
      {
        "category": "Sample change epsilon",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": ""
      },
      {
        "category": "Sample change zeta",
        "prior": "$0",
        "current": "$0",
        "change": "$0",
        "reason": ""
      }
    ],
    "bigPurchases": [
      {
        "name": "Sample merchant lorem",
        "amount": "$0"
      },
      {
        "name": "Sample merchant ipsum",
        "amount": "$0"
      },
      {
        "name": "Sample merchant dolor",
        "amount": "$0"
      },
      {
        "name": "Sample merchant sit",
        "amount": "$0"
      },
      {
        "name": "Sample merchant amet",
        "amount": "$0"
      },
      {
        "name": "Sample merchant elit",
        "amount": "$0"
      },
      {
        "name": "Sample merchant sed",
        "amount": "$0"
      },
      {
        "name": "Sample merchant do",
        "amount": "$0"
      }
    ],
    "unexpected": [
      "Sample unexpected one",
      "Sample unexpected two",
      "Sample unexpected three",
      "Sample unexpected four"
    ],
    "questions": [
      "Sample discussion question lorem ipsum?",
      "Sample discussion question dolor sit amet?",
      "Sample discussion question consectetur adipiscing?",
      "Sample discussion question elit sed do?",
      "Sample discussion question eiusmod tempor?"
    ]
  },
  "cfo": {
    "recommendations": [
      {
        "id": "cfo-rec-1",
        "rank": 1,
        "type": "no_spend",
        "headline": "Pause dining out for two weeks",
        "action": "Use groceries already at home and redirect the avoided dining-out spending.",
        "timeframe": "14 days",
        "amountFreed": 420,
        "target": {
          "type": "debt",
          "name": "Sample Discover Card",
          "currentBalance": 2180,
          "projectedBalance": 1760
        },
        "impact": {
          "extraPayment": 420,
          "payoffTimeReducedMonths": null,
          "interestAvoided": null
        },
        "evidence": [
          {
            "label": "Recent two-week dining average",
            "value": 420
          }
        ],
        "calculationLine": "$420 avoided dining spending → $420 extra Sample Discover payment",
        "assumptions": [
          "Estimate is based on the transaction period supplied to ChatGPT."
        ],
        "confidence": "high",
        "visualization": {
          "type": "balance_comparison",
          "currentValue": 2180,
          "projectedValue": 1760,
          "currentLabel": "Current balance",
          "projectedLabel": "After proposed payment"
        }
      },
      {
        "id": "cfo-rec-2",
        "rank": 2,
        "type": "spending_cap",
        "headline": "Keep grocery spending near last month's normal level",
        "action": "Avoid this month's convenience increase and redirect the difference to debt.",
        "timeframe": "Rest of month",
        "amountFreed": 300,
        "target": {
          "type": "debt",
          "name": "Sample Visa Card",
          "currentBalance": 5400,
          "projectedBalance": 5100
        },
        "impact": {
          "extraPayment": 300
        },
        "calculationLine": "$310 increase avoided → realistic $300 extra payment",
        "confidence": "medium",
        "visualization": {
          "type": "balance_comparison",
          "currentValue": 5400,
          "projectedValue": 5100,
          "currentLabel": "Current Visa balance",
          "projectedLabel": "After extra payment"
        }
      },
      {
        "id": "cfo-rec-3",
        "rank": 3,
        "type": "subscription_cut",
        "headline": "Pause three sample subscriptions",
        "action": "Cancel or pause the listed subscriptions and auto-apply the freed amount to the current snowball debt.",
        "timeframe": "Ongoing",
        "amountFreed": 74,
        "target": {
          "type": "debt",
          "name": "Current snowball debt"
        },
        "visualization": {
          "type": "allocation",
          "items": [
            { "label": "Streaming A", "value": 22 },
            { "label": "App B", "value": 18 },
            { "label": "Service C", "value": 34 }
          ]
        },
        "confidence": "high"
      }
    ]
  },
  "future": {
    "retirement": {
      "balance": "$0",
      "monthContributions": "$0",
      "balanceCaveat": "Sample data — balance is not a true month-end snapshot.",
      "projectionNote": "Placeholder projection note — sample data, all figures zero."
    },
    "kidsSavings": {
      "total": "$0",
      "monthContributions": "$0",
      "monthInterest": "$0",
      "accounts": [],
      "note": "Protected for the kids and excluded from household spendable cash."
    },
    "goals": [],
    "upcoming": []
  },
  "retrospective": {
    "subtitle": "A quick look back before we decide what comes next.",
    "questionsToConsider": [
      {
        "id": "least-value",
        "question": "What purchase or category gave us the least value?",
        "context": "Sample context — convenience spending increased this month in demo data.",
        "allowResponse": true
      },
      {
        "id": "stressful-expense",
        "question": "Was there a stressful expense we could prepare for next time?",
        "allowResponse": true
      },
      {
        "id": "alignment",
        "question": "What made it easier to stay aligned?",
        "allowResponse": true
      }
    ]
  },
  "meeting": {
    "currentUpdate": {
      "note": "Sample month-end update — balances below are demo placeholders only.",
      "metrics": [
        {
          "label": "Cash available",
          "monthEnd": "$4,200",
          "current": "$4,050",
          "change": "-$150"
        },
        {
          "label": "Total debt",
          "monthEnd": "$12,400",
          "current": "$12,180",
          "change": "-$220"
        }
      ],
      "debtBreakdown": {
        "creditCards": "$7,600",
        "loans": "$4,580"
      },
      "coverageNote": "Sample coverage note — demo data only."
    },
    "questions": [
      "Sample meeting question lorem ipsum dolor?",
      "Sample meeting question sit amet consectetur?",
      "Sample meeting question adipiscing elit sed?",
      "Sample meeting question do eiusmod tempor?",
      "Sample meeting question incididunt ut labore?"
    ]
  },
  "actions": {
    "items": [
      {
        "action": "Sample action item lorem ipsum placeholder",
        "owner": "Person A",
        "dueDate": "TBD",
        "status": "Not started"
      },
      {
        "action": "Sample action item dolor sit amet placeholder",
        "owner": "Person B",
        "dueDate": "TBD",
        "status": "Not started"
      },
      {
        "action": "Sample action item consectetur adipiscing",
        "owner": "Both",
        "dueDate": "TBD",
        "status": "Not started"
      },
      {
        "action": "Sample action item elit sed do eiusmod",
        "owner": "",
        "dueDate": "",
        "status": "Not started"
      },
      {
        "action": "Sample action item tempor incididunt ut",
        "owner": "",
        "dueDate": "",
        "status": "Not started"
      },
      {
        "action": "Sample action item labore et dolore magna",
        "owner": "",
        "dueDate": "",
        "status": "Not started"
      }
    ],
    "monthlyFocus": "Sample monthly focus text — lorem ipsum placeholder, zero dollars everywhere."
  },
  "celebrate": {
    "biggestWin": "Sample celebrate win — $0 placeholder text.",
    "moneySaved": "Sample money saved line — lorem ipsum demo.",
    "debtReduced": "Sample debt reduced line — $0 placeholder.",
    "bestHabit": "Sample best habit line — consectetur adipiscing elit placeholder.",
    "familyReward": "",
    "gratitude": ""
  },
  "handoff": {
    "summary": "Sample handoff summary — lorem ipsum dolor sit amet consectetur adipiscing elit. All figures in this file are zero. Replace with 2026-07.local.js for real data.",
    "carryForward": [
      "Sample carry forward one",
      "Sample carry forward two",
      "Sample carry forward three",
      "Sample carry forward four",
      "Sample carry forward five"
    ],
    "revisit": [
      "Sample revisit item one",
      "Sample revisit item two",
      "Sample revisit item three",
      "Sample revisit item four"
    ],
    "feedback": {
      "helpful": "",
      "repetitive": "",
      "missing": ""
    },
    "ideasForNextMonth": ""
  }
},
  generatedAnalysis: {},
  meetingData: {},
};
