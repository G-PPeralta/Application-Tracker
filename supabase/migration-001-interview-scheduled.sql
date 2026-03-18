-- Add interview_date column
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_date DATE;

-- Update status CHECK constraint to include 'Interview Scheduled'
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Applied', 'Interview Scheduled', 'Interview', 'Rejected', 'Offer'));
