import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

// Type definitions for QR Scanner result
interface QRScanResult {
  data: string;
  cornerPoints?: Array<{ x: number; y: number }>;
  [key: string]: any;
}

// Props interface for the QRScanner component
interface QRScannerProps {
  onScanResult: (data: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

// Error type for scan failures
type ScanError = Error | string | any;

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanResult, 
  isScanning, 
  onStartScan, 
  onStopScan 
}) => {
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const qrBoxEl = useRef<HTMLDivElement | null>(null);
  const scanner = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string>('');

  const onScanSuccess = (result: QRScanResult): void => {
    console.log('QR Scanned:', result.data);
    onScanResult(result.data);
  };

  const onScanFail = (err: ScanError): void => {
    console.log('Scan failed:', err);
  };

  useEffect(() => {
    if (isScanning && videoEl.current && !scanner.current) {
      scanner.current = new QrScanner(
        videoEl.current,
        onScanSuccess,
        {
          onDecodeError: onScanFail,
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: qrBoxEl.current || undefined,
        }
      );

      scanner.current
        .start()
        .then(() => setError(''))
        .catch((err: Error) => {
          setError('Camera access denied. Please allow camera permission.');
          console.error('Scanner start error:', err);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current = null;
      }
    };
  }, [isScanning]);

  const handleStartScan = (): void => {
    setError('');
    onStartScan();
  };

  const handleStopScan = (): void => {
    if (scanner.current) {
      scanner.current.stop();
      scanner.current = null;
    }
    onStopScan();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Scan QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Ready to scan a payment QR code</p>
            <Button onClick={handleStartScan} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video 
                ref={videoEl}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div 
                ref={qrBoxEl} 
                className="absolute inset-4 border-2 border-white rounded-lg"
              >
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
              </div>
            </div>
            
            <Button onClick={handleStopScan} variant="outline" className="w-full">
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;