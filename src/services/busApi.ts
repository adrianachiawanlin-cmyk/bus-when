import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusStops';
import type {
  BusArrivalBoard,
  BusLoad,
  BusOperator,
  BusServiceArrival,
  BusStop,
  BusType,
  NextBusEstimate,
} from '../types/bus';

/**
 * API-Ready Service Layer
 * -----------------------
 * Currently simulates LTA DataMall `BusArrivalv2` responses client-side.
 * When connecting your backend later, set `API_ENDPOINT` to your proxy URL
 * (e.g., `/api/bus-arrival?BusStopCode=${busStopCode}`) and swap the
 * implementation inside `fetchBusArrivals`.
 */
export const API_INTEGRATION_CONFIG = {
  provider: 'LTA DataMall BusArrivalv2 (Frontend Simulation Mode)',
  expectedEndpoint: '/api/lta/bus-arrival?BusStopCode={5DigitCode}',
  refreshIntervalSeconds: 30,
};

const OPERATORS: BusOperator[] = ['SBST', 'SMRT', 'TTS', 'GAS'];

function hashCode(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function pickLoad(seed: number, minuteOffset: number): BusLoad {
  if (minuteOffset <= 2 && seed % 5 === 0) return 'LSD';
  if (seed % 3 === 1) return 'SDA';
  return 'SEA';
}

function buildEstimate(
  originCode: string,
  destinationCode: string,
  minutesFromNow: number,
  nowMs: number,
  seed: number,
  visitNumber: string,
  busType: BusType,
  wheelchairAccessible: boolean
): NextBusEstimate {
  const etaMs = nowMs + minutesFromNow * 60_000;
  return {
    originCode,
    destinationCode,
    estimatedArrival: new Date(etaMs).toISOString(),
    latitude: (1.28 + (seed % 140) * 0.001).toFixed(6),
    longitude: (103.78 + (seed % 180) * 0.001).toFixed(6),
    visitNumber,
    load: pickLoad(seed, minutesFromNow),
    feature: wheelchairAccessible ? 'WAB' : '',
    type: busType,
  };
}

function generateCustomStopFallback(busStopCode: string): BusStop {
  const seed = hashCode(busStopCode);
  const regionIndex = seed % 5;
  const regions: BusStop['region'][] = ['Central', 'East', 'West', 'North', 'North-East'];
  const sampleRoads = ['Bukit Timah Rd', 'Serangoon Rd', 'Upper Thomson Rd', 'Jurong West Ave 1', 'Tampines Ave 4'];
  const sampleServicePool = ['15', '21', '56', '67', '74', '105', '151', '157', '171', '851', '961', '985'];
  const count = 3 + (seed % 3);

  const services = Array.from({ length: count }, (_, idx) => {
    const sIdx = (seed + idx * 3) % sampleServicePool.length;
    const serviceNo = sampleServicePool[sIdx];
    const operator = OPERATORS[(seed + idx) % OPERATORS.length];
    const types: BusType[] = ['DD', 'SD', 'BD'];
    return {
      serviceNo,
      operator,
      originName: 'Regional Bus Interchange',
      destinationName: idx % 2 === 0 ? 'City / Marina Centre' : 'Heartland Hub Ter',
      originCode: busStopCode,
      destinationCode: '02099',
      headwayMinutes: 7 + ((seed + idx) % 7),
      firstBus: '05:30',
      lastBus: '23:45',
      preferredType: types[(seed + idx) % 2],
      wheelchairAccessible: true,
      upcomingStops: ['Next Stop +1', 'Transfer Hub +2', 'Terminal Corridor'],
    };
  });

  return {
    busStopCode,
    roadName: sampleRoads[regionIndex],
    description: `Bus Stop ${busStopCode} (Simulated Code Lookup)`,
    region: regions[regionIndex],
    services,
  };
}

export function getStopByCode(busStopCode: string): BusStop | undefined {
  const normalized = busStopCode.trim();
  return SINGAPORE_BUS_STOPS.find((stop) => stop.busStopCode === normalized);
}

export function isValidBusStopCode(code: string): boolean {
  return /^\d{5}$/.test(code.trim());
}

export function searchBusStops(query: string): BusStop[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return SINGAPORE_BUS_STOPS.slice(0, 8);
  }

  return SINGAPORE_BUS_STOPS.filter((stop) => {
    if (stop.busStopCode.includes(q)) return true;
    if (stop.description.toLowerCase().includes(q)) return true;
    if (stop.roadName.toLowerCase().includes(q)) return true;
    if (stop.mrtNearby && stop.mrtNearby.toLowerCase().includes(q)) return true;
    if (stop.services.some((s) => s.serviceNo.toLowerCase() === q)) return true;
    return false;
  }).sort((a, b) => {
    // Exact bus stop code prefix matches first
    const aStarts = a.busStopCode.startsWith(q) ? 0 : 1;
    const bStarts = b.busStopCode.startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.busStopCode.localeCompare(b.busStopCode);
  });
}

