import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected } from "wagmi/connectors";
import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    farcasterMiniApp(),
    injected(),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
