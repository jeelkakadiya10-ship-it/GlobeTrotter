import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GlobeTrotter database...');

  // Create demo admin and demo user
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const userPassword = await bcrypt.hash('password1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@globetrotter.com',
      password_hash: adminPassword,
      role: 'admin',
      language_pref: 'en',
      profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    }
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'traveler@globetrotter.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'traveler@globetrotter.com',
      password_hash: userPassword,
      role: 'user',
      language_pref: 'en',
      profile_photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'
    }
  });

  console.log('Created demo users:', { admin: admin.email, user: demoUser.email });

  const citiesData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 98,
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      activities: [
        { name: 'Eiffel Tower Summit Access', category: 'sightseeing', description: 'Take the elevator to the top for panoramic views of Paris.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', estimated_cost: 35.00, estimated_duration_mins: 150 },
        { name: 'Louvre Museum Guided Tour', category: 'culture', description: 'Explore masterpieces including the Mona Lisa and Venus de Milo.', image_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600', estimated_cost: 45.00, estimated_duration_mins: 180 },
        { name: 'Seine River Sunset Cruise', category: 'sightseeing', description: 'Relaxing boat cruise along the historic Seine river bridges.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600', estimated_cost: 22.00, estimated_duration_mins: 75 },
        { name: 'Montmartre Food & Wine Tasting', category: 'food', description: 'Taste artisan cheeses, cured meats, and fresh baguettes in bohemian Montmartre.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', estimated_cost: 65.00, estimated_duration_mins: 120 },
        { name: 'Catacombs of Paris Underground Tour', category: 'adventure', description: 'Walk through the underground labyrinth of historic Paris.', image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600', estimated_cost: 29.00, estimated_duration_mins: 90 },
        { name: 'Pastry & Croissant Masterclass', category: 'food', description: 'Learn to bake authentic French croissants with a Parisian chef.', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', estimated_cost: 75.00, estimated_duration_mins: 150 }
      ]
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      cost_index: 4,
      popularity_score: 97,
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
      activities: [
        { name: 'teamLab Borderless Digital Art Museum', category: 'culture', description: 'Immersive 3D interactive light and digital art installations.', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600', estimated_cost: 38.00, estimated_duration_mins: 120 },
        { name: 'Shibuya Crossing & Hachiko Statue', category: 'sightseeing', description: 'Experience the worlds busiest pedestrian crossing and iconic statue.', image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600', estimated_cost: 0.00, estimated_duration_mins: 45 },
        { name: 'Tsukiji Outer Market Food Tour', category: 'food', description: 'Sample fresh sushi, wagyu skewers, and tamagoyaki.', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', estimated_cost: 55.00, estimated_duration_mins: 120 },
        { name: 'Senso-ji Temple & Asakusa Walking Tour', category: 'culture', description: 'Tokyos oldest Buddhist temple with traditional Nakamise street.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600', estimated_cost: 15.00, estimated_duration_mins: 90 },
        { name: 'Mount Fuji Day Trip & Lake Kawaguchi', category: 'adventure', description: 'Scenic coach excursion with stunning views of Mt. Fuji.', image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600', estimated_cost: 95.00, estimated_duration_mins: 480 }
      ]
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
      activities: [
        { name: 'Colosseum & Roman Forum Priority Entry', category: 'sightseeing', description: 'Walk where gladiators fought and explore ancient Rome ruins.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', estimated_cost: 40.00, estimated_duration_mins: 180 },
        { name: 'Vatican Museums & Sistine Chapel', category: 'culture', description: 'See Michelangelo legendary frescoes and St. Peter Basilica.', image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600', estimated_cost: 48.00, estimated_duration_mins: 210 },
        { name: 'Trastevere Evening Food & Wine Walking Tour', category: 'food', description: 'Taste crispy Roman pizza, cacio e pepe, and artisanal gelato.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', estimated_cost: 60.00, estimated_duration_mins: 150 },
        { name: 'Trevi Fountain & Spanish Steps Stroll', category: 'sightseeing', description: 'Toss a coin into Trevi Fountain and wander the baroque piazzas.', image_url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600', estimated_cost: 0.00, estimated_duration_mins: 60 },
        { name: 'Appian Way Electric Bike Tour', category: 'adventure', description: 'Cycle through the ancient catacombs and historic cobblestone roads.', image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600', estimated_cost: 50.00, estimated_duration_mins: 180 }
      ]
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 93,
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
      activities: [
        { name: 'Sagrada Familia Fast-Track Guided Tour', category: 'sightseeing', description: 'Gaudi iconic unfinished basilica with colorful stained glass.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600', estimated_cost: 35.00, estimated_duration_mins: 90 },
        { name: 'Park Guell Monumental Zone Tour', category: 'culture', description: 'Wander through Gaudi whimsical mosaic park overlooking the Mediterranean.', image_url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=600', estimated_cost: 18.00, estimated_duration_mins: 90 },
        { name: 'Tapas & Sangria Tour in Gothic Quarter', category: 'food', description: 'Sample Iberian ham, patatas bravas, and Spanish vermouth.', image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600', estimated_cost: 50.00, estimated_duration_mins: 150 },
        { name: 'Barceloneta Beach Paddleboarding', category: 'adventure', description: 'Morning paddle on the calm waters of Barcelona coastline.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 30.00, estimated_duration_mins: 90 },
        { name: 'Camp Nou & FC Barcelona Museum Experience', category: 'culture', description: 'Walk through the trophy room and stadium tunnel of Barca.', image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600', estimated_cost: 28.00, estimated_duration_mins: 120 }
      ]
    },
    {
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      cost_index: 5,
      popularity_score: 96,
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      activities: [
        { name: 'Statue of Liberty & Ellis Island Ferry', category: 'sightseeing', description: 'Cruise to Liberty Island and explore immigration history.', image_url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=600', estimated_cost: 32.00, estimated_duration_mins: 180 },
        { name: 'Summit One Vanderbilt Observation Deck', category: 'adventure', description: 'Multi-sensory mirrored observatory high above Manhattan.', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600', estimated_cost: 49.00, estimated_duration_mins: 90 },
        { name: 'Broadway Musical Evening Show', category: 'culture', description: 'Watch an award-winning theatrical performance in Times Square.', image_url: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=600', estimated_cost: 110.00, estimated_duration_mins: 150 },
        { name: 'Central Park Bike Tour & Picnic', category: 'sightseeing', description: 'Cycle through Bethesda Terrace, Bow Bridge, and Strawberry Fields.', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600', estimated_cost: 25.00, estimated_duration_mins: 120 },
        { name: 'Chinatown & Little Italy Street Food Walk', category: 'food', description: 'Taste soup dumplings, fresh cannoli, and classic NY pizza.', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', estimated_cost: 45.00, estimated_duration_mins: 120 }
      ]
    },
    {
      name: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 94,
      image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      activities: [
        { name: 'Tower of London & Crown Jewels', category: 'culture', description: 'Explore medieval fortress history and see the priceless Crown Jewels.', image_url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600', estimated_cost: 39.00, estimated_duration_mins: 150 },
        { name: 'London Eye Scenic Flight Capsule', category: 'sightseeing', description: '360-degree views of Big Ben, Westminster, and the Thames.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', estimated_cost: 38.00, estimated_duration_mins: 45 },
        { name: 'British Museum Guided Highlights', category: 'culture', description: 'See the Rosetta Stone, Parthenon sculptures, and Egyptian mummies.', image_url: 'https://images.unsplash.com/photo-1568285579953-b996767420be?w=600', estimated_cost: 20.00, estimated_duration_mins: 120 },
        { name: 'Borough Market Artisan Food Walk', category: 'food', description: 'Taste gourmet cheeses, scotch eggs, and fresh oysters.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', estimated_cost: 40.00, estimated_duration_mins: 90 },
        { name: 'Speedboat Adventure on River Thames', category: 'adventure', description: 'High-speed thrilling RIB boat ride passing Canary Wharf.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 55.00, estimated_duration_mins: 50 }
      ]
    },
    {
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      cost_index: 2,
      popularity_score: 92,
      image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
      activities: [
        { name: 'Grand Palace & Emerald Buddha Temple', category: 'culture', description: 'Spectacular royal complex with intricate golden spires.', image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600', estimated_cost: 15.00, estimated_duration_mins: 150 },
        { name: 'Chao Phraya River Longtail Boat Tour', category: 'sightseeing', description: 'Navigate the canals and see traditional waterborne life.', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600', estimated_cost: 25.00, estimated_duration_mins: 90 },
        { name: 'Michelin Street Food Tuk Tuk Safari', category: 'food', description: 'Zip around Old Town tasting Jay Fai crab omelet and Pad Thai.', image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600', estimated_cost: 35.00, estimated_duration_mins: 180 },
        { name: 'Wat Arun Dawn Temple Climb', category: 'sightseeing', description: 'Climb the decorated porcelain tower along the river.', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600', estimated_cost: 5.00, estimated_duration_mins: 60 },
        { name: 'Thai Cooking Class & Market Visit', category: 'food', description: 'Learn to cook authentic Tom Yum, Green Curry, and Mango Sticky Rice.', image_url: 'https://images.unsplash.com/photo-1507048259960-9389e0236a28?w=600', estimated_cost: 30.00, estimated_duration_mins: 210 }
      ]
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      cost_index: 4,
      popularity_score: 91,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      activities: [
        { name: 'Burj Khalifa Top Floor Observation', category: 'sightseeing', description: 'Look down from the 124th and 125th floors of the worlds tallest tower.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', estimated_cost: 45.00, estimated_duration_mins: 90 },
        { name: 'Desert Safari with Dune Bashing & BBQ', category: 'adventure', description: '4x4 thrilling dunes ride, camel trekking, and stargazing dinner.', image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600', estimated_cost: 70.00, estimated_duration_mins: 360 },
        { name: 'Museum of the Future Interactive Tour', category: 'culture', description: 'Explore futuristic technologies, AI, and space innovation.', image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600', estimated_cost: 40.00, estimated_duration_mins: 120 },
        { name: 'Dubai Marina Luxury Yacht Cruise', category: 'sightseeing', description: 'Sail past Ain Dubai and JBR with drinks and appetizers.', image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', estimated_cost: 65.00, estimated_duration_mins: 120 },
        { name: 'Old Dubai Gold & Spice Souk Walking Tour', category: 'culture', description: 'Cross Dubai Creek on an abra boat and haggle for rare saffron and perfumes.', image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600', estimated_cost: 20.00, estimated_duration_mins: 120 }
      ]
    },
    {
      name: 'Sydney',
      country: 'Australia',
      region: 'Oceania',
      cost_index: 4,
      popularity_score: 90,
      image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
      activities: [
        { name: 'Sydney Opera House Architectural Tour', category: 'culture', description: 'Go behind the scenes of the worlds most famous performing arts center.', image_url: 'https://images.unsplash.com/photo-1523428096881-5bd79d04330f?w=600', estimated_cost: 32.00, estimated_duration_mins: 60 },
        { name: 'Sydney Harbour BridgeClimb', category: 'adventure', description: 'Scale the iconic summit for breathtaking 360-degree harbour views.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600', estimated_cost: 180.00, estimated_duration_mins: 210 },
        { name: 'Bondi to Coogee Coastal Walk', category: 'sightseeing', description: 'Scenic cliffside walking trail passing ocean pools and beaches.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 0.00, estimated_duration_mins: 150 },
        { name: 'Taronga Zoo & Ferry Experience', category: 'adventure', description: 'Meet kangaroos and koalas with Sydney skyline in the backdrop.', image_url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600', estimated_cost: 35.00, estimated_duration_mins: 180 },
        { name: 'Sydney Fish Market Seafood Tasting', category: 'food', description: 'Freshly shucked Sydney rock oysters, grilled lobster, and sashimi.', image_url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600', estimated_cost: 45.00, estimated_duration_mins: 90 }
      ]
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      cost_index: 2,
      popularity_score: 89,
      image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
      activities: [
        { name: 'Table Mountain Cableway Summit', category: 'sightseeing', description: 'Revolving cable car ride to the flat top of iconic Table Mountain.', image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600', estimated_cost: 25.00, estimated_duration_mins: 120 },
        { name: 'Boulders Beach African Penguin Colony', category: 'adventure', description: 'Get up close with endangered wild African penguins on sandy coves.', image_url: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=600', estimated_cost: 12.00, estimated_duration_mins: 90 },
        { name: 'Cape of Good Hope & Peninsula Tour', category: 'sightseeing', description: 'Visit the southwestern tip of the African continent.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 40.00, estimated_duration_mins: 360 },
        { name: 'Cape Winelands Wine & Cheese Tasting', category: 'food', description: 'Tour Stellenbosch and Franschhoek historic vineyards.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', estimated_cost: 50.00, estimated_duration_mins: 300 },
        { name: 'Robben Island Historic Nelson Mandela Tour', category: 'culture', description: 'Ferry to the maximum-security prison led by former political prisoners.', image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', estimated_cost: 30.00, estimated_duration_mins: 210 }
      ]
    },
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 91,
      image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800',
      activities: [
        { name: 'Van Gogh Museum Entrance', category: 'culture', description: 'Admire Sunflowers, Almond Blossoms, and self-portraits.', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600', estimated_cost: 24.00, estimated_duration_mins: 120 },
        { name: 'Historic Canal Cruise by Night', category: 'sightseeing', description: 'Glide along UNESCO heritage canals lit by illuminated bridges.', image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600', estimated_cost: 20.00, estimated_duration_mins: 75 },
        { name: 'Jordaan District Bike Tour', category: 'adventure', description: 'Cycle through narrow streets, courtyards, and trendy boutiques.', image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600', estimated_cost: 28.00, estimated_duration_mins: 150 },
        { name: 'Dutch Cheese & Stroopwafel Tasting', category: 'food', description: 'Sample aged Gouda, Edam, and hot caramel stroopwafels.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', estimated_cost: 30.00, estimated_duration_mins: 60 },
        { name: 'Rijksmuseum Guided Masterpieces', category: 'culture', description: 'Explore Rembrandt Night Watch and Vermeer Milkmaid.', image_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600', estimated_cost: 26.00, estimated_duration_mins: 120 }
      ]
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      cost_index: 3,
      popularity_score: 93,
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      activities: [
        { name: 'Fushimi Inari Shrine 10,000 Torii Gates Hike', category: 'sightseeing', description: 'Hike through endless vibrant vermilion torii gates winding up the sacred mountain.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600', estimated_cost: 0.00, estimated_duration_mins: 150 },
        { name: 'Arashiyama Bamboo Grove & Monkey Park', category: 'adventure', description: 'Walk through towering bamboo stalks and visit wild snow monkeys.', image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600', estimated_cost: 8.00, estimated_duration_mins: 120 },
        { name: 'Traditional Uji Matcha Tea Ceremony', category: 'culture', description: 'Learn zen mindfulness and prepare authentic stone-ground matcha.', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', estimated_cost: 35.00, estimated_duration_mins: 60 },
        { name: 'Gion Geisha District Evening Stroll', category: 'culture', description: 'Atmospheric walk past lantern-lit wooden machiya teahouses.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600', estimated_cost: 20.00, estimated_duration_mins: 90 },
        { name: 'Nishiki Market 400-Year Food Tour', category: 'food', description: 'Sample Kyoto delicacies, dashi omelets, and sesame dumplings.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', estimated_cost: 40.00, estimated_duration_mins: 90 }
      ]
    },
    {
      name: 'Prague',
      country: 'Czech Republic',
      region: 'Europe',
      cost_index: 2,
      popularity_score: 88,
      image_url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
      activities: [
        { name: 'Prague Castle Complex & St. Vitus Cathedral', category: 'sightseeing', description: 'Visit the largest ancient castle complex in the world.', image_url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600', estimated_cost: 16.00, estimated_duration_mins: 180 },
        { name: 'Charles Bridge & Astronomical Clock Tour', category: 'culture', description: 'Historical stroll across Gothic bridge with legendary statues.', image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600', estimated_cost: 12.00, estimated_duration_mins: 90 },
        { name: 'Traditional Czech Beer Spa & Tasting', category: 'adventure', description: 'Soak in warm oak tubs with natural hop extracts and unlimited beer.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', estimated_cost: 55.00, estimated_duration_mins: 60 },
        { name: 'Vltava River Kayaking Excursion', category: 'adventure', description: 'Paddle past swans with unique water views of Prague Old Town.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 25.00, estimated_duration_mins: 90 },
        { name: 'Old Bohemian Goulash & Trdelnik Food Tour', category: 'food', description: 'Indulge in hearty roasted pork knuckle, goulash, and chimney cakes.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', estimated_cost: 35.00, estimated_duration_mins: 120 }
      ]
    },
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      region: 'South America',
      cost_index: 2,
      popularity_score: 87,
      image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      activities: [
        { name: 'Christ the Redeemer Cog Train Tour', category: 'sightseeing', description: 'Ascend Corcovado Mountain to the legendary Art Deco wonder.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600', estimated_cost: 28.00, estimated_duration_mins: 150 },
        { name: 'Sugarloaf Mountain Cable Car Sunset', category: 'sightseeing', description: 'Two-stage glass cable car ride with panoramic ocean views.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 32.00, estimated_duration_mins: 120 },
        { name: 'Tandem Hang Gliding over Tijuca Forest', category: 'adventure', description: 'Soar through the tropical rainforest and land on Pepino Beach.', image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600', estimated_cost: 140.00, estimated_duration_mins: 120 },
        { name: 'Churrascaria Brazilian BBQ & Samba Night', category: 'food', description: 'All-you-can-eat prime meats paired with live samba rhythm.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', estimated_cost: 45.00, estimated_duration_mins: 150 },
        { name: 'Selaron Steps & Santa Teresa Bohemian Walk', category: 'culture', description: 'Climb the 215 colorful ceramic mosaic steps of Jorge Selaron.', image_url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=600', estimated_cost: 15.00, estimated_duration_mins: 90 }
      ]
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      region: 'Europe',
      cost_index: 5,
      popularity_score: 89,
      image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      activities: [
        { name: 'Blue Lagoon Geothermal Spa Comfort Ticket', category: 'adventure', description: 'Bathe in mineral-rich volcanic warm waters and silica mud mask.', image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600', estimated_cost: 85.00, estimated_duration_mins: 180 },
        { name: 'Golden Circle Tour (Gullfoss & Geysir)', category: 'sightseeing', description: 'See roaring waterfalls, erupting hot springs, and tectonic plates.', image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600', estimated_cost: 65.00, estimated_duration_mins: 420 },
        { name: 'Northern Lights Super Jeep Hunt', category: 'adventure', description: 'Chase the Aurora Borealis in dark wilderness away from light pollution.', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600', estimated_cost: 95.00, estimated_duration_mins: 240 },
        { name: 'South Coast Waterfalls & Black Sand Beach', category: 'sightseeing', description: 'Walk behind Seljalandsfoss and explore Reynisfjara basalt columns.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', estimated_cost: 75.00, estimated_duration_mins: 480 },
        { name: 'Icelandic Lamb Soup & Rye Bread Tasting', category: 'food', description: 'Taste hearty traditional slow-cooked mountain lamb soup.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', estimated_cost: 30.00, estimated_duration_mins: 60 }
      ]
    },
    {
      name: 'Cairo',
      country: 'Egypt',
      region: 'Africa',
      cost_index: 1,
      popularity_score: 86,
      image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800',
      activities: [
        { name: 'Giza Pyramids & Great Sphinx Camel Tour', category: 'sightseeing', description: 'Explore Khufu pyramid and ride camels across the desert plateau.', image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600', estimated_cost: 35.00, estimated_duration_mins: 210 },
        { name: 'Grand Egyptian Museum Antiquities', category: 'culture', description: 'Behold King Tutankhamun full gold treasures and ancient relics.', image_url: 'https://images.unsplash.com/photo-1568285579953-b996767420be?w=600', estimated_cost: 25.00, estimated_duration_mins: 180 },
        { name: 'Khan el-Khalili Bazaar Walking Tour', category: 'culture', description: 'Wander vibrant labyrinth market stalls with copper lamps and spices.', image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600', estimated_cost: 15.00, estimated_duration_mins: 120 },
        { name: 'Nile River Felucca Sunset Sailing', category: 'adventure', description: 'Sail on traditional wooden felucca boats while watching the sunset.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600', estimated_cost: 20.00, estimated_duration_mins: 90 },
        { name: 'Traditional Koshary & Shawarma Food Walk', category: 'food', description: 'Taste Egypt national dish with spiced chickpeas, lentils, and crispy onions.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', estimated_cost: 12.00, estimated_duration_mins: 90 }
      ]
    }
  ];

  for (const cityData of citiesData) {
    const { activities, ...cData } = cityData;
    const city = await prisma.city.create({
      data: {
        ...cData,
        activities: {
          create: activities
        }
      }
    });
    console.log('Created city: ' + city.name + ' (' + city.country + ') with ' + activities.length + ' activities');
  }

  // Create a starter sample trip for the demo user
  const sampleTrip = await prisma.trip.create({
    data: {
      user_id: demoUser.id,
      name: 'European Grand Tour',
      description: 'An unforgettable 10-day trip exploring the best of Paris, Rome, and Barcelona.',
      cover_photo_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      start_date: new Date('2026-09-10'),
      end_date: new Date('2026-09-20'),
      target_budget: 2500.00,
      is_public: true,
      public_slug: 'euro-tour-demo-2026',
      stops: {
        create: [
          {
            city_id: 1, // Paris
            arrival_date: new Date('2026-09-10'),
            departure_date: new Date('2026-09-13'),
            order_index: 1,
            trip_activities: {
              create: [
                { activity_id: 1, scheduled_date: new Date('2026-09-11'), scheduled_time: '10:00' },
                { activity_id: 2, scheduled_date: new Date('2026-09-12'), scheduled_time: '14:00' }
              ]
            }
          },
          {
            city_id: 3, // Rome
            arrival_date: new Date('2026-09-14'),
            departure_date: new Date('2026-09-17'),
            order_index: 2,
            trip_activities: {
              create: [
                { activity_id: 12, scheduled_date: new Date('2026-09-15'), scheduled_time: '09:30' },
                { activity_id: 14, scheduled_date: new Date('2026-09-16'), scheduled_time: '18:00' }
              ]
            }
          },
          {
            city_id: 4, // Barcelona
            arrival_date: new Date('2026-09-17'),
            departure_date: new Date('2026-09-20'),
            order_index: 3,
            trip_activities: {
              create: [
                { activity_id: 17, scheduled_date: new Date('2026-09-18'), scheduled_time: '11:00' }
              ]
            }
          }
        ]
      },
      budget_entries: {
        create: [
          { category: 'transport', amount: 350.00, note: 'Flight: Paris to Rome' },
          { category: 'stay', amount: 800.00, note: 'Boutique Hotels & Airbnbs' },
          { category: 'meals', amount: 400.00, note: 'Estimated dining & tapas' }
        ]
      }
    }
  });

  console.log('Created sample trip: ' + sampleTrip.name + ' (id: ' + sampleTrip.id + ')');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });