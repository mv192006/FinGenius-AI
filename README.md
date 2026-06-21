# FinGenius AI 🧠💸

An AI-powered personal finance dashboard built to help users manage expenses, track savings goals, forecast financial health, and receive personalized investment guidance.

Designed with a focus on clean architecture, modern UI aesthetics, and actionable AI insights, FinGenius AI demonstrates full-stack development capabilities and intelligent feature integration.

## 🌟 Key Features

*   **Interactive Dashboard:** A comprehensive overview of cash flow, monthly income, spending, savings rates, and an overall "Financial Health Score".
*   **Transaction Management:** Track expenses and income with categorization. Includes an automatic detection system for high-value and duplicate (suspicious) transactions.
*   **Data Analytics & Visualization:** Interactive charts built with Recharts to visualize spending by category and cash flow over time.
*   **Savings Goals:** Track multiple savings targets (e.g., Emergency Fund, Vacations) with progress bars and dynamic timeline calculations.
*   **AI Investment Planner:** Generates customized investment asset allocations (Equity, Debt, Gold) and projections based on user age, risk appetite, and monthly contribution limits.
*   **Conversational AI Assistant:** A built-in chatbot ("FinGenius AI") that answers context-aware questions about the user's spending habits, savings progress, and flagged transactions.

## 🛠️ Technical Stack

*   **Frontend:** React 19, Vite, Recharts (for data visualization), Lucide React (for UI icons), Vanilla CSS (for sleek, custom styling).
*   **Backend:** Node.js, Express.js.
*   **Database:** Local JSON storage by default for easy local testing without setup, with optional seamless MongoDB integration via Mongoose.
*   **Architecture:** Client-Server model with a RESTful API. `concurrently` is used for streamlined local development.

## 🚀 Running the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup Instructions

1.  **Clone the repository and install dependencies:**
    ```bash
    # Install root dependencies (concurrently)
    npm install
    
    # Install client and server dependencies
    npm install --prefix client
    npm install --prefix server
    ```

2.  **Start the development servers:**
    ```bash
    npm run dev
    ```

3.  **Access the application:**
    *   The frontend will automatically open at `http://127.0.0.1:5173`.
    *   The backend API runs on `http://127.0.0.1:5001`.

*Note: The application runs with seeded demo data out-of-the-box using a local JSON file (`server/data/finance.json`). To use MongoDB, copy `server/.env.example` to `server/.env` and provide your connection string.*

## 💡 Why this project stands out (For Recruiters)

*   **Holistic Feature Set:** It goes beyond simple CRUD operations by integrating analytics and basic AI recommendation algorithms, reflecting real-world business requirements.
*   **Zero-Friction Setup:** Designed to be easily runnable out of the box with seeded local data, proving an understanding of developer experience (DX).
*   **Clean UI/UX:** Uses modern aesthetics and responsive design principles without relying heavily on bloated component libraries.
*   **Scalable Structure:** The backend is structured to easily swap from the local file-based database to a full MongoDB instance.
