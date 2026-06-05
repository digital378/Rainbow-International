export interface BrandPartner {
  name: string;
  file: string;
  category: BrandCategory;
}

export type BrandCategory =
  | "Restaurants & Cafés"
  | "Health & Wellness"
  | "Fitness & Sports"
  | "Salon, Beauty & Spa"
  | "Fashion & Apparel"
  | "Eyewear & Optics"
  | "Toys, Books & Stationery"
  | "Entertainment & Family"
  | "Hotels & Stays"
  | "Home & Lifestyle"
  | "Finance & Services";

export const BRAND_CATEGORIES: BrandCategory[] = [
  "Restaurants & Cafés",
  "Health & Wellness",
  "Fitness & Sports",
  "Salon, Beauty & Spa",
  "Fashion & Apparel",
  "Eyewear & Optics",
  "Toys, Books & Stationery",
  "Entertainment & Family",
  "Hotels & Stays",
  "Home & Lifestyle",
  "Finance & Services",
];

export const BRAND_PARTNERS: BrandPartner[] = [
  // Salon, Beauty & Spa — pinned first
  { name: "Dream Of", file: "Dream-Of.webp", category: "Salon, Beauty & Spa" },

  // Restaurants & Cafés
  { name: "1441 Pizzeria", file: "rainbow-international-school-1441-pizzeria.webp", category: "Restaurants & Cafés" },
  { name: "73 Degrees", file: "rainbow-international-school-brand-partner-73d-dgrees.webp", category: "Restaurants & Cafés" },
  { name: "7th Heaven", file: "rainbow-international-school-brand-partner-7th-heaven.webp", category: "Restaurants & Cafés" },
  { name: "Appetite Momos", file: "Appetite-Momos.webp", category: "Restaurants & Cafés" },
  { name: "Balaji Food Junction", file: "Balaji-Food-Junction.webp", category: "Restaurants & Cafés" },
  { name: "Balaji Veg Treat", file: "Balaji-Veg-Treat.webp", category: "Restaurants & Cafés" },
  { name: "Bombay Barbeque", file: "Bombay-Barbeque.webp", category: "Restaurants & Cafés" },
  { name: "British Brewing Company", file: "British-Brewing-company.webp", category: "Restaurants & Cafés" },
  { name: "Cafe Amigos", file: "Cafe-Amigos.webp", category: "Restaurants & Cafés" },
  { name: "Cake Design Studio", file: "rainbow-international-school-brand-partner-cake-design-studio.webp", category: "Restaurants & Cafés" },
  { name: "Cakes Chemistry", file: "rainbow-international-school-brand-partner-cakes-chemistry.webp", category: "Restaurants & Cafés" },
  { name: "Ceremonial Kitchen Co", file: "rainbow-international-school-brand-partner-ceremonial-kitchen-co.webp", category: "Restaurants & Cafés" },
  { name: "Chaayos", file: "Chaayos.webp", category: "Restaurants & Cafés" },
  { name: "Desi Videshi Cafe", file: "Desi-Videshi-Cafe.webp", category: "Restaurants & Cafés" },
  { name: "Drunken Monkey", file: "Drunken-Monkey.webp", category: "Restaurants & Cafés" },
  { name: "Greek Gyros", file: "Greek-Gyros.webp", category: "Restaurants & Cafés" },
  { name: "Hangout", file: "Hangout.webp", category: "Restaurants & Cafés" },
  { name: "HAS Juices", file: "HAS-Juices.webp", category: "Restaurants & Cafés" },
  { name: "Hitchki", file: "Hitchki.webp", category: "Restaurants & Cafés" },
  { name: "Hot Bento", file: "Hot-Bento.webp", category: "Restaurants & Cafés" },
  { name: "Madeira n Mime", file: "Madeira-n-Mime.webp", category: "Restaurants & Cafés" },
  { name: "Maestro", file: "rainbow-international-school-brand-partners-maestro.webp", category: "Restaurants & Cafés" },
  { name: "Maezo Bistro", file: "Maezo-Bistro.webp", category: "Restaurants & Cafés" },
  { name: "Maple Restaurant", file: "Maple-Restaurant.webp", category: "Restaurants & Cafés" },
  { name: "Maratha Darbar", file: "Maratha-Darbar.webp", category: "Restaurants & Cafés" },
  { name: "Mirchi n Mime", file: "Mirchi-n-Mime.webp", category: "Restaurants & Cafés" },
  { name: "Monginis Vasant Vihar", file: "rainbow-international-school-brand-partner-monginis-vashant-vihar.webp", category: "Restaurants & Cafés" },
  { name: "Mustard", file: "Mustard.webp", category: "Restaurants & Cafés" },
  { name: "Paps Premium Lounge", file: "Paps-Premium-Lounge.webp", category: "Restaurants & Cafés" },
  { name: "Pop Tates", file: "Pop-Tates.webp", category: "Restaurants & Cafés" },
  { name: "Pritams Global Cuisine", file: "Pritams-Global-Cuisine.webp", category: "Restaurants & Cafés" },
  { name: "Punjab Mail", file: "Punjab-Mail.webp", category: "Restaurants & Cafés" },
  { name: "Rangla Punjab", file: "Rangla-Punjab.webp", category: "Restaurants & Cafés" },
  { name: "Sandys Bar Library", file: "Sandys-Bar-Library.webp", category: "Restaurants & Cafés" },
  { name: "Sandys Bar Library II", file: "Sandys-Bar-Library-1.webp", category: "Restaurants & Cafés" },
  { name: "South Bombay", file: "South-Bombay.webp", category: "Restaurants & Cafés" },
  { name: "Summer n Spice", file: "rainbow-international-school-brand-partner-summer-n-spice.webp", category: "Restaurants & Cafés" },
  { name: "The Boston Cupcakery", file: "The-Boston-Cupcakery.webp", category: "Restaurants & Cafés" },
  { name: "The Yellow Chilli", file: "The-Yellow-Chilli.webp", category: "Restaurants & Cafés" },
  { name: "Urban Tadka", file: "Urban-Tadka.webp", category: "Restaurants & Cafés" },
  { name: "Uttar Dakshin", file: "rainbow-international-school-brand-partner-uttar-dakshin.webp", category: "Restaurants & Cafés" },
  { name: "Veg Sizzlers", file: "Veg-Sizzels.webp", category: "Restaurants & Cafés" },
  { name: "Yo Sizzlers", file: "yo-sizzlers-rainbow-international-school.webp", category: "Restaurants & Cafés" },

  // Health & Wellness
  { name: "Apollo Clinic", file: "Apollo-Clinic.webp", category: "Health & Wellness" },
  { name: "Currae Hospital", file: "Currae-Hospital.webp", category: "Health & Wellness" },
  { name: "Dr. Ankita Kadam", file: "Dr.-Ankita-Kadam.webp", category: "Health & Wellness" },
  { name: "Dr. Kamna Krishnakumar", file: "Dr.-Kamna-Krishnakumar.webp", category: "Health & Wellness" },
  { name: "Dr. Nikhil Shetty", file: "Dr.-Nikhil-Shetty.webp", category: "Health & Wellness" },
  { name: "Dr. Rakhee", file: "Dr.-Rakhee.webp", category: "Health & Wellness" },
  { name: "Dr. Snehal Thorat", file: "Dr.-Snehal-Thorat.webp", category: "Health & Wellness" },
  { name: "Dr. Sumer Shaikh", file: "Dr.-Sumer-Shaikh.webp", category: "Health & Wellness" },
  { name: "Dr. Yuvraja Shetty", file: "Dr.-Yuvraja-Shetty.webp", category: "Health & Wellness" },
  { name: "Eknath Eye Hospital", file: "Eknath-Eye-Hospital.webp", category: "Health & Wellness" },
  { name: "Figure Slim", file: "Figure-Slim.webp", category: "Health & Wellness" },
  { name: "Gental Dental Care", file: "Gental-Dental-Care.webp", category: "Health & Wellness" },
  { name: "Little Smiles", file: "Little-Smiles.webp", category: "Health & Wellness" },
  { name: "Pathology Center", file: "Pathology-Center.webp", category: "Health & Wellness" },
  { name: "Preeti Aranha", file: "Preeti-Aranha.webp", category: "Health & Wellness" },
  { name: "Royal Chemist", file: "Royal-Chemist.webp", category: "Health & Wellness" },
  { name: "Wellness Forever", file: "Wellness-Forever.webp", category: "Health & Wellness" },

  // Fitness & Sports
  { name: "Alpha Gym", file: "rainbow-international-school-brand-partner-alpha-gym.webp", category: "Fitness & Sports" },
  { name: "Ankit Sports", file: "Ankit-Sports.webp", category: "Fitness & Sports" },
  { name: "Boot House", file: "Boot-House.webp", category: "Fitness & Sports" },
  { name: "Core Perfect Fitness", file: "Core-Perfect-Fitness.webp", category: "Fitness & Sports" },
  { name: "Decathlon", file: "Decathlon.webp", category: "Fitness & Sports" },
  { name: "Fitness Messengers", file: "Fitness-Messengers.webp", category: "Fitness & Sports" },
  { name: "Gold Gym", file: "Gold-Gym.webp", category: "Fitness & Sports" },
  { name: "Golden Swan Golf", file: "Golden-Swan-Golf.webp", category: "Fitness & Sports" },
  { name: "Total Sports", file: "Total-Sports.webp", category: "Fitness & Sports" },

  // Salon, Beauty & Spa
  { name: "Baywash Salon", file: "Baywash-Salon.webp", category: "Salon, Beauty & Spa" },
  { name: "Beyond The Mirror", file: "Beyond-The-Mirror.webp", category: "Salon, Beauty & Spa" },
  { name: "Estique Salon", file: "Estique-Salon.webp", category: "Salon, Beauty & Spa" },
  { name: "Filter Hair Beauty Studio", file: "Filter-Hair-Beauty-Studio.webp", category: "Salon, Beauty & Spa" },
  { name: "I Deserve It", file: "i-deserve-it.webp", category: "Salon, Beauty & Spa" },
  { name: "Mango 6 Salon", file: "Mango-6-Salon.webp", category: "Salon, Beauty & Spa" },
  { name: "Myo Thai Spa", file: "myo-thai-spa-rainbow-international-school.webp", category: "Salon, Beauty & Spa" },
  { name: "Salon One", file: "Salon-One.webp", category: "Salon, Beauty & Spa" },
  { name: "Scissor Point", file: "Scissor-Point.webp", category: "Salon, Beauty & Spa" },
  { name: "Siddhi Beauty Salon", file: "Siddhi-Beauty-Salon.webp", category: "Salon, Beauty & Spa" },

  // Fashion & Apparel
  { name: "Cotton Bazaar", file: "Cotton-Bazaar.webp", category: "Fashion & Apparel" },
  { name: "Decotex", file: "Decotex.webp", category: "Fashion & Apparel" },
  { name: "Fashion Studio", file: "rainbow-international-school-brand-partner-fashion-studio.webp", category: "Fashion & Apparel" },
  { name: "FirstCry", file: "rainbow-international-school-brand-partner-first-cry.webp", category: "Fashion & Apparel" },
  { name: "Jinaam Fashion", file: "Jinaam-Fashion.webp", category: "Fashion & Apparel" },
  { name: "Komal's Boutique", file: "rainbow-international-school-brand-partner-komals-boutique.webp", category: "Fashion & Apparel" },
  { name: "Mango", file: "Mango.webp", category: "Fashion & Apparel" },
  { name: "Monochrome", file: "rainbow-international-school-brand-partner-monochrome.webp", category: "Fashion & Apparel" },
  { name: "Search Western Wear", file: "Search-Western-Wear.webp", category: "Fashion & Apparel" },
  { name: "Stree West", file: "StreeWest.webp", category: "Fashion & Apparel" },

  // Eyewear & Optics
  { name: "Foresight Opticals", file: "Foresight-opticals.webp", category: "Eyewear & Optics" },
  { name: "Hollywood Opticians", file: "Hollywood-Opticians.webp", category: "Eyewear & Optics" },
  { name: "Kaala Chashma", file: "Kaala-Chashma.webp", category: "Eyewear & Optics" },
  { name: "Lawrence and Mayo", file: "Lawrence-and-Mayo.webp", category: "Eyewear & Optics" },

  // Toys, Books & Stationery
  { name: "Doodlers", file: "Doodlers.webp", category: "Toys, Books & Stationery" },
  { name: "Funskool", file: "Funskool.webp", category: "Toys, Books & Stationery" },
  { name: "Janata Toys", file: "Janata-Toys.webp", category: "Toys, Books & Stationery" },
  { name: "Just Books", file: "Just-Books.webp", category: "Toys, Books & Stationery" },
  { name: "Kidsbrooks", file: "Kidsbrooks.webp", category: "Toys, Books & Stationery" },
  { name: "Malbar Toys", file: "Malbar-Toys.webp", category: "Toys, Books & Stationery" },
  { name: "Stationary Point", file: "rainbow-international-school-brand-partner-stationary-point.webp", category: "Toys, Books & Stationery" },
  { name: "Surprise Book", file: "rainbow-international-school-brand-partner-surprise-book.webp", category: "Toys, Books & Stationery" },
  { name: "Variety Stationers", file: "Variety-Stationers.webp", category: "Toys, Books & Stationery" },

  // Entertainment & Family
  { name: "Angels", file: "rainbow-international-school-brand-partner-angels.webp", category: "Entertainment & Family" },
  { name: "Aqua Magica", file: "Aqua-Magica.webp", category: "Entertainment & Family" },
  { name: "Clue Hunt", file: "Clue-Hunt.webp", category: "Entertainment & Family" },
  { name: "Emart Games", file: "Emart-Games.webp", category: "Entertainment & Family" },
  { name: "Esselworld Bird Park", file: "Esselworld-Bird-Park.webp", category: "Entertainment & Family" },
  { name: "Esselworld Theme Park", file: "Esselworld-Theme-Park.webp", category: "Entertainment & Family" },
  { name: "Fishland", file: "Fishland.webp", category: "Entertainment & Family" },
  { name: "Imagica", file: "Imagica.webp", category: "Entertainment & Family" },
  { name: "Kattyz", file: "Kattyz.webp", category: "Entertainment & Family" },
  { name: "Playstation", file: "Playstation.webp", category: "Entertainment & Family" },
  { name: "Smaaash", file: "Smaaash.webp", category: "Entertainment & Family" },
  { name: "Snow Kingdom", file: "rainbow-international-school-brand-partner-snow-kingdom.webp", category: "Entertainment & Family" },
  { name: "Water Kingdom", file: "Water-Kingdom.webp", category: "Entertainment & Family" },
  { name: "Wow Events", file: "Wow-Events.webp", category: "Entertainment & Family" },
  { name: "Yo Mickey", file: "Yo-Mickey.webp", category: "Entertainment & Family" },

  // Hotels & Stays
  { name: "Blue Roof", file: "Blue-Roof.webp", category: "Hotels & Stays" },
  { name: "Corinthians", file: "Corinthians.webp", category: "Hotels & Stays" },
  { name: "Sofitel", file: "Sofitel.webp", category: "Hotels & Stays" },
  { name: "The Byke", file: "The-Byke-1.webp", category: "Hotels & Stays" },
  { name: "Visava Hotel", file: "Visava-Hotel.webp", category: "Hotels & Stays" },

  // Home & Lifestyle
  { name: "Clenzene", file: "rainbow-international-school-brand-partner-clenzene.webp", category: "Home & Lifestyle" },
  { name: "Dosti", file: "Dosti.webp", category: "Home & Lifestyle" },
  { name: "Golden", file: "Golden.webp", category: "Home & Lifestyle" },
  { name: "Golden Triangle", file: "Golden-Triangle.webp", category: "Home & Lifestyle" },
  { name: "HUM Automobiles", file: "HUM-Automobiles.webp", category: "Home & Lifestyle" },
  { name: "Paragon Telelinks", file: "Paragon-Telelinks.webp", category: "Home & Lifestyle" },
  { name: "Portico", file: "Portico.webp", category: "Home & Lifestyle" },
  { name: "Sweet Home Interiors", file: "Sweet-Home-Interiors.webp", category: "Home & Lifestyle" },
  { name: "The Cycle Wala", file: "The-Cycle-Wala.webp", category: "Home & Lifestyle" },
  { name: "The Family Tree", file: "The-Family-Tree.webp", category: "Home & Lifestyle" },
  { name: "WoodBank Interiors", file: "WoodBank-Interiors.webp", category: "Home & Lifestyle" },

  // Finance & Services
  { name: "C4R Wealth Management", file: "C4R-Wealth-Management.webp", category: "Finance & Services" },
];
