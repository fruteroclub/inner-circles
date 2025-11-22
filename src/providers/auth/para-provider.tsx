// 'use client'

// import { Suspense, type ReactNode } from 'react'
// import "@getpara/react-sdk/styles.css"
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { AuthProvider } from '@/contexts/auth-context'
// import { ParaProvider, Environment } from '@getpara/react-sdk'
// import { createConfig, WagmiProvider } from 'wagmi'
// import { http } from 'wagmi'
// import { defineChain } from 'viem'

// // Suppress React DOM warnings for Para SDK's invalid props
// if (typeof window !== 'undefined') {
//   const originalError = console.error
//   console.error = (...args) => {
//     if (args[0]?.includes?.('isVisible') || args[0]?.includes?.('React does not recognize')) {
//       return // Suppress Para SDK prop warnings
//     }
//     originalError.apply(console, args)
//   }
// }

// // Define Monad testnet chain
// const monadTestnet = defineChain({
//   id: 10143,
//   name: 'Monad Testnet',
//   nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://testnet-rpc.monad.xyz'] },
//     public: { http: ['https://testnet-rpc.monad.xyz'] }
//   },
//   blockExplorers: {
//     default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' }
//   },
//   testnet: true
// })

// // Para API Key from environment
// const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? ''

// // Wagmi configuration for Web3 interactions
// const wagmiConfig = createConfig({
//   chains: [monadTestnet],
//   multiInjectedProviderDiscovery: false,
//   transports: {
//     [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
//   },
// })

// function OnchainProviderComponent({ children }: { children: ReactNode }) {
//   const queryClient = new QueryClient()

//   return (
//     <AuthProvider>
//       <QueryClientProvider client={queryClient}>
//         <ParaProvider
//           config={{
//             appName: 'Frutero Club',
//           }}
//           paraClientConfig={{
//             env: Environment.PROD,
//             apiKey: PARA_API_KEY
//           }}
//           paraModalConfig={{
//             isGuestModeEnabled: true,
//             theme: {
//               backgroundColor: "#fcf2e9", // Light cream background matching your design
//               accentColor: "#d97706",     // Orange accent color matching your primary
//               font: "Raleway",            // Your main font
//               borderRadius: "md"
//             }
//           }}
//           callbacks={{
//             onGuestWalletsCreated: (event) => {
//               console.log('Guest wallets created!', event.detail)
//             }
//           }}
//         >
//           <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
//         </ParaProvider>
//       </QueryClientProvider>
//     </AuthProvider>
//   )
// }

// // Main export with Suspense
// export default function OnchainProvider({ children }: { children: ReactNode }) {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex h-screen w-full items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
//             <p>Loading wallet...</p>
//           </div>
//         </div>
//       }
//     >
//       <OnchainProviderComponent>{children}</OnchainProviderComponent>
//     </Suspense>
//   )
// }
