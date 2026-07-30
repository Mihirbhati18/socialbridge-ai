'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface IssueMapProps {
  issues: any[];
  center?: [number, number];
  zoom?: number;
}

export default function IssueMap({ issues, center = [19.076, 72.8777], zoom = 12 }: IssueMapProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-red-500';
      case 'ASSIGNED': return 'text-amber-500';
      case 'IN_PROGRESS': return 'text-blue-500';
      case 'RESOLVED': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map(issue => {
          if (!issue.lat || !issue.lng) return null;
          return (
            <Marker key={issue.id} position={[issue.lat, issue.lng]}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="font-bold text-gray-900 mb-1">{issue.title}</div>
                  <div className="text-xs mb-2">
                    <span className="font-semibold text-gray-600 mr-2">{issue.category}</span>
                    <span className={`font-bold ${getStatusColor(issue.status)}`}>{issue.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2 truncate max-w-[200px]">
                    {issue.address}
                  </div>
                  <button 
                    onClick={() => {
                      setTimeout(() => {
                        router.push(`/civic-issues/${issue.id}`);
                      }, 0);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1.5 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
