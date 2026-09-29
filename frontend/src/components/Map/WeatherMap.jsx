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
}) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Dark Matter Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                  <div className="p-1 space-y-1 text-xs">
                    <span className="font-bold text-red-400">{alert.headline}</span>
                    <p className="text-slate-300">{alert.description}</p>
                    <p className="text-amber-300"><strong>Action:</strong> {alert.instruction}</p>
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
