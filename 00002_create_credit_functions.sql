-- Create function to increment credits
CREATE OR REPLACE FUNCTION increment_credits(user_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET time_credits = time_credits + amount
  WHERE id = user_id;
END;
$$;

-- Create function to decrement credits
CREATE OR REPLACE FUNCTION decrement_credits(user_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET time_credits = time_credits - amount
  WHERE id = user_id;
END;
$$;