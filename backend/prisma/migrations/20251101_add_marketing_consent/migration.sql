ALTER TABLE IF EXISTS "Onboarding"
  ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- 만약 테이블이 소문자로 생성되어 있다면(따옴표 없이) 같이 처리
ALTER TABLE IF EXISTS onboarding
  ADD COLUMN IF NOT EXISTS "marketingConsent" BOOLEAN NOT NULL DEFAULT false;