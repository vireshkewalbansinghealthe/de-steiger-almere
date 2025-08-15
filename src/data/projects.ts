import { Project, Location } from '../types';

// Images for bedrijfsunits ONLY (excluding problematic images)
const bedrijfsunitImages = [
  '/images/beide1.png',
  '/images/beide2.png', 
  '/images/Image1.png',
  '/images/Image2.png',
  // Excluding Image3.png (you mentioned to exclude)
  '/images/Image4.png',
  '/images/Image5.png',
  // Excluding Image6.png (you mentioned to exclude)
  // Excluding Image7.png (you mentioned to exclude)
  '/images/Image8.png',
  '/images/Image9.png',
  '/images/Image10.png',
  '/images/Image11.png',
  '/images/Image12.png',
  '/images/Image13.png',
  '/images/Image14.png',
  '/images/Image15.png',
  '/images/Image16.png',
  '/images/Image17.png',
  '/images/Image18.png',
  '/images/Image19.png',
  '/images/Image20.png',
  '/images/Image21.png'
  // Excluding Image22.png - Image29.png (those are for opslagboxen)
  // Excluding opslagbox1.png and opslagbox2.png (those are for opslagboxen)
];

// Function to distribute ALL 20 bedrijfsunit images across 12 types - GIVE EACH TYPE 6+ IMAGES!
const getBedrijfsunitImages = (typeIndex: number) => {
  // Give each type 6-8 images by cycling through all 20 images multiple times
  const imagesPerType = 7; // Each type gets 7 images
  const images = [];
  
  for (let i = 0; i < imagesPerType; i++) {
    // Cycle through all bedrijfsunit images, starting at different points for each type
    const imageIndex = (typeIndex * 3 + i) % bedrijfsunitImages.length;
    images.push(bedrijfsunitImages[imageIndex]);
  }
  
  return images;
};

// Images specifically for opslagboxen (Image3,6,7,22-29 + opslagbox images)
const opslagboxImages = [
  '/images/opslagbox1.png',
  '/images/opslagbox2.png',
  '/images/Image3.png',   // Added back for opslagboxen
  '/images/Image6.png',   // Added back for opslagboxen  
  '/images/Image7.png',   // Added back for opslagboxen
  '/images/Image22.png',
  '/images/Image23.png',
  '/images/Image24.png',
  '/images/Image25.png',
  '/images/Image26.png',
  '/images/Image27.png',
  '/images/Image28.png',
  '/images/Image29.png'
];

// Function to distribute opslagbox images across 16 types - GIVE EACH TYPE 6+ IMAGES!
const getOpslagboxImages = (typeIndex: number) => {
  // Give each type 6 images by cycling through all 13 images multiple times
  const imagesPerType = 6; // Each type gets 6 images
  const images = [];
  
  for (let i = 0; i < imagesPerType; i++) {
    // Cycle through all opslagbox images, starting at different points for each type
    const imageIndex = (typeIndex * 2 + i) % opslagboxImages.length;
    images.push(opslagboxImages[imageIndex]);
  }
  
  return images;
};

