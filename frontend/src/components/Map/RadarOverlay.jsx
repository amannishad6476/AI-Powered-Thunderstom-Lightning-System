import React from 'react';
import { Circle } from 'react-leaflet';
import { getDbzColor } from '../../utils/colorScales';

/**
 * Renders radar reflectivity simulated contours & echo cells on the Leaflet canvas.
 * Supports continuous timeline drift across past Doppler sweeps (-60m to 0m)
 * and future ConvLSTM nowcasting predictions (+15m to +120m).
 */
export const RadarOverlay = ({ timeOffset = 0, opacity = 0.75, visible = true }) => {
  if (!visible) return null;

  // Spatial drift parameters matching storm speed (~40 km/h heading ENE ~67.5°)
  // 1 deg lat ≈ 111 km, 1 deg lon ≈ 97 km at 28.5°N
  const hours = timeOffset / 60.0;
  const driftLat = hours * (40.0 * Math.cos((67.5 * Math.PI) / 180)) / 111.0;
  const driftLon = hours * (40.0 * Math.sin((67.5 * Math.PI) / 180)) / 97.0;

  // Modulate intensity slightly over nowcast horizon (decay or growth)
  const isNowcast = timeOffset > 0;
  const dbzMod = isNowcast ? -Math.min(6, (timeOffset / 120) * 8) : 0;

  const convectiveEchoes = [
    // Primary Severe Supercell Core (Delhi North / Rohini corridor)
    {
      id: 'echo-core-primary-outer',
      center: [28.7041 + driftLat, 77.1025 + driftLon],
      radius: 19500,
      dbz: Math.max(30, 48 + dbzMod),
    },
    {
      id: 'echo-core-primary-mid',
      center: [28.7041 + driftLat, 77.1025 + driftLon],
      radius: 12000,
      dbz: Math.max(35, 55 + dbzMod),
    },
    {
      id: 'echo-core-primary-hook',
      center: [28.7041 + driftLat, 77.1025 + driftLon],
      radius: 5500,
      dbz: Math.max(40, 64 + dbzMod),
    },

    // Secondary Cell (Noida / East NCR)
    {
      id: 'echo-east-outer',
      center: [28.5355 + driftLat * 1.05, 77.3910 + driftLon * 1.05],
      radius: 16000,
      dbz: Math.max(28, 44 + dbzMod),
    },
    {
      id: 'echo-east-core',
      center: [28.5355 + driftLat * 1.05, 77.3910 + driftLon * 1.05],
      radius: 8000,
      dbz: Math.max(34, 53 + dbzMod),
    },

    // Southwest Feeder Cluster (Gurugram / Manesar)
    {
      id: 'echo-sw-feeder',
      center: [28.4595 + driftLat * 0.9, 77.0266 + driftLon * 0.9],
      radius: 24000,
      dbz: Math.max(25, 42 + dbzMod),
    },
    {
      id: 'echo-sw-core',
      center: [28.4595 + driftLat * 0.9, 77.0266 + driftLon * 0.9],
      radius: 11000,
      dbz: Math.max(32, 49 + dbzMod),
    },

    // North Outer Front (Sonipat Border)
    {
      id: 'echo-north-front',
      center: [28.8920 + driftLat * 0.8, 76.9850 + driftLon * 0.8],
      radius: 28000,
      dbz: Math.max(20, 38 + dbzMod),
    },
  ];

  return (
    <>
      {convectiveEchoes.map((echo) => {
        const color = getDbzColor(echo.dbz);
        return (
          <Circle
            key={`${echo.id}-${timeOffset}`}
            center={echo.center}
            radius={echo.radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: opacity * 0.65,
              weight: 1.2,
              opacity: opacity * 0.9,
            }}
          />
        );
      })}
    </>
  );
};

export default RadarOverlay;
