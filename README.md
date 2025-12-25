# Job Management Module – Frontend

**Candidate:** John Mark Bolongan  
**Role:** Full Stack Web Engineer  
**Context:** Transport Management System (TMS)

---

## Overview

This repository contains the **frontend implementation** of the Job Management module for a freight forwarding Transport Management System.

The frontend provides a **simple, functional admin-style UI** for managing jobs, transports, costs, revenues, and profit summaries. Visual polish and branding are intentionally minimal to prioritize clarity, correctness, and safe operational behavior.

Detailed frontend architecture, data flow diagrams, and design decisions are documented separately.

📄 **Full frontend documentation:**  
https://app.eraser.io/workspace/34W9JTGfJfQO3H5ZsmN9#GaPoAMmBx9jhXQFom8ZRd

---

## Scope

### Included
- Job list view (table)
- Job detail view
- Job creation and editing
- Transport leg management
- Cost and revenue entry
- Profit summary display
- UI feedback and validation

### Out of Scope
- Authentication and authorization
- Payment execution (Stripe, PayPal, checkout flows)
- Visual design polish and branding

---

## Architecture

The frontend follows a **domain-oriented, service-driven architecture** designed for clarity, scalability, and maintainability.

- **Pages** – route-level UI containers  
- **Components** – reusable, presentation-focused UI elements  
- **Stores (Pinia)** – centralized state and orchestration  
- **Services** – stateless API communication (HTTP only)  
- **Transformers** – backend response normalization  
- **Types** – TypeScript domain contracts  


- Pages never call APIs directly  
- Stores coordinate shared state  
- Services abstract backend communication  
- Transformers protect the UI from backend changes  

---

## Data Integrity & Safety

The frontend is designed as a **consumer of backend guarantees**.

- Completed jobs are rendered read-only  
- Financial fields are disabled once locked  
- Validation prevents invalid submissions  
- Backend remains the final authority on correctness  

UI restrictions exist for usability only and are never relied upon for data integrity.

---

## Architectural Clarification

The frontend does **not** use repositories in the persistence sense.

- Backend repositories → database persistence abstraction  
- Frontend services → API communication abstraction  

This separation ensures clean boundaries and independent evolution.

---

## Running the Frontend

```bash
npm install
npm run dev


## Data Flow

