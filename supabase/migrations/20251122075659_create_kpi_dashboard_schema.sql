/*
  # KPI Dashboard Schema

  ## Overview
  Creates the database schema for a comprehensive KPI dashboard application with support for
  multiple categories (Safety, Quality, Production, Cost, People), weekly data tracking,
  and action plan management.

  ## New Tables

  ### 1. `kpi_categories`
  Stores the main KPI categories (Safety, Quality, Production, Cost, People)
  - `id` (uuid, primary key): Unique identifier
  - `name` (text): Category name (e.g., "Safety", "Quality")
  - `color` (text): Color code for UI display (e.g., "#10b981")
  - `icon` (text): Icon identifier for display
  - `display_order` (integer): Order for dashboard display
  - `created_at` (timestamptz): Record creation timestamp

  ### 2. `kpi_metrics`
  Stores individual KPI metrics within each category
  - `id` (uuid, primary key): Unique identifier
  - `category_id` (uuid, foreign key): References kpi_categories
  - `title` (text): Metric title (e.g., "No of Accidents")
  - `metric_type` (text): Type of metric (e.g., "count", "percentage")
  - `created_at` (timestamptz): Record creation timestamp

  ### 3. `kpi_weekly_data`
  Stores weekly data points for each metric
  - `id` (uuid, primary key): Unique identifier
  - `metric_id` (uuid, foreign key): References kpi_metrics
  - `week_number` (integer): Week number (1-52)
  - `year` (integer): Year
  - `value` (numeric): Actual value for the week
  - `goal` (numeric): Goal/target value
  - `meet_goal` (numeric): Values meeting goal
  - `behind_goal` (numeric): Values behind goal
  - `at_risk` (numeric): Values at risk
  - `created_at` (timestamptz): Record creation timestamp
  - `updated_at` (timestamptz): Record update timestamp

  ### 4. `action_plans`
  Stores action plan items for each KPI category
  - `id` (uuid, primary key): Unique identifier
  - `category_id` (uuid, foreign key): References kpi_categories
  - `title` (text): Action plan title
  - `due_date` (date): Due date
  - `status` (text): Status (open, pending, overdue)
  - `created_at` (timestamptz): Record creation timestamp
  - `updated_at` (timestamptz): Record update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read all data
  - Add policies for authenticated users to insert/update/delete their data
*/

-- Create kpi_categories table
CREATE TABLE IF NOT EXISTS kpi_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create kpi_metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES kpi_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  metric_type text NOT NULL DEFAULT 'count',
  created_at timestamptz DEFAULT now()
);

-- Create kpi_weekly_data table
CREATE TABLE IF NOT EXISTS kpi_weekly_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id uuid NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
  year integer NOT NULL CHECK (year >= 2020 AND year <= 2050),
  value numeric NOT NULL DEFAULT 0,
  goal numeric DEFAULT 0,
  meet_goal numeric DEFAULT 0,
  behind_goal numeric DEFAULT 0,
  at_risk numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_id, week_number, year)
);

-- Create action_plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES kpi_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kpi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_weekly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Policies for kpi_categories
CREATE POLICY "Anyone can view categories"
  ON kpi_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON kpi_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON kpi_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON kpi_categories FOR DELETE
  TO authenticated
  USING (true);

-- Policies for kpi_metrics
CREATE POLICY "Anyone can view metrics"
  ON kpi_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON kpi_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update metrics"
  ON kpi_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete metrics"
  ON kpi_metrics FOR DELETE
  TO authenticated
  USING (true);

-- Policies for kpi_weekly_data
CREATE POLICY "Anyone can view weekly data"
  ON kpi_weekly_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert weekly data"
  ON kpi_weekly_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update weekly data"
  ON kpi_weekly_data FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete weekly data"
  ON kpi_weekly_data FOR DELETE
  TO authenticated
  USING (true);

-- Policies for action_plans
CREATE POLICY "Anyone can view action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert action plans"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update action plans"
  ON action_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete action plans"
  ON action_plans FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_category ON kpi_metrics(category_id);
CREATE INDEX IF NOT EXISTS idx_kpi_weekly_data_metric ON kpi_weekly_data(metric_id);
CREATE INDEX IF NOT EXISTS idx_kpi_weekly_data_year_week ON kpi_weekly_data(year, week_number);
CREATE INDEX IF NOT EXISTS idx_action_plans_category ON action_plans(category_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);

-- Insert sample KPI categories
INSERT INTO kpi_categories (name, color, icon, display_order) VALUES
  ('Safety', '#10b981', 'S', 1),
  ('Quality', '#3b82f6', 'Q', 2),
  ('Production', '#0ea5e9', 'P', 3),
  ('Cost', '#f59e0b', 'C', 4),
  ('People', '#8b5cf6', 'P', 5)
ON CONFLICT DO NOTHING;
