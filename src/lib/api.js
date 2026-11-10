/**
 * Achar & Co. — Public Website API
 * Handles customer enquiry submissions to Supabase database (with offline local fallback).
 */

import { supabase, isConfigured } from './supabase';

const STORAGE_ENQUIRIES = 'achar_public_enquiries';

function getLocalFallback(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalFallback(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // Ignore storage quota or access exceptions
  }
}

/**
 * Submit public customer enquiry to Supabase database
 * @param {Object} enquiry
 * @param {string} enquiry.full_name
 * @param {string} enquiry.phone
 * @param {string|null} enquiry.email
 * @param {string} [enquiry.subject]
 * @param {string} enquiry.message
 */
export async function submitPublicEnquiry({ full_name, phone, email, subject, message }) {
  if (!full_name || full_name.trim().length === 0) {
    throw new Error('Please enter your full name.');
  }
  if (!phone || phone.trim().length < 7) {
    throw new Error('Please enter a valid phone or WhatsApp number.');
  }
  if (!message || message.trim().length === 0) {
    throw new Error('Please enter your enquiry message.');
  }

  const payload = {
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    subject: subject ? subject.trim() : 'General Website Enquiry',
    message: message.trim(),
    status: 'New'
  };

  if (isConfigured) {
    const { data, error } = await supabase
      .from('enquiries')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0] || payload;
  } else {
    const list = getLocalFallback(STORAGE_ENQUIRIES, []);
    const newRecord = {
      id: 'enq-' + Date.now(),
      ...payload,
      created_at: new Date().toISOString()
    };
    list.unshift(newRecord);
    setLocalFallback(STORAGE_ENQUIRIES, list);
    return newRecord;
  }
}
