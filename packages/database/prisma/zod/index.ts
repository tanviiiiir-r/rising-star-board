/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod';
import { Prisma } from '../generated/client';
// File: TransactionIsolationLevel.schema.ts

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable'])

export type TransactionIsolationLevel = z.infer<typeof TransactionIsolationLevelSchema>;

// File: UserScalarFieldEnum.schema.ts

export const UserScalarFieldEnumSchema = z.enum(['id', 'name', 'email', 'emailVerified', 'image', 'createdAt', 'updatedAt', 'username', 'role', 'banned', 'banReason', 'banExpires', 'onboardingComplete', 'paymentsCustomerId', 'locale', 'displayUsername', 'twoFactorEnabled', 'lastActiveOrganizationId'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;

// File: SessionScalarFieldEnum.schema.ts

export const SessionScalarFieldEnumSchema = z.enum(['id', 'expiresAt', 'ipAddress', 'userAgent', 'userId', 'impersonatedBy', 'activeOrganizationId', 'token', 'createdAt', 'updatedAt'])

export type SessionScalarFieldEnum = z.infer<typeof SessionScalarFieldEnumSchema>;

// File: AccountScalarFieldEnum.schema.ts

export const AccountScalarFieldEnumSchema = z.enum(['id', 'accountId', 'providerId', 'userId', 'accessToken', 'refreshToken', 'idToken', 'expiresAt', 'password', 'accessTokenExpiresAt', 'refreshTokenExpiresAt', 'scope', 'createdAt', 'updatedAt'])

export type AccountScalarFieldEnum = z.infer<typeof AccountScalarFieldEnumSchema>;

// File: VerificationScalarFieldEnum.schema.ts

export const VerificationScalarFieldEnumSchema = z.enum(['id', 'identifier', 'value', 'expiresAt', 'createdAt', 'updatedAt'])

export type VerificationScalarFieldEnum = z.infer<typeof VerificationScalarFieldEnumSchema>;

// File: PasskeyScalarFieldEnum.schema.ts

export const PasskeyScalarFieldEnumSchema = z.enum(['id', 'name', 'publicKey', 'userId', 'credentialID', 'counter', 'deviceType', 'backedUp', 'transports', 'aaguid', 'createdAt'])

export type PasskeyScalarFieldEnum = z.infer<typeof PasskeyScalarFieldEnumSchema>;

// File: TwoFactorScalarFieldEnum.schema.ts

export const TwoFactorScalarFieldEnumSchema = z.enum(['id', 'secret', 'backupCodes', 'userId'])

export type TwoFactorScalarFieldEnum = z.infer<typeof TwoFactorScalarFieldEnumSchema>;

// File: OrganizationScalarFieldEnum.schema.ts

export const OrganizationScalarFieldEnumSchema = z.enum(['id', 'name', 'slug', 'logo', 'createdAt', 'metadata', 'paymentsCustomerId'])

export type OrganizationScalarFieldEnum = z.infer<typeof OrganizationScalarFieldEnumSchema>;

// File: MemberScalarFieldEnum.schema.ts

export const MemberScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'userId', 'role', 'createdAt'])

export type MemberScalarFieldEnum = z.infer<typeof MemberScalarFieldEnumSchema>;

// File: InvitationScalarFieldEnum.schema.ts

export const InvitationScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'email', 'role', 'status', 'expiresAt', 'inviterId', 'createdAt'])

export type InvitationScalarFieldEnum = z.infer<typeof InvitationScalarFieldEnumSchema>;

// File: PurchaseScalarFieldEnum.schema.ts

export const PurchaseScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'userId', 'type', 'customerId', 'subscriptionId', 'priceId', 'status', 'createdAt', 'updatedAt'])

export type PurchaseScalarFieldEnum = z.infer<typeof PurchaseScalarFieldEnumSchema>;

// File: NotificationScalarFieldEnum.schema.ts

export const NotificationScalarFieldEnumSchema = z.enum(['id', 'userId', 'type', 'data', 'link', 'read', 'createdAt', 'updatedAt'])

export type NotificationScalarFieldEnum = z.infer<typeof NotificationScalarFieldEnumSchema>;

// File: UserNotificationPreferenceScalarFieldEnum.schema.ts

export const UserNotificationPreferenceScalarFieldEnumSchema = z.enum(['id', 'userId', 'type', 'target', 'createdAt'])

export type UserNotificationPreferenceScalarFieldEnum = z.infer<typeof UserNotificationPreferenceScalarFieldEnumSchema>;

// File: CategoryScalarFieldEnum.schema.ts

export const CategoryScalarFieldEnumSchema = z.enum(['id', 'slug', 'name', 'sortOrder', 'description', 'status', 'createdAt'])

