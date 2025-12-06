/*
  # Comprehensive Mock Data for TL Dashboard

  ## Overview
  Adds extensive, realistic mock data to demonstrate all dashboard features including:
  - Additional metrics for each KPI category
  - Complete 52-week historical data for current year
  - Varied data patterns (upward trends, downward trends, seasonal patterns)
  - Comprehensive action plans with realistic titles and varied statuses
  - Edge cases and different scenarios

  ## Data Added
  1. Additional Metrics
     - Safety: Near Misses, Safety Training Completion
     - Quality: Customer Complaints, Defect Rate
     - Production: OEE (Overall Equipment Effectiveness), Downtime Hours
     - Cost: Overtime Hours, Scrap Cost
     - People: Employee Turnover, Training Hours

  2. Weekly Data
     - Full 52 weeks for 2024
     - Realistic patterns and trends
     - Varied performance against goals

  3. Action Plans
     - 30+ action items across all categories
     - Mix of open, pending, and overdue statuses
     - Realistic titles and due dates
*/

-- First, clear existing action plans to avoid duplicates
DELETE FROM action_plans;

DO $$
DECLARE
  v_safety_id uuid;
  v_quality_id uuid;
  v_production_id uuid;
  v_cost_id uuid;
  v_people_id uuid;
  v_metric_id uuid;
  v_week int;
  v_value numeric;
