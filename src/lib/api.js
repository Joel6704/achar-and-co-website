import { supabase, isConfigured } from './supabase';

// Local storage keys
const STORAGE_ENQUIRIES = 'achar_admin_enquiries';
const STORAGE_PRODUCTS = 'achar_admin_products';
const STORAGE_CATEGORIES = 'achar_admin_product_categories';
const STORAGE_AUTH = 'achar_admin_auth_user';

// Initial seed categories
const DEFAULT_CATEGORIES = [
  { id: 'cat-mango', name: 'Mango Pickle', slug: 'mango-pickle' },
  { id: 'cat-lemon', name: 'Lemon Pickle', slug: 'lemon-pickle' },
  { id: 'cat-special', name: 'Special Pickles', slug: 'special-pickles' },
  { id: 'cat-veg', name: 'Vegetable Pickle', slug: 'vegetable-pickle' },
  { id: 'cat-seafood', name: 'Seafood & Coastal', slug: 'seafood-coastal' }
];

// Initial seed products migrated directly from existing website catalogue
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Kerala Cut Mango Pickle',
    slug: 'kerala-cut-mango-pickle',
    category_id: 'cat-mango',
    category_name: 'Mango Pickle',
    regular_price: 190,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Crisp green raw mango cubes cured with stone-pounded Kashmiri chilli, roasted fenugreek, and cold-pressed gingelly oil.',
    description: 'Our signature heirloom recipe inspired by traditional Central Travancore households. Hand-cut crisp green mangoes are salted until tender, then simmered in fragrant cold-pressed sesame oil with roasted mustard, fenugreek, and fragrant asafoetida.',
    ingredients: 'Raw Country Mangoes, Cold-Pressed Gingelly (Sesame) Oil, Kashmiri Chilli Powder, Fenugreek Powder, Mustard Seeds, Asafoetida (Hing), Turmeric, Rock Salt, Curry Leaves.',
    flavour_profile: 'Crisp, tangy, balanced spice with rich roasted fenugreek aroma',
    storage_instructions: 'Store in a cool, dry place away from direct sunlight. Always use a clean, bone-dry wooden or stainless steel spoon. Ensure the layer of gingelly oil covers the pickle surface.',
    shelf_life: '9 months from packaging date',
    allergen_information: 'Contains Sesame. Processed in a facility that handles mustard seeds.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: true,
    images: [
      { id: 'img-1-1', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=85', alt_text: 'Kerala Cut Mango Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'prod-002',
    name: 'Vadukapuli Naranga Pickle',
    slug: 'vadukapuli-naranga-pickle',
    category_id: 'cat-lemon',
    category_name: 'Lemon Pickle',
    regular_price: 180,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Piquant Kerala wild citron (Vadukapuli) slowly simmered with fiery green chillies and roasted spices. An indispensable Onam feast classic.',
    description: 'Vadukapuli (large thick-skinned wild lemon) is the crown jewel of Kerala Sadhya feasts. Hand-chopped with its fragrant rind intact, balanced with a subtle bitter-tart kick that aids digestion and elevates any rice meal.',
    ingredients: 'Vadukapuli (Kerala Wild Citron), Cold-Pressed Gingelly Oil, Red Chilli Powder, Turmeric, Fenugreek, Mustard Seeds, Rock Salt, Green Chillies, Asafoetida.',
    flavour_profile: 'Bittersweet citrus zest, tart, fiery brine kick',
    storage_instructions: 'Keep in an airtight earthenware bharani or glass jar. Do not expose to moisture. Keep oil layer intact.',
    shelf_life: '12 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: true,
    images: [
      { id: 'img-2-1', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85', alt_text: 'Vadukapuli Naranga Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'prod-003',
    name: 'Kanthari Mulaku Pickle',
    slug: 'kanthari-mulaku-pickle',
    category_id: 'cat-special',
    category_name: 'Special Pickles',
    regular_price: 240,
    discount_price: 220,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Fiery local bird\'s eye chillies cured in brine, garlic, and gingelly oil. Unmatched natural heat with medicinal Kerala folklore pedigree.',
    description: 'Grown in backyards across Kerala, the tiny ivory Kanthari chilli packs intense clean heat and distinct medicinal character. We gently prick each chilli so the sun-steeped brine, lime, and warm spices penetrate to the core.',
    ingredients: 'Fresh Green & White Kanthari Chillies, Garlic Cloves, Lime Juice, Cold-Pressed Sesame Oil, Fenugreek, Mustard Seeds, Rock Salt, Asafoetida.',
    flavour_profile: 'Pungent, clean, fiery heat with zesty lime finish',
    storage_instructions: 'Store in a cool dry pantry. Use a dry spoon. Keep tightly closed.',
    shelf_life: '6 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: true,
    images: [
      { id: 'img-3-1', image_url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=85', alt_text: 'Kanthari Mulaku Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'prod-004',
    name: 'Spiced Garlic Pickle',
    slug: 'spiced-garlic-pickle',
    category_id: 'cat-veg',
    category_name: 'Vegetable Pickle',
    regular_price: 220,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Plump peeled garlic cloves simmered tender in a thick, velvety roasted red masala with curry leaves and pure sesame oil.',
    description: 'Whole garlic cloves slowly confited in simmering gingelly oil with hand-ground spices until tender and mellow. Rich, savoury, and deeply aromatic, pairs exquisitely with Kanji or layered Biryani.',
    ingredients: 'Select Whole Garlic Cloves, Cold-Pressed Sesame Oil, Kashmiri Chilli Powder, Fenugreek, Mustard Seeds, Tamarind Pulp, Asafoetida, Rock Salt, Curry Leaves.',
    flavour_profile: 'Mellow garlic richness, deep roasted chili warmth',
    storage_instructions: 'Store at ambient room temperature. Do not refrigerate before opening.',
    shelf_life: '9 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: false,
    images: [
      { id: 'img-4-1', image_url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1000&q=85', alt_text: 'Spiced Garlic Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'prod-005',
    name: 'Festive Inji Puli (Ginger Curry Pickle)',
    slug: 'festive-inji-puli',
    category_id: 'cat-special',
    category_name: 'Special Pickles',
    regular_price: 230,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Finely sliced ginger fried crisp, simmered in aged Malabar tamarind, jaggery, green chillies, and roasted cumin.',
    description: 'Considered in Kerala culinary lore to equal the digestive power of 101 curries. Thinly shredded fresh ginger is slow-fried in gingelly oil, married with thick dark Kodampuli/Tamarind paste and organic palm jaggery for the definitive sweet-sour-spicy symphony.',
    ingredients: 'Fresh Country Ginger, Dark Tamarind Extract, Organic Palm Jaggery, Green Chillies, Gingelly Oil, Fenugreek, Mustard Seeds, Curry Leaves, Rock Salt.',
    flavour_profile: 'Sweet, tangy tamarind with warm ginger pungency',
    storage_instructions: 'Refrigerate after opening to preserve the delicate balance of tamarind and jaggery.',
    shelf_life: '12 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: false,
    images: [
      { id: 'img-5-1', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1000&q=85', alt_text: 'Festive Inji Puli', is_primary: true }
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'prod-006',
    name: 'Kannimanga Whole Tender Mango',
    slug: 'kannimanga-whole-tender-mango',
    category_id: 'cat-mango',
    category_name: 'Mango Pickle',
    regular_price: 260,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Intact whole baby mangoes aged in terracotta bharanis with brine and crushed red chillies. Nostalgic crunchy burst.',
    description: 'Harvested during the early weeks of summer when mangoes are no larger than a betel nut with soft, developing seeds. Preserved whole in heavy ceramic bharani jars for months until the brine and spices thoroughly permeate each fruit.',
    ingredients: 'Whole Baby Tender Mangoes (Kannimanga), Mustard-Chilli Paste, Rock Salt Brine, Gingelly Oil, Fenugreek, Asafoetida.',
    flavour_profile: 'Nostalgic crunchy burst, salty-sour-spicy brine infusion',
    storage_instructions: 'Keep fully submerged under the spiced brine layer in a glass or ceramic container.',
    shelf_life: '12 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: false,
    images: [
      { id: 'img-6-1', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85', alt_text: 'Kannimanga Tender Mango', is_primary: true }
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'prod-007',
    name: 'Coastal Kerala Prawn Pickle',
    slug: 'coastal-kerala-prawn-pickle',
    category_id: 'cat-seafood',
    category_name: 'Seafood & Coastal',
    regular_price: 320,
    discount_price: 299,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Succulent sea prawns shallow fried in coconut-gingelly oil, steeped in roasted shallots, garlic, and fiery Malabar spices.',
    description: 'A celebrated delicacy from the fishing hamlets of Alappuzha and Kollam. Fresh prawns are sun-cured with turmeric and pepper, pan-crisped and gently infused into an aromatic ginger-garlic gravy that mellows with each passing week.',
    ingredients: 'Fresh Marine Prawns, Cold-Pressed Gingelly & Coconut Oil, Garlic, Ginger, Kashmiri Chilli, Natural Vinegar, Fenugreek, Mustard Seeds, Curry Leaves, Salt.',
    flavour_profile: 'Deep coastal seafood richness, garlicky, spicy vinegar reduction',
    storage_instructions: 'Refrigerate upon arrival. Always use a dry spoon and ensure the oil layer rests on top.',
    shelf_life: '6 months from packaging date',
    allergen_information: 'Contains Crustaceans (Prawns), Sesame, Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: true,
    images: [
      { id: 'img-7-1', image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=85', alt_text: 'Coastal Kerala Prawn Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'prod-008',
    name: 'Traditional Malabar Fish Pickle',
    slug: 'traditional-malabar-fish-pickle',
    category_id: 'cat-seafood',
    category_name: 'Seafood & Coastal',
    regular_price: 310,
    discount_price: null,
    pack_size: '250g',
    weight: '250g',
    short_description: 'Firm seer fish cubes marinated in crushed peppercorns and fried crisp before marrying with aged vinegar and fragrant spice reduction.',
    description: 'Prepared in the authentic North Malabar seaside tradition. Fresh firm sea fish steaks are diced, gently spiced, flash-fried, and preserved in deep crimson oil enriched with shallots, garlic slivers, and green chillies.',
    ingredients: 'Firm Sea Fish, Cold-Pressed Gingelly Oil, Garlic, Shallots, Kashmiri Chilli, Green Chillies, Fenugreek, Mustard, Natural Brewed Vinegar, Curry Leaves, Salt.',
    flavour_profile: 'Firm crisped fish bite, tangy-spicy pickled reduction',
    storage_instructions: 'Keep refrigerated after opening. Do not introduce water or moisture.',
    shelf_life: '6 months from packaging date',
    allergen_information: 'Contains Fish, Sesame, Mustard.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: false,
    images: [
      { id: 'img-8-1', image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85', alt_text: 'Traditional Malabar Fish Pickle', is_primary: true }
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const DEFAULT_ENQUIRIES = [
  {
    id: 'enq-001',
    full_name: 'Ramesh Panicker',
    phone: '+91 94471 23456',
    email: 'ramesh.panicker@example.com',
    subject: 'Bulk Order (Wedding / Sadhya)',
    message: 'Need 15kg Vadukapuli and 10kg Cut Mango pickle for daughter\'s marriage reception in Thrissur on Dec 20.',
    status: 'New',
    admin_notes: 'Urgent: Follow up by Thursday regarding glass vs bucket packaging.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'enq-002',
    full_name: 'Anjali Menon',
    phone: '+91 98460 55432',
    email: 'anjali.m@example.com',
    subject: 'Curated Gift Hampers',
    message: 'Enquiring about 25 units of 3-jar Heritage Trio gift boxes for corporate festival gifting in Kochi.',
    status: 'Contacted',
    admin_notes: 'Sent PDF brochure and bulk rate list on WhatsApp.',
    created_at: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    id: 'enq-003',
    full_name: 'Chef George Thomas',
    phone: '+91 97455 88990',
    email: 'george.t@malabarheritage.in',
    subject: 'Restaurant & Catering Supply',
    message: 'Interested in regular 10kg monthly dispatch of Coastal Prawn Pickle for our boutique restaurant.',
    status: 'In Progress',
    admin_notes: 'Sample jars dispatched via courier on Monday.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

function getLocalFallback(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function setLocalFallback(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// AUTHENTICATION APIs (joel@123 / Admin@123)
// -----------------------------------------------------------------------------
export async function signInAdmin(identifier, password) {
  const cleanId = (identifier || '').trim();

  // Designated Administrator credentials: joel@123 / Admin@123
  if (
    cleanId.toLowerCase() === 'joel@123' ||
    cleanId.toLowerCase() === 'joel@123.com' ||
    cleanId.toLowerCase() === 'joel'
  ) {
    if (password === 'Admin@123') {
      const adminUser = {
        id: 'admin-joel-123',
        email: 'joel@123',
        username: 'joel@123',
        name: 'Joel',
        role: 'authenticated',
        created_at: new Date().toISOString()
      };
      setLocalFallback(STORAGE_AUTH, adminUser);
      try {
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return adminUser;
    } else {
      throw new Error('Incorrect password for joel@123. Please check and try again.');
    }
  }

  if (isConfigured) {
    const emailToUse = cleanId.includes('@') && cleanId.includes('.') ? cleanId : `${cleanId}@acharandco.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password
    });
    if (error) throw error;
    return data.user;
  } else {
    if (password.length >= 6) {
      const mockUser = {
        id: 'mock-admin-id-achar',
        email: cleanId,
        username: cleanId,
        role: 'authenticated',
        created_at: new Date().toISOString()
      };
      setLocalFallback(STORAGE_AUTH, mockUser);
      try {
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return mockUser;
    } else {
      throw new Error('Password must be at least 6 characters.');
    }
  }
}

export async function signOutAdmin() {
  if (isConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
  localStorage.removeItem(STORAGE_AUTH);
  try {
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
}

export async function getCurrentAdmin() {
  const localUser = getLocalFallback(STORAGE_AUTH, null);
  if (localUser) return localUser;

  if (isConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function resetPassword(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (isConfigured) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`
    });
    if (error) throw error;
  }
  return true;
}

export function onAuthStateChange(callback) {
  const checkAndNotify = () => {
    const localUser = getLocalFallback(STORAGE_AUTH, null);
    if (localUser) {
      callback(localUser);
      return;
    }
    if (isConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        callback(session?.user || null);
      }).catch(() => callback(null));
    } else {
      callback(null);
    }
  };

  if (isConfigured) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const localUser = getLocalFallback(STORAGE_AUTH, null);
      callback(localUser || session?.user || null);
    });
    window.addEventListener('storage', checkAndNotify);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', checkAndNotify);
    };
  } else {
    checkAndNotify();
    window.addEventListener('storage', checkAndNotify);
    return () => window.removeEventListener('storage', checkAndNotify);
  }
}

// -----------------------------------------------------------------------------
// ENQUIRIES APIs (Preserved)
// -----------------------------------------------------------------------------
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
    const list = getLocalFallback(STORAGE_ENQUIRIES, DEFAULT_ENQUIRIES);
    const newRecord = {
      id: 'enq-' + Date.now(),
      ...payload,
      admin_notes: '',
      created_at: new Date().toISOString()
    };
    list.unshift(newRecord);
    setLocalFallback(STORAGE_ENQUIRIES, list);
    return newRecord;
  }
}

export async function fetchEnquiries({ status = 'All', search = '', sortBy = 'newest' } = {}) {
  if (isConfigured) {
    let query = supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: sortBy === 'oldest' });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`full_name.ilike.${term},phone.ilike.${term},email.ilike.${term},message.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } else {
    let list = getLocalFallback(STORAGE_ENQUIRIES, DEFAULT_ENQUIRIES);
    if (status && status !== 'All') {
      list = list.filter(e => e.status === status);
    }
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(e => 
        (e.full_name || '').toLowerCase().includes(term) ||
        (e.phone || '').toLowerCase().includes(term) ||
        (e.email || '').toLowerCase().includes(term) ||
        (e.message || '').toLowerCase().includes(term)
      );
    }
    list.sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return sortBy === 'oldest' ? tA - tB : tB - tA;
    });
    return list;
  }
}

export async function updateEnquiryStatus(id, newStatus) {
  if (isConfigured) {
    const { error } = await supabase
      .from('enquiries')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } else {
    const list = getLocalFallback(STORAGE_ENQUIRIES, DEFAULT_ENQUIRIES);
    const item = list.find(e => e.id === id);
    if (item) {
      item.status = newStatus;
      item.updated_at = new Date().toISOString();
      setLocalFallback(STORAGE_ENQUIRIES, list);
    }
  }
  return true;
}

export async function updateEnquiryNotes(id, adminNotes) {
  if (isConfigured) {
    const { error } = await supabase
      .from('enquiries')
      .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } else {
    const list = getLocalFallback(STORAGE_ENQUIRIES, DEFAULT_ENQUIRIES);
    const item = list.find(e => e.id === id);
    if (item) {
      item.admin_notes = adminNotes;
      item.updated_at = new Date().toISOString();
      setLocalFallback(STORAGE_ENQUIRIES, list);
    }
  }
  return true;
}

export async function deleteEnquiry(id) {
  if (isConfigured) {
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    let list = getLocalFallback(STORAGE_ENQUIRIES, DEFAULT_ENQUIRIES);
    list = list.filter(e => e.id !== id);
    setLocalFallback(STORAGE_ENQUIRIES, list);
  }
  return true;
}

// -----------------------------------------------------------------------------
// PRODUCT CATEGORIES APIs
// -----------------------------------------------------------------------------
export async function fetchProductCategories() {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  } else {
    return getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
  }
}

export async function createProductCategory({ name, image_url = null }) {
  const cleanName = (name || '').trim();
  if (!cleanName) throw new Error('Category name is required.');
  const slug = cleanName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

  if (isConfigured) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert([{ name: cleanName, slug, image_url }])
      .select();
    if (error) throw error;
    return data?.[0];
  } else {
    const list = getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    const newCat = {
      id: 'cat-' + Date.now(),
      name: cleanName,
      slug,
      image_url,
      created_at: new Date().toISOString()
    };
    list.push(newCat);
    setLocalFallback(STORAGE_CATEGORIES, list);
    return newCat;
  }
}

export async function updateProductCategory(id, { name, image_url }) {
  const cleanName = (name || '').trim();
  const slug = cleanName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

  if (isConfigured) {
    const { data, error } = await supabase
      .from('product_categories')
      .update({ name: cleanName, slug, image_url })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  } else {
    const list = getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], name: cleanName, slug, image_url };
      setLocalFallback(STORAGE_CATEGORIES, list);
      return list[idx];
    }
    throw new Error('Category not found.');
  }
}

export async function deleteProductCategory(id) {
  // Check if any product depends on this category
  const products = await fetchProducts({ categoryId: id });
  if (products.length > 0) {
    throw new Error(`Cannot delete this category because ${products.length} product(s) are assigned to it. Please reassign or delete them first.`);
  }

  if (isConfigured) {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    let list = getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    list = list.filter(c => c.id !== id);
    setLocalFallback(STORAGE_CATEGORIES, list);
  }
  return true;
}

// -----------------------------------------------------------------------------
// PRODUCT MANAGEMENT APIs
// -----------------------------------------------------------------------------
export async function fetchProducts({ 
  status = 'All', 
  availability = 'All', 
  categoryId = 'All', 
  search = '', 
  sortBy = 'newest' 
} = {}) {
  if (isConfigured) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name, slug),
        product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .order('created_at', { ascending: sortBy === 'oldest' });

    if (status && status !== 'All') {
      query = query.eq('product_status', status);
    }
    if (availability && availability !== 'All') {
      query = query.eq('availability_status', availability);
    }
    if (categoryId && categoryId !== 'All') {
      query = query.eq('category_id', categoryId);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},short_description.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Format products for standard UI consumption
    return (data || []).map(p => {
      const images = (p.product_images || []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order);
      const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800';
      return {
        ...p,
        category_name: p.product_categories?.name || 'Uncategorized',
        primary_image: primaryImage,
        images: images.length ? images : [{ image_url: primaryImage, is_primary: true }]
      };
    });
  } else {
    // Local fallback store
    let list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    const categories = getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);

    if (status && status !== 'All') {
      list = list.filter(p => p.product_status === status);
    }
    if (availability && availability !== 'All') {
      list = list.filter(p => p.availability_status === availability);
    }
    if (categoryId && categoryId !== 'All') {
      list = list.filter(p => p.category_id === categoryId);
    }
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.short_description || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.ingredients || '').toLowerCase().includes(term)
      );
    }

    list = list.map(p => {
      const cat = categories.find(c => c.id === p.category_id);
      const primary = p.images?.find(i => i.is_primary)?.image_url || p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800';
      return {
        ...p,
        category_name: cat ? cat.name : (p.category_name || 'Uncategorized'),
        primary_image: primary
      };
    });

    list.sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return sortBy === 'oldest' ? tA - tB : tB - tA;
    });

    return list;
  }
}

export async function fetchProductById(id) {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name, slug),
        product_images(id, image_url, storage_path, alt_text, display_order, is_primary)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const images = (data.product_images || []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order);
    return {
      ...data,
      category_name: data.product_categories?.name || 'Uncategorized',
      primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url || '',
      images
    };
  } else {
    const list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    const found = list.find(p => p.id === id);
    if (!found) return null;
    const categories = getLocalFallback(STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    const cat = categories.find(c => c.id === found.category_id);
    return {
      ...found,
      category_name: cat ? cat.name : (found.category_name || 'Uncategorized'),
      primary_image: found.images?.find(i => i.is_primary)?.image_url || found.images?.[0]?.image_url || ''
    };
  }
}

export async function fetchProductBySlug(slug) {
  if (isConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name, slug),
        product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const images = (data.product_images || []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order);
    return {
      ...data,
      category_name: data.product_categories?.name || 'Uncategorized',
      primary_image: images.find(img => img.is_primary)?.image_url || images[0]?.image_url || '',
      images
    };
  } else {
    const list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    const found = list.find(p => p.slug === slug);
    if (!found) return null;
    return {
      ...found,
      primary_image: found.images?.find(i => i.is_primary)?.image_url || found.images?.[0]?.image_url || ''
    };
  }
}

export async function createProduct(productData) {
  const {
    name,
    slug,
    short_description,
    description,
    category_id,
    regular_price,
    discount_price,
    pack_size,
    ingredients,
    flavour_profile,
    storage_instructions,
    shelf_life,
    allergen_information,
    weight,
    availability_status,
    product_status,
    is_featured,
    images = []
  } = productData;

  const generatedSlug = (slug || name)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const payload = {
    name: name.trim(),
    slug: generatedSlug,
    short_description: short_description?.trim() || '',
    description: description || '',
    category_id: category_id || null,
    regular_price: Number(regular_price) || 0,
    discount_price: discount_price ? Number(discount_price) : null,
    pack_size: pack_size || '250g',
    ingredients: ingredients || '',
    flavour_profile: flavour_profile || '',
    storage_instructions: storage_instructions || '',
    shelf_life: shelf_life || '',
    allergen_information: allergen_information || '',
    weight: weight || pack_size || '250g',
    availability_status: availability_status || 'In Stock',
    product_status: product_status || 'Active',
    is_featured: Boolean(is_featured)
  };

  if (isConfigured) {
    const { data: newProd, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Insert associated images if any
    if (images.length > 0) {
      const imageRecords = images.map((img, idx) => ({
        product_id: newProd.id,
        image_url: img.image_url,
        storage_path: img.storage_path || null,
        alt_text: img.alt_text || `${newProd.name} image ${idx + 1}`,
        display_order: idx,
        is_primary: Boolean(img.is_primary ?? idx === 0)
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    return newProd;
  } else {
    const list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    const newId = 'prod-' + Date.now();
    const formattedImages = images.map((img, idx) => ({
      id: 'img-' + Date.now() + '-' + idx,
      product_id: newId,
      image_url: img.image_url,
      alt_text: img.alt_text || name,
      display_order: idx,
      is_primary: Boolean(img.is_primary ?? idx === 0)
    }));

    const newRecord = {
      id: newId,
      ...payload,
      images: formattedImages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    list.unshift(newRecord);
    setLocalFallback(STORAGE_PRODUCTS, list);
    return newRecord;
  }
}

export async function updateProduct(id, productData) {
  const {
    name,
    slug,
    short_description,
    description,
    category_id,
    regular_price,
    discount_price,
    pack_size,
    ingredients,
    flavour_profile,
    storage_instructions,
    shelf_life,
    allergen_information,
    weight,
    availability_status,
    product_status,
    is_featured,
    images
  } = productData;

  const payload = {
    updated_at: new Date().toISOString()
  };

  if (name !== undefined) payload.name = name.trim();
  if (slug !== undefined) payload.slug = slug.toLowerCase().replace(/[^\w-]/g, '');
  if (short_description !== undefined) payload.short_description = short_description;
  if (description !== undefined) payload.description = description;
  if (category_id !== undefined) payload.category_id = category_id;
  if (regular_price !== undefined) payload.regular_price = Number(regular_price);
  if (discount_price !== undefined) payload.discount_price = discount_price ? Number(discount_price) : null;
  if (pack_size !== undefined) payload.pack_size = pack_size;
  if (ingredients !== undefined) payload.ingredients = ingredients;
  if (flavour_profile !== undefined) payload.flavour_profile = flavour_profile;
  if (storage_instructions !== undefined) payload.storage_instructions = storage_instructions;
  if (shelf_life !== undefined) payload.shelf_life = shelf_life;
  if (allergen_information !== undefined) payload.allergen_information = allergen_information;
  if (weight !== undefined) payload.weight = weight;
  if (availability_status !== undefined) payload.availability_status = availability_status;
  if (product_status !== undefined) payload.product_status = product_status;
  if (is_featured !== undefined) payload.is_featured = Boolean(is_featured);

  if (isConfigured) {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If new image array provided, replace/sync product images
    if (images && Array.isArray(images)) {
      await supabase.from('product_images').delete().eq('product_id', id);
      if (images.length > 0) {
        const imageRecords = images.map((img, idx) => ({
          product_id: id,
          image_url: img.image_url,
          storage_path: img.storage_path || null,
          alt_text: img.alt_text || `${data.name} image ${idx + 1}`,
          display_order: idx,
          is_primary: Boolean(img.is_primary ?? idx === 0)
        }));
        await supabase.from('product_images').insert(imageRecords);
      }
    }

    return data;
  } else {
    const list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      const existing = list[index];
      const updatedImages = images !== undefined ? images : existing.images;
      list[index] = {
        ...existing,
        ...payload,
        images: updatedImages
      };
      setLocalFallback(STORAGE_PRODUCTS, list);
      return list[index];
    }
    throw new Error('Product not found.');
  }
}

export async function deleteProduct(id) {
  if (isConfigured) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    let list = getLocalFallback(STORAGE_PRODUCTS, DEFAULT_PRODUCTS);
    list = list.filter(p => p.id !== id);
    setLocalFallback(STORAGE_PRODUCTS, list);
  }
  return true;
}

// -----------------------------------------------------------------------------
// PRODUCT STORAGE (Multi-Image Upload to product-images Bucket)
// -----------------------------------------------------------------------------
export async function uploadProductImage(file) {
  if (!file) throw new Error('No image file selected.');

  // Validate file types: JPG, JPEG, PNG, WebP
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, and WebP.');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit. Please upload a smaller file.');
  }

  const ext = file.name.split('.').pop();
  const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  if (isConfigured) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return {
      image_url: publicUrlData.publicUrl,
      storage_path: data.path
    };
  } else {
    // Data URL fallback for local offline testing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        image_url: reader.result,
        storage_path: fileName
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
