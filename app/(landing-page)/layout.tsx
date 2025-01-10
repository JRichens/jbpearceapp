import { Navbar } from './_components/navbar'
import StaticSidebar from './_components/static-sidebar'

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex overflow-hidden">
                <StaticSidebar />
                <main className="flex-1 pt-20 grainy overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default LandingLayout