BEGIN
  -- Get category IDs
  SELECT id INTO v_safety_id FROM kpi_categories WHERE name = 'Safety';
  SELECT id INTO v_quality_id FROM kpi_categories WHERE name = 'Quality';
  SELECT id INTO v_production_id FROM kpi_categories WHERE name = 'Production';
  SELECT id INTO v_cost_id FROM kpi_categories WHERE name = 'Cost';
  SELECT id INTO v_people_id FROM kpi_categories WHERE name = 'People';

  -- ============================================================
  -- SAFETY CATEGORY - Additional Metrics
  -- ============================================================
  
  -- Near Misses metric
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_safety_id, 'Near Misses Reported', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := CASE 
        WHEN v_week % 4 = 0 THEN floor(random() * 3 + 5)::int
        ELSE floor(random() * 3 + 2)::int
      END;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 3, 
              CASE WHEN v_value >= 3 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 3 THEN 1 ELSE 0 END, 0)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- Safety Training Completion
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_safety_id, 'Safety Training Completion %', 'percentage')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 15 + 85)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 95,
              CASE WHEN v_value >= 95 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 95 AND v_value >= 90 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 90 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- QUALITY CATEGORY - Additional Metrics
  -- ============================================================
  
  -- Customer Complaints
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_quality_id, 'Customer Complaints', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 5 + 1)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 3,
              CASE WHEN v_value <= 3 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 3 AND v_value <= 5 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 5 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- Defect Rate
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_quality_id, 'Defect Rate (PPM)', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 200 + 50)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 100,
              CASE WHEN v_value <= 100 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 100 AND v_value <= 150 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 150 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- PRODUCTION CATEGORY - Additional Metrics
  -- ============================================================
  
  -- Overall Equipment Effectiveness (OEE)
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_production_id, 'OEE %', 'percentage')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 20 + 70)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 85,
              CASE WHEN v_value >= 85 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 85 AND v_value >= 75 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 75 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- Downtime Hours
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_production_id, 'Downtime Hours', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 15 + 5)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 10,
              CASE WHEN v_value <= 10 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 10 AND v_value <= 15 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 15 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- COST CATEGORY - Additional Metrics
  -- ============================================================
  
  -- Overtime Hours
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_cost_id, 'Overtime Hours', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 100 + 50)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 80,
              CASE WHEN v_value <= 80 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 80 AND v_value <= 120 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 120 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- Scrap Cost
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_cost_id, 'Scrap Cost ($)', 'currency')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := floor(random() * 3000 + 1000)::int;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 2000,
              CASE WHEN v_value <= 2000 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 2000 AND v_value <= 3000 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 3000 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- PEOPLE CATEGORY - Additional Metrics
  -- ============================================================
  
  -- Employee Turnover
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_people_id, 'Employee Turnover %', 'percentage')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := (random() * 3 + 1)::numeric(10,2);
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 2.5,
              CASE WHEN v_value <= 2.5 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 2.5 AND v_value <= 3.5 THEN 1 ELSE 0 END,
              CASE WHEN v_value > 3.5 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- Training Hours per Employee
  INSERT INTO kpi_metrics (category_id, title, metric_type) 
  VALUES (v_people_id, 'Training Hours per Employee', 'count')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_metric_id;

  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 1..52 LOOP
      v_value := (random() * 3 + 1)::numeric(10,1);
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 2,
              CASE WHEN v_value >= 2 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 2 AND v_value >= 1.5 THEN 1 ELSE 0 END,
              CASE WHEN v_value < 1.5 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- COMPREHENSIVE ACTION PLANS
  -- ============================================================
  
  -- Safety Action Plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (v_safety_id, 'Implement New PPE Guidelines', '2024-11-25', 'open'),
    (v_safety_id, 'Complete Q4 Safety Audits', '2024-11-30', 'pending'),
    (v_safety_id, 'Update Emergency Response Plan', '2024-11-20', 'overdue'),
    (v_safety_id, 'Monthly Safety Committee Meeting', '2024-12-05', 'open'),
    (v_safety_id, 'Forklift Operator Recertification', '2024-12-15', 'open'),
    (v_safety_id, 'Hazardous Material Handling Training', '2024-11-22', 'overdue'),
    (v_safety_id, 'Fire Drill Execution - Building A', '2024-12-10', 'pending')
  ON CONFLICT DO NOTHING;

  -- Quality Action Plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (v_quality_id, 'ISO 9001 Audit Preparation', '2024-12-01', 'open'),
    (v_quality_id, 'Implement SPC on Line 3', '2024-11-28', 'pending'),
    (v_quality_id, 'Root Cause Analysis - Lot #4521', '2024-11-18', 'overdue'),
    (v_quality_id, 'Customer Quality Review Meeting', '2024-12-08', 'open'),
    (v_quality_id, 'Calibration of Measurement Equipment', '2024-11-30', 'pending'),
    (v_quality_id, 'Update Quality Control Procedures', '2024-12-20', 'open'),
    (v_quality_id, 'First Article Inspection - New Part', '2024-11-25', 'open'),
    (v_quality_id, 'Supplier Quality Assessment - Vendor XYZ', '2024-11-15', 'overdue')
  ON CONFLICT DO NOTHING;

  -- Production Action Plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (v_production_id, 'Install New CNC Machine Line 2', '2024-12-15', 'open'),
    (v_production_id, 'Reduce Changeover Time Initiative', '2024-11-30', 'pending'),
    (v_production_id, 'Resolve Material Shortage Issue', '2024-11-22', 'overdue'),
    (v_production_id, 'Implement Preventive Maintenance Schedule', '2024-12-05', 'open'),
    (v_production_id, 'Kaizen Event - Assembly Process', '2024-12-12', 'pending'),
    (v_production_id, 'Production Schedule Optimization Review', '2024-11-28', 'open'),
    (v_production_id, 'Equipment Breakdown Analysis', '2024-11-19', 'overdue')
  ON CONFLICT DO NOTHING;

  -- Cost Action Plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (v_cost_id, 'Energy Efficiency Project - Phase 2', '2024-12-10', 'open'),
    (v_cost_id, 'Negotiate Supplier Contracts Renewal', '2024-11-30', 'pending'),
    (v_cost_id, 'Implement Waste Reduction Program', '2024-11-25', 'open'),
    (v_cost_id, 'Budget Review for Q1 2025', '2024-12-15', 'open'),
    (v_cost_id, 'Cost Savings Initiative Presentation', '2024-11-20', 'overdue'),
    (v_cost_id, 'Overtime Reduction Strategy Meeting', '2024-12-03', 'pending'),
    (v_cost_id, 'Material Cost Analysis Report', '2024-11-28', 'open')
  ON CONFLICT DO NOTHING;

  -- People Action Plans
  INSERT INTO action_plans (category_id, title, due_date, status) VALUES
    (v_people_id, 'Complete Annual Performance Reviews', '2024-12-20', 'open'),
    (v_people_id, 'Launch Employee Engagement Survey', '2024-11-25', 'pending'),
    (v_people_id, 'Address Absenteeism in Department B', '2024-11-18', 'overdue'),
    (v_people_id, 'New Hire Orientation - December Cohort', '2024-12-02', 'open'),
    (v_people_id, 'Leadership Development Program Kickoff', '2024-12-10', 'pending'),
    (v_people_id, 'Update Employee Handbook', '2024-11-30', 'open'),
    (v_people_id, 'Skills Gap Analysis for Production Team', '2024-12-05', 'open'),
    (v_people_id, 'Retention Strategy Workshop', '2024-11-22', 'overdue')
  ON CONFLICT DO NOTHING;

END $$;
