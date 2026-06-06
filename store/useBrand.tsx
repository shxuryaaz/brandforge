import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CampaignGoal, Trend } from '@/constants/mock';

export type BrandState = {
  companyName: string;
  goal: CampaignGoal;
  focus: string;
  tone: string[];
  keywords: string[];
  positioning: string;
};

export type Campaign = {
  trendId: string;
  caption: string;
  hashtags: string[];
  creativeDirection: string;
  platform: string;
  postTime: string;
  imageUrl?: string;
};

type BrandContextType = {
  brand: BrandState | null;
  setBrand: (b: BrandState) => void;
  campaign: Campaign | null;
  setCampaign: (c: Campaign) => void;
  trends: Trend[] | null;
  setTrends: (t: Trend[]) => void;
};

const BrandContext = createContext<BrandContextType>({
  brand: null,
  setBrand: () => {},
  campaign: null,
  setCampaign: () => {},
  trends: null,
  setTrends: () => {},
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandState | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [trends, setTrends] = useState<Trend[] | null>(null);
  return (
    <BrandContext.Provider value={{ brand, setBrand, campaign, setCampaign, trends, setTrends }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
