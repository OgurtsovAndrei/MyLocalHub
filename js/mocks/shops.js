const SHOPS_DATA = [
    {
        id: 1,
        name: "Georgios Seaside Kiosk",
        category: "Souvenirs",
        type: "place",
        promotion: "1+1 on seashell accessories",
        rating: 4.8,
        visits: 120,
        isNew: false,
        openingHours: "08:00 - 20:00",
        reviews: [
            { user: "Maria", rating: 5, comment: "Beautiful handmade seashell crafts. Highly recommend!" },
            { user: "Jonathan", rating: 4, comment: "Very authentic place. Great for unique souvenirs." }
        ],
        image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=400",
        description: "Authentic local crafts and seashell treasures right by the Larnaca promenade.",
        location: "Finikoudes Promenade, Larnaca",
        lat: 34.9120,
        lng: 33.6370
    },
    {
        id: 2,
        name: "Larnaca Coffee Roasters",
        category: "Food & Drink",
        type: "place",
        promotion: "-30% on morning brew",
        rating: 4.9,
        visits: 250,
        isNew: false,
        openingHours: "07:00 - 19:00",
        reviews: [
            { user: "Costas", rating: 5, comment: "Best espresso in town! The staff is so friendly." }
        ],
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400",
        description: "Freshly roasted beans and community atmosphere.",
        location: "Zinonos Kitieos St, Larnaca",
        lat: 34.9155,
        lng: 33.6335
    },
    {
        id: 3,
        name: "Blue Wave Pottery",
        category: "Crafts",
        type: "place",
        promotion: "Free mini-vase with any purchase",
        rating: 4.7,
        visits: 85,
        isNew: false,
        openingHours: "09:00 - 18:00",
        reviews: [
            { user: "Eleni", rating: 5, comment: "The pottery classes are amazing. I made my first cup here!" }
        ],
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400",
        description: "Traditional Cypriot ceramics with a modern twist.",
        location: "Piale Pasa, Larnaca",
        lat: 34.9178,
        lng: 33.6282
    },
    {
        id: 4,
        name: "The Zen Baker",
        category: "Food & Drink",
        type: "place",
        promotion: "Free cookie with any coffee",
        rating: 4.8,
        visits: 180,
        isNew: false,
        openingHours: "06:30 - 15:00",
        reviews: [
            { user: "Andreas", rating: 5, comment: "Their sourdough is to die for. Get there early!" }
        ],
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
        description: "Artisan sourdough and sweet pastries baked fresh every dawn.",
        location: "Ermou Street, Larnaca",
        lat: 34.9142,
        lng: 33.6318
    },
    {
        id: 5,
        name: "Larnaca Lace Studio",
        category: "Crafts",
        type: "place",
        promotion: "-10% on handmade tablecloths",
        rating: 4.9,
        visits: 65,
        isNew: false,
        openingHours: "10:00 - 18:30",
        reviews: [
            { user: "Anna", rating: 5, comment: "Exquisite craftsmanship. A true heritage of Cyprus." }
        ],
        image: "https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=400",
        description: "Preserving the heritage of Lefkara lace-making in the heart of the city.",
        location: "Agios Lazaros St, Larnaca",
        lat: 34.9165,
        lng: 33.6305
    },
    {
        id: 6,
        name: "Mediterranean Spa",
        category: "Beauty",
        type: "place",
        promotion: "Free head massage with any facial",
        rating: 4.7,
        visits: 95,
        isNew: false,
        openingHours: "09:00 - 20:00",
        reviews: [
            { user: "Chloe", rating: 4, comment: "Very relaxing atmosphere. The sea salt scrub is great." }
        ],
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400",
        description: "Holistic treatments using local sea salts and essential oils.",
        location: "Mackenzie Area, Larnaca",
        lat: 34.9115,
        lng: 33.6385
    },
    {
        id: 7,
        name: "Olive Oil Cosmetics",
        category: "Beauty",
        type: "place",
        promotion: "Buy 2 get 1 free on soaps",
        rating: 4.6,
        visits: 140,
        isNew: false,
        openingHours: "09:00 - 19:00",
        reviews: [
            { user: "Petros", rating: 5, comment: "My skin has never felt better. Natural and local!" }
        ],
        image: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=400",
        description: "Natural skincare products derived from organic Cypriot olive groves.",
        location: "Lordou Vyronos St, Larnaca",
        lat: 34.9185,
        lng: 33.6255
    },
    {
        id: 8,
        name: "Larnaca Dive Center",
        category: "Leisure",
        type: "place",
        promotion: "-20% on Zenobia wreck dives",
        rating: 4.9,
        visits: 110,
        isNew: false,
        openingHours: "08:00 - 17:00",
        reviews: [
            { user: "Mark", rating: 5, comment: "Zenobia is a bucket list dive. These guys are pros." }
        ],
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
        description: "Professional diving instruction and guided tours to the world-famous Zenobia wreck.",
        location: "Piale Pasa 38, Larnaca",
        lat: 34.8985,
        lng: 33.6450
    },
    {
        id: 9,
        name: "Sunrise Bike Rentals",
        category: "Leisure",
        type: "place",
        promotion: "Get 3 hours for the price of 2",
        rating: 4.5,
        visits: 210,
        isNew: false,
        openingHours: "07:30 - 20:00",
        reviews: [
            { user: "Sarah", rating: 4, comment: "Great bikes for a ride along the salt lake." }
        ],
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400",
        description: "Explore the Salt Lake and coastal paths on our premium city bikes.",
        location: "Mackenzie Beach, Larnaca",
        lat: 34.9005,
        lng: 33.6205
    },
    {
        id: 10,
        name: "The Memory Box",
        category: "Souvenirs",
        type: "place",
        promotion: "Free postcard set over €20",
        rating: 4.7,
        visits: 155,
        isNew: false,
        openingHours: "09:30 - 19:30",
        reviews: [
            { user: "Dimitris", rating: 5, comment: "Unique gifts you won't find at the airport." }
        ],
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400",
        description: "Unique mementos and locally designed gifts that tell the story of Cyprus.",
        location: "Stoa Kouppa, Larnaca",
        lat: 34.9135,
        lng: 33.6355
    },
    {
        id: 11,
        name: "Larnaca Farmers Market",
        category: "Food & Drink",
        type: "place",
        promotion: "Fresh local fruits and vegetables",
        rating: 4.8,
        visits: 320,
        isNew: true,
        openingHours: "07:00 - 14:00 (Sundays only)",
        reviews: [
            { user: "Yiannis", rating: 5, comment: "The freshest halloumi I've ever tasted!" }
        ],
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=400",
        description: "The main hub for local organic produce in Larnaca. Open every Sunday morning at St. Lazarus Square.",
        location: "St. Lazarus Square, Larnaca",
        lat: 34.9150,
        lng: 33.6345
    },
    {
        id: 12,
        name: "Ancient Sands Gems",
        category: "Crafts",
        type: "place",
        promotion: "-15% on silver jewelry",
        rating: 4.6,
        visits: 90,
        isNew: true,
        openingHours: "10:00 - 19:00",
        reviews: [
            { user: "Lydia", rating: 5, comment: "Stunning designs inspired by ancient history." }
        ],
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400",
        description: "Handcrafted jewelry inspired by Cypriot history and natural beauty.",
        location: "Faneromeni St, Larnaca",
        lat: 34.9130,
        lng: 33.6300
    }
];
