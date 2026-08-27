/* ==========================================================================
   MIRCHI PURE - SEED DATASTORE
   Products, Recipes, Process Steps, Reviews, Initial Orders & Coupons
   ========================================================================== */

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Premium Mirchi Powder",
    category: "Classic",
    badge: "Bestseller",
    spiceLevel: 3, // out of 5
    spiceText: "Medium Hot (Balanced)",
    rating: 4.9,
    reviewsCount: 142,
    image: "assets/images/hero_chilli_pack.jpg",
    description: "Our signature blend of handpicked Guntur and Byadgi red chillies. Perfectly balanced in fiery spice and rich natural red hue for everyday household cooking.",
    whyYouLoveIt: [
      "Rich deep natural red colour",
      "Pungent authentic aroma",
      "Balanced medium-hot flavour profile",
      "Freshly prepared in small batches",
      "Triple-sealed nitrogen freshness pouch"
    ],
    ingredients: "100% Selected Red Chillies (Guntur & Byadgi Variety)",
    prepProcess: "Handpicked dried red chillies, sun-dried on hygienic mats, stem-removed, cold-ground to preserve essential spice oils.",
    packaging: "Resealable aroma-lock food-grade pouch.",
    storage: "Store in a cool, dry place away from direct sunlight. Transfer to an airtight glass or ceramic container after opening.",
    shelfLife: "12 Months from date of packaging.",
    variants: [
      { weight: "100g", price: 65, originalPrice: 75, stock: 120 },
      { weight: "250g", price: 150, originalPrice: 175, stock: 95 },
      { weight: "500g", price: 285, originalPrice: 330, stock: 60 },
      { weight: "1kg", price: 540, originalPrice: 620, stock: 30 }
    ],
    defaultVariantIndex: 1
  },
  {
    id: "prod-2",
    name: "Spicy Mirchi Powder",
    category: "Fiery Hot",
    badge: "Extra Hot",
    spiceLevel: 5,
    spiceText: "Fiery Hot (Teja Chilli)",
    rating: 4.8,
    reviewsCount: 98,
    image: "assets/images/chilli_raw_powder.jpg",
    description: "Crafted exclusively from premium S17 Teja red chillies known for their intense pungency. Ideal for lovers of authentic, fiery hot Indian curries.",
    whyYouLoveIt: [
      "Fiery heat for bold spice lovers",
      "100% pure Teja chilli variety",
      "Authentic spicy kick without artificial additives",
      "Freshly milled in hygienic stainless mills",
      "Long-lasting pungent kick"
    ],
    ingredients: "100% Selected S17 Teja Red Chillies",
    prepProcess: "Selected high-heat chillies, destemmed by hand, slowly ground to protect capsaicin content.",
    packaging: "Heavy-duty aroma barrier foil pack.",
    storage: "Keep in a cool, dry container. Seal tightly after each use.",
    shelfLife: "12 Months from packaging.",
    variants: [
      { weight: "100g", price: 70, originalPrice: 85, stock: 110 },
      { weight: "250g", price: 165, originalPrice: 190, stock: 80 },
      { weight: "500g", price: 310, originalPrice: 360, stock: 45 },
      { weight: "1kg", price: 590, originalPrice: 675, stock: 25 }
    ],
    defaultVariantIndex: 1
  },
  {
    id: "prod-3",
    name: "Premium Colour Mirchi Powder",
    category: "High Colour",
    badge: "Vibrant Hue",
    spiceLevel: 2,
    spiceText: "Mild & Aromatic",
    rating: 4.9,
    reviewsCount: 116,
    image: "assets/images/chilli_curry_dish.jpg",
    description: "Made from select Kashmiri and Byadgi red chillies. Gives your gravies, biryanis, and tandoori dishes an exquisite natural ruby-red colour with gentle warmth.",
    whyYouLoveIt: [
      "Vibrant ruby red colour for restaurant-style gravies",
      "Gentle warming spice suitable for children and families",
      "Rich in natural pigments",
      "Zero added colors or food dyes",
      "Smooth fine texture"
    ],
    ingredients: "100% Kashmiri & Byadgi Red Chillies",
    prepProcess: "Slow-milled cold process to preserve natural carotenoid color compounds.",
    packaging: "Light-shielded zip pouch.",
    storage: "Keep away from heat and moisture.",
    shelfLife: "12 Months from packaging.",
    variants: [
      { weight: "100g", price: 80, originalPrice: 95, stock: 90 },
      { weight: "250g", price: 185, originalPrice: 215, stock: 70 },
      { weight: "500g", price: 350, originalPrice: 410, stock: 40 },
      { weight: "1kg", price: 670, originalPrice: 780, stock: 20 }
    ],
    defaultVariantIndex: 1
  },
  {
    id: "prod-4",
    name: "Family Saver Combo Pack",
    category: "Combos",
    badge: "Save ₹150",
    spiceLevel: 4,
    spiceText: "Assorted Heat Levels",
    rating: 5.0,
    reviewsCount: 204,
    image: "assets/images/hero_chilli_pack.jpg",
    description: "The ultimate value bundle for monthly kitchen needs! Includes 2x 500g Premium Mirchi Powder + 1x 500g Spicy Mirchi Powder. Total 1.5kg of fresh spice.",
    whyYouLoveIt: [
      "Super saver pricing for household stocking",
      "Complete variety of medium and fiery spice",
      "Direct batch preparation guarantee",
      "Free doorstep delivery included",
      "Aroma-lock sealed individual pouches"
    ],
    ingredients: "Premium Mirchi Powder (1kg) + Spicy Mirchi Powder (500g)",
    prepProcess: "Freshly prepared combined batch grinding.",
    packaging: "Gift/Combo Master Box containing 3 sealed pouches.",
    storage: "Store sealed pouches in pantry; transfer active pouch to glass jar.",
    shelfLife: "12 Months from packaging.",
    variants: [
      { weight: "1.5kg Combo", price: 799, originalPrice: 950, stock: 50 }
    ],
    defaultVariantIndex: 0
  },
  {
    id: "prod-5",
    name: "Traditional Pickle Special Mirchi",
    category: "Specialty",
    badge: "Pickle Master",
    spiceLevel: 4,
    spiceText: "Coarse & Tangy Heat",
    rating: 4.8,
    reviewsCount: 76,
    image: "assets/images/chilli_drying.jpg",
    description: "Specially coarse-ground chilli powder tailored for traditional Indian mango, lemon, and chicken pickles. High oil absorption capacity for long preservation.",
    whyYouLoveIt: [
      "Coarse grind engineered for pickles (Avakaya / Orakaya)",
      "High natural oil binding ability",
      "Enhances pickle shelf life & deep red oil floating look",
      "Authentic grandmother's recipe grind",
      "Sun-dried premium chilli base"
    ],
    ingredients: "100% Coarse Sun-Dried Red Chillies",
    prepProcess: "Sun-dried to absolute zero moisture, stone-milled into coarse flakes & powder.",
    packaging: "Moisture-proof double foil seal pouch.",
    storage: "Keep strictly dry. Always use clean dry spoon.",
    shelfLife: "12 Months from packaging.",
    variants: [
      { weight: "250g", price: 175, originalPrice: 200, stock: 65 },
      { weight: "500g", price: 330, originalPrice: 380, stock: 40 },
      { weight: "1kg", price: 620, originalPrice: 710, stock: 20 }
    ],
    defaultVariantIndex: 1
  },
  {
    id: "prod-6",
    name: "Cold-Ground Artisanal Mirchi",
    category: "Specialty",
    badge: "Artisanal",
    spiceLevel: 3,
    spiceText: "Rich Essential Oils",
    rating: 4.9,
    reviewsCount: 89,
    image: "assets/images/grinding_process.jpg",
    description: "Processed at ultra-low speeds below 30°C. Prevents heat-friction loss of volatile essential oils, retaining unparalleled aroma and genuine homemade taste.",
    whyYouLoveIt: [
      "Ultra-low temperature grinding preserves volatile oils",
      "Unmatched pungent aroma when added to hot oil / tadka",
      "Small-batch artisanal preparation",
      "Direct farm-sourced red chillies",
      "Rich deep natural color and flavor depth"
    ],
    ingredients: "100% Hand-Selected Whole Red Chillies",
    prepProcess: "Slow-milled cold stone tech grinding.",
    packaging: "Premium zip-lock foil container.",
    storage: "Refrigeration after opening enhances aroma retention.",
    shelfLife: "12 Months.",
    variants: [
      { weight: "250g", price: 195, originalPrice: 230, stock: 55 },
      { weight: "500g", price: 375, originalPrice: 440, stock: 35 },
      { weight: "1kg", price: 720, originalPrice: 830, stock: 15 }
    ],
    defaultVariantIndex: 0
  }
];

