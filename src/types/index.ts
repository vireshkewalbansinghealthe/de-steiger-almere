export interface UnitDetail {
  unitNumber: number;
  netArea: number;
  grossArea: number;
  price: string;
  status: 'beschikbaar' | 'gereserveerd' | 'verkocht';
  industrieNetto?: number;
  industrieBruto?: number;
  kantoorNetto?: number;
  kantoorBruto?: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'NU IN DE VERKOOP' | 'COMING SOON' | 'UITVERKOCHT' | 'NOG ÉÉN UNIT BESCHIKBAAR!' | 'FASE II NU IN DE VERKOOP' | 'LAATSTE UNITS IN DE VERKOOP';
  percentageSold?: number;
  description: string;
  startPrice?: string;
  units?: number;
  parkingSpaces?: number;
  garageBoxes?: number;
  buildingStart?: string;
  phase?: string;
  features: string[];
  images: string[];
  slug: string;
  details?: {
    location: string;
    accessibility?: string;
    sustainability?: string;
    facilities?: string[];
    unitDetails?: UnitDetail[];
    specifications?: {
      unitSizes?: string[];
      ceiling: string;
      floors?: string;
      heating?: string;
      electricity: string;
      internet: string;
      parking?: string;
      access: string;
      security?: string;
    };
    investorInfo?: {
      expectedReturn: string;
      maintenanceRisk: string;
      rentalPotential: string;
      whyInvest: string[];
    };
  };
}

export interface Location {
  name: string;
  slug: string;
  projects: string[];
}

export interface NewsletterSignup {
  email: string;
  projectInterest?: string;
}