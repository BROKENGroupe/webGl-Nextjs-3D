export interface Study {
  id: number;
  name: string;
  status: 'ok' | 'review' | 'pending';
}

export interface Establishment {
  id: number;
  name: string;
  type?: string;
  location?: string;
}

export interface DashboardStats {
  studiesOk: number;
  studiesReview: number;
  totalStudies: number;
  totalEstablishments: number;
}

export const STATUS_COLORS: Record<string, string> = {
  ok: "bg-green-400",
  review: "bg-yellow-300",
  pending: "bg-red-400"
};

export const STATUS_LABELS: Record<string, string> = {
  ok: "Cumple norma",
  review: "Por revisar",
  pending: "Pendiente"
};