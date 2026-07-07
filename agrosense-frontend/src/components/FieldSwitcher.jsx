import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import './css/FieldSwitcher.css';

export default function FieldSwitcher({ fields, selectedFieldId, onSelectField, onCreateField }) {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const wrapperRef = useRef(null);

  const selected = fields.find((f) => String(f.id) === String(selectedFieldId));

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onCreateField({ name: newName.trim(), location: newLocation.trim(), area: '' });
    setNewName('');
    setNewLocation('');
    setShowAddForm(false);
    setOpen(false);
  };

  return (
    <div className="field-switcher" ref={wrapperRef}>
      <button className="field-switcher-trigger" onClick={() => setOpen((prev) => !prev)}>
        <span className="field-switcher-icon">
          <MapPin size={14} />
        </span>
        <span className="field-switcher-text">
          <span className="field-switcher-name">
            {selected ? selected.name : 'Select Field'}
          </span>
          {selected?.location && (
            <span className="field-switcher-location">{selected.location}</span>
          )}
        </span>
        <ChevronDown size={15} className={`field-switcher-chevron ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="field-switcher-menu">
          {fields.map((f) => (
            <div
              key={f.id}
              className={`field-switcher-option ${String(f.id) === String(selectedFieldId) ? 'active' : ''}`}
              onClick={() => { onSelectField(String(f.id)); setOpen(false); }}
            >
              {f.name}
              {f.location && (
                <div className="field-switcher-option-location">{f.location}</div>
              )}
            </div>
          ))}

          <div className="field-switcher-divider">
            {!showAddForm ? (
              <div className="field-switcher-add-trigger" onClick={() => setShowAddForm(true)}>
                + Add New Field
              </div>
            ) : (
              <div className="field-switcher-add-form">
                <input
                  placeholder="Field name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <input
                  placeholder="Location (optional)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <button className="field-switcher-save-btn" onClick={handleAdd}>
                  Save Field
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}