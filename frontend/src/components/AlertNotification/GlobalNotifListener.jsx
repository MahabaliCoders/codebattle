import { useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Info, Bell, X } from 'lucide-react';
import './AlertNotification.css';

const GlobalNotifListener = () => {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Only query recent notifications so users don't get spammed by old ones on refresh
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad.current) {
         isFirstLoad.current = false;
         return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          
          toast.custom((t) => (
            <div className={`custom-glass-toast ${t.visible ? 'toast-slide-in' : 'toast-slide-out'}`}>
              <div className="toast-icon-wrap">
                {notif.type === 'Success' && <CheckCircle size={22} className="toast-icon success" />}
                {notif.type === 'Warning' && <AlertTriangle size={22} className="toast-icon warning" />}
                {notif.type === 'Info' && <Info size={22} className="toast-icon info" />}
                {(!notif.type || notif.type === 'Default') && <Bell size={22} className="toast-icon default" />}
              </div>
              <div className="toast-body">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
              </div>
              <button className="toast-close" onClick={() => toast.dismiss(t.id)}>
                <X size={14} />
              </button>
            </div>
          ), { duration: 6000, id: change.doc.id }); // Using doc ID prevents duplicate toasts
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default GlobalNotifListener;
