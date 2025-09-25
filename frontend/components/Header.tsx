import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto w-full flex-wrap">
        {/* Logo/Brand */}
        <h1 className="text-3xl font-bold text-gray-900">
          Cpay
        </h1>

        {/* Navigation/Actions */}
        <div className="flex gap-4 items-center flex-wrap">
          <WalletSelector />
        </div>
      </div>
    </div>
  );
}