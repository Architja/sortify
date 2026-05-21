import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import type {  SmartBin  } from '../../types';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createCustomIcon = (status: string) => {
  let color = '#22c55e'; // green
  if (status === 'medium') color = '#eab308'; // yellow
  if (status === 'full') color = '#ef4444'; // red

  const markerHtmlStyles = `
    background-color: ${color};
    width: 24px;
    height: 24px;
    display: block;
    left: -12px;
    top: -12px;
    position: relative;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  `;

  return L.divIcon({
    className: "custom-pin",
    iconAnchor: [0, 24],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`
  });
};

const MapBounds = ({ bins }: { bins: SmartBin[] }) => {
  const map = useMap();

  useEffect(() => {
    if (bins.length > 0) {
      const bounds = L.latLngBounds(bins.map(b => [b.coordinates.lat, b.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bins, map]);

  return null;
};

const UserLocationMarker = ({ location }: { location: [number, number] | null }) => {
  if (!location) return null;
  
  const userIcon = L.divIcon({
    className: "user-pin",
    iconAnchor: [0, 8],
    popupAnchor: [0, -12],
    html: `<span style="background-color: #3b82f6; width: 16px; height: 16px; display: block; left: -8px; top: -8px; position: relative; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`
  });

  return (
    <Marker position={location} icon={userIcon}>
      <Popup className="rounded-xl font-medium">You are here</Popup>
    </Marker>
  );
};

interface BinMapProps {
  bins: SmartBin[];
  onBinClick?: (bin: SmartBin) => void;
}

export const BinMap = ({ bins, onBinClick }: BinMapProps) => {
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi as default
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [hasFlownToUser, setHasFlownToUser] = useState(false);

  // Automatically fly to user when location is first found
  useEffect(() => {
    if (userLocation && mapInstance && !hasFlownToUser) {
      mapInstance.flyTo(userLocation, 14, { duration: 2 });
      setHasFlownToUser(true);
    }
  }, [userLocation, mapInstance, hasFlownToUser]);

  const locateUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.flyTo(userLocation, 15, { duration: 1.5 });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          if (mapInstance) {
            mapInstance.flyTo(loc, 15, { duration: 1.5 });
          }
        },
        (error) => {
          console.error("Error getting location", error);
          if (error.code === 1) {
            toast.error("Location access denied. Please enable permissions in your browser.");
          } else {
            toast.error("Unable to fetch your location.");
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    // Continuously watch the user's live location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => console.error("Error watching location", error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      
      // Cleanup the watcher when the map is closed
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="h-full w-full"
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <UserLocationMarker location={userLocation} />
        
        {bins.map((bin) => (
          <Marker 
            key={bin.id} 
            position={[bin.coordinates.lat, bin.coordinates.lng]}
            icon={createCustomIcon(bin.status)}
            eventHandlers={{
              click: () => onBinClick && onBinClick(bin),
            }}
          >
            <Popup className="rounded-xl">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-base">{bin.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{bin.location}</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fill Level</span>
                  <span className="font-bold">{bin.fillPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      bin.status === 'empty' ? 'bg-green-500' : 
                      bin.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${bin.fillPercentage}%` }}
                  />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(onBinClick) onBinClick(bin);
                  }}
                  className="w-full bg-green-50 text-green-600 font-medium py-2 rounded-lg text-sm hover:bg-green-100 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapBounds bins={bins} />
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 z-[400]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Status</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-sm ring-2 ring-white dark:ring-gray-800"></span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Empty (0-39%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-sm ring-2 ring-white dark:ring-gray-800"></span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Medium (40-79%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm ring-2 ring-white dark:ring-gray-800"></span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Full (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Locate Me Button */}
      <button 
        onClick={locateUser}
        className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 z-[400] text-blue-500 hover:text-blue-600 hover:bg-gray-50 transition-colors group"
        title="Find My Location"
      >
        <Navigation size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
