import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet avec webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Créer des icônes colorées
const createColoredIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

// Composant pour centrer la carte sur un marqueur
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 0.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const SuiviCandidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  const dataRef = useRef([]);
  const markerRefs = useRef({});

  // Storage wrapper
  const storage = {
    async get(key) {
      if (typeof window === "undefined") return { value: null };
      return { value: window.localStorage.getItem(key) };
    },
    async set(key, value) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
    },
  };

  const [formData, setFormData] = useState({
    restaurant: "",
    dateEnvoi: "",
    telephone: "",
    chef: "",
    visite: "",
    reponse: "",
    commentaires: "",
    lat: "",
    lng: "",
  });

  // Coordonnées GPS réelles des restaurants parisiens
  const getInitialData = () => [
    { restaurant: "Le Faham", dateEnvoi: "2024-12-29", telephone: "01 53 81 48 18", chef: "Rangama", visite: "oui", reponse: "", commentaires: "", lat: 48.8534, lng: 2.3488 },
    { restaurant: "Alliance", dateEnvoi: "2024-12-31", telephone: "01 75 51 57 54", chef: "Toshitaka Omiya", visite: "", reponse: "", commentaires: "", lat: 48.8508, lng: 2.3526 },
    { restaurant: "Frederic Simonin", dateEnvoi: "2024-12-31", telephone: "01 45 74 74 74", chef: "Frederic Simonin", visite: "", reponse: "", commentaires: "", lat: 48.8788, lng: 2.2986 },
    { restaurant: "Pantagruel", dateEnvoi: "2024-12-31", telephone: "01 40 20 05 72", chef: "Jason Gouzy", visite: "", reponse: "", commentaires: "", lat: 48.8648, lng: 2.3417 },
    { restaurant: "Lasserre", dateEnvoi: "2025-01-03", telephone: "01 43 59 02 13", chef: "Chef Ascione", visite: "oui", reponse: "", commentaires: "", lat: 48.8663, lng: 2.3082 },
    { restaurant: "Dame de Pic", dateEnvoi: "", telephone: "", chef: "Anne-Sophie Pic", visite: "", reponse: "", commentaires: "", lat: 48.8606, lng: 2.3376 },
    { restaurant: "Granit", dateEnvoi: "", telephone: "", chef: "", visite: "", reponse: "", commentaires: "", lat: 48.8738, lng: 2.3508 },
    { restaurant: "Apicius", dateEnvoi: "", telephone: "", chef: "", visite: "", reponse: "", commentaires: "", lat: 48.8756, lng: 2.3103 },
    { restaurant: "Agapé", dateEnvoi: "", telephone: "", chef: "", visite: "", reponse: "", commentaires: "", lat: 48.8819, lng: 2.2944 },
    { restaurant: "Atelier Joel Robuchon", dateEnvoi: "", telephone: "", chef: "", visite: "oui", reponse: "negative", commentaires: "pas de stage proposé", lat: 48.8558, lng: 2.3239 },
  ];

  const checkStorageAvailable = () => {
    try {
      return typeof window !== "undefined" && !!window.localStorage;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const loadCandidatures = async () => {
    setIsLoading(true);
    const isStorageOk = checkStorageAvailable();
    setStorageAvailable(isStorageOk);

    try {
      if (isStorageOk) {
        const result = await storage.get("candidatures_restaurants_v3");
        if (result && result.value) {
          const data = JSON.parse(result.value);
          setCandidatures(data);
          setFilteredCandidatures(data);
          dataRef.current = data;
        } else {
          const initialData = getInitialData();
          setCandidatures(initialData);
          setFilteredCandidatures(initialData);
          dataRef.current = initialData;
          await storage.set("candidatures_restaurants_v3", JSON.stringify(initialData));
        }
      } else {
        const initialData = getInitialData();
        setCandidatures(initialData);
        setFilteredCandidatures(initialData);
        dataRef.current = initialData;
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      const fallbackData = dataRef.current.length > 0 ? dataRef.current : getInitialData();
      setCandidatures(fallbackData);
      setFilteredCandidatures(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCandidatures(candidatures);
    } else {
      const filtered = candidatures.filter((c) =>
        Object.values(c).some((value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCandidatures(filtered);
    }
  }, [searchTerm, candidatures]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showDeleteModal) setShowDeleteModal(false);
        else if (showModal && !isSaving) closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal, showDeleteModal, isSaving]);

  // Gérer le clic sur la liste pour centrer la carte
  const handleListClick = (idx) => {
    const resto = candidatures[idx];
    if (resto && resto.lat && resto.lng) {
      setActiveMarker(idx);
      setMapCenter([resto.lat, resto.lng]);
      // Ouvrir le popup du marqueur
      if (markerRefs.current[idx]) {
        markerRefs.current[idx].openPopup();
      }
    }
  };

  const stats = {
    total: candidatures.length,
    visites: candidatures.filter((c) => c.visite === "oui").length,
    reponses: candidatures.filter((c) => c.reponse && c.reponse !== "").length,
    taux: candidatures.length > 0 ? Math.round((candidatures.filter((c) => c.reponse && c.reponse !== "").length / candidatures.length) * 100) : 0,
  };

  const openModal = (index = null) => {
    setIsSaving(false);
    if (index !== null && index >= 0) {
      setEditingIndex(index);
      setFormData({ ...candidatures[index] });
    } else {
      setEditingIndex(null);
      setFormData({
        restaurant: "",
        dateEnvoi: "",
        telephone: "",
        chef: "",
        visite: "",
        reponse: "",
        commentaires: "",
        lat: "48.8566",
        lng: "2.3522",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setIsSaving(false);
    setFormData({ restaurant: "", dateEnvoi: "", telephone: "", chef: "", visite: "", reponse: "", commentaires: "", lat: "", lng: "" });
  };

  const handleSave = async () => {
    if (!formData.restaurant || formData.restaurant.trim() === "") {
      setSaveStatus("❌ Le nom du restaurant est requis");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    if ((editingIndex === null || editingIndex < 0) && candidatures.length >= 100) {
      setSaveStatus("❌ Limite atteinte : 100 candidatures max");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus("💾 Sauvegarde...");

    try {
      const dataToSave = {
        ...formData,
        lat: parseFloat(formData.lat) || 48.8566,
        lng: parseFloat(formData.lng) || 2.3522,
      };

      let updatedCandidatures;
      if (editingIndex !== null && editingIndex >= 0) {
        updatedCandidatures = [...candidatures];
        updatedCandidatures[editingIndex] = dataToSave;
      } else {
        updatedCandidatures = [...candidatures, dataToSave];
      }

      setCandidatures(updatedCandidatures);
      setFilteredCandidatures(updatedCandidatures);
      dataRef.current = updatedCandidatures;

      if (storageAvailable && checkStorageAvailable()) {
        try {
          await storage.set("candidatures_restaurants_v3", JSON.stringify(updatedCandidatures));
          setSaveStatus("✅ Sauvegardé");
        } catch (storageError) {
          setSaveStatus("✅ Sauvegardé (mémoire)");
        }
      } else {
        setSaveStatus("✅ Sauvegardé (mémoire)");
      }

      setTimeout(() => {
        setSaveStatus("");
        closeModal();
      }, 800);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setSaveStatus("❌ Erreur: " + error.message);
      setTimeout(() => setSaveStatus(""), 3000);
      setIsSaving(false);
    }
  };

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) return;

    try {
      setSaveStatus("💾 Suppression...");
      const updated = candidatures.filter((_, i) => i !== deleteIndex);
      setCandidatures(updated);
      setFilteredCandidatures(updated);
      dataRef.current = updated;

      if (storageAvailable && checkStorageAvailable()) {
        try {
          await storage.set("candidatures_restaurants_v3", JSON.stringify(updated));
          setSaveStatus("✅ Supprimé");
        } catch (storageError) {
          setSaveStatus("✅ Supprimé (mémoire)");
        }
      } else {
        setSaveStatus("✅ Supprimé (mémoire)");
      }

      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Erreur suppression:", error);
      setSaveStatus("❌ Erreur suppression");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setShowDeleteModal(false);
      setDeleteIndex(null);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredCandidatures].sort((a, b) => {
      const aVal = a[key] || "";
      const bVal = b[key] || "";
      if (key === "dateEnvoi") {
        const aDate = aVal ? new Date(aVal) : new Date(0);
        const bDate = bVal ? new Date(bVal) : new Date(0);
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }
      const comparison = aVal.toString().localeCompare(bVal.toString(), "fr-FR", { sensitivity: "base", numeric: true });
      return direction === "asc" ? comparison : -comparison;
    });
    setFilteredCandidatures(sorted);
  };

  const exportCSV = () => {
    try {
      if (candidatures.length === 0) {
        setSaveStatus("❌ Aucune candidature à exporter");
        setTimeout(() => setSaveStatus(""), 2000);
        return;
      }

      const headers = ["Restaurant", "Date Envoi", "Téléphone", "Chef", "Visite", "Réponse", "Commentaires", "Latitude", "Longitude"];
      const csvRows = [headers.join(",")];

      candidatures.forEach((c) => {
        const row = [
          `"${(c.restaurant || "").replace(/"/g, '""')}"`,
          c.dateEnvoi || "",
          `"${(c.telephone || "").replace(/"/g, '""')}"`,
          `"${(c.chef || "").replace(/"/g, '""')}"`,
          c.visite || "",
          c.reponse || "",
          `"${(c.commentaires || "").replace(/"/g, '""')}"`,
          c.lat || "",
          c.lng || "",
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `candidatures_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveStatus("✅ Export réussi");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Erreur export:", error);
      setSaveStatus("❌ Erreur export");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getStatusBadge = (value, type) => {
    if (type === "visite") {
      if (value === "oui") return <span className="badge badge-oui">Oui</span>;
      if (value === "non") return <span className="badge badge-non">Non</span>;
      return <span className="badge badge-attente">En attente</span>;
    } else {
      if (value === "positive") return <span className="badge badge-oui">Positive</span>;
      if (value === "negative") return <span className="badge badge-non">Négative</span>;
      return <span className="badge badge-attente">En attente</span>;
    }
  };

  const getMarkerColor = (resto) => {
    if (resto.reponse === "positive") return "#1a6b1a";
    if (resto.reponse === "negative") return "#8b1e1e";
    if (resto.visite === "oui") return "#2d5016";
    return "#d4af37";
  };

  if (isLoading) {
    return (
      <div className="app">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .app { font-family: 'Montserrat', sans-serif; background: linear-gradient(135deg, #fafafa 0%, #f4e4bc 100%); min-height: 100vh; }
          header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #d4af37; padding: 1.5rem 2rem; border-bottom: 3px solid #d4af37; }
          h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
          .subtitle { font-size: 0.85rem; color: #f4e4bc; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 1rem; }
          .loading-spinner { width: 50px; height: 50px; border: 4px solid #f4e4bc; border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <header>
          <h1>Suivi des Candidatures</h1>
          <p className="subtitle">Restaurants Étoilés • Recherche de Stage</p>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .app {
          font-family: 'Montserrat', sans-serif;
          background: linear-gradient(135deg, #fafafa 0%, #f4e4bc 100%);
          color: #1a1a1a;
          min-height: 100vh;
        }

        header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          color: #d4af37;
          padding: 1.5rem 2rem;
          border-bottom: 3px solid #d4af37;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .subtitle { font-size: 0.85rem; color: #f4e4bc; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }

        .save-status {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 3000;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #d4af37;
          text-align: center;
        }

        .stat-value { font-size: 2rem; font-weight: 700; color: #d4af37; font-family: 'Playfair Display', serif; }
        .stat-label { font-size: 0.75rem; color: #9e9e9e; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }

        .container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }

        .section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-top: 4px solid #d4af37;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
          margin-bottom: 1.25rem;
        }

        /* CARTE LEAFLET */
        .map-container {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1rem;
          min-height: 450px;
        }

        .map-wrapper {
          height: 450px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e8e8e8;
        }

        .map-wrapper .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 6px;
        }

        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          padding: 0 !important;
        }

        .leaflet-popup-content {
          margin: 12px 16px !important;
          font-family: 'Montserrat', sans-serif !important;
        }

        .popup-title {
          margin: 0 0 8px 0;
          color: #d4af37;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid #f4e4bc;
          padding-bottom: 6px;
        }

        .popup-info {
          margin: 4px 0;
          font-size: 12px;
        }

        .popup-status {
          margin: 4px 0;
          font-size: 12px;
          font-weight: bold;
        }

        .popup-comment {
          margin: 6px 0 0 0;
          font-size: 11px;
          font-style: italic;
          color: #666;
        }

        .restaurant-list {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
          overflow-y: auto;
          max-height: 450px;
        }

        .restaurant-list h3 {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .restaurant-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.85rem;
        }

        .restaurant-item:hover,
        .restaurant-item.active {
          background: #f4e4bc;
        }

        .restaurant-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .restaurant-dot.gold { background: #d4af37; }
        .restaurant-dot.green { background: #2d5016; }
        .restaurant-dot.red { background: #8b1e1e; }

        .restaurant-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }

        .restaurant-status {
          font-size: 0.7rem;
          color: #999;
        }

        .controls {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.875rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn:hover { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-primary { background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1a1a1a; }
        .btn-secondary { background: white; color: #1a1a1a; border: 2px solid #d4af37; }
        .btn-danger { background: #8b1e1e; color: white; }

        .search-box {
          flex: 1;
          min-width: 200px;
          padding: 0.875rem 1.25rem;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem;
        }

        .search-box:focus { outline: none; border-color: #d4af37; }

        .table-wrapper { overflow-x: auto; border-radius: 8px; }

        table { width: 100%; border-collapse: collapse; background: white; }

        thead { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #d4af37; }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          cursor: pointer;
        }

        th:hover { background: rgba(212, 175, 55, 0.2); }

        td { padding: 1rem; border-bottom: 1px solid #e8e8e8; font-size: 0.85rem; }

        tbody tr:hover { background: #f4e4bc; }

        .badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-oui { background: rgba(45, 80, 22, 0.15); color: #2d5016; border: 1px solid #2d5016; }
        .badge-non { background: rgba(139, 30, 30, 0.15); color: #8b1e1e; border: 1px solid #8b1e1e; }
        .badge-attente { background: rgba(212, 175, 55, 0.15); color: #8b7424; border: 1px solid #d4af37; }

        .actions { display: flex; gap: 0.5rem; }

        .btn-action {
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit { background: #f4e4bc; color: #1a1a1a; }
        .btn-edit:hover { background: #d4af37; }

        .btn-delete { background: rgba(139, 30, 30, 0.1); color: #8b1e1e; }
        .btn-delete:hover { background: #8b1e1e; color: white; }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-top: 4px solid #d4af37;
        }

        .modal-small { max-width: 400px; text-align: center; }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #9e9e9e;
          width: 44px;
          height: 44px;
          border-radius: 50%;
        }

        .close-modal:hover { background: #e8e8e8; color: #1a1a1a; }

        .form-group { margin-bottom: 1.25rem; }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        input, textarea, select {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #d4af37;
        }

        textarea { resize: vertical; min-height: 80px; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .form-actions .btn { flex: 1; }

        .delete-icon { font-size: 3rem; margin-bottom: 1rem; }
        .delete-message { margin-bottom: 1.5rem; color: #666; }
        .delete-name { font-weight: bold; color: #1a1a1a; }

        .coords-hint { font-size: 0.75rem; color: #999; margin-top: 4px; }

        .map-help {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f9f9f9;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .stats-container { grid-template-columns: repeat(2, 1fr); }
          .map-container { grid-template-columns: 1fr; }
          .restaurant-list { max-height: 200px; }
          .form-row { grid-template-columns: 1fr; }
          .map-wrapper { height: 300px; }
        }
      `}</style>

      <header>
        <h1>Suivi des Candidatures</h1>
        <p className="subtitle">Restaurants Étoilés • Recherche de Stage</p>
      </header>

      {saveStatus && <div className="save-status">{saveStatus}</div>}

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.visites}</div>
          <div className="stat-label">Visites</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.reponses}</div>
          <div className="stat-label">Réponses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.taux}%</div>
          <div className="stat-label">Taux</div>
        </div>
      </div>

      <div className="container">
        <div className="section">
          <h2 className="section-title">📍 Carte Interactive - Paris</h2>

          <div className="map-container">
            <div className="map-wrapper">
              <MapContainer
                center={[48.8566, 2.3522]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {mapCenter && <MapController center={mapCenter} zoom={15} />}

                {candidatures.map((resto, idx) => {
                  if (!resto.lat || !resto.lng) return null;
                  const color = getMarkerColor(resto);

                  return (
                    <Marker
                      key={`marker-${idx}`}
                      position={[resto.lat, resto.lng]}
                      icon={createColoredIcon(color)}
                      ref={(ref) => {
                        if (ref) markerRefs.current[idx] = ref;
                      }}
                      eventHandlers={{
                        click: () => setActiveMarker(idx),
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: "180px" }}>
                          <h4 className="popup-title">{resto.restaurant}</h4>
                          {resto.chef && <p className="popup-info"><strong>Chef:</strong> {resto.chef}</p>}
                          {resto.telephone && <p className="popup-info"><strong>Tél:</strong> {resto.telephone}</p>}
                          {resto.dateEnvoi && <p className="popup-info"><strong>Envoyé:</strong> {formatDate(resto.dateEnvoi)}</p>}
                          {resto.visite === "oui" && <p className="popup-status" style={{ color: "#2d5016" }}>✓ Visite effectuée</p>}
                          {resto.reponse === "positive" && <p className="popup-status" style={{ color: "#1a6b1a" }}>✓ Réponse positive</p>}
                          {resto.reponse === "negative" && <p className="popup-status" style={{ color: "#8b1e1e" }}>✗ Réponse négative</p>}
                          {resto.commentaires && <p className="popup-comment">{resto.commentaires}</p>}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            <div className="restaurant-list">
              <h3>Liste ({candidatures.length})</h3>
              <p className="map-help">💡 Cliquez sur un restaurant pour le localiser</p>

              {candidatures.map((resto, idx) => {
                let dotClass = "gold";
                let status = "En attente";
                if (resto.reponse === "positive") { dotClass = "green"; status = "Accepté"; }
                else if (resto.reponse === "negative") { dotClass = "red"; status = "Refusé"; }
                else if (resto.visite === "oui") { dotClass = "green"; status = "Visité"; }

                return (
                  <div
                    key={`list-${idx}`}
                    className={`restaurant-item ${activeMarker === idx ? "active" : ""}`}
                    onClick={() => handleListClick(idx)}
                  >
                    <div className={`restaurant-dot ${dotClass}`}></div>
                    <span className="restaurant-name">{resto.restaurant}</span>
                    <span className="restaurant-status">{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">📋 Gestion des Candidatures</h2>

          <div className="controls">
            <button className="btn btn-primary" onClick={() => openModal()} type="button">➕ Nouvelle</button>
            <button className="btn btn-secondary" onClick={exportCSV} type="button">📥 Export CSV</button>
            <input
              type="text"
              className="search-box"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("restaurant")}>Restaurant ↕</th>
                  <th onClick={() => handleSort("dateEnvoi")}>Date ↕</th>
                  <th>Téléphone</th>
                  <th onClick={() => handleSort("chef")}>Chef ↕</th>
                  <th onClick={() => handleSort("visite")}>Visite ↕</th>
                  <th onClick={() => handleSort("reponse")}>Réponse ↕</th>
                  <th>Commentaires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidatures.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem" }}>
                      <div style={{ fontSize: "3rem", opacity: 0.3 }}>🍽️</div>
                      <p>Aucune candidature trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredCandidatures.map((candidature, filteredIdx) => {
                    const realIndex = candidatures.findIndex(
                      (c) => c.restaurant === candidature.restaurant && c.telephone === candidature.telephone && c.dateEnvoi === candidature.dateEnvoi
                    );
                    return (
                      <tr key={`row-${filteredIdx}`}>
                        <td><strong>{candidature.restaurant}</strong></td>
                        <td>{formatDate(candidature.dateEnvoi)}</td>
                        <td>{candidature.telephone || "-"}</td>
                        <td>{candidature.chef || "-"}</td>
                        <td>{getStatusBadge(candidature.visite, "visite")}</td>
                        <td>{getStatusBadge(candidature.reponse, "reponse")}</td>
                        <td>{candidature.commentaires || "-"}</td>
                        <td className="actions">
                          <button className="btn-action btn-edit" onClick={() => openModal(realIndex)} type="button">✏️</button>
                          <button className="btn-action btn-delete" onClick={() => openDeleteModal(realIndex)} type="button">🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Formulaire */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) closeModal(); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingIndex !== null ? "Modifier la Candidature" : "Nouvelle Candidature"}</h2>
              <button className="close-modal" onClick={closeModal} type="button" disabled={isSaving}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Restaurant *</label>
                <input type="text" value={formData.restaurant || ""} onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })} placeholder="Nom du restaurant" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date d'envoi</label>
                  <input type="date" value={formData.dateEnvoi || ""} onChange={(e) => setFormData({ ...formData, dateEnvoi: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" value={formData.telephone || ""} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="01 XX XX XX XX" />
                </div>
              </div>
              <div className="form-group">
                <label>Chef</label>
                <input type="text" value={formData.chef || ""} onChange={(e) => setFormData({ ...formData, chef: e.target.value })} placeholder="Nom du chef" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Visite effectuée</label>
                  <select value={formData.visite || ""} onChange={(e) => setFormData({ ...formData, visite: e.target.value })}>
                    <option value="">En attente</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Réponse</label>
                  <select value={formData.reponse || ""} onChange={(e) => setFormData({ ...formData, reponse: e.target.value })}>
                    <option value="">En attente</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Négative</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="text" value={formData.lat || ""} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} placeholder="48.8566" />
                  <p className="coords-hint">Cherchez sur Google Maps</p>
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="text" value={formData.lng || ""} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} placeholder="2.3522" />
                  <p className="coords-hint">Clic droit → Coordonnées</p>
                </div>
              </div>
              <div className="form-group">
                <label>Commentaires</label>
                <textarea value={formData.commentaires || ""} onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })} placeholder="Notes, observations..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" disabled={isSaving} onClick={handleSave}>
                  {isSaving ? "⏳ Sauvegarde..." : "💾 Enregistrer"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSaving}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-content modal-small">
            <div className="delete-icon">🗑️</div>
            <h2 className="modal-title">Confirmer la suppression</h2>
            <p className="delete-message">
              Voulez-vous vraiment supprimer<br />
              <span className="delete-name">{deleteIndex !== null && candidatures[deleteIndex] ? candidatures[deleteIndex].restaurant : ""}</span> ?
            </p>
            <div className="form-actions">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>🗑️ Supprimer</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiviCandidatures;
