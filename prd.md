# LANDOS V1 — Product Requirements Document (PRD)

# Low Density Land Development Feasibility System

---

# 1. Project Overview

## Project Name

LANDOS V1
(Low Density Land Development Operating System)

## Product Type

Web-based land subdivision feasibility analysis platform.

## Technology Stack

* Frontend: Next.js 15
* Language: TypeScript
* Styling: Tailwind CSS
* Database: SQLite (Prisma ORM)
* Charts: Recharts
* File Storage: Local uploads for MVP
* PDF Export: html2pdf / react-pdf
* AI Integration (future): OpenAI / Gemini API

---

# 2. Project Vision

LANDOS is a practical land-development feasibility platform designed for Thai landowners, investors, and small developers.

The system helps users evaluate whether a land parcel should:

* be sold immediately (“ขายยก”)
  or
* be subdivided and developed (“แบ่งขายเอง”)

The platform focuses on:

* real-world assumptions
* realistic infrastructure cost
* low-density land development
* financial feasibility analysis
* executive-level summaries
* visual subdivision concepts

The platform is NOT designed to replace licensed engineers, architects, or legal consultants. It is intended for preliminary feasibility analysis and decision support.

---

# 3. Core Objectives

The system must:

* simplify land feasibility analysis
* reduce dependency on manual spreadsheets
* help landowners understand development potential
* estimate approximate profit and ROI
* compare multiple development strategies
* generate presentation-ready summaries

---

# 4. Target Users

## Primary Users

* Landowners
* Small developers
* Real estate investors
* Property consultants

## Secondary Users

* Real estate agents
* Land subdivision consultants
* Civil engineers
* Financial analysts

---

# 5. Core Product Philosophy

LANDOS must:

* feel professional and modern
* focus on realistic calculations
* avoid fantasy projections
* use editable assumptions
* provide transparency in calculations
* explain where numbers come from

The platform should visually communicate:

* REAL DATA
* REAL COST
* REAL PROFIT
* REALISTIC DEVELOPMENT

---

# 6. Main Application Structure

The application should use a dashboard layout with a left sidebar and top navigation.

Main modules:

1. Dashboard
2. Project Management
3. Summary
4. Feasibility
5. Subdivision
6. ขายยก vs แบ่งขาย
7. Report Export
8. Settings

---

# 7. Authentication System

## Features

* Simple login system
* Email/password authentication
* Session persistence
* User project ownership

## User Roles

### Admin

* manage all projects
* edit system assumptions
* manage cost presets

### Standard User

* create and manage own projects
* export reports
* edit project assumptions

---

# 8. Dashboard Module

## Purpose

Provide overview of all land projects.

## Features

* Project cards
* Recent projects
* Quick feasibility snapshot
* Estimated total profit
* Development status
* Last edited date

## Dashboard Cards

* Total projects
* Estimated portfolio value
* Potential gross profit
* Average ROI
* High-potential projects

---

# 9. Project Creation Module

## Create Project Form

### Required Inputs

* Project name
* Province
* District
* Land size
* Purchase price
* Estimated selling price
* Zoning type

### Optional Inputs

* Road frontage
* Road width
* Slope condition
* Utility availability
* Existing structures
* Legal observations

---

# 10. Land Information Module

## Inputs

### Land Size

Support:

* Rai
* Ngan
* Square wah

The system must automatically convert to:

* square meters
* square wah

---

## Land Financial Inputs

### Fields

* Land purchase price
* Appraisal price
* Broker fee
* Transfer fee
* Estimated holding cost

---

## Land Characteristics

### Inputs

* Shape of land
* Frontage condition
* Access road
* Terrain
* Flood risk
* Utility access

---

# 11. Image Upload Module

## Purpose

Allow users to upload real land images.

## Upload Categories

1. Hero image
2. Access road image
3. Zoning image
4. Land map screenshot
5. Preliminary subdivision sketch

## Features

* drag-and-drop upload
* image preview
* delete image
* reorder images

---

# 12. Feasibility Analysis Module

## Purpose

Perform preliminary land development calculations.

---

## 12.1 Area Analysis

### Calculations

* total land area
* road deduction
* infrastructure deduction
* usable land area
* saleable area

### Assumptions

* road deduction = 10–20%
* utility area deduction
* equal plot distribution

---

## 12.2 Lot Estimation

### Inputs

* target lot size
* road width
* subdivision type

### Outputs

* estimated lot count
* estimated lot dimensions
* average lot size

---

## 12.3 Cost Analysis

### Cost Categories

* land acquisition
* road construction
* electricity
* water system
* drainage
* fencing
* entrance gate
* legal expenses
* miscellaneous

---

## Infrastructure Cost Presets

### Basic

Approx. THB 300/sq.wah

### Standard

Approx. THB 800/sq.wah

### Premium

Approx. THB 1,500/sq.wah

---

## Editable Cost Assumptions

### Road

THB 600/sq.m.

### Electricity Pole

THB 1,500/meter

### Fence

THB 2,000/meter

### Drainage

Editable

### Water System

Editable

---

# 13. Financial Analysis Module

## Purpose

