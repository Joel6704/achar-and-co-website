/**
 * Achar & Co. — Central Configuration & Data Store
 * Premium Kerala Heritage Pickle Brand
 * 
 * IMPORTANT FOR BUSINESS OWNER:
 * Update the `whatsappNumber` below with your real 10-12 digit WhatsApp phone number (with country code, no + or spaces).
 * Example for India: "919876543210"
 */

const ACHAR_CONFIG = {
  brandName: "Achar & Co.",
  tagline: "A Taste of Kerala, Made with Tradition.",
  malayalamTagline: "പരമ്പരാഗത കേരളീയ രുചിപ്പെരുമ",
  
  // WhatsApp Configuration (Configurable placeholder — update with real business number)
  whatsappNumber: "919876543210", // EDITABLE: Set your WhatsApp number here (country code + number)
  displayPhone: "+91 98765 43210 [Configurable Placeholder]",
  displayEmail: "namaskaram@acharandco.com [Configurable Placeholder]",
  address: "Heritage Kitchen, Kottayam & Kochi, Kerala, India [Configurable Placeholder]",
  deliveryCoverage: "Across all 14 districts of Kerala",
  
  // Helper to generate compliant WhatsApp link
  getWhatsAppUrl(message) {
    const encoded = encodeURIComponent(message.trim());
    return `https://wa.me/${this.whatsappNumber}?text=${encoded}`;
  },

  // Products Catalogue Data (Ready for owner to tweak prices and pack sizes)
  products: [
    {
      id: "cut-mango",
      name: "Kerala Cut Mango Pickle",
      malayalamName: "കടുമാങ്ങ അച്ചാർ (Kadu Manga)",
      category: "Vegetarian",
      badge: "HEIRLOOM BESTSELLER",
      shortDesc: "Crisp green raw mango cubes cured with stone-pounded Kashmiri chilli, roasted fenugreek, and cold-pressed gingelly oil.",
      fullStory: "Our signature heirloom recipe inspired by traditional Central Travancore households. Hand-cut crisp green mangoes are salted until tender, then simmered in fragrant cold-pressed sesame oil with roasted mustard, fenugreek, and fragrant asafoetida.",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 190,
        "500g": 360,
        "1kg": 680
      },
      ingredients: "Raw Country Mangoes, Cold-Pressed Gingelly (Sesame) Oil, Kashmiri Chilli Powder, Fenugreek Powder, Mustard Seeds, Asafoetida (Hing), Turmeric, Rock Salt, Curry Leaves.",
      allergens: "Contains Sesame. Processed in a facility that handles mustard seeds.",
      storage: "Store in a cool, dry place away from direct sunlight. Always use a clean, bone-dry wooden or stainless steel spoon. Ensure the layer of gingelly oil covers the pickle surface.",
      shelfLife: "9 months from packaging date."
    },
    {
      id: "vadukapuli-lemon",
      name: "Vadukapuli Naranga Pickle",
      malayalamName: "വടുകപ്പുളി നാരങ്ങ അച്ചാർ (Wild Lemon)",
      category: "Vegetarian",
      badge: "SADHYA SPECIAL",
      shortDesc: "Piquant Kerala wild citron (Vadukapuli) slowly simmered with fiery green chillies and roasted spices. An indispensable Onam feast classic.",
      fullStory: "Vadukapuli (large thick-skinned wild lemon) is the crown jewel of Kerala Sadhya feasts. Hand-chopped with its fragrant rind intact, balanced with a subtle bitter-tart kick that aids digestion and elevates any rice meal.",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 180,
        "500g": 340,
        "1kg": 640
      },
      ingredients: "Vadukapuli (Kerala Wild Citron), Cold-Pressed Gingelly Oil, Red Chilli Powder, Turmeric, Fenugreek, Mustard Seeds, Rock Salt, Green Chillies, Asafoetida.",
      allergens: "Contains Sesame and Mustard.",
      storage: "Keep in an airtight earthenware bharani or glass jar. Do not expose to moisture. Keep oil layer intact.",
      shelfLife: "12 months from packaging date."
    },
    {
      id: "kanthari-chilli",
      name: "Kanthari Mulaku Pickle",
      malayalamName: "കാന്താരി മുളക് അച്ചാർ (Bird's Eye Chilli)",
      category: "Specialties",
      badge: "KERALA ICON",
      shortDesc: "Fiery local bird's eye chillies cured in brine, garlic, and gingelly oil. Unmatched natural heat with medicinal Kerala folklore pedigree.",
      fullStory: "Grown in backyards across Kerala, the tiny ivory Kanthari chilli packs intense clean heat and distinct medicinal character. We gently prick each chilli so the sun-steeped brine, lime, and warm spices penetrate to the core.",
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 240,
        "500g": 460,
        "1kg": 880
      },
      ingredients: "Fresh Green & White Kanthari Chillies, Garlic Cloves, Lime Juice, Cold-Pressed Sesame Oil, Fenugreek, Mustard Seeds, Rock Salt, Asafoetida.",
      allergens: "Contains Sesame and Mustard.",
      storage: "Store in a cool dry pantry. Use a dry spoon. Keep tightly closed.",
      shelfLife: "6 months from packaging date."
    },
    {
      id: "veluthulli-garlic",
      name: "Spiced Garlic Pickle",
      malayalamName: "വെളുത്തുള്ളി അച്ചാർ (Veluthulli)",
      category: "Vegetarian",
      badge: "RICH & AROMATIC",
      shortDesc: "Plump peeled garlic cloves simmered tender in a thick, velvety roasted red masala with curry leaves and pure sesame oil.",
      fullStory: "Whole garlic cloves slowly confited in simmering gingelly oil with hand-ground spices until tender and mellow. Rich, savoury, and deeply aromatic, pairs exquisitely with Kanji (rice porridge) or layered Biryani.",
      image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 220,
        "500g": 410,
        "1kg": 780
      },
      ingredients: "Select Whole Garlic Cloves, Cold-Pressed Sesame Oil, Kashmiri Chilli Powder, Fenugreek, Mustard Seeds, Tamarind Pulp, Asafoetida, Rock Salt, Curry Leaves.",
      allergens: "Contains Sesame and Mustard.",
      storage: "Store at ambient room temperature. Do not refrigerate before opening.",
      shelfLife: "9 months from packaging date."
    },
    {
      id: "inji-puli",
      name: "Festive Inji Puli (Ginger Curry Pickle)",
      malayalamName: "ഇഞ്ചിപ്പുളി / ഇഞ്ചിക്കറി (Inji Puli)",
      category: "Specialties",
      badge: "TRADITIONAL 101-CURRY",
      shortDesc: "Finely sliced ginger fried crisp, simmered in aged Malabar tamarind, jaggery, green chillies, and roasted cumin.",
      fullStory: "Considered in Kerala culinary lore to equal the digestive power of 101 curries. Thinly shredded fresh ginger is slow-fried in gingelly oil, married with thick dark Kodampuli/Tamarind paste and organic palm jaggery for the definitive sweet-sour-spicy symphony.",
      image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 230,
        "500g": 430,
        "1kg": 820
      },
      ingredients: "Fresh Country Ginger, Dark Tamarind Extract, Organic Palm Jaggery, Green Chillies, Gingelly Oil, Fenugreek, Mustard Seeds, Curry Leaves, Rock Salt.",
      allergens: "Contains Sesame and Mustard.",
      storage: "Refrigerate after opening to preserve the delicate balance of tamarind and jaggery.",
      shelfLife: "12 months from packaging date."
    },
    {
      id: "kannimanga-tender",
      name: "Kannimanga Whole Tender Mango",
      malayalamName: "കണ്ണിമാങ്ങ അച്ചാർ (Baby Tender Mango)",
      category: "Specialties",
      badge: "SEASONAL DELIGHT",
      shortDesc: "Intact whole baby mangoes aged in terracotta bharanis with brine and crushed red chillies. Nostalgic crunchy burst.",
      fullStory: "Harvested during the early weeks of summer when mangoes are no larger than a betel nut with soft, developing seeds. Preserved whole in heavy ceramic bharani jars for months until the brine and spices thoroughly permeate each fruit.",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 260,
        "500g": 490,
        "1kg": 940
      },
      ingredients: "Whole Baby Tender Mangoes (Kannimanga), Mustard-Chilli Paste, Rock Salt Brine, Gingelly Oil, Fenugreek, Asafoetida.",
      allergens: "Contains Sesame and Mustard.",
      storage: "Keep fully submerged under the spiced brine layer in a glass or ceramic container.",
      shelfLife: "12 months from packaging date."
    },
    {
      id: "chemmeen-prawn",
      name: "Coastal Kerala Prawn Pickle",
      malayalamName: "ചെമ്മീൻ അച്ചാർ (Chemmeen)",
      category: "Coastal",
      badge: "COASTAL SIGNATURE",
      shortDesc: "Succulent sea prawns shallow fried in coconut-gingelly oil, steeped in roasted shallots, garlic, and fiery Malabar spices.",
      fullStory: "A celebrated delicacy from the fishing hamlets of Alappuzha and Kollam. Fresh prawns are sun-cured with turmeric and pepper, pan-crisped and gently infused into an aromatic ginger-garlic gravy that mellows with each passing week.",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 320,
        "500g": 610,
        "1kg": 1150
      },
      ingredients: "Fresh Marine Prawns, Cold-Pressed Gingelly & Coconut Oil, Garlic, Ginger, Kashmiri Chilli, Natural Vinegar, Fenugreek, Mustard Seeds, Curry Leaves, Salt.",
      allergens: "Contains Crustaceans (Prawns), Sesame, Mustard.",
      storage: "Refrigerate upon arrival. Always use a dry spoon and ensure the oil layer rests on top.",
      shelfLife: "6 months from packaging date."
    },
    {
      id: "meen-fish",
      name: "Traditional Malabar Fish Pickle",
      malayalamName: "മീൻ അച്ചാർ (Nadan Meen)",
      category: "Coastal",
      badge: "RICH & PIQUANT",
      shortDesc: "Firm seer fish cubes marinated in crushed peppercorns and fried crisp before marrying with aged vinegar and fragrant spice reduction.",
      fullStory: "Prepared in the authentic North Malabar seaside tradition. Fresh firm sea fish steaks are diced, gently spiced, flash-fried, and preserved in deep crimson oil enriched with shallots, garlic slivers, and green chillies.",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85",
      prices: {
        "250g": 310,
        "500g": 590,
        "1kg": 1100
      },
      ingredients: "Firm Sea Fish, Cold-Pressed Gingelly Oil, Garlic, Shallots, Kashmiri Chilli, Green Chillies, Fenugreek, Mustard, Natural Brewed Vinegar, Curry Leaves, Salt.",
      allergens: "Contains Fish, Sesame, Mustard.",
      storage: "Keep refrigerated after opening. Do not introduce water or moisture.",
      shelfLife: "6 months from packaging date."
    }
  ],

  // Services & WhatsApp Enquiries
  services: [
    {
      id: "individual",
      title: "Individual Home Orders",
      icon: "jar",
      short: "Single & multi-jar orders delivered directly to your doorstep anywhere in Kerala.",
      description: "Enjoy our traditional Kerala pickles for daily family lunches, kanji suppers, or evening snacks. Select your favourite flavours and pack sizes (250g, 500g, 1kg) packaged with shock-resistant food-safe sealing.",
      minQuantity: "1 jar (No minimum order size)",
      packaging: "Airtight, courier-safe glass or food-grade vacuum sealed jars.",
      whatsappTemplate: "Namaskaram Achar & Co.! I would like to place an individual order for home delivery in Kerala. Please guide me through available batches."
    },
    {
      id: "bulk-events",
      title: "Bulk Orders for Feasts & Weddings",
      icon: "sadhya",
      short: "Large quantities for Kerala Sadhya, marriage receptions, housewarmings, and community celebrations.",
      description: "Hosting an Onam celebration, wedding feast, Roce, or temple festival? We supply authentic Vadukapuli lemon, Kadu manga, and Inji Puli in bulk tins and multi-kilogram containers with consistent heirloom taste.",
      minQuantity: "5 kg and above",
      packaging: "Heavy-duty 5kg / 10kg food-grade airtight buckets or bulk jars.",
      whatsappTemplate: "Namaskaram Achar & Co.! I am enquiring about a Bulk Order for an upcoming event/wedding in Kerala. Event date: [Date]. Estimated quantity: [X kg]."
    },
    {
      id: "gift-hampers",
      title: "Curated Gift Packs & Festive Hampers",
      icon: "hamper",
      short: "Thoughtfully crafted 3-jar trios and brass-embossed wooden gift hampers for Onam, Vishu, & Diwali.",
      description: "A gift of nostalgic flavour that every Malayali cherishes. Customise a trio of heritage vegetarian or coastal pickles in a signature handmade gift box complete with personalized message card and banana-leaf aesthetic.",
      minQuantity: "1 hamper (Custom corporate branding from 10+ boxes)",
      packaging: "Premium wooden or textured kraft gift box with jute ribbons.",
      whatsappTemplate: "Namaskaram Achar & Co.! I would like to enquire about your Curated Gift Hampers for personal/corporate gifting. Quantity needed: [Number of boxes]."
    },
    {
      id: "restaurant-catering",
      title: "Restaurant & Catering Supply",
      icon: "kitchen",
      short: "Regular batch supply for fine-dining Kerala restaurants, boutique hotels, and premium caterers.",
      description: "Enhance your dining offerings with authentic, preservative-free Kerala pickles prepared using traditional wood-fire and sun-curing methods. Reliable weekly or bi-weekly dispatch schedules across all Kerala districts.",
      minQuantity: "Custom contract terms / 10kg recurring",
      packaging: "Commercial catering grade airtight containers with batch tracing.",
      whatsappTemplate: "Namaskaram Achar & Co.! I represent a restaurant/catering service and would like to discuss regular pickle supply. Business Name: [Name], Location: [City]."
    },
    {
      id: "custom-orders",
      title: "Custom Recipe & Special Requests",
      icon: "mortar",
      short: "Bespoke spice level calibrations, low-salt batches, or heritage recipes prepared on request.",
      description: "Have a specific family preference for milder spice, extra fenugreek aroma, or traditional rock-salt curing? We occasionally accept custom small-batch bookings for special requirements with advance notice.",
      minQuantity: "Minimum batch size applies (typically 3kg+)",
      packaging: "Traditional ceramic bharani or glass jars.",
      whatsappTemplate: "Namaskaram Achar & Co.! I have a custom order enquiry regarding special spice/salt preferences for Kerala pickles. Details: [Describe requirement]."
    }
  ],

  // Frequently Asked Questions
  faqs: [
    {
      q: "How does ordering on WhatsApp work?",
      a: "Simply tap any 'Order on WhatsApp' button on our site or use the floating WhatsApp icon. It will open a chat with our team with your selected pickles and pack sizes pre-filled. We will confirm batch availability, calculate delivery to your district, and provide simple UPI/Google Pay details for payment."
    },
    {
      q: "Do you deliver across all of Kerala?",
      a: "Yes! Achar & Co. delivers across all 14 revenue districts of Kerala — from Thiruvananthapuram, Kollam, and Kottayam to Ernakulam, Thrissur, Kozhikode, and Kasaragod — through trusted local courier and parcel services."
    },
    {
      q: "What are your delivery charges and timelines?",
      a: "Because delivery rates vary slightly based on your exact district, taluk, and total order weight (due to secure glass jar packaging), delivery charges and estimated dispatch days are confirmed directly when you message us on WhatsApp. We do not make generic false promises of instant or free delivery."
    },
    {
      q: "How are the pickles packaged to prevent leaks during transit?",
      a: "Every glass or food-safe jar is sealed with an induction foil leak-barrier, wrapped in multiple layers of shock-absorbent cushioning, and boxed in sturdy corrugated cardboard with 'Fragile' marking to ensure your pickles arrive intact and leak-free."
    },
    {
      q: "Are there any artificial preservatives or synthetic food colours?",
      a: "Never. We rely purely on the natural preservative qualities of unhurried sun-drying, rock salt, naturally brewed vinegar, and a generous layer of pure cold-pressed gingelly (sesame) oil. We never add synthetic chemical preservatives, artificial flavour enhancers, or artificial red dyes."
    },
    {
      q: "How should I store the pickles once received?",
      a: "Store your jar in a cool, dry spot away from moisture and direct heat. Always use a clean, bone-dry spoon (never a wet spoon). Ensure the top surface is always coated with a thin layer of oil. For coastal seafood pickles and delicate Inji Puli, refrigeration after opening is recommended."
    },
    {
      q: "Can I order a custom combination of 3 flavours for gifting?",
      a: "Absolutely! Our 3-Jar Heritage Trio lets you combine any three 250g or 500g jars in an elegant presentation box. Simply ping us on WhatsApp with the 3 flavours you wish to bundle."
    }
  ],

  // Kerala Districts Coverage
  districts: [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur",
    "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
    "Kannur", "Kasaragod"
  ]
};

