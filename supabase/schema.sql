CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  job_description TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  applied_at DATE NOT NULL,
  job_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Indeed', 'Company Site', 'Other')),
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interview', 'Rejected', 'Offer')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- Index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);
