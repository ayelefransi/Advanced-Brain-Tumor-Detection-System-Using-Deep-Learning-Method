export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory?: string;
  symptoms?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scan {
  id: string;
  userId: string;
  patientId?: string;
  originalImage: string;
  segmentationMask: string;
  tumorType: string;
  confidence: number;
  hasTumor: boolean;
  processingTime?: number;
  originalPath: string;
  maskPath: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Initial empty data
export const localData = {
  users: [] as User[],
  patients: [] as Patient[],
  scans: [] as Scan[],
}; 