export const projects: Project[] = [
  // BEDRIJFSUNIT TYPES (12 types, 79 units total with REAL data)

  // Type 1: 1 units (134.7m² netto)
  {
    id: 'bedrijfsunit-type-1',
    name: 'Bedrijfsunit Type 1',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 1 van 134.7m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 1,
    startPrice: '€ 322,140 v.o.n. ex. BTW',
    features: ['134.7m² netto', '153.4m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(0),
    slug: 'bedrijfsunit-type-1',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        unitSizes: ['90m²', '150m²', '200m²', '250m²', '300m²'],
        ceiling: '3.70 meter vrije hoogte',
        floors: 'Vloeropbouw Monolitische afwerking',
        heating: 'Geen vloerverwarming',
        electricity: '3x25A met mogelijkheid tot uitbreiding',
        internet: 'Glasvezel 1Gbps symmetrisch',
        parking: '2 eigen parkeerplaatsen per unit',
        access: '24/7 toegang via app en pincode'
      },
      unitDetails: [
        { 
          unitNumber: 1, 
          netArea: 134.7, 
          grossArea: 153.4, 
          price: '€ 322,140', 
          status: 'beschikbaar',
          industrieNetto: 44.9,
          industrieBruto: 50.6,
          kantoorNetto: 44.9,
          kantoorBruto: 50.6
        }
      ]
    }
  },
  // Type 2: 2 units (92m² netto)
  {
    id: 'bedrijfsunit-type-2',
    name: 'Bedrijfsunit Type 2',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 2 van 92m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 2,
    startPrice: '€ 212,520 v.o.n. ex. BTW',
    features: ['92m² netto', '101.2m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(1),
    slug: 'bedrijfsunit-type-2',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 2, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 9, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        }
      ]
    }
  },
  // Type 3: 8 units (92m² netto)
  {
    id: 'bedrijfsunit-type-3',
    name: 'Bedrijfsunit Type 3',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 3 van 92m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 8,
    startPrice: '€ 212,520 v.o.n. ex. BTW',
    features: ['92m² netto', '101.2m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(2),
    slug: 'bedrijfsunit-type-3',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 3, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 4, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 5, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 6, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 7, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 8, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 10, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 11, 
          netArea: 92, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46,
          industrieBruto: 50.6,
          kantoorNetto: 46,
          kantoorBruto: 50.6
        }
      ]
    }
  },
  // Type 4: 1 units (325.8m² netto)
  {
    id: 'bedrijfsunit-type-4',
    name: 'Bedrijfsunit Type 4',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 4 van 325.8m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 1,
    startPrice: '€ 713,200 v.o.n. ex. BTW',
    features: ['325.8m² netto', '356.59999999999997m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(3),
    slug: 'bedrijfsunit-type-4',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 12, 
          netArea: 325.8, 
          grossArea: 356.59999999999997, 
          price: '€ 713,200', 
          status: 'beschikbaar',
          industrieNetto: 140.6,
          industrieBruto: 152.6,
          kantoorNetto: 140.6,
          kantoorBruto: 152.6
        }
      ]
    }
  },
  // Type 5: 4 units (284.8m² netto)
  {
    id: 'bedrijfsunit-type-5',
    name: 'Bedrijfsunit Type 5',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 5 van 284.8m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 4,
    startPrice: '€ 610,400 - € 640,920 v.o.n. ex. BTW',
    features: ['284.8m² netto', '305.2m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(4),
    slug: 'bedrijfsunit-type-5',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 13, 
          netArea: 284.8, 
          grossArea: 305.2, 
          price: '€ 610,400', 
          status: 'beschikbaar',
          industrieNetto: 142.4,
          industrieBruto: 152.6,
          kantoorNetto: 142.4,
          kantoorBruto: 152.6
        },
        { 
          unitNumber: 34, 
          netArea: 284.8, 
          grossArea: 305.2, 
          price: '€ 610,400', 
          status: 'beschikbaar',
          industrieNetto: 142.4,
          industrieBruto: 152.6,
          kantoorNetto: 142.4,
          kantoorBruto: 152.6
        },
        { 
          unitNumber: 35, 
          netArea: 284.8, 
          grossArea: 305.2, 
          price: '€ 610,400', 
          status: 'beschikbaar',
          industrieNetto: 142.4,
          industrieBruto: 152.6,
          kantoorNetto: 142.4,
          kantoorBruto: 152.6
        },
        { 
          unitNumber: 56, 
          netArea: 284.8, 
          grossArea: 305.2, 
          price: '€ 640,920', 
          status: 'beschikbaar',
          industrieNetto: 142.4,
          industrieBruto: 152.6,
          kantoorNetto: 142.4,
          kantoorBruto: 152.6
        }
      ]
    }
  },
  // Type 6: 36 units (93.8m² netto)
  {
    id: 'bedrijfsunit-type-6',
    name: 'Bedrijfsunit Type 6',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 6 van 93.8m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 36,
    startPrice: '€ 212,520 v.o.n. ex. BTW',
    features: ['93.8m² netto', '101.2m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(5),
    slug: 'bedrijfsunit-type-6',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 14, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 15, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 16, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 17, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 18, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 19, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 20, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 21, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 22, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 25, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 26, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 27, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 28, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 29, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 30, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 31, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 32, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 33, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 36, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 37, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 38, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 39, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 40, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 41, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 42, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 43, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 44, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 47, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 48, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 49, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 50, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 51, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 52, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 53, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 54, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 55, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 0,
          kantoorBruto: 0
        }
      ]
    }
  },
  // Type 7: 4 units (93.2m² netto)
  {
    id: 'bedrijfsunit-type-7',
    name: 'Bedrijfsunit Type 7',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 7 van 93.2m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 4,
    startPrice: '€ 215,880 v.o.n. ex. BTW',
    features: ['93.2m² netto', '102.8m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(6),
    slug: 'bedrijfsunit-type-7',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 23, 
          netArea: 93.2, 
          grossArea: 102.8, 
          price: '€ 215,880', 
          status: 'beschikbaar',
          industrieNetto: 46.6,
          industrieBruto: 51.4,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 24, 
          netArea: 93.2, 
          grossArea: 102.8, 
          price: '€ 215,880', 
          status: 'beschikbaar',
          industrieNetto: 46.6,
          industrieBruto: 51.4,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 45, 
          netArea: 93.2, 
          grossArea: 102.8, 
          price: '€ 215,880', 
          status: 'beschikbaar',
          industrieNetto: 46.6,
          industrieBruto: 51.4,
          kantoorNetto: 0,
          kantoorBruto: 0
        },
        { 
          unitNumber: 46, 
          netArea: 93.2, 
          grossArea: 102.8, 
          price: '€ 215,880', 
          status: 'beschikbaar',
          industrieNetto: 46.6,
          industrieBruto: 51.4,
          kantoorNetto: 0,
          kantoorBruto: 0
        }
      ]
    }
  },
  // Type 8: 1 units (391.6m² netto)
  {
    id: 'bedrijfsunit-type-8',
    name: 'Bedrijfsunit Type 8',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 8 van 391.6m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 1,
    startPrice: '€ 882,630 v.o.n. ex. BTW',
    features: ['391.6m² netto', '420.3m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(7),
    slug: 'bedrijfsunit-type-8',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 57, 
          netArea: 391.6, 
          grossArea: 420.3, 
          price: '€ 882,630', 
          status: 'beschikbaar',
          industrieNetto: 166.9,
          industrieBruto: 177.8,
          kantoorNetto: 166.9,
          kantoorBruto: 177.8
        }
      ]
    }
  },
  // Type 9: 9 units (118.2m² netto)
  {
    id: 'bedrijfsunit-type-9',
    name: 'Bedrijfsunit Type 9',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 9 van 118.2m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 9,
    startPrice: '€ 265,440 v.o.n. ex. BTW',
    features: ['118.2m² netto', '126.4m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(8),
    slug: 'bedrijfsunit-type-9',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 58, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 59, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 60, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 61, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 62, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 63, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 64, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 65, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        },
        { 
          unitNumber: 66, 
          netArea: 118.2, 
          grossArea: 126.4, 
          price: '€ 265,440', 
          status: 'beschikbaar',
          industrieNetto: 59.1,
          industrieBruto: 63.2,
          kantoorNetto: 59.1,
          kantoorBruto: 63.2
        }
      ]
    }
  },
  // Type 10: 1 units (117.4m² netto)
  {
    id: 'bedrijfsunit-type-10',
    name: 'Bedrijfsunit Type 10',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 10 van 117.4m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 1,
    startPrice: '€ 269,640 v.o.n. ex. BTW',
    features: ['117.4m² netto', '128.4m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(9),
    slug: 'bedrijfsunit-type-10',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 67, 
          netArea: 117.4, 
          grossArea: 128.4, 
          price: '€ 269,640', 
          status: 'beschikbaar',
          industrieNetto: 58.7,
          industrieBruto: 64.2,
          kantoorNetto: 58.7,
          kantoorBruto: 64.2
        }
      ]
    }
  },
  // Type 11: 11 units (93.2m² netto)
  {
    id: 'bedrijfsunit-type-11',
    name: 'Bedrijfsunit Type 11',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 11 van 93.2m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 11,
    startPrice: '€ 212,520 - € 215,880 v.o.n. ex. BTW',
    features: ['93.2m² netto', '102.8m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(10),
    slug: 'bedrijfsunit-type-11',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 68, 
          netArea: 93.2, 
          grossArea: 102.8, 
          price: '€ 215,880', 
          status: 'beschikbaar',
          industrieNetto: 46.6,
          industrieBruto: 51.4,
          kantoorNetto: 46.6,
          kantoorBruto: 51.4
        },
        { 
          unitNumber: 69, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 70, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 71, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 72, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 73, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 74, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 75, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 76, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 77, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        },
        { 
          unitNumber: 78, 
          netArea: 93.8, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 46.9,
          industrieBruto: 50.6,
          kantoorNetto: 46.9,
          kantoorBruto: 50.6
        }
      ]
    }
  },
  // Type 12: 1 units (91.6m² netto)
  {
    id: 'bedrijfsunit-type-12',
    name: 'Bedrijfsunit Type 12',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Bedrijfsunit Type 12 van 91.6m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
    units: 1,
    startPrice: '€ 212,520 v.o.n. ex. BTW',
    features: ['91.6m² netto', '101.2m² bruto', 'Industrie + Kantoor', '2 parkeerplaatsen', 'Energielabel A+'],
    images: getBedrijfsunitImages(11),
    slug: 'bedrijfsunit-type-12',
    details: {
      location: 'De Steiger 74/77, Almere',
      unitDetails: [
        { 
          unitNumber: 79, 
          netArea: 91.6, 
          grossArea: 101.2, 
          price: '€ 212,520', 
          status: 'beschikbaar',
          industrieNetto: 45.8,
          industrieBruto: 50.6,
          kantoorNetto: 45.8,
          kantoorBruto: 50.6
        }
      ]
    }
  },

  // OPSLAGBOX TYPES (15 types, 247 opslagboxen total with REAL data)

  // Type 1: 13 opslagboxen (34m² bruto oppervlakte)
  {
    id: 'opslagbox-type-1',
    name: 'Opslagbox Type 1',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 1 van 34m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 13,
    startPrice: '€ 73,480 v.o.n. ex. BTW',
    features: [
          "34m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(0),
    slug: 'opslagbox-type-1',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 1, 
          netArea: 30, 
          grossArea: 33.4, 
          price: '73480', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 2, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 3, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 4, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 5, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 6, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 7, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 8, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 9, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 10, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 11, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 12, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 13, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 2: 1 opslagboxen (46m² bruto oppervlakte)
  {
    id: 'opslagbox-type-2',
    name: 'Opslagbox Type 2',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 2 van 46m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 1,
    startPrice: '€ 100,100 v.o.n. ex. BTW',
    features: [
          "46m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(1),
    slug: 'opslagbox-type-2',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 14, 
          netArea: 41, 
          grossArea: 45.5, 
          price: '100100', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 3: 13 opslagboxen (48m² bruto oppervlakte)
  {
    id: 'opslagbox-type-3',
    name: 'Opslagbox Type 3',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 3 van 48m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 13,
    startPrice: '€ 104,060 v.o.n. ex. BTW',
    features: [
          "48m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(2),
    slug: 'opslagbox-type-3',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 15, 
          netArea: 44, 
          grossArea: 48.7, 
          price: '107140', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 16, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 17, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 18, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 19, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 20, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 21, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 22, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 23, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 24, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 25, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 26, 
          netArea: 43, 
          grossArea: 47.3, 
          price: '104060', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 27, 
          netArea: 45, 
          grossArea: 49.7, 
          price: '109340', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 4: 13 opslagboxen (34m² bruto oppervlakte)
  {
    id: 'opslagbox-type-4',
    name: 'Opslagbox Type 4',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 4 van 34m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 13,
    startPrice: '€ 73,920 v.o.n. ex. BTW',
    features: [
          "34m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(3),
    slug: 'opslagbox-type-4',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 28, 
          netArea: 32, 
          grossArea: 35.3, 
          price: '77660', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 29, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 30, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 31, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 32, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 33, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 34, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 35, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 36, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 37, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 38, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 39, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 40, 
          netArea: 31, 
          grossArea: 34.6, 
          price: '76120', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 5: 14 opslagboxen (48m² bruto oppervlakte)
  {
    id: 'opslagbox-type-5',
    name: 'Opslagbox Type 5',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 5 van 48m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 14,
    startPrice: '€ 73,920 v.o.n. ex. BTW',
    features: [
          "48m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(4),
    slug: 'opslagbox-type-5',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 41, 
          netArea: 30, 
          grossArea: 33.6, 
          price: '73920', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 42, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 43, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 44, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 45, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 46, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 47, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 48, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 49, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 50, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 51, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 52, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 53, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 54, 
          netArea: 45, 
          grossArea: 49.5, 
          price: '108900', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 6: 1 opslagboxen (49m² bruto oppervlakte)
  {
    id: 'opslagbox-type-6',
    name: 'Opslagbox Type 6',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 6 van 49m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 1,
    startPrice: '€ 107,800 v.o.n. ex. BTW',
    features: [
          "49m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(5),
    slug: 'opslagbox-type-6',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 55, 
          netArea: 44, 
          grossArea: 49, 
          price: '107800', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 8: 2 opslagboxen (33m² bruto oppervlakte)
  {
    id: 'opslagbox-type-8',
    name: 'Opslagbox Type 8',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 8 van 33m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 2,
    startPrice: '€ 73,480 v.o.n. ex. BTW',
    features: [
          "33m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(7),
    slug: 'opslagbox-type-8',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 56, 
          netArea: 30, 
          grossArea: 33.4, 
          price: '73480', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 152, 
          netArea: 30, 
          grossArea: 33.4, 
          price: '73480', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 9: 2 opslagboxen (34m² bruto oppervlakte)
  {
    id: 'opslagbox-type-9',
    name: 'Opslagbox Type 9',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 9 van 34m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 2,
    startPrice: '€ 75,020 v.o.n. ex. BTW',
    features: [
          "34m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(8),
    slug: 'opslagbox-type-9',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 57, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 153, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 10: 2 opslagboxen (26m² bruto oppervlakte)
  {
    id: 'opslagbox-type-10',
    name: 'Opslagbox Type 10',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 10 van 26m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 2,
    startPrice: '€ 56,320 v.o.n. ex. BTW',
    features: [
          "26m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(9),
    slug: 'opslagbox-type-10',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 58, 
          netArea: 23, 
          grossArea: 25.6, 
          price: '56320', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 154, 
          netArea: 23, 
          grossArea: 25.6, 
          price: '56320', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 11: 20 opslagboxen (34m² bruto oppervlakte)
  {
    id: 'opslagbox-type-11',
    name: 'Opslagbox Type 11',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 11 van 34m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 20,
    startPrice: '€ 75,020 v.o.n. ex. BTW',
    features: [
          "34m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(10),
    slug: 'opslagbox-type-11',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 59, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 60, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 61, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 62, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 63, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 64, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 65, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 66, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 67, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 68, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 155, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 156, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 157, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 158, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 159, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 160, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 161, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 162, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 163, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 164, 
          netArea: 31, 
          grossArea: 34.1, 
          price: '75020', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 12: 2 opslagboxen (46m² bruto oppervlakte)
  {
    id: 'opslagbox-type-12',
    name: 'Opslagbox Type 12',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 12 van 46m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 2,
    startPrice: '€ 100,100 v.o.n. ex. BTW',
    features: [
          "46m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(11),
    slug: 'opslagbox-type-12',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 69, 
          netArea: 41, 
          grossArea: 45.5, 
          price: '100100', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 165, 
          netArea: 41, 
          grossArea: 45.5, 
          price: '100100', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 13: 32 opslagboxen (14m² bruto oppervlakte)
  {
    id: 'opslagbox-type-13',
    name: 'Opslagbox Type 13',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 13 van 14m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 32,
    startPrice: '€ 31,240 v.o.n. ex. BTW',
    features: [
          "14m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(12),
    slug: 'opslagbox-type-13',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 70, 
          netArea: 14, 
          grossArea: 15, 
          price: '33000', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 71, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 72, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 73, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 74, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 75, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 76, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 77, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 78, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 79, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 80, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 81, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 82, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 83, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 84, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 85, 
          netArea: 14, 
          grossArea: 15, 
          price: '33000', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 166, 
          netArea: 14, 
          grossArea: 15, 
          price: '33000', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 167, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 168, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 169, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 170, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 171, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 172, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 173, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 174, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 175, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 176, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 177, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 178, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 179, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 180, 
          netArea: 13, 
          grossArea: 14.2, 
          price: '31240', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 181, 
          netArea: 14, 
          grossArea: 15, 
          price: '33000', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 14: 32 opslagboxen (16m² bruto oppervlakte)
  {
    id: 'opslagbox-type-14',
    name: 'Opslagbox Type 14',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 14 van 16m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 32,
    startPrice: '€ 35,200 v.o.n. ex. BTW',
    features: [
          "16m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(13),
    slug: 'opslagbox-type-14',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 86, 
          netArea: 15, 
          grossArea: 17, 
          price: '37400', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 87, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 88, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 89, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 90, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 91, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 92, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 93, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 94, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 95, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 96, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 97, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 98, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 99, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 100, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 101, 
          netArea: 15, 
          grossArea: 17, 
          price: '37400', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 182, 
          netArea: 15, 
          grossArea: 17, 
          price: '37400', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 183, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 184, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 185, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 186, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 187, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 188, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 189, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 190, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 191, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 192, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 193, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 194, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 195, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 196, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 197, 
          netArea: 15, 
          grossArea: 17, 
          price: '37400', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 15: 64 opslagboxen (15m² bruto oppervlakte)
  {
    id: 'opslagbox-type-15',
    name: 'Opslagbox Type 15',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 15 van 15m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 64,
    startPrice: '€ 33,220 v.o.n. ex. BTW',
    features: [
          "15m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(14),
    slug: 'opslagbox-type-15',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 102, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 103, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 104, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 105, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 106, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 107, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 108, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 109, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 110, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 111, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 112, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 113, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 114, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 115, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 116, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 117, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 118, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 119, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 120, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 121, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 122, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 123, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 124, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 125, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 126, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 127, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 128, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 129, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 130, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 131, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 132, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 133, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 198, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 199, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 200, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 201, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 202, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 203, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 204, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 205, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 206, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 207, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 208, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 209, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 210, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 211, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 212, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 213, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 214, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 215, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 216, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 217, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 218, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 219, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 220, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 221, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 222, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 223, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 224, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 225, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 226, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 227, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 228, 
          netArea: 14, 
          grossArea: 15.1, 
          price: '33220', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 229, 
          netArea: 14, 
          grossArea: 16, 
          price: '35200', 
          status: 'beschikbaar'
        }
      ]
    }
  },
  // Type 16: 36 opslagboxen (18m² bruto oppervlakte)
  {
    id: 'opslagbox-type-16',
    name: 'Opslagbox Type 16',
    location: 'Almere',
    status: 'NU IN DE VERKOOP',
    description: 'Opslagbox Type 16 van 18m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
    garageBoxes: 36,
    startPrice: '€ 40,260 v.o.n. ex. BTW',
    features: [
          "18m² bruto oppervlakte",
          "Veilige opslag",
          "Energielabel A+",
          "24/7 toegang",
          "Reservering: € 1,500"
    ],
    images: getOpslagboxImages(15),
    slug: 'opslagbox-type-16',
    details: {
      location: 'De Steiger 74/77, Almere',
      specifications: {
        ceiling: '2.70 meter vrije hoogte',
        floors: 'Betonvloer',
        electricity: 'Standaard 1x16A aansluiting',
        internet: 'Glasvezel beschikbaar',
        access: '24/7 toegang via app en pincode',
        security: 'Beveiligingssysteem met camera\'s'
      },
      unitDetails: [
        { 
          unitNumber: 134, 
          netArea: 17, 
          grossArea: 19.3, 
          price: '42460', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 135, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 136, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 137, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 138, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 139, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 140, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 141, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 142, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 143, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 144, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 145, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 146, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 147, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 148, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 149, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 150, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 151, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 230, 
          netArea: 17, 
          grossArea: 19.3, 
          price: '42460', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 231, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 232, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 233, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 234, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 235, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 236, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 237, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 238, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 239, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 240, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 241, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 242, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 243, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 244, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 245, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 246, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        },
        { 
          unitNumber: 247, 
          netArea: 16, 
          grossArea: 18.3, 
          price: '40260', 
          status: 'beschikbaar'
        }
      ]
    }
  },
];

export const locations: Location[] = [
  { 
    name: 'Almere', 
    slug: 'almere', 
    projects: [
      'bedrijfsunit-type-1',
      'bedrijfsunit-type-2',
      'bedrijfsunit-type-3',
      'bedrijfsunit-type-4',
      'bedrijfsunit-type-5',
      'bedrijfsunit-type-6',
      'bedrijfsunit-type-7',
      'bedrijfsunit-type-8',
      'bedrijfsunit-type-9',
      'bedrijfsunit-type-10',
      'bedrijfsunit-type-11',
      'bedrijfsunit-type-12',
      'opslagbox-type-1',
      'opslagbox-type-2',
      'opslagbox-type-3',
      'opslagbox-type-4',
      'opslagbox-type-5',
      'opslagbox-type-6',
      'opslagbox-type-8',
      'opslagbox-type-9',
      'opslagbox-type-10',
      'opslagbox-type-11',
      'opslagbox-type-12',
      'opslagbox-type-13',
      'opslagbox-type-14',
      'opslagbox-type-15',
      'opslagbox-type-16'
    ] 
  },
]; 