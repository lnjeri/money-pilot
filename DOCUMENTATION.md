# 📘 Money Pilot: Full Project Documentation

This document provides a comprehensive overview of the **Money Pilot** application. It is designed to serve as a presentation guide and a technical reference for evaluators.

---

## 1. Introduction & Problem Statement
**Money Pilot** was created to address the common challenge of personal financial management. Many people struggle to track their spending, set realistic savings goals, and understand their financial patterns. 

**The Solution:** A fast, intuitive, and AI-enhanced dashboard that not only records transactions but also provides intelligent insights to help users make better financial decisions.

---

## 2. Technical Architecture (The "How")
The project follows a modern **Full-Stack Serverless Architecture**.

### Frontend (The Client)
-   **React 19**: Leverages the latest React features for efficient rendering and state management.
-   **TypeScript**: Used throughout the project to ensure type safety, reducing bugs and improving developer productivity.
-   **Vite**: Acts as the build tool and development server, providing near-instant hot module replacement (HMR).
-   **Tailwind CSS v4**: A utility-first CSS framework used for rapid UI development and consistent styling.
-   **Framer Motion**: Powers the smooth transitions between tabs and the entrance animations for cards.

### Backend & Infrastructure (The Engine)
-   **Supabase (BaaS)**: Used as the backend-as-a-service provider.
    -   **PostgreSQL**: A powerful relational database for storing user data.
    -   **Supabase Auth**: Handles secure user registration, login, and session persistence.
-   **Google Gemini AI**: Integrated via the `@google/genai` SDK to provide the "AI Advisor" feature.

---

## 3. Key Features & Implementation

### A. Intelligent Dashboard
-   **Monthly Spending Trend**: Uses an `AreaChart` (Recharts) with emerald gradients to show spending over the last 30 days.
-   **Weekly Spending**: A `BarChart` that highlights days where spending exceeded the average (using a dynamic threshold).
-   **Category Distribution**: A `Donut Chart` that breaks down expenses by type (Food, Transport, etc.).

### B. AI Financial Advisor
-   **Implementation**: The app sends a sanitized JSON summary of the user's expenses, income, and goals to the **Gemini 2.0 Flash** model.
-   **Prompt Engineering**: The system instructions guide the AI to be "professional, encouraging, and concise," returning exactly 3 actionable tips in a structured JSON format.

### C. Resilience & Offline Mode
-   **The Challenge**: What if the user has no internet or the database is down?
-   **The Solution**: I implemented a **Dual-Storage Strategy**. 
    -   The app first tries to sync with Supabase.
    -   If the network fails (`Failed to fetch`), it automatically falls back to `localStorage`.
    -   Users can "Continue as Guest" if they don't want to set up a database, storing everything locally on their device.

---

## 4. Database Schema
The database is relational (PostgreSQL), ensuring data integrity.

| Table | Field | Type | Description |
| :--- | :--- | :--- | :--- |
| **expenses** | `id` | UUID | Unique identifier (Primary Key) |
| | `user_id` | UUID | Links expense to a specific user (Foreign Key) |
| | `amount` | Numeric | The cost of the transaction |
| | `category` | Text | Categorization (Food, Bills, etc.) |
| | `description`| Text | User-provided note |
| | `date` | Date | When the expense occurred |
| **savings_goals** | `user_id` | UUID | Primary Key (One goal per user) |
| | `name` | Text | Name of the goal (e.g., "New Car") |
| | `target_amount`| Numeric | The final goal amount |
| | `current_amount`| Numeric | Progress made so far |

---

## 5. Design Philosophy
-   **Theme**: "Dark Emerald & White." Emerald represents growth and stability (finance), while white provides a clean, professional "Paper" feel.
-   **UX**: Mobile-first design. The sidebar collapses on smaller screens, and charts are fully responsive.
-   **Feedback**: Uses `sonner` for non-intrusive toast notifications (e.g., "Expense Added," "Working in Offline Mode").

---

## 6. Q&A Preparation (Teacher's Potential Questions)

**Q: Why did you choose Supabase over a traditional Express/MongoDB stack?**
*   **A:** Supabase provides built-in Authentication and a real-time PostgreSQL database out of the box. This allowed me to focus on the user experience and AI integration rather than spending weeks building a custom backend and auth system.

**Q: How do you handle security?**
*   **A:** Security is handled at two levels. First, **Supabase Auth** ensures only logged-in users can access the app. Second, **Row Level Security (RLS)** in PostgreSQL ensures that a user can only read or write data where the `user_id` matches their own unique ID.

**Q: What happens if the Gemini API key is exposed?**
*   **A:** In a production environment, I would move the Gemini calls to a server-side "Edge Function" to hide the API key. For this version, the key is managed via environment variables to keep it out of the source code.

**Q: How does the "Offline Mode" work technically?**
*   **A:** I wrapped the data fetching and mutation logic in `try-catch` blocks. When a network error occurs, the `catch` block triggers a function that writes the data to `window.localStorage` instead of the database. When the app reloads, it checks both sources.

**Q: Why use TypeScript instead of plain JavaScript?**
*   **A:** TypeScript allows us to define "Interfaces" for our data (like `Expense` or `User`). This prevents common errors, like trying to perform math on a string or accessing a property that doesn't exist, making the app much more stable.

---

## 7. Future Roadmap
1.  **Receipt Scanning**: Use Gemini's vision capabilities to extract data from photos of receipts.
2.  **Export to CSV**: Allow users to download their data for use in Excel.
3.  **Push Notifications**: Remind users to log their daily expenses or celebrate when they reach a savings goal.

---

## 8. Competitive Advantages: Why Money Pilot?

Money Pilot stands out from traditional finance apps through several key innovations:

### A. AI-First Intelligence
Most finance apps are just "digital notebooks"—they store data but don't understand it. Money Pilot uses **Google Gemini AI** to act as a personal financial coach, analyzing complex spending patterns and providing 3 specific, actionable tips every time you check your advisor.

### B. Dual-Storage Resilience (Cloud + Local)
Traditional apps often fail or show "loading" spinners when the internet is slow. Money Pilot uses a **Local-First architecture**. It saves data to your device's `localStorage` instantly while syncing to the **Supabase Cloud** in the background. This makes the app feel incredibly fast and ensures it works perfectly in "Offline Mode."

### C. Privacy & Low Barrier to Entry
Many apps force users to provide an email and password before they can even see the interface. Money Pilot offers a **"Continue as Guest"** mode. This allows users to test the full power of the app immediately, with their data stored safely on their own browser until they are ready to create a cloud account.

### D. Modern Tech Stack (React 19 & Vite)
By using **React 19** and **Vite**, the application achieves near-instant load times and a highly responsive UI. The use of **Tailwind CSS v4** ensures a lightweight CSS bundle, making the app performant even on older mobile devices.

### E. Premium "Technical Dashboard" Aesthetic
Unlike generic, colorful finance apps, Money Pilot uses a sophisticated **Dark Emerald & White** theme. This design choice conveys a sense of stability and professional financial management, similar to high-end banking or trading platforms.

---

*Documentation generated for the Money Pilot Project - March 2026.*
