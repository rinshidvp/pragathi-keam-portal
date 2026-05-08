-- Restructure cutoffs to wide format with one row per (college, department, phase)
DROP TABLE IF EXISTS public.cutoffs CASCADE;

CREATE TABLE public.cutoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name text NOT NULL,
  department_name text NOT NULL,
  phase text NOT NULL,
  "SM" integer,
  "EZ" integer,
  "MU" integer,
  "BH" integer,
  "LA" integer,
  "BX" integer,
  "KU" integer,
  "SC" integer,
  "ST" integer,
  "EW" integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cutoffs are publicly readable" ON public.cutoffs FOR SELECT USING (true);
CREATE POLICY "Admins can insert cutoffs" ON public.cutoffs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cutoffs" ON public.cutoffs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cutoffs" ON public.cutoffs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_cutoffs_phase ON public.cutoffs(phase);
CREATE INDEX idx_cutoffs_college ON public.cutoffs(lower(college_name));
CREATE INDEX idx_cutoffs_dept ON public.cutoffs(lower(department_name));