/*
# Add Auth RPC Functions
This migration adds secure RPC functions to handle fetching security questions
and resetting passwords without requiring email verification.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/

-- Function to get a user's security question safely
CREATE OR REPLACE FUNCTION get_security_question(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question text;
BEGIN
  SELECT security_question INTO v_question 
  FROM public.profiles 
  WHERE username = p_username;
  
  RETURN v_question;
END;
$$;

-- Function to reset password using security answer
CREATE OR REPLACE FUNCTION reset_password_with_security_question(p_username text, p_answer text, p_new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_real_answer text;
BEGIN
  -- Get user id and correct answer
  SELECT id, security_answer INTO v_user_id, v_real_answer
  FROM public.profiles
  WHERE username = p_username;

  -- Check if user exists and answer matches
  IF v_user_id IS NOT NULL AND v_real_answer = p_answer THEN
    -- Update the password in auth.users
    UPDATE auth.users 
    SET encrypted_password = crypt(p_new_password, gen_salt('bf')) 
    WHERE id = v_user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
