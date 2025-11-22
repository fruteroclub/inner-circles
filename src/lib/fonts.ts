import localFont from 'next/font/local'
import { Raleway, Space_Grotesk as SpaceGrotesk } from 'next/font/google'

// Define your custom font
export const funnelDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/FunnelDisplay-VariableFont_wght.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-funnel',
  display: 'swap',
  preload: true,
})

export const ledger = localFont({
  src: [
    {
      path: '../../public/fonts/Ledger-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-ledger',
  display: 'swap',
  preload: true,
})

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--raleway',
})

const spaceGrotesk = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--space-grotesk',
})

// Export all fonts
export const fonts = {
  funnelDisplay,
  ledger,
  raleway,
  spaceGrotesk,
}
