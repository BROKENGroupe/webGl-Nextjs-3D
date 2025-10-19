export interface Place {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  status: string;
  address: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  complianceScore: number;
  noiseImpactExternal: number;
  acousticProfile: {
    soundTransmissionLoss: number;
    impactSoundInsulation: number;
    airborneSoundInsulation: number;
  };
  simulations: Simulations[];
}

export interface Simulations {
  id?: string;
  workspaceId?: string;
  placeId?: string;
  userId?: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  date: string;
  acousticProfile: {
    soundTransmissionLoss: number;
    impactSoundInsulation: number;
    airborneSoundInsulation: number;
  };
  metrics: {
    isoComplianceLevel: number;
    noiseIsolation: number;
    soundTransmissionClass: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  requirement: string;
  earned: boolean;
  earnedDate?: string;
}

export interface EstablishmentType {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dot: string;
}

export interface ProgressHoverData {
  title: string;
  value: string;
  description: string;
  recommendation?: string;
}