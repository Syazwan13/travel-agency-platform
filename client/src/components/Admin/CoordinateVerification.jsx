import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CoordinateVerification.css';

const CoordinateVerification = () => {
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedIsland, setSelectedIsland] = useState('all');
  const [editingResort, setEditingResort] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchResorts();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resorts, filter, selectedIsland]);

  const fetchResorts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resorts`);
      setResorts(response.data.resorts || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch resorts');
      console.error('Error fetching resorts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resorts/cache-stats`);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...resorts];

    // Filter by quality
    if (filter === 'low-quality') {
      filtered = filtered.filter(resort => (resort.qualityScore || 0) < 50);
    } else if (filter === 'unverified') {
      filtered = filtered.filter(resort => !resort.isVerified);
    } else if (filter === 'generic') {
      filtered = filtered.filter(resort => 
        resort.coordinates && 
        (resort.coordinates[0] === 112.5 && resort.coordinates[1] === 2.5)
      );
    }

    // Filter by island
    if (selectedIsland !== 'all') {
      filtered = filtered.filter(resort => 
        resort.island && resort.island.toLowerCase() === selectedIsland.toLowerCase()
      );
    }

    // Sort by quality score (lowest first)
    filtered.sort((a, b) => (a.qualityScore || 0) - (b.qualityScore || 0));

    setFilteredResorts(filtered);
  };

  const handleVerifyCoordinate = async (resortId, isVerified) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/resorts/${resortId}/verify`, {
        isVerified
      });
      
      // Update local state
      setResorts(resorts.map(resort => 
        resort._id === resortId ? { ...resort, isVerified } : resort
      ));
      
      fetchStats(); // Refresh stats
    } catch (err) {
      setError('Failed to update verification status');
      console.error('Error updating verification:', err);
    }
  };

  const handleEditCoordinates = (resort) => {
    setEditingResort({
      ...resort,
      newLng: resort.coordinates[0],
      newLat: resort.coordinates[1],
      newAddress: resort.address || resort.formattedAddress
    });
  };

  const handleSaveCoordinates = async () => {
    if (!editingResort) return;

    try {
      const newCoordinates = [
        parseFloat(editingResort.newLng),
        parseFloat(editingResort.newLat)
      ];

      await axios.patch(`${import.meta.env.VITE_API_URL}/api/resorts/${editingResort._id}/coordinates`, {
        coordinates: newCoordinates,
        formattedAddress: editingResort.newAddress,
        method: 'manual_override',
        qualityScore: 100,
        isVerified: true
      });

      // Update local state
      setResorts(resorts.map(resort => 
        resort._id === editingResort._id ? {
          ...resort,
          coordinates: newCoordinates,
          formattedAddress: editingResort.newAddress,
          qualityScore: 100,
          isVerified: true,
          method: 'manual_override'
        } : resort
      ));

      setEditingResort(null);
      fetchStats();
    } catch (err) {
      setError('Failed to update coordinates');
      console.error('Error updating coordinates:', err);
    }
  };

  const getQualityBadge = (score) => {
    if (score >= 80) return <span className="badge badge-success">High ({score})</span>;
    if (score >= 50) return <span className="badge badge-warning">Medium ({score})</span>;
    return <span className="badge badge-danger">Low ({score || 0})</span>;
  };

  const getMethodBadge = (method) => {
    const methodColors = {
      'known_database': 'success',
      'api_geocoding': 'primary',
      'beach_match': 'info',
      'manual_override': 'success',
      'fallback': 'warning'
    };
    
    return (
      <span className={`badge badge-${methodColors[method] || 'secondary'}`}>
        {method || 'unknown'}
      </span>
    );
  };

  const islands = [...new Set(resorts.map(r => r.island).filter(Boolean))];

  return (
    <div className="coordinate-verification">
      <div className="header">
        <h2>Coordinate Verification & Management</h2>
        
        {stats && (
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Cached:</span>
              <span className="stat-value">{stats.totalCached}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Verified:</span>
              <span className="stat-value">{stats.verified}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">High Quality:</span>
              <span className="stat-value">{stats.qualityDistribution?.high || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Low Quality:</span>
              <span className="stat-value">{stats.qualityDistribution?.low || 0}</span>
            </div>
          </div>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Quality:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Resorts</option>
            <option value="low-quality">Low Quality (&lt;50)</option>
            <option value="unverified">Unverified</option>
            <option value="generic">Generic Coordinates</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Island:</label>
          <select value={selectedIsland} onChange={(e) => setSelectedIsland(e.target.value)}>
            <option value="all">All Islands</option>
            {islands.map(island => (
              <option key={island} value={island}>{island}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchResorts} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      {loading && <div className="loading">Loading resorts...</div>}
      {error && <div className="error">{error}</div>}

      <div className="resorts-table">
        <table>
          <thead>
            <tr>
              <th>Resort Name</th>
              <th>Island</th>
              <th>Coordinates</th>
              <th>Quality</th>
              <th>Method</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResorts.map(resort => (
              <tr key={resort._id || `${resort.name}-${resort.island}`}>
                <td>{resort.name}</td>
                <td>{resort.island}</td>
                <td>
                  {resort.coordinates ? (
                    <span className="coordinates">
                      [{resort.coordinates[0].toFixed(6)}, {resort.coordinates[1].toFixed(6)}]
                    </span>
                  ) : (
                    <span className="no-coordinates">No coordinates</span>
                  )}
                </td>
                <td>{getQualityBadge(resort.qualityScore)}</td>
                <td>{getMethodBadge(resort.method)}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={resort.isVerified || false}
                    onChange={(e) => handleVerifyCoordinate(resort._id, e.target.checked)}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleEditCoordinates(resort)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingResort && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Coordinates for {editingResort.name}</h3>
            
            <div className="form-group">
              <label>Longitude:</label>
              <input
                type="number"
                step="0.000001"
                value={editingResort.newLng}
                onChange={(e) => setEditingResort({
                  ...editingResort,
                  newLng: e.target.value
                })}
              />
            </div>

            <div className="form-group">
              <label>Latitude:</label>
              <input
                type="number"
                step="0.000001"
                value={editingResort.newLat}
                onChange={(e) => setEditingResort({
                  ...editingResort,
                  newLat: e.target.value
                })}
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                value={editingResort.newAddress}
                onChange={(e) => setEditingResort({
                  ...editingResort,
                  newAddress: e.target.value
                })}
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveCoordinates} className="btn btn-success">
                Save Changes
              </button>
              <button onClick={() => setEditingResort(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="showing-count">
        Showing {filteredResorts.length} of {resorts.length} resorts
      </div>
    </div>
  );
};

export default CoordinateVerification;
