import { PrismaClient, Role, UserStatus, InventoryStatus, FuelType, Transmission, BodyType, ProductStatus, OrderStatus, PaymentStatus, PaymentMethod, AppointmentStatus, ReviewTargetType, InquiryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CarCraft database seed...');

  // Common demo password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Dealerships
  console.log('Creating Dealerships...');
  const dealershipsData = [
    {
      name: 'Apex Motors Mumbai',
      slug: 'apex-motors-mumbai',
      logo: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=200&auto=format&fit=crop&q=80',
      description: 'Premier flagship showroom and certified service hub located in Western Mumbai. Delivering luxury and high-performance mobility for over 15 years.',
      address: 'Plot 42, Link Road, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      contactNumber: '+91 98200 11223',
      email: 'mumbai@carcraft.local',
      operatingHours: '9:00 AM - 8:00 PM',
      status: 'ACTIVE',
    },
    {
      name: 'Silicon City Auto Bangalore',
      slug: 'silicon-city-auto-bangalore',
      logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200&auto=format&fit=crop&q=80',
      description: 'South Indias largest automotive experience center with dedicated EV diagnostic facilities and express parts delivery.',
      address: '88 Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      contactNumber: '+91 98450 44556',
      email: 'bangalore@carcraft.local',
      operatingHours: '9:30 AM - 7:30 PM',
      status: 'ACTIVE',
    },
    {
      name: 'Capital Wheels Delhi NCR',
      slug: 'capital-wheels-delhi-ncr',
      logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&auto=format&fit=crop&q=80',
      description: 'Exclusive multi-brand retail dealership and automated bodywork workshop serving Delhi, Noida, and Gurgaon.',
      address: 'Sector 29, City Center Boulevard',
      city: 'Gurugram',
      state: 'Haryana',
      contactNumber: '+91 98110 77889',
      email: 'delhi@carcraft.local',
      operatingHours: '9:00 AM - 8:00 PM',
      status: 'ACTIVE',
    },
    {
      name: 'Heritage Auto Pune',
      slug: 'heritage-auto-pune',
      logo: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=200&auto=format&fit=crop&q=80',
      description: 'Family-owned certified automotive dealership specializing in rugged SUVs, executive sedans, and high-quality accessories.',
      address: 'Plot 15, Senapati Bapat Road, Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      contactNumber: '+91 98230 99001',
      email: 'pune@carcraft.local',
      operatingHours: '9:30 AM - 7:00 PM',
      status: 'ACTIVE',
    }
  ];

  const dealerships = [];
  for (const d of dealershipsData) {
    const dealership = await prisma.dealership.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
    dealerships.push(dealership);
  }

  // 2. Create Users for all roles
  console.log('Creating Users...');
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carcraft.local' },
    update: { password: hashedPassword, role: Role.ADMIN, status: UserStatus.ACTIVE },
    create: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@carcraft.local',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '+91 99001 00001',
      status: UserStatus.ACTIVE,
    }
  });

  // Primary Dealer (assigned to Apex Motors Mumbai)
  const dealer = await prisma.user.upsert({
    where: { email: 'dealer@carcraft.local' },
    update: { password: hashedPassword, role: Role.DEALER, status: UserStatus.ACTIVE, dealershipId: dealerships[0].id },
    create: {
      name: 'Vikram Mehta (Apex Dealer)',
      email: 'dealer@carcraft.local',
      password: hashedPassword,
      role: Role.DEALER,
      phone: '+91 98200 99991',
      dealershipId: dealerships[0].id,
      status: UserStatus.ACTIVE,
    }
  });

  // Assign dealer to Mumbai dealership
  await prisma.dealership.update({
    where: { id: dealerships[0].id },
    data: { assignedDealerId: dealer.id }
  });

  // Dealer 2 for Bangalore
  const dealerBangalore = await prisma.user.upsert({
    where: { email: 'dealer.bangalore@carcraft.local' },
    update: { password: hashedPassword, role: Role.DEALER, dealershipId: dealerships[1].id },
    create: {
      name: 'Ananya Rao (BLR Dealer)',
      email: 'dealer.bangalore@carcraft.local',
      password: hashedPassword,
      role: Role.DEALER,
      phone: '+91 98450 11111',
      dealershipId: dealerships[1].id,
      status: UserStatus.ACTIVE,
    }
  });
  await prisma.dealership.update({
    where: { id: dealerships[1].id },
    data: { assignedDealerId: dealerBangalore.id }
  });

  // Primary Service Manager (assigned to Apex Motors Mumbai)
  const serviceManager = await prisma.user.upsert({
    where: { email: 'service@carcraft.local' },
    update: { password: hashedPassword, role: Role.SERVICE_MANAGER, status: UserStatus.ACTIVE, dealershipId: dealerships[0].id },
    create: {
      name: 'Sunil Deshmukh (Service Mgr)',
      email: 'service@carcraft.local',
      password: hashedPassword,
      role: Role.SERVICE_MANAGER,
      phone: '+91 98200 88882',
      dealershipId: dealerships[0].id,
      status: UserStatus.ACTIVE,
    }
  });

  // Primary Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@carcraft.local' },
    update: { password: hashedPassword, role: Role.CUSTOMER, status: UserStatus.ACTIVE },
    create: {
      name: 'Arjun Verma',
      email: 'customer@carcraft.local',
      password: hashedPassword,
      role: Role.CUSTOMER,
      phone: '+91 98765 43210',
      status: UserStatus.ACTIVE,
    }
  });

  // Additional 9 Customers
  const customerList = [customer];
  const additionalCustomers = [
    { name: 'Priya Iyer', email: 'priya.iyer@example.com', phone: '+91 98190 12345' },
    { name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 98110 23456' },
    { name: 'Kavita Nair', email: 'kavita.nair@example.com', phone: '+91 98480 34567' },
    { name: 'Aditya Kulkarni', email: 'aditya.k@example.com', phone: '+91 98220 45678' },
    { name: 'Meera Patel', email: 'meera.patel@example.com', phone: '+91 98790 56789' },
    { name: 'Siddharth Joshi', email: 'sid.joshi@example.com', phone: '+91 98230 67890' },
    { name: 'Neha Chawla', email: 'neha.c@example.com', phone: '+91 98100 78901' },
    { name: 'Deepak Reddy', email: 'deepak.reddy@example.com', phone: '+91 98490 89012' },
    { name: 'Sneha Sengupta', email: 'sneha.s@example.com', phone: '+91 98300 90123' },
  ];

  for (const c of additionalCustomers) {
    const cust = await prisma.user.upsert({
      where: { email: c.email },
      update: { password: hashedPassword, role: Role.CUSTOMER },
      create: {
        name: c.name,
        email: c.email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        phone: c.phone,
        status: UserStatus.ACTIVE,
      }
    });
    customerList.push(cust);
  }

  // 3. Create Service Categories
  console.log('Creating Service Categories...');
  const serviceCategoriesData = [
    {
      name: 'Periodic General Servicing',
      slug: 'general-servicing',
      description: 'Comprehensive 40-point vehicle inspection, fluid top-up, spark plug check, throttle body cleaning, and road test.',
      basePrice: 3499,
      durationMinutes: 90,
      icon: 'Wrench',
    },
    {
      name: 'Engine Oil & Filter Replacement',
      slug: 'oil-change',
      description: 'Full synthetic high-grade engine oil change with OEM oil filter, drain plug washer replacement, and emission check.',
      basePrice: 2299,
      durationMinutes: 45,
      icon: 'Droplet',
    },
    {
      name: 'Brake Overhaul & Inspection',
      slug: 'brake-inspection',
      description: 'Front and rear brake pads inspection, disc skimming, caliper greasing, brake fluid bleeding and safety test.',
      basePrice: 1899,
      durationMinutes: 60,
      icon: 'ShieldCheck',
    },
    {
      name: 'Computer Diagnostics & Scan',
      slug: 'engine-diagnostics',
      description: 'Advanced OBD-II ECU system health scan, sensor calibration, error code clearance, and electrical component check.',
      basePrice: 1299,
      durationMinutes: 40,
      icon: 'Cpu',
    },
    {
      name: 'AC Disinfection & Gas Refill',
      slug: 'ac-servicing',
      description: 'Cabin air filter cleansing, AC condenser washing, refrigerant gas charging, compressor leak detection, and deodorization.',
      basePrice: 2799,
      durationMinutes: 75,
      icon: 'Wind',
    },
    {
      name: 'Battery Health & Terminal Check',
      slug: 'battery-replacement',
      description: 'Voltage output test, alternator charging load analysis, terminal anti-corrosion grease application and battery health certification.',
      basePrice: 799,
      durationMinutes: 30,
      icon: 'BatteryCharging',
    },
    {
      name: '3D Wheel Alignment & Balancing',
      slug: 'wheel-alignment',
      description: 'Laser guided 3D wheel alignment, automated computerized wheel dynamic balancing with lead weights, and tire rotation.',
      basePrice: 1199,
      durationMinutes: 50,
      icon: 'CircleDot',
    },
    {
      name: 'Deep Wash & Ceramic Detailing',
      slug: 'washing-detailing',
      description: 'High-pressure foam exterior wash, underbody rust protection wash, interior steam sanitization, and 3-month ceramic paint sealant wax.',
      basePrice: 2999,
      durationMinutes: 120,
      icon: 'Sparkles',
    },
  ];

  const serviceCategories = [];
  for (const sc of serviceCategoriesData) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: sc.slug },
      update: sc,
      create: sc,
    });
    serviceCategories.push(category);
  }

  // Create Service Slots for Mumbai Dealership
  console.log('Creating Service Slots...');
  const timeSlots = ['09:00 - 10:30', '10:30 - 12:00', '12:00 - 01:30', '02:30 - 04:00', '04:00 - 05:30', '05:30 - 07:00'];
  for (let day = 1; day <= 6; day++) { // Mon - Sat
    for (const slot of timeSlots) {
      const [start, end] = slot.split(' - ');
      await prisma.serviceSlot.upsert({
        where: {
          dealershipId_dayOfWeek_startTime: {
            dealershipId: dealerships[0].id,
            dayOfWeek: day,
            startTime: start,
          }
        },
        update: { endTime: end, maxCapacity: 4, isActive: true },
        create: {
          dealershipId: dealerships[0].id,
          dayOfWeek: day,
          startTime: start,
          endTime: end,
          maxCapacity: 4,
          isActive: true,
        }
      });
    }
  }

  // 4. Create Product Categories
  console.log('Creating Product Categories...');
  const productCategoriesData = [
    { name: 'Car Accessories', slug: 'car-accessories', description: 'Universal accessories, covers, organizers and utility kits for your automobile.' },
    { name: 'Interior Accessories', slug: 'interior-accessories', description: 'Luxury seat covers, 7D floor mats, sunshades, steering covers, and ambient cabin lighting.' },
    { name: 'Exterior Accessories', slug: 'exterior-accessories', description: 'Mud flaps, door visors, chrome garnishes, car body covers, and roof luggage carriers.' },
    { name: 'Car Electronics', slug: 'car-electronics', description: 'Dash cameras, wireless Apple CarPlay/Android Auto dongles, GPS trackers, and tire pressure monitors.' },
    { name: 'Cleaning & Detailing', slug: 'cleaning-products', description: 'Microfiber towels, ceramic spray coatings, shampoo wash, dashboard polish, and vacuum cleaners.' },
    { name: 'Safety Equipment', slug: 'safety-equipment', description: 'Emergency puncture repair kits, emergency glass hammers, jumper cables, and fire extinguishers.' },
    { name: 'Spare Parts & Maintenance', slug: 'spare-parts', description: 'Wiper blades, cabin filters, engine air filters, brake pads, and halogen/LED headlights.' },
    { name: 'Performance Upgrades', slug: 'performance-accessories', description: 'High-flow air filters, suspension buffer dampeners, exhaust tips, and throttle boosters.' },
  ];

  const productCategories = [];
  for (const pc of productCategoriesData) {
    const category = await prisma.productCategory.upsert({
      where: { slug: pc.slug },
      update: pc,
      create: pc,
    });
    productCategories.push(category);
  }

  // 5. Create 32+ Automotive Products
  console.log('Creating Products...');
  const productsData = [
    // Interior Accessories
    {
      categoryIndex: 1,
      name: 'Custom 7D All-Weather Floor Mats',
      slug: 'custom-7d-floor-mats',
      description: 'Diamond stitch laser-cut custom floor mats with detachable curly mat layer for complete dirt entrapment and waterproof protection.',
      brand: 'AutoArmor',
      sku: 'AA-MAT-7D-01',
      price: 4999,
      discountPrice: 3899,
      stockQuantity: 45,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 1,
      name: 'Memory Foam Lumbar Support & Neck Pillow Kit',
      slug: 'memory-foam-neck-lumbar-pillow',
      description: 'Ergonomic high-density memory foam cushion pair designed to alleviate spine fatigue during highway cruising.',
      brand: 'ComfortDrive',
      sku: 'CD-PLW-02',
      price: 1899,
      discountPrice: 1499,
      stockQuantity: 80,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 1,
      name: 'App-Controlled Symphony Ambient LED Lighting Kit',
      slug: 'ambient-led-lighting-kit',
      description: '64-color acrylic optical fiber ambient light strips with rhythm music sync and Bluetooth smartphone application.',
      brand: 'GlowRider',
      sku: 'GR-AMB-64C',
      price: 3499,
      discountPrice: 2799,
      stockQuantity: 35,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 1,
      name: 'Magnetic Snap-On Window Sunshades (Set of 4)',
      slug: 'magnetic-window-sunshades',
      description: 'Tailor-fit magnetic mesh curtains offering 90% UV rejection and heat shielding without obstructing window operation.',
      brand: 'SunShield Pro',
      sku: 'SS-SHD-M04',
      price: 1599,
      discountPrice: 1199,
      stockQuantity: 60,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80']
    },

    // Car Electronics
    {
      categoryIndex: 3,
      name: '4K Ultra-HD Dual Dashcam with Night Vision & GPS',
      slug: '4k-uhd-dual-dashcam-gps',
      description: 'Dual channel Sony Starvis sensor front 4K and rear 1080p camera with G-sensor collision lock and 24h parking surveillance mode.',
      brand: 'VisionDrive',
      sku: 'VD-CAM-4K01',
      price: 11999,
      discountPrice: 9499,
      stockQuantity: 25,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 3,
      name: 'Wireless Apple CarPlay & Android Auto AI Adapter',
      slug: 'wireless-carplay-android-auto-adapter',
      description: 'Converts factory wired CarPlay/Android Auto into ultra-fast wireless connectivity via 5.8GHz Wi-Fi with zero lag.',
      brand: 'SmartLink',
      sku: 'SL-WAD-03',
      price: 5499,
      discountPrice: 4299,
      stockQuantity: 50,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 3,
      name: 'Solar Powered Wireless TPMS Tire Pressure Monitor',
      slug: 'solar-wireless-tpms-system',
      description: 'Real-time tire pressure and temperature LCD display with 4 external theft-proof sensors and instant high-pressure alarm.',
      brand: 'SafeTrack',
      sku: 'ST-TPM-S4',
      price: 2999,
      discountPrice: 2399,
      stockQuantity: 40,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 3,
      name: '15W Fast Qi Magnetic Car Wireless Charger & Mount',
      slug: '15w-magnetic-wireless-car-charger',
      description: 'Vent-clamp auto-aligning MagSafe compatible vehicle phone charger with active temperature cooling mechanism.',
      brand: 'PowerCharge',
      sku: 'PC-MCH-15W',
      price: 2199,
      discountPrice: 1699,
      stockQuantity: 70,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80']
    },

    // Cleaning & Detailing
    {
      categoryIndex: 4,
      name: 'Ceramic Coating Spray 9H Paint Shield (500ml)',
      slug: 'ceramic-coating-spray-9h-500ml',
      description: 'Advanced SiO2 ceramic graphene polymer spray delivering extreme hydrophobic water beading and mirror gloss shine.',
      brand: 'GlossPro',
      sku: 'GP-CRM-500',
      price: 1499,
      discountPrice: 999,
      stockQuantity: 100,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 4,
      name: '1200 GSM Edgeless Microfiber Plush Drying Towels (Pack of 3)',
      slug: '1200-gsm-microfiber-drying-towels',
      description: 'Ultra-absorbent lint-free microfiber buffing towels safe for clear coat finishes without swirl marks.',
      brand: 'GlossPro',
      sku: 'GP-TOW-1200',
      price: 899,
      discountPrice: 699,
      stockQuantity: 120,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 4,
      name: 'Cordless Portable 8500PA Car Vacuum Cleaner',
      slug: 'cordless-8500pa-car-vacuum',
      description: 'Brushless dual-motor compact car handheld vacuum with HEPA washable filter and multi-crevice extension attachments.',
      brand: 'CleanCraft',
      sku: 'CC-VAC-85K',
      price: 3299,
      discountPrice: 2499,
      stockQuantity: 55,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 4,
      name: 'Snow Foam Cannon & pH Neutral Car Shampoo (1L)',
      slug: 'snow-foam-cannon-shampoo-kit',
      description: 'Heavy duty brass pressure washer foam lance bottle combined with concentrated ultra-slick foaming car wash shampoo.',
      brand: 'CleanCraft',
      sku: 'CC-FCN-1L',
      price: 1999,
      discountPrice: 1549,
      stockQuantity: 65,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1507764996299-c38cb9300f66?w=600&auto=format&fit=crop&q=80']
    },

    // Exterior Accessories
    {
      categoryIndex: 2,
      name: 'Heavy Duty 5-Layer All-Weather Waterproof Body Cover',
      slug: '5-layer-waterproof-car-body-cover',
      description: 'Reflective silver coated breathable fabric with soft cotton lining, buckle straps, and mirror pockets for maximum outdoor protection.',
      brand: 'StormShield',
      sku: 'SS-COV-5L',
      price: 3899,
      discountPrice: 2999,
      stockQuantity: 40,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 2,
      name: 'Aerodynamic Heavy Duty Aluminum Roof Cross Bars',
      slug: 'aerodynamic-aluminum-roof-cross-bars',
      description: 'Universal clamp lockable roof rails designed for luggage baskets, ski racks, and roof boxes with 75kg load rating.',
      brand: 'CargoRidge',
      sku: 'CR-BAR-AL75',
      price: 6499,
      discountPrice: 5199,
      stockQuantity: 20,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 2,
      name: 'Injection Moulded Sleek Door Visor Rain Guards (Set of 4)',
      slug: 'door-visor-rain-guards-set',
      description: 'Smoked acrylic aerodynamic wind deflectors with pre-installed 3M automotive adhesive tape.',
      brand: 'AeroGuard',
      sku: 'AG-VIS-04S',
      price: 1299,
      discountPrice: 999,
      stockQuantity: 90,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80']
    },

    // Safety Equipment
    {
      categoryIndex: 5,
      name: 'Digital Preset Automatic 12V Heavy Duty Tyre Inflator',
      slug: 'digital-12v-tyre-inflator',
      description: 'Rapid metal cylinder air compressor reaching 35 PSI in 2 minutes with auto-shutoff and emergency LED flashlight.',
      brand: 'AirMax',
      sku: 'AM-INF-12D',
      price: 2899,
      discountPrice: 2199,
      stockQuantity: 75,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 5,
      name: 'Tubeless Tyre Puncture Repair Kit with Brass Plugs',
      slug: 'tubeless-tyre-puncture-repair-kit',
      description: 'Heavy duty zinc-alloy T-handle rasp and insertion tools with 15 vulcanized butyl rubber repair strips.',
      brand: 'QuickFix',
      sku: 'QF-PNC-20',
      price: 699,
      discountPrice: 499,
      stockQuantity: 150,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 5,
      name: 'Heavy Duty 1000A Emergency Booster Jumper Cables',
      slug: '1000a-emergency-jumper-cables',
      description: 'Thick gauge copper-clad aluminum 4-meter cables with heavy-duty fully insulated alligator clamps and storage bag.',
      brand: 'VoltSafe',
      sku: 'VS-JMP-1000',
      price: 1599,
      discountPrice: 1199,
      stockQuantity: 50,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 5,
      name: 'Compact ABC Dry Powder Car Fire Extinguisher (1kg)',
      slug: 'car-fire-extinguisher-1kg',
      description: 'ISI certified vehicle fire extinguisher with mounting bracket for instant suppression of electrical and fuel fires.',
      brand: 'FireGuard',
      sku: 'FG-EXT-1KG',
      price: 1099,
      discountPrice: 849,
      stockQuantity: 60,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },

    // Spare Parts & Maintenance
    {
      categoryIndex: 6,
      name: 'Premium Hybrid Aerodynamic Wiper Blades (Pair)',
      slug: 'hybrid-aerodynamic-wiper-blades',
      description: 'Natural graphite-coated dual rubber beam blades engineered for streak-free wiping during monsoon downpours.',
      brand: 'ClearView',
      sku: 'CV-WPR-HYB',
      price: 1399,
      discountPrice: 1099,
      stockQuantity: 85,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 6,
      name: 'Ultra-Bright 120W 6000K CSP LED Headlight Bulbs (H4/H7)',
      slug: '120w-csp-led-headlight-bulbs',
      description: 'High luminous efficiency bulbs outputting 16,000 Lumens with built-in copper heat pipe and silent high-speed cooling fan.',
      brand: 'BeamLume',
      sku: 'BL-LED-120W',
      price: 4499,
      discountPrice: 3499,
      stockQuantity: 40,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 6,
      name: 'Anti-Bacterial Active Carbon Cabin AC Air Filter',
      slug: 'active-carbon-cabin-ac-filter',
      description: 'Multi-layer particulate filter capturing PM2.5 pollen, allergens, exhaust fumes and foul odors inside the cabin.',
      brand: 'AeroFilter',
      sku: 'AF-CAB-PM25',
      price: 899,
      discountPrice: 649,
      stockQuantity: 110,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 6,
      name: 'Ceramic Low-Dust Front Brake Pads Set',
      slug: 'ceramic-front-brake-pads-set',
      description: 'High-friction thermal stable ceramic brake pads providing silent braking, zero rotor gouging, and low wheel dust.',
      brand: 'BremTech',
      sku: 'BT-BRK-CRM01',
      price: 2799,
      discountPrice: 2199,
      stockQuantity: 45,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80']
    },

    // Performance Accessories
    {
      categoryIndex: 7,
      name: 'High Flow Washable Performance Air Filter',
      slug: 'high-flow-performance-air-filter',
      description: 'Multi-ply oiled cotton gauze drop-in air filter engineered to boost throttle response and engine horsepower.',
      brand: 'ApexPower',
      sku: 'AP-FLT-PRF',
      price: 5299,
      discountPrice: 4199,
      stockQuantity: 25,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 7,
      name: 'Coil Spring Urethane Cushion Buffer Dampeners',
      slug: 'coil-spring-cushion-buffer-dampeners',
      description: 'Reduces body roll, improves vehicle ground clearance by 1.5-2cm under heavy load, and absorbs sharp speed breaker shocks.',
      brand: 'RideSteady',
      sku: 'RS-BUF-UR2',
      price: 2999,
      discountPrice: 2299,
      stockQuantity: 35,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 7,
      name: 'Titanium Burnt Finish Stainless Steel Exhaust Tip',
      slug: 'burnt-titanium-exhaust-tip',
      description: 'Universal bolt-on 2.5-inch slant cut exhaust tip with anti-corrosion blue burnt heat-treated finish.',
      brand: 'ApexPower',
      sku: 'AP-EXH-BLU',
      price: 1899,
      discountPrice: 1499,
      stockQuantity: 30,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },

    // Universal Car Accessories
    {
      categoryIndex: 0,
      name: 'Multifunctional Car Trunk Organizer with Insulated Cooler',
      slug: 'car-trunk-organizer-cooler',
      description: 'Reinforced 1680D Oxford fabric collapsible boot storage with waterproof leakproof thermal insulation pocket.',
      brand: 'AutoArmor',
      sku: 'AA-TRK-ORG',
      price: 2499,
      discountPrice: 1899,
      stockQuantity: 55,
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 0,
      name: 'Solar Powered Ultrasonic Essential Oil Car Freshener',
      slug: 'solar-ultrasonic-car-freshener',
      description: 'Helicopter turbine rotating diffuser that automatically disperses natural cologne scent when sunlight strikes.',
      brand: 'AromaRide',
      sku: 'AR-DIF-SOL',
      price: 1399,
      discountPrice: 999,
      stockQuantity: 90,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 0,
      name: 'Anti-Glare Night Driving HD Polarized Clip-On Glasses',
      slug: 'anti-glare-night-driving-glasses',
      description: 'Yellow tinted polarized lenses designed to neutralize high-beam glare from oncoming vehicle LED headlights.',
      brand: 'VisionSafe',
      sku: 'VS-GLS-NT',
      price: 799,
      discountPrice: 599,
      stockQuantity: 100,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 0,
      name: 'Leatherette Key Fob Cover with Braided Keychain',
      slug: 'leatherette-smart-key-fob-cover',
      description: 'Anti-scratch zinc and full grain leather protection sleeve for smart push-button key fobs.',
      brand: 'AutoArmor',
      sku: 'AA-KEY-L01',
      price: 699,
      discountPrice: 499,
      stockQuantity: 120,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 0,
      name: 'Multi-Angle 360 Degree Rearview Mirror Phone Mount',
      slug: '360-rearview-mirror-phone-mount',
      description: 'Sturdy clamp holder positioning navigation directly at eye level without blocking road sightlines.',
      brand: 'ComfortDrive',
      sku: 'CD-MNT-RV360',
      price: 899,
      discountPrice: 649,
      stockQuantity: 80,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80']
    },
    {
      categoryIndex: 1,
      name: 'Perforated Nappa Leather Steering Wheel Stitch Wrap',
      slug: 'nappa-leather-steering-wheel-wrap',
      description: 'DIY stitch-on steering wheel cover crafted with breathable genuine feel microfiber nappa leather and red sport stitching.',
      brand: 'ComfortDrive',
      sku: 'CD-STR-NAP',
      price: 1299,
      discountPrice: 899,
      stockQuantity: 65,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=600&auto=format&fit=crop&q=80']
    }
  ];

  const products = [];
  for (const p of productsData) {
    const category = productCategories[p.categoryIndex];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: category.id,
        name: p.name,
        description: p.description,
        brand: p.brand,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        status: ProductStatus.ACTIVE,
        isFeatured: p.isFeatured,
      },
      create: {
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        status: ProductStatus.ACTIVE,
        isFeatured: p.isFeatured,
        images: {
          create: p.images.map((img, idx) => ({
            url: img,
            isPrimary: idx === 0,
          }))
        }
      }
    });
    products.push(product);
  }

  // 6. Create 24 Vehicles across realistic brands
  console.log('Creating Vehicles...');
  const vehiclesData = [
    {
      dealershipIndex: 0,
      brand: 'Tata',
      model: 'Harrier',
      variant: 'Fearless Plus Dark Edition',
      year: 2024,
      price: 2499000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 8500,
      engineCapacity: 1956,
      seatingCapacity: 5,
      color: 'Oberon Black',
      description: 'Immaculate single-owner Tata Harrier Dark Edition equipped with Level 2 ADAS, panoramic sunroof, ventilated front seats, and 360-degree camera. Balance of 3-year factory warranty intact.',
      registrationNumber: 'MH 02 FJ 4812',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 0,
      brand: 'Mahindra',
      model: 'XUV700',
      variant: 'AX7 Luxury Pack AWD',
      year: 2023,
      price: 2350000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 18200,
      engineCapacity: 2198,
      seatingCapacity: 7,
      color: 'Midnight Black',
      description: 'Top-tier Mahindra XUV700 AWD featuring Sony 3D 12-speaker audio system, panoramic Skyroof, dual 10.25-inch superscreens, and wireless smartphone charger.',
      registrationNumber: 'MH 01 EA 7799',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 0,
      brand: 'Hyundai',
      model: 'Creta',
      variant: 'SX (O) Turbo DCT',
      year: 2024,
      price: 1980000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 6200,
      engineCapacity: 1482,
      seatingCapacity: 5,
      color: 'Ranger Khaki',
      description: 'New facelift Hyundai Creta 1.5L Turbo producing 160hp with DCT paddle shifters, dual-zone climate control, connected car tech, and Bose premium audio.',
      registrationNumber: 'MH 03 DZ 1234',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 0,
      brand: 'Volkswagen',
      model: 'Virtus',
      variant: 'GT Plus 1.5 TSI DSG',
      year: 2023,
      price: 1780000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SEDAN,
      mileage: 14500,
      engineCapacity: 1498,
      seatingCapacity: 5,
      color: 'Wild Cherry Red',
      description: 'Enthusiast sedan with 5-star Global NCAP safety rating. 150 PS EVO engine with Active Cylinder Technology, red brake calipers, and digital cockpit.',
      registrationNumber: 'MH 04 BK 5521',
      inventoryStatus: InventoryStatus.RESERVED,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1555353540-64580b51c258?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 0,
      brand: 'Skoda',
      model: 'Slavia',
      variant: 'Style 1.0 TSI AT',
      year: 2022,
      price: 1420000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SEDAN,
      mileage: 26000,
      engineCapacity: 999,
      seatingCapacity: 5,
      color: 'Crystal Blue',
      description: 'Executive sedan featuring ventilated leather seats, electric sunroof, 521-litre luggage boot, and complete authorized service records.',
      registrationNumber: 'MH 02 EQ 3311',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 0,
      brand: 'Mahindra',
      model: 'Thar',
      variant: 'LX Hard Top 4x4 MT',
      year: 2022,
      price: 1540000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      bodyType: BodyType.SUV,
      mileage: 21000,
      engineCapacity: 2184,
      seatingCapacity: 4,
      color: 'Napoli Black',
      description: 'Legendary off-roader with shift-on-the-fly 4WD transfer case, mechanical locking rear differential, IP54 water-resistant dashboard, and BFGoodrich all-terrain tires.',
      registrationNumber: 'MH 12 TS 9009',
      inventoryStatus: InventoryStatus.SOLD,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80'
      ]
    },

    // Dealership 1: Bangalore
    {
      dealershipIndex: 1,
      brand: 'Toyota',
      model: 'Innova Hycross',
      variant: 'ZX (O) Strong Hybrid',
      year: 2024,
      price: 3250000,
      fuelType: FuelType.HYBRID,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.MPV,
      mileage: 7200,
      engineCapacity: 1987,
      seatingCapacity: 7,
      color: 'Blackish Ageha Glass Flake',
      description: 'Self-charging strong hybrid offering 21.1 km/l fuel efficiency, ottoman second-row lounge seats, panoramic roof, and Toyota Safety Sense.',
      registrationNumber: 'KA 03 MX 8822',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 1,
      brand: 'Tata',
      model: 'Nexon EV',
      variant: 'Empowered Plus Long Range',
      year: 2024,
      price: 1890000,
      fuelType: FuelType.ELECTRIC,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 9500,
      engineCapacity: 0,
      seatingCapacity: 5,
      color: 'Empowered Oxide',
      description: '465 km ARAI certified electric range with 40.5 kWh battery pack, vehicle-to-load V2L functionality, arcade.ev entertainment suite, and paddle regen.',
      registrationNumber: 'KA 01 EK 4501',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 1,
      brand: 'Kia',
      model: 'Seltos',
      variant: 'GTX Plus 1.5 Turbo DCT',
      year: 2023,
      price: 1920000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 15400,
      engineCapacity: 1482,
      seatingCapacity: 5,
      color: 'Pewter Olive',
      description: 'Feature-loaded crossover with dual panoramic display, Level 2 ADAS with 17 autonomous features, heads-up display, and 8-way power driver seat.',
      registrationNumber: 'KA 05 NM 6723',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 1,
      brand: 'Honda',
      model: 'City',
      variant: 'ZX e:HEV Strong Hybrid',
      year: 2023,
      price: 1850000,
      fuelType: FuelType.HYBRID,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SEDAN,
      mileage: 19000,
      engineCapacity: 1498,
      seatingCapacity: 5,
      color: 'Platinum White Pearl',
      description: 'Dual electric motor hybrid delivering seamless electric-only drive in city traffic with 27.13 kmpl mileage and Honda Sensing safety package.',
      registrationNumber: 'KA 04 PK 1109',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1555353540-64580b51c258?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 1,
      brand: 'Maruti Suzuki',
      model: 'Grand Vitara',
      variant: 'Alpha AllGrip 4WD',
      year: 2023,
      price: 1690000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.MANUAL,
      bodyType: BodyType.SUV,
      mileage: 22000,
      engineCapacity: 1462,
      seatingCapacity: 5,
      color: 'Opulent Red with Black Roof',
      description: 'Electronic AllGrip intelligent 4WD system with Snow, Sport, Auto and Lock modes. Panoramic sunroof, 9-inch SmartPlay Pro+ infotainment.',
      registrationNumber: 'KA 51 ML 9922',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 1,
      brand: 'Hyundai',
      model: 'Verna',
      variant: 'SX (O) 1.5 Turbo MT',
      year: 2023,
      price: 1560000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.MANUAL,
      bodyType: BodyType.SEDAN,
      mileage: 13000,
      engineCapacity: 1482,
      seatingCapacity: 5,
      color: 'Abyss Black',
      description: 'Futuristic fastback styling with 160hp turbocharged engine, switchable multi-function control panel, heated and ventilated seats.',
      registrationNumber: 'KA 02 JK 3345',
      inventoryStatus: InventoryStatus.MAINTENANCE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80'
      ]
    },

    // Dealership 2: Delhi NCR
    {
      dealershipIndex: 2,
      brand: 'Toyota',
      model: 'Fortuner',
      variant: '4x4 Legender AT',
      year: 2023,
      price: 4450000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 24000,
      engineCapacity: 2755,
      seatingCapacity: 7,
      color: 'Pearl White with Black Roof',
      description: 'The undisputed SUV titan producing 500 Nm torque with high & low range 4WD transfer case, JBL 11-speaker audio, kick sensor electric tailgate.',
      registrationNumber: 'HR 26 DQ 0001',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 2,
      brand: 'Skoda',
      model: 'Kodiaq',
      variant: 'L&K 2.0 TSI 4x4 DSG',
      year: 2023,
      price: 3890000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 16500,
      engineCapacity: 1984,
      seatingCapacity: 7,
      color: 'Lava Blue',
      description: 'Flagship European luxury 7-seater SUV with Dynamic Chassis Control (DCC), Canton 12-speaker audio system, and Canton acoustics.',
      registrationNumber: 'DL 1C AC 5566',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 2,
      brand: 'Tata',
      model: 'Safari',
      variant: 'Accomplished Plus Dark 6S',
      year: 2024,
      price: 2650000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 5000,
      engineCapacity: 1956,
      seatingCapacity: 6,
      color: 'Stardust Ash Dark',
      description: 'Executive 6-seater with 2nd row captain ventilation seats, panoramic mood lighting, e-shifter, gesture tailgate, and Level 2 ADAS suite.',
      registrationNumber: 'UP 16 CG 9911',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 2,
      brand: 'Volkswagen',
      model: 'Taigun',
      variant: 'GT Plus Edge Deep Black',
      year: 2023,
      price: 1820000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 17800,
      engineCapacity: 1498,
      seatingCapacity: 5,
      color: 'Deep Black Pearl',
      description: 'German engineered compact SUV with 5-star crash safety, sporty red interior ambient accents, wireless App-Connect and ventilated seats.',
      registrationNumber: 'DL 3C CS 2408',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 2,
      brand: 'Maruti Suzuki',
      model: 'Brezza',
      variant: 'ZXi Plus AT',
      year: 2023,
      price: 1340000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 21500,
      engineCapacity: 1462,
      seatingCapacity: 5,
      color: 'Brave Khaki with Arctic White Roof',
      description: 'Reliable city SUV with 6-speed torque converter gearbox, 360 view camera, color heads-up display, and electric sunroof.',
      registrationNumber: 'HR 26 EF 8820',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 2,
      brand: 'Honda',
      model: 'Elevate',
      variant: 'ZX CVT',
      year: 2024,
      price: 1590000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 8200,
      engineCapacity: 1498,
      seatingCapacity: 5,
      color: 'Phoenix Orange Pearl',
      description: 'High ground clearance (220mm) SUV with Honda Sensing ADAS, 10.25-inch touchscreen, brown leatherette cabin and lane watch camera.',
      registrationNumber: 'DL 8C BD 4509',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80'
      ]
    },

    // Dealership 3: Pune
    {
      dealershipIndex: 3,
      brand: 'Kia',
      model: 'Carens',
      variant: 'Luxury Plus 1.5 Diesel AT 6S',
      year: 2023,
      price: 1840000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.MPV,
      mileage: 23000,
      engineCapacity: 1493,
      seatingCapacity: 6,
      color: 'Imperial Blue',
      description: 'Premium family mover with one-touch electric tumble 2nd row seats, Bose 8-speaker audio, smart pure air purifier with virus protection.',
      registrationNumber: 'MH 14 GL 1818',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 3,
      brand: 'Mahindra',
      model: 'Scorpio-N',
      variant: 'Z8 L 4x4 Diesel AT',
      year: 2023,
      price: 2420000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 19800,
      engineCapacity: 2198,
      seatingCapacity: 7,
      color: 'Dazzling Silver',
      description: 'The Big Daddy of SUVs with 4XPLOR terrain response mode (Normal, Grass/Gravel/Snow, Mud/Ruts, Sand) and Sony 12-speaker audio.',
      registrationNumber: 'MH 12 VN 5500',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 3,
      brand: 'Tata',
      model: 'Nexon',
      variant: 'Fearless Plus S DT Petrol DCA',
      year: 2024,
      price: 1450000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 6900,
      engineCapacity: 1199,
      seatingCapacity: 5,
      color: 'Fearless Purple',
      description: 'India top-selling subcompact SUV with illuminated 2-spoke steering, sequential LED DRLs, 360 HD camera, and ventilated seats.',
      registrationNumber: 'MH 12 RB 7117',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 3,
      brand: 'Skoda',
      model: 'Kushaq',
      variant: 'Monte Carlo 1.5 TSI DSG',
      year: 2023,
      price: 1890000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.SUV,
      mileage: 14200,
      engineCapacity: 1498,
      seatingCapacity: 5,
      color: 'Tornado Red with Carbon Steel Roof',
      description: 'Monte Carlo motorsport heritage styling with red ambient dash inserts, dual-tone leatherette seats, 17-inch Vega alloys, and 6 airbags.',
      registrationNumber: 'MH 14 HW 3030',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 3,
      brand: 'Maruti Suzuki',
      model: 'Fronx',
      variant: 'Alpha 1.0L Turbo 6AT',
      year: 2024,
      price: 1280000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.HATCHBACK,
      mileage: 7100,
      engineCapacity: 998,
      seatingCapacity: 5,
      color: 'Bluish Black',
      description: 'Sporty coupe crossover with direct-injection Turbo Boosterjet engine, paddle shifters, HUD screen, wireless charging, and UV cut glass.',
      registrationNumber: 'MH 12 QQ 8181',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1555353540-64580b51c258?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      dealershipIndex: 3,
      brand: 'Toyota',
      model: 'Urban Cruiser Taisor',
      variant: 'V Turbo AT',
      year: 2024,
      price: 1290000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      bodyType: BodyType.HATCHBACK,
      mileage: 4300,
      engineCapacity: 998,
      seatingCapacity: 5,
      color: 'Café White',
      description: 'Sleek geometric front grille, full-width LED rear lamps, 9-inch HD touchscreen, 6-airbag shield, and pristine factory condition.',
      registrationNumber: 'MH 14 KX 6226',
      inventoryStatus: InventoryStatus.AVAILABLE,
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80'
      ]
    }
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const dealership = dealerships[v.dealershipIndex];
    // Check if vehicle exists by registrationNumber
    const existing = await prisma.vehicle.findFirst({
      where: { registrationNumber: v.registrationNumber }
    });

    if (existing) {
      vehicles.push(existing);
    } else {
      const created = await prisma.vehicle.create({
        data: {
          dealershipId: dealership.id,
          brand: v.brand,
          model: v.model,
          variant: v.variant,
          year: v.year,
          price: v.price,
          fuelType: v.fuelType,
          transmission: v.transmission,
          bodyType: v.bodyType,
          mileage: v.mileage,
          engineCapacity: v.engineCapacity,
          seatingCapacity: v.seatingCapacity,
          color: v.color,
          description: v.description,
          registrationNumber: v.registrationNumber,
          inventoryStatus: v.inventoryStatus,
          isFeatured: v.isFeatured,
          images: {
            create: v.images.map((img, idx) => ({
              url: img,
              isPrimary: idx === 0,
            }))
          }
        }
      });
      vehicles.push(created);
    }
  }

  // 7. Create Vehicle Inquiries
  console.log('Creating Inquiries...');
  const sampleInquiries = [
    {
      vehicleIndex: 0, // Harrier
      customerIndex: 0, // Arjun
      message: 'Hello, I am interested in testing the Tata Harrier Dark Edition this Saturday afternoon. Can we schedule a home test drive in Bandra?',
      status: InquiryStatus.PENDING,
    },
    {
      vehicleIndex: 1, // XUV700
      customerIndex: 1, // Priya
      message: 'Does this XUV700 AWD come with an extended warranty package? What are the financing options available?',
      status: InquiryStatus.CONTACTED,
    },
    {
      vehicleIndex: 6, // Innova Hycross
      customerIndex: 2, // Rohan
      message: 'Looking to purchase this Hycross Hybrid for family road trips. Is the battery health certificate verified by Toyota?',
      status: InquiryStatus.RESOLVED,
    },
    {
      vehicleIndex: 7, // Nexon EV
      customerIndex: 3, // Kavita
      message: 'Can you provide charging station details and does this model support 50kW DC fast charging?',
      status: InquiryStatus.PENDING,
    }
  ];

  for (const inq of sampleInquiries) {
    const veh = vehicles[inq.vehicleIndex];
    const cust = customerList[inq.customerIndex];
    const existing = await prisma.vehicleInquiry.findFirst({
      where: { vehicleId: veh.id, email: cust.email }
    });
    if (!existing) {
      await prisma.vehicleInquiry.create({
        data: {
          vehicleId: veh.id,
          customerId: cust.id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone || '+91 98765 00000',
          message: inq.message,
          status: inq.status,
        }
      });
    }
  }

  // 8. Create Wishlist for primary customer
  console.log('Creating Wishlist items...');
  const wishlistVehicles = [vehicles[0], vehicles[2], vehicles[6]];
  for (const wv of wishlistVehicles) {
    await prisma.wishlistItem.upsert({
      where: {
        customerId_vehicleId: {
          customerId: customer.id,
          vehicleId: wv.id,
        }
      },
      update: {},
      create: {
        customerId: customer.id,
        vehicleId: wv.id,
      }
    });
  }

  // 9. Create Active Cart for primary customer
  console.log('Creating Shopping Cart...');
  const userCart = await prisma.cart.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  });

  const cartProduct1 = products[0]; // 7D Mats
  const cartProduct2 = products[4]; // Dashcam
  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: userCart.id,
        productId: cartProduct1.id,
      }
    },
    update: { quantity: 1 },
    create: {
      cartId: userCart.id,
      productId: cartProduct1.id,
      quantity: 1,
    }
  });

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: userCart.id,
        productId: cartProduct2.id,
      }
    },
    update: { quantity: 1 },
    create: {
      cartId: userCart.id,
      productId: cartProduct2.id,
      quantity: 1,
    }
  });

  // 10. Create Completed & Sample Orders
  console.log('Creating Sample Orders...');
  const order1Number = 'ORD-2026-1001';
  const order1Exists = await prisma.order.findUnique({ where: { orderNumber: order1Number } });
  if (!order1Exists) {
    await prisma.order.create({
      data: {
        orderNumber: order1Number,
        customerId: customer.id,
        subtotal: 10498,
        discount: 1000,
        shipping: 0,
        total: 9498,
        orderStatus: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        shippingName: customer.name,
        shippingAddress: 'Flat 402, Sea Breeze Heights, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400018',
        phone: customer.phone || '+91 98765 43210',
        items: {
          create: [
            {
              productId: products[4].id,
              productName: products[4].name,
              productPrice: 9498,
              quantity: 1,
              total: 9498,
            }
          ]
        },
        payment: {
          create: {
            transactionRef: 'TXN-UPI-9948210384',
            method: PaymentMethod.UPI,
            status: PaymentStatus.PAID,
            amount: 9498,
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            gatewayResponse: { bank: 'HDFC', vpa: 'arjun@okaxis', verified: true }
          }
        }
      }
    });
  }

  const order2Number = 'ORD-2026-1002';
  const order2Exists = await prisma.order.findUnique({ where: { orderNumber: order2Number } });
  if (!order2Exists) {
    await prisma.order.create({
      data: {
        orderNumber: order2Number,
        customerId: customerList[1].id, // Priya
        subtotal: 3899,
        discount: 0,
        shipping: 149,
        total: 4048,
        orderStatus: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
        shippingName: customerList[1].name,
        shippingAddress: 'Villa 12, Palm Meadows, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
        phone: customerList[1].phone || '+91 98190 12345',
        items: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].name,
              productPrice: 3899,
              quantity: 1,
              total: 3899,
            }
          ]
        },
        payment: {
          create: {
            transactionRef: 'TXN-CARD-8831924102',
            method: PaymentMethod.CARD,
            status: PaymentStatus.PAID,
            amount: 4048,
            paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            gatewayResponse: { cardType: 'VISA', last4: '4242', authCode: 'AUTH8831' }
          }
        }
      }
    });
  }

  // 11. Create Sample Service Appointments
  console.log('Creating Service Appointments...');
  const appt1Number = 'APT-2026-8801';
  const appt1Exists = await prisma.serviceAppointment.findUnique({ where: { appointmentNumber: appt1Number } });
  if (!appt1Exists) {
    await prisma.serviceAppointment.create({
      data: {
        appointmentNumber: appt1Number,
        customerId: customer.id,
        dealershipId: dealerships[0].id,
        serviceCategoryId: serviceCategories[0].id, // General servicing
        vehicleBrand: 'Tata',
        vehicleModel: 'Harrier',
        vehicleRegistration: 'MH 02 FJ 4812',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        preferredTimeSlot: '10:30 - 12:00',
        additionalNotes: 'Please check slight squeaking sound from front right suspension over speed breakers.',
        status: AppointmentStatus.CONFIRMED,
        serviceManagerId: serviceManager.id,
        serviceNotes: 'Technician Bay 2 assigned. Suspension bushes inspected during check-in.',
      }
    });
  }

  const appt2Number = 'APT-2026-8802';
  const appt2Exists = await prisma.serviceAppointment.findUnique({ where: { appointmentNumber: appt2Number } });
  if (!appt2Exists) {
    await prisma.serviceAppointment.create({
      data: {
        appointmentNumber: appt2Number,
        customerId: customerList[1].id,
        dealershipId: dealerships[0].id,
        serviceCategoryId: serviceCategories[4].id, // AC Servicing
        vehicleBrand: 'Hyundai',
        vehicleModel: 'Creta',
        vehicleRegistration: 'MH 03 DZ 1234',
        preferredDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        preferredTimeSlot: '02:30 - 04:00',
        additionalNotes: 'AC cooling efficiency low when idling in traffic.',
        status: AppointmentStatus.COMPLETED,
        serviceManagerId: serviceManager.id,
        serviceNotes: 'Cleaned cabin pollen filter, recharged 450g R134a refrigerant, cooling restored to 5 degrees Celsius.',
      }
    });
  }

  // 12. Create Sample Reviews
  console.log('Creating Reviews...');
  const sampleReviews = [
    {
      customerId: customer.id,
      targetType: ReviewTargetType.DEALERSHIP,
      targetId: dealerships[0].id,
      rating: 5,
      reviewText: 'Outstanding experience at Apex Motors Mumbai! Test drive was arranged seamlessly, sales team was transparent with pricing, and delivery paperwork was finished in under 2 hours.',
    },
    {
      customerId: customerList[1].id,
      targetType: ReviewTargetType.PRODUCT,
      targetId: products[4].id, // 4K Dashcam
      rating: 5,
      reviewText: 'Crystal clear video clarity both day and night! The GPS speed logger and wireless phone app connection makes downloading clips effortless. Highly recommended.',
    },
    {
      customerId: customerList[1].id,
      targetType: ReviewTargetType.SERVICE,
      targetId: appt2Exists ? appt2Exists.id : appt1Number,
      rating: 5,
      reviewText: 'Prompt and highly professional service by Sunil and the tech crew. AC is chilling immediately now even in peak afternoon sun. Transparent billing with zero hidden costs.',
    },
    {
      customerId: customerList[2].id,
      targetType: ReviewTargetType.PRODUCT,
      targetId: products[0].id, // 7D Mats
      rating: 4,
      reviewText: 'Perfect fit for my car flooring. The detachable top curly grass layer traps all dust and is extremely easy to wash clean.',
    }
  ];

  for (const rev of sampleReviews) {
    const existing = await prisma.review.findFirst({
      where: { customerId: rev.customerId, targetType: rev.targetType, targetId: rev.targetId }
    });
    if (!existing) {
      await prisma.review.create({ data: rev });
    }
  }

  // 13. Create Activity Logs
  console.log('Creating Activity Logs...');
  const sampleLogs = [
    { userId: admin.id, action: 'PLATFORM_INITIALIZED', entityType: 'SYSTEM', details: { note: 'CarCraft Platform Engine booted' } },
    { userId: dealer.id, action: 'VEHICLE_LISTED', entityType: 'VEHICLE', entityId: vehicles[0].id, details: { model: 'Tata Harrier Dark Edition' } },
    { userId: customer.id, action: 'ORDER_PLACED', entityType: 'ORDER', entityId: order1Number, details: { amount: 9498 } },
    { userId: serviceManager.id, action: 'APPOINTMENT_CONFIRMED', entityType: 'APPOINTMENT', entityId: appt1Number, details: { slot: '10:30 - 12:00' } }
  ];

  for (const log of sampleLogs) {
    await prisma.activityLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
      }
    });
  }

  console.log('✅ CarCraft database seeded successfully with complete relational datasets!');
  console.log('\nDemo Accounts:');
  console.log('----------------------------------------------------');
  console.log('ADMIN:           admin@carcraft.local    / Password123!');
  console.log('DEALER:          dealer@carcraft.local   / Password123!');
  console.log('CUSTOMER:        customer@carcraft.local / Password123!');
  console.log('SERVICE MANAGER: service@carcraft.local  / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
