import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { RadarOverlay } from './RadarOverlay';
import { LightningLayer } from './LightningLayer';
import { StormCellTracker } from './StormCellTracker';
import { StationMarkers } from './StationMarkers';
import { Legend } from '../Common/Legend';

export const WeatherMap = ({
  center = [28.6139, 77.2090], // Default center: Delhi NCR
  zoom = 9,
  timeOffset = 0,
  layerVisibility = {
    radar: true,
    lightning: true,
    stormCells: true,
    stations: true,
    warnings: true,
  },
  nowcastData = null,
  strikes = [],
  riskGrid = [],
  alerts = [],
  stations = [],
  theme = 'light',
}) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className={`w-full h-full z-0 ${theme === 'dark' ? 'leaflet-dark-tiles' : ''}`}
        zoomControl={false}
      >
        {/* OpenStreetMap Standard Basemap (Free, No API Key, No Watermark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Doppler Weather Radar Layer */}
        <RadarOverlay
          timeOffset={timeOffset}
          visible={layerVisibility.radar}
          opacity={0.7}
        />

        {/* Lightning Strike Detection & Risk Heatmap */}
        <LightningLayer
          strikes={strikes}
          riskGrid={riskGrid}
          visible={layerVisibility.lightning}
          showHeatmap={true}
        />

        {/* AI Tracked Convective Storm Cells */}
        <StormCellTracker
          stormCells={nowcastData?.active_cells || []}
          visible={layerVisibility.stormCells}
        />

        {/* Surface Weather Stations */}
        <StationMarkers
          stations={stations}
          visible={layerVisibility.stations}
        />

        {/* Severe Weather Warning Geofence Polygons */}
        {layerVisibility.warnings &&
          alerts.map((alert) => {
            if (!alert.polygon_geojson || !alert.polygon_geojson.coordinates) return null;
            // Coordinates in GeoJSON are [lon, lat], Leaflet expects [lat, lon]
            const latLngs = alert.polygon_geojson.coordinates[0].map(([lon, lat]) => [lat, lon]);

            return (
              <Polygon
                key={alert.alert_id}
                positions={latLngs}
                pathOptions={{
                  color: alert.severity === 'EXTREME' ? '#ef4444' : '#f97316',
                  fillColor: alert.severity === 'EXTREME' ? '#ef4444' : '#f97316',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-red-600 dark:text-red-400">{alert.headline}</span>
                    <p className="text-slate-600 dark:text-slate-300">{alert.description}</p>
                    <p className="text-amber-700 dark:text-amber-300"><strong>Action:</strong> {alert.instruction}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}
      </MapContainer>

      {/* Interactive Map Legend */}
      <Legend />
    </div>
  );
};

export default WeatherMap;