export type CategoryScalarFieldEnum = z.infer<typeof CategoryScalarFieldEnumSchema>;

// File: ListingScalarFieldEnum.schema.ts

export const ListingScalarFieldEnumSchema = z.enum(['id', 'ownerId', 'categoryId', 'name', 'tagline', 'url', 'description', 'slug', 'status', 'rejectionReason', 'approvedAt', 'allocationCents', 'allocationSetAt', 'createdAt', 'updatedAt'])

export type ListingScalarFieldEnum = z.infer<typeof ListingScalarFieldEnumSchema>;

// File: RankingScalarFieldEnum.schema.ts

export const RankingScalarFieldEnumSchema = z.enum(['listingId', 'score', 'rank', 'previousRank', 'uniqueViews', 'shares', 'computedAt'])

export type RankingScalarFieldEnum = z.infer<typeof RankingScalarFieldEnumSchema>;

// File: TodayRankingScalarFieldEnum.schema.ts

export const TodayRankingScalarFieldEnumSchema = z.enum(['listingId', 'score', 'rank', 'previousRank', 'uniqueViews', 'shares', 'computedAt'])

export type TodayRankingScalarFieldEnum = z.infer<typeof TodayRankingScalarFieldEnumSchema>;

// File: EventScalarFieldEnum.schema.ts

export const EventScalarFieldEnumSchema = z.enum(['id', 'listingId', 'kind', 'visitorKey', 'createdAt'])

export type EventScalarFieldEnum = z.infer<typeof EventScalarFieldEnumSchema>;

// File: WalletScalarFieldEnum.schema.ts

export const WalletScalarFieldEnumSchema = z.enum(['userId', 'availableCents', 'availablePoints', 'updatedAt'])

export type WalletScalarFieldEnum = z.infer<typeof WalletScalarFieldEnumSchema>;

// File: CreditLedgerScalarFieldEnum.schema.ts

export const CreditLedgerScalarFieldEnumSchema = z.enum(['id', 'userId', 'amountCents', 'type', 'referenceType', 'referenceId', 'reason', 'idempotencyKey', 'createdAt'])

export type CreditLedgerScalarFieldEnum = z.infer<typeof CreditLedgerScalarFieldEnumSchema>;

// File: PointLedgerScalarFieldEnum.schema.ts

export const PointLedgerScalarFieldEnumSchema = z.enum(['id', 'userId', 'amountPoints', 'type', 'referenceType', 'referenceId', 'reason', 'idempotencyKey', 'createdAt'])

export type PointLedgerScalarFieldEnum = z.infer<typeof PointLedgerScalarFieldEnumSchema>;

// File: DailyAllocationScalarFieldEnum.schema.ts

export const DailyAllocationScalarFieldEnumSchema = z.enum(['listingId', 'utcDate', 'amountCents', 'firstAllocatedAt'])

export type DailyAllocationScalarFieldEnum = z.infer<typeof DailyAllocationScalarFieldEnumSchema>;

// File: DailyRankSnapshotScalarFieldEnum.schema.ts

export const DailyRankSnapshotScalarFieldEnumSchema = z.enum(['listingId', 'utcDate', 'rank', 'allocationCents', 'uniqueViews', 'shares', 'frozenAt'])

export type DailyRankSnapshotScalarFieldEnum = z.infer<typeof DailyRankSnapshotScalarFieldEnumSchema>;

// File: AdminAuditLogScalarFieldEnum.schema.ts

export const AdminAuditLogScalarFieldEnumSchema = z.enum(['id', 'adminId', 'listingId', 'action', 'reason', 'createdAt'])

export type AdminAuditLogScalarFieldEnum = z.infer<typeof AdminAuditLogScalarFieldEnumSchema>;

// File: UserRoleScalarFieldEnum.schema.ts

export const UserRoleScalarFieldEnumSchema = z.enum(['id', 'userId', 'role', 'createdAt'])

export type UserRoleScalarFieldEnum = z.infer<typeof UserRoleScalarFieldEnumSchema>;

// File: ProfileScalarFieldEnum.schema.ts

export const ProfileScalarFieldEnumSchema = z.enum(['id', 'displayName', 'createdAt', 'updatedAt'])

export type ProfileScalarFieldEnum = z.infer<typeof ProfileScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: JsonNullValueInput.schema.ts

export const JsonNullValueInputSchema = z.enum(['JsonNull'])

export type JsonNullValueInput = z.infer<typeof JsonNullValueInputSchema>;

// File: QueryMode.schema.ts

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export type QueryMode = z.infer<typeof QueryModeSchema>;

// File: NullsOrder.schema.ts

