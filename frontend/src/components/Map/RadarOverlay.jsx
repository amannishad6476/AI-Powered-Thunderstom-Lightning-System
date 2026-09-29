import React from 'react';
import { Circle, SVGOverlay } from 'react-leaflet';
import { getDbzColor } from '../../utils/colorScales';

/**
 * Renders radar reflectivity simulated contours & echo cells on the Leaflet canvas
 */
export const RadarOverlay = ({ timeOffset = 0, opacity = 0.7, visible = true }) => {
  if (!visible) return null;

  // Dynamic coordinates simulating storm core advection over timeOffset
  const driftLat = (timeOffset / 60) * 0.25;
  const driftLon = (timeOffset / 60) * 0.35;

  const convectiveEchoes = [
    {
      id: 'echo-core-1',
      center: [28.70 + driftLat, 77.10 + driftLon],
      radius: 14000,
      dbz: 56,
    },
    {
      id: 'echo-core-2',
      center: [28.70 + driftLat, 77.10 + driftLon],
      radius: 8000,
      dbz: 62,
    },
    {
      id: 'echo-core-3',
      center: [28.70 + driftLat, 77.10 + driftLon],
      radius: 3500,
      dbz: 68,
    },
    {
      id: 'echo-stratiform-1',
      center: [28.55 + driftLat, 77.25 + driftLon],
      radius: 22000,
      dbz: 42,
    },
    {
      id: 'echo-stratiform-2',
      center: [28.55 + driftLat, 77.25 + driftLon],
      radius: 12000,
      dbz: 48,
    },
    {
      id: 'echo-feeder-1',
      center: [28.40 + driftLat, 76.90 + driftLon],
      radius: 16000,
      dbz: 38,
    },
    {
      id: 'echo-feeder-2',
      center: [28.40 + driftLat, 76.90 + driftLon],
      radius: 7000,
      dbz: 52,
    },
  ];

  return (
    <>
      {convectiveEchoes.map((echo) => (
        <Circle
          key={`${echo.id}-${timeOffset}`}
          center={echo.center}
          radius={echo.radius}
          pathOptions={{
            color: getDbzColor(echo.dbz),
            fillColor: getDbzColor(echo.dbz),
            fillOpacity: opacity * 0.75,
            weight: 1.5,
            opacity: opacity,
          }}
        />
      ))}
    </>
  );
};
