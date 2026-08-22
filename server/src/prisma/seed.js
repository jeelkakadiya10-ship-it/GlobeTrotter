import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES = [
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    description: 'The City of Light dazzles with iconic monuments, world-class gastronomy, haute couture, and romantic boulevards along the Seine.',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    lat: 48.8566,
    lng: 2.3522,
    activities: [
      {
        title: 'Eiffel Tower Summit & Champagne',
        description: 'Ascend to the top deck of the iron lady for panoramic views across Paris, toast with a glass of champagne at sunset.',
        category: 'Sightseeing',
        estimated_cost: 35,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
        location_name: 'Champ de Mars, 7th Arrondissement',
        rating: 4.9
      },
      {
        title: 'Louvre Museum Masterpieces Tour',
        description: 'Explore the worlds greatest art museum with a skip-the-line pass to see the Mona Lisa, Venus de Milo, and Winged Victory.',
        category: 'Culture & History',
        estimated_cost: 25,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80',
        location_name: 'Rue de Rivoli, 1st Arrondissement',
        rating: 4.8
      },
      {
        title: 'Montmartre Secret Bakery & Food Tasting',
        description: 'Taste freshly baked artisanal croissants, delicate macarons, award-winning cheeses, and paired regional French wines in bohemian Montmartre.',
        category: 'Food & Dining',
        estimated_cost: 65,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        location_name: 'Place du Tertre, Montmartre',
        rating: 4.95
      },
      {
        title: 'Seine Sunset River Cruise',
        description: 'Glide past Notre-Dame, the Musée d’Orsay, and illuminated bridges while enjoying acoustic Parisian music.',
        category: 'Relaxation',
        estimated_cost: 20,
        estimated_duration_min: 75,
        image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
        location_name: 'Port de la Bourdonnais',
        rating: 4.7
      },
      {
        title: 'Catacombs of Paris Underground Exploration',
        description: 'Descend 20 meters underground into the labyrinthine subterranean ossuary containing the remains of several million Parisians.',
        category: 'Adventure',
        estimated_cost: 30,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
        location_name: '1 Avenue du Colonel Henri Rol-Tanguy',
        rating: 4.65
      }
    ]
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    description: 'A captivating blend of ultramodern neon skyscrapers and historic Shinto shrines, unmatched culinary mastery, and vibrant pop culture.',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    activities: [
      {
        title: 'Tsukiji Outer Market Culinary Walk',
        description: 'Savor melt-in-your-mouth bluefin tuna nigiri, tamagoyaki omelet, wagyu skewers, and fresh sea urchin with an expert local chef.',
        category: 'Food & Dining',
        estimated_cost: 55,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
        location_name: 'Tsukiji, Chuo City',
        rating: 4.95
      },
      {
        title: 'Shibuya Crossing & Sky Observatory',
        description: 'Cross the world’s busiest pedestrian intersection and ascend 229 meters to the open-air rooftop observation deck for views of Mt. Fuji.',
        category: 'Sightseeing',
        estimated_cost: 22,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
        location_name: 'Shibuya Scramble Square',
        rating: 4.9
      },
      {
        title: 'Senso-ji Temple & Asakusa Traditional Tea Ritual',
        description: 'Immerse yourself in Tokyo’s oldest Buddhist temple, stroll through Nakamise shopping street, and participate in a peaceful matcha ceremony.',
        category: 'Culture & History',
        estimated_cost: 30,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80',
        location_name: 'Asakusa, Taito City',
        rating: 4.85
      },
      {
        title: 'teamLab Planets Immersive Digital Art',
        description: 'Walk through water and dynamic light installations that dissolve the boundaries between your body and breathtaking artwork.',
        category: 'Adventure',
        estimated_cost: 38,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        location_name: 'Toyosu, Koto City',
        rating: 4.92
      },
      {
        title: 'Shinjuku Gyoen National Garden Zen Walk',
        description: 'Escape the bustle in a tranquil oasis blending traditional Japanese, English landscape, and French formal garden styles.',
        category: 'Relaxation',
        estimated_cost: 5,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
        location_name: 'Naitomachi, Shinjuku City',
        rating: 4.8
      }
    ]
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    description: 'The Eternal City boasts nearly three millennia of globally influential art, monumental Roman ruins, vibrant piazzas, and sublime pasta.',
    currency: 'EUR',
    timezone: 'Europe/Rome',
    lat: 41.9028,
    lng: 12.4964,
    activities: [
      {
        title: 'Colosseum & Roman Forum Gladiator Arena Tour',
        description: 'Step onto the reconstructed arena floor where gladiators fought, followed by an in-depth exploration of the imperial palaces on Palatine Hill.',
        category: 'Culture & History',
        estimated_cost: 45,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
        location_name: 'Piazza del Colosseo',
        rating: 4.9
      },
      {
        title: 'Vatican Museums & Sistine Chapel VIP Access',
        description: 'Marvel at Michelangelo’s ceiling frescoes, the Raphael Rooms, and St. Peter’s Basilica with priority morning entry.',
        category: 'Culture & History',
        estimated_cost: 50,
        estimated_duration_min: 210,
        image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
        location_name: 'Vatican City',
        rating: 4.95
      },
      {
        title: 'Trastevere Handmade Pasta & Gelato Masterclass',
        description: 'Learn authentic fettuccine and ravioli crafting from an Italian nonna in a rustic trattoria, accompanied by local Chianti.',
        category: 'Food & Dining',
        estimated_cost: 70,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        location_name: 'Piazza di Santa Maria in Trastevere',
        rating: 4.98
      },
      {
        title: 'Trevi Fountain & Spanish Steps Evening Walk',
        description: 'Toss a coin into the Trevi Fountain and stroll through Rome’s most iconic cobblestone squares under magical night illumination.',
        category: 'Sightseeing',
        estimated_cost: 0,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        location_name: 'Piazza di Trevi',
        rating: 4.8
      },
      {
        title: 'Villa Borghese Gardens Bike & Picnic',
        description: 'Rent an e-bike to cruise the landscaped gardens, row a boat on the lake, and relax beneath shady stone pines.',
        category: 'Relaxation',
        estimated_cost: 25,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
        location_name: 'Piazzale Napoleone I',
        rating: 4.75
      }
    ]
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    description: 'The cosmopolitan capital of Catalonia features Antoni Gaudí’s surreal architecture, sunny Mediterranean beaches, and world-class tapas bars.',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    lat: 41.3879,
    lng: 2.16992,
    activities: [
      {
        title: 'Sagrada Família Towers & Basilica Tour',
        description: 'Witness the kaleidoscopic stained glass light and climb the nativity towers of Gaudí’s unearthly architectural masterpiece.',
        category: 'Sightseeing',
        estimated_cost: 38,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
        location_name: 'Carrer de Mallorca, Eixample',
        rating: 4.95
      },
      {
        title: 'Park Güell Monumental Zone Exploration',
        description: 'Discover Gaudí’s famous multicolored mosaic salamander, serpentine stone benches, and panoramic views of the Barcelona skyline.',
        category: 'Culture & History',
        estimated_cost: 15,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80',
        location_name: 'Gràcia District',
        rating: 4.8
      },
      {
        title: 'Gothic Quarter Tapas & Cava Crawl',
        description: 'Sample patatas bravas, jamón Ibérico, garlic prawns, and crisp sparkling Catalan Cava in centuries-old taverns.',
        category: 'Food & Dining',
        estimated_cost: 50,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80',
        location_name: 'Barri Gòtic',
        rating: 4.9
      },
      {
        title: 'Barceloneta Mediterranean Sunset Sailing',
        description: 'Set sail along the coast on a luxury catamaran, sipping chilled drinks while watching the sun dip below the Collserola hills.',
        category: 'Relaxation',
        estimated_cost: 45,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        location_name: 'Port Olímpic',
        rating: 4.85
      },
      {
        title: 'Montjuïc Cable Car & Castle Panoramic Hike',
        description: 'Ride the aerial cable car up Montjuïc mountain for coastal views, exploring the 17th-century fortress and Olympic stadium.',
        category: 'Adventure',
        estimated_cost: 18,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
        location_name: 'Montjuïc Mountain',
        rating: 4.7
      }
    ]
  },
  {
    name: 'New York City',
    country: 'United States',
    region: 'Americas',
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    description: 'The city that never sleeps offers electric energy, Broadway theater, legendary museums, world-spanning dining, and iconic skyscraper views.',
    currency: 'USD',
    timezone: 'America/New_York',
    lat: 40.7128,
    lng: -74.006,
    activities: [
      {
        title: 'Empire State Building Sunset Observatory',
        description: 'Take in 360-degree views from the 86th floor open-air observatory of the world’s most iconic art deco tower.',
        category: 'Sightseeing',
        estimated_cost: 44,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
        location_name: '350 5th Ave, Midtown Manhattan',
        rating: 4.85
      },
      {
        title: 'Broadway Musical Evening Performance',
        description: 'Experience premier theatrical talent and musical spectacles in the heart of the historic Theater District.',
        category: 'Culture & History',
        estimated_cost: 120,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
        location_name: 'Times Square & 42nd St',
        rating: 4.95
      },
      {
        title: 'Central Park Bike & Hidden Gems Tour',
        description: 'Pedal through Strawberry Fields, Bethesda Terrace, Bow Bridge, and the Belvedere Castle amidst green forest paths.',
        category: 'Relaxation',
        estimated_cost: 30,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1534270804882-6b5eb4327650?auto=format&fit=crop&w=800&q=80',
        location_name: 'Central Park South',
        rating: 4.8
      },
      {
        title: 'Chelsea Market & High Line Gastronomy Walk',
        description: 'Sample artisan tacos, fresh Maine lobster rolls, and gourmet gelato along the elevated linear rail park.',
        category: 'Food & Dining',
        estimated_cost: 55,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=800&q=80',
        location_name: '75 9th Ave, Meatpacking District',
        rating: 4.9
      },
      {
        title: 'Brooklyn Bridge & DUMBO Scenic Walking Tour',
        description: 'Cross the gothic arches of Brooklyn Bridge and capture the classic Manhattan Bridge photo framing the Empire State Building.',
        category: 'Sightseeing',
        estimated_cost: 0,
        estimated_duration_min: 100,
        image_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
        location_name: 'DUMBO, Brooklyn Waterfront',
        rating: 4.88
      }
    ]
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    description: 'The cultural soul of Japan features thousands of classical temples, moss gardens, bamboo groves, and geisha traditions in Gion.',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    lat: 35.0116,
    lng: 135.7681,
    activities: [
      {
        title: 'Fushimi Inari 10,000 Torii Gates Hike',
        description: 'Hike through paths lined with thousands of vibrant vermilion torii gates winding up the sacred Mount Inari.',
        category: 'Adventure',
        estimated_cost: 0,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        location_name: 'Fushimi Ward, Kyoto',
        rating: 4.95
      },
      {
        title: 'Arashiyama Bamboo Grove & Monkey Park',
        description: 'Walk through towering emerald green bamboo stalks and hike up to meet friendly wild macaques with valley views.',
        category: 'Sightseeing',
        estimated_cost: 10,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
        location_name: 'Ukyo Ward, Kyoto',
        rating: 4.88
      },
      {
        title: 'Kinkaku-ji Golden Pavilion & Zen Garden',
        description: 'Gaze at the Zen Buddhist temple whose top two floors are completely covered in shimmering gold leaf over a reflective mirror pond.',
        category: 'Culture & History',
        estimated_cost: 5,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
        location_name: 'Kita Ward, Kyoto',
        rating: 4.92
      },
      {
        title: 'Gion Evening Kaiseki Dining Experience',
        description: 'Indulge in a multi-course traditional Japanese dinner celebrating seasonal ingredients served in a historic machiya townhouse.',
        category: 'Food & Dining',
        estimated_cost: 95,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
        location_name: 'Gion District, Higashiyama',
        rating: 4.97
      },
      {
        title: 'Traditional Ryokan Onsen Spa Retreat',
        description: 'Soak in mineral-rich geothermal hot spring baths surrounded by Japanese cedar and peaceful bonsai gardens.',
        category: 'Relaxation',
        estimated_cost: 40,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        location_name: 'Kurama Mountains, Kyoto',
        rating: 4.9
      }
    ]
  },
  {
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    description: 'A global metropolis where royal pageantry, ancient Roman history, West End theater, and dynamic pub culture come together seamlessly.',
    currency: 'GBP',
    timezone: 'Europe/London',
    lat: 51.5074,
    lng: -0.1278,
    activities: [
      {
        title: 'Tower of London & Crown Jewels Tour',
        description: 'Explore the 1000-year-old fortress with a Yeoman Warder (Beefeater) and view the dazzling British Crown Jewels.',
        category: 'Culture & History',
        estimated_cost: 35,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
        location_name: 'Tower Hill, London EC3N',
        rating: 4.88
      },
      {
        title: 'London Eye Panoramic River Flight',
        description: 'Take a spin on the iconic 135-meter observation wheel on the South Bank for sweeping views of Big Ben and Parliament.',
        category: 'Sightseeing',
        estimated_cost: 32,
        estimated_duration_min: 45,
        image_url: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80',
        location_name: 'Riverside Building, County Hall',
        rating: 4.75
      },
      {
        title: 'Borough Market Street Food Tour',
        description: 'Feast on artisan sausage rolls, melted raclette cheese over new potatoes, Scottish oysters, and warm Portuguese custard tarts.',
        category: 'Food & Dining',
        estimated_cost: 45,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80',
        location_name: '8 Southwark St, London SE1',
        rating: 4.92
      },
      {
        title: 'British Museum Guided Highlights',
        description: 'View the Rosetta Stone, Parthenon Sculptures, and Egyptian mummies beneath the magnificent Great Court glass roof.',
        category: 'Culture & History',
        estimated_cost: 15,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
        location_name: 'Great Russell St, Bloomsbury',
        rating: 4.9
      },
      {
        title: 'Hyde Park Serpentine Boating & Afternoon Tea',
        description: 'Rent a pedal boat on the Serpentine lake followed by traditional British afternoon tea with clotted cream scones.',
        category: 'Relaxation',
        estimated_cost: 40,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
        location_name: 'Hyde Park, Westminster',
        rating: 4.8
      }
    ]
  },
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    description: 'Australia’s shining harbor city famous for the Opera House sails, world-class surf beaches, and laid-back outdoor coastal lifestyle.',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    lat: -33.8688,
    lng: 151.2093,
    activities: [
      {
        title: 'Sydney Opera House Architectural Tour',
        description: 'Step inside the iconic white sails to learn about Jørn Utzon’s design and the acoustic wonders of the concert halls.',
        category: 'Sightseeing',
        estimated_cost: 30,
        estimated_duration_min: 60,
        image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
        location_name: 'Bennelong Point, Sydney NSW',
        rating: 4.92
      },
      {
        title: 'Bondi to Coogee Coastal Cliff Walk',
        description: 'Trek along dramatic ocean cliffs, secluded beaches, and natural rock pools with breathtaking Pacific views.',
        category: 'Adventure',
        estimated_cost: 0,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
        location_name: 'Bondi Beach, NSW',
        rating: 4.95
      },
      {
        title: 'Harbour Bridge Summit Twilight Climb',
        description: 'Climb 134 meters above Sydney Harbour for the ultimate adrenaline rush and sunset panoramas.',
        category: 'Adventure',
        estimated_cost: 190,
        estimated_duration_min: 210,
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
        location_name: '3 Cumberland St, The Rocks',
        rating: 4.98
      },
      {
        title: 'Sydney Fish Market Seafood Tasting',
        description: 'Sample Sydney rock oysters, king prawns, grilled Moreton Bay bugs, and sashimi straight from the auction floor.',
        category: 'Food & Dining',
        estimated_cost: 45,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        location_name: 'Bank St, Pyrmont',
        rating: 4.82
      },
      {
        title: 'Manly Ferry Ride & Beach Relaxation',
        description: 'Catch the famous green-and-yellow ferry across the harbor to Manly for relaxed beach vibes and gelato.',
        category: 'Relaxation',
        estimated_cost: 15,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        location_name: 'Circular Quay to Manly Wharf',
        rating: 4.88
      }
    ]
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    description: 'A dramatic coastal gem situated where two oceans meet, framed by flat-topped Table Mountain, vineyard valleys, and penguin beaches.',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    lat: -33.9249,
    lng: 18.4241,
    activities: [
      {
        title: 'Table Mountain Cableway & Plateau Hike',
        description: 'Take the rotating cable car to the top of Table Mountain and hike among rare fynbos vegetation overlooking the Atlantic Ocean.',
        category: 'Adventure',
        estimated_cost: 25,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
        location_name: 'Tafelberg Rd, Cape Town',
        rating: 4.95
      },
      {
        title: 'Boulders Beach African Penguin Colony Visit',
        description: 'Walk on wooden boardwalks right beside hundreds of wild African penguins waddling along granite boulders.',
        category: 'Sightseeing',
        estimated_cost: 12,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        location_name: 'Simon’s Town, False Bay',
        rating: 4.9
      },
      {
        title: 'Cape Winelands Wine & Cheese Tasting Tour',
        description: 'Tour historic estates in Stellenbosch and Franschhoek tasting Pinotage wines paired with artisanal cheeses and chocolates.',
        category: 'Food & Dining',
        estimated_cost: 65,
        estimated_duration_min: 240,
        image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        location_name: 'Stellenbosch & Franschhoek',
        rating: 4.96
      },
      {
        title: 'Robben Island Historic Nelson Mandela Tour',
        description: 'Ferry across the bay and tour the maximum security prison where Nelson Mandela spent 18 years, guided by a former political prisoner.',
        category: 'Culture & History',
        estimated_cost: 30,
        estimated_duration_min: 210,
        image_url: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=800&q=80',
        location_name: 'V&A Waterfront Ferry Terminal',
        rating: 4.88
      },
      {
        title: 'Kirstenbosch Botanical Gardens Canopy Walk',
        description: 'Stroll along the Boomslang treetop canopy walkway through lush indigenous flora on the slopes of Table Mountain.',
        category: 'Relaxation',
        estimated_cost: 10,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        location_name: 'Rhodes Dr, Newlands',
        rating: 4.85
      }
    ]
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80',
    description: 'Renowned for its ring of 17th-century canals, historic gabled townhouses, vibrant cycling culture, and world-class art institutions.',
    currency: 'EUR',
    timezone: 'Europe/Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    activities: [
      {
        title: 'Canal Ring Classic Boat Tour & Dutch Cheeses',
        description: 'Cruise through the UNESCO-listed canal rings while sampling Gouda cheeses and crisp craft beer.',
        category: 'Relaxation',
        estimated_cost: 25,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
        location_name: 'Prinsengracht Canal',
        rating: 4.9
      },
      {
        title: 'Van Gogh Museum Immersive Masterpieces',
        description: 'Explore the world’s largest collection of paintings and drawings by Vincent van Gogh including Sunflowers and Almond Blossom.',
        category: 'Culture & History',
        estimated_cost: 22,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
        location_name: 'Museumplein 6, 1071 DJ',
        rating: 4.93
      },
      {
        title: 'Jordaan Neighborhood Bicycle Tour',
        description: 'Cycle like a local through leafy cobblestone streets, quirky boutiques, and secret courtyard gardens.',
        category: 'Adventure',
        estimated_cost: 20,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
        location_name: 'Jordaan District',
        rating: 4.85
      },
      {
        title: 'Albert Cuyp Market Stroopwafel & Herring Tasting',
        description: 'Watch hot caramel stroopwafels pressed fresh before your eyes, and try traditional pickled Dutch herring with onions.',
        category: 'Food & Dining',
        estimated_cost: 25,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        location_name: 'Albert Cuypstraat, De Pijp',
        rating: 4.88
      },
      {
        title: 'Rijksmuseum Dutch Masters & Rembrandt',
        description: 'Admire Rembrandt’s legendary The Night Watch and Vermeer’s The Milkmaid in the grandeur of the National Museum.',
        category: 'Culture & History',
        estimated_cost: 24,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
        location_name: 'Museumstraat 1, 1071 XX',
        rating: 4.95
      }
    ]
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    description: 'A sensory wonderland of gilded Buddhist temples, bustling floating markets, sensory street food stalls, and electric rooftop nightlife.',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    activities: [
      {
        title: 'Grand Palace & Temple of the Emerald Buddha',
        description: 'Be mesmerized by intricate gold spires, glittering mosaics, and sacred royal courtyards in the heart of historic Bangkok.',
        category: 'Culture & History',
        estimated_cost: 15,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
        location_name: 'Na Phra Lan Rd, Phra Borom Maha Ratchawang',
        rating: 4.92
      },
      {
        title: 'Chinatown (Yaowarat) Night Street Food Safari',
        description: 'Ride a tuk-tuk into bustling Yaowarat for crispy pork belly, Michelin-starred pad thai, dim sum, and sweet mango sticky rice.',
        category: 'Food & Dining',
        estimated_cost: 25,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        location_name: 'Yaowarat Rd, Samphanthawong',
        rating: 4.98
      },
      {
        title: 'Damnoen Saduak Floating Market Longtail Boat',
        description: 'Paddle past wooden stilt houses as vendor boats pile high with tropical dragon fruits, pad thai, and coconut ice cream.',
        category: 'Adventure',
        estimated_cost: 35,
        estimated_duration_min: 240,
        image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
        location_name: 'Ratchaburi Province, Bangkok',
        rating: 4.78
      },
      {
        title: 'Wat Arun (Temple of Dawn) Sunset Riverside View',
        description: 'Marvel at the porcelain-encrusted prang tower illuminated as the sun sets over the Chao Phraya River.',
        category: 'Sightseeing',
        estimated_cost: 5,
        estimated_duration_min: 75,
        image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
        location_name: 'Bangkok Yai, Thonburi',
        rating: 4.88
      },
      {
        title: 'Traditional Thai Herbal Spa & Massage',
        description: 'Rejuvenate your body with ancient Thai acupressure stretching and warm herbal compress therapy.',
        category: 'Relaxation',
        estimated_cost: 30,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        location_name: 'Sukhumvit, Bangkok',
        rating: 4.94
      }
    ]
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'Americas',
    image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    description: 'The Marvelous City enchants with dramatic coastal mountains, Copacabana and Ipanema beaches, pulsating samba rhythms, and warm hospitality.',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    lat: -22.9068,
    lng: -43.1729,
    activities: [
      {
        title: 'Christ the Redeemer & Corcovado Train',
        description: 'Take the cogwheel railway through the lush Tijuca rainforest up to the 30-meter art deco statue of Christ overlooking Rio.',
        category: 'Sightseeing',
        estimated_cost: 25,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        location_name: 'Corcovado Mountain, Parque Nacional da Tijuca',
        rating: 4.95
      },
      {
        title: 'Sugarloaf Mountain Cable Car Sunset',
        description: 'Ascend in glass cable cars to Sugarloaf peak for 360-degree views of Guanabara Bay and golden Atlantic sunsets.',
        category: 'Sightseeing',
        estimated_cost: 30,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=800&q=80',
        location_name: 'Urca, Rio de Janeiro',
        rating: 4.92
      },
      {
        title: 'Ipanema Beach Walk & Acai Bowls',
        description: 'Stroll along the world-famous patterned mosaic promenade, sip fresh coconut water, and watch local beach volleyball.',
        category: 'Relaxation',
        estimated_cost: 8,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        location_name: 'Posto 9, Ipanema Beach',
        rating: 4.88
      },
      {
        title: 'Santa Teresa Historic Tram & Selarón Steps',
        description: 'Climb the 215 vibrantly tiled steps handcrafted by Jorge Selarón and explore bohemian hilltop art studios.',
        category: 'Culture & History',
        estimated_cost: 10,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        location_name: 'Rua Manuel Carneiro, Lapa',
        rating: 4.86
      },
      {
        title: 'Tijuca Forest Waterfall Hike & Hang Gliding',
        description: 'Trek into the world’s largest urban rainforest to hidden waterfalls or tandem hang glide over São Conrado beach.',
        category: 'Adventure',
        estimated_cost: 140,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        location_name: 'Pedra Bonita, São Conrado',
        rating: 4.97
      }
    ]
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    description: 'An ultramodern futuristic oasis of record-breaking architecture, luxury shopping, desert adventures, and opulent beachfront resorts.',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    lat: 25.2048,
    lng: 55.2708,
    activities: [
      {
        title: 'Burj Khalifa 148th Floor Sky Deck',
        description: 'Ascend to the tallest observation platform on earth in the world’s tallest tower for unmatched views across the Arabian Gulf.',
        category: 'Sightseeing',
        estimated_cost: 85,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
        location_name: '1 Sheikh Mohammed bin Rashid Blvd, Downtown',
        rating: 4.92
      },
      {
        title: 'Red Dune Desert Safari & Bedouin BBQ Dinner',
        description: 'Experience exhilarating 4x4 dune bashing, sandboarding, camel riding, and a barbecue dinner under the starry desert sky.',
        category: 'Adventure',
        estimated_cost: 65,
        estimated_duration_min: 360,
        image_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=800&q=80',
        location_name: 'Lahbab Red Dunes Desert',
        rating: 4.96
      },
      {
        title: 'Dubai Marina Luxury Yacht Cruise',
        description: 'Glide past the illuminated towers of Dubai Marina, Ain Dubai ferris wheel, and Atlantis The Palm with refreshing drinks.',
        category: 'Relaxation',
        estimated_cost: 50,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
        location_name: 'Dubai Marina Yacht Club',
        rating: 4.88
      },
      {
        title: 'Old Dubai Gold & Spice Souk Abra Tour',
        description: 'Ride a wooden Abra boat across Dubai Creek to explore fragrant saffron, cardamom, and glittering jewelry souks.',
        category: 'Culture & History',
        estimated_cost: 15,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
        location_name: 'Deira & Al Fahidi Historic District',
        rating: 4.84
      },
      {
        title: 'Museum of the Future Interactive Journey',
        description: 'Step 50 years into humanity’s future inside the torus-shaped architectural masterpiece inscribed with Arabic poetry.',
        category: 'Sightseeing',
        estimated_cost: 40,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        location_name: 'Sheikh Zayed Rd, Trade Centre',
        rating: 4.9
      }
    ]
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Europe',
    image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    description: 'The world’s northernmost capital features vibrant colorful houses, geothermal lagoons, volcanic landscapes, and Northern Lights.',
    currency: 'ISK',
    timezone: 'Atlantic/Reykjavik',
    lat: 64.1466,
    lng: -21.9426,
    activities: [
      {
        title: 'Blue Lagoon Geothermal Spa & Silica Mask',
        description: 'Soak in the milky blue mineral-rich geothermal waters surrounded by black volcanic lava fields with a rejuvenating silica mud mask.',
        category: 'Relaxation',
        estimated_cost: 85,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        location_name: 'Grindavík, Reykjanes Peninsula',
        rating: 4.95
      },
      {
        title: 'Golden Circle Geysir, Gullfoss & Thingvellir',
        description: 'Witness exploding hot geysers, the massive roaring Gullfoss waterfall, and walk the rift valley between continental plates.',
        category: 'Sightseeing',
        estimated_cost: 60,
        estimated_duration_min: 420,
        image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
        location_name: 'South Iceland Golden Circle',
        rating: 4.97
      },
      {
        title: 'Aurora Borealis Northern Lights Hunt',
        description: 'Venture into the dark Icelandic wilderness with an expert astronomer to capture the ethereal green dancing lights.',
        category: 'Adventure',
        estimated_cost: 75,
        estimated_duration_min: 240,
        image_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
        location_name: 'Thingvellir National Park',
        rating: 4.92
      },
      {
        title: 'Hallgrimskirkja Tower & City Center Walk',
        description: 'Visit Iceland’s famous basalt-inspired cathedral and take the elevator up the bell tower for panoramic views of colorful rooftops.',
        category: 'Culture & History',
        estimated_cost: 10,
        estimated_duration_min: 60,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        location_name: 'Hallgrímstorg 1, 101 Reykjavík',
        rating: 4.86
      },
      {
        title: 'Reykjavik Seafood & Rye Bread Ice Cream Tasting',
        description: 'Taste fresh arctic char, langoustine soup, traditional plokkfiskur fish stew, and rye bread ice cream.',
        category: 'Food & Dining',
        estimated_cost: 55,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        location_name: 'Old Harbour, Grandi District',
        rating: 4.89
      }
    ]
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    description: 'A futuristic garden city that blends multicultural heritage, world-renowned hawker food, innovative eco-architecture, and lush tropical parks.',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    lat: 1.3521,
    lng: 103.8198,
    activities: [
      {
        title: 'Gardens by the Bay & Supertree Grove Light Show',
        description: 'Walk the OCBC Skyway among colossal vertical gardens and witness the dazzling nightly Garden Rhapsody sound and light show.',
        category: 'Sightseeing',
        estimated_cost: 25,
        estimated_duration_min: 150,
        image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
        location_name: '18 Marina Gardens Dr',
        rating: 4.96
      },
      {
        title: 'Marina Bay Sands SkyPark Observation Deck',
        description: 'Marvel at Singapore’s futuristic skyline, Singapore Strait ship traffic, and the iconic cantilever deck 57 stories in the air.',
        category: 'Sightseeing',
        estimated_cost: 28,
        estimated_duration_min: 90,
        image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
        location_name: '10 Bayfront Ave, Marina Bay',
        rating: 4.88
      },
      {
        title: 'Chinatown & Maxwell Hawker Feast',
        description: 'Savor world-famous Tian Tian Hainanese Chicken Rice, char kway teow noodles, satay skewers, and fresh sugar cane juice.',
        category: 'Food & Dining',
        estimated_cost: 20,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        location_name: '1 Kadayanallur St, Maxwell Food Centre',
        rating: 4.94
      },
      {
        title: 'Singapore Night Safari Tram Adventure',
        description: 'Traverse illuminated rainforest habitats to observe over 900 nocturnal animals in the world’s first nocturnal wildlife park.',
        category: 'Adventure',
        estimated_cost: 45,
        estimated_duration_min: 180,
        image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        location_name: '80 Mandai Lake Rd',
        rating: 4.9
      },
      {
        title: 'Singapore Botanic Gardens Orchid Paradise Walk',
        description: 'Explore the UNESCO World Heritage tropical garden boasting over 1,000 species and 2,000 hybrids of exotic orchids.',
        category: 'Relaxation',
        estimated_cost: 10,
        estimated_duration_min: 120,
        image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        location_name: '1 Cluny Rd, Tanglin',
        rating: 4.89
      }
    ]
  }
];