const PROCESS_STEPS = [
  {
    step: 1,
    title: "Selecting Quality Chillies",
    desc: "We handpick only prime ripe, stemless Guntur & Byadgi red chillies directly from trusted regional farmers.",
    icon: "fa-solid fa-seedling"
  },
  {
    step: 2,
    title: "Cleaning & Sorting",
    desc: "Rigorous manual inspection to remove defective chillies, dust, and stems before processing.",
    icon: "fa-solid fa-hand-sparkles"
  },
  {
    step: 3,
    title: "Natural Sun-Drying",
    desc: "Chillies are naturally sun-dried on clean jute mats to reduce moisture while retaining natural essential oils.",
    icon: "fa-solid fa-sun"
  },
  {
    step: 4,
    title: "Cold-Grinding Mill",
    desc: "Milled slowly at controlled low temperatures so friction heat never burns the natural flavour & capsaicin.",
    icon: "fa-solid fa-gears"
  },
  {
    step: 5,
    title: "Quality Inspection",
    desc: "Every batch is tested for aroma intensity, fineness, moisture level, and 100% purity before approval.",
    icon: "fa-solid fa-clipboard-check"
  },
  {
    step: 6,
    title: "Hygienic Packing",
    desc: "Packed in multi-layer aroma-lock pouches using automated touch-free hygienic packaging.",
    icon: "fa-solid fa-box-open"
  },
  {
    step: 7,
    title: "Fresh Delivery",
    desc: "Dispatched directly from our preparation facility to your doorstep within 24 hours of batch grinding.",
    icon: "fa-solid fa-truck-fast"
  }
];

