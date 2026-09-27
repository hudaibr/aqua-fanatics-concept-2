/**
 * Structured local product catalogue.
 * shaped so it can later be swapped for WooCommerce / Shopify / a headless CMS
 * without touching the 3D scene or the UI: only this module changes.
 */

export type PreparationOption =
  | "Whole"
  | "Cleaned"
  | "Curry Cut"
  | "Fillet"
  | "Steak Cut"
  | "Live / Intact"
  | "Shell On"
  | "Dressed"
  | "Deveined"
  | "Halved"
  | "Tail Only"
  | "Shucked"
  | "Half Shell";

export type StationId =
  | "entrance"
  | "fish"
  | "prawns"
  | "shellfish"
  | "premium"
  | "preparation"
  | "table";

export type SpeciesShape = {
  /** body length in metres */
  length: number;
  /** max half-height at the dorsal peak */
  height: number;
  /** extrude half-thickness — flat fish vs torpedo fish */
  depth: number;
  /** how far the snout extends past the head curve */
  snout: number;
  /** dorsal arch 0..1 — higher = hump-backed */
  dorsal: number;
  /** tail fork depth 0..1 — higher = deeply forked */
  fork: number;
  /** belly fullness 0..1 */
  belly: number;
};

export type Product = {
  id: string;
  name: string;
  /** small caps kicker shown above the name */
  tagline: string;
  category: "Fresh Fish" | "Prawns & Shellfish" | "Shellfish" | "Premium Catch";
  station: StationId;
  price: number;
  unit: string;
  freshness: string;
  origin: string;
  weight: string;
  description: string;
  tastingNote: string;
  preparationOptions: PreparationOption[];
  /** position of the product on the counter, in station-local space */
  position: [number, number, number];
  rotation: number;
  shape: SpeciesShape;
  /** body colour, top → belly handled in the material */
  color: string;
  accent: string;
  /** crustacean / bivalve builds use a different mesh generator */
  build: "fish" | "prawn" | "crab" | "lobster" | "shell";
  /** only meaningful for build === "shell" */
  shellForm?: "round" | "long";
  /** rendered price uses tabular figures + the amber accent */
  premium?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "pomfret",
    name: "Pomfret",
    tagline: "Today's catch",
    category: "Fresh Fish",
    station: "fish",
    price: 2800,
    unit: "kg",
    freshness: "Landed 04:20",
    origin: "Arabian Sea · Versova",
    weight: "900 g – 1.2 kg",
    description:
      "Silver pomfret selected by hand from this morning's landing. Deep, flat-bodied and almost boneless — the fish we would put in front of a guest who has never eaten fish before.",
    tastingNote: "Delicate, sweet, fine white flesh",
    preparationOptions: ["Whole", "Cleaned", "Curry Cut", "Fillet"],
    position: [-1.35, 0.16, 0.34],
    rotation: 0.24,
    shape: { length: 0.62, height: 0.3, depth: 0.05, snout: 0.05, dorsal: 0.45, fork: 0.5, belly: 0.85 },
    color: "#C9D3D4",
    accent: "#7C8C90",
    build: "fish",
  },
  {
    id: "surmai",
    name: "Surmai",
    tagline: "King mackerel",
    category: "Fresh Fish",
    station: "fish",
    price: 1650,
    unit: "kg",
    freshness: "Landed 05:05",
    origin: "Konkan Coast · Malvan",
    weight: "1.4 – 2.6 kg",
    description:
      "A long, clean torpedo of a fish. Firm, oil-rich and made for the tawa — we cut steaks across the grain so the flesh stays together in the pan.",
    tastingNote: "Rich, meaty, low flake",
    preparationOptions: ["Whole", "Cleaned", "Curry Cut", "Steak Cut"],
    position: [0.15, 0.15, -0.16],
    rotation: -0.42,
    shape: { length: 0.78, height: 0.17, depth: 0.1, snout: 0.08, dorsal: 0.5, fork: 0.85, belly: 0.5 },
    color: "#9FB2B6",
    accent: "#5B7378",
    build: "fish",
  },
  {
    id: "red-snapper",
    name: "Red Snapper",
    tagline: "Line caught",
    category: "Fresh Fish",
    station: "fish",
    price: 2450,
    unit: "kg",
    freshness: "Landed 04:45",
    origin: "Gulf of Mannar",
    weight: "700 g – 1.1 kg",
    description:
      "Rose-red skin over sweet, firm flesh. We leave the scale pattern intact so you can see it was never frozen — the eye should be clear, the gill bright.",
    tastingNote: "Sweet, lean, medium flake",
    preparationOptions: ["Whole", "Cleaned", "Fillet", "Curry Cut"],
    position: [1.45, 0.16, 0.3],
    rotation: 0.55,
    shape: { length: 0.6, height: 0.26, depth: 0.08, snout: 0.06, dorsal: 0.6, fork: 0.55, belly: 0.7 },
    color: "#C87A63",
    accent: "#8A4436",
    build: "fish",
  },
  {
    id: "hamour",
    name: "Hamour",
    tagline: "Reef grouper",
    category: "Fresh Fish",
    station: "fish",
    price: 2100,
    unit: "kg",
    freshness: "Landed 05:30",
    origin: "Persian Gulf",
    weight: "1.2 – 2 kg",
    description:
      "A broad, heavy grouper with thick white flakes that separate in sheets. The steadiest fish on the counter — it holds its shape in a curry and forgives an over-eager cook.",
    tastingNote: "Clean, mild, large flake",
    preparationOptions: ["Whole", "Cleaned", "Curry Cut", "Fillet"],
    position: [-0.6, 0.17, -0.42],
    rotation: -0.18,
    shape: { length: 0.66, height: 0.24, depth: 0.12, snout: 0.05, dorsal: 0.7, fork: 0.35, belly: 0.75 },
    color: "#A79074",
    accent: "#6B5842",
    build: "fish",
  },
  {
    id: "rohu",
    name: "Rohu",
    tagline: "River carp",
    category: "Fresh Fish",
    station: "fish",
    price: 890,
    unit: "kg",
    freshness: "Arrived 06:00",
    origin: "Freshwater · West Bengal",
    weight: "1 – 1.8 kg",
    description:
      "The everyday fish of the eastern table, and the one that leaves the building in the most bags. Sweet, soft and best cooked the day it is bought.",
    tastingNote: "Soft, sweet, gentle",
    preparationOptions: ["Whole", "Cleaned", "Curry Cut"],
    position: [0.85, 0.15, 0.52],
    rotation: 1.02,
    shape: { length: 0.7, height: 0.2, depth: 0.11, snout: 0.04, dorsal: 0.55, fork: 0.6, belly: 0.6 },
    color: "#B3B7AE",
    accent: "#6E7A70",
    build: "fish",
  },
  {
    id: "king-prawns",
    name: "King Prawns",
    tagline: "Jumbo grade",
    category: "Prawns & Shellfish",
    station: "prawns",
    price: 3500,
    unit: "kg",
    freshness: "Landed 03:50",
    origin: "Estuary · Cochin",
    weight: "16/20 count",
    description:
      "Large, firm and translucent when they are honest. We keep them on the shell — the shell is where the flavour lives, and it protects the flesh on the ice.",
    tastingNote: "Sweet, snap, briny finish",
    preparationOptions: ["Shell On", "Cleaned", "Deveined", "Whole"],
    position: [-1.15, 0.14, 0.28],
    rotation: 0.3,
    shape: { length: 0.44, height: 0.1, depth: 0.1, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#E4A98C",
    accent: "#B4694C",
    build: "prawn",
  },
  {
    id: "tiger-shrimp",
    name: "Tiger Shrimp",
    tagline: "Bandé",
    category: "Prawns & Shellfish",
    station: "prawns",
    price: 2250,
    unit: "kg",
    freshness: "Landed 04:10",
    origin: "Coastal ponds · Nellore",
    weight: "21/25 count",
    description:
      "Banded, glossy and slightly firmer than the king. Good in a hot pan for ninety seconds and then taken straight off.",
    tastingNote: "Firm, mild, clean",
    preparationOptions: ["Shell On", "Cleaned", "Deveined"],
    position: [0.35, 0.13, -0.3],
    rotation: -0.6,
    shape: { length: 0.34, height: 0.085, depth: 0.085, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#D8B79C",
    accent: "#9C7358",
    build: "prawn",
  },
  {
    id: "blue-crab",
    name: "Blue Crab",
    tagline: "Live tank",
    category: "Shellfish",
    station: "shellfish",
    price: 1980,
    unit: "kg",
    freshness: "Live · held today",
    origin: "Backwater · Vembanad",
    weight: "350 – 500 g each",
    description:
      "Held live until you ask for them. Slate-blue claws, a clean white body and the sweetest meat on the shellfish counter.",
    tastingNote: "Sweet, delicate, mineral",
    preparationOptions: ["Live / Intact", "Cleaned", "Halved"],
    position: [1.4, 0.14, 0.22],
    rotation: -0.25,
    shape: { length: 0.4, height: 0.3, depth: 0.14, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#7E93A0",
    accent: "#4B6472",
    build: "crab",
    shellForm: "round",
  },
  {
    id: "green-mussel",
    name: "Green Mussel",
    tagline: "Rope grown",
    category: "Shellfish",
    station: "shellfish",
    price: 1250,
    unit: "kg",
    freshness: "Purged today",
    origin: "Backwater farms · Kerala",
    weight: "24/36 count",
    description:
      "Rope-grown and purged overnight in clean seawater so there is no grit left in them. Dark shells with a green lip — steamed open, nothing else.",
    tastingNote: "Briny, sweet, tender",
    preparationOptions: ["Whole", "Half Shell", "Cleaned"],
    position: [-1.2, 0.13, 0.3],
    rotation: 0.5,
    shape: { length: 0.3, height: 0.16, depth: 0.1, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#37454E",
    accent: "#6E9A7E",
    build: "shell",
    shellForm: "long",
  },
  {
    id: "pacific-oyster",
    name: "Pacific Oyster",
    tagline: "Half shell",
    category: "Shellfish",
    station: "shellfish",
    price: 2400,
    unit: "half dozen",
    freshness: "Held live · today",
    origin: "Cold water · Brittany",
    weight: "80 – 110 g each",
    description:
      "Deep-cupped, firm and cold. We shuck to order at the bench and pack them on the half shell over crushed ice if you are taking them home.",
    tastingNote: "Cold, mineral, cucumber finish",
    preparationOptions: ["Live / Intact", "Shucked", "Half Shell"],
    position: [0.1, 0.13, -0.28],
    rotation: -0.35,
    shape: { length: 0.32, height: 0.2, depth: 0.12, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#C8C2B2",
    accent: "#8C8676",
    build: "shell",
    shellForm: "round",
  },
  {
    id: "cockle",
    name: "Blood Cockle",
    tagline: "Sand rested",
    category: "Shellfish",
    station: "shellfish",
    price: 980,
    unit: "kg",
    freshness: "Rested 12 hrs",
    origin: "Estuary mud · Tuticorin",
    weight: "30/40 count",
    description:
      "Rested in filtered water until they are clean, then kept cold and dry on the ice. Ribbed, round and best given ninety seconds of steam.",
    tastingNote: "Iron-rich, deep, saline",
    preparationOptions: ["Live / Intact", "Cleaned"],
    position: [1.28, 0.13, 0.24],
    rotation: 0.9,
    shape: { length: 0.24, height: 0.2, depth: 0.11, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#B9A894",
    accent: "#7C6C5A",
    build: "shell",
    shellForm: "round",
  },
  {
    id: "lobster",
    name: "Lobster",
    tagline: "Premium counter",
    category: "Premium Catch",
    station: "premium",
    price: 5400,
    unit: "kg",
    freshness: "Held live · today",
    origin: "Cold water · North Atlantic",
    weight: "600 – 800 g each",
    description:
      "The centrepiece of the hall, kept in the cold well at the end of the counter. We hand it over with the ice it was resting on — never in water.",
    tastingNote: "Rich, oceanic, dense",
    preparationOptions: ["Live / Intact", "Cleaned", "Tail Only", "Dressed"],
    position: [-0.9, 0.16, 0.16],
    rotation: 0.4,
    shape: { length: 0.62, height: 0.16, depth: 0.12, snout: 0, dorsal: 0.5, fork: 0.5, belly: 0.5 },
    color: "#3E4B45",
    accent: "#8C4B33",
    build: "lobster",
  },
  {
    id: "seer-fish",
    name: "Seer Fish",
    tagline: "Premium counter",
    category: "Premium Catch",
    station: "premium",
    price: 4200,
    unit: "kg",
    freshness: "Landed 04:30",
    origin: "Deep sea · Goa banks",
    weight: "2 – 3.5 kg",
    description:
      "King fish, cut to order in thick steaks. The most requested item on the premium counter and the one we reserve by phone before it reaches the ice.",
    tastingNote: "Firm, sweet, steak-like",
    preparationOptions: ["Whole", "Steak Cut", "Fillet", "Cleaned"],
    position: [0.95, 0.17, -0.24],
    rotation: -0.36,
    shape: { length: 0.86, height: 0.2, depth: 0.13, snout: 0.07, dorsal: 0.6, fork: 0.8, belly: 0.55 },
    color: "#93A7AC",
    accent: "#4F666B",
    build: "fish",
    premium: true,
  },
];

export const productById = (id: string | null) =>
  id ? PRODUCTS.find((p) => p.id === id) ?? null : null;

export const productsForStation = (station: StationId) =>
  PRODUCTS.filter((p) => p.station === station);

export const formatPrice = (n: number) =>
  "Rs. " + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
