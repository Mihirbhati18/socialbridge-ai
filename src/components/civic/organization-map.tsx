'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Star, MapPin, Building2, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface OrgMapProps {
  organizations: any[];
  center?: [number, number];
  zoom?: number;
  onDraftOutreach?: (org: any) => void;
}

// Helper component to update map view dynamically without remounting MapContainer
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function OrganizationMap({ organizations, center = [19.076, 72.8777], zoom = 12, onDraftOutreach }: OrgMapProps) {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {organizations.map(org => {
          if (!org.lat || !org.lng) return null;
          return (
            <Marker key={org.id} position={[org.lat, org.lng]}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[240px]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-gray-900 text-sm">{org.name}</div>
                    <div className="flex items-center text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold">
                      <Star className="w-3 h-3 mr-1 fill-amber-500" />
                      {org.rating}
                    </div>
                  </div>
                  
                  <div className="text-xs text-indigo-600 font-semibold mb-2 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    {org.type}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2 flex items-start">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{org.address}</span>
                  </div>
                  
                  {org.matchReason && (
                    <div className="text-[10px] text-indigo-700 italic mb-3 bg-indigo-50 p-1.5 rounded border border-indigo-100">
                      {org.matchReason}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Events</div>
                      <div className="font-bold text-gray-800 flex items-center justify-center">
                        <CalendarCheck className="w-3 h-3 mr-1 text-blue-500" />
                        {org.totalEvents}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Success</div>
                      <div className="font-bold text-gray-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                        {org.successfulEvents}
                      </div>
                    </div>
                  </div>

                  {onDraftOutreach && (
                    <Button 
                      onClick={() => {
                        setTimeout(() => {
                          onDraftOutreach(org);
                        }, 0);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                    >
                      ✨ Draft AI Outreach
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
