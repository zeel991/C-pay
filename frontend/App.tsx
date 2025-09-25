import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WalletDetails } from "@/components/WalletDetails";
import { NetworkInfo } from "@/components/NetworkInfo";
import { AccountInfo } from "@/components/AccountInfo";
import { TransferAPT } from "@/components/TransferAPT";
import { MessageBoard } from "@/components/MessageBoard";
import { TopBanner } from "@/components/TopBanner";
import QRPayment from "@/components/QRPayment";
import { WalletSelector } from "@/components/WalletSelector";
import { Wallet, Zap, Shield } from "lucide-react";

function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <TopBanner /> */}
      <Header />
      
      <div className="flex items-center justify-center flex-col px-4 py-8">
        {connected ? (
          <div className="w-full max-w-4xl">
            {/* Main Content Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Transfer Section */}
                  <div className="space-y-4">
                    <TransferAPT />
                  </div>

                  {/* QR Payment Section */}
                  <div className="space-y-4">
                    <QRPayment />
                  </div>
                </div>

                {/* Additional Components (Commented out for now) */}
                <div className="hidden">
                  {/* <WalletDetails /> */}
                  {/* <NetworkInfo /> */}
                  {/* <AccountInfo /> */}
                  {/* <WalletSelector /> */}
                  {/* <MessageBoard /> */}
                </div>
              </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Powered by <span className="text-gray-900 font-medium">Cpay Wallet</span>
              </p>
            </div>
          </div>
        ) : (
          /* Welcome Screen for Disconnected State */
          <div className="w-full max-w-2xl">
            <Card className="bg-white border border-gray-200 shadow-sm">
              {/* Welcome Header */}
              <CardHeader className="text-center p-8 border-b border-gray-100">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-100 rounded-2xl">
                    <Wallet className="w-12 h-12 text-gray-700" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Cpay Wallet
                </CardTitle>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  Simple and secure Aptos transactions
                </p>
              </CardHeader>

              {/* Getting Started Content */}
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Get Started</h2>
                    <p className="text-gray-600">
                      Connect your wallet to start sending APT, scanning QR codes, and more.
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="p-2 bg-white border border-gray-200 rounded-lg w-fit mx-auto mb-3">
                        <Zap className="w-5 h-5 text-gray-700" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Instant Transfers</h3>
                      <p className="text-sm text-gray-600">Send APT quickly and easily</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="p-2 bg-white border border-gray-200 rounded-lg w-fit mx-auto mb-3">
                        <Wallet className="w-5 h-5 text-gray-700" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">QR Payments</h3>
                      <p className="text-sm text-gray-600">Scan and pay instantly</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="p-2 bg-white border border-gray-200 rounded-lg w-fit mx-auto mb-3">
                        <Shield className="w-5 h-5 text-gray-700" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Secure</h3>
                      <p className="text-sm text-gray-600">Safe and reliable transactions</p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="pt-4">
                    <p className="text-lg font-medium text-gray-900 mb-6">
                      Ready to get started?
                    </p>
                    <div className="text-sm text-gray-600">
                      Click "Connect Wallet" in the header above
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;