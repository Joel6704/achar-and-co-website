# Achar & Co. — Premium Kerala Heritage Website, Admin Dashboard & CMS

A complete, responsive web platform and secure backend admin dashboard for **Achar & Co.**, handcrafted in Kerala.

---

## 🌟 Architecture Overview

- **Public Frontend:** Multi-page Kerala heritage website (`index.html`, `about.html`, `products.html`, `services.html`, `reviews.html`, `contact.html`, `blog.html`, `blog-detail.html`).
- **Admin Dashboard & CMS:** React + Vite SPA mounted at `/admin/*` (`/admin/login`, `/admin/dashboard`, `/admin/enquiries`, `/admin/blogs`, `/admin/blogs/new`, `/admin/settings`).
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth, and Supabase Storage (`blog-images`).
- **Ordering Channel:** Direct WhatsApp integration (`https://wa.me/...`) with pre-filled product details, sizes, quantities, and multi-item bag checkout.

---

## 🚀 Quick Start & Development

### 1. Start the Vite Development Server
```bash
npm run dev
```
- **Public Website:** [http://localhost:3000](http://localhost:3000)
- **Stories & Blog:** [http://localhost:3000/blog.html](http://localhost:3000/blog.html)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### 2. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready for deployment on Netlify, Vercel, or any modern host.

---

## 🗄️ Supabase Database & Security Setup

All database tables, constraints, triggers, and Row Level Security (RLS) policies are provided in:
👉 **[`supabase/schema.sql`](supabase/schema.sql)**

### Setup Steps:
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Go to **SQL Editor &rarr; New Query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. Go to **Project Settings &rarr; API** to copy your:
   - `Project URL`
   - `anon` `public` key
4. Open the `.env` file in the project root and enter your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
5. Restart your dev server (`npm run dev`). The admin dashboard will automatically connect to your live Supabase cloud instance!

---

## 🔐 Creating the First Administrator

For security, public admin registration is disabled. Create your administrator account using either method:

### Method A: Supabase Dashboard (Recommended)
1. Open your project on [supabase.com/dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication &rarr; Users**.
3. Click **Add User &rarr; Create User**.
4. Enter your admin email (e.g. `admin@acharandco.com`) and a strong password.
5. Check **Auto Confirm User?** and save.
6. Log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

### Method B: Local Offline / Preview Mode
If Supabase keys are not yet configured in `.env`, the admin dashboard runs in an offline demo mode where any valid email and 6+ character password lets you explore all features and test workflows.

---

## 🔐 Administrator Login Credentials

The admin portal is pre-configured with the designated administrator credentials:

- **Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username / Email:** `joel@123`
- **Password:** `Admin@123`

---

## 🛡️ Row Level Security (RLS) Policy Summary

| Table | Operation | Policy | Permission |
| :--- | :--- | :--- | :--- |
| **`enquiries`** | `INSERT` | Public can insert enquiries | **Public / Anon & Authenticated** (requires name, phone, message) |
| **`enquiries`** | `SELECT`, `UPDATE`, `DELETE` | Authenticated admins only | **Authenticated Admins Only** (Public visitors cannot read other customers' enquiries) |
| **`blogs`** | `SELECT` | Public can view published blogs | **Public** (WHERE `status = 'Published'`) |
| **`blogs`** | `ALL` | Admins can manage all blogs | **Authenticated Admins Only** |
| **`blog_categories`**| `SELECT` | Public can view categories | **Public** |
| **`blog_categories`**| `ALL` | Admins can manage categories | **Authenticated Admins Only** |
| **Storage: `blog-images`** | `SELECT` | Public read access | **Public** |
| **Storage: `blog-images`** | `INSERT`, `UPDATE`, `DELETE` | Authenticated uploads | **Authenticated Admins Only** |

---

## 📋 Admin Features Breakdown

1. **Dashboard Overview (`/admin/dashboard`):**
   - 6 KPI metric cards: Total, New, Contacted, and Completed Enquiries; Published and Draft Blogs.
   - Real-time Pipeline Progress Bar.
   - Recent enquiries and stories tables with quick detail view.
   - One-click CSV export.

2. **Customer Enquiry Management (`/admin/enquiries`):**
   - Complete record table with date, customer name, phone, email, subject, status, and notes.
   - Search by name, phone, email, or message.
   - Filter by status (`New`, `Contacted`, `In Progress`, `Completed`, `Rejected`).
   - Detailed modal with customer message, status updater, and private internal admin notes.
   - Direct *“Reply on WhatsApp”* and *“Call Customer”* buttons.
   - Safe deletion with confirmation.

3. **Blog CMS (`/admin/blogs` & `/admin/blogs/new`):**
   - Create, edit, and publish stories on Kerala pickling heritage without modifying code.
   - Rich text editing toolbar: Headings (H2, H3), Paragraphs, Bold, Italic, Bullet Lists, Numbered Lists, Blockquotes, Links, and Image embeds.
   - Live Article Preview mode before publishing.
   - Featured image upload directly to Supabase Storage bucket `blog-images`.
   - Category management modal.
   - SEO Title and Meta Description controls.

4. **Settings (`/admin/settings`):**
   - Live Supabase connection health check and latency tester.
   - Configuration summary and security policy overview.
   - Administrator provisioning instructions.
