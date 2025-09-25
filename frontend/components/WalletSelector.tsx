import {
  APTOS_CONNECT_ACCOUNT_URL,
  AboutAptosConnect,
  AboutAptosConnectEducationScreen,
  AdapterWallet,
  AdapterNotDetectedWallet,
  AptosPrivacyPolicy,
  WalletItem,
  groupAndSortWallets,
  isAptosConnectWallet,
  isInstallRequired,
  truncateAddress,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { ArrowLeft, ArrowRight, ChevronDown, Copy, LogOut, User } from "lucide-react";
import { useCallback, useState } from "react";
// Internal components
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function WalletSelector() {
  const { account, connected, disconnect, wallet } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const copyAddress = useCallback(async () => {
    if (!account?.address.toStringLong()) return;
    try {
      await navigator.clipboard.writeText(account.address.toStringLong());
      toast({
        title: "Success",
        description: "Copied wallet address to clipboard.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy wallet address.",
      });
    }
  }, [account?.address, toast]);

  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          {account?.ansName || truncateAddress(account?.address.toStringLong()) || "Unknown"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 p-1"
      >
        <DropdownMenuItem 
          onSelect={copyAddress} 
          className="gap-2 text-gray-700 hover:bg-gray-100 rounded-md mx-0 my-0.5 cursor-pointer px-2 py-1.5"
        >
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        {wallet && isAptosConnectWallet(wallet) && (
          <DropdownMenuItem asChild>
            <a 
              href={APTOS_CONNECT_ACCOUNT_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex gap-2 text-gray-700 hover:bg-gray-100 rounded-md mx-0 my-0.5 cursor-pointer px-2 py-1.5"
            >
              <User className="h-4 w-4" /> Account
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onSelect={disconnect} 
          className="gap-2 text-gray-700 hover:bg-gray-100 rounded-md mx-0 my-0.5 cursor-pointer px-2 py-1.5"
        >
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
          Connect Wallet
        </Button>
      </DialogTrigger>
      <ConnectWalletDialog close={closeDialog} />
    </Dialog>
  );
}

interface ConnectWalletDialogProps {
  close: () => void;
}

function ConnectWalletDialog({ close }: ConnectWalletDialogProps) {
  const { wallets = [], notDetectedWallets = [] } = useWallet();
  const { aptosConnectWallets, availableWallets, installableWallets } = groupAndSortWallets([...wallets, ...notDetectedWallets]);

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <DialogContent className="bg-white border border-gray-200 rounded-2xl shadow-xl max-h-screen overflow-auto max-w-md">
      <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
        <DialogHeader className="pb-6">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {hasAptosConnectWallets ? (
              <div className="space-y-1">
                <div>Log in or sign up</div>
                <div className="text-lg font-normal text-gray-600">
                  with Social + Aptos Connect
                </div>
              </div>
            ) : (
              "Connect Wallet"
            )}
          </DialogTitle>
        </DialogHeader>

        {hasAptosConnectWallets && (
          <div className="space-y-4 pb-6">
            {aptosConnectWallets.map((wallet) => (
              <AptosConnectWalletRow key={wallet.name} wallet={wallet} onConnect={close} />
            ))}
            <p className="flex gap-1 justify-center items-center text-gray-500 text-sm">
              Learn more about{" "}
              <AboutAptosConnect.Trigger className="flex gap-1 py-2 items-center text-gray-900 hover:text-gray-700 transition-colors">
                Aptos Connect <ArrowRight size={16} />
              </AboutAptosConnect.Trigger>
            </p>
            <AptosPrivacyPolicy className="flex flex-col items-center py-2">
              <p className="text-xs leading-5 text-gray-500">
                <AptosPrivacyPolicy.Disclaimer />{" "}
                <AptosPrivacyPolicy.Link className="text-gray-700 underline hover:text-gray-900 transition-colors" />
                <span>.</span>
              </p>
              <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-gray-400 mt-1" />
            </AptosPrivacyPolicy>
            <div className="flex items-center gap-4 py-2">
              <div className="h-px w-full bg-gray-200" />
              <span className="text-gray-500 text-sm">Or</span>
              <div className="h-px w-full bg-gray-200" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
          ))}
          {!!installableWallets.length && (
            <Collapsible className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg w-full"
                >
                  More wallets <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                {installableWallets.map((wallet) => (
                  <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </AboutAptosConnect>
    </DialogContent>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-8 w-8 rounded-full" />
        <WalletItem.Name className="text-base font-medium text-gray-900" />
      </div>
      {isInstallRequired(wallet) ? (
        <Button size="sm" variant="ghost" asChild className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <WalletItem.InstallLink />
        </Button>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-lg px-4 font-medium">
            Connect
          </Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button 
          size="lg" 
          variant="outline" 
          className="w-full gap-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg py-4 text-gray-900"
        >
          <WalletItem.Icon className="h-6 w-6" />
          <WalletItem.Name className="text-base font-medium" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0 pb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={screen.cancel}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft />
        </Button>
        <DialogTitle className="text-lg text-center font-bold text-gray-900">
          About Aptos Connect
        </DialogTitle>
      </DialogHeader>

      <div className="flex h-[162px] pb-6 items-end justify-center">
        <screen.Graphic />
      </div>
      
      <div className="flex flex-col gap-3 text-center pb-6">
        <screen.Title className="text-xl font-bold text-gray-900" />
        <screen.Description className="text-sm text-gray-600 leading-relaxed [&>a]:underline [&>a]:text-gray-900 [&>a]:hover:text-gray-700" />
      </div>

      <div className="grid grid-cols-3 items-center">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={screen.back} 
          className="justify-self-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          Back
        </Button>
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-1 w-8 rounded-full transition-all duration-300 bg-gray-300 [[data-active]>&]:bg-gray-900" />
            </ScreenIndicator>
          ))}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={screen.next} 
          className="gap-2 justify-self-end text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}