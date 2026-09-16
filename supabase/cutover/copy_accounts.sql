-- Better Auth `account` password hashes are scrypt. Supabase Auth stores bcrypt
-- in auth.users.encrypted_password. Those are not interchangeable, so this
-- script does not copy passwords.
--
-- Run on a CLONE first, never as a surprise on production.
-- After copy_users.sql, first login is magic-link or password reset.
-- New Better Auth account rows are created on that first login.

DO $$
BEGIN
  RAISE NOTICE 'copy_accounts: skip password hashes (bcrypt != scrypt). Use magic-link or reset for first login after copy_users.sql.';
END $$;
