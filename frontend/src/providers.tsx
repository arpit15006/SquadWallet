'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base as any} // Use base for Basenames support
    >
      {props.children}
    </OnchainKitProvider>
  );
}
