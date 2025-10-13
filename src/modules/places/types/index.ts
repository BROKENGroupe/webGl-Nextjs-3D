export interface Establishment {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  image: string;
  compliance_score: number;
  noise_impact_external: number;
  acousticProfile: {
    sound_transmission_loss: number;
    impact_sound_insulation: number;
    airborne_sound_insulation: number;
  };
  studies: Study[];
}

export interface Study {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  date: string;
  metrics: {
    iso_compliance_level: number;
    noise_isolation: number;
    sound_transmission_class: number;
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