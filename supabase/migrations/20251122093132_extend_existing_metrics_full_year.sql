/*
  # Extend Existing Metrics with Full Year Data

  ## Overview
  Extends the original 5 metrics with complete 52-week data for 2024,
  showing realistic trends and patterns throughout the year.

  ## Patterns Implemented
  - Safety (Accidents): Seasonal pattern with improvement trend
  - Quality (Right First Time): Gradual improvement with plateaus
  - Production (Attainment): Cyclical pattern with end-of-quarter peaks
  - Cost (Energy): Seasonal variation (higher in summer/winter)
  - People (Absenteeism): Seasonal spikes (flu season, summer)
*/

DO $$
DECLARE
  v_metric_id uuid;
  v_week int;
  v_value numeric;
  v_goal numeric;
BEGIN
  
  -- ============================================================
  -- SAFETY: No of Accidents (existing metric)
  -- ============================================================
  SELECT id INTO v_metric_id FROM kpi_metrics WHERE title = 'No of Accidents' LIMIT 1;
  
  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 9..52 LOOP
      v_value := CASE 
        -- Winter months (weeks 1-12, 48-52): Higher accident risk
        WHEN v_week <= 12 OR v_week >= 48 THEN floor(random() * 2 + 1)::int
        -- Spring improvement (weeks 13-25)
        WHEN v_week BETWEEN 13 AND 25 THEN floor(random() * 2)::int
        -- Summer stability (weeks 26-38)
        WHEN v_week BETWEEN 26 AND 38 THEN floor(random() * 2)::int
        -- Fall preparation (weeks 39-47)
        ELSE floor(random() * 2 + 1)::int
      END;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 1,
              CASE WHEN v_value <= 1 THEN 3 ELSE 0 END,
              CASE WHEN v_value = 2 THEN 2 ELSE 0 END,
              CASE WHEN v_value >= 3 THEN 3 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- QUALITY: Right First Time @ Quality (existing metric)
  -- ============================================================
  SELECT id INTO v_metric_id FROM kpi_metrics WHERE title = 'Right First Time @ Quality' LIMIT 1;
  
  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 9..52 LOOP
      -- Gradual improvement trend from 85% to 93%
      v_value := floor(85 + (v_week / 52.0) * 8 + random() * 4)::int;
      v_value := LEAST(v_value, 98); -- Cap at 98%
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 90,
              CASE WHEN v_value >= 90 THEN 3 ELSE 0 END,
              CASE WHEN v_value >= 85 AND v_value < 90 THEN 2 ELSE 0 END,
              CASE WHEN v_value < 85 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- PRODUCTION: Production Attainment (existing metric)
  -- ============================================================
  SELECT id INTO v_metric_id FROM kpi_metrics WHERE title = 'Production Attainment' LIMIT 1;
  
  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 9..52 LOOP
      -- Cyclical pattern with end-of-quarter peaks
      v_value := CASE 
        WHEN v_week % 13 IN (12, 13, 0) THEN floor(random() * 2 + 7)::int -- Quarter end push
        WHEN v_week % 13 IN (1, 2) THEN floor(random() * 2 + 4)::int -- Post-quarter slowdown
        ELSE floor(random() * 3 + 5)::int -- Normal operation
      END;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 8,
              CASE WHEN v_value >= 8 THEN 3 ELSE 0 END,
              CASE WHEN v_value >= 6 AND v_value < 8 THEN 2 ELSE 0 END,
              CASE WHEN v_value < 6 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- COST: Energy Consumed (existing metric)
  -- ============================================================
  SELECT id INTO v_metric_id FROM kpi_metrics WHERE title = 'Energy Consumed' LIMIT 1;
  
  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 8..52 LOOP
      -- Seasonal variation: Higher in winter (1-12, 48-52) and summer (26-35)
      v_value := CASE 
        WHEN v_week <= 12 OR v_week >= 48 THEN floor(random() * 150 + 950)::int
        WHEN v_week BETWEEN 26 AND 35 THEN floor(random() * 120 + 920)::int
        ELSE floor(random() * 100 + 800)::int
      END;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 900,
              CASE WHEN v_value <= 900 THEN floor(random() * 20 + 80)::int ELSE 0 END,
              CASE WHEN v_value > 900 AND v_value <= 1000 THEN floor(random() * 15 + 40)::int ELSE 0 END,
              CASE WHEN v_value > 1000 THEN floor(random() * 10 + 15)::int ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

  -- ============================================================
  -- PEOPLE: Absenteeism (existing metric)
  -- ============================================================
  SELECT id INTO v_metric_id FROM kpi_metrics WHERE title = 'Absenteeism' LIMIT 1;
  
  IF v_metric_id IS NOT NULL THEN
    FOR v_week IN 9..52 LOOP
      -- Seasonal spikes: Flu season (weeks 1-10, 48-52), Summer (weeks 26-35)
      v_value := CASE 
        WHEN v_week <= 10 OR v_week >= 48 THEN floor(random() * 3 + 3)::int
        WHEN v_week BETWEEN 26 AND 35 THEN floor(random() * 2 + 3)::int
        ELSE floor(random() * 2 + 2)::int
      END;
      
      INSERT INTO kpi_weekly_data (metric_id, week_number, year, value, goal, meet_goal, behind_goal, at_risk) 
      VALUES (v_metric_id, v_week, 2024, v_value, 3,
              CASE WHEN v_value <= 3 THEN 2 ELSE 0 END,
              CASE WHEN v_value = 4 THEN 2 ELSE 0 END,
              CASE WHEN v_value >= 5 THEN 1 ELSE 0 END)
      ON CONFLICT (metric_id, week_number, year) DO NOTHING;
    END LOOP;
  END IF;

END $$;
