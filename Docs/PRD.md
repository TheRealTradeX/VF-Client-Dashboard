# Product Requirements Document (PRD)

Product: VF Client Dashboard (Trader Portal + Admin Console)  
Repo: `VF-Client-Dashboard` (this repo)  
Reference UI: `Docs/ReferenceUI/Dashboard Mockup.zip` (see `Docs/ReferenceUI/SCREEN_INVENTORY.md`)  
Integrations (external repos/services): Risk Engine + Rithmic integration (out of scope here, but required by contract)

## 1) Executive Summary

Build an institutional-grade, multi-tenant, white-label trading client dashboard for a prop firm. This repo provides the web UI (Next.js) and will integrate with external services (Risk Engine, Rithmic integration, payments, KYC, and optional white-label partner dashboards) via secure APIs + webhooks.

The target UI/UX and module scope are defined by the reference screens in `Docs/ReferenceUI/SCREEN_INVENTORY.md`. The goal is to take the current scaffold and ship a production-ready product: secure, tested, observable, and operationally maintainable.

## 2) Goals and Non-Goals

### Goals

- Production-ready Trader Portal and Admin Console aligned to the reference UI.
- First-class integration model for:
  - Rithmic-connected accounts (via external integration service).
  - Inbound/outbound webhooks (configurable, signed, audited).
  - Plug-in style connectors for third-party dashboards/trading platforms (API + webhooks).
- Institutional security: tenant isolation, RBAC, audit logs, secure webhook delivery, least-privilege, secrets hygiene.
- Comprehensive testing + release gates so changes ship with high confidence.

### Non-Goals (this repo)

- Implement Risk Engine logic or direct Rithmic connectivity within this repo.
- Replace external partner dashboards; instead provide APIs, webhooks, and embed/SSO options.

## 3) Current State (Repo Reality)

### Stack

- Next.js `^16`, React `^19`, TypeScript, Tailwind, Radix UI components.
- Supabase auth + SSR helpers (`@supabase/ssr`) with middleware gating:
  - Protected routes: `/dashboard/*`, `/admin/*`.
  - Admin check: `profiles.role === "admin"` in `middleware.ts`.

### Implemented UI (scaffold)

- Trader pages: `/dashboard`, `/accounts`, `/accounts/[id]`, `/journal`, `/challenges`, `/payouts`, `/leaderboard`, `/resources`, `/community`, `/settings`.
- Admin pages: `/admin` (overview), `/admin/accounts`, `/admin/users`, `/admin/verifications`, `/admin/payouts`, `/admin/settings` (mostly mocked/static).
- Data is currently mocked (see `lib/mockData.ts`).

### Key Gaps vs Reference UI

- Missing majority of Admin “Useful Tools” (webhooks manager/logs, whitelabel appearance, email templates, activity logs, trade symbols, trading platforms, analytics drilldowns).
- Missing full lifecycle flows: KYC, subscriptions, payouts approvals, program creation/editing, affiliate management, competition management, certificates issuance.
- No API contract layer for external services; no event/webhook framework; no multi-tenant model surfaced in UI.

## 4) Personas and Roles

- Trader: monitors accounts, rules, PnL, payouts; requests withdrawals; completes verification/KYC; downloads platform configs; participates in competitions; views leaderboard.
- Support/Ops: handles KYC queue, user/account support, escalations, customer comms, download links.
- Risk Manager: views risk reports, flags/copy-trading detection events, breach workflows, evidence and audit trail.
- Finance: subscriptions, payouts approvals, payout batching, reconciliation, invoices/receipts.
- Product Admin: programs (challenge definitions), certificates/templates, competitions.
- Platform Admin (Super Admin): tenant setup, whitelabel, trading platform connectors, webhooks, roles/permissions.

## 5) Product Scope (Modules)

Module scope is defined by the reference screens. Each module must include: UI, API contracts, RBAC, audit events, and test coverage.

