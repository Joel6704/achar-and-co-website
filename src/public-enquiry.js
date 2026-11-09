/**
 * Achar & Co. — Public Website Enquiry Connector for Supabase
 * Directly submits enquiries to the Supabase database.
 */

import { submitPublicEnquiry } from './lib/api';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Connect Contact Page Form
  const contactForm = document.getElementById('contactPageForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Form Note';
      const statusEl = document.getElementById('contactFormStatus');

      const name = document.getElementById('contactName')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim() || null;
      const district = document.getElementById('contactDistrict')?.value || 'Kerala';
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !phone || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please complete all required fields (Name, Phone, and Message).';
          statusEl.style.color = '#a32a2a';
          statusEl.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Submitting to Kitchen...';
      }

      try {
        await submitPublicEnquiry({
          full_name: name,
          phone: phone,
          email: email,
          subject: `General Enquiry (${district})`,
          message: message
        });

        if (statusEl) {
          statusEl.innerHTML = `
            <div style="background: #eef7f0; border: 1px solid #86efac; color: #166534; padding: 14px 18px; border-radius: 6px; margin-top: 14px;">
              <b style="display: block; font-size: 14px; margin-bottom: 4px;">✓ Enquiry Received!</b>
              <span>Thank you, ${name}. Your message has been logged in our kitchen database. Our team will review and connect with you shortly.</span>
            </div>
          `;
          statusEl.style.display = 'block';
        }

        contactForm.reset();
        if (typeof showToast === 'function') {
          showToast('Enquiry saved successfully! We will connect with you soon.');
        }
      } catch (err) {
        if (statusEl) {
          statusEl.innerHTML = `
            <div style="background: #fdf2f2; border: 1px solid #f8b4b4; color: #991b1b; padding: 12px 16px; border-radius: 6px; margin-top: 14px;">
              <b>Submission Error:</b> ${err.message || 'Unable to submit enquiry. Please try again or WhatsApp us directly.'}
            </div>
          `;
          statusEl.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // 2. Connect Services Page Enquiry Form
  const serviceForm = document.getElementById('serviceEnquiryForm');
  if (serviceForm) {
    // Intercept submit to save to Supabase before/in addition to WhatsApp
    serviceForm.addEventListener('submit', async (e) => {
      // Form handles WhatsApp in existing script; let's record the enquiry in Supabase database!
      const name = document.getElementById('servName')?.value.trim();
      const phone = document.getElementById('servPhone')?.value.trim();
      const type = document.getElementById('servType')?.value || 'Bulk Order';
      const district = document.getElementById('servDistrict')?.value || 'Kerala';
      const details = document.getElementById('servDetails')?.value.trim();

      if (name && phone) {
        try {
          await submitPublicEnquiry({
            full_name: name,
            phone: phone,
            email: null,
            subject: `Service: ${type} (${district})`,
            message: details || `Requested quotation for ${type} in ${district}.`
          });
          console.log('Service enquiry recorded in database.');
        } catch (err) {
          console.warn('Could not record service enquiry to database:', err);
        }
      }
    });
  }
});

