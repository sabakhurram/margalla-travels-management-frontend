
import { useEffect, useState } from "react";
import {
  CarFront,
  Gauge,
  Route,
  CalendarDays,
  LogOut,
  UserRound,
  CircleCheck,
  AlertCircle,
  ClipboardList,
  MapPin,
  Navigation,
  Play,
  Flag,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./DriverDashboard.css";

/*
====================================================
API BASE URL
====================================================
*/

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

function DriverDashboard() {
  const { session, logout } = useAuth();

  /*
  ====================================================
  DASHBOARD STATE
  ====================================================
  */

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  ====================================================
  ERROR / SUCCESS STATE
  ====================================================
  */

  const [mileageError, setMileageError] =
    useState("");

  const [mileageSuccess, setMileageSuccess] =
    useState(null);

  const [outstationMessage, setOutstationMessage] =
    useState("");

  const [outstationTripSuccess, setOutstationTripSuccess] =
    useState(null);

  /*
  ====================================================
  HISTORY
  ====================================================
  */

  const [mileageHistory, setMileageHistory] =
    useState([]);

  const [outstationHistory, setOutstationHistory] =
    useState([]);

  /*
  ====================================================
  LOADING STATES
  ====================================================
  */

  const [submittingMileage, setSubmittingMileage] =
    useState(false);

  const [tripCompleting, setTripCompleting] =
    useState(false);

  const [locationVerifying, setLocationVerifying] =
    useState(false);

  /*
  ====================================================
  OUTSTATION DESTINATION SEARCH
  ====================================================
  */

  const [destinationSearch, setDestinationSearch] =
    useState("");

  const [destinationResults, setDestinationResults] =
    useState([]);

  const [selectedDestination, setSelectedDestination] =
    useState(null);

  const [destinationLoading, setDestinationLoading] =
    useState(false);

  /*
  ====================================================
  ACTIVE OUTSTATION TRIP
  ====================================================
  */

  const [activeOutstationTrip, setActiveOutstationTrip] =
    useState(null);

  const [locationShared, setLocationShared] =
    useState(false);

  /*
  ====================================================
  PAKISTAN DATE
  ====================================================
  */

  const getPakistanDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

  const todayPakistan = getPakistanDate();

  /*
  ====================================================
  FORM STATE
  ====================================================
  */

  const [entryDate, setEntryDate] =
    useState(getPakistanDate());

  const [startingMileage, setStartingMileage] =
    useState("");

  const [endingMileage, setEndingMileage] =
    useState("");

  const [tripType, setTripType] =
    useState("local");

  /*
  ====================================================
  TODAY'S LOCAL MILEAGE STATUS
  ====================================================
  */

  const todaySubmitted = mileageHistory.some(
    (entry) => entry.entry_date === todayPakistan
  );

  /*
  ====================================================
  RESET OUTSTATION FORM
  ====================================================
  */

  const resetOutstationForm = () => {
    setTripType("local");

    setDestinationSearch("");
    setDestinationResults([]);
    setSelectedDestination(null);

    setEndingMileage("");

    setOutstationMessage("");

    setMileageError("");

    setLocationShared(false);

    setActiveOutstationTrip(null);

    setOutstationTripSuccess(null);

    setStartingMileage(
      dashboardData?.startingOdometer !== null &&
        dashboardData?.startingOdometer !== undefined
        ? String(dashboardData.startingOdometer)
        : ""
    );
  };

  /*
  ====================================================
  FETCH ACTIVE OUTSTATION TRIP
  ====================================================
  */

  const loadActiveOutstationTrip = async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/outstation/active`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const trip = data.trip;

      setActiveOutstationTrip(trip);

      setLocationShared(
        trip?.status === "location_shared"
      );

      if (trip) {
        setTripType("outstation");

        setDestinationSearch(
          trip.destination || ""
        );

        setSelectedDestination({
          placeId:
            trip.destination_place_id,

          name:
            trip.destination,

          address:
            trip.destination_address,

          latitude:
            trip.destination_latitude,

          longitude:
            trip.destination_longitude,
        });

        setStartingMileage(
          String(trip.starting_mileage)
        );
      }
    } catch (error) {
      console.error(
        "Load active outstation trip error:",
        error
      );
    }
  };

  /*
  ====================================================
  FETCH DASHBOARD + HISTORY
  ====================================================
  */

  const fetchDashboard = async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/mileage/my-dashboard`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch dashboard data"
        );
      }

      setDashboardData(data);

      /*
      --------------------------------------------
      Local mileage history
      --------------------------------------------
      */

      const historyResponse = await fetch(
        `${API_BASE}/mileage/my-history`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const historyData =
        await historyResponse.json();

      if (historyResponse.ok) {
        setMileageHistory(
          historyData.mileage || []
        );
      }

      /*
      --------------------------------------------
      Outstation history
      --------------------------------------------
      */

      try {
        const outstationHistoryResponse =
          await fetch(
            `${API_BASE}/outstation/my-history`,
            {
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        const outstationHistoryData =
          await outstationHistoryResponse.json();

        if (outstationHistoryResponse.ok) {
          setOutstationHistory(
            outstationHistoryData.trips || []
          );
        } else {
          console.error(
            "Outstation history fetch failed:",
            outstationHistoryData.message
          );
        }
      } catch (outstationError) {
        console.error(
          "Fetch outstation history error:",
          outstationError
        );
      }

      /*
      --------------------------------------------
      Starting odometer
      --------------------------------------------
      */

      if (!activeOutstationTrip) {
        setStartingMileage(
          data.startingOdometer !== null &&
            data.startingOdometer !== undefined
            ? String(data.startingOdometer)
            : ""
        );
      }
    } catch (error) {
      console.error(
        "Fetch driver dashboard error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  INITIAL LOAD
  ====================================================
  */

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    fetchDashboard();
    loadActiveOutstationTrip();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  /*
  ====================================================
  DESTINATION SEARCH
  ====================================================
  */

  const searchDestinations = async (value) => {
    setDestinationSearch(value);

    if (
      selectedDestination &&
      value !== selectedDestination.name
    ) {
      setSelectedDestination(null);
    }

    if (value.trim().length < 3) {
      setDestinationResults([]);
      return;
    }

    const apiKey =
      import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      console.error(
        "Geoapify API key is missing."
      );

      return;
    }

    try {
      setDestinationLoading(true);

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&filter=countrycode:pk&limit=5&apiKey=${apiKey}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to search destinations"
        );
      }

      const results =
        (data.features || []).map(
          (feature) => {
            const properties =
              feature.properties;

            return {
              placeId:
                properties.place_id,

              name:
                properties.name ||
                properties.formatted,

              address:
                properties.formatted,

              latitude:
                properties.lat,

              longitude:
                properties.lon,
            };
          }
        );

      setDestinationResults(results);
    } catch (error) {
      console.error(
        "Destination search error:",
        error
      );

      setDestinationResults([]);
    } finally {
      setDestinationLoading(false);
    }
  };

  /*
  ====================================================
  CALCULATE KM
  ====================================================
  */

  const calculateKm = () => {
    if (
      startingMileage === "" ||
      endingMileage === ""
    ) {
      return 0;
    }

    const start =
      Number(startingMileage);

    const end =
      Number(endingMileage);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start
    ) {
      return 0;
    }

    return end - start;
  };

  const kmCovered = calculateKm();

  /*
  ====================================================
  START OUTSTATION TRIP
  ====================================================
  */

  const startOutstationTrip = async () => {
    if (!selectedDestination) {
      setMileageError(
        "Please select a destination first."
      );

      return;
    }

    if (
      startingMileage === "" ||
      !Number.isInteger(
        Number(startingMileage)
      ) ||
      Number(startingMileage) < 0
    ) {
      setMileageError(
        "Please enter a valid starting mileage."
      );

      return;
    }

    if (!session?.access_token) {
      setMileageError(
        "You are not authenticated."
      );

      return;
    }

    try {
      setSubmittingMileage(true);

      setMileageError("");
      setMileageSuccess(null);
      setOutstationMessage("");
      setOutstationTripSuccess(null);

      const response = await fetch(
        `${API_BASE}/outstation/start`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            destination:
              selectedDestination.name,

            destination_address:
              selectedDestination.address,

            destination_place_id:
              selectedDestination.placeId,

            destination_latitude:
              selectedDestination.latitude,

            destination_longitude:
              selectedDestination.longitude,

            starting_mileage:
              Number(startingMileage),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to start outstation trip."
        );
      }

      setActiveOutstationTrip(
        data.trip
      );

      setLocationShared(false);

      setOutstationMessage(
        "Outstation trip started successfully."
      );
    } catch (error) {
      console.error(
        "Start outstation trip error:",
        error
      );

      setMileageError(
        error.message ||
          "Failed to start outstation trip."
      );
    } finally {
      setSubmittingMileage(false);
    }
  };

  /*
  ====================================================
  SHARE CURRENT LOCATION
  ====================================================
  */

  const shareArrivalLocation = () => {
    if (!activeOutstationTrip) {
      setMileageError(
        "No active outstation trip found."
      );

      return;
    }

    if (!navigator.geolocation) {
      setMileageError(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setLocationVerifying(true);

    setMileageError("");
    setMileageSuccess(null);
    setOutstationMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          const response = await fetch(
            `${API_BASE}/outstation/${activeOutstationTrip.id}/arrival-location`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body: JSON.stringify({
                latitude,
                longitude,
                accuracy,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to share arrival location."
            );
          }

          setActiveOutstationTrip(
            data.trip
          );

          setLocationShared(true);

          const distanceText =
            data.distance !== undefined &&
            data.distance !== null
              ? ` You are approximately ${Number(
                  data.distance
                ).toLocaleString()} meters from the selected destination.`
              : "";

          setOutstationMessage(
            `Location shared successfully.${distanceText}`
          );
        } catch (error) {
          console.error(
            "Arrival location error:",
            error
          );

          setMileageError(
            error.message ||
              "Failed to share arrival location."
          );
        } finally {
          setLocationVerifying(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        let message =
          "Unable to get your current location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access.";
        } else if (error.code === 2) {
          message =
            "Your current location could not be determined.";
        } else if (error.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setMileageError(message);

        setLocationVerifying(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /*
  ====================================================
  COMPLETE OUTSTATION TRIP
  ====================================================
  */

  const completeOutstationTrip = async () => {
    if (!activeOutstationTrip) {
      setMileageError(
        "No active outstation trip found."
      );

      return;
    }

    if (!locationShared) {
      setMileageError(
        "Please share your arrival location first."
      );

      return;
    }

    if (
      endingMileage === "" ||
      !Number.isInteger(
        Number(endingMileage)
      ) ||
      Number(endingMileage) < 0
    ) {
      setMileageError(
        "Please enter a valid ending mileage."
      );

      return;
    }

    if (
      Number(endingMileage) <
      Number(
        activeOutstationTrip.starting_mileage
      )
    ) {
      setMileageError(
        "Ending odometer cannot be less than starting odometer."
      );

      return;
    }

    try {
      setTripCompleting(true);

      setMileageError("");
      setMileageSuccess(null);
      setOutstationMessage("");

      const response = await fetch(
        `${API_BASE}/outstation/${activeOutstationTrip.id}/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            ending_mileage:
              Number(endingMileage),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to complete outstation trip."
        );
      }

      setOutstationTripSuccess({
        destination:
          activeOutstationTrip.destination,

        startingMileage:
          activeOutstationTrip.starting_mileage,

        endingMileage:
          Number(endingMileage),

        kmCovered:
          data.trip.km_covered,
      });

      setOutstationMessage("");

      setActiveOutstationTrip(null);

      setLocationShared(false);

      setEndingMileage("");

      await fetchDashboard();
    } catch (error) {
      console.error(
        "Complete outstation trip error:",
        error
      );

      setMileageError(
        error.message ||
          "Failed to complete outstation trip."
      );
    } finally {
      setTripCompleting(false);
    }
  };

  /*
  ====================================================
  SUBMIT LOCAL MILEAGE
  ====================================================
  */

  const handleMileageSubmit = async (e) => {
    e.preventDefault();

    setMileageError("");

    if (!vehicle) {
      setMileageError(
        "No vehicle is currently assigned to you."
      );

      return;
    }

    if (vehicle.status !== "active") {
      setMileageError(
        vehicle.status === "maintenance"
          ? "Mileage submission is unavailable because your vehicle is under maintenance."
          : "Mileage submission is unavailable because your assigned vehicle is inactive."
      );

      return;
    }

    if (startingMileage === "") {
      setMileageError(
        "Starting odometer is required."
      );

      return;
    }

    if (endingMileage === "") {
      setMileageError(
        "Ending odometer is required."
      );

      return;
    }

    if (
      !Number.isInteger(
        Number(startingMileage)
      ) ||
      Number(startingMileage) < 0
    ) {
      setMileageError(
        "Please enter a valid starting mileage."
      );

      return;
    }

    if (
      !Number.isInteger(
        Number(endingMileage)
      ) ||
      Number(endingMileage) < 0
    ) {
      setMileageError(
        "Please enter a valid ending mileage."
      );

      return;
    }

    if (
      Number(endingMileage) <
      Number(startingMileage)
    ) {
      setMileageError(
        "Ending odometer cannot be less than starting odometer."
      );

      return;
    }

    try {
      setSubmittingMileage(true);

      setMileageSuccess(null);
      setOutstationMessage("");

      const response = await fetch(
        `${API_BASE}/mileage`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            entry_date:
              entryDate,

            starting_mileage:
              startingMileage,

            ending_mileage:
              endingMileage,

            trip_type:
              "local",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to submit mileage"
        );
      }

      const submittedStart =
        Number(startingMileage);

      const submittedEnd =
        Number(endingMileage);

      const submittedKm =
        submittedEnd -
        submittedStart;

      setMileageSuccess({
        entryDate:
          entryDate,

        startingMileage:
          submittedStart,

        endingMileage:
          submittedEnd,

        kmCovered:
          submittedKm,
      });

      setStartingMileage("");
      setEndingMileage("");

      setMileageError("");

      await fetchDashboard();
    } catch (error) {
      console.error(
        "Submit mileage error:",
        error
      );

      setMileageError(
        error.message ||
          "Failed to submit mileage"
      );
    } finally {
      setSubmittingMileage(false);
    }
  };

  /*
  ====================================================
  LOADING SCREEN
  ====================================================
  */

  if (loading) {
    return (
      <div className="driver-dashboard-loading">
        Loading driver dashboard...
      </div>
    );
  }

  /*
  ====================================================
  ERROR SCREEN
  ====================================================
  */

  if (error) {
    return (
      <div className="driver-dashboard-error">
        <AlertCircle size={22} />

        <span>{error}</span>

        <button
          type="button"
          onClick={fetchDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }

  /*
  ====================================================
  DATA
  ====================================================
  */

  const driver =
    dashboardData?.driver;

  const vehicle =
    dashboardData?.vehicle;

  const monthlyMileage =
    dashboardData?.monthlyMileage;

  /*
  ====================================================
  UI STATES
  ====================================================
  */

  const showLocalSuccess =
    (mileageSuccess || todaySubmitted) &&
    !activeOutstationTrip &&
    tripType === "local";

  const showOutstationSuccess =
    !!outstationTripSuccess &&
    !activeOutstationTrip;

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <div className="driver-dashboard">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="driver-dashboard-header">

        <div className="driver-welcome">

          <div className="driver-welcome-icon">
            <UserRound size={24} />
          </div>

          <div className="driver-welcome-text">

            <h1>
              Welcome back,{" "}
              {driver?.name}
            </h1>

            <p>
              Manage your vehicle mileage
              and trip records
            </p>

          </div>

        </div>

        <button
          className="driver-logout-btn"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>


      {/* ==================================================
          VEHICLE + MONTHLY SUMMARY
      ================================================== */}

      <div className="driver-summary-grid">

        <div className="driver-card">

          <div className="driver-card-header">

            <div className="driver-card-icon">
              <CarFront size={22} />
            </div>

            <div>
              <h2>
                Assigned Vehicle
              </h2>

              <p>
                Your current vehicle assignment
              </p>
            </div>

          </div>

          {vehicle ? (

            <div className="vehicle-details">

              <div className="vehicle-main">

                <strong>
                  {vehicle.registration_number}
                </strong>

                <span
                  className={`vehicle-status ${vehicle.status}`}
                >
                  <CircleCheck size={14} />
                  {vehicle.status}
                </span>

              </div>

              <p className="vehicle-model">
                {vehicle.model}
              </p>

              <p className="vehicle-category">
                Category:{" "}
                <strong>
                  {vehicle.categories?.name ||
                    "Not assigned"}
                </strong>
              </p>

            </div>

          ) : (

            <div className="no-vehicle">
              No vehicle is currently
              assigned to you.
            </div>

          )}

        </div>


        <div className="driver-card">

          <div className="driver-card-header">

            <div className="driver-card-icon">
              <Gauge size={22} />
            </div>

            <div>

              <h2>
                Monthly Mileage
              </h2>

              <p>
                Your mileage usage for this month
              </p>

            </div>

          </div>

          {monthlyMileage && (

            <div className="mileage-summary">

              <div className="mileage-number">

                <strong>
                  {monthlyMileage.used.toLocaleString()}
                </strong>

                <span>
                  {" "}
                  /{" "}
                  {monthlyMileage.limit.toLocaleString()}
                  {" "}
                  KM
                </span>

              </div>

              <div className="mileage-progress">

                <div
                  className="mileage-progress-fill"
                  style={{
                    width: `${Math.min(
                      monthlyMileage.percentage,
                      100
                    )}%`,
                  }}
                />

              </div>

              <div className="mileage-stats">

                <div>
                  <span>Used</span>

                  <strong>
                    {monthlyMileage.used.toLocaleString()}
                    {" "}
                    KM
                  </strong>
                </div>

                <div>
                  <span>Remaining</span>

                  <strong>
                    {monthlyMileage.remaining.toLocaleString()}
                    {" "}
                    KM
                  </strong>
                </div>

                <div>
                  <span>Limit</span>

                  <strong>
                    {monthlyMileage.limit.toLocaleString()}
                    {" "}
                    KM
                  </strong>
                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          OUTSTATION MESSAGE
      ================================================== */}

      {outstationMessage &&
        !showOutstationSuccess && (

        <div className="mileage-success-card">

          <div className="mileage-success-icon">
            <CircleCheck size={30} />
          </div>

          <h2>
            Outstation Trip
          </h2>

          <p>
            {outstationMessage}
          </p>

        </div>

      )}


      {/* ==================================================
          LOCAL SUCCESS / OUTSTATION SUCCESS
      ================================================== */}

      {showLocalSuccess ? (

        <div className="mileage-success-card">

          <div className="mileage-success-icon">
            <CircleCheck size={30} />
          </div>

          <h2>
            Mileage Submitted Successfully
          </h2>

          <p>
            Today's mileage has already
            been recorded.
          </p>

          {mileageSuccess &&
            mileageSuccess.startingMileage != null &&
            mileageSuccess.endingMileage != null &&
            mileageSuccess.kmCovered != null && (

            <div className="mileage-success-details">

              <div className="mileage-success-detail">
                <span>
                  Starting Odometer
                </span>

                <strong>
                  {mileageSuccess.startingMileage.toLocaleString()}
                  {" "}
                  KM
                </strong>
              </div>

              <div className="mileage-success-detail">
                <span>
                  Ending Odometer
                </span>

                <strong>
                  {mileageSuccess.endingMileage.toLocaleString()}
                  {" "}
                  KM
                </strong>
              </div>

              <div className="mileage-success-detail">
                <span>
                  KM Covered
                </span>

                <strong>
                  {mileageSuccess.kmCovered.toLocaleString()}
                  {" "}
                  KM
                </strong>
              </div>

            </div>
          )}

        </div>

      ) : showOutstationSuccess ? (

        <div className="mileage-success-card">

          <div className="mileage-success-icon">
            <CircleCheck size={30} />
          </div>

          <h2>
            Outstation Trip Completed
          </h2>

          <p>
            Your trip to{" "}
            <strong>
              {outstationTripSuccess.destination}
            </strong>{" "}
            has been recorded successfully.
          </p>

          <div className="mileage-success-details">

            <div className="mileage-success-detail">
              <span>
                Starting Odometer
              </span>

              <strong>
                {Number(
                  outstationTripSuccess.startingMileage
                ).toLocaleString()}
                {" "}
                KM
              </strong>
            </div>

            <div className="mileage-success-detail">
              <span>
                Ending Odometer
              </span>

              <strong>
                {Number(
                  outstationTripSuccess.endingMileage
                ).toLocaleString()}
                {" "}
                KM
              </strong>
            </div>

            <div className="mileage-success-detail">
              <span>
                KM Covered
              </span>

              <strong>
                {Number(
                  outstationTripSuccess.kmCovered
                ).toLocaleString()}
                {" "}
                KM
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="mileage-submit-btn"
            style={{
              marginTop: "1rem",
            }}
            onClick={() => {
              resetOutstationForm();
            }}
          >
            <Route size={18} />
            Record Another Trip
          </button>

        </div>

      ) : (

        /* ==================================================
           RECORD MILEAGE / OUTSTATION
        ================================================== */

        <div className="driver-mileage-card">

          <div className="driver-section-heading">

            <div className="driver-section-icon">
              <Route size={24} />
            </div>

            <div>

              <h2>
                Record Mileage
              </h2>

              <p>
                Enter the mileage details
                for your trip
              </p>

            </div>

          </div>


          <div className="mileage-form">

            {/* VEHICLE STATUS */}

            {vehicle &&
              vehicle.status !== "active" && (

              <div className="mileage-form-error">

                <AlertCircle size={18} />

                <div>

                  <strong>
                    Mileage submission unavailable
                  </strong>

                  <p>
                    {vehicle.status === "maintenance"
                      ? "Your assigned vehicle is currently under maintenance. You cannot submit mileage until it becomes active."
                      : "Your assigned vehicle is currently inactive. You cannot submit mileage until it becomes active."}
                  </p>

                </div>

              </div>

            )}


            {/* ERROR */}

            {mileageError && (

              <div className="mileage-form-error">

                <AlertCircle size={18} />

                <div>

                  <strong>
                    Unable to submit mileage
                  </strong>

                  <p>
                    {mileageError}
                  </p>

                </div>

              </div>

            )}


            {/* ENTRY DATE */}

            <div className="form-group">

              <label>
                <CalendarDays size={16} />
                Entry Date
              </label>

              <input
                type="date"
                value={entryDate}
                onChange={(e) =>
                  setEntryDate(
                    e.target.value
                  )
                }
                disabled={
                  !!activeOutstationTrip
                }
              />

            </div>


            {/* ==================================================
                TRIP TYPE
            ================================================== */}

            <div className="form-group">

              <label>
                Trip Type
              </label>

              <select
                value={tripType}
                onChange={(e) => {

                  const value =
                    e.target.value;

                  setTripType(value);

                  setMileageError("");
                  setOutstationMessage("");
                  setOutstationTripSuccess(null);

                  if (value === "local") {

                    setDestinationSearch("");
                    setDestinationResults([]);
                    setSelectedDestination(null);
                    setLocationShared(false);

                  }

                }}
                disabled={
                  !!activeOutstationTrip
                }
              >

                <option value="local">
                  Local
                </option>

                <option value="outstation">
                  Outstation
                </option>

              </select>

            </div>


            {/* ==================================================
                OUTSTATION WORKFLOW
            ================================================== */}

            {tripType === "outstation" && (

              <div className="outstation-workflow">

                {/* ------------------------------------------
                    STEP INDICATOR
                ------------------------------------------ */}

                <div className="outstation-steps">

                  <div
                    className={`outstation-step ${
                      !activeOutstationTrip
                        ? "active"
                        : "completed"
                    }`}
                  >
                    <span>
                      1
                    </span>

                    <div>
                      <strong>
                        Destination
                      </strong>

                      <small>
                        Choose your destination
                      </small>
                    </div>
                  </div>


                  <div
                    className={`outstation-step ${
                      activeOutstationTrip &&
                      !locationShared
                        ? "active"
                        : locationShared
                        ? "completed"
                        : ""
                    }`}
                  >
                    <span>
                      2
                    </span>

                    <div>
                      <strong>
                        Location
                      </strong>

                      <small>
                        Share arrival location
                      </small>
                    </div>
                  </div>


                  <div
                    className={`outstation-step ${
                      locationShared
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>
                      3
                    </span>

                    <div>
                      <strong>
                        Complete
                      </strong>

                      <small>
                        Enter ending mileage
                      </small>
                    </div>
                  </div>

                </div>


                {/* ------------------------------------------
                    DESTINATION SEARCH
                ------------------------------------------ */}

                <div className="outstation-destination-section">

                  <div className="outstation-field-title">

                    <div className="outstation-field-icon">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <strong>
                        Destination
                      </strong>

                      <span>
                        Search and select where
                        you are travelling
                      </span>
                    </div>

                  </div>


                  <div className="destination-search-wrapper">

                    <MapPin
                      size={18}
                      className="destination-input-icon"
                    />

                    <input
                      type="text"
                      placeholder="Search destination..."
                      value={destinationSearch}
                      onChange={(e) =>
                        searchDestinations(
                          e.target.value
                        )
                      }
                      disabled={
                        !!activeOutstationTrip
                      }
                    />

                    {destinationLoading && (
                      <span className="destination-loading">
                        Searching...
                      </span>
                    )}

                  </div>


                  {/* SEARCH RESULTS */}

                  {destinationResults.length > 0 && (

                    <div className="destination-results">

                      {destinationResults.map(
                        (destination) => (

                          <button
                            key={
                              destination.placeId
                            }
                            type="button"
                            onClick={() => {

                              setSelectedDestination(
                                destination
                              );

                              setDestinationSearch(
                                destination.name
                              );

                              setDestinationResults(
                                []
                              );

                              setMileageError("");

                            }}
                          >

                            <div className="destination-result-icon">
                              <MapPin size={17} />
                            </div>

                            <div>

                              <strong>
                                {destination.name}
                              </strong>

                              <span>
                                {destination.address}
                              </span>

                            </div>

                          </button>

                        )
                      )}

                    </div>

                  )}


                  {/* SELECTED DESTINATION */}

                  {selectedDestination && (

                    <div className="selected-destination">

                      <div className="selected-destination-icon">
                        <CheckCircle2 size={20} />
                      </div>

                      <div>

                        <span>
                          Selected destination
                        </span>

                        <strong>
                          {selectedDestination.name}
                        </strong>

                        <small>
                          {selectedDestination.address}
                        </small>

                      </div>

                    </div>

                  )}


                  {/* START TRIP */}

                  {!activeOutstationTrip && (

                    <button
                      type="button"
                      className="outstation-primary-btn"
                      onClick={
                        startOutstationTrip
                      }
                      disabled={
                        submittingMileage ||
                        !selectedDestination ||
                        !vehicle ||
                        vehicle.status !== "active"
                      }
                    >

                      <Play size={18} />

                      {submittingMileage
                        ? "Starting Trip..."
                        : "Start Outstation Trip"}

                    </button>

                  )}

                </div>


                {/* ------------------------------------------
                    ACTIVE TRIP
                ------------------------------------------ */}

                {activeOutstationTrip && (

                  <div className="outstation-active-card">

                    <div className="outstation-active-header">

                      <div className="outstation-active-icon">
                        <Navigation size={20} />
                      </div>

                      <div>

                        <span>
                          Active Outstation Trip
                        </span>

                        <h3>
                          {activeOutstationTrip.destination}
                        </h3>

                      </div>

                      <span className="outstation-status-badge">
                        {locationShared
                          ? "Location Shared"
                          : "In Progress"}
                      </span>

                    </div>


                    <div className="outstation-active-details">

                      <div>

                        <span>
                          Starting Odometer
                        </span>

                        <strong>
                          {Number(
                            activeOutstationTrip.starting_mileage
                          ).toLocaleString()}
                          {" "}
                          KM
                        </strong>

                      </div>

                      <div>

                        <span>
                          Destination
                        </span>

                        <strong>
                          {activeOutstationTrip.destination}
                        </strong>

                      </div>

                    </div>


                    {/* --------------------------------------
                        LOCATION ACTION
                    -------------------------------------- */}

                    {!locationShared ? (

                      <div className="location-action-panel">

                        <div className="location-action-icon">
                          <MapPin size={24} />
                        </div>

                        <div className="location-action-content">

                          <strong>
                            Arrived at destination?
                          </strong>

                          <p>
                            Share your current location
                            to record the arrival point.
                          </p>

                        </div>

                        <button
                          type="button"
                          className="location-share-btn"
                          onClick={
                            shareArrivalLocation
                          }
                          disabled={
                            locationVerifying
                          }
                        >

                          <MapPin size={18} />

                          {locationVerifying
                            ? "Sharing Location..."
                            : "Share Current Location"}

                        </button>

                      </div>

                    ) : (

                      <div className="location-shared-panel">

                        <div className="location-shared-icon">
                          <CircleCheck size={24} />
                        </div>

                        <div>

                          <strong>
                            Arrival location shared
                          </strong>

                          <p>
                            Your current GPS location
                            has been recorded successfully.
                          </p>

                        </div>

                        <span>
                          Location Proof
                        </span>

                      </div>

                    )}

                  </div>

                )}

              </div>

            )}


            {/* ==================================================
                STARTING ODOMETER
            ================================================== */}

            <div className="form-group">

              <label>
                Starting Odometer (KM)
              </label>

              <input
                type="number"
                min="0"
                placeholder="Enter starting odometer"
                value={startingMileage}
                onChange={(e) =>
                  setStartingMileage(
                    e.target.value
                  )
                }
                disabled={
                  tripType === "outstation" &&
                  !!activeOutstationTrip
                }
              />

              {tripType === "local" &&
                dashboardData?.startingOdometer != null && (

                <small className="form-help-text">
                  Automatically loaded from your
                  latest completed trip.
                </small>

              )}

            </div>


            {/* ==================================================
                ENDING ODOMETER
            ================================================== */}

            <div className="form-group">

              <label>
                Ending Odometer (KM)
              </label>

              <input
                type="number"
                min="0"
                placeholder={
                  tripType === "outstation" &&
                  !locationShared
                    ? "Share location first"
                    : "Enter ending odometer"
                }
                value={endingMileage}
                onChange={(e) =>
                  setEndingMileage(
                    e.target.value
                  )
                }
                disabled={
                  tripType === "outstation" &&
                  !locationShared
                }
              />

              {tripType === "outstation" &&
                !locationShared && (

                <small className="form-help-text">
                  Ending mileage will be available
                  after you share your arrival location.
                </small>

              )}


              {/* COMPLETE OUTSTATION */}

              {tripType === "outstation" &&
                activeOutstationTrip &&
                locationShared && (

                <button
                  type="button"
                  className="outstation-complete-btn"
                  onClick={
                    completeOutstationTrip
                  }
                  disabled={
                    tripCompleting ||
                    endingMileage === ""
                  }
                >

                  <Flag size={18} />

                  {tripCompleting
                    ? "Completing Trip..."
                    : "Complete Outstation Trip"}

                </button>

              )}

            </div>


            {/* ==================================================
                KM CALCULATED
            ================================================== */}

            <div className="mileage-calculated">

              <span>
                KM Covered
              </span>

              <strong>
                {kmCovered.toLocaleString()}
                {" "}
                KM
              </strong>

            </div>


            {/* ==================================================
                LOCAL SUBMIT
            ================================================== */}

            <div className="mileage-form-actions">

              {tripType === "local" && (

                <button
                  type="button"
                  className="mileage-submit-btn"
                  disabled={
                    !vehicle ||
                    vehicle.status !== "active" ||
                    submittingMileage ||
                    startingMileage === "" ||
                    endingMileage === ""
                  }
                  onClick={
                    handleMileageSubmit
                  }
                >

                  <Route size={18} />

                  {submittingMileage
                    ? "Submitting..."
                    : "Submit Mileage"}

                </button>

              )}

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          LOCAL MILEAGE HISTORY
      ================================================== */}

      <div className="driver-mileage-card">

        <div className="driver-section-heading">

          <div className="driver-section-icon">
            <ClipboardList size={24} />
          </div>

          <div>

            <h2>
              Mileage History
            </h2>

            <p>
              Your previously submitted
              local mileage records
            </p>

          </div>

        </div>


        {mileageHistory.length === 0 ? (

          <div className="no-mileage-history">
            No mileage records found.
          </div>

        ) : (

          <div className="mileage-history-table-wrapper">

            <table className="mileage-history-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Starting Odometer</th>
                  <th>Ending Odometer</th>
                  <th>KM Covered</th>
                  <th>Trip Type</th>
                </tr>

              </thead>

              <tbody>

                {mileageHistory.map(
                  (entry) => (

                    <tr key={entry.id}>

                      <td>
                        {entry.entry_date
                          ? new Date(
                              `${entry.entry_date}T00:00:00`
                            ).toLocaleDateString(
                              "en-PK",
                              {
                                timeZone:
                                  "Asia/Karachi",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td>
                        {Number(
                          entry.starting_mileage
                        ).toLocaleString()}
                        {" "}
                        KM
                      </td>

                      <td>
                        {Number(
                          entry.ending_mileage
                        ).toLocaleString()}
                        {" "}
                        KM
                      </td>

                      <td>
                        {Number(
                          entry.km_covered
                        ).toLocaleString()}
                        {" "}
                        KM
                      </td>

                      <td>
                        <span
                          className={`trip-type ${entry.trip_type}`}
                        >
                          {entry.trip_type}
                        </span>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ==================================================
          OUTSTATION HISTORY
      ================================================== */}

      <div className="driver-mileage-card">

        <div className="driver-section-heading">

          <div className="driver-section-icon">
            <MapPin size={24} />
          </div>

          <div>

            <h2>
              Outstation History
            </h2>

            <p>
              Your previously completed
              outstation trips
            </p>

          </div>

        </div>


        {outstationHistory.length === 0 ? (

          <div className="no-mileage-history">
            No outstation trips found.
          </div>

        ) : (

          <div className="mileage-history-table-wrapper">

            <table className="mileage-history-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Destination</th>
                  <th>Starting Odometer</th>
                  <th>Ending Odometer</th>
                  <th>KM Covered</th>
                  <th>Status</th>
              
                </tr>

              </thead>

              <tbody>

                {outstationHistory.map(
                  (trip) => (

                    <tr key={trip.id}>

                      <td>
                        {trip.entry_date
                          ? new Date(
                              `${trip.entry_date}T00:00:00`
                            ).toLocaleDateString(
                              "en-PK",
                              {
                                timeZone:
                                  "Asia/Karachi",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td>
                        {trip.destination ||
                          "—"}
                      </td>

                      <td>
                        {trip.starting_mileage != null
                          ? `${Number(
                              trip.starting_mileage
                            ).toLocaleString()} KM`
                          : "—"}
                      </td>

                      <td>
                        {trip.ending_mileage != null
                          ? `${Number(
                              trip.ending_mileage
                            ).toLocaleString()} KM`
                          : "—"}
                      </td>

                      <td>
                        {trip.km_covered != null
                          ? `${Number(
                              trip.km_covered
                            ).toLocaleString()} KM`
                          : "—"}
                      </td>

                      <td>

                        <span
                          className={`trip-type ${
                            trip.status || ""
                          }`}
                        >
                          {trip.status ||
                            "unknown"}
                        </span>

                      </td>

                     

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default DriverDashboard;

