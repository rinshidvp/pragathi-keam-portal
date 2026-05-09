-- Department contacts table
CREATE TABLE public.department_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.department_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Department contacts are publicly readable"
ON public.department_contacts FOR SELECT
USING (true);

CREATE POLICY "Admins can insert department_contacts"
ON public.department_contacts FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update department_contacts"
ON public.department_contacts FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete department_contacts"
ON public.department_contacts FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.department_contacts (department, name, phone) VALUES
  ('CS', 'Devna', '+91 8921595525'),
  ('Mech', 'Shrevan', '+91 7736744328'),
  ('EEE', 'Navaneeth', '+91 9567202549'),
  ('ECE', 'Raza', '+91 7907315347'),
  ('Chem', 'Navaneeth R', '+91 7356561874'),
  ('CE', 'Amritha A S', '+91 9074698815'),
  ('ER', 'Akarsh', '+91 9633819322'),
  ('CS(AI)', 'Riya Sajeevan', '+91 8304989010');