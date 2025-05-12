
// Sample data for stylists
const stylists = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Senior Hair Stylist',
    image: 'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 127,
    specialties: ['Color Specialist', 'Hair Extensions', 'Wedding Styles'],
    bio: "Sarah brings over 10 years of experience in cutting-edge hair styling. Her clients love her attention to detail and ability to create personalized looks.",
    available: true,
    experience: 10,
    services: [
      { name: 'Haircut & Style', price: 85 },
      { name: 'Color Service', price: 120 },
      { name: 'Hair Extensions', price: 250 },
      { name: 'Wedding Updo', price: 150 },
      { name: 'Deep Conditioning', price: 45 }
    ],
    clientReviews: [
      {
        id: 1,
        name: 'Emma Wilson',
        rating: 5,
        date: '3 weeks ago',
        text: "I've been going to Sarah for years and she always knows exactly what I need. Her color work is absolutely phenomenal!"
      },
      {
        id: 2,
        name: 'Madison Clark',
        rating: 5,
        date: '2 months ago',
        text: "Sarah did my wedding hair and it was perfect! She listened carefully to what I wanted and executed it flawlessly. Highly recommended!"
      }
    ]
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Master Barber',
    image: 'https://images.unsplash.com/photo-1546877625-cb8c71dde378?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 98,
    specialties: ['Classic Cuts', 'Beard Styling', 'Hot Towel Shave'],
    bio: "Michael specializes in classic and modern men's grooming with attention to precision and style. His clients appreciate his professional approach.",
    available: true,
    experience: 8,
    services: [
      { name: 'Haircut', price: 65 },
      { name: 'Beard Trim', price: 35 },
      { name: 'Hot Towel Shave', price: 50 },
      { name: 'Hair & Beard Combo', price: 90 },
      { name: 'Kids Haircut', price: 40 }
    ],
    clientReviews: [
      {
        id: 1,
        name: 'James Parker',
        rating: 5,
        date: '1 month ago',
        text: "Michael gave me the best haircut I've had in years. He really understands men's hair and how to tailor the cut to face shape."
      }
    ]
  },
  {
    id: 3,
    name: 'Jessica Chen',
    role: 'Makeup Artist',
    image: 'https://images.unsplash.com/photo-1579910223967-ea1783e06e5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviews: 89,
    specialties: ['Bridal Makeup', 'Fashion Shows', 'Glamour Looks'],
    bio: "Jessica is known for her stunning makeup artistry that enhances natural beauty. She's a favorite for special occasions and professional photoshoots.",
    available: false,
    experience: 7,
    services: [
      { name: 'Natural Makeup', price: 75 },
      { name: 'Bridal Makeup', price: 180 },
      { name: 'Special Occasion', price: 110 },
      { name: 'Makeup Lesson', price: 150 },
      { name: 'Touch-ups', price: 45 }
    ],
    clientReviews: [
      {
        id: 1,
        name: 'Sophia Rodriguez',
        rating: 5,
        date: '2 weeks ago',
        text: "Jessica did my makeup for my wedding and I couldn't have been happier. She made me look like the best version of myself!"
      },
      {
        id: 2,
        name: 'Amanda Lee',
        rating: 5,
        date: '1 month ago',
        text: "Jessica has an amazing eye for color and knows exactly what works for different skin tones. True artist!"
      }
    ]
  }
];

// Sample portfolio images (would typically be from a database)
const portfolios: { [key: number]: string[] } = {
  1: [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552673597-e3cd6747a996?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504703395950-b89145a5425b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585123334904-845d60e97b29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  ],
  2: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520338801623-6b88fe32bbf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533536201350-93ebe24101f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  ],
  3: [
    'https://images.unsplash.com/photo-1588870305019-3a213c711cb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513557294444-41802c78c3f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569577988463-f945f66a2820?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511424323602-d3c1a7c34f14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526045142222-c233118db74f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  ]
};

// Get all stylists
export const getAllStylists = () => {
  return stylists;
};

// Get a specific stylist by ID
export const getStylist = (id: number) => {
  return stylists.find(stylist => stylist.id === id) || null;
};

// Get portfolio images for a specific stylist
export const getStylistPortfolio = (id: number) => {
  return portfolios[id] || [];
};

// Search stylists by specialty
export const searchStylistsBySpecialty = (specialty: string) => {
  return stylists.filter(stylist => 
    stylist.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
};

// Filter available stylists
export const getAvailableStylists = () => {
  return stylists.filter(stylist => stylist.available);
};
