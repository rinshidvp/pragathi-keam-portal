
-- Drop old cutoffs table (relational structure) and recreate as flat table
DROP TABLE IF EXISTS public.cutoffs CASCADE;

CREATE TABLE public.cutoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_name TEXT NOT NULL,
  department_name TEXT NOT NULL,
  category TEXT NOT NULL,
  cutoff_rank INTEGER NOT NULL,
  phase TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cutoffs_category_rank ON public.cutoffs (category, cutoff_rank);
CREATE INDEX idx_cutoffs_college ON public.cutoffs (college_name);
CREATE INDEX idx_cutoffs_department ON public.cutoffs (department_name);

ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cutoffs are publicly readable"
  ON public.cutoffs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert cutoffs"
  ON public.cutoffs FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cutoffs"
  ON public.cutoffs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cutoffs"
  ON public.cutoffs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
