import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      }, 
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        html5QrcodeScanner.clear().then(() => {
          onScan(decodedText);
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Suppress general frame read errors
      }
    );

    scannerRef.current = html5QrcodeScanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[11000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 transition-colors duration-300 animate-scale-up">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
          <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Camera size={16} className="text-indigo-650" />
            Scan Attendance QR
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && <p className="text-rose-500 text-xs text-center">{error}</p>}
          <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            Point your camera at the Mess QR Code. It will be scanned automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
