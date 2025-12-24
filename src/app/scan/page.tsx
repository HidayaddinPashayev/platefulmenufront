'use client';

import { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter, useSearchParams } from 'next/navigation';
import { startCustomerSession } from '@/lib/api/customer';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleSessionStart = useCallback(async (branchId: number, tableId: number) => {
    setProcessing(true);
    try {
      // Start session
      const session = await startCustomerSession(branchId, tableId);
      
      // Store session info
      localStorage.setItem('customerSession', JSON.stringify(session));
      localStorage.setItem('customerBranchId', String(branchId));
      localStorage.setItem('customerTableId', String(tableId));

      // Redirect
      router.push('/customer/menu');
    } catch (err) {
      console.error('Session start error', err);
      setError('Failed to start session. Please try scanning again.');
      setProcessing(false);
      setScanning(true);
    }
  }, [router]);

  const handleScan = useCallback(async (text: string) => {
    if (!scannerRef.current) return;
    
    // Stop scanning immediately
    await scannerRef.current.stop();
    setScanning(false);

    // Parse QR code
    // Expected formats:
    // 1. URL: http://.../scan?table=1&branch=1
    // 2. Text: "table:1;branch:1"
    
    let tableId = 1;
    let branchId = 1;

    try {
      if (text.includes('table=') && text.includes('branch=')) {
        // It's a URL
        const url = new URL(text);
        tableId = Number(url.searchParams.get('table'));
        branchId = Number(url.searchParams.get('branch'));
      } else if (text.includes('table:')) {
        // It's our custom format
        const parts = text.split(';');
        const tablePart = parts.find(p => p.includes('table:'));
        const branchPart = parts.find(p => p.includes('branch:'));
        
        if (tablePart) tableId = parseInt(tablePart.split(':')[1]);
        if (branchPart) branchId = parseInt(branchPart.split(':')[1]);
      }
      
      await handleSessionStart(branchId, tableId);
    } catch (err) {
      console.error('Scan parse error', err);
      setError('Invalid QR code format.');
      setScanning(true); // Restart scanning
    }
  }, [handleSessionStart]);

  // Check for URL params on mount
  useEffect(() => {
    const tableParam = searchParams.get('table');
    const branchParam = searchParams.get('branch');

    if (tableParam && branchParam) {
      setScanning(false);
      handleSessionStart(Number(branchParam), Number(tableParam));
    }
  }, [searchParams, handleSessionStart]);

  useEffect(() => {
    // Only start scanner if we are in scanning mode and not processing
    if (!scanning || processing) return;

    // Initialize scanner
    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    const startScanning = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleScan(decodedText);
          },
          (errorMessage) => {
            // ignore frame errors
          }
        );
      } catch (err) {
        console.error('Failed to start scanner', err);
        setError('Could not access camera. Please ensure you have granted permission.');
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning, processing, handleScan]);

  const handleSimulate = () => {
    handleSessionStart(1, 1);
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-600 mb-4"></div>
        <p className="text-warm-800 font-medium">Starting your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900">Scan QR Code</h1>
          <p className="text-warm-500 mt-2">Scan the code on your table to order</p>
        </div>

        <div className="card overflow-hidden bg-black relative rounded-2xl shadow-xl">
          <div id="reader" className="w-full h-64 md:h-80"></div>
          <div className="absolute inset-0 pointer-events-none border-2 border-warm-500/50 rounded-2xl"></div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="text-center space-y-4">
          <p className="text-sm text-warm-400">- OR -</p>
          <button 
            onClick={handleSimulate}
            className="btn btn-secondary w-full"
          >
            Simulate Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-50 flex items-center justify-center">Loading...</div>}>
      <ScanContent />
    </Suspense>
  );
}
