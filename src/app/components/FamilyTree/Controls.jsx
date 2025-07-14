"use client";
import { useRouter } from "next/navigation";
import styles from "../../styles/Family.module.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

export default function Controls({
  searchTerm,
  setSearchTerm,
  locationFilter,
  setLocationFilter,
  countries,
  scale,
  setScale,
  isAdmin,
  onResetView,
  searchCount,
  cities,
  cityFilter,
  setCityFilter,
}) {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.01, 1));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.01, 0.01));

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowClear(value.length > 0);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("authToken");
      contextLogout();
      router.push("/admin");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* Left Filters */}

      <div className={styles.leftControls}>
        <div className={styles.countryControls}>
          <select
            className={styles.locationFilter}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className={styles.locationFilter}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            disabled={!locationFilter}
          >
            <option value="">
              {locationFilter ? "All Cities" : "Select country first"}
            </option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.searchFound}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search family members..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {showClear && (
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setSearchTerm("");
                  setShowClear(false);
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <p className={styles.found}>{`Found ${searchCount} result${
              searchCount === 1 ? "" : "s"
            }`}</p>
          )}
        </div>
      </div>

      {/* Center Title & Search */}
      <div className={styles.centerControls}>
        <div className={styles.titleGroup}>
          <h1 className={styles.navTitle}>Panamthottam</h1>
          <p className={styles.subtitle}>Nine Generations of Heritage Across the Globe</p>
        </div>

        {/* <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search family members..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {showClear && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setSearchTerm("");
                setShowClear(false);
              }}
            >
              ✕
            </button>
          )}
        </div> */}

        {/* {searchTerm && (
          <p className={styles.found}>{`Found ${searchCount} result${
            searchCount === 1 ? "" : "s"
          }`}</p>
        )} */}
      </div>

      {/* Right Buttons */}
      <div className={styles.rightControls}>
        <div className={styles.zoomGroup}>
          <button onClick={handleZoomOut} className={styles.zoomButton}>
            -
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className={styles.zoomButton}>
            +
          </button>
        </div>

        <button onClick={onResetView} className={styles.resetButton}>
          Reset View
        </button>

        {loading && <Loader isLoading={loading} />}
        {isAdmin && (
          <button className={styles.logoutButton} onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
