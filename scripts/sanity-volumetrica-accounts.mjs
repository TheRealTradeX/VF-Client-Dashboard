import { createClient } from "@supabase/supabase-js";

const email = process.env.VF_SANITY_EMAIL ?? "peraltajefrey@gmail.com";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
}
if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const readString = (value) => (typeof value === "string" ? value.trim() : "");
const uniqueStrings = (values) => Array.from(new Set(values.filter(Boolean)));

const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
if (authError || !authUser?.user) {
  throw new Error(authError?.message ?? `No Supabase user found for ${email}`);
}

const userId = authUser.user.id;

const { data: linkedUsers, error: linkedError } = await supabase
  .from("volumetrica_users")
  .select("volumetrica_user_id, external_id, raw")
  .or([`external_id.eq.${userId}`, `external_id.eq.${email}`, `raw->>email.eq.${email}`].join(","));

if (linkedError) {
  throw new Error(linkedError.message);
}

const linkedUserIds = uniqueStrings(
  (linkedUsers ?? []).map((row) => readString(row?.volumetrica_user_id)),
);

if (!linkedUserIds.length) {
  throw new Error(`No linked Volumetrica user ids for ${email}`);
}

const filters = linkedUserIds.flatMap((id) => [
  `user_id.eq.${id}`,
  `owner_organization_user_id.eq.${id}`,
  `raw->user->>userId.eq.${id}`,
  `raw->>userId.eq.${id}`,
]);

const { data: accounts, error: accountsError } = await supabase
  .from("volumetrica_accounts")
  .select("account_id,user_id,owner_organization_user_id,raw,is_deleted")
  .eq("is_deleted", false)
  .or(filters.join(","));

if (accountsError) {
  throw new Error(accountsError.message);
}

const invalidAccounts =
  (accounts ?? []).filter((account) => {
    const accountUserId = readString(account?.user_id);
    const ownerUserId = readString(account?.owner_organization_user_id);
    const raw = account?.raw && typeof account.raw === "object" ? account.raw : null;
    const rawUser = raw?.user && typeof raw.user === "object" ? raw.user : null;
    const rawUserId = readString(rawUser?.userId) || readString(raw?.userId);
    return ![accountUserId, ownerUserId, rawUserId].some((id) => linkedUserIds.includes(id));
  }) ?? [];

console.log("Sanity: linked volumetrica user ids", linkedUserIds);
console.log("Sanity: account ids", (accounts ?? []).map((acct) => acct.account_id));

if (invalidAccounts.length) {
  console.error("Sanity failed: accounts not linked to user", invalidAccounts);
  process.exitCode = 1;
}
