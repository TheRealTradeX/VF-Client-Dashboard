export type VolumetricaCategory = string | number;
export type VolumetricaEventType = string | number;

export type WebhookEventPayload = {
  id?: string;
  dtUtc?: string;
  category?: VolumetricaCategory;
  event?: VolumetricaEventType;
  userId?: string | null;
  accountId?: string | null;
  tradingAccount?: TradingAccountWebhookViewModel;
  tradingPosition?: TradingPositionViewModel;
  tradingPortfolio?: TradingPositionViewModel;
  subscription?: SubscriptionViewModel;
  tradeReport?: TradingTradeInfoModel;
  organizationUser?: OrganizationUserWebhookViewModel;
  [key: string]: unknown;
};

export type TradingAccountWebhookViewModel = {
  id?: string | null;
  snapshot?: unknown;
  enabled?: boolean;
  status?: string | number;
  tradingPermission?: string | number;
  reason?: string | null;
  endDate?: string | null;
  ruleId?: string | null;
  ruleName?: string | null;
  accountFamilyId?: string | null;
  ownerOrganizationUserId?: string | null;
  user?: UserOrganizationCompactViewModel | null;
  lastVersionId?: string | null;
  [key: string]: unknown;
};

export type UserOrganizationCompactViewModel = {
  userId?: string | null;
  organizationId?: number | null;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  extEntityId?: string | null;
  theme?: string | number | null;
  language?: string | null;
  propfirmName?: string | null;
  propfirmLogo?: string | null;
  [key: string]: unknown;
};

export type SubscriptionViewModel = {
  subscriptionId?: string | null;
  confirmationId?: string | null;
  status?: string | number;
  providerStatus?: string | number | null;
  activation?: string | null;
  expiration?: string | null;
  dxDataProducts?: number[] | null;
  dxAgreementSigned?: boolean;
  dxAgreementLink?: string | null;
  dxSelfCertification?: string | null;
  platform?: string | number | null;
  volumetricaPlatform?: string | null;
  volumetricaLicense?: string | null;
  volumetricaDownloadLink?: string | null;
  userId?: string | null;
  lastVersionId?: string | null;
  [key: string]: unknown;
};

export type TradingPositionViewModel = {
  contractId?: number | null;
  positionId?: number | null;
  symbolName?: string | null;
  contract?: unknown;
  entryDateUtc?: string | null;
  price?: number | null;
  quantity?: number | null;
  dailyPl?: number | null;
  convertedDailyPl?: number | null;
  dailyNetPl?: number | null;
  convertedDailyNetPl?: number | null;
  bought?: number | null;
  sold?: number | null;
  openPl?: number | null;
  convertedOpenPl?: number | null;
  [key: string]: unknown;
};

export type TradingTradeInfoModel = {
  tradeId?: number | null;
  contractId?: number | null;
  entryDate?: string | null;
  exitDate?: string | null;
  quantity?: number | null;
  openPrice?: number | null;
  closePrice?: number | null;
  pl?: number | null;
  convertedPL?: number | null;
  commissionPaid?: number | null;
  convertedCommissionPaid?: number | null;
  symbolName?: string | null;
  contract?: unknown;
  unaccounted?: boolean | null;
  flags?: number | null;
  [key: string]: unknown;
};

export type OrganizationUserWebhookViewModel = {
  id?: string | null;
  status?: string | number;
  externalId?: string | null;
  inviteUrl?: string | null;
  creationUtc?: string | null;
  updateUtc?: string | null;
  [key: string]: unknown;
};
