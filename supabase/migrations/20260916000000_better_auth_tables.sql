-- Better Auth tables alongside auth.users. Does not retarget listing/wallet FKs.
-- Those FKs stay on auth.users until supabase/cutover/retarget_fks.sql.

CREATE TABLE IF NOT EXISTS public."user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  username text UNIQUE,
  role text,
  banned boolean,
  "banReason" text,
  "banExpires" timestamptz,
  "onboardingComplete" boolean NOT NULL DEFAULT false,
  "paymentsCustomerId" text,
  locale text,
  "displayUsername" text,
  "twoFactorEnabled" boolean,
  "lastActiveOrganizationId" text
);

CREATE TABLE IF NOT EXISTS public.session (
  id text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "impersonatedBy" text,
  "activeOrganizationId" text,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_userId_idx ON public.session ("userId");

CREATE TABLE IF NOT EXISTS public.account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "expiresAt" timestamptz,
  password text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_userId_idx ON public.account ("userId");

CREATE TABLE IF NOT EXISTS public.verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON public.verification (identifier);

CREATE TABLE IF NOT EXISTS public.passkey (
  id text PRIMARY KEY,
  name text,
  "publicKey" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "credentialID" text NOT NULL,
  counter integer NOT NULL,
  "deviceType" text NOT NULL,
  "backedUp" boolean NOT NULL,
  transports text,
  aaguid text,
  "createdAt" timestamptz
);
CREATE INDEX IF NOT EXISTS passkey_userId_idx ON public.passkey ("userId");
CREATE INDEX IF NOT EXISTS passkey_credentialID_idx ON public.passkey ("credentialID");

CREATE TABLE IF NOT EXISTS public."twoFactor" (
  id text PRIMARY KEY,
  secret text NOT NULL,
  "backupCodes" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS twoFactor_secret_idx ON public."twoFactor" (secret);
CREATE INDEX IF NOT EXISTS twoFactor_userId_idx ON public."twoFactor" ("userId");

CREATE TABLE IF NOT EXISTS public.organization (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  logo text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  metadata text,
  "paymentsCustomerId" text
);

CREATE TABLE IF NOT EXISTS public.member (
  id text PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role text NOT NULL,
  "createdAt" timestamptz NOT NULL,
  UNIQUE ("organizationId", "userId")
);

CREATE TABLE IF NOT EXISTS public.invitation (
  id text PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text,
  status text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "inviterId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase (
  id text PRIMARY KEY,
  "organizationId" text REFERENCES public.organization(id) ON DELETE CASCADE,
  "userId" uuid REFERENCES public."user"(id) ON DELETE CASCADE,
  type text NOT NULL,
  "customerId" text NOT NULL,
  "subscriptionId" text UNIQUE,
  "priceId" text NOT NULL,
  status text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification (
  id text PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  link text,
  read boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notification_preference (
  id text PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  type text NOT NULL,
  target text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId", type, target)
);
