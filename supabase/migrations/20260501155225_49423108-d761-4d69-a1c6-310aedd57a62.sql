
-- Colleges
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colleges are publicly readable" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Admins can insert colleges" ON public.colleges FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update colleges" ON public.colleges FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete colleges" ON public.colleges FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Departments
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are publicly readable" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- College <-> Department junction
CREATE TABLE public.college_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_id, department_id)
);
ALTER TABLE public.college_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "College-departments are publicly readable" ON public.college_departments FOR SELECT USING (true);
CREATE POLICY "Admins can insert college_departments" ON public.college_departments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update college_departments" ON public.college_departments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete college_departments" ON public.college_departments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Cutoffs (one row per college-department + category)
CREATE TYPE public.cutoff_category AS ENUM ('SM','EZ','MU','BH','LA','BX','KU','SC','ST');

CREATE TABLE public.cutoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_department_id UUID NOT NULL REFERENCES public.college_departments(id) ON DELETE CASCADE,
  category public.cutoff_category NOT NULL,
  rank INTEGER,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(college_department_id, category, year)
);
ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cutoffs are publicly readable" ON public.cutoffs FOR SELECT USING (true);
CREATE POLICY "Admins can insert cutoffs" ON public.cutoffs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cutoffs" ON public.cutoffs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cutoffs" ON public.cutoffs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Answer Keys
CREATE TABLE public.answer_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  paper_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Answer keys are publicly readable" ON public.answer_keys FOR SELECT USING (true);
CREATE POLICY "Admins can insert answer_keys" ON public.answer_keys FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update answer_keys" ON public.answer_keys FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete answer_keys" ON public.answer_keys FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Storage bucket for answer keys
INSERT INTO storage.buckets (id, name, public) VALUES ('answer-keys', 'answer-keys', true);

CREATE POLICY "Answer key files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'answer-keys');
CREATE POLICY "Admins can upload answer key files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'answer-keys' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update answer key files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'answer-keys' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete answer key files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'answer-keys' AND has_role(auth.uid(), 'admin'));