const RECIPES_DATA = [
  {
    id: "rec-1",
    title: "Authentic Andhra Chicken Fry",
    category: "Non-Veg Fry",
    prepTime: "30 Mins",
    image: "assets/images/chilli_curry_dish.jpg",
    desc: "A fiery dry dish packed with caramelized onions, curry leaves, and 2 tbsp of Mirchi Pure Spicy Powder for that irresistible hot kick.",
    recommendedProductId: "prod-2",
    recommendedProductName: "Spicy Mirchi Powder (250g)",
    ingredients: [
      "500g Chicken (curry cut)",
      "2 tbsp Mirchi Pure Spicy Powder",
      "1 tbsp Ginger-Garlic Paste",
      "1 tsp Turmeric Powder",
      "Fresh Curry Leaves & Green Chillies",
      "3 tbsp Cold-Pressed Peanut Oil"
    ],
    steps: [
      "Marinate chicken with salt, turmeric, and 1 tbsp Mirchi Pure Spicy Powder for 20 mins.",
      "Heat oil in a heavy kadai, add curry leaves and sauté sliced onions until golden brown.",
      "Add marinated chicken and cook on medium flame for 15 minutes.",
      "Sprinkle remaining 1 tbsp Mirchi Pure Spicy Powder, toss on high heat until dark red & roasted.",
      "Garnish with fresh coriander and serve hot!"
    ]
  },
  {
    id: "rec-2",
    title: "Gutti Vankaya Eggplant Curry",
    category: "Vegetarian",
    prepTime: "35 Mins",
    image: "assets/images/chilli_curry_dish.jpg",
    desc: "Classic Andhra stuffed brinjal curry prepared with roasted peanut-sesame masala and Mirchi Pure Premium Powder.",
    recommendedProductId: "prod-1",
    recommendedProductName: "Premium Mirchi Powder (250g)",
    ingredients: [
      "8 Small Purple Brinjals (slit X shape)",
      "1.5 tbsp Mirchi Pure Premium Powder",
      "3 tbsp Roasted Peanuts & Sesame Seeds",
      "1 tsp Tamarind Extract",
      "Mustard Seeds & Curry Leaves for Tadka"
    ],
    steps: [
      "Dry roast peanuts, sesame, cumin, and grind with Mirchi Pure Premium Powder, salt, and water into a smooth paste.",
      "Stuff the ground paste into the slit brinjals.",
      "Heat oil, crackle mustard seeds & curry leaves, add stuffed brinjals.",
      "Cover and simmer on low heat for 20 mins until eggplant turns tender and oil separates.",
      "Serve hot with steamed rice or jowar roti!"
    ]
  },
  {
    id: "rec-3",
    title: "Royal Paneer Butter Masala",
    category: "Vegetarian",
    prepTime: "25 Mins",
    image: "assets/images/chilli_curry_dish.jpg",
    desc: "Rich, creamy, restaurant-style paneer gravy glowing with natural ruby hue thanks to Mirchi Pure Premium Colour Powder.",
    recommendedProductId: "prod-3",
    recommendedProductName: "Premium Colour Mirchi Powder (250g)",
    ingredients: [
      "250g Fresh Paneer Cubes",
      "2 tbsp Mirchi Pure Premium Colour Powder",
      "4 Fresh Tomatoes (pureed)",
      "10-12 Cashews (ground to paste)",
      "2 tbsp Fresh Butter & Cream",
      "1 tsp Kasuri Methi"
    ],
    steps: [
      "Sauté tomato puree in butter until oil releases.",
      "Add cashew paste, turmeric, and 2 tbsp Mirchi Pure Premium Colour Powder for vibrant natural red tint.",
      "Pour 1/2 cup water and simmer into a velvety gravy.",
      "Add paneer cubes, butter, kasuri methi, and cream. Simmer for 3 minutes.",
      "Serve warm with garlic naan!"
    ]
  },
  {
    id: "rec-4",
    title: "Traditional Mango Avakaya Pickle",
    category: "Pickles",
    prepTime: "45 Mins + Aging",
    image: "assets/images/chilli_drying.jpg",
    desc: "Grandmother's heritage Andhra raw mango pickle recipe made with Mirchi Pure Pickle Special Coarse Chilli Powder.",
    recommendedProductId: "prod-5",
    recommendedProductName: "Pickle Special Mirchi Powder (500g)",
    ingredients: [
      "1 kg Raw Raw Hard Sour Mangoes (chopped into cubes)",
      "200g Mirchi Pure Pickle Special Powder",
      "200g Yellow Mustard Powder (Ava podi)",
      "200g Crystal Salt (ground)",
      "300ml Pure Cold-Pressed Sesame/Gingelly Oil"
    ],
    steps: [
      "Ensure mango pieces are completely dry with fibrous shell attached.",
      "In a large clean dry ceramic jar (Jadi), mix mustard powder, salt, and Mirchi Pure Pickle Powder.",
      "Coat mango cubes with sesame oil, toss in spice mixture.",
      "Layer in jar, pour remaining oil on top so it floats.",
      "Seal tight with cotton cloth. Mix thoroughly on Day 3. Ready to enjoy for 1 year!"
    ]
  }
];

