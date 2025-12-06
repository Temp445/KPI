/*
  # Historical Data for Years 2022-2023

  ## Overview
  Adds historical data for previous years (2022-2023) to demonstrate
  year-over-year comparisons and historical trend analysis.

  ## Data Added
  - Complete 52-week data for 2023
  - Complete 52-week data for 2022
  - Shows improvement trends year-over-year
*/

DO $$
DECLARE
  v_metric_id uuid;
  v_week int;
  v_value numeric;
  v_year int;
  v_metric_record record;
BEGIN
  
  -- Loop through all metrics
  FOR v_metric_record IN 
    SELECT id, title, metric_type FROM kpi_metrics
  LOOP
    v_metric_id := v_metric_record.id;
    
    -- Add data for 2023 and 2022
    FOR v_year IN 2022..2023 LOOP
      FOR v_week IN 1..52 LOOP
        
        -- Generate values based on metric type with year-over-year improvement
        v_value := CASE v_metric_record.title
          -- Safety metrics (lower is better)
          WHEN 'No of Accidents' THEN 
            floor(random() * 3 + CASE v_year WHEN 2022 THEN 2 WHEN 2023 THEN 1 ELSE 1 END)::int
          WHEN 'Near Misses Reported' THEN 
            floor(random() * 4 + CASE v_year WHEN 2022 THEN 4 WHEN 2023 THEN 3 ELSE 2 END)::int
          
          -- Quality metrics (higher percentage is better)
          WHEN 'Right First Time @ Quality' THEN 
            floor(random() * 10 + CASE v_year WHEN 2022 THEN 78 WHEN 2023 THEN 83 ELSE 87 END)::int
          WHEN 'Safety Training Completion %' THEN 
            floor(random() * 12 + CASE v_year WHEN 2022 THEN 80 WHEN 2023 THEN 85 ELSE 88 END)::int
          WHEN 'Customer Complaints' THEN 
            floor(random() * 3 + CASE v_year WHEN 2022 THEN 4 WHEN 2023 THEN 3 ELSE 2 END)::int
          WHEN 'Defect Rate (PPM)' THEN 
            floor(random() * 150 + CASE v_year WHEN 2022 THEN 150 WHEN 2023 THEN 120 ELSE 80 END)::int
          
          -- Production metrics
          WHEN 'Production Attainment' THEN 
            floor(random() * 3 + CASE v_year WHEN 2022 THEN 5 WHEN 2023 THEN 6 ELSE 6 END)::int
          WHEN 'OEE %' THEN 
            floor(random() * 15 + CASE v_year WHEN 2022 THEN 68 WHEN 2023 THEN 73 ELSE 75 END)::int
          WHEN 'Downtime Hours' THEN 
            floor(random() * 12 + CASE v_year WHEN 2022 THEN 15 WHEN 2023 THEN 12 ELSE 10 END)::int
          
          -- Cost metrics (lower is better)
          WHEN 'Energy Consumed' THEN 
            floor(random() * 200 + CASE v_year WHEN 2022 THEN 1000 WHEN 2023 THEN 950 ELSE 900 END)::int
          WHEN 'Overtime Hours' THEN 
            floor(random() * 80 + CASE v_year WHEN 2022 THEN 120 WHEN 2023 THEN 100 ELSE 80 END)::int
          WHEN 'Scrap Cost ($)' THEN 
            floor(random() * 2000 + CASE v_year WHEN 2022 THEN 3000 WHEN 2023 THEN 2500 ELSE 2000 END)::int
          
          -- People metrics
          WHEN 'Absenteeism' THEN 
            floor(random() * 2 + CASE v_year WHEN 2022 THEN 4 WHEN 2023 THEN 3 ELSE 2 END)::int
          WHEN 'Employee Turnover %' THEN 
            (random() * 2 + CASE v_year WHEN 2022 THEN 3.5 WHEN 2023 THEN 3 ELSE 2.5 END)::numeric(10,2)
          WHEN 'Training Hours per Employee' THEN 
            (random() * 2 + CASE v_year WHEN 2022 THEN 1.2 WHEN 2023 THEN 1.6 ELSE 2 END)::numeric(10,1)
          
          ELSE floor(random() * 10 + 50)::int
        END;
        
        -- Insert the data
        INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
        VALUES (
          v_metric_id, 
          v_week, 
          v_year, 
          v_value,
          -- Goals based on metric type
          CASE v_metric_record.title
            WHEN 'No of Accidents' THEN 1
            WHEN 'Near Misses Reported' THEN 3
            WHEN 'Right First Time @ Quality' THEN 90
            WHEN 'Safety Training Completion %' THEN 95
            WHEN 'Customer Complaints' THEN 3
            WHEN 'Defect Rate (PPM)' THEN 100
            WHEN 'Production Attainment' THEN 8
            WHEN 'OEE %' THEN 85
            WHEN 'Downtime Hours' THEN 10
            WHEN 'Energy Consumed' THEN 900
            WHEN 'Overtime Hours' THEN 80
            WHEN 'Scrap Cost ($)' THEN 2000
            WHEN 'Absenteeism' THEN 3
            WHEN 'Employee Turnover %' THEN 2.5
            WHEN 'Training Hours per Employee' THEN 2
            ELSE 100
          END,
          floor(random() * 2 + 1)::int, -- meet_goal
          floor(random() * 2 + 1)::int, -- behind_goal
          floor(random() * 2)::int -- at_risk
        )
        ON CONFLICT (metric_id, week_number, year) DO NOTHING;
        
      END LOOP; -- weeks
    END LOOP; -- years
  END LOOP; -- metrics

END $$;
