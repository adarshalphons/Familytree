"use client";
import { useState, useEffect, useRef } from "react";
import MemberCard from "./MemberCard";
import Controls from "./Controls";
import MemberFormModal from "./MemberFormModal";
import styles from "../../styles/Family.module.css";
import DeleteChildModal from "./DeleteChildModal";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [processedTree, setProcessedTree] = useState(null);
  const [localTree, setLocalTree] = useState(treeData);
  const [fullTree,setFullTree] = useState(false);

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
    let lastDist = null; // For pinch zoom

    // Mouse events
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

    // Touch drag
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        const touch = e.touches[0];
        prev = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        lastDist = getDistance(e.touches); // start pinch
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - prev.x;
        const dy = touch.clientY - prev.y;
        prev = { x: touch.clientX, y: touch.clientY };
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (e.touches.length === 2) {
        const dist = getDistance(e.touches);
        if (lastDist !== null) {
          const delta = dist - lastDist;
          setScale((prev) => {
            const next = prev + delta * 0.001;
            return Math.min(Math.max(next, 0.01), 1); // Clamp zoom
          });
        }
        lastDist = dist;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      lastDist = null;
    };

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
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

  const markAllToExpand = (member) => {
  const mark = (node) => {
    return {
      ...node,
      shouldExpand: true,
      children: (node.children || []).map(mark),
    };
  };

  return  mark(member);
};

const handleExpandClick = () => {
  let processedTree = localTree;
      
  if (!localTree) return;
  const markedTree = markAllToExpand(processedTree);
  setProcessedTree(markedTree);
  if(markedTree){
    setFullTree((prev) => !prev);
  }
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

  const handleDeleteChild = (id) => {
    console.log(id, "poa");
    setTargetDeleteId(id);
    setIsDeleteModalOpen(true);
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

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetDeleteId }),
      });
        setIsDeleteModalOpen(false);

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
        fullTree={fullTree}
        cities={cities}
        scale={scale}
        handleExpandClick={handleExpandClick}
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
            touchAction: "none", 
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
              onDelete={handleDeleteChild}
              isAdmin={isAdmin}
              isHighlighted={isHighlighted}
              searchTerm={searchTerm}
              autoExpand={!!searchTerm || !!locationFilter || !!cityFilter || fullTree}
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

      {isDeleteModalOpen && (
        <DeleteChildModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