export const NullsOrderSchema = z.enum(['first', 'last'])

export type NullsOrder = z.infer<typeof NullsOrderSchema>;

// File: JsonNullValueFilter.schema.ts

export const JsonNullValueFilterSchema = z.enum(['DbNull', 'JsonNull', 'AnyNull'])

export type JsonNullValueFilter = z.infer<typeof JsonNullValueFilterSchema>;

// File: PurchaseType.schema.ts

export const PurchaseTypeSchema = z.enum(['SUBSCRIPTION', 'ONE_TIME'])

export type PurchaseType = z.infer<typeof PurchaseTypeSchema>;

// File: NotificationType.schema.ts

export const NotificationTypeSchema = z.enum(['WELCOME', 'APP_UPDATE'])

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// File: NotificationTarget.schema.ts

export const NotificationTargetSchema = z.enum(['IN_APP', 'EMAIL'])

export type NotificationTarget = z.infer<typeof NotificationTargetSchema>;

// File: CategoryStatus.schema.ts

export const CategoryStatusSchema = z.enum(['active', 'hidden'])

export type CategoryStatus = z.infer<typeof CategoryStatusSchema>;

// File: ListingStatus.schema.ts

export const ListingStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export type ListingStatus = z.infer<typeof ListingStatusSchema>;

// File: EventKind.schema.ts

export const EventKindSchema = z.enum(['view', 'share'])

export type EventKind = z.infer<typeof EventKindSchema>;

// File: CreditLedgerType.schema.ts

export const CreditLedgerTypeSchema = z.enum(['admin_grant', 'allocation', 'allocation_release', 'topup', 'points_conversion', 'adjustment'])

export type CreditLedgerType = z.infer<typeof CreditLedgerTypeSchema>;

// File: PointLedgerType.schema.ts

export const PointLedgerTypeSchema = z.enum(['admin_grant', 'conversion', 'adjustment'])

export type PointLedgerType = z.infer<typeof PointLedgerTypeSchema>;

// File: AppRole.schema.ts

export const AppRoleSchema = z.enum(['admin', 'user'])

export type AppRole = z.infer<typeof AppRoleSchema>;

// File: User.schema.ts

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  username: z.string().nullish(),
  role: z.string().nullish(),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.date().nullish(),
  onboardingComplete: z.boolean(),
  paymentsCustomerId: z.string().nullish(),
  locale: z.string().nullish(),
  displayUsername: z.string().nullish(),
  twoFactorEnabled: z.boolean().nullish(),
  lastActiveOrganizationId: z.string().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;


// File: Session.schema.ts

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: z.string(),
  impersonatedBy: z.string().nullish(),
  activeOrganizationId: z.string().nullish(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SessionType = z.infer<typeof SessionSchema>;


// File: Account.schema.ts

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  idToken: z.string().nullish(),
  expiresAt: z.date().nullish(),
  password: z.string().nullish(),
  accessTokenExpiresAt: z.date().nullish(),
  refreshTokenExpiresAt: z.date().nullish(),
  scope: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountType = z.infer<typeof AccountSchema>;


// File: Verification.schema.ts

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().nullish(),
  updatedAt: z.date().nullish(),
});

export type VerificationType = z.infer<typeof VerificationSchema>;


// File: Passkey.schema.ts

export const PasskeySchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullish(),
  aaguid: z.string().nullish(),
  createdAt: z.date().nullish(),
});

export type PasskeyType = z.infer<typeof PasskeySchema>;


// File: TwoFactor.schema.ts

export const TwoFactorSchema = z.object({
  id: z.string(),
  secret: z.string(),
  backupCodes: z.string(),
  userId: z.string(),
});

export type TwoFactorType = z.infer<typeof TwoFactorSchema>;


// File: Organization.schema.ts

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullish(),
  logo: z.string().nullish(),
  createdAt: z.date(),
  metadata: z.string().nullish(),
  paymentsCustomerId: z.string().nullish(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;


// File: Member.schema.ts

export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
});

export type MemberType = z.infer<typeof MemberSchema>;


// File: Invitation.schema.ts

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullish(),
  status: z.string(),
  expiresAt: z.date(),
  inviterId: z.string(),
  createdAt: z.date(),
});

export type InvitationType = z.infer<typeof InvitationSchema>;


// File: Purchase.schema.ts

export const PurchaseSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullish(),
  userId: z.string().nullish(),
  type: PurchaseTypeSchema,
  customerId: z.string(),
  subscriptionId: z.string().nullish(),
  priceId: z.string(),
  status: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PurchaseModel = z.infer<typeof PurchaseSchema>;

