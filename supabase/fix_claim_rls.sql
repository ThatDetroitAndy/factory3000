-- Fix: Allow authenticated users to claim unclaimed cars (user_id IS NULL)
--
-- RUN THIS IN THE SUPABASE SQL EDITOR for project daoxdtyyjvevibrsiamt
-- Dashboard → SQL Editor → New Query → paste → Run
--
-- Background: The claim magic link flow tries to UPDATE a car's user_id to
-- associate it with the authenticated user. The existing RLS only permits
-- UPDATE where user_id = auth.uid() (i.e. already owned cars). Unclaimed
-- cars (user_id IS NULL) could not be updated by anyone except the service
-- role. This policy adds that permission so the claim works even without
-- SUPABASE_SERVICE_KEY set in Vercel.

-- Drop the old update policy if it exists (adjust name to match yours)
DROP POLICY IF EXISTS "Users can update own car" ON cars;

-- New policy: owner can update their own car, OR authenticated user can
-- claim an unclaimed car (user_id IS NULL → set to their own auth.uid())
CREATE POLICY "Users can update or claim cars"
ON cars
FOR UPDATE
USING (
  user_id = auth.uid()        -- already owns it
  OR user_id IS NULL          -- unclaimed — any authenticated user can claim
)
WITH CHECK (
  user_id = auth.uid()        -- can only set user_id to their own uid
);
