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
        // Stop scanning after successful scan
        html5QrcodeScanner.clear().then(() => {
          onScan(decodedText);
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Just hide the constant read errors unless it's critical
        // setError(errorMessage);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Camera size={20} className="text-blue-500" />
            Scan Attendance QR
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300"></div>
          <p className="text-sm text-gray-500 text-center mt-4">
            Point your camera at the Mess QR Code. It will be scanned automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
