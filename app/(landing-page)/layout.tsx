import { Navbar } from "./_components/navbar"
import { Sidebar } from "./_components/sidebar"

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="w-60 shrink-0 hidden md:block shadow-[10px_0_5px_0px_rgba(0,0,0,0.3)]">
          <Sidebar />
        </div>

        <div className="pt-20 min-h-screen grainy flex-grow">{children}</div>
      </div>
    </>
  )
}

export default LandingLayout
