# ⚡ FormRelay

**FormRelay** is a powerful, self-hostable form backend solution built with **Next.js** and **Supabase**. It allows you to easily collect form submissions from your static websites, portfolios, or landing pages without needing to build your own server-side infrastructure.

<img width="1343" height="955" alt="image" src="https://github.com/user-attachments/assets/40ade9aa-27ce-4b94-bc54-543a878df75b" />

## 🚀 Features

-   **Headless Form Backend**: Just point your HTML forms to your unique endpoint.
-   **Real-time Dashboard**: View submissions instantly as they arrive, powered by Supabase Realtime.
-   **Email Notifications**: Receive instant email alerts for every new submission via **Resend**.
    -   *Now configurable per form! Toggle on/off in settings.*
    -   *Smart fallback: Uses form-specific email or defaults to your account email.*
-   **Spam Protection**:
    -   **Allowed Domains**: Restrict submissions to specific domains (CORS & Referer checks).
    -   **Rate Limiting**: Built-in protection to prevent abuse (5 requests/min per IP).
-   **Easy Integration**: Copy-paste ready HTML and JavaScript snippets for your frontend.
-   **Modern UI**: Beautiful, responsive dashboard built with **Tailwind CSS** and **Radix UI**.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
-   **Email Service**: [Resend](https://resend.com/)

## 🏁 Getting Started

Follow these steps to set up FormRelay locally.

### Prerequisites

-   Node.js 18+
-   npm, yarn, or pnpm
-   A [Supabase](https://supabase.com/) account
-   A [Resend](https://resend.com/) account (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/Varshithvhegde/formrelay.git
cd formrelay-next
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the submission API to bypass RLS for inserting submissions and checking rate limits globally.

### 4. Database Setup

Run the SQL queries found in `supabase/schema.sql` in your Supabase SQL Editor to verify the table structure and RLS policies. The project uses standard Supabase Auth and Tables:
-   `profiles`: Linked to auth.users
-   `forms`: Stores form settings
-   `submissions`: Stores form data

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1.  **Create a Form**: Go to your dashboard and click "New Form".
2.  **Get Endpoint**: Open the form details "Setup" tab to copies your unique API endpoint.
3.  **Integrate**:
    Add the form to your website:

    ```html
    <form action="YOUR_ENDPOINT_URL" method="POST">
      <input type="hidden" name="form_id" value="YOUR_FORM_ID" />
      <input type="email" name="email" required />
      <textarea name="message" required></textarea>
      <button type="submit">Send</button>
    </form>
    ```

    Or use JavaScript `fetch`:

    ```javascript
    fetch("YOUR_ENDPOINT_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form_id: "YOUR_FORM_ID",
        email: "user@example.com",
        message: "Hello world!"
      })
    })
    ```

## 🔒 Security

-   **Row Level Security (RLS)**: Users can only access their own data.
-   **Secure API**: Submissions are handled via a server-side route.
-   **Domain Whitelisting**: Prevent unauthorized usage of your form endpoint.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