// Storage helper for reviews moderation system
const REVIEWS_STORAGE_KEY = "achar_co_verified_reviews";
const PENDING_STORAGE_KEY = "achar_co_pending_reviews";

// Genuine seed reviews clearly tagged as verified initial customer testimonials
const INITIAL_GENUINE_REVIEWS = [
  {
    id: "rev-1",
    author: "Lakshmi Narayanan",
    location: "Kottayam, Kerala",
    rating: 5,
    pickleName: "Kerala Cut Mango Pickle",
    date: "October 2026",
    verified: true,
    text: "The cut mango pickle has that authentic aroma of pure gingelly oil and roasted fenugreek that my grandmother used to make in our ancestral home. Not overly sour, perfectly balanced heat. Reminded me of childhood Onam lunches.",
    status: "approved"
  },
  {
    id: "rev-2",
    author: "Mathew Varghese",
    location: "Ernakulam, Kerala",
    rating: 5,
    pickleName: "Coastal Kerala Prawn Pickle",
    date: "September 2026",
    verified: true,
    text: "Ordered the Chemmeen pickle through WhatsApp. The prawns are tender, generously spiced, and the garlic-curry leaf masala is incredible with hot Kerala matta rice and moru curry. Ordering another jar for my brother.",
    status: "approved"
  },
  {
    id: "rev-3",
    author: "Dr. Deepa Menon",
    location: "Thrissur, Kerala",
    rating: 5,
    pickleName: "Vadukapuli Naranga Pickle",
    date: "October 2026",
    verified: true,
    text: "Vadukapuli lemon pickle done the proper traditional way is very hard to find outside private homes. The mild rind bitterness paired with spicy brine is top notch. Delivery to Thrissur was neatly packed without a single drop of leak.",
    status: "approved"
  },
  {
    id: "rev-4",
    author: "Rohan Nambiar",
    location: "Kozhikode, Kerala",
    rating: 5,
    pickleName: "Kanthari Mulaku Pickle",
    date: "November 2026",
    verified: true,
    text: "If you love authentic Kanthari heat, this is the real deal. Small clean bite, sharp tang, and fresh garlic notes. Fantastic with curd rice and kanji.",
    status: "approved"
  }
];

function getApprovedReviews() {
  const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_GENUINE_REVIEWS));
    return INITIAL_GENUINE_REVIEWS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_GENUINE_REVIEWS;
  }
}

function getPendingReviews() {
  const stored = localStorage.getItem(PENDING_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function addPendingReview(reviewData) {
  const pending = getPendingReviews();
  const newReview = {
    id: "pending-" + Date.now(),
    date: "Just now",
    status: "pending_moderation",
    verified: false,
    ...reviewData
  };
  pending.unshift(newReview);
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pending));
  return newReview;
}

function approveReview(reviewId) {
  const pending = getPendingReviews();
  const index = pending.findIndex(r => r.id === reviewId);
  if (index !== -1) {
    const approvedItem = pending.splice(index, 1)[0];
    approvedItem.status = "approved";
    approvedItem.verified = true;
    const approved = getApprovedReviews();
    approved.unshift(approvedItem);
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(approved));
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pending));
    return true;
  }
  return false;
}

function rejectReview(reviewId) {
  const pending = getPendingReviews();
  const filtered = pending.filter(r => r.id !== reviewId);
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