Estimate project profitability.

---

## Outputs

* total development cost
* gross revenue
* gross margin
* net profit
* ROI
* cost per sq.wah
* revenue per plot

---

## Financial Formula Logic

### ROI

ROI=\frac{Net\ Profit}{Investment\ Cost}\times100

### Gross Profit

Gross\ Profit=Revenue-Development\ Cost

---

## Sensitivity Analysis

The system must support:

* ±20% selling price variation
* ±20% land acquisition variation
* development cost variation

---

## Charts

Use Recharts to visualize:

* cost breakdown
* profit structure
* ROI comparison
* scenario comparison

---

# 14. Subdivision Module

## Purpose

Visualize preliminary lot subdivision.

---

## Features

* equal plot generation
* lot numbering
* road visualization
* future phase allocation
* simple subdivision sketch

---

## Visualization Rules

* lots displayed as blocks
* roads displayed in gray
* future phases highlighted
* approximate dimensions shown

---

## Future AI Features

* AI subdivision generation
* optimal road placement
* AI lot optimization

---

# 15. “ขายยก vs แบ่งขาย” Comparison Module

## Purpose

Compare:

* Quick Sell
  vs
* Develop & Sell

---

## Option A — Quick Sell

### Outputs

* immediate selling value
* estimated transfer cost
* estimated net proceeds

---

## Option B — Develop & Sell

### Outputs

* development cost
* estimated revenue
* estimated profit
* ROI
* project duration

---

## Comparison Visualization

Use:

* side-by-side cards
* profit difference highlight
* capital requirement comparison
* risk indicator

---

# 16. Executive Summary Module

## Purpose

Generate management-style report.

---

## Report Sections

1. Project overview
2. Land analysis
3. Cost analysis
4. Financial feasibility
5. Subdivision concept
6. Quick Sell vs Develop comparison
7. Risk observations
8. Recommendation

---

## Export Formats

* PDF
* PNG summary
* PowerPoint-ready screenshot

---

# 17. Calculation Transparency System

Every major calculation must include:

* formula source
* assumption source
* editable assumptions
* explanation tooltip

Users should understand:

* where numbers come from
* how assumptions affect outputs

---

# 18. UI/UX Requirements

## Design Style

* modern dashboard
* professional developer/investor feel
* green + gold color palette
* clean card layout

---

## Responsive Design

Support:

* desktop
* tablet

Mobile support is secondary for MVP.

---

# 19. Sidebar Navigation

## Menu

* Dashboard
* Projects
* Summary
* Feasibility
* Subdivision
* ขายยก vs แบ่งขาย
* Reports
* Settings

---

# 20. Suggested Page Flow

## Step 1

Create project

## Step 2

Input land information

## Step 3

Upload images

## Step 4

Set assumptions

## Step 5

Run feasibility analysis

## Step 6

Generate subdivision

## Step 7

Compare development options

## Step 8

Export report

---

# 21. Database Design

## Tables

### users

* id
* email
* password
* role

### projects

* id
* user_id
* project_name
* location
* land_size
* zoning
* created_at

### land_inputs

* project_id
* acquisition_price
* frontage
* road_width
* utility_condition

### feasibility_results

* project_id
* usable_area
* lot_count
* estimated_profit
* roi

### images

* project_id
* image_type
* image_url

---

# 22. Non-Functional Requirements

## Performance

* calculation under 3 seconds

## Scalability

* modular architecture

## Maintainability

* reusable components

## Reliability

* prevent invalid calculations

## Security

* authenticated access
* protected routes

---

# 23. Technical Architecture

## Frontend

Next.js App Router

## Backend

Next.js API routes

## ORM

Prisma

## Database

SQLite

## Styling

Tailwind CSS

## Charts

Recharts

## State Management

Zustand or Context API

---

# 24. Recommended Folder Structure

```plaintext
/app
/components
/modules
/lib
/prisma
/public
/uploads
/types
/utils
```

---

# 25. Future Version Roadmap

## LANDOS V2

* GIS integration
* AI zoning interpretation
* AI subdivision planning
* market comparables
* location scoring
* map visualization

---

## LANDOS V3

* satellite analysis
* AI land pricing
* developer collaboration
* contractor estimation
* financial forecasting AI

---

# 26. Constraints

The system:

* is preliminary only
* does not replace legal review
* does not replace engineering approval
* depends heavily on assumptions
* should clearly display estimation disclaimer

---

# 27. Success Metrics

## Business Metrics

* feasibility generated within 5 minutes
* simplified workflow
* reduced spreadsheet dependency

## Technical Metrics

* smooth UI performance
* successful PDF export
* reliable calculations

---

# 28. MVP Scope

## Included

* project management
* feasibility analysis
* subdivision visualization
* financial comparison
* report export

## Excluded

* CAD generation
* blockchain
* real GIS
* legal filing
* automated surveying

---

# 29. LANDOS Core Message

LANDOS is not a fantasy investment calculator.

It is a practical low-density land development decision-support system that helps landowners evaluate realistic development opportunities using transparent assumptions, simplified feasibility analysis, and visual financial comparison tools.
