# Excel Template Guide

## Overview

This guide explains how to format Excel files for importing KPI data into the TL Dashboard.

## Template Structure

### Column Headers (Required)

The Excel file must include these column headers in the first row:

| Column Name | Description | Data Type | Required |
|-------------|-------------|-----------|----------|
| week | Week identifier (e.g., WK1, WK2) | Text | Yes |
| value | Actual metric value | Number | Yes |
| goal | Target/goal value | Number | Optional |
| meetGoal | Values meeting the goal | Number | Optional |
| behindGoal | Values behind the goal | Number | Optional |
| atRisk | Values at risk | Number | Optional |

### Sample Data Format

```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 1     | 3    | 2        | 1          | 0      |
| WK2  | 1     | 3    | 2        | 1          | 0      |
| WK3  | 2     | 3    | 1        | 1          | 1      |
| WK4  | 1     | 3    | 2        | 1          | 0      |
| WK5  | 0     | 3    | 3        | 0          | 0      |
| WK6  | 0     | 3    | 3        | 0          | 0      |
| WK7  | 4     | 3    | 0        | 1          | 3      |
| WK8  | 3     | 3    | 1        | 1          | 1      |
```

## Creating a Template

### Method 1: Download from Dashboard

1. Open the TL Dashboard
2. Click any upload icon on a KPI card
3. Click "Download Template" button
4. Edit the downloaded file with your data
5. Import it back into the dashboard

### Method 2: Create Manually

1. Open Excel or Google Sheets
2. Create headers in row 1: week, value, goal, meetGoal, behindGoal, atRisk
3. Add your data in subsequent rows
4. Save as `.xlsx` or `.xls` format
5. Import into the dashboard

## Data Validation Rules

### Week Column
- **Format**: Text string
- **Pattern**: WKX where X is a number
- **Examples**: WK1, WK2, WK10, WK52
- **Case**: Case-insensitive (wk1, Wk1, WK1 all work)

### Value Column
- **Format**: Number (integer or decimal)
- **Range**: Any positive or negative number
- **Required**: Yes
- **Examples**: 0, 1, 2.5, 100, 1500.75

### Goal Column
- **Format**: Number
- **Optional**: Yes (can be empty)
- **Purpose**: Target value for the metric
- **Examples**: 3, 90, 1000

### MeetGoal Column
- **Format**: Number
- **Optional**: Yes
- **Purpose**: Count of items meeting the goal
- **Examples**: 2, 5, 100

### BehindGoal Column
- **Format**: Number
- **Optional**: Yes
- **Purpose**: Count of items behind the goal
- **Examples**: 1, 3, 50

### AtRisk Column
- **Format**: Number
- **Optional**: Yes
- **Purpose**: Count of items at risk
- **Examples**: 0, 2, 25

## Example Templates by KPI Type

### Safety (Accidents)

```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 1     | 0    | 0        | 1          | 0      |
| WK2  | 0     | 0    | 1        | 0          | 0      |
| WK3  | 2     | 0    | 0        | 1          | 1      |
```

### Quality (Percentage)

```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 85    | 90   | 0        | 1          | 0      |
| WK2  | 92    | 90   | 1        | 0          | 0      |
| WK3  | 88    | 90   | 0        | 1          | 0      |
```

### Production (Units)

```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 2     | 8    | 2        | 1          | 0      |
| WK2  | 3     | 8    | 2        | 1          | 0      |
| WK3  | 5     | 8    | 2        | 1          | 1      |
```

### Cost (Energy/Money)

```
| week | value | goal  | meetGoal | behindGoal | atRisk |
|------|-------|-------|----------|------------|--------|
| WK1  | 890   | 1000  | 100      | 50         | 20     |
| WK2  | 920   | 1000  | 100      | 50         | 20     |
| WK3  | 880   | 1000  | 100      | 50         | 20     |
```

### People (Headcount)

```
| week | value | goal | meetGoal | behindGoal | atRisk |
|------|-------|------|----------|------------|--------|
| WK1  | 2     | 4    | 2        | 1          | 0      |
| WK2  | 3     | 4    | 2        | 1          | 0      |
| WK3  | 4     | 4    | 2        | 1          | 1      |
```

## Import Process

1. **Select File**: Click upload icon on KPI card
2. **Choose File**: Drag and drop or browse for file
3. **Preview**: Review the data before importing
4. **Confirm**: Click "Import Data" to save
5. **Verify**: Check that the chart updates with new data

## Common Issues and Solutions

### Issue: "No data found in Excel file"
**Solution**: Ensure the file has data rows below the header row

### Issue: "Failed to process Excel file"
**Solution**:
- Check file format is .xlsx or .xls
- Verify column headers match exactly
- Ensure no merged cells
- Remove any formulas (use values only)

### Issue: Data not displaying correctly
**Solution**:
- Check that numbers are formatted as numbers, not text
- Verify week column follows WKX format
- Remove any extra columns or sheets

### Issue: Missing optional columns
**Solution**: Optional columns (goal, meetGoal, etc.) can be omitted entirely or left empty

## Best Practices

1. **Consistent Week Format**: Always use WK1, WK2, etc.
2. **Clean Data**: Remove formatting, colors, borders before import
3. **Single Sheet**: Only the first sheet is processed
4. **Numeric Values**: Ensure all number fields contain numbers
5. **Test Import**: Test with a small dataset first
6. **Backup**: Keep a copy of original data before importing
7. **Validation**: Preview data before confirming import

## Export Format

When exporting data from the dashboard:
- File format: .xlsx
- Includes all columns with data
- Week format: WKX
- Numbers: Preserved with decimals
- Empty values: Shown as empty cells

## Multiple Weeks

You can import any number of weeks:
- Minimum: 1 week
- Maximum: 52 weeks (full year)
- Recommended: 8-12 weeks for optimal visualization

## Data Types for Different Metrics

### Count Metrics (Safety, People)
- Use whole numbers: 0, 1, 2, 3, etc.
- No decimals needed

### Percentage Metrics (Quality)
- Use whole numbers: 85, 90, 95
- Or decimals: 85.5, 92.7
- Don't include % symbol

### Large Numbers (Cost, Production)
- Can use large values: 1000, 5000, 10000
- Decimals accepted: 1250.75
- Don't include currency symbols or commas

## Advanced Features

### Calculating Values

You can create Excel formulas in your template before importing:
1. Use formulas to calculate values
2. Before importing, convert formulas to values:
   - Select cells with formulas
   - Copy (Ctrl+C)
   - Paste Special > Values
3. Save and import

### Importing Historical Data

To import multiple years:
1. Create separate files for each year
2. Import each file individually
3. Or combine all data with a year column
4. Dashboard filters by year automatically

## File Size Limits

- Maximum file size: 10MB
- Maximum rows: 1000
- Recommended: Keep under 100 rows per file

## Support

For additional help:
- Check the main README.md
- Review sample data in the dashboard
- Download the template from the dashboard
- Test with small datasets first
