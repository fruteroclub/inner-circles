import React from 'react'

import Navbar from './navbar'
import Footer from './footer'

export interface NavbarProps {
  title?: string
  navTitle?: string
}

const PageWrapper: React.FC<NavbarProps & { children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <Navbar />
      <main
        className={`top-[96px] flex min-h-[calc(100vh-96px)] w-full flex-col items-center overflow-x-hidden`}
      >
        {children}
      </main>
      <Footer />
    </>
  )
}

export default PageWrapper
