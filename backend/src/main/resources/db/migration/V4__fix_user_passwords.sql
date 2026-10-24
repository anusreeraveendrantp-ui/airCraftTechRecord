-- V4: Fix seed user password hashes
-- Previous hash in V2 was incorrect and did not match Password123!
-- New hash is BCrypt(Password123!, rounds=10)
UPDATE users
SET password_hash = '$2b$10$9KUkIN4.NL973ISLxjyG4OcwjfoM1u//YrGa.wmzX2qFeeHmZdf6.'
WHERE email IN ('admin@techrecords.dev', 'alice@techrecords.dev', 'auditor@techrecords.dev');