// File: Notification.schema.ts

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  data: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  link: z.string().nullish(),
  read: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotificationModel = z.infer<typeof NotificationSchema>;

// File: UserNotificationPreference.schema.ts

export const UserNotificationPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  target: NotificationTargetSchema,
  createdAt: z.date(),
});

export type UserNotificationPreferenceType = z.infer<typeof UserNotificationPreferenceSchema>;


// File: Category.schema.ts

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
  description: z.string(),
  status: CategoryStatusSchema.default("active"),
  createdAt: z.date(),
});

export type CategoryType = z.infer<typeof CategorySchema>;


// File: Listing.schema.ts

export const ListingSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  tagline: z.string(),
  url: z.string(),
  description: z.string(),
  slug: z.string(),
  status: ListingStatusSchema.default("pending"),
  rejectionReason: z.string().nullish(),
  approvedAt: z.date().nullish(),
  allocationCents: z.number().int(),
  allocationSetAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ListingType = z.infer<typeof ListingSchema>;


// File: Ranking.schema.ts

export const RankingSchema = z.object({
  listingId: z.string(),
  score: z.instanceof(Prisma.Decimal, {
  message: "Field 'score' must be a Decimal. Location: ['Models', 'Ranking']",
}),
  rank: z.number().int(),
  previousRank: z.number().int().nullish(),
  uniqueViews: z.number().int(),
  shares: z.number().int(),
  computedAt: z.date(),
});

export type RankingType = z.infer<typeof RankingSchema>;


// File: TodayRanking.schema.ts

export const TodayRankingSchema = z.object({
  listingId: z.string(),
  score: z.instanceof(Prisma.Decimal, {
  message: "Field 'score' must be a Decimal. Location: ['Models', 'TodayRanking']",
}),
  rank: z.number().int(),
  previousRank: z.number().int().nullish(),
  uniqueViews: z.number().int(),
  shares: z.number().int(),
  computedAt: z.date(),
});

export type TodayRankingType = z.infer<typeof TodayRankingSchema>;


// File: Event.schema.ts

export const EventSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  kind: EventKindSchema,
  visitorKey: z.string(),
  createdAt: z.date(),
});

export type EventType = z.infer<typeof EventSchema>;


// File: Wallet.schema.ts

export const WalletSchema = z.object({
  userId: z.string(),
  availableCents: z.number().int(),
  availablePoints: z.number().int(),
  updatedAt: z.date(),
});

export type WalletType = z.infer<typeof WalletSchema>;


// File: CreditLedger.schema.ts

export const CreditLedgerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amountCents: z.number().int(),
  type: CreditLedgerTypeSchema,
  referenceType: z.string().nullish(),
  referenceId: z.string().nullish(),
  reason: z.string().nullish(),
  idempotencyKey: z.string().nullish(),
  createdAt: z.date(),
});

export type CreditLedgerModel = z.infer<typeof CreditLedgerSchema>;

// File: PointLedger.schema.ts

export const PointLedgerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amountPoints: z.number().int(),
  type: PointLedgerTypeSchema,
  referenceType: z.string().nullish(),
  referenceId: z.string().nullish(),
  reason: z.string().nullish(),
  idempotencyKey: z.string().nullish(),
  createdAt: z.date(),
});

export type PointLedgerModel = z.infer<typeof PointLedgerSchema>;

// File: DailyAllocation.schema.ts

export const DailyAllocationSchema = z.object({
  listingId: z.string(),
  utcDate: z.date(),
  amountCents: z.number().int(),
  firstAllocatedAt: z.date(),
});

export type DailyAllocationType = z.infer<typeof DailyAllocationSchema>;


// File: DailyRankSnapshot.schema.ts

export const DailyRankSnapshotSchema = z.object({
  listingId: z.string(),
  utcDate: z.date(),
  rank: z.number().int(),
  allocationCents: z.number().int(),
  uniqueViews: z.number().int(),
  shares: z.number().int(),
  frozenAt: z.date(),
});

export type DailyRankSnapshotType = z.infer<typeof DailyRankSnapshotSchema>;


// File: AdminAuditLog.schema.ts

export const AdminAuditLogSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  listingId: z.string().nullish(),
  action: z.string(),
  reason: z.string().nullish(),
  createdAt: z.date(),
});

export type AdminAuditLogType = z.infer<typeof AdminAuditLogSchema>;


// File: UserRole.schema.ts

export const UserRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: AppRoleSchema,
  createdAt: z.date(),
});

export type UserRoleType = z.infer<typeof UserRoleSchema>;


// File: Profile.schema.ts

export const ProfileSchema = z.object({
  id: z.string(),
  displayName: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProfileType = z.infer<typeof ProfileSchema>;

