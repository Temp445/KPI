/*
  # Seed Sample Dashboard Data

  ## Overview
  Populates the database with sample KPI data for demonstration purposes.
  Creates metrics and weekly data for all five categories (Safety, Quality, Production, Cost, People).

  ## Data Inserted
  - KPI Metrics for each category
  - 8 weeks of sample data for each metric
  - Sample action plans with various statuses
*/

-- Insert metrics for each category
DO $$
DECLARE
  safety_id uuid;
  quality_id uuid;
  production_id uuid;
  cost_id uuid;
  people_id uuid;
  new_metric_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO safety_id FROM kpi_categories WHERE name = 'Safety';
  SELECT id INTO quality_id FROM kpi_categories WHERE name = 'Quality';
  SELECT id INTO production_id FROM kpi_categories WHERE name = 'Production';
  SELECT id INTO cost_id FROM kpi_categories WHERE name = 'Cost';
  SELECT id INTO people_id FROM kpi_categories WHERE name = 'People';

  -- Insert Safety metrics
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (safety_id, 'No of Accidents', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_metric_id;

  -- Insert weekly data for Safety
  IF new_metric_id IS NOT NULL THEN
    INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) VALUES
      (new_metric_id, 1, 2024, 1, 3, 2, 1, 0),
      (new_metric_id, 2, 2024, 1, 3, 2, 1, 0),
      (new_metric_id, 3, 2024, 2, 3, 1, 1, 1),
      (new_metric_id, 4, 2024, 1, 3, 2, 1, 0),
      (new_metric_id, 5, 2024, 0, 3, 3, 0, 0),
      (new_metric_id, 6, 2024, 0, 3, 3, 0, 0),
      (new_metric_id, 7, 2024, 4, 3, 0, 1, 3),
      (new_metric_id, 8, 2024, 3, 3, 1, 1, 1)
    ON CONFLICT (metric_id, week_number, year) DO NOTHING;
  END IF;

  -- Insert Quality metrics
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (quality_id, 'Right First Time @ Quality', 'percentage')
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_metric_id;

  IF new_metric_id IS NOT NULL THEN
    INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) VALUES
      (new_metric_id, 1, 2024, 85, 90, 2, 1, 0),
      (new_metric_id, 2, 2024, 88, 90, 2, 1, 0),
      (new_metric_id, 3, 2024, 92, 90, 3, 0, 0),
      (new_metric_id, 4, 2024, 87, 90, 2, 1, 0),
      (new_metric_id, 5, 2024, 91, 90, 3, 0, 0),
      (new_metric_id, 6, 2024, 89, 90, 2, 1, 0),
      (new_metric_id, 7, 2024, 93, 90, 3, 0, 0),
      (new_metric_id, 8, 2024, 90, 90, 3, 0, 0)
    ON CONFLICT (metric_id, week_number, year) DO NOTHING;
  END IF;

  -- Insert Production metrics
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (production_id, 'Production Attainment', 'percentage')
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_metric_id;

  IF new_metric_id IS NOT NULL THEN
    INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) VALUES
      (new_metric_id, 1, 2024, 2, 8, 2, 1, 0),
      (new_metric_id, 2, 2024, 3, 8, 2, 1, 0),
      (new_metric_id, 3, 2024, 2, 8, 2, 1, 0),
      (new_metric_id, 4, 2024, 4, 8, 2, 1, 1),
      (new_metric_id, 5, 2024, 3, 8, 2, 1, 0),
      (new_metric_id, 6, 2024, 2, 8, 2, 1, 0),
      (new_metric_id, 7, 2024, 5, 8, 2, 1, 1),
      (new_metric_id, 8, 2024, 3, 8, 2, 1, 0)
    ON CONFLICT (metric_id, week_number, year) DO NOTHING;
  END IF;

  -- Insert Cost metrics
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (cost_id, 'Energy Consumed', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_metric_id;

  IF new_metric_id IS NOT NULL THEN
    INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) VALUES
      (new_metric_id, 1, 2024, 890, 1000, 100, 50, 20),
      (new_metric_id, 2, 2024, 920, 1000, 100, 50, 20),
      (new_metric_id, 3, 2024, 880, 1000, 100, 50, 20),
      (new_metric_id, 4, 2024, 950, 1000, 100, 50, 20),
      (new_metric_id, 5, 2024, 870, 1000, 100, 50, 20),
      (new_metric_id, 6, 2024, 930, 1000, 100, 50, 20),
      (new_metric_id, 7, 2024, 1020, 1000, 100, 50, 20)
    ON CONFLICT (metric_id, week_number, year) DO NOTHING;
  END IF;

  -- Insert People metrics
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (people_id, 'Absenteeism', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_metric_id;

  IF new_metric_id IS NOT NULL THEN
    INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) VALUES
      (new_metric_id, 1, 2024, 2, 4, 2, 1, 0),
      (new_metric_id, 2, 2024, 2, 4, 2, 1, 0),
      (new_metric_id, 3, 2024, 3, 4, 2, 1, 0),
      (new_metric_id, 4, 2024, 4, 4, 2, 1, 1),
      (new_metric_id, 5, 2024, 3, 4, 2, 1, 0),
      (new_metric_id, 6, 2024, 2, 4, 2, 1, 0),
      (new_metric_id, 7, 2024, 5, 4, 1, 1, 2),
      (new_metric_id, 8, 2024, 3, 4, 2, 1, 0)
    ON CONFLICT (metric_id, week_number, year) DO NOTHING;
  END IF;

  -- Insert action plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (safety_id, 'Safety Data Analysis', '2024-11-28', 'open'),
    (safety_id, 'Safety Assessment', '2024-11-30', 'pending'),
    (quality_id, 'Quality Control Teams', '2024-11-26', 'open'),
    (production_id, 'Downtime Reduction', '2024-11-28', 'overdue'),
    (cost_id, 'Cost Analysis', '2024-11-28', 'open'),
    (cost_id, 'Energy Audit', '2024-12-01', 'pending'),
    (people_id, 'Customer Feedback Analysis', '2024-11-28', 'overdue')
  ON CONFLICT DO NOTHING;

END $$;
