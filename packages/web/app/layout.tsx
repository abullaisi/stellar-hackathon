import type { Metadata } from 'next';
import { AppHeader } from '@/components/app-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from '@/providers/query-provider';
import { WalletProvider } from '@/providers/wallet-provider';
import { SmoothScroll } from '@/providers/smooth-scroll';
import './globals.css';

export const metadata: Metadata = {
  title: 'Komunify · One subscription, every community perk',
  description:
    'Pay one subscription on Stellar and unlock premium access, member discounts, learning resources, and digital assets across partner communities. Soroban splits every payment on-chain.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <QueryProvider>
            <WalletProvider>
              <TooltipProvider delayDuration={150}>
                <AppHeader />
                {children}
              </TooltipProvider>
            </WalletProvider>
          </QueryProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
