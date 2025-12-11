
# Nexus Financial OS - Setup & Deployment Guide

Welcome to **Nexus**, the AI-Powered Operating System for Business Funding. This guide covers how to set up your database, create your first admin user, connect third-party tools, and deploy the application to the web.

---

## 🚀 Phase 1: Environment & API Keys

Before running the app in production, you must configure your environment variables to secure your API keys.

1.  Create a file named `.env` in the root directory (for local development).
2.  Add the following keys:

```env
# Google Gemini AI (Required for all AI features)
# Get key here: https://aistudio.google.com/
VITE_API_KEY=your_google_gemini_key_here

# Supabase (Required for Database & Auth)
# Get keys here: https://supabase.com/dashboard
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** The application uses `import.meta.env.VITE_...` to access these keys.

---

## 🗄️ Phase 2: Database Setup (Supabase)

The app requires specific tables to store contacts, documents, and user roles.

1.  Log in to your **Supabase Dashboard**.
2.  Go to the **SQL Editor** tab.
3.  Copy the contents of the `schema.sql` file included in this project.
4.  Paste it into the editor and click **Run**.

This will create:
*   `profiles`: Links users to roles (Admin vs. Client).
*   `contacts`: Stores all CRM data.
*   `documents`: Tracks uploaded files.
*   `activities`: Logs timeline events.

### Storage Bucket Setup
1.  Go to **Storage** in Supabase.
2.  Create a new public bucket named `documents`.
3.  This allows the `DocumentVault` component to upload and retrieve files.

---

## 👑 Phase 3: Creating Your First Admin User

By default, new sign-ups are assigned the **'client'** role. To access the Dashboard, CRM, and Settings, you must promote yourself to **Admin**.

1.  **Sign Up:** Go to your app's Sign Up page (`/signup`) and create an account with your email.
2.  **Access Database:** Go to your Supabase Dashboard -> **Table Editor** -> `profiles` table.
3.  **Edit Role:** Find your email/user row. Change the `role` column from `client` to `admin`.
4.  **Log In:** Go back to the app Login screen. Sign in. You will now be routed to the **Admin Dashboard** instead of the Client Portal.

---

## 🌐 Phase 4: Deployment to Web (Vercel)

We recommend **Vercel** for the easiest React deployment.

1.  **Push to GitHub:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    # Create a repo on GitHub.com and copy the URL
    git remote add origin https://github.com/YOUR_USERNAME/nexus-crm.git
    git push -u origin main
    ```

2.  **Deploy on Vercel:**
    *   Go to [Vercel.com](https://vercel.com) and Sign Up.
    *   Click "Add New..." -> "Project".
    *   Import your GitHub repository.

3.  **Configure Environment Variables (IMPORTANT):**
    *   On the "Configure Project" screen, look for the **Environment Variables** section.
    *   Add the specific keys found in your `.env` file here. These are **required** for the app to work online.

    | Name | Value |
    | :--- | :--- |
    | `VITE_API_KEY` | Paste your Gemini API Key |
    | `VITE_SUPABASE_URL` | Paste your Supabase URL |
    | `VITE_SUPABASE_ANON_KEY` | Paste your Supabase Anon Key |

    *   Click **Add** after entering each one.

4.  **Deploy:**
    *   Click **Deploy**.
    *   Wait for the build to finish. Vercel will give you a live URL (e.g., `https://nexus-crm.vercel.app`).

---

## 🔗 Phase 5: Connecting Your Custom Domain

Once deployed on Vercel, to use your own domain (e.g., `www.yourcompany.com`):

1.  **In Vercel:**
    *   Go to your Project Settings -> **Domains**.
    *   Enter your domain name and click **Add**.
    *   Vercel will provide DNS records (an A Record and a CNAME).

2.  **In Your Domain Registrar (GoDaddy, Namecheap, etc.):**
    *   **Add A Record:** Host: `@`, Value: `76.76.21.21`
    *   **Add CNAME Record:** Host: `www`, Value: `cname.vercel-dns.com`

3.  **Wait:** DNS propagation usually happens within minutes. Once green in Vercel, your app is live!

---

## 🛠️ Troubleshooting

*   **"Failed to fetch" on live site**: Check your internet connection and verify `VITE_SUPABASE_URL` is correct in Vercel Environment Variables.
*   **404 on Refresh**: Ensure the `vercel.json` file included in this project is present in your root directory. It handles the routing rules.
*   **AI not responding**: Check your `VITE_API_KEY` limit.
