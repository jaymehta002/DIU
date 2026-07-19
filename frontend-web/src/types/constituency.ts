export interface ConstituencySummary {
  id: string;
  name: string;
}

export interface ConstituencyDetail extends ConstituencySummary {
  code: string;
}
