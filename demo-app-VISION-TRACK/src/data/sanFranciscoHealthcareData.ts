export interface SanFranciscoHealthcareFacility {
  id: string;
  name: string;
  type: 'emergency' | 'urgent_care' | 'primary_care' | 'specialist' | 'hospital';
  address: string;
  neighborhood: string;
  phone: string;
  distance: string;
  rating: number;
  waitTime?: string;
  open24h?: boolean;
  acceptsInsurance: boolean;
  acceptsMedicaid: boolean;
  slidingScale?: boolean;
  specialties?: string[];
  coordinates: { lat: number; lng: number };
  foundingYear?: number;
  annualPatients?: number;
  languages?: string[];
  accessibility?: string[];
}

export const sanFranciscoHealthcareFacilities: SanFranciscoHealthcareFacility[] = [
  // Emergency Rooms & Major Hospitals
  {
    id: 'sf_er_001',
    name: 'UCSF Medical Center - Parnassus Heights',
    type: 'hospital',
    address: '505 Parnassus Ave, San Francisco, CA 94143',
    neighborhood: 'Parnassus Heights',
    phone: '(415) 476-1000',
    distance: '0.8 miles',
    rating: 4.8,
    open24h: true,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Pediatrics'],
    coordinates: { lat: 37.7625, lng: -122.4575 },
    foundingYear: 1907,
    annualPatients: 250000,
    languages: ['English', 'Spanish', 'Chinese', 'Tagalog'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters', 'Braille Materials']
  },
  {
    id: 'sf_er_002',
    name: 'California Pacific Medical Center - Mission Bernal',
    type: 'hospital',
    address: '3555 Cesar Chavez St, San Francisco, CA 94110',
    neighborhood: 'Mission District',
    phone: '(415) 600-6000',
    distance: '1.2 miles',
    rating: 4.6,
    open24h: true,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Emergency Medicine', 'Maternity', 'Cardiology', 'Orthopedics'],
    coordinates: { lat: 37.7489, lng: -122.4150 },
    foundingYear: 1991,
    annualPatients: 180000,
    languages: ['English', 'Spanish', 'Chinese'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters']
  },
  {
    id: 'sf_er_003',
    name: 'San Francisco General Hospital & Trauma Center',
    type: 'hospital',
    address: '1001 Potrero Ave, San Francisco, CA 94110',
    neighborhood: 'Potrero Hill',
    phone: '(415) 206-8000',
    distance: '1.5 miles',
    rating: 4.4,
    open24h: true,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    slidingScale: true,
    specialties: ['Trauma', 'Emergency Medicine', 'Infectious Disease', 'Psychiatry'],
    coordinates: { lat: 37.7555, lng: -122.4064 },
    foundingYear: 1872,
    annualPatients: 300000,
    languages: ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Tagalog'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters', 'Braille Materials']
  },

  // Urgent Care Centers
  {
    id: 'sf_uc_001',
    name: 'One Medical - Financial District',
    type: 'urgent_care',
    address: '450 Sutter St, San Francisco, CA 94108',
    neighborhood: 'Financial District',
    phone: '(415) 644-1000',
    distance: '0.5 miles',
    rating: 4.3,
    waitTime: '15-30 min',
    acceptsInsurance: true,
    acceptsMedicaid: false,
    specialties: ['Primary Care', 'Urgent Care', 'Preventive Medicine'],
    coordinates: { lat: 37.7897, lng: -122.4098 },
    foundingYear: 2007,
    annualPatients: 45000,
    languages: ['English', 'Spanish'],
    accessibility: ['Wheelchair Accessible']
  },
  {
    id: 'sf_uc_002',
    name: 'Carbon Health - Mission Bay',
    type: 'urgent_care',
    address: '185 Berry St, San Francisco, CA 94107',
    neighborhood: 'Mission Bay',
    phone: '(415) 555-0123',
    distance: '1.8 miles',
    rating: 4.1,
    waitTime: '20-45 min',
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Urgent Care', 'Primary Care', 'Telemedicine'],
    coordinates: { lat: 37.7701, lng: -122.3874 },
    foundingYear: 2015,
    annualPatients: 35000,
    languages: ['English', 'Spanish', 'Chinese'],
    accessibility: ['Wheelchair Accessible']
  },
  {
    id: 'sf_uc_003',
    name: 'CityMD Urgent Care - Marina District',
    type: 'urgent_care',
    address: '2150 Chestnut St, San Francisco, CA 94123',
    neighborhood: 'Marina District',
    phone: '(415) 555-0456',
    distance: '2.1 miles',
    rating: 4.2,
    waitTime: '25-50 min',
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Urgent Care', 'Occupational Health', 'Travel Medicine'],
    coordinates: { lat: 37.8005, lng: -122.4368 },
    foundingYear: 2010,
    annualPatients: 28000,
    languages: ['English', 'Spanish'],
    accessibility: ['Wheelchair Accessible']
  },

  // Primary Care Clinics
  {
    id: 'sf_pc_001',
    name: 'Mission Neighborhood Health Center',
    type: 'primary_care',
    address: '240 Shotwell St, San Francisco, CA 94110',
    neighborhood: 'Mission District',
    phone: '(415) 552-3870',
    distance: '1.3 miles',
    rating: 4.7,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    slidingScale: true,
    specialties: ['Primary Care', 'Pediatrics', 'Women\'s Health', 'Dental'],
    coordinates: { lat: 37.7512, lng: -122.4156 },
    foundingYear: 1973,
    annualPatients: 65000,
    languages: ['English', 'Spanish', 'Chinese', 'Vietnamese'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters']
  },
  {
    id: 'sf_pc_002',
    name: 'North East Medical Services (NEMS)',
    type: 'primary_care',
    address: '1520 Stockton St, San Francisco, CA 94133',
    neighborhood: 'Chinatown',
    phone: '(415) 391-9686',
    distance: '1.7 miles',
    rating: 4.5,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    slidingScale: true,
    specialties: ['Primary Care', 'Pediatrics', 'Geriatrics', 'Traditional Chinese Medicine'],
    coordinates: { lat: 37.7941, lng: -122.4078 },
    foundingYear: 1974,
    annualPatients: 80000,
    languages: ['English', 'Chinese (Cantonese)', 'Chinese (Mandarin)', 'Vietnamese'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters']
  },
  {
    id: 'sf_pc_003',
    name: 'Southeast Health Center',
    type: 'primary_care',
    address: '2401 Keith St, San Francisco, CA 94124',
    neighborhood: 'Bayview-Hunters Point',
    phone: '(415) 671-1000',
    distance: '3.2 miles',
    rating: 4.3,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    slidingScale: true,
    specialties: ['Primary Care', 'Pediatrics', 'Mental Health', 'Substance Abuse'],
    coordinates: { lat: 37.7305, lng: -122.3874 },
    foundingYear: 1985,
    annualPatients: 42000,
    languages: ['English', 'Spanish', 'Chinese'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters']
  },

  // Specialist Clinics
  {
    id: 'sf_sp_001',
    name: 'Kaiser Permanente San Francisco Medical Center',
    type: 'specialist',
    address: '2425 Geary Blvd, San Francisco, CA 94115',
    neighborhood: 'Western Addition',
    phone: '(415) 833-2000',
    distance: '1.9 miles',
    rating: 4.4,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Cardiology', 'Orthopedics', 'Dermatology', 'Ophthalmology', 'Neurology'],
    coordinates: { lat: 37.7833, lng: -122.4467 },
    foundingYear: 1953,
    annualPatients: 120000,
    languages: ['English', 'Spanish', 'Chinese'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters']
  },
  {
    id: 'sf_sp_002',
    name: 'UCSF Mount Zion Medical Center',
    type: 'specialist',
    address: '1600 Divisadero St, San Francisco, CA 94115',
    neighborhood: 'Pacific Heights',
    phone: '(415) 567-6600',
    distance: '2.3 miles',
    rating: 4.6,
    acceptsInsurance: true,
    acceptsMedicaid: true,
    specialties: ['Cancer Care', 'Women\'s Health', 'Geriatrics', 'Palliative Care'],
    coordinates: { lat: 37.7874, lng: -122.4372 },
    foundingYear: 1887,
    annualPatients: 95000,
    languages: ['English', 'Spanish', 'Chinese', 'Russian'],
    accessibility: ['Wheelchair Accessible', 'ASL Interpreters', 'Braille Materials']
  }
];

// San Francisco Neighborhood Data
export interface SanFranciscoNeighborhood {
  name: string;
  population: number;
  medianIncome: number;
  medianAge: number;
  coordinates: { lat: number; lng: number };
  characteristics: string[];
  healthcareAccess: 'high' | 'medium' | 'low';
}

export const sanFranciscoNeighborhoods: SanFranciscoNeighborhood[] = [
  {
    name: 'Mission District',
    population: 55000,
    medianIncome: 85000,
    medianAge: 32,
    coordinates: { lat: 37.7599, lng: -122.4148 },
    characteristics: ['Diverse', 'Cultural', 'Tech Startups', 'Gentrifying'],
    healthcareAccess: 'medium'
  },
  {
    name: 'Financial District',
    population: 32000,
    medianIncome: 145000,
    medianAge: 35,
    coordinates: { lat: 37.7897, lng: -122.4098 },
    characteristics: ['Business', 'High-rise', 'Professional', 'Tourist'],
    healthcareAccess: 'high'
  },
  {
    name: 'Marina District',
    population: 28000,
    medianIncome: 165000,
    medianAge: 38,
    coordinates: { lat: 37.8005, lng: -122.4368 },
    characteristics: ['Affluent', 'Waterfront', 'Shopping', 'Young Professionals'],
    healthcareAccess: 'high'
  },
  {
    name: 'Chinatown',
    population: 18000,
    medianIncome: 65000,
    medianAge: 45,
    coordinates: { lat: 37.7941, lng: -122.4078 },
    characteristics: ['Cultural', 'Historic', 'Dense', 'Traditional'],
    healthcareAccess: 'medium'
  },
  {
    name: 'Bayview-Hunters Point',
    population: 35000,
    medianIncome: 55000,
    medianAge: 38,
    coordinates: { lat: 37.7305, lng: -122.3874 },
    characteristics: ['Industrial', 'Working Class', 'Diverse', 'Waterfront'],
    healthcareAccess: 'low'
  },
  {
    name: 'Pacific Heights',
    population: 22000,
    medianIncome: 185000,
    medianAge: 42,
    coordinates: { lat: 37.7874, lng: -122.4372 },
    characteristics: ['Affluent', 'Historic', 'Residential', 'Professional'],
    healthcareAccess: 'high'
  }
];

// Transportation Data for Healthcare Access
export interface SanFranciscoTransportation {
  type: 'muni_bus' | 'muni_rail' | 'bart' | 'cable_car' | 'ferry';
  route: string;
  name: string;
  healthcareStops: string[];
  frequency: string;
  operatingHours: string;
  fare: number;
}

export const sanFranciscoTransportation: SanFranciscoTransportation[] = [
  {
    type: 'muni_bus',
    route: '38',
    name: 'Geary Boulevard',
    healthcareStops: ['UCSF Medical Center', 'Kaiser Permanente', 'California Pacific Medical Center'],
    frequency: 'Every 5-10 minutes',
    operatingHours: '5:00 AM - 1:00 AM',
    fare: 2.50
  },
  {
    type: 'muni_bus',
    route: '22',
    name: 'Fillmore Street',
    healthcareStops: ['UCSF Mount Zion', 'Mission Neighborhood Health Center'],
    frequency: 'Every 8-15 minutes',
    operatingHours: '5:30 AM - 12:30 AM',
    fare: 2.50
  },
  {
    type: 'muni_rail',
    route: 'N',
    name: 'Judah Street',
    healthcareStops: ['UCSF Medical Center', 'San Francisco General Hospital'],
    frequency: 'Every 8-12 minutes',
    operatingHours: '5:00 AM - 12:30 AM',
    fare: 2.50
  },
  {
    type: 'bart',
    route: 'Richmond-Fremont',
    name: 'Richmond to Fremont',
    healthcareStops: ['UCSF Medical Center', 'Mission Bay Area'],
    frequency: 'Every 15-20 minutes',
    operatingHours: '5:00 AM - 12:00 AM',
    fare: 3.50
  }
];

// Healthcare Statistics for San Francisco
export const sanFranciscoHealthcareStats = {
  totalPopulation: 873965,
  healthcareWorkers: 45000,
  hospitals: 8,
  urgentCareCenters: 25,
  primaryCareClinics: 45,
  specialistClinics: 35,
  emergencyRooms: 6,
  averageWaitTime: {
    emergency: '15-45 minutes',
    urgentCare: '20-60 minutes',
    primaryCare: '1-3 days',
    specialist: '2-6 weeks'
  },
  insuranceCoverage: {
    insured: 92,
    uninsured: 8,
    medicaid: 18,
    medicare: 15
  },
  languages: ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Tagalog', 'Russian', 'Korean', 'Japanese'],
  accessibility: ['Wheelchair Accessible', 'ASL Interpreters', 'Braille Materials', 'Large Print', 'Audio Descriptions']
};

// Utility Functions
export const findNearbyFacilities = (
  userLat: number, 
  userLng: number, 
  facilityType?: string,
  maxDistance: number = 5
): SanFranciscoHealthcareFacility[] => {
  return sanFranciscoHealthcareFacilities
    .filter(facility => {
      if (facilityType && facility.type !== facilityType) return false;
      
      const distance = calculateDistance(
        userLat, 
        userLng, 
        facility.coordinates.lat, 
        facility.coordinates.lng
      );
      
      return distance <= maxDistance;
    })
    .sort((a, b) => {
      const distanceA = calculateDistance(
        userLat, 
        userLng, 
        a.coordinates.lat, 
        a.coordinates.lng
      );
      const distanceB = calculateDistance(
        userLat, 
        userLng, 
        b.coordinates.lat, 
        b.coordinates.lng
      );
      return distanceA - distanceB;
    });
};

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getNeighborhoodByCoordinates = (
  lat: number, 
  lng: number
): SanFranciscoNeighborhood | null => {
  let closest = null;
  let minDistance = Infinity;
  
  for (const neighborhood of sanFranciscoNeighborhoods) {
    const distance = calculateDistance(
      lat, 
      lng, 
      neighborhood.coordinates.lat, 
      neighborhood.coordinates.lng
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = neighborhood;
    }
  }
  
  return closest;
};

export const getTransportationOptions = (
  facilityId: string
): SanFranciscoTransportation[] => {
  const facility = sanFranciscoHealthcareFacilities.find(f => f.id === facilityId);
  if (!facility) return [];
  
  return sanFranciscoTransportation.filter(transport => 
    transport.healthcareStops.some(stop => 
      facility.name.includes(stop) || stop.includes(facility.name)
    )
  );
};
