# Backend Challenge - Testing Guide & API Documentation

This document provides comprehensive testing instructions for the enhanced backend system and documents all available API endpoints with examples.

## Table of Contents

1. [Testing New Features](#testing-new-features)
2. [API Endpoints Documentation](#api-endpoints-documentation)
3. [Testing Workflows](#testing-workflows)
4. [Troubleshooting](#troubleshooting)

## Testing New Features

### Prerequisites for Testing

Before running tests, ensure you have:

1. **Dependencies installed:**
   ```bash
   npm install
   ```

2. **Database initialized:**
   The SQLite database will be automatically created when you start the server.

3. **Server running:**
   ```bash
   npm start
   ```

### Feature 1: Polygon Area Calculation

The `PolygonAreaJob` calculates the area of polygons from GeoJSON data.

**What it does:**
- Parses GeoJSON from the task
- Calculates area using `@turf/area` library
- Returns area in square meters
- Handles invalid GeoJSON gracefully

**Testing:**
1. Create a workflow with a `polygonArea` task
2. Provide valid GeoJSON in the request
3. Monitor task execution and verify area calculation

### Feature 2: Report Generation

The `ReportGenerationJob` aggregates results from all completed tasks.

**What it does:**
- Waits for all dependent tasks to complete
- Aggregates outputs from all tasks
- Generates a comprehensive report
- Updates workflow's `finalResult` field

**Testing:**
1. Ensure all dependent tasks complete successfully
2. Verify report contains all task outputs
3. Check workflow's `finalResult` field is populated

### Feature 3: Task Dependencies

The system now supports workflows with interdependent tasks.

**What it does:**
- Tasks can specify dependencies on other tasks
- Dependent tasks wait for prerequisites to complete
- Results are passed between dependent tasks

**Testing:**
1. Create workflows with task dependencies
2. Verify execution order respects dependencies
3. Test error handling when dependencies fail

### Feature 4: Workflow Final Results

Workflows now save aggregated results in a `finalResult` field.

**What it does:**
- Collects outputs from all completed tasks
- Aggregates results into a final summary
- Stores results in the workflow entity

**Testing:**
1. Complete a full workflow
2. Verify `finalResult` contains aggregated data
3. Test with failed tasks to ensure proper error handling

## API Endpoints Documentation

### Base URL
```
http://localhost:3000
```

### 1. Create Analysis Workflow

**Endpoint:** `POST /analysis`

**Description:** Creates a new workflow from YAML configuration and queues tasks for execution.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientId": "client123",
  "geoJson": {
    "type": "Polygon",
    "coordinates": [
      [
        [-63.624885020050996, -10.311050368263523],
        [-63.624885020050996, -10.367865108370523],
        [-63.61278302732815, -10.367865108370523],
        [-63.61278302732815, -10.311050368263523],
        [-63.624885020050996, -10.311050368263523]
      ]
    ]
  }
}
```

**Response (202 Accepted):**
```json
{
  "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
  "message": "Workflow created and tasks queued from YAML definition."
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to create workflow"
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client123",
    "geoJson": {
      "type": "Polygon",
      "coordinates": [
        [
          [-63.624885020050996, -10.311050368263523],
          [-63.624885020050996, -10.367865108370523],
          [-63.61278302732815, -10.367865108370523],
          [-63.61278302732815, -10.311050368263523],
          [-63.624885020050996, -10.311050368263523]
        ]
      ]
    }
  }'
```

### 2. Get Workflow Status

**Endpoint:** `GET /workflow/:id/status`

**Description:** Retrieves the current status of a workflow, including completion progress.

**URL Parameters:**
- `id`: Workflow ID (UUID)

**Response (200 OK):**
```json
{
  "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
  "status": "in_progress",
  "completedTasks": 2,
  "totalTasks": 4
}
```

**Response (404 Not Found):**
```json
{
  "message": "Workflow with id: 3433c76d-f226-4c91-afb5-7dfc7accab24 not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to get workflow status"
}
```

**Testing with cURL:**
```bash
curl http://localhost:3000/workflow/3433c76d-f226-4c91-afb5-7dfc7accab24/status
```

### 3. Get Workflow Results

**Endpoint:** `GET /workflow/:id/results`

**Description:** Retrieves the final results of a completed workflow.

**URL Parameters:**
- `id`: Workflow ID (UUID)

**Response (200 OK):**
```json
{
  "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
  "status": "completed",
  "finalResult": "Area: 1234.56 square meters\nAnalysis: Data processed successfully\nNotification: Email sent"
}
```

**Response (400 Bad Request - Workflow not completed):**
```json
{
  "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
  "status": "in_progress"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Workflow with id: 3433c76d-f226-4c91-afb5-7dfc7accab24 not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "message": "Failed to get workflow results"
}
```

**Testing with cURL:**
```bash
curl http://localhost:3000/workflow/3433c76d-f226-4c91-afb5-7dfc7accab24/results
```

### 4. Default Route

**Endpoint:** `GET /`

**Description:** Health check endpoint to verify server is running.

**Response (200 OK):**
```json
{
  "message": "Backend Challenge Server is running!"
}
```

**Testing with cURL:**
```bash
curl http://localhost:3000/
```

## Testing Workflows

### Complete Workflow Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Create a workflow:**
   ```bash
   curl -X POST http://localhost:3000/analysis \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": "test-client",
       "geoJson": {
         "type": "Polygon",
         "coordinates": [
           [
             [-63.624885020050996, -10.311050368263523],
             [-63.624885020050996, -10.367865108370523],
             [-63.61278302732815, -10.367865108370523],
             [-63.61278302732815, -10.311050368263523],
             [-63.624885020050996, -10.311050368263523]
           ]
         ]
       }
     }'
   ```

3. **Monitor workflow status:**
   ```bash
   # Replace WORKFLOW_ID with the actual ID from step 2
   curl http://localhost:3000/workflow/WORKFLOW_ID/status
   ```

4. **Check final results:**
   ```bash
   curl http://localhost:3000/workflow/WORKFLOW_ID/results
   ```

### Testing Task Dependencies

The example workflow includes dependencies:

```yaml
name: "example_workflow"
steps:
  - taskType: "analysis"
    stepNumber: 1
  - taskType: "polygonArea"
    stepNumber: 2
  - taskType: "notification"
    stepNumber: 3
  - taskType: "report"
    stepNumber: 4
    dependsOn:
      - analysis
      - polygonArea
      - notification
```

**Dependency behavior:**
- `analysis` task runs first
- `polygonArea` task runs second
- `notification` task runs third
- `report` task waits for all three dependencies to complete

### Testing Error Scenarios

1. **Invalid GeoJSON:**
   - Send malformed GeoJSON data
   - Verify task fails gracefully
   - Check error message in response

2. **Missing dependencies:**
   - Create workflow with invalid dependency references
   - Verify proper error handling

3. **Database connection issues:**
   - Stop database connection
   - Verify graceful degradation

## Troubleshooting

### Common Issues

1. **Server won't start:**
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Check database configuration

2. **Tasks not executing:**
   - Verify background worker is running
   - Check database connection
   - Review task status in database

3. **Workflow stuck in progress:**
   - Check individual task statuses
   - Verify all dependencies are met
   - Check for failed tasks

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=* npm start
```

### Database Inspection

The SQLite database file is created automatically. You can inspect it using:

```bash
sqlite3 database.sqlite
.tables
SELECT * FROM workflow;
SELECT * FROM task;
SELECT * FROM result;
```

### Log Analysis

Monitor server logs for:
- Task execution progress
- Error messages
- Workflow state transitions
- Background worker activity

## Performance Testing

### Load Testing

Test system performance with multiple concurrent workflows:

```bash
# Create multiple workflows simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3000/analysis \
    -H "Content-Type: application/json" \
    -d "{\"clientId\": \"client$i\", \"geoJson\": {...}}" &
done
wait
```

### Monitoring

Track:
- Workflow creation time
- Task execution duration
- Database query performance
- Memory usage
- CPU utilization

