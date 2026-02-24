-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create skill type enum
CREATE TYPE public.skill_type AS ENUM ('teach', 'learn');

-- Create skill category enum
CREATE TYPE public.skill_category AS ENUM (
  'coding',
  'design',
  'marketing',
  'music',
  'finance',
  'language',
  'writing',
  'photography',
  'cooking',
  'fitness',
  'other'
);

-- Create session status enum
CREATE TYPE public.session_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

-- Create location type enum
CREATE TYPE public.location_type AS ENUM ('online', 'on_campus');

-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('earn', 'spend');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  avatar text,
  bio text,
  time_credits integer DEFAULT 0 NOT NULL,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create skills table
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category skill_category NOT NULL,
  type skill_type NOT NULL,
  image text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  learner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration integer NOT NULL, -- in minutes
  status session_status DEFAULT 'pending'::session_status NOT NULL,
  location_type location_type NOT NULL,
  location_details text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  rater_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rated_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(session_id, rater_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type transaction_type NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_skills_type ON public.skills(type);
CREATE INDEX idx_sessions_teacher_id ON public.sessions(teacher_id);
CREATE INDEX idx_sessions_learner_id ON public.sessions(learner_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_ratings_rated_id ON public.ratings(rated_id);
CREATE INDEX idx_transactions_from_user_id ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user_id ON public.transactions(to_user_id);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Create trigger function to sync auth.users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (before @)
  extracted_username := split_part(NEW.email, '@', 1);
  
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_username,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger to sync users
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Skills policies
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own skills" ON skills
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" ON skills
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" ON skills
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT TO authenticated USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can create sessions as learner" ON sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Teachers can update their sessions" ON sessions
  FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);

-- Ratings policies
CREATE POLICY "Users can view ratings for their sessions" ON ratings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = ratings.session_id
      AND (s.teacher_id = auth.uid() OR s.learner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create ratings for their sessions" ON ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = rater_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT TO authenticated USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- Create public view for shareable profile info
CREATE VIEW public_profiles AS
  SELECT id, username, avatar, bio, role, created_at FROM profiles;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ihxyabkyqvwlzvzgpesi_skill_swap_images', 'ihxyabkyqvwlzvzgpesi_skill_swap_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ihxyabkyqvwlzvzgpesi_skill_swap_images');

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ihxyabkyqvwlzvzgpesi_skill_swap_images');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ihxyabkyqvwlzvzgpesi_skill_swap_images');

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ihxyabkyqvwlzvzgpesi_skill_swap_images');