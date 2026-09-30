import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch live thunderstorm & lightning forecast from FastAPI backend
 * Endpoint: http://localhost:8000/api/live-forecast
 */
export const fetchLiveForecast = async (region = 'National Capital Region (Delhi NCR)') => {
  try {
    const res = await axios.get('http://localhost:8000/api/live-forecast', {
      params: { region },
      timeout: 8000,
    });
    return res.data;
  } catch (error) {
    console.warn('Backend live-forecast API request failed, serving cached/local fallback data:', error.message);
    return getFallbackLiveForecastData(region);
  }
};

export const fetchNowcastSummary = async (lat = 28.6139, lon = 77.2090, radius = 100, leadTime = 120) => {
  try {
    const res = await apiClient.get('/nowcast/summary', {
      params: { lat, lon, radius_km: radius, lead_time_min: leadTime },
    });
    return res.data;
  } catch (error) {
    console.warn('Backend API request failed, serving cached/local fallback data:', error.message);
    return getFallbackNowcastData(lat, lon);
  }
};

export const fetchRecentStrikes = async (lat = 28.6139, lon = 77.2090, radius = 100) => {
  try {
    const res = await apiClient.get('/lightning/recent-strikes', {
      params: { lat, lon, radius_km: radius },
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchLightningRiskGrid = async (lat = 28.6139, lon = 77.2090, radius = 80, horizon = 60) => {
  try {
    const res = await apiClient.get('/lightning/prediction-grid', {
      params: { lat, lon, radius_km: radius, horizon_min: horizon },
    });
    return res.data;
  } catch (error) {
    return { strike_risk_grid: [], total_predicted_flashes: 0, hotspots: [] };
  }
};

export const fetchRadarFrames = async (radarStation = 'DELHI_DWR') => {
  try {
    const res = await apiClient.get('/radar/frames', {
      params: { radar_station: radarStation },
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchActiveAlerts = async (lat = 28.6139, lon = 77.2090) => {
  try {
    const res = await apiClient.get('/alerts/active', {
      params: { lat, lon },
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchAWSStations = async () => {
  try {
    const res = await apiClient.get('/alerts/aws-stations');
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchSirenStatus = async () => {
  try {
    const res = await apiClient.get('/alerts/siren-status');
    return res.data;
  } catch (error) {
    return null;
  }
};

export const fetchCriticalAssets = async () => {
  try {
    const res = await apiClient.get('/alerts/critical-assets');
    return res.data;
  } catch (error) {
    return [];
  }
};

export const evaluateHazardThreats = async (stormCells) => {
  try {
    const res = await apiClient.post('/alerts/evaluate', stormCells);
    return res.data;
  } catch (error) {
    return null;
  }
};

// Fallback live-forecast data matching backend /api/live-forecast schema
export function getFallbackLiveForecastData(region = 'National Capital Region (Delhi NCR)') {
  return {
    region_name: region,
    timestamp: new Date().toISOString(),
    thunderstorm_probability: '88%',
    lightning_risk_level: 'Severe',
    active_storm_cells: [
      {
        cell_id: 'CELL-NCR-01',
        lat: 28.7041,
        lng: 77.1025,
        radius_km: 18.5,
        intensity: 'Severe (56.4 dBZ)',
        dbz: 56.4,
        speed_kmh: 42.0,
        direction: 'ENE',
        cloud_top_height_km: 14.8,
      },
      {
        cell_id: 'CELL-NCR-02',
        lat: 28.4595,
        lng: 77.0266,
        radius_km: 24.0,
        intensity: 'Moderate (44.2 dBZ)',
        dbz: 44.2,
        speed_kmh: 36.0,
        direction: 'NE',
        cloud_top_height_km: 11.5,
      },
      {
        cell_id: 'CELL-NCR-03',
        lat: 28.5355,
        lng: 77.3910,
        radius_km: 15.0,
        intensity: 'Severe (52.8 dBZ)',
        dbz: 52.8,
        speed_kmh: 45.0,
        direction: 'ENE',
        cloud_top_height_km: 13.9,
      },
      {
        cell_id: 'CELL-NCR-04',
        lat: 28.8920,
        lng: 76.9850,
        radius_km: 30.2,
        intensity: 'Moderate (38.7 dBZ)',
        dbz: 38.7,
        speed_kmh: 30.0,
        direction: 'E',
        cloud_top_height_km: 10.2,
      },
    ],
    multi_radar_inputs: {
      active_stations: [
        'Delhi Palam DWR (S-Band Doppler Radar)',
        'Mausam Bhavan DWR (C-Band Doppler Radar)',
        'Jaipur Regional DWR Network',
      ],
      composite_max_dbz: 56.4,
      elevation_scans_deg: [0.5, 1.0, 2.0, 4.5, 9.0, 15.0],
      update_interval_min: 10,
    },
    satellite_inputs: {
      satellite_source: 'INSAT-3DR / INSAT-3D Multispectral Imager',
      channels: ['TIR-1 (10.8 µm)', 'MIR (3.9 µm)', 'WV (6.7 µm)'],
      cloud_top_temp_kelvin: 204.5,
      overshooting_tops: true,
    },
    emergency_siren_trigger: {
      siren_triggered: true,
      siren_level: 'LEVEL_3_HIGH_PRIORITY_KLAXON',
      siren_sound: 'SEVERE_CONVECTIVE_SIREN_120DB',
      siren_frequency_hz: 960,
      automated_klaxon_active: true,
      emergency_broadcast_text: '🚨 RED ALERT: Severe convective storm cell detected (>50 dBZ) intersecting critical urban infrastructure polygons. Automated sirens active.',
      dispatch_flags: [
        'AIRPORT_GROUND_STOP',
        'RUNWAY_MICROBURST_SHEAR_ALERT',
        'AIIMS_BACKUP_POWER_ENGAGED',
        'GRID_SURGE_ARREST_ACTIVE',
        'METRO_SPEED_RESTRICTION_30KMH'
      ],
      critical_threat_count: 2,
    },
    emergency_dispatch_flags: [
      'AIRPORT_GROUND_STOP',
      'RUNWAY_MICROBURST_SHEAR_ALERT',
      'AIIMS_BACKUP_POWER_ENGAGED',
      'GRID_SURGE_ARREST_ACTIVE',
      'METRO_SPEED_RESTRICTION_30KMH'
    ],
    nowcast_summary: {
      estimated_arrival_minutes: 12,
      peak_wind_gust_kmh: 78.5,
      expected_precipitation_mm_hr: 52.0,
      cape_j_kg: 2840.0,
      cin_j_kg: -15.0,
      severe_hazard_warnings: [
        'High-frequency Cloud-to-Ground (CG) lightning risk within 25km radius',
        'Localized convective squall and urban waterlogging alert',
        '🚨 EMERGENCY SIREN TRIGGERED: LEVEL_3_HIGH_PRIORITY_KLAXON'
      ],
    },
  };
}

// Fallback data when backend server is starting or standalone demo
function getFallbackNowcastData(lat, lon) {
  return {
    timestamp: new Date().toISOString(),
    query_location: { latitude: lat, longitude: lon },
    radius_km: 100,
    summary: {
      precipitation_rate_mm_hr: 38.4,
      reflectivity_dbz: 52.8,
      lightning_strike_probability: 0.85,
      risk_level: 'SEVERE',
      storm_arrival_time_min: 12,
      wind_gust_kmh: 74.2,
      cape_j_kg: 2840,
      cin_j_kg: -15,
    },
    active_cells: [
      {
        cell_id: 'CELL-01',
        latitude: lat + 0.12,
        longitude: lon - 0.08,
        max_reflectivity_dbz: 56.4,
        cloud_top_height_km: 15.2,
        vil_kg_m2: 28.5,
        speed_kmh: 42.0,
        direction_deg: 70.0,
        severity_level: 'SEVERE',
        projected_track: [
          { lead_time_min: 15, latitude: lat + 0.15, longitude: lon - 0.02, predicted_dbz: 55.0, rain_rate_mm_hr: 36.0 },
          { lead_time_min: 30, latitude: lat + 0.18, longitude: lon + 0.04, predicted_dbz: 52.0, rain_rate_mm_hr: 28.0 },
          { lead_time_min: 45, latitude: lat + 0.21, longitude: lon + 0.10, predicted_dbz: 48.0, rain_rate_mm_hr: 20.0 },
          { lead_time_min: 60, latitude: lat + 0.24, longitude: lon + 0.16, predicted_dbz: 44.0, rain_rate_mm_hr: 14.0 },
        ],
      },
    ],
    recent_lightning_strikes: [
      { id: 'LTG-1', latitude: lat + 0.10, longitude: lon - 0.07, timestamp: new Date().toISOString(), amplitude_ka: -52.4, strike_type: 'CG', confidence: 0.98 },
      { id: 'LTG-2', latitude: lat + 0.13, longitude: lon - 0.09, timestamp: new Date().toISOString(), amplitude_ka: 34.1, strike_type: 'IC', confidence: 0.94 },
      { id: 'LTG-3', latitude: lat + 0.08, longitude: lon - 0.05, timestamp: new Date().toISOString(), amplitude_ka: -76.8, strike_type: 'CG', confidence: 0.99 },
    ],
    forecast_timeline: [
      { time_offset_min: 0, reflectivity_dbz: 22, rain_rate_mm_hr: 1.2, lightning_probability: 0.12, wind_gust_kmh: 24 },
      { time_offset_min: 15, reflectivity_dbz: 35, rain_rate_mm_hr: 6.4, lightning_probability: 0.45, wind_gust_kmh: 38 },
      { time_offset_min: 30, reflectivity_dbz: 54, rain_rate_mm_hr: 42.0, lightning_probability: 0.85, wind_gust_kmh: 76 },
      { time_offset_min: 45, reflectivity_dbz: 48, rain_rate_mm_hr: 24.5, lightning_probability: 0.78, wind_gust_kmh: 62 },
      { time_offset_min: 60, reflectivity_dbz: 36, rain_rate_mm_hr: 8.0, lightning_probability: 0.35, wind_gust_kmh: 40 },
    ],
  };
}

export default apiClient;
