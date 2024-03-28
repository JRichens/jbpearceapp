import { Navbar } from "./_components/navbar"
import { Sidebar } from "./_components/sidebar"

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="pt-20 min-h-screen grainy flex-grow">{children}</div>
      </div>
    </>
  )
}

export default LandingLayout