const REVIEWS_DATA = [
  {
    id: "rev-1",
    name: "Sowmya Reddy",
    location: "Hyderabad",
    rating: 5,
    date: "14 Aug 2026",
    text: "The smell when you open the pack is incredible! It reminds me of the fresh mirchi powder my grandmother used to prepare in our village. Perfect red color in chicken curry without any artificial food dyes.",
    verified: true
  },
  {
    id: "rev-2",
    name: "Rajesh Kumar",
    location: "Bengaluru",
    rating: 5,
    date: "02 Aug 2026",
    text: "Tried the Spicy Teja Mirchi Powder. Absolutely legit heat! Most market brands add wheat flour or color, but Mirchi Pure is 100% authentic pure chilli. Ordering the 1.5kg Family Combo now.",
    verified: true
  },
  {
    id: "rev-3",
    name: "Ananya Sharma",
    location: "Mumbai",
    rating: 5,
    date: "28 Jul 2026",
    text: "The Premium Colour variant gives my Paneer Makhani that exact vibrant red shade you get in fine dining restaurants, but completely mild and safe for my kids. Loved the fast shipping too!",
    verified: true
  },
  {
    id: "rev-4",
    name: "Venkatesh Rao",
    location: "Vijayawada",
    rating: 5,
    date: "19 Jul 2026",
    text: "Used their Pickle Special Mirchi Powder for our annual Avakaya mango pickle making. The coarse texture and oil binding quality are top notch. Outstanding homemade quality!",
    verified: true
  }
];

