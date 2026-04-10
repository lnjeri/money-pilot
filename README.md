# 💸 Money Pilot

**Money Pilot** is a modern, full-stack personal finance management application designed to help users track expenses, set savings goals, and receive AI-powered financial advice. Built with a focus on speed, security, and a premium user experience, it features a sophisticated **Dark Emerald & White** theme.

---

## 🚀 Key Features

-   **Interactive Dashboard**: Real-time visualization of spending habits using smooth Area, Bar, and Donut charts.
-   **Expense Tracking**: Easily record and categorize transactions with a clean, responsive interface.
-   **Savings Goals**: Set financial targets, track progress with visual indicators, and stay motivated.
-   **AI Financial Advisor**: Get personalized, actionable financial insights powered by Google's Gemini AI.
-   **Offline Resilience**: Automatic fallback to `localStorage` ensures the app remains functional even without an internet connection.
-   **Secure Authentication**: Robust user sign-up and login powered by Supabase Auth.
-   **Customization**: Support for multiple currencies (USD, KES) and custom expense categories.
-   **Mobile First**: Fully responsive design that works perfectly on desktops, tablets, and smartphones.

---

## 🛠 Tech Stack

### Frontend
-   **React 19**: The latest version of the popular UI library for building dynamic interfaces.
-   **TypeScript**: Ensures type safety and robust code quality.
-   **Vite**: A lightning-fast build tool and development server.
-   **Tailwind CSS v4**: Utility-first CSS framework for modern, responsive styling.
-   **Framer Motion**: High-performance animations for a premium feel.
-   **Recharts**: Composable charting library for data visualization.
-   **Lucide React**: Beautiful, consistent icon set.
-   **Sonner**: Elegant toast notifications for user feedback.

### Backend & Infrastructure
-   **Supabase**: An open-source Firebase alternative providing:
    -   **PostgreSQL Database**: Relational data storage for expenses and goals.
    -   **Auth**: Secure user management and session handling.
-   **Google Gemini AI**: Advanced large language model used to analyze spending patterns and provide financial advice.

---

## 🗄 Database Schema (PostgreSQL)

The application uses two primary tables in Supabase:

1.  **`expenses`**:
    -   `id` (UUID, Primary Key)
    -   `user_id` (UUID, Foreign Key to Auth)
    -   `amount` (Numeric)
    -   `category` (Text)
    -   `description` (Text)
    -   `date` (Date)
2.  **`savings_goals`**:
    -   `user_id` (UUID, Primary Key, Foreign Key to Auth)
    -   `name` (Text)
    -   `target_amount` (Numeric)
    -   `current_amount` (Numeric)
    -   `deadline` (Date)

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🏁 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/money-pilot.git
    cd money-pilot
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

---

## ☁️ Deployment

### GitHub & Vercel
1.  Push your code to a GitHub repository.
2.  Connect your repository to [Vercel](https://vercel.com).
3.  Add the **Environment Variables** listed above in the Vercel project settings.
4.  Vercel will automatically detect the Vite configuration and deploy your app.

---

## 🎨 Design Philosophy

Money Pilot uses a **Technical Dashboard** aesthetic. The color palette is centered around:
-   **Primary**: Emerald 900/950 (Dark, professional green)
-   **Secondary**: White / Slate 50 (Clean, breathable space)
-   **Accents**: Red (Warnings), Amber (Progress)

The UI utilizes a visible grid structure, rounded corners (2xl), and subtle shadows to create a sense of depth and organization.

---




