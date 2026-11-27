export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export type BusLoad = 'SEA' | 'SDA' | 'LSD';

export type BusType = 'SD' | 'DD' | 'BD';

export type BusFeature = 'WAB' | '';

export type SingaporeRegion = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export interface NextBusEstimate {
  originCode: string;
  destinationCode: string;
  estimatedArrival: string; // ISO-8601 timestamp matching LTA DataMall v3 BusArrival
  monitored?: number; // LTA v3: 1 = GPS live, 0 = schedule-based
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
  dataSource: 'live' | 'simulated';
  upstreamMessage?: string;
  isSimulatedFallback?: boolean;
  services: BusServiceArrival[];
}

export interface LtaNextBusV3 {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Monitored?: number;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: string;
  Feature?: string;
  Type?: string;
}

export interface LtaServiceV3 {
  ServiceNo: string;
  Operator: string;
  NextBus?: LtaNextBusV3;
  NextBus2?: LtaNextBusV3;
  NextBus3?: LtaNextBusV3;
}

export interface LtaBusArrivalV3Response {
  BusStopCode: string;
  Services: LtaServiceV3[];
}

export interface ApiHealthStatus {
  ok: boolean;
  service: string;
  endpointVersion: string;
  ltaConfigured: boolean;
  refreshIntervalSeconds: number;
  timestamp: string;
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
