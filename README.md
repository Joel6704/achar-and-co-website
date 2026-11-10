# Achar & Co. — Premium Kerala Heritage Website

A fast, responsive, multi-page frontend website for **Achar & Co.**, handcrafted in Kerala.

---

## 🌟 Architecture Overview

- **Public Frontend:** Multi-page Kerala heritage website (`index.html`, `about.html`, `products.html`, `services.html`, `reviews.html`, `contact.html`).
- **Ordering Channel:** Direct WhatsApp integration (`https://wa.me/...`) with pre-filled product details, sizes, quantities, and multi-item bag checkout.
- **Customer Enquiries:** Direct WhatsApp messaging and client-side notifications from the Contact and Services pages.
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
Creates an optimized production bundle in the `dist/` directory ready for deployment on Vercel, Netlify, or any static web host.
