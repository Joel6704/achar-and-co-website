# Achar & Co. — Premium Kerala Heritage Website

A fast, responsive, multi-page website for **Achar & Co.**, handcrafted in Kerala.

---

## 🌟 Architecture Overview

- **Public Frontend:** Multi-page Kerala heritage website (`index.html`, `about.html`, `products.html`, `services.html`, `reviews.html`, `contact.html`).
- **Ordering Channel:** Direct WhatsApp integration (`https://wa.me/...`) with pre-filled product details, sizes, quantities, and multi-item bag checkout.
- **Enquiry Connector:** Direct submission of customer enquiries from the Contact and Services pages to the Supabase database (`enquiries` table) with graceful offline fallback.
- **Styling & Assets:** Vanilla CSS (`styles.css`), Kerala heritage typography (`Playfair Display`, `Plus Jakarta Sans`), and mobile-responsive layout.

---

## 🚀 Quick Start & Development

### 1. Start the Development Server
```bash
npm run dev
```
Open your browser at:
- **Home:** [http://localhost:3000](http://localhost:3000)
- **About:** [http://localhost:3000/about.html](http://localhost:3000/about.html)
- **Pickle Catalogue:** [http://localhost:3000/products.html](http://localhost:3000/products.html)
- **Bulk & Feasts:** [http://localhost:3000/services.html](http://localhost:3000/services.html)
- **Reviews:** [http://localhost:3000/reviews.html](http://localhost:3000/reviews.html)
- **Contact:** [http://localhost:3000/contact.html](http://localhost:3000/contact.html)

### 2. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready for deployment on Vercel, Netlify, or any static host.

---

## 🗄️ Supabase Configuration (Optional)

Customer contact and service enquiries can optionally be recorded directly in Supabase.

1. Copy `.env.example` to `.env`.
2. Add your Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
3. If not configured, enquiries fall back gracefully to local browser storage without errors.
