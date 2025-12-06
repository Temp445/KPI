# TL Dashboard - Comprehensive KPI Tracking System

A modern, production-ready KPI dashboard application built with Next.js 13, TypeScript, and Supabase. Track and visualize key performance indicators across Safety, Quality, Production, Cost, and People metrics.

## Features

- **5 Core KPI Categories**: Safety, Quality, Production, Cost, and People
- **Interactive Data Visualization**: Bar charts, line charts, and area charts using Recharts
- **Excel Import/Export**: Upload Excel files to import data or export current data
- **Real-time Filtering**: Filter by department, month, year, and time period (Daily/Weekly/Monthly)
- **Action Plan Management**: Track action items with status indicators (Open, Pending, Overdue)
- **Theme Toggle**: Switch between light and dark modes
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Data Persistence**: All data stored securely in Supabase PostgreSQL database
- **Type-Safe**: Full TypeScript implementation with strict mode

## Technology Stack

- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript 5.2.2
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **File Processing**: xlsx library for Excel operations
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (database is pre-configured)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Environment variables are already configured in `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. The database schema and sample data have been automatically set up

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Type checking:**
```bash
npm run typecheck
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles
├── components/
│   ├── Dashboard/
│   │   └── Dashboard.tsx    # Main dashboard component
│   ├── KPICard/
│   │   ├── KPICard.tsx      # Individual KPI card
│   │   └── KPIChart.tsx     # Chart components
│   ├── Filters/
│   │   └── DashboardFilters.tsx  # Filter controls
│   ├── DataImport/
│   │   └── ExcelImport.tsx  # Excel import dialog
│   ├── ActionPlan/
│   │   └── ActionPlanSection.tsx  # Action plan list
│   ├── ThemeProvider.tsx    # Theme context provider
│   ├── ThemeToggle.tsx      # Theme toggle button
│   └── ui/                  # shadcn/ui components
├── stores/
│   └── dashboardStore.ts    # Zustand store
├── types/
│   └── dashboard.ts         # TypeScript interfaces
├── utils/
│   └── excelProcessor.ts    # Excel file processing
└── lib/
    ├── supabase.ts          # Supabase client
    └── utils.ts             # Utility functions
```

## Database Schema

### Tables

1. **kpi_categories**: Main KPI categories (Safety, Quality, Production, Cost, People)
2. **kpi_metrics**: Individual metrics for each category
3. **kpi_weekly_data**: Weekly data points with goals and performance indicators
4. **action_plans**: Action items with due dates and status tracking

### Row Level Security (RLS)

All tables have RLS enabled with policies that allow authenticated users to:
- Read all data
- Insert, update, and delete data

## Features Guide

### Excel Import/Export

**Import Data:**
1. Click the upload icon on any KPI card
2. Download the template or drag-and-drop your Excel file
3. Preview the data before importing
4. Click "Import Data" to update the KPI

**Export Data:**
- Use the `exportToExcel` function from `utils/excelProcessor.ts`
- Data is exported in a format compatible with reimport

**Excel Template Format:**
```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 5     | 3    | 2        | 1          | 0      |
```

### Filtering

- **Department**: Filter by organizational department
- **Month**: Select any month of the year
- **Year**: Choose from 2020-2030
- **Time Period**: Toggle between Daily, Weekly, or Monthly views

### Action Plans

Each KPI card displays:
- Action plan items with titles and due dates
- Status indicators (Open, Pending, Overdue)
- Count badges showing totals for each status

### Theme Toggle

Click the sun/moon icon in the header to switch between light and dark modes.

## Customization

### Adding New KPI Categories

1. Insert into `kpi_categories` table:
```sql
INSERT INTO kpi_categories (name, color, icon, display_order)
VALUES ('New Category', '#hexcolor', 'Icon', 6);
```

2. Add metrics and weekly data as needed

### Modifying Chart Types

In `KPIChart.tsx`, change the `type` prop:
- `bar` - Bar chart
- `line` - Line chart
- `area` - Area chart

### Styling

- Theme colors are configured in `tailwind.config.ts`
- Global styles in `app/globals.css`
- Component-specific styles use Tailwind utility classes

## Sample Data

The database includes pre-seeded sample data:
- 5 KPI categories with unique colors
- Weekly metrics for 8 weeks
- Various action plans with different statuses

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Static page generation for optimal load times
- Code splitting for efficient bundle sizes
- Optimized chart rendering with React memoization
- Lazy loading for dialog components

## Security

- Row Level Security (RLS) enabled on all database tables
- Environment variables for sensitive credentials
- No API keys exposed in client-side code
- Input validation with Zod schemas

## Contributing

This is a production-ready template. Feel free to:
1. Fork the repository
2. Create feature branches
3. Add new KPI categories
4. Enhance visualizations
5. Improve filtering capabilities

## License

MIT License - Free to use for commercial and personal projects

## Support

For issues or questions:
1. Check the documentation above
2. Review the TypeScript types in `types/dashboard.ts`
3. Examine sample data in the database
4. Test with the Excel template

## Acknowledgments

- Next.js team for the excellent framework
- Supabase for the database infrastructure
- shadcn/ui for beautiful components
- Recharts for data visualization
- The open-source community
