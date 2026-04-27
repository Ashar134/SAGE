# Candidate Matching Limit Implementation

This document outlines the changes made to limit the "Top Candidates by Match" display in the HR Dashboard and the creation of dummy data for testing.

## 1. Objective
The goal was to restrict the number of candidates shown in the "Top Candidates by Match" section to **double the number of available positions** for each job. If a job has 3 vacancies, only the top 6 candidates should be displayed.

## 2. Implementation Steps

### A. Backend: API Data Extension
We updated the applicant serialization in `backend/myapi/views.py` to include the `available_positions` field from the `Job` model.

**File:** `backend/myapi/views.py`
```python
def _serialize_hr_applicant(app):
    # ... existing code ...
    return {
        'id': str(app.id),
        'candidate_code': str(app.id),
        'name': full_name or app.job_title,
        # ...
        'job_id': str(app.job_id) if app.job_id else None,
        'available_positions': app.job.available_positions if app.job else 1, # Added this line
        'company_logo': app.job.company.logo_url if app.job and app.job.company else '/loop.png',
    }
```

### B. Frontend: API Client Mapping
We updated the `toCamelApplicant` helper to map the snake_case `available_positions` from the backend to camelCase `availablePositions` for the React components.

**File:** `hr_dashboard/src/lib/apiClient.js`
```javascript
const toCamelApplicant = (row) => ({
  // ...
  jobId: row.job_id,
  availablePositions: row.available_positions || 1, // Added this mapping
  companyLogo: row.company_logo || "/loop.png",
});
```

### C. Frontend: Display Logic
We modified the `sorted` candidates logic in `Applicants.jsx` to apply the `2 * availablePositions` limit.

**File:** `hr_dashboard/src/pages/Applicants.jsx`
- **When a specific job is filtered:** It takes the `availablePositions` of that job and slices the top `2 * N` candidates.
- **When "All Jobs" is selected:** It groups candidates by their role, applies the limit to each group individually, and then merges them back into a single ranked list.

```javascript
// Example logic snippet
const limit = (group[0].availablePositions || 1) * 2;
finalResults = [...finalResults, ...group.slice(0, limit)];
```

## 3. Dummy Data Seeding
To demonstrate the functionality, a seeding script was executed to create:
- **Job Posting:** "Senior AI Engineer (Dummy Data)"
- **Available Positions:** 3
- **Total Applicants:** 10 (all in 'Under Review' status with scores)

### Expected Result
Even though 10 candidates applied and are eligible for the matching table, the UI now only shows the **Top 6** (3 positions × 2).

## 4. How to Verify
1.  Navigate to the **Applicants** page in the HR Dashboard.
2.  Locate the **"Top Candidates by Match"** table.
3.  Filter by the job **"Senior AI Engineer (Dummy Data)"**.
4.  Observe that only 6 candidates are listed, sorted by their match score.
