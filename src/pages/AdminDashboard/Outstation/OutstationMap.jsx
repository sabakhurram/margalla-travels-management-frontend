import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix Leaflet's default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapBounds({ destination, arrival }) {
  const map = useMap();

  useEffect(() => {
    const points = [destination];

    if (arrival) {
      points.push(arrival);
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [map, destination, arrival]);

  return null;
}
function ArrivalStatus({ arrival }) {
  const map = useMap();

  useEffect(() => {
    if (arrival) return;

    const control = L.control({
      position: "topright",
    });

    control.onAdd = () => {
      const div = L.DomUtil.create(
        "div",
        "outstation-map-status"
      );

      div.innerHTML =
        "Arrival location has not been shared yet.";

      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, arrival]);

  return null;
}

function OutstationMap({ trip }) {
  const destination = [
    Number(trip.destination_latitude),
    Number(trip.destination_longitude),
  ];

  const arrival =
    trip.arrival_latitude != null &&
    trip.arrival_longitude != null
      ? [
          Number(trip.arrival_latitude),
          Number(trip.arrival_longitude),
        ]
      : null;

  return (
    <div className="outstation-map">
      <MapContainer
        center={destination}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "450px",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds
          destination={destination}
          arrival={arrival}
        />
<ArrivalStatus arrival={arrival} />
        <Marker position={destination}>
         <Popup>
  <strong>Planned Destination</strong>
  <br />
  {trip.destination}
</Popup>
        </Marker>

     {arrival ? (
  <>
    <Marker position={arrival}>
   <Popup>
  <strong>Driver Arrival Location</strong>
  <br />
  Location shared by the driver.
  <br />
  GPS Accuracy:{" "}
  {trip.arrival_accuracy
    ? `${Math.round(
        trip.arrival_accuracy
      )} m`
    : "Not available"}
</Popup>
    </Marker>

    <Polyline
      positions={[destination, arrival]}
    />
  </>
) : (
  <div className="outstation-map-status">
    Arrival location has not been shared yet.
  </div>
)}
      </MapContainer>
    </div>
  );
}

export default OutstationMap;