### 5.1 Trader Portal

Reference: Trader screens in `Docs/ReferenceUI/SCREEN_INVENTORY.md`.

#### Dashboard

- KPIs: eligible profit, profit split, unrealized PnL, balance/equity curves, last update, selected account.
- Quick actions: “Trade now”, “New challenge”, shortcuts to verification/withdrawal/subscriptions.

#### Accounts + Account Details

- Multi-account overview cards; filters by status (active/inactive), challenge/funded/KYC state.
- Account detail: balances, equity, rules, trading platform/server, positions/orders, credentials status, downloads.
- Drilldowns: positions list; order details; rule status and breach history.

#### Verification (KYC)

- Step-based flow: identity, address, tax forms (configurable per tenant/jurisdiction).
- Status states: not verified, pending review, verified, denied (with reason + re-submit).

#### Subscriptions

- Subscription state: active, paused, canceled, failed payment; next renewal date; invoices.
- Change plan, update payment method, cancel flow with confirmation.

#### Withdrawals / Payout Requests

- Request payout with eligibility checks, required docs, payout method selection.
- View payout history and statuses; SLA expectations; dispute/escalation path.

#### Downloads

- Tenant-configured downloads (platform installers, configs, credentials guides).

#### Competitions + Leaderboard

- Competitions: join/leave rules, dates, scoring, prizes.
- Leaderboard: global + funded leaderboards; filters.

#### Affiliate (Trader-facing)

- Affiliate signup/activation, referral links, payout info (if enabled for tenant).

### 5.2 Admin Console

Reference: Admin screens in `Docs/ReferenceUI/SCREEN_INVENTORY.md`.

#### User Management

- Users list: filters (role, verification, country), search, actions menu.
- Accounts list + account details: program, status, platform, rules, equity curve, audit trail.
- Positions + order detail views with export.
- Verifications queue: review, approve/deny, request more info, SLA timers, audit.

#### Product Management

- Programs: create/edit multi-step program definitions (phases, rules, pricing, profit split, eligible symbols).
- Certificates: templates, issue flow, preview, download.
- Competitions: create/edit, manage entrants, scoring rules.
- Funded leaderboard configuration.

#### Financial Management

- Subscriptions: list, details, actions (pause/cancel/refund), payment status history.
- Payouts: review queue, approvals, batching, export, payment rails integration (external).

#### Affiliate Management

- Overview metrics, partners list/detail, tiers, coupons, commissions, affiliate payouts.

#### Useful Tools (Platform)

- Webhook Manager: create/edit endpoints, choose event types, signing secret rotation, enable/disable.
- Webhook Logs: delivery attempts, retries, payload preview with PII redaction, correlation IDs.
- Trading Platforms: configure platform connectors (Rithmic, others), entitlement mapping, health checks.
- Trade Symbols: manage allowed asset classes/symbols per tenant/program; versioned changes.
- Appearance (Whitelabel): brand assets, theme tokens, hosted login banner/competition banners, preview, safe file validation.
- Email Templates + Announcement Banner: templated comms with per-tenant overrides, preview, test-send.
- Activity Logs: security-relevant audit events, admin actions, exports.
- Analytics: user/accounts/payouts drilldowns; scheduled exports.

## 6) Integrations and Extensibility

### 6.1 Integration Principles

- This repo is a UI/BFF client; business logic lives in external services.
- All external calls use a single typed API client layer with:
  - Strict input/output validation (runtime schema).
  - Tenant scoping and RBAC enforcement.
  - Consistent retries/timeouts and error mapping.

### 6.2 Rithmic Integration (via external service)

Required capabilities (contract-level):

- Account provisioning & entitlement status (challenge/funded).
- Market data / trading session metadata for display (platform info).
- Orders/positions/trades retrieval for account details pages.
- Real-time updates via websocket/SSE *or* webhook fanout to a UI-friendly stream service.

