import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  MapPinned,
  Route,
  CarFront,
  UserRound,
  X,
  Map,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./Outstation.css";
import OutstationMap from "./OutstationMap";
function Outstation() {
  const { session } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedTrip, setSelectedTrip] = useState(null);
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/outstation/admin",
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch outstation trips"
          );
        }

        setTrips(data.trips || []);
      } catch (error) {
        console.error(
          "Admin outstation trips error:",
          error
        );

        setError(
          error.message ||
            "Failed to fetch outstation trips"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.access_token) {
      fetchTrips();
    }
  }, [session]);

  return (
    <div className="outstation-page">

      <div className="outstation-header">
        <div className="outstation-heading">
          <div className="outstation-heading-icon">
            <MapPinned size={24} />
          </div>

          <div>
            <h1>Outstation Trips</h1>
            <p>
              View and monitor completed and active
              outstation trips.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="outstation-error">
          {error}
        </div>
      )}

      <div className="outstation-table-card">

        {loading ? (
          <div className="outstation-loading">
            Loading outstation trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="outstation-empty">
            <Route size={40} />

            <h3>No outstation trips found</h3>

            <p>
              Outstation trips will appear here once
              drivers complete them.
            </p>
          </div>
        ) : (
          <div className="outstation-table-wrapper">

            <table className="outstation-table">

              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Destination</th>
                  <th>Starting KM</th>
                  <th>Ending KM</th>
                  <th>KM Covered</th>
                  <th>Status</th>
                   <th>Location</th>
                </tr>
              </thead>

              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>

                    <td>
                      <div className="outstation-driver">
                        <UserRound size={16} />

                        <span>
                          {trip.drivers?.name ||
                            "Unknown driver"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="outstation-vehicle">
                        <CarFront size={16} />

                        <span>
                          {trip.vehicles
                            ?.registration_number ||
                            "Unknown vehicle"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="outstation-destination">
                        <strong>
                          {trip.destination}
                        </strong>

                        {trip.destination_address && (
                          <span>
                            {trip.destination_address}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {trip.starting_mileage ?? "-"}
                    </td>

                    <td>
                      {trip.ending_mileage ?? "-"}
                    </td>

                    <td>
                      <strong>
                        {trip.km_covered ?? "-"} km
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`outstation-status ${trip.status}`}
                      >
                        {trip.status
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                      </span>
                    </td>
                    <td>
  <button
    type="button"
    className="outstation-location-btn"
    onClick={() => setSelectedTrip(trip)}
  >
    <Map size={16} />
    View Location
  </button>
</td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>
      {selectedTrip && (
        <div className="outstation-modal-overlay">
          <div className="outstation-modal">
            <div className="outstation-modal-header">
              <div>
                <h2>Trip Location</h2>
                <p>{selectedTrip.destination}</p>
              </div>

              <button
                type="button"
                className="outstation-modal-close"
                onClick={() => setSelectedTrip(null)}
                aria-label="Close location"
              >
                <X size={20} />
              </button>
            </div>

            <div className="outstation-modal-map">
              <OutstationMap trip={selectedTrip} />
            </div>

            <div className="outstation-location-info">
              <div>
                <strong>Destination</strong>
                <span>
                  {selectedTrip.destination_address ||
                    "Address not available"}
                </span>
              </div>

              <div>
                <strong>Driver Arrival GPS</strong>
                <span>
                  {selectedTrip.arrival_latitude != null &&
                  selectedTrip.arrival_longitude != null
                    ? `${selectedTrip.arrival_latitude}, ${selectedTrip.arrival_longitude}`
                    : "Not shared yet"}
                </span>
              </div>

              <div>
                <strong>GPS Accuracy</strong>
                <span>
                  {selectedTrip.arrival_accuracy != null
                    ? `${Math.round(
                        selectedTrip.arrival_accuracy
                      )} m`
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Outstation;