import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text as KonvaText, Transformer, Image as KonvaImage, Circle } from 'react-konva';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import useImage from 'use-image';
import { 
  LayoutTemplate, Image as ImageIcon, Type, Sparkles, Upload, Wrench, 
  FolderPlus, Grid3X3, Copy, PlusSquare, ZoomIn, ZoomOut, StickyNote, Activity,
  ChevronLeft, AlignLeft, SendToBack, BringToFront, Trash2, Download, Bold, Palette, LayoutGrid, Star, Sparkle, FileText
} from 'lucide-react';
import './PosterStudio.css';

// ----------------------------------------------------
// CANVAS COMPONENTS
// ----------------------------------------------------

const URLImage = ({ shapeProps, isSelected, onSelect, onChange, onContextMenu }) => {
  const [img] = useImage(shapeProps.url, 'anonymous');
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img} onClick={onSelect} onTap={onSelect} onContextMenu={(e) => onContextMenu(e, shapeProps.id)}
        ref={shapeRef} {...shapeProps} draggable
        onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...shapeProps, x: node.x(), y: node.y(),
            width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY), rotation: node.rotation()
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </React.Fragment>
  );
};

const EditableText = ({ shapeProps, isSelected, onSelect, onChange, onContextMenu, onDoubleClick }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaText
        onClick={onSelect} onTap={onSelect}
        onDblClick={(e) => onDoubleClick(e, shapeProps.id)} onContextMenu={(e) => onContextMenu(e, shapeProps.id)}
        ref={shapeRef} {...shapeProps} draggable
        onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...shapeProps, x: node.x(), y: node.y(),
            width: Math.max(node.width() * scaleX), fontSize: node.fontSize() * scaleY, rotation: node.rotation()
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </React.Fragment>
  );
};

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, onContextMenu }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect} onTap={onSelect} onContextMenu={(e) => onContextMenu(e, shapeProps.id)}
        ref={shapeRef} {...shapeProps} draggable
        onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...shapeProps, x: node.x(), y: node.y(),
            width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY), rotation: node.rotation()
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </React.Fragment>
  );
};

const CircleShape = ({ shapeProps, isSelected, onSelect, onChange, onContextMenu }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Circle
        onClick={onSelect} onTap={onSelect} onContextMenu={(e) => onContextMenu(e, shapeProps.id)}
        ref={shapeRef} {...shapeProps} draggable
        onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({
            ...shapeProps, x: node.x(), y: node.y(),
            radius: Math.max(5, node.radius() * Math.max(scaleX, scaleY))
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </React.Fragment>
  );
};


// ----------------------------------------------------
// SMART TEMPLATES DATA
// ----------------------------------------------------
const templateLibrary = [
  {
    id: 'tpl-tech', name: 'Cyber Symposium', category: 'Tech', color: '#0f172a',
    annotations: [
      { id: 'bg1', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#0a0a0a', isBackground: true },
      { id: 'r1', type: 'Rect', x: 400, y: 0, width: 400, height: 600, fill: '#1d4ed8', opacity: 0.15 },
      { id: 't1', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 50, y: 100, fontSize: 60, fill: '#3b82f6', fontStyle: 'bold', fontFamily: 'sans-serif' },
      { id: 't2', type: 'Text', text: 'Future of Tech Innovation', x: 50, y: 180, fontSize: 24, fill: '#94a3b8', fontFamily: 'sans-serif' },
      { id: 't3', type: 'Text', text: '📅 {{DATE}}', placeholder: true, x: 50, y: 480, fontSize: 22, fill: '#ffffff', fontFamily: 'sans-serif' },
      { id: 't4', type: 'Text', text: '📍 {{VENUE}}', placeholder: true, x: 50, y: 520, fontSize: 22, fill: '#ffffff', fontFamily: 'sans-serif' }
    ]
  },
  {
    id: 'tpl-cult', name: 'Rhythm & Soul', category: 'Cultural', color: '#be185d',
    annotations: [
      { id: 'bg1', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#fff1f2', isBackground: true },
      { id: 'r1', type: 'Rect', x: 80, y: 450, width: 640, height: 80, fill: '#fbcfe8', cornerRadius: 10 },
      { id: 't1', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 80, y: 120, fontSize: 56, fill: '#be185d', fontStyle: 'bold', fontFamily: 'sans-serif' },
      { id: 't2', type: 'Text', text: 'Annual Arts & Culture Festival', x: 85, y: 200, fontSize: 22, fill: '#f43f5e', fontFamily: 'sans-serif' },
      { id: 't3', type: 'Text', text: '{{DATE}} | {{VENUE}}', placeholder: true, x: 120, y: 475, fontSize: 24, fill: '#831843', fontStyle: 'bold', fontFamily: 'sans-serif' }
    ]
  },
  {
    id: 'tpl-sports', name: 'Athletics Meet', category: 'Sports', color: '#f59e0b',
    annotations: [
      { id: 'bg1', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#fffbeb', isBackground: true },
      { id: 't1', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 100, y: 100, fontSize: 72, fill: '#d97706', fontStyle: 'italic bold', fontFamily: 'sans-serif' },
      { id: 't2', type: 'Text', text: 'PUSH YOUR LIMITS', x: 105, y: 180, fontSize: 24, fill: '#000000', fontStyle: 'bold', fontFamily: 'sans-serif', letterSpacing: 4 },
      { id: 't3', type: 'Text', text: '📅 {{DATE}}\n📍 {{VENUE}}', placeholder: true, x: 100, y: 400, fontSize: 32, fill: '#b45309', fontFamily: 'sans-serif', fontStyle: 'bold' }
    ]
  },
  {
    id: 'tpl-workshop', name: 'Design Masterclass', category: 'Workshop', color: '#10b981',
    annotations: [
      { id: 'bg1', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#ffffff', isBackground: true },
      { id: 'r1', type: 'Rect', x: 40, y: 40, width: 220, height: 520, fill: '#ecfdf5', cornerRadius: 16 },
      { id: 't1', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 300, y: 120, fontSize: 60, fill: '#047857', fontStyle: 'bold', fontFamily: 'sans-serif' },
      { id: 't2', type: 'Text', text: 'Learn from industry experts.', x: 305, y: 240, fontSize: 22, fill: '#4b5563', fontFamily: 'sans-serif' },
      { id: 't3', type: 'Text', text: '{{DATE}} • {{VENUE}}', placeholder: true, x: 305, y: 480, fontSize: 18, fill: '#065f46', fontFamily: 'sans-serif', fontStyle: 'bold' }
    ]
  },
  {
    id: 'tpl-seminar', name: 'Leadership Summit', category: 'Seminar', color: '#6366f1',
    annotations: [
      { id: 'bg1', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#eef2ff', isBackground: true },
      { id: 't1', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 60, y: 140, fontSize: 50, fill: '#4338ca', fontStyle: 'bold', fontFamily: 'sans-serif' },
      { id: 't3', type: 'Text', text: '{{DATE}} | {{VENUE}}', placeholder: true, x: 60, y: 400, fontSize: 20, fill: '#312e81', fontFamily: 'sans-serif' }
    ]
  },
  {
    id: 'tpl-gaming', name: 'Esports Tournament', category: 'Tech', color: '#ff0055',
    annotations: [
      { id: 'bg-game', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#09090b', isBackground: true },
      { id: 'c1-game', type: 'Circle', x: 400, y: 300, radius: 250, fill: '#e11d48', opacity: 0.2 },
      { id: 't1-game', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 100, y: 120, fontSize: 68, fill: '#f43f5e', fontStyle: 'italic bold', fontFamily: 'sans-serif' },
      { id: 't2-game', type: 'Text', text: 'BATTLE FOR GLORY', x: 105, y: 220, fontSize: 28, fill: '#ffffff', fontStyle: 'bold', fontFamily: 'sans-serif', letterSpacing: 2 },
      { id: 't3-game', type: 'Text', text: '📅 {{DATE}} | 📍 {{VENUE}}', placeholder: true, x: 105, y: 450, fontSize: 22, fill: '#fb7185', fontFamily: 'sans-serif' }
    ]
  },
  {
    id: 'tpl-art', name: 'Art Exhibition', category: 'Cultural', color: '#8b5cf6',
    annotations: [
      { id: 'bg-art', type: 'Rect', x: 0, y: 0, width: 800, height: 600, fill: '#f3f4f6', isBackground: true },
      { id: 'c1-art', type: 'Circle', x: 600, y: 100, radius: 150, fill: '#c4b5fd', opacity: 0.8 },
      { id: 'c2-art', type: 'Circle', x: 200, y: 500, radius: 200, fill: '#fbcfe8', opacity: 0.6 },
      { id: 't1-art', type: 'Text', text: '{{EVENT_NAME}}', placeholder: true, x: 60, y: 200, fontSize: 64, fill: '#4c1d95', fontStyle: 'bold', fontFamily: 'sans-serif' },
      { id: 't2-art', type: 'Text', text: 'A Showcase of Creative Minds', x: 65, y: 280, fontSize: 24, fill: '#6d28d9', fontFamily: 'sans-serif' },
      { id: 't3-art', type: 'Text', text: 'Join us on {{DATE}} at {{VENUE}}', placeholder: true, x: 65, y: 400, fontSize: 20, fill: '#4b5563', fontFamily: 'sans-serif' }
    ]
  }
];


// ----------------------------------------------------
// MAIN APPLICATION
// ----------------------------------------------------

const PosterStudio = () => {
  const [pages, setPages] = useState([{ id: 'page-1', annotations: [] }]);
  const [selectedId, selectShape] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('templates');
  const [contextMenu, setContextMenu] = useState(null);
  const [prompt, setPrompt] = useState('');
  
  // Advanced Template State
  const [templateFilter, setTemplateFilter] = useState('All');
  const [favorites, setFavorites] = useState([]);
  
  // Global Color Theme Override
  const [activeThemeColor, setActiveThemeColor] = useState('#000000');

  // Text Editor State
  const [editingTextId, setEditingTextId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0, width: 100, height: 30 });
  const [liveEvents, setLiveEvents] = useState([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      setLiveEvents(snap.docs.map(doc => doc.data()));
    });
    return unsub;
  }, []);
  
  const stageRefs = useRef({});
  const fileInputRef = useRef(null);

  // Keyboard Delete Binding
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId && !editingTextId) {
        deleteSelectedItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingTextId]);

  // Drag Drop Engine
  const handleDragStart = (e, type, payload) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('payload', JSON.stringify(payload));
  };
  const handleDrop = (e, pageId) => {
    e.preventDefault();
    const stage = stageRefs.current[pageId];
    if (!stage) return;
    stage.setPointersPositions(e);
    const pos = stage.getPointerPosition();
    const type = e.dataTransfer.getData('type');
    if (!type) return;
    const payload = JSON.parse(e.dataTransfer.getData('payload') || '{}');

    const newObject = {
      id: Date.now().toString(), type, ...payload, x: pos.x / zoom, y: pos.y / zoom,
    };
    setPages(prev => prev.map(page => page.id === pageId ? { ...page, annotations: [...page.annotations, newObject] } : page));
    selectShape(newObject.id);
  };

  const handleItemChange = (pageId, id, newProps) => {
    setPages(prev => prev.map(page => {
      if (page.id === pageId) {
        const index = page.annotations.findIndex(a => a.id === id);
        const newArr = [...page.annotations];
        newArr[index] = newProps;
        return { ...page, annotations: newArr };
      }
      return page;
    }));
  };

  const handleCanvasClick = (e) => {
    if (editingTextId) finishTextEdit();
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'bgRect';
    if (clickedOnEmpty) selectShape(null);
    setContextMenu(null);
  };

  const handleContextMenu = (e, id) => {
    e.evt.preventDefault(); selectShape(id);
    const stage = e.target.getStage(); const pos = stage.getPointerPosition();
    setContextMenu({ x: pos.x, y: pos.y, id });
  };

  const modifyLayer = (direction) => {
    if (!contextMenu && !selectedId) return;
    const targetId = contextMenu ? contextMenu.id : selectedId;
    setPages(prev => prev.map(page => {
      const idx = page.annotations.findIndex(a => a.id === targetId);
      if (idx !== -1) {
        const item = page.annotations[idx]; const newArr = [...page.annotations];
        newArr.splice(idx, 1);
        direction === 'front' ? newArr.push(item) : newArr.unshift(item);
        return { ...page, annotations: newArr };
      }
      return page;
    }));
    setContextMenu(null);
  };

  const deleteSelectedItem = () => {
    const targetId = contextMenu ? contextMenu.id : selectedId;
    if (!targetId) return;
    setPages(prev => prev.map(page => ({
      ...page, annotations: page.annotations.filter(a => a.id !== targetId)
    })));
    selectShape(null); setContextMenu(null);
  };

  // HTML Text Editing Wrapper Logic
  const handleDoubleClickText = (e, id) => {
    const textNode = e.target;
    const stage = textNode.getStage();
    const containerPos = stage.container().getBoundingClientRect();
    const absPos = textNode.getAbsolutePosition();
    
    setTextInputPos({
      x: containerPos.left + absPos.x, y: containerPos.top + absPos.y,
      width: textNode.width() * textNode.scaleX() * zoom, height: textNode.height() * textNode.scaleY() * zoom,
      fontSize: textNode.fontSize() * textNode.scaleY() * zoom
    });
    
    const page = pages.find(p => p.annotations.some(a => a.id === id));
    if (page) {
      const annot = page.annotations.find(a => a.id === id);
      setEditValue(annot.text); setEditingTextId(id);
      handleItemChange(page.id, id, { ...annot, opacity: 0 }); // hide konva text temporarily
    }
  };

  const finishTextEdit = () => {
    if (!editingTextId) return;
    setPages(prev => prev.map(page => {
      const idx = page.annotations.findIndex(a => a.id === editingTextId);
      if (idx !== -1) {
        const newArr = [...page.annotations];
        newArr[idx] = { ...newArr[idx], text: editValue, opacity: 1 };
        return { ...page, annotations: newArr };
      }
      return page;
    }));
    setEditingTextId(null);
  };

  // Smart Templating System (AUTO-FILL DATA)
  const loadTemplate = (template) => {
    const evt = liveEvents.length > 0 ? liveEvents[liveEvents.length - 1] : { eventName: 'Sample Event', date: 'TBA', venue: 'TBA' };

    const newAnns = template.annotations.map(a => {
      let mergedData = { ...a, id: a.id + Date.now() };
      if (mergedData.placeholder) {
        mergedData.text = mergedData.text
          .replace('{{EVENT_NAME}}', evt.eventName || 'Sample Event')
          .replace('{{DATE}}', evt.date || 'TBA')
          .replace('{{VENUE}}', evt.venue || 'TBA');
      }
      return mergedData;
    });

    setPages(prev => {
      const newPages = [...prev];
      newPages[0].annotations = newAnns;
      return newPages;
    });

    setActiveThemeColor(template.color);
    setActiveMenu('elements'); // Shift to edit view
    selectShape(null);
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    if(favorites.includes(id)) {
      setFavorites(favorites.filter(fid => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const applyColorTheme = (color) => {
    setPages(prev => prev.map(page => {
      const newAnnots = page.annotations.map(a => {
        if(a.isBackground && a.type === 'Rect') return { ...a, fill: color };
        return a;
      });
      return { ...page, annotations: newAnnots };
    }));
  };

  const handleAI = () => {
    if (prompt.toLowerCase().includes('generate')) {
       loadTemplate(templateLibrary[0]); // Demo load a template based on prompt
       setPrompt('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newImg = { id: Date.now().toString(), type: 'Image', url, x: 100, y: 100, width: 300, height: 200 };
    setPages(prev => {
      const newP = [...prev]; newP[0].annotations.push(newImg); return newP;
    });
    e.target.value = '';
  };

  const savePosterPNG = () => {
    const stage = stageRefs.current[pages[0].id];
    if (stage) {
      const uri = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `PremiumPoster_${Date.now()}.png`; link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
  };

  const savePosterPDF = () => {
    const stage = stageRefs.current[pages[0].id];
    if (stage) {
      import('jspdf').then(({ jsPDF }) => {
        const uri = stage.toDataURL({ pixelRatio: 2 });
        const pdf = new jsPDF('l', 'px', [800, 600]);
        pdf.addImage(uri, 'PNG', 0, 0, 800, 600);
        pdf.save(`Poster_HD_${Date.now()}.pdf`);
      });
    }
  };

  const savePosterJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pages));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr); dlAnchorElem.setAttribute("download", `Project_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const addPage = () => setPages(prev => [...prev, { id: `page-${Date.now()}`, annotations: [] }]);
  const duplicatePage = (page) => {
    const clonedAnnotations = page.annotations.map(a => ({ ...a, id: Date.now().toString() + Math.random() }));
    setPages(prev => [...prev, { id: `page-${Date.now()}`, annotations: clonedAnnotations }]);
  };

  const selectedNodeInfo = pages.flatMap(p => p.annotations).find(a => a.id === selectedId);
  const isSelectedText = selectedNodeInfo?.type === 'Text';

  const updateSelectedNode = (key, value) => {
    if (!selectedId) return;
    setPages(prev => prev.map(page => {
      const idx = page.annotations.findIndex(a => a.id === selectedId);
      if (idx !== -1) {
        const newArr = [...page.annotations];
        newArr[idx] = { ...newArr[idx], [key]: value };
        return { ...page, annotations: newArr };
      }
      return page;
    }));
  };

  const filteredTemplates = templateFilter === 'All' 
    ? templateLibrary 
    : templateLibrary.filter(t => t.category === templateFilter);

  return (
    <div className="studio-canvas-container fade-in">
      
      {editingTextId && (
        <textarea
          className="html-text-editor shadow-pulse"
          value={editValue} onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Escape') finishTextEdit(); }}
          onBlur={finishTextEdit} autoFocus
          style={{
            position: 'absolute', top: textInputPos.y, left: textInputPos.x,
            width: Math.max(200, textInputPos.width + 40), height: Math.max(50, textInputPos.height + 40),
            fontSize: textInputPos.fontSize, lineHeight: 1.2, margin: 0, padding: 0, border: 'none', outline: 'none', background: 'transparent',
            color: selectedNodeInfo?.fill || '#000', fontFamily: selectedNodeInfo?.fontFamily || 'sans-serif',
            fontWeight: selectedNodeInfo?.fontStyle?.includes('bold') ? 'bold' : 'normal',
            zIndex: 1000, resize: 'none', overflow: 'hidden'
          }}
        />
      )}

      {/* Floating Canvas Top Toolbar */}
      {isSelectedText && !editingTextId && (
        <div className="text-format-toolbar pop-in">
           <button title="Change Color" onClick={() => updateSelectedNode('fill', selectedNodeInfo.fill === '#000000' ? '#007aff' : '#000000')}>
             <Palette size={16}/>
           </button>
           <button title="Toggle Bold" onClick={() => updateSelectedNode('fontStyle', selectedNodeInfo.fontStyle === 'bold' ? 'normal' : 'bold')}>
             <Bold size={16}/>
           </button>
           <div className="divider" />
           <button onClick={() => updateSelectedNode('fontSize', (selectedNodeInfo.fontSize || 24) + 4)}><ZoomIn size={16}/></button>
           <button onClick={() => updateSelectedNode('fontSize', Math.max(12, (selectedNodeInfo.fontSize || 24) - 4))}><ZoomOut size={16}/></button>
           <div className="divider" />
           <button onClick={deleteSelectedItem}><Trash2 size={16} color="#ff3b30"/></button>
        </div>
      )}

      {/* Primary Narrow Sidebar */}
      <aside className="primary-sidebar-tools">
        <div className={`tool-icon-btn ${activeMenu === 'templates' ? 'active' : ''}`} onClick={() => setActiveMenu('templates')}><LayoutTemplate size={24} /><span>Templates</span></div>
        <div className={`tool-icon-btn ${activeMenu === 'elements' ? 'active' : ''}`} onClick={() => setActiveMenu('elements')}><Sparkles size={24} /><span>Elements</span></div>
        <div className={`tool-icon-btn ${activeMenu === 'text' ? 'active' : ''}`} onClick={() => setActiveMenu('text')}><Type size={24} /><span>Text</span></div>
        <div className={`tool-icon-btn ${activeMenu === 'uploads' ? 'active' : ''}`} onClick={() => setActiveMenu('uploads')}><Upload size={24} /><span>Uploads</span></div>
      </aside>

      {/* Secondary Wide Sidebar */}
      <aside className={`secondary-sidebar-panel ${panelOpen ? 'open' : 'closed'}`}>
        <div className="panel-header">
           <div className="ai-wrap">
             <input type="text" placeholder="Generate basic layout..." value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAI()} />
             <button className="ai-gen-btn" onClick={handleAI}><Sparkle size={14} style={{marginRight: 6, display: 'inline-block'}} />Generate Design</button>
           </div>
        </div>
        <div className="panel-scroll-grid">
           
           {/* TEMPLATES ADVANCED ENGINE */}
           {activeMenu === 'templates' && (
             <React.Fragment>
               <div className="template-filters">
                 {['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Seminar'].map(cat => (
                   <button key={cat} className={`filter-pill pop-in ${templateFilter === cat ? 'active' : ''}`} onClick={() => setTemplateFilter(cat)}>{cat}</button>
                 ))}
               </div>
               
               <h4>Smart Layouts</h4>
               <p className="hint-text">1-Click Auto-fills with your Event Data.</p>
               <div className="shapes-grid one-col">
                  {filteredTemplates.map((tpl, index) => (
                    <div key={tpl.id} className="template-card-advanced group pop-in" style={{borderLeftColor: tpl.color, animationDelay: `${index * 0.05}s`}}>
                       <div className="template-info">
                         <strong>{tpl.name}</strong>
                         <span>{tpl.category}</span>
                       </div>
                       <button className="template-fav-btn" onClick={(e) => toggleFavorite(e, tpl.id)}>
                         <Star size={18} fill={favorites.includes(tpl.id) ? "#f59e0b" : "transparent"} color={favorites.includes(tpl.id) ? "#f59e0b" : "#86868b"} />
                       </button>
                       <div className="template-hover-action" onClick={() => loadTemplate(tpl)}>
                         <span>Load Template</span>
                       </div>
                    </div>
                  ))}
               </div>
             </React.Fragment>
           )}

           {activeMenu === 'elements' && (
             <React.Fragment>
               <h4>Quick Themes</h4>
               <div className="theme-circles">
                 <button className="theme-dot" style={{background: '#ffffff', border: '1px solid #d2d2d7'}} onClick={() => applyColorTheme('#ffffff')}></button>
                 <button className="theme-dot" style={{background: '#0a0a0a'}} onClick={() => applyColorTheme('#0a0a0a')}></button>
                 <button className="theme-dot" style={{background: '#eef2ff'}} onClick={() => applyColorTheme('#eef2ff')}></button>
                 <button className="theme-dot" style={{background: '#fbcfe8'}} onClick={() => applyColorTheme('#fbcfe8')}></button>
               </div>

               <h4 style={{marginTop: 24}}>Basic Shapes (Drag)</h4>
               <div className="shapes-grid roll-in-anim">
                  <div className="draggable-item rect-preview" draggable onDragStart={(e) => handleDragStart(e, 'Rect', { width: 100, height: 100, fill: '#007aff', cornerRadius: 8 })}></div>
                  <div className="draggable-item rect-preview" style={{backgroundColor: '#ff3b30', borderRadius: '50%'}} draggable onDragStart={(e) => handleDragStart(e, 'Circle', { radius: 50, fill: '#ff3b30' })}></div>
                  <div className="draggable-item rect-preview transparent" draggable onDragStart={(e) => handleDragStart(e, 'Rect', { width: 100, height: 100, fill: 'transparent', stroke: '#000', strokeWidth: 4, cornerRadius: 0 })}></div>
                  <div className="draggable-item rect-preview" style={{background: 'linear-gradient(45deg, #f59e0b, #ec4899)'}} draggable onDragStart={(e) => handleDragStart(e, 'Rect', { width: 120, height: 120, fillLinearGradientStartPoint: {x: 0, y: 0}, fillLinearGradientEndPoint: {x: 120, y: 120}, fillLinearGradientColorStops: [0, '#f59e0b', 1, '#ec4899'], cornerRadius: 16 })}></div>
               </div>
             </React.Fragment>
           )}

           {activeMenu === 'text' && (
             <React.Fragment>
               <h4>Typography (Drag)</h4>
               <p className="hint-text">Double-click text on the canvas to edit.</p>
               <div className="shapes-grid one-col">
                  <div className="draggable-item text-item-large" draggable onDragStart={(e) => handleDragStart(e, 'Text', { text: 'Add a heading', fontSize: 60, fontFamily: 'sans-serif', fill: '#000', fontStyle: 'bold' })}>Add a heading</div>
                  <div className="draggable-item text-item-sub" draggable onDragStart={(e) => handleDragStart(e, 'Text', { text: 'Add a subheading', fontSize: 30, fontFamily: 'sans-serif', fill: '#000' })}>Add a subheading</div>
                  <div className="draggable-item text-item-body" draggable onDragStart={(e) => handleDragStart(e, 'Text', { text: 'Double click to edit.', fontSize: 18, fontFamily: 'sans-serif', fill: '#000' })}>Add body text</div>
               </div>
             </React.Fragment>
           )}

           {activeMenu === 'uploads' && (
             <React.Fragment>
               <h4>Your Assets</h4>
               <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
               <button className="generic-upload-btn" onClick={() => fileInputRef.current.click()}>
                 <Upload size={16}/> Upload Local Image
               </button>
               
               <h4 style={{marginTop: 32}}>Unsplash Stock (Drag)</h4>
               <div className="shapes-grid">
                  <div className="draggable-item img-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150)'}} draggable onDragStart={(e) => handleDragStart(e, 'Image', { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80', width: 250, height: 160 })}></div>
                  <div className="draggable-item img-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?w=150)'}} draggable onDragStart={(e) => handleDragStart(e, 'Image', { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80', width: 250, height: 160 })}></div>
               </div>
             </React.Fragment>
           )}
        </div>
        
        <button className="toggle-panel-btn" onClick={() => setPanelOpen(!panelOpen)}>
           <ChevronLeft size={16} className={!panelOpen ? 'flip-icon' : ''} />
        </button>
      </aside>

      {/* Main Apple Workspace Canvas */}
      <main className="workspace-main-area" onClick={() => contextMenu && setContextMenu(null)}>
         <div className="workspace-top-bar">
            <strong>Poster Designer</strong>
            <div className="export-actions">
              <button className="apple-secondary-btn" onClick={() => loadTemplate(filteredTemplates[0])}><LayoutGrid size={16}/> Shuffle Layout</button>
              <div className="divider" style={{height: 18, alignSelf: 'center'}} />
              <button className="apple-secondary-btn" onClick={savePosterJSON}><FolderPlus size={16}/> Save Project</button>
              <button className="apple-secondary-btn" onClick={savePosterPNG}><Download size={16}/> PNG</button>
              <button className="apple-primary-btn" onClick={savePosterPDF}><FileText size={16}/> PDF</button>
            </div>
         </div>

         <div className="canvas-scroll-view">
            {pages.map((page, pIdx) => (
              <div 
                key={page.id} 
                className="canvas-artboard-wrapper"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, page.id)}
              >
                 <div className="floating-canvas-controls">
                    <button className="canvas-tool-btn" title="Add Page Below" onClick={addPage}><PlusSquare size={16}/></button>
                    <button className="canvas-tool-btn" title="Duplicate Page" onClick={() => duplicatePage(page)}><Copy size={16}/></button>
                 </div>
                 
                 <div className="actual-konva-container">
                   <Stage
                     width={800 * zoom} height={600 * zoom}
                     scaleX={zoom} scaleY={zoom}
                     onMouseDown={handleCanvasClick} onTouchStart={handleCanvasClick}
                     ref={(node) => { stageRefs.current[page.id] = node; }}
                   >
                     <Layer>
                       <Rect name="bgRect" x={0} y={0} width={800} height={600} fill={activeThemeColor === '#000000' ? '#ffffff' : '#ffffff'} cornerRadius={12} shadowBlur={2} shadowColor="rgba(0,0,0,0.05)" />
                       
                       {page.annotations.map(item => {
                         const isSelected = item.id === selectedId;
                         if (item.type === 'Rect') return <Rectangle key={item.id} shapeProps={item} isSelected={isSelected} onSelect={() => selectShape(item.id)} onChange={newProps => handleItemChange(page.id, item.id, newProps)} onContextMenu={handleContextMenu} />;
                         if (item.type === 'Circle') return <CircleShape key={item.id} shapeProps={item} isSelected={isSelected} onSelect={() => selectShape(item.id)} onChange={newProps => handleItemChange(page.id, item.id, newProps)} onContextMenu={handleContextMenu} />;
                         if (item.type === 'Text') return <EditableText key={item.id} shapeProps={item} isSelected={isSelected} onSelect={() => selectShape(item.id)} onChange={newProps => handleItemChange(page.id, item.id, newProps)} onContextMenu={handleContextMenu} onDoubleClick={handleDoubleClickText} />;
                         if (item.type === 'Image') return <URLImage key={item.id} shapeProps={item} isSelected={isSelected} onSelect={() => selectShape(item.id)} onChange={newProps => handleItemChange(page.id, item.id, newProps)} onContextMenu={handleContextMenu} />;
                         return null;
                       })}
                     </Layer>
                   </Stage>
                 </div>
             </div>
            ))}

            <button className="big-add-page-btn" onClick={addPage}>
               <PlusSquare size={18} /> Add Page
            </button>
         </div>

         {contextMenu && (
           <div className="apple-context-menu" style={{ top: Math.min(contextMenu.y+100, window.innerHeight-150), left: contextMenu.x + 380 }}>
              <button onClick={() => modifyLayer('front')}><BringToFront size={14}/> Bring to Front</button>
              <button onClick={() => modifyLayer('back')}><SendToBack size={14}/> Send to Back</button>
              <div style={{height: 1, background: 'rgba(0,0,0,0.1)', margin: '4px 0'}}></div>
              <button onClick={deleteSelectedItem} style={{color: '#ff3b30'}}><Trash2 size={14}/> Delete</button>
           </div>
         )}
      </main>

      {/* Floating Bottom Footer Toolbar */}
      <footer className="studio-footer-glass">
         <button className="footer-btn"><StickyNote size={16}/> Notes</button>
         <button className="footer-btn"><Activity size={16}/> {prompt ? 'Generation Running...' : '00:00 Timer'}</button>
         
         <div className="zoom-slider-wrap">
           <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}><ZoomOut size={16}/></button>
           <input type="range" min="0.1" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
           <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}><ZoomIn size={16}/></button>
           <span>{Math.round(zoom * 100)}%</span>
         </div>
      </footer>
    </div>
  );
};

export default PosterStudio;
