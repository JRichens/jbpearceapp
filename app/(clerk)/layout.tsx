const ClerkLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="h-full flex flex-col items-center">{children}</div>
    </>
  )
}
export default ClerkLayout