UI requirements:

- “Trading Platforms” admin settings with connector health and per-tenant enablement.
- Trader “Trade now” entrypoints that deep-link or SSO into the chosen platform (configurable).

### 6.3 Webhooks (Inbound + Outbound)

Outbound:

- Webhook endpoints managed per tenant; each endpoint subscribes to event types.
- Delivery system supports retries with backoff, idempotency keys, and DLQ (external service).
- Payload signing (HMAC) with secret rotation; timestamped signatures; replay protection.

Inbound:

- Support inbound partner webhooks (e.g., CRM, payment provider, KYC provider) with signature verification and IP allowlists.
- All inbound events produce auditable state transitions with correlation IDs.

### 6.4 White-label / Partner Platform Integration

Provide three integration modes:

1) API-only (partner pulls data).
2) Webhooks + API (partner reacts to events).
3) Embedded/SSO (partner embeds the dashboard or routes users via SSO).

Requirements:

- Tenant-aware OAuth/SAML (future) or signed SSO tokens (initial), with session binding and MFA policies.
- Partner-scoped API keys with granular permissions and rate limits.

## 7) Data Model (Conceptual)

Minimum entities (system of record may live elsewhere; UI must model them consistently):

- Tenant/Organization, Branding, FeatureFlags
- User, Profile, Roles/Permissions, Sessions
- TradingAccount, AccountStatus, AccountPhase, Ruleset, BreachEvent
- Trade, Order, Position (or normalized views)
- Program, ChallengePurchase, Competition, LeaderboardEntry
- VerificationCase (KYC), VerificationDocument, ReviewDecision
- Subscription, Invoice, PaymentMethod
- PayoutRequest, PayoutBatch, PayoutStatus
- AffiliatePartner, Coupon, Commission, AffiliatePayout
- WebhookEndpoint, WebhookSubscription, WebhookDeliveryAttempt
- AuditLogEvent (append-only), AdminActionLog

## 8) Security Requirements (Institutional Baseline)

### 8.1 AuthN/AuthZ

- Enforce RBAC server-side for every API call and page (not only client-side conditionals).
- Tenant isolation: every query must be scoped by tenant; no cross-tenant identifiers in URLs without authorization checks.
- Strong session handling: secure cookies, rotation, inactivity timeouts, MFA readiness.

### 8.2 Webhook Security

- HMAC signatures with timestamp; reject replays; protect secrets; rotate safely.
- Store payloads encrypted at rest (external) and redact PII in UI previews.
- Rate limit endpoints and prevent SSRF when admins configure webhook URLs.

### 8.3 AppSec Hygiene

- Strict input validation for all forms and API calls.
- XSS-safe rendering (no unsafe HTML); CSP baseline; clickjacking protection; secure headers.
- Audit logging for admin actions (role changes, payouts approvals, webhook changes, branding changes).

### 8.4 Compliance Posture (configurable per tenant)

- KYC record retention rules and export controls.
- PII minimization and “need-to-know” access.
- GDPR/CCPA readiness: data export + deletion workflows (where legally permissible).

## 9) Non-Functional Requirements

- Performance: dashboard TTI < 2.5s on broadband for typical accounts; no blocking waterfalls; aggressive caching for read-heavy admin tables.
- Reliability: error budgets and SLOs; graceful degradation when external services fail.
- Observability: structured logs, traces, per-request correlation IDs; webhook delivery observability in admin.
- Accessibility: keyboard navigation and ARIA for key workflows; color contrast checks for dark mode.
- Internationalization: currency, time zone, locale-aware formatting; admin-configurable timezone (reference UI shows GMT offsets).

## 10) Delivery Plan (Codex-Max Execution Workflow)

Use the following staged workflow to ensure “clean, debugged, ready to ship” delivery. This mirrors the multi-agent/command model shown in the attached reference image (Planner/Engineer/QA/Scout/Debugger/Reviewer/Writer/Designer/Copywriter).

