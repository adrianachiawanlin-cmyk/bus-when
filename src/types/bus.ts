export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export type BusLoad = 'SEA' | 'SDA' | 'LSD';

export type BusType = 'SD' | 'DD' | 'BD';

export type BusFeature = 'WAB' | '';

export type SingaporeRegion = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export interface NextBusEstimate {
  originCode: string;
  destinationCode: string;
  estimatedArrival: string; // ISO-8601 timestamp matching LTA DataMall BusArrivalv2
  latitude: string;
  longitude: string;
  visitNumber: string;
  load: BusLoad;
  feature: BusFeature;
  type: BusType;
}

export interface BusServiceArrival {
  serviceNo: string;
  operator: BusOperator;
  destinationName: string;
  originName: string;
  firstBus: string;
  lastBus: string;
  upcomingStops: string[];
  nextBus: NextBusEstimate;
  nextBus2: NextBusEstimate | null;
  nextBus3: NextBusEstimate | null;
}

export interface BusStopServiceMeta {
  serviceNo: string;
  operator: BusOperator;
  originName: string;
  destinationName: string;
  originCode: string;
  destinationCode: string;
  headwayMinutes: number;
  firstBus: string;
  lastBus: string;
  preferredType: BusType;
  wheelchairAccessible: boolean;
  upcomingStops: string[];
}

export interface BusStop {
  busStopCode: string; // 5-digit LTA bus stop code
  roadName: string;
  description: string;
  region: SingaporeRegion;
  mrtNearby?: string;
  services: BusStopServiceMeta[];
}

export interface BusArrivalBoard {
  busStopCode: string;
  roadName: string;
  description: string;
  region: SingaporeRegion;
  mrtNearby?: string;
  fetchedAt: string;
  isSimulatedFallback?: boolean;
  services: BusServiceArrival[];
}

export interface FavoriteStop {
  busStopCode: string;
  description: string;
  roadName: string;
  region: SingaporeRegion;
  customLabel?: string;
  addedAt: string;
}

export interface RecentStop {
  busStopCode: string;
  description: string;
  roadName: string;
  visitedAt: string;
}
