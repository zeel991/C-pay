import React, { useState } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import QRScanner from './QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { aptosClient } from '@/utils/aptosClient';
import { transferAPT } from '@/entry-functions/transferAPT';
import { QrCode, Send, CheckCircle, X } from 'lucide-react';

interface PaymentData {
  ma: string;
  a: number;
  memo?: string;
}

const QRPayment: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [isScanning, setIsScanning] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseQRData = (qrData: string): PaymentData | null => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.ma && parsed.a) {
        return {
          ma: parsed.ma,
          a: parseFloat(parsed.a),
          memo: parsed.memo || ''
        };
      }
    } catch {
      try {
        const url = new URL(qrData);
        const ma = url.searchParams.get('recipient') || url.searchParams.get('to');
        const a = url.searchParams.get('amount');
        const memo = url.searchParams.get('memo') || url.searchParams.get('message');
        if (ma && a) {
          return {
            ma,
            a: parseFloat(a),
            memo: memo || ''
          };
        }
      } catch {
        const parts = qrData.split(':');
        if (parts.length >= 2) {
          return {
            ma: parts[0],
            a: parseFloat(parts[1]),
            memo: parts[2] || ''
          };
        }
      }
    }
    return null;
  };

  const handleScanResult = (data: string) => {
    const parsed = parseQRData(data);
    if (parsed) {
      setPaymentData(parsed);
      setIsScanning(false);
      toast({
        title: "QR Code Scanned",
        description: `Payment request for ${parsed.a} APT to ${parsed.ma.slice(0, 10)}...`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "The QR code doesn't contain valid payment information.",
      });
    }
  };

  const handlePayment = async () => {
    if (!account || !paymentData) return;
    setIsProcessing(true);
    try {
      const committedTransaction = await signAndSubmitTransaction(
        transferAPT({
          to: paymentData.ma,
          amount: Math.pow(10, 8) * paymentData.a,
        }),
      );
      await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Payment Successful",
        description: `Sent ${paymentData.a} APT to ${paymentData.ma.slice(0, 10)}...`,
      });
      setPaymentData(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Transaction could not be completed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setPaymentData(null);
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  const handleCancel = () => {
    setPaymentData(null);
  };

  return (
    <>
      {/* Main UI cards */}
      <div className={`${isScanning ? 'blur-sm pointer-events-none select-none' : ''} space-y-6`}>
        {!paymentData && !isScanning && (
          <Card className="border border-gray-200 rounded-2xl shadow bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <QrCode className="w-5 h-5" />
                QR Code Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Scan a QR code to quickly send APT payments</p>
              <Button
                onClick={handleStartScan}
                disabled={!account}
                className="w-full bg-black text-white font-medium hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-500 rounded-xl shadow"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentData && !isScanning && (
          <Card className="border border-gray-200 rounded-2xl shadow bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-500">Recipient Address</Label>
                <Input
                  value={paymentData.ma}
                  readOnly
                  className="font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">Amount (APT)</Label>
                <Input
                  value={paymentData.a}
                  readOnly
                  className="font-mono bg-gray-100 border border-gray-300 text-black font-medium rounded-lg"
                />
              </div>
              {paymentData.memo && (
                <div className="space-y-2">
                  <Label className="text-gray-500">Memo</Label>
                  <Input
                    value={paymentData.memo}
                    readOnly
                    className="bg-gray-100 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={!account || isProcessing}
                  className="flex-1 bg-black text-white font-medium hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-500 rounded-xl shadow"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : `Send ${paymentData.a} APT`}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isProcessing}
                  className="rounded-xl border border-gray-400 text-black disabled:text-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scanner overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="relative rounded-2xl border border-gray-200 shadow bg-white max-w-lg w-full p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg text-black font-semibold">Scanning QR Code...</h3>
              <Button
                onClick={handleStopScan}
                size="sm"
                variant="ghost"
                className="text-black hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <QRScanner
              onScanResult={handleScanResult}
              isScanning={isScanning}
              onStartScan={handleStartScan}
              onStopScan={handleStopScan}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default QRPayment;
