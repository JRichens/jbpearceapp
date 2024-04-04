import { Navbar } from "./_components/navbar"

import StaticSidebar from "./_components/static-sidebar"

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex">
        <StaticSidebar />
        <div className="pt-20 min-h-screen grainy flex-grow">{children}</div>
      </div>
    </>
  )
}

export default LandingLayout
