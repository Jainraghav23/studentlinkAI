-- Keep only the oldest pending application for each email, then enforce that
-- future pending applications cannot duplicate an email address.
WITH ranked_pending AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY lower(email)
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM public.alumni_submissions
  WHERE status = 'pending'
)
DELETE FROM public.alumni_submissions submissions
USING ranked_pending ranked
WHERE submissions.id = ranked.id
  AND ranked.duplicate_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS alumni_submissions_pending_email_unique
ON public.alumni_submissions (lower(email))
WHERE status = 'pending';