export async function fetchBusArrivals(
  busStopCode: string,
  refreshCycle = 0
): Promise<BusArrivalBoard> {
  const normalized = busStopCode.trim();
  // Realistic brief network delay so loading skeleton states are crisp and verifiable
  await new Promise((resolve) => setTimeout(resolve, 180));

  const catalogStop = getStopByCode(normalized);
  const isSimulatedFallback = !catalogStop;
  const stop = catalogStop ?? generateCustomStopFallback(normalized);

  const nowMs = Date.now();
  const minuteBucket = Math.floor(nowMs / 60_000);

  const services: BusServiceArrival[] = stop.services.map((meta, index) => {
    const seed = hashCode(`${normalized}-${meta.serviceNo}-${refreshCycle}`);
    const headway = Math.max(4, meta.headwayMinutes);
    // Calculate smooth, realistic cyclic arrival offsets that advance naturally over time
    const phase = (seed + minuteBucket) % headway;
    const eta1 = Math.max(0, (headway - phase + index) % headway);
    const eta2 = eta1 + headway + (seed % 3);
    const eta3 = eta2 + headway + ((seed + 1) % 3);

    const secondaryType: BusType = meta.preferredType === 'DD' ? 'SD' : meta.preferredType;

    return {
      serviceNo: meta.serviceNo,
      operator: meta.operator,
      destinationName: meta.destinationName,
      originName: meta.originName,
      firstBus: meta.firstBus,
      lastBus: meta.lastBus,
      upcomingStops: meta.upcomingStops,
      nextBus: buildEstimate(
        meta.originCode,
        meta.destinationCode,
        eta1,
        nowMs,
        seed,
        '1',
        meta.preferredType,
        meta.wheelchairAccessible
      ),
      nextBus2: buildEstimate(
        meta.originCode,
        meta.destinationCode,
        eta2,
        nowMs,
        seed + 7,
        '1',
        secondaryType,
        meta.wheelchairAccessible
      ),
      nextBus3: buildEstimate(
        meta.originCode,
        meta.destinationCode,
        eta3,
        nowMs,
        seed + 13,
        '1',
        meta.preferredType,
        meta.wheelchairAccessible
      ),
    };
  });

  // Sort numerically (with trailing letter e.g. 972M handled cleanly)
  services.sort((a, b) => {
    const numA = parseInt(a.serviceNo, 10);
    const numB = parseInt(b.serviceNo, 10);
    if (numA !== numB) return numA - numB;
    return a.serviceNo.localeCompare(b.serviceNo);
  });

  return {
    busStopCode: stop.busStopCode,
    roadName: stop.roadName,
    description: stop.description,
    region: stop.region,
    mrtNearby: stop.mrtNearby,
    fetchedAt: new Date(nowMs).toISOString(),
    isSimulatedFallback,
    services,
  };
}

export function getMinutesRemaining(estimatedArrivalIso: string, nowMs: number): number {
  const diffMs = new Date(estimatedArrivalIso).getTime() - nowMs;
  if (diffMs <= 45_000) return 0; // "Arr"
  return Math.ceil(diffMs / 60_000);
}

export function formatArrivalMinutes(minutes: number): string {
  if (minutes <= 0) return 'Arr';
  return `${minutes} min`;
}

export function formatClockTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
