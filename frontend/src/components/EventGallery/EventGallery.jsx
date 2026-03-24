import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Image as ImageIcon, Plus, Trash2, Maximize2, X, ChevronLeft } from 'lucide-react';
import './EventGallery.css';

const EventGallery = () => {
  const [events, setEvents] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newImage, setNewImage] = useState({ url: '', category: 'technical', title: '' });
  
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'user';
  const canManage = ['lead', 'event-lead', 'event lead', 'admin'].includes(userRole);

  // 1. Fetch Events
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(evs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Images for Selected Event
  useEffect(() => {
    if (!selectedEventId) {
      setImages([]);
      return;
    }
    const q = query(
      collection(db, `events/${selectedEventId}/gallery`), 
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedEventId]);

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImage.url.trim() || !canManage || !selectedEventId) return;

    try {
      await addDoc(collection(db, `events/${selectedEventId}/gallery`), {
        ...newImage,
        uploadedBy: auth.currentUser?.email || 'Coordinator',
        createdAt: serverTimestamp()
      });
      setNewImage({ url: '', category: 'technical', title: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding image:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this memory?")) {
      try {
        await deleteDoc(doc(db, `events/${selectedEventId}/gallery`, id));
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
  };

  if (loading) return <div className="loading-gallery-state">Syncing operational archives...</div>;

  return (
    <div className="gallery-container fade-in">
      <header className="gallery-header-premium">
        <div className="header-left-gallery">
           <div className="gallery-breadcrumb">
             {selectedEventId ? (
               <button className="btn-back-gallery" onClick={() => setSelectedEventId(null)}>
                 <ChevronLeft size={18} />
                 <span>Back to Events</span>
               </button>
             ) : (
               <h1>Event Retrospective</h1>
             )}
           </div>
           <h2>{selectedEventId ? events.find(e => e.id === selectedEventId)?.eventName : 'Platform-Wide Missions'}</h2>
        </div>
        {selectedEventId && canManage && (
          <button className="btn-add-memory-premium" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Archive Memory
          </button>
        )}
      </header>

      {!selectedEventId ? (
        <div className="events-gallery-grid">
           {events.map((ev, idx) => (
             <div key={ev.id} className="event-gallery-card card-glow" onClick={() => setSelectedEventId(ev.id)}>
                <div className="event-gallery-img-header">
                   <img src={`https://images.unsplash.com/photo-${idx % 2 === 0 ? '1464822759023-fed622ff2c3b' : '1501785888041-af3ef285b470'}?auto=format&fit=crop&w=600&q=80`} alt="Event Thumb" />
                   <div className="event-gallery-badge">{ev.eventType}</div>
                </div>
                <div className="event-card-content">
                  <div className="event-card-top">
                    <div className="event-icon-box-mini">
                      {ev.eventName?.charAt(0) || 'E'}
                    </div>
                  </div>
                  <h3 className="black-text">{ev.eventName}</h3>
                  <p>{ev.venue?.replace('_', ' ')} • {ev.date}</p>
                </div>
                <div className="card-footer-action">
                   <span>View Mission Gallery</span>
                   <Plus size={16} />
                </div>
             </div>
           ))}
           {events.length === 0 && <p className="empty-msg">No events found to showcase.</p>}
        </div>
      ) : (
        <div className="gallery-masonry-grid">
          {images.map(img => (
            <div key={img.id} className="gallery-item-premium glass-card">
              <div className="img-aspect-wrapper" onClick={() => setSelectedImage(img)}>
                 <img src={img.url} alt={img.title || 'Event Image'} />
                 <div className="img-hover-overlay">
                    <Maximize2 size={24} color="white" />
                 </div>
              </div>
              <div className="gallery-item-details">
                 <div className="item-top-row">
                    <span className={`cat-pill pill-${img.category}`}>{img.category}</span>
                    {canManage && (
                      <button className="btn-trash-mini-premium" onClick={() => handleDelete(img.id)}>
                         <Trash2 size={14} />
                      </button>
                    )}
                 </div>
                 <h3 className="not-bold">{img.title || 'Mission Snapshot'}</h3>
                 <span className="uploader-meta">By {img.uploadedBy}</span>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="empty-gallery-view">
               <div className="empty-icon-box"><ImageIcon size={40} /></div>
               <p>No memories captured for this mission yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal-overlay-gallery" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card-gallery-premium scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-gallery">
               <div className="header-icon-gallery"><ImageIcon size={20} /></div>
               <h2>Archive Memory</h2>
               <button className="btn-close-gallery-modern" onClick={() => setIsModalOpen(false)}>
                 <X size={20} />
               </button>
            </div>
            <form onSubmit={handleAddImage} className="gallery-upload-form">
               <div className="form-input-modern-gallery">
                  <label>Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    value={newImage.url}
                    onChange={e => setNewImage({...newImage, url: e.target.value})}
                    required
                  />
               </div>
               <div className="form-input-modern-gallery">
                  <label>Mission Summary</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stage Setup" 
                    value={newImage.title}
                    onChange={e => setNewImage({...newImage, title: e.target.value})}
                    required
                  />
               </div>
               <div className="form-input-modern-gallery">
                  <label>Category</label>
                  <div className="category-selection-grid">
                    {['technical', 'cultural', 'award', 'workflow'].map(cat => (
                      <button 
                        key={cat}
                        type="button"
                        className={`cat-select-btn ${newImage.category === cat ? 'active' : ''}`}
                        onClick={() => setNewImage({...newImage, category: cat})}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
               <button type="submit" className="btn-archive-submit">Pin to Gallery</button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="gallery-lightbox-overlay" onClick={() => setSelectedImage(null)}>
           <button className="btn-close-lightbox-gallery" onClick={() => setSelectedImage(null)}>
             <X size={32} />
           </button>
           <div className="lightbox-frame scale-in" onClick={e => e.stopPropagation()}>
              <img src={selectedImage.url} alt={selectedImage.title} />
              <div className="lightbox-footer-glass">
                 <h2>{selectedImage.title}</h2>
                 <p>{selectedImage.category.toUpperCase()} ENTRY</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
