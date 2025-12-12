module.exports = [
"[project]/app/icon.svg.mjs { IMAGE => \"[project]/app/icon.svg (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/icon.svg.mjs { IMAGE => \"[project]/app/icon.svg (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/mockData.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "accounts",
    ()=>accounts,
    "credentialsByAccountId",
    ()=>credentialsByAccountId,
    "formatCurrency",
    ()=>formatCurrency,
    "getAccountRouteId",
    ()=>getAccountRouteId,
    "journalEntries",
    ()=>journalEntries,
    "mockAccounts",
    ()=>mockAccounts,
    "normalizeAccounts",
    ()=>normalizeAccounts,
    "rulesByAccountId",
    ()=>rulesByAccountId,
    "trades",
    ()=>trades
]);
const accounts = [
    {
        id: "VF-2025-8423",
        label: "$100k Funded",
        type: "Funded Account",
        size: 100_000,
        balance: 125_430,
        equity: 125_750.5,
        dailyPnl: 1_250.5,
        totalPnl: 25_430,
        startDate: "2025-10-15",
        phase: "Funded",
        status: "active",
        winRate: 68.5,
        profitFactor: 2.34
    },
    {
        id: "VF-2025-8401",
        label: "$80k Challenge",
        type: "Phase 2 Challenge",
        size: 80_000,
        balance: 84_245,
        equity: 84_380.25,
        dailyPnl: 780,
        totalPnl: 4_245,
        startDate: "2025-11-20",
        phase: "Phase 2",
        status: "in-progress",
        winRate: 64.2,
        profitFactor: 1.92
    },
    {
        id: "VF-2025-8392",
        label: "$40k Challenge",
        type: "Phase 1 Challenge",
        size: 40_000,
        balance: 40_157,
        equity: 40_245,
        dailyPnl: 88,
        totalPnl: 157,
        startDate: "2025-12-01",
        phase: "Phase 1",
        status: "in-progress",
        winRate: 57.8,
        profitFactor: 1.35
    }
];
const mockAccounts = accounts;
function getAccountRouteId(a) {
    return (a?.id ?? a?.accountId ?? a?.account_id ?? a?.accountNumber ?? a?.number ?? a?.code ?? "").toString();
}
function normalizeAccounts(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "object") return Object.values(input);
    return [];
}
const trades = [
    {
        id: "T-1001",
        accountId: "VF-2025-8423",
        symbol: "NQ",
        side: "LONG",
        qty: 2,
        entryTime: "2025-12-12T14:23:15Z",
        exitTime: "2025-12-12T14:45:12Z",
        entryPrice: 21450.5,
        exitPrice: 21468.25,
        pnl: 712.5,
        fees: 4.5,
        commissions: 6,
        durationMinutes: 22,
        setupTag: "Breakout"
    },
    {
        id: "T-1002",
        accountId: "VF-2025-8423",
        symbol: "ES",
        side: "SHORT",
        qty: 3,
        entryTime: "2025-12-12T13:45:22Z",
        exitTime: "2025-12-12T14:10:03Z",
        entryPrice: 6025.75,
        exitPrice: 6020.5,
        pnl: 787.5,
        fees: 6,
        commissions: 9,
        durationMinutes: 25,
        setupTag: "Reversal"
    },
    {
        id: "T-1003",
        accountId: "VF-2025-8423",
        symbol: "NQ",
        side: "LONG",
        qty: 2,
        entryTime: "2025-12-12T12:15:08Z",
        exitTime: "2025-12-12T12:25:30Z",
        entryPrice: 21425,
        exitPrice: 21421.75,
        pnl: -130,
        fees: 4.5,
        commissions: 6,
        durationMinutes: 10,
        setupTag: "Failed Breakout"
    },
    {
        id: "T-1004",
        accountId: "VF-2025-8423",
        symbol: "NQ",
        side: "SHORT",
        qty: 2,
        entryTime: "2025-12-11T15:42:18Z",
        exitTime: "2025-12-11T15:51:48Z",
        entryPrice: 21380.75,
        exitPrice: 21375.5,
        pnl: 210,
        fees: 4.5,
        commissions: 6,
        durationMinutes: 9,
        setupTag: "MA Rejection"
    },
    {
        id: "T-2001",
        accountId: "VF-2025-8401",
        symbol: "CL",
        side: "LONG",
        qty: 1,
        entryTime: "2025-12-10T14:00:00Z",
        exitTime: "2025-12-10T14:35:00Z",
        entryPrice: 78.25,
        exitPrice: 79.1,
        pnl: 850,
        fees: 2.5,
        commissions: 5,
        durationMinutes: 35,
        setupTag: "Breakout"
    },
    {
        id: "T-2002",
        accountId: "VF-2025-8401",
        symbol: "ES",
        side: "SHORT",
        qty: 1,
        entryTime: "2025-12-09T16:10:00Z",
        exitTime: "2025-12-09T16:30:00Z",
        entryPrice: 6030,
        exitPrice: 6042,
        pnl: -600,
        fees: 2,
        commissions: 4,
        durationMinutes: 20,
        setupTag: "Fade"
    },
    {
        id: "T-3001",
        accountId: "VF-2025-8392",
        symbol: "MNQ",
        side: "LONG",
        qty: 5,
        entryTime: "2025-12-08T12:30:00Z",
        exitTime: "2025-12-08T12:55:00Z",
        entryPrice: 21400,
        exitPrice: 21412,
        pnl: 600,
        fees: 6,
        commissions: 10,
        durationMinutes: 25,
        setupTag: "Pullback"
    }
];
const journalEntries = [
    {
        id: "J-1",
        accountId: "VF-2025-8423",
        tradeId: "T-1001",
        date: "2025-12-12",
        content: "Great breakout trade, waited for volume confirmation and scaled out near target.",
        tags: [
            "Breakout",
            "Focus"
        ],
        mood: "Confident",
        notes: "Stay patient on entries."
    },
    {
        id: "J-2",
        accountId: "VF-2025-8423",
        tradeId: "T-1003",
        date: "2025-12-12",
        content: "Forced a breakout in chop. Need to respect no-trade zones.",
        tags: [
            "Discipline"
        ],
        mood: "Stressed",
        notes: "Add alarm for chop filter."
    },
    {
        id: "J-3",
        accountId: "VF-2025-8401",
        date: "2025-12-09",
        content: "Took a fade against trend. Acceptable risk but late to exit.",
        tags: [
            "Fade",
            "Risk"
        ],
        mood: "Calm"
    }
];
const rulesByAccountId = {
    "VF-2025-8423": {
        profitTarget: "8% ($8,000)",
        maxDailyLoss: "5% ($5,000)",
        maxTotalLoss: "10% ($10,000)",
        minTradingDays: 5,
        consistencyRule: "No single day > 40% of total profit",
        payoutSplit: "90/10"
    },
    "VF-2025-8401": {
        profitTarget: "8% ($6,400)",
        maxDailyLoss: "5% ($4,000)",
        maxTotalLoss: "10% ($8,000)",
        minTradingDays: 4,
        consistencyRule: "No single day > 40% of total profit",
        trailingDrawdown: "$3,500"
    },
    "VF-2025-8392": {
        profitTarget: "8% ($3,200)",
        maxDailyLoss: "5% ($2,000)",
        maxTotalLoss: "10% ($4,000)",
        minTradingDays: 4,
        consistencyRule: "No single day > 40% of total profit"
    }
};
const credentialsByAccountId = {
    "VF-2025-8423": [
        {
            provider: "Tradovate",
            username: "funded_trader***",
            status: "connected"
        },
        {
            provider: "NinjaTrader",
            username: "nt_live_***",
            status: "connected"
        }
    ],
    "VF-2025-8401": [
        {
            provider: "Tradovate",
            username: "phase2_user***",
            status: "connected"
        }
    ],
    "VF-2025-8392": [
        {
            provider: "Tradovate",
            username: "phase1_user***",
            status: "pending"
        }
    ]
};
function formatCurrency(value, options = {}) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        ...options
    }).format(value);
}
}),
"[project]/components/accounts/account-details-view.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AccountDetailsView",
    ()=>AccountDetailsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AccountDetailsView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AccountDetailsView() from the server but AccountDetailsView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/accounts/account-details-view.tsx <module evaluation>", "AccountDetailsView");
}),
"[project]/components/accounts/account-details-view.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AccountDetailsView",
    ()=>AccountDetailsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AccountDetailsView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AccountDetailsView() from the server but AccountDetailsView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/accounts/account-details-view.tsx", "AccountDetailsView");
}),
"[project]/components/accounts/account-details-view.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$accounts$2f$account$2d$details$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/accounts/account-details-view.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$accounts$2f$account$2d$details$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/accounts/account-details-view.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$accounts$2f$account$2d$details$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/accounts/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountDetailsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mockData.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$accounts$2f$account$2d$details$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/accounts/account-details-view.tsx [app-rsc] (ecmascript)");
;
;
;
;
function AccountDetailsPage({ params }) {
    const raw = params.id ?? "";
    const routeId = decodeURIComponent(raw).trim();
    const accounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAccounts"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mockAccounts"]);
    const account = accounts.find((a)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccountRouteId"])(a) === routeId);
    if (!account) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6 space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl text-white",
                    children: "Account not found"
                }, void 0, false, {
                    fileName: "[project]/app/accounts/[id]/page.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-zinc-400",
                    children: [
                        "We couldn't locate an account with ID: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "text-white",
                            children: routeId
                        }, void 0, false, {
                            fileName: "[project]/app/accounts/[id]/page.tsx",
                            lineNumber: 24,
                            columnNumber: 55
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/accounts/[id]/page.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/accounts",
                    className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-600 transition-colors",
                    children: "Back to Accounts"
                }, void 0, false, {
                    fileName: "[project]/app/accounts/[id]/page.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/accounts/[id]/page.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this);
    }
    const accountTrades = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["trades"].filter((t)=>t.accountId === (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccountRouteId"])(account));
    const accountJournal = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["journalEntries"].filter((j)=>j.accountId === (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccountRouteId"])(account));
    const rules = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rulesByAccountId"][(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccountRouteId"])(account)];
    const creds = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["credentialsByAccountId"][(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAccountRouteId"])(account)];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 pb-10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$accounts$2f$account$2d$details$2d$view$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AccountDetailsView"], {
            account: account,
            trades: accountTrades,
            journalEntries: accountJournal,
            rules: rules,
            credentials: creds
        }, void 0, false, {
            fileName: "[project]/app/accounts/[id]/page.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/accounts/[id]/page.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/accounts/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/accounts/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__30bb670c._.js.map