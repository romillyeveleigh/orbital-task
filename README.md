# Orbital Copilot Usage Dashboard

A full-stack application for tracking and displaying credit usage data for Orbital Copilot, an AI assistant for Real Estate lawyers.

## Overview

This project consists of:
- **Backend**: Python FastAPI API that aggregates data from external APIs and calculates credit usage
- **Frontend**: React dashboard with sortable table and bar chart visualization

## Features

- ✅ Real-time credit usage tracking
- ✅ Sortable table with multi-column sorting (Report Name, Credits Used)
- ✅ Shareable URLs with sort state preserved
- ✅ Daily credit consumption bar chart
- ✅ Automatic data caching and error handling

## Setup Instructions

### Prerequisites

- Python 3.9+ 
- Node.js 18+ and pnpm
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- API endpoint: `http://localhost:8000/usage`
- API documentation: `http://localhost:8000/docs` (FastAPI auto-generated)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## How to Run

1. Start the backend server (in one terminal):
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend server (in another terminal):
```bash
cd frontend
pnpm dev
```

3. Open your browser to `http://localhost:3000`

## API Documentation

FastAPI automatically generates interactive API documentation. Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Technical Decisions

### Backend

- **FastAPI**: Chosen for async by default, automatic OpenAPI docs, type hints with Pydantic, and built-in JSON serialization that handles the exact contract effortlessly
- **httpx**: Async HTTP client that works seamlessly with FastAPI's async endpoints, enables concurrent report fetching with `asyncio.gather()`
- **Report Caching**: Reports are cached in-memory during request processing to avoid duplicate API calls for the same `report_id`
- **Pydantic Models with exclude_none**: Ensures `report_name` field is omitted (not null) when not present, matching the exact contract requirement

### Frontend

- **TanStack Query**: Data fetching with automatic caching, error handling, loading states, and refetching - better than manual useState/useEffect
- **TanStack Table**: Robust table component with built-in multi-column sorting, handles empty cells, better than custom implementation
- **Tailwind CSS**: Fast styling, easy wireframe matching, quick polish without writing custom CSS
- **Vite**: Faster dev experience, modern tooling, better HMR than Create React App
- **Recharts**: React-friendly, good defaults, easy customization for bar charts
- **URL state management with react-router-dom**: Enables shareable links with sort state preserved
- **TypeScript**: Type safety for frontend code, helps with contract adherence

## Credit Calculation

The system calculates credits for messages in two ways:

1. **Messages with `report_id`**: Uses the fixed `credit_cost` from the report API
2. **Messages without `report_id`**: Calculates based on message text using:
   - Token estimation: 1 token ≈ 4 characters
   - Formula: `credits = (estimated_tokens / 100) * 40`
   - Minimum: 1.00 credits always applies
   - Result rounded to 2 decimal places

## Reflection on Token Estimation

### Why do we approximate 1 token ≈ 4 characters?

This approximation works reasonably well for English text, where most tokens are words or subwords. However, it breaks down in several scenarios:
- **Legal jargon**: Complex legal terms may be tokenized differently
- **Special characters**: Punctuation, symbols, and formatting can affect tokenization
- **Non-English text**: Different languages have different tokenization patterns
- **Code or structured data**: May have very different token-to-character ratios

### Implications of different models (e.g., GPT-3.5 vs GPT-4)

Different models have different:
- **Token costs**: GPT-4 costs significantly more per token than GPT-3.5
- **Tokenization algorithms**: Each model may tokenize the same text differently
- **Context windows**: Affects how much text can be processed in one request

This would require:
- Model-specific `base_model_rate` values
- Potentially different token estimation heuristics
- UI to show which model was used for each request

### How would you improve token estimation in a production system?

