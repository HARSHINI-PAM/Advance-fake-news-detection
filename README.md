# Advanced fake news detection

An advanced fake news detection system. This project uses AI to analyze news articles and help users identify potentially false or misleading information.This project can verify sources and does real time monitoring.

## Technologies Used

This project is built with a modern web stack:

- **Vite**: A next-generation frontend tooling that provides a faster and leaner development experience.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A statically typed superset of JavaScript that adds type safety.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **shadcn-ui**: A collection of re-usable components for building modern web applications.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](httpss://nodejs.org/en/) (which includes npm) installed on your machine.

### Installation & Running

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd news-filter-ai
    ```
3.  **Install dependencies:**
    ```sh
    npm install
    ```
4.  **Start the development server:**
    ```sh
    npm run dev
    ```

This will start the development server, and you can view your application by navigating to `http://localhost:5173` (or the port shown in your terminal).

### Backend Setup

The backend service, which performs the AI analysis, requires a Google Fact Check API key to function correctly.

1.  **Get an API Key:**
    *   Visit the [Google Cloud Console](https://developers.google.com/fact-check/tools/api/guides/get-started).
    *   Follow the instructions to create a project and get an API key for the "Fact Check Tools API".

2.  **Create an environment file:**
    *   In the `backend` directory, create a new file named `.env`.
    *   Add the following line to the file, replacing `"YOUR_API_KEY_HERE"` with the key you obtained:
        ```
        FACT_CHECK_API_KEY="YOUR_API_KEY_HERE"
        ```
3. **Start the backend server**
   * Navigate to the `backend` folder in your terminal and run:
     ```sh
     npm run dev
     ```

## Deployment

This application is ready to be deployed to any modern web hosting service that supports Node.js applications, such as Vercel, Netlify, or AWS.