async function main() {
  console.log('🌱 Starting GlobeTrotter database seed...');

  // 1. Clean existing records (in proper reverse dependency order)
  await prisma.budgetEntry.deleteMany();
  await prisma.tripActivity.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const traveler = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'traveler@globetrotter.com',
      password_hash: passwordHash,
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Wanderlust explorer, food enthusiast, and amateur photographer traveling to all 7 continents.'
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Elena',
      email: 'admin@globetrotter.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      bio: 'GlobeTrotter Lead Platform Administrator.'
    }
  });

  console.log(`✅ Created users: ${traveler.email} (user) & ${admin.email} (admin)`);

  // 3. Create Cities & Activities
  const createdCities = {};
  for (const cityData of CITIES) {
    const { activities, ...cityProps } = cityData;
    const city = await prisma.city.create({
      data: {
        ...cityProps,
        activities: {
          create: activities
        }
      },
      include: {
        activities: true
      }
    });
    createdCities[city.name] = city;
  }
  console.log(`✅ Seeded ${Object.keys(createdCities).length} world cities with 75+ curated activities.`);

  // 4. Create Demo Multi-City Trip for Alex Rivera
  const paris = createdCities['Paris'];
  const rome = createdCities['Rome'];
  const barcelona = createdCities['Barcelona'];

  const demoTrip = await prisma.trip.create({
    data: {
      user_id: traveler.id,
      title: 'Grand European Summer Odyssey',
      description: 'A 10-day classic journey through the art of Paris, imperial ruins of Rome, and sun-drenched architecture of Barcelona.',
      start_date: '2026-09-10',
      end_date: '2026-09-20',
      cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      is_public: true,
      public_slug: 'euro-odyssey-2026',
      target_budget: 2800,
      stops: {
        create: [
          {
            city_id: paris.id,
            stop_order: 1,
            arrival_date: '2026-09-10',
            departure_date: '2026-09-13',
            notes: 'Stay near Saint-Germain-des-Prés. Buy 3-day Paris Museum Pass.',
            budget_allocated: 950,
            trip_activities: {
              create: [
                {
                  activity_id: paris.activities[0].id, // Eiffel Tower
                  custom_cost: paris.activities[0].estimated_cost,
                  scheduled_date: '2026-09-10',
                  scheduled_time: '17:30',
                  notes: 'Book summit elevator tickets in advance for sunset.',
                  status: 'booked'
                },
                {
                  activity_id: paris.activities[1].id, // Louvre
                  custom_cost: paris.activities[1].estimated_cost,
                  scheduled_date: '2026-09-11',
                  scheduled_time: '10:00',
                  notes: 'Enter through the Carrousel entrance to avoid long lines.',
                  status: 'planned'
                },
                {
                  activity_id: paris.activities[2].id, // Montmartre Food Tasting
                  custom_cost: paris.activities[2].estimated_cost,
                  scheduled_date: '2026-09-12',
                  scheduled_time: '14:00',
                  notes: 'Save room for fresh macarons and artisanal cheeses.',
                  status: 'planned'
                }
              ]
            }
          },
          {
            city_id: rome.id,
            stop_order: 2,
            arrival_date: '2026-09-13',
            departure_date: '2026-09-16',
            notes: 'Take early morning flight from CDG to FCO. Hotel in Trastevere.',
            budget_allocated: 850,
            trip_activities: {
              create: [
                {
                  activity_id: rome.activities[0].id, // Colosseum
                  custom_cost: rome.activities[0].estimated_cost,
                  scheduled_date: '2026-09-14',
                  scheduled_time: '09:30',
                  notes: 'Meet guide by the Arch of Constantine.',
                  status: 'planned'
                },
                {
                  activity_id: rome.activities[2].id, // Pasta masterclass
                  custom_cost: rome.activities[2].estimated_cost,
                  scheduled_date: '2026-09-15',
                  scheduled_time: '18:00',
                  notes: 'Learn authentic cacio e pepe and carbonara secrets!',
                  status: 'booked'
                }
              ]
            }
          },
          {
            city_id: barcelona.id,
            stop_order: 3,
            arrival_date: '2026-09-16',
            departure_date: '2026-09-20',
            notes: 'High-speed flight to BCN. Beachfront Airbnb in Poblenou.',
            budget_allocated: 1000,
            trip_activities: {
              create: [
                {
                  activity_id: barcelona.activities[0].id, // Sagrada Familia
                  custom_cost: barcelona.activities[0].estimated_cost,
                  scheduled_date: '2026-09-17',
                  scheduled_time: '11:00',
                  notes: 'Audio guide downloaded. Nativity façade tower climb.',
                  status: 'booked'
                },
                {
                  activity_id: barcelona.activities[2].id, // Tapas Crawl
                  custom_cost: barcelona.activities[2].estimated_cost,
                  scheduled_date: '2026-09-18',
                  scheduled_time: '20:00',
                  notes: 'Tasting menu with cava pairings.',
                  status: 'planned'
                },
                {
                  activity_id: barcelona.activities[3].id, // Sunset Sailing
                  custom_cost: barcelona.activities[3].estimated_cost,
                  scheduled_date: '2026-09-19',
                  scheduled_time: '18:30',
                  notes: 'Pack a light windbreaker for the catamaran.',
                  status: 'planned'
                }
              ]
            }
          }
        ]
      },
      budget_entries: {
        create: [
          {
            category: 'Flights & Transport',
            description: 'Roundtrip Flights & European Rail Connections',
            amount: 720,
            date: '2026-09-10',
            expense_type: 'actual'
          },
          {
            category: 'Accommodation',
            description: 'Boutique Hotels in Paris & Rome + Barcelona Airbnb',
            amount: 1100,
            date: '2026-09-10',
            expense_type: 'actual'
          },
          {
            category: 'Food & Dining',
            description: 'Daily dining & cafe allowance ($60/day)',
            amount: 600,
            date: '2026-09-10',
            expense_type: 'planned'
          }
        ]
      }
    }
  });

  console.log(`✅ Seeded demo trip: "${demoTrip.title}" (slug: ${demoTrip.public_slug})`);
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
