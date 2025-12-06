/*
  # Fix Dashboard Viewing Access

  ## Problem
  Dashboard cannot be viewed because RLS policies require authenticated users,
  but the dashboard is accessing data with anonymous (anon) access.

  ## Solution
  Update SELECT policies to allow both authenticated and anon roles to read data,
  while keeping INSERT/UPDATE/DELETE restricted to authenticated users only.

  ## Changes
  - Modify SELECT policies to allow 'anon' role in addition to 'authenticated'
  - Keep all write operations restricted to authenticated users
  - No schema changes, only policy updates
*/

-- ============================================================
-- UPDATE RLS POLICIES FOR kpi_categories
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view categories" ON kpi_categories;

CREATE POLICY "Anyone can view categories"
  ON kpi_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- UPDATE RLS POLICIES FOR kpi_metrics
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view metrics" ON kpi_metrics;

CREATE POLICY "Anyone can view metrics"
  ON kpi_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- UPDATE RLS POLICIES FOR kpi_weekly_data
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view weekly data" ON kpi_weekly_data;

CREATE POLICY "Anyone can view weekly data"
  ON kpi_weekly_data FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- UPDATE RLS POLICIES FOR action_plans
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view action plans" ON action_plans;

CREATE POLICY "Anyone can view action plans"
  ON action_plans FOR SELECT
  TO anon, authenticated
  USING (true);
