-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notification_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  allowed_domains TEXT[] DEFAULT '{}',
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  redirect_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forms
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view their own forms" 
ON public.forms FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms" 
ON public.forms FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" 
ON public.forms FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" 
ON public.forms FOR DELETE 
USING (auth.uid() = user_id);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  origin TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Submissions policies - users can only see submissions for their forms
CREATE POLICY "Users can view submissions for their forms" 
ON public.submissions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = submissions.form_id 
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update submissions for their forms" 
ON public.submissions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = submissions.form_id 
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete submissions for their forms" 
ON public.submissions FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = submissions.form_id 
    AND forms.user_id = auth.uid()
  )
);

-- IMPORTANT: Access Control Change for Next.js SaaS Architecture
-- We intentionally DO NOT include a public INSERT policy for submissions here.
-- The Next.js API Route Handler uses the Service Role Key to insert submissions.
-- This enforces that all submissions MUST go through the server-side API for validation and rate limiting.
-- If you need direct client-side submissions (less secure), uncomment the following:
/*
CREATE POLICY "Anyone can insert submissions" 
ON public.submissions FOR INSERT 
WITH CHECK (true);
*/

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_submissions_form_id ON public.submissions(form_id);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_submissions_is_read ON public.submissions(is_read);
