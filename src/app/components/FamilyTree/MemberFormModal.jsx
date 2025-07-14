"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import styles from "../../styles/Family.module.css";

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  editMode,
  formData,
  setFormData,
}) {
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [phoneCode, setPhoneCode] = useState("");

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // useEffect(() => {
  //   const countryObj = countries.find((c) => c.name === formData.country);
  //   if (countryObj) {
  //     const stateList = State.getStatesOfCountry(countryObj.isoCode);
  //     setStates(stateList);
  //     setPhoneCode(countryObj.phonecode);
  //   } else {
  //     setStates([]);
  //     setPhoneCode("");
  //   }
  // }, [formData.country, countries]);
  useEffect(() => {
    const countryObj = countries.find((c) => c.name === formData.country);
    if (countryObj) {
      const stateList = State.getStatesOfCountry(countryObj.isoCode);
      setStates(stateList);
      setPhoneCode(countryObj.phonecode);
      setFormData((prev) => ({
        ...prev,
        phonecode: `+${countryObj.phonecode}`,
      }));
    } else {
      setStates([]);
      setPhoneCode("");
      setFormData((prev) => ({ ...prev, phonecode: "" }));
    }
  }, [formData.country, countries]);

  useEffect(() => {
    const countryObj = countries.find((c) => c.name === formData.country);
    const stateObj = states.find((s) => s.name === formData.state);
    if (countryObj && stateObj) {
      const cityList = City.getCitiesOfState(
        countryObj.isoCode,
        stateObj.isoCode
      );
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [formData.state, formData.country, states]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.country ||
      !formData.state ||
      !formData.city ||
      !formData.gender
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    onSave();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {editMode ? "Edit Member" : "Add Child"}
        </h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          placeholder="Name *"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          placeholder="Email"
          type="email"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* COUNTRY SELECT */}
        <Select
          placeholder="Select Country *"
          options={countries.map((c) => ({ label: c.name, value: c.name }))}
          value={
            formData.country
              ? { label: formData.country, value: formData.country }
              : null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              country: selected?.value || "",
              state: "",
              city: "",
            })
          }
        />

        {/* STATE SELECT */}
        <Select
          placeholder="Select State *"
          options={states.map((s) => ({ label: s.name, value: s.name }))}
          value={
            formData.state
              ? { label: formData.state, value: formData.state }
              : null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              state: selected?.value || "",
              city: "",
            })
          }
          isDisabled={!formData.country}
        />

        {/* CITY SELECT */}
        <Select
          placeholder="Select City *"
          options={cities.map((c) => ({ label: c.name, value: c.name }))}
          value={
            formData.city
              ? { label: formData.city, value: formData.city }
              : null
          }
          onChange={(selected) =>
            setFormData({ ...formData, city: selected?.value || "" })
          }
          isDisabled={!formData.state}
        />

        {/* PHONE WITH COUNTRY CODE */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            disabled
            style={{ width: "80px" }}
            value={phoneCode ? `+${phoneCode}` : ""}
            placeholder="+Code"
            onChange={(e) =>
              setFormData({ ...formData, phonecode: phoneCode ?? "" })
            }
          />
          <input
            placeholder="Phone Number"
            type="tel"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            style={{ flex: 1 }}
          />
        </div>

        {/* GENDER SELECT */}
        <select
          style={{ width: "100%" }}
          value={formData.gender || ""}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="">Select Gender *</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <div className={styles.modalActions}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