const INITIAL_ORDERS = [
  {
    orderId: "MRC-84920",
    customerName: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya.s@example.com",
    address: "Flat 402, Sai Residency, Jubilee Hills, Hyderabad - 500033",
    items: [
      { productId: "prod-1", name: "Premium Mirchi Powder (250g)", qty: 2, price: 150 },
      { productId: "prod-3", name: "Premium Colour Mirchi Powder (250g)", qty: 1, price: 185 }
    ],
    totalAmount: 485,
    paymentMode: "UPI / Online",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    date: "26 Aug 2026, 02:30 PM",
    trackingSteps: [
      { step: "Order Placed", done: true, time: "26 Aug, 02:30 PM" },
      { step: "Fresh Batch Prepared", done: true, time: "26 Aug, 04:15 PM" },
      { step: "Packed & Sealed", done: true, time: "26 Aug, 06:00 PM" },
      { step: "Handed to Courier", done: true, time: "27 Aug, 09:00 AM" },
      { step: "Out for Delivery", done: false, time: "Expected Today" }
    ]
  },
  {
    orderId: "MRC-84921",
    customerName: "Karthik Verma",
    phone: "+91 91234 56789",
    email: "karthik.v@example.com",
    address: "H.No 12-4, MG Road, Indiranagar, Bengaluru - 560038",
    items: [
      { productId: "prod-4", name: "Family Saver Combo Pack (1.5kg)", qty: 1, price: 799 }
    ],
    totalAmount: 799,
    paymentMode: "Cash on Delivery",
    paymentStatus: "Pending COD",
    orderStatus: "Processing",
    date: "27 Aug 2026, 09:15 AM",
    trackingSteps: [
      { step: "Order Placed", done: true, time: "27 Aug, 09:15 AM" },
      { step: "Fresh Batch Prepared", done: true, time: "27 Aug, 10:30 AM" },
      { step: "Packed & Sealed", done: false, time: "In Progress" },
      { step: "Handed to Courier", done: false, time: "Pending" },
      { step: "Out for Delivery", done: false, time: "Pending" }
    ]
  }
];

const INITIAL_COUPONS = [
  { code: "FRESH15", discountPercent: 15, minSpend: 300, desc: "15% OFF on orders above ₹300" },
  { code: "MIRCHI20", discountPercent: 20, minSpend: 600, desc: "20% OFF on orders above ₹600" },
  { code: "FREESHIP", discountPercent: 0, freeShipping: true, minSpend: 0, desc: "Free Doorstep Delivery" }
];
