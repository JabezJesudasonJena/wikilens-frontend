# Wiki RAG Assistant (Frontend)

## Overview
This is the client-facing architecture for the Wiki RAG Assistant. Built with Next.js (App Router), TypeScript, and Tailwind CSS, this frontend is engineered to handle complex state management for a real-time Retrieval-Augmented Generation system. 

Unlike standard chat wrappers, this UI surfaces the underlying mechanics of the AI pipeline directly to the user. It visually renders mathematical vector similarities, handles asynchronous crawling states, and enforces strict academic citation standards by mapping LLM responses to specific database records.

## System Features & Route Architecture

### 1. The RAG Chat Interface (`/chat`)
A conversational research UI built to prevent hallucinations and enforce data provenance.
*   **Immutable Citations:** Renders clickable Wikipedia source links directly inside the chat bubble. These links are passed from the backend database, ensuring the LLM cannot fabricate citations.
*   **Asynchronous State Handling:** If the backend throws a cache-miss and dispatches the BullMQ crawler, the UI intercepts the specific response state (`status: "crawling"`) and renders a pulsing UI indicator, instructing the user that the AI is currently fetching missing data.
*   **Guardrail Visualization:** Clearly formats system refusals ("I do not have enough data to answer this") to build user trust in the system's strict context window.
*   **Auto-Scroll & UX:** Utilizes React `useRef` and `useEffect` hooks to automatically pin the viewport to the latest generated chunk or thinking indicator.

### 2. Semantic Vector Search (`/`)
A mathematical search interface demonstrating raw vector retrieval.
*   **Cosine Similarity Scores:** Intercepts the `similarity_score` float from the PostgreSQL backend and renders it as a percentage badge (e.g., `Match: 75.4%`). This proves the system is measuring mathematical distance in 384-dimensional space, not just keyword matching.
*   **Dynamic Fallback UI:** Detects backend `202 Accepted` HTTP status codes to display a specific warning ("Neural Network confidence too low") when the autonomous web crawler is dispatched.

## Tech Stack
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Utility-first responsive design)
*   **State Management:** React Hooks (`useState`, `useRef`, `useEffect`)

## Setup & Installation

**1. Clone and Install Dependencies:**
```bash
npm install