### Stage A — Discovery + Contracts

- Scout: inventory external services and APIs; confirm required events, entities, and auth mechanisms.
- Planner: finalize scope, milestones, acceptance criteria, and sequencing.
- Deliverables: API contract docs, event taxonomy, screen-to-route map, risk register.

### Stage B — UX/IA + Design System Alignment

- Designer: map each reference screen to a route and component tree; define reusable primitives (tables, filters, drawers, actions menus).
- Deliverables: route map, navigation, component inventory, interaction specs, empty/loading/error states.

### Stage C — Architecture + Integration Layer

- Engineer: build a typed API client layer, webhook surfaces, and multi-tenant boundaries.
- Deliverables: API client module, auth/tenant middleware, error handling patterns, feature flag scaffolding.

### Stage D — Implementation (Module-by-Module)

- Engineer: implement Trader Portal modules first (core adoption), then Admin Console modules (ops readiness).
- Deliverables: each module shipped behind feature flags with tests and audit events.

### Stage E — QA + Security + Hardening

- QA: automated tests (unit/integration/e2e), regression suites, performance checks.
- Reviewer: security review (OWASP), threat modeling for webhooks and tenant isolation, dependency audits.
- Debugger: fix flakes, race conditions, edge-case failures.

### Stage F — Launch Readiness

- Writer/Copywriter: help text, onboarding, empty states, admin tooltips, support docs.
- Reviewer: release checklist, rollback plan, incident runbooks.

## 11) Acceptance Criteria (Definition of Done)

Per module:

- Matches reference UI behaviors and layouts (within reasonable responsive constraints).
- All data paths are real (no mock-only UI) or explicitly flagged “stubbed” behind a feature flag.
- RBAC + tenant isolation validated via automated tests.
- Audit events emitted for sensitive actions.
- E2E tests cover primary workflows and failure states.
- Security scan gates pass (dependency + basic static analysis) and no known critical vulnerabilities remain open.

## 12) Testing, Quality, and Release Gates

### 12.1 Test Pyramid (Required)

- Unit tests: utilities, formatters, auth helpers, API client validation, RBAC/tenant helpers.
- Integration tests: API client ↔ mocked service contracts; webhook signature verification; error mapping.
- E2E tests: key Trader flows (login, dashboard, account details, payout request) and key Admin flows (KYC review, webhook create, payout approval).

### 12.2 Required CI Gates (Must Pass Before Merge)

- `npm run lint`
- `npm run build` (includes type-checking under Next)
- Unit/integration tests (framework choice to be finalized; must run in CI deterministically)
- E2E tests on preview/staging environment (Playwright recommended)
- Dependency vulnerability scan (block critical/high for internet-facing surfaces)
- Secrets scan (prevent committing `.env.local`, keys, signing secrets)

### 12.3 Pre-Production Gate (Must Pass Before Launch)

- Threat model review for: tenant isolation, RBAC, webhook manager/logs, admin actions, file uploads (branding).
- Webhook security validation:
  - signature verification, replay protection, secret rotation, retries/backoff behavior, DLQ handling.
- Performance smoke:
  - admin tables paginate correctly; no N+1 API calls; client bundle size within budget.
- Observability:
  - correlation IDs visible in UI for webhook logs and admin actions; error monitoring wired.
- Runbook readiness:
  - incident response checklist, rollback strategy, support escalation paths.

## 12) Open Questions (Needs Owner Answers)

- Tenant model: single firm vs multi-firm SaaS from day 1?
- KYC provider and required jurisdictions?
- Payment/subscription provider (Stripe, etc.) and invoicing requirements?
- Event taxonomy: authoritative list of webhook events and payload schemas?
- Real-time requirements: websocket/SSE vs polling for trades/positions?
- SSO requirements for partner/white-label integrations (SAML/OIDC timeline)?