1. **Use exact token counting libraries**:
   - `tiktoken` (OpenAI's tokenizer) for GPT models
   - Model-specific tokenizers for other providers
   - This gives exact token counts, not estimates

2. **Cache token counts**:
   - Store token counts alongside messages
   - Avoid recalculating for identical text

3. **Real-time token counting**:
   - Count tokens as messages are sent
   - Use the actual tokenizer from the LLM provider

### Caching/batching strategies for slow or rate-limited LLM APIs

1. **Redis caching**:
   - Cache report metadata (name, cost) with TTL
   - Reduces external API calls significantly

2. **Batch API calls**:
   - Already implemented with `asyncio.gather()` for concurrent fetching
   - Could add request queuing for rate-limited APIs

3. **Database storage**:
   - Store historical report data locally
   - Only fetch from external API when needed

4. **Background jobs**:
   - Pre-fetch commonly used reports
   - Update cache asynchronously

### Normalizing token billing for legal prompts

Legal prompts vary greatly in:
- Length (short questions vs. comprehensive reports)
- Complexity (simple lookups vs. complex analysis)
- Context required (single document vs. multiple documents)

Potential normalization strategies:
1. **Tiered pricing**: Different rates for questions vs. reports
2. **Complexity scoring**: Factor in document length, number of clauses analyzed
3. **User intent classification**: Charge differently for "lookup" vs. "analysis" requests
4. **Fair usage caps**: Monthly limits to prevent abuse

### Explaining billing to lawyers

To explain why one message costs 12 credits while another costs 2:

1. **Show breakdown in UI**:
   - Token count used
   - Model used (if multiple models)
   - Base rate applied
   - Calculation formula

2. **Transparency features**:
   - Tooltips showing token count and calculation
   - "Why this cost?" button with explanation
   - Comparison view showing similar messages

3. **Billing details**:
   - Report type and fixed cost (for reports)
   - Message length and token estimate (for questions)
   - Visual indicators for high-cost items

## Production Optimizations

### Scale

- **External caching (Redis)**: Cache report data across requests to reduce external API load
- **Pagination strategy**: For large message volumes, implement pagination on the `/usage` endpoint
- **Rate limiting awareness**: Add retry logic with exponential backoff for external APIs
- **Database consideration**: Store usage data persistently for historical analysis and faster queries

### Speed of Iteration

- **Linting/formatting tools**: 
  - ESLint + Prettier for frontend
  - Black + Ruff for backend
  - Pre-commit hooks for automatic formatting
- **Hot reload configuration**: 
  - Vite HMR for instant frontend updates
  - FastAPI auto-reload for backend changes
- **Component structure**: Modular design allows easy extension and modification
- **TypeScript strict mode**: Better developer experience with compile-time error checking

### Quality

- **Error boundaries**: React error boundaries for graceful failure handling (to be added)
- **Structured logging**: JSON logs with log levels for better debugging and monitoring
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Input validation**: Comprehensive validation on both frontend and backend
- **Test coverage**: Unit tests for credit calculation, integration tests for API endpoints, e2e tests for critical flows

## Edge Cases Handled

- ✅ Empty message text → minimum 1.00 credits
- ✅ Short message text → minimum 1.00 credits  
- ✅ Invalid `report_id` (404) → fallback to text-based calculation
- ✅ Missing `report_name` → field omitted from response (not null)
- ✅ Empty messages array → return empty usage array
- ✅ Same `report_id` multiple times → cached to avoid duplicate fetches

## Concessions Due to Time Constraints

- Limited test coverage (focused on credit calculation logic)
- No error boundaries in React (would add in production)
- Basic error handling (could be more comprehensive)
- No authentication/authorization (assumed not needed for this task)
- Simple caching strategy (in-memory, not persistent)
- No pagination (assumes manageable data volume)

## File Structure

```
orbital-task/
├── backend/
│   ├── main.py                 # FastAPI application and /usage endpoint
│   ├── api_client.py          # Async HTTP client for external APIs
│   ├── credit_calculator.py  # Credit calculation logic
│   ├── models.py             # Pydantic models for validation
│   ├── requirements.txt      # Python dependencies
│   └── tests/                # Test files (to be added)
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main dashboard component
│   │   ├── main.tsx          # Application entry point
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── services/
│   │   │   └── api.ts        # API service for backend calls
│   │   ├── hooks/
│   │   │   ├── useUsageData.ts    # TanStack Query hook
│   │   │   └── useSortState.ts    # URL state management
│   │   └── components/
│   │       ├── UsageTable.tsx      # Sortable table component
│   │       └── CreditsChart.tsx   # Bar chart component
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
└── .gitignore
```

## License

This project was created as part of a technical assessment.

