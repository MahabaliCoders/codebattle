import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { getDoc, doc } from 'firebase/firestore';

const FirebaseTester = () => {
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        const test = async () => {
            try {
                console.log('Testing Firebase initialization...');
                console.log('Auth:', auth);
                console.log('App ID:', auth.app.options.appId);
                
                // Try a simple Firestore read
                const testDoc = await getDoc(doc(db, '_test_connection_', '1'));
                setStatus('Firebase initialized & Firestore Pinged (Ready)');
            } catch (err) {
                console.error('Firebase Test Error:', err);
                setStatus('Error: ' + err.code + ' - ' + err.message);
            }
        };
        test();
    }, []);

    return (
        <div style={{
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            background: 'white', 
            padding: '10px', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            zIndex: 9999,
            fontSize: '12px',
            color: '#333'
        }}>
            <strong>Firebase Status:</strong> {status}
        </div>
    );
};

export default FirebaseTester;
