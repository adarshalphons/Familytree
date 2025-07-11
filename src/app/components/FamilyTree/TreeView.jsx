"use client";
import { useState, useEffect, useRef } from "react";
import MemberCard from "./MemberCard";
import Controls from "./Controls";
import MemberFormModal from "./MemberFormModal";
import styles from "../../styles/Family.module.css";

export default function TreeView({ treeData, isAdmin }) {
  const [scale, setScale] = useState(0.7);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryCityMap, setCountryCityMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [processedTree, setProcessedTree] = useState(null);
  const [localTree, setLocalTree] = useState(treeData);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    state: "",
    city: "",
    img: "",
    generation: 0,
    phonecode:"",
    phone: "",
    gender: null,
    father: null,
  });
  
  console.log(formData,"pjjj")
  const treeContainerRef = useRef(null);

  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.01 : -0.01;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.01), 1));
      }
    };

    let isDragging = false;
    let prev = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prev = { x: e.clientX, y: e.clientY };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      prev = { x: e.clientX, y: e.clientY };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const countrySet = new Set();
    const cityMap = {};

    const traverse = (node) => {
      const { country, city } = node;
      if (country) {
        countrySet.add(country);
        if (!cityMap[country]) cityMap[country] = new Set();
        if (city) cityMap[country].add(city);
      }
      node.children?.forEach(traverse);
    };

    if (localTree) {
      traverse(localTree);
      setCountries(Array.from(countrySet));
      const finalMap = {};
      for (const [key, val] of Object.entries(cityMap)) {
        finalMap[key] = Array.from(val);
      }
      setCountryCityMap(finalMap);
    }
  }, [localTree]);

  useEffect(() => {
    if (locationFilter && countryCityMap[locationFilter]) {
      setCities(countryCityMap[locationFilter]);
    } else {
      setCities([]);
    }
    setCityFilter("");
  }, [locationFilter, countryCityMap]);

  const isHighlighted = (member) => member?.isMatch || member?.isCountryMatch;

  const markCountryHighlight = (member, country, city = "") => {
    let matchCount = 0;
    const lowerCaseCountry = country.toLowerCase();
    const lowerCaseCity = city.toLowerCase();

    const mark = (node) => {
      const matchCountry = (node.country || "").toLowerCase() === lowerCaseCountry;
      const matchCity = city ? (node.city || "").toLowerCase() === lowerCaseCity : true;
      const isMatch = matchCountry && matchCity;
      if (isMatch) matchCount++;

      const children = (node.children || []).map(mark);
      const hasMatchChild = children.some((child) => child.isCountryMatch || child.shouldExpand);

      return {
        ...node,
        isCountryMatch: isMatch,
        shouldExpand: isMatch || hasMatchChild,
        children,
      };
    };

    return { markedTree: mark(member), matchCount };
  };

  const markNodesToExpand = (member, term) => {
    let matchCount = 0;
    const mark = (node) => {
      const match = node.name.toLowerCase().includes(term.toLowerCase());
      if (match) matchCount++;

      const children = (node.children || []).map(mark);
      const hasMatchChild = children.some((child) => child.isMatch || child.shouldExpand);

      return {
        ...node,
        isMatch: match,
        shouldExpand: match || hasMatchChild,
        children,
      };
    };

    return { markedTree: mark(member), matchCount };
  };

  useEffect(() => {
    if (!localTree) return;
    let updatedTree = localTree;

    if (locationFilter) {
      const { markedTree } = markCountryHighlight(localTree, locationFilter, cityFilter);
      updatedTree = markedTree;
    }

    if (searchTerm.trim()) {
      const { markedTree, matchCount } = markNodesToExpand(updatedTree, searchTerm);
      setSearchCount(matchCount);
      if (matchCount === 0) {
        setProcessedTree(null);
        return;
      }
      updatedTree = markedTree;
    }

    setProcessedTree(updatedTree);
     if(!localTree){
    setPosition({ x: 0, y: 0 });
    
   }
  }, [localTree, locationFilter, cityFilter, searchTerm]);

  // const generateHierarchicalId = (parentId, siblings, newMember) => {
  //   const isMale = newMember.gender === "male";
  //   const existingSuffixes = siblings.map((sibling) => sibling.id?.split(".").pop());

  //   let counter = 1;
  //   let idSuffix = "";

  //   if (isMale) {
  //     while (existingSuffixes.includes(String(counter))) counter++;
  //     idSuffix = `${counter}`;
  //   } else {
  //     const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //     let i = 0;
  //     while (existingSuffixes.includes(alphabet[i])) i++;
  //     idSuffix = alphabet[i];
  //   }

  //   return `${parentId}.${idSuffix}`;
  // };

   const generateHierarchicalId = (parentId, siblings, newMember) => {
    // const isMale = newMember.gender === "male";
    const existingSuffixes = siblings.map((sibling) => sibling.id?.split(".").pop());

    let counter = 1;
    let idSuffix = "";

    // if (isMale) {
      while (existingSuffixes.includes(String(counter))) counter++;
      idSuffix = `${counter}`;
    // } 
    
    // else {
    //   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    //   let i = 0;
    //   while (existingSuffixes.includes(alphabet[i])) i++;
    //   idSuffix = alphabet[i];
    // }

    return `${parentId}.${idSuffix}`;
  };

  const handleAddChild = (parent) => {
    console.log(parent,"poa")
    setEditMode(false);
    setTargetId(parent.id);
    setFormData({
      name: "",
      email: "",
      country:  "",
      state:  "",
      city:  "",
      img: "",
      generation: parent.generation + 1,
      phonecode:"",
      phone: "",
      gender: null,
      father: parent.id ?? "",
    });
    setModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditMode(true);
    setTargetId(member.id);
    setFormData({ ...member });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!editMode) {
        const response = await fetch("/api/family", { method: "GET" });
        const tree = await response.json();

        const assignIdRecursively = (node) => {
          if (node.id === targetId) {
            const siblings = node.children || [];
            const newId = generateHierarchicalId(node.id || "V", siblings, formData);
            formData.id = newId;
            return;
          }
          node.children?.forEach(assignIdRecursively);
        };

        assignIdRecursively(tree);
        // const updatedTree = tree;

        const saveResponse = await fetch("/api/family", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentId: targetId, newMember: { ...formData, children: [] } }),
        });

        if (!saveResponse.ok) throw new Error("Save failed");
        const savedTree = await saveResponse.json();
        setLocalTree(savedTree);
        setModalOpen(false);
        return;
      }

      const saveResponse = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId, updatedMember: formData }),
      });

      if (!saveResponse.ok) throw new Error("Save failed");
      const savedTree = await saveResponse.json();
      setLocalTree(savedTree);
      setModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (id) => {
    alert("Are You want to delete this Child")
    try {
      const response = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete member");

      const updatedTree = await response.json();
      setLocalTree(updatedTree);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Controls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        countries={countries}
        cities={cities}
        scale={scale}
        setScale={setScale}
        isAdmin={isAdmin}
        onResetView={() => {
          setScale(0.7);
          setPosition({ x: 0, y: 0 });
        }}
        searchCount={searchCount}
      />

      <div className={styles.scrollWrapper}>
        <div
          ref={treeContainerRef}
          className={styles.treeContainer}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "top center",
            cursor: "grab",
            transition: "transform 0.1s ease-out",
          }}
        >
          {!processedTree ? (
            <div className={styles.noResult}>
              No Results found for "{searchTerm || locationFilter || cityFilter}"
            </div>
          ) : (
            <MemberCard
              member={processedTree}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              isHighlighted={isHighlighted}
              searchTerm={searchTerm}
              autoExpand={!!searchTerm || !!locationFilter || !!cityFilter}
            />
          )}
        </div>
      </div>

      {modalOpen && (
        <MemberFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          editMode={editMode}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
}
