import Image from "next/image"
import { SignUp } from "@clerk/nextjs"

export default function Page() {
  return (
    <>
      <Image
        src="/FULLLOGO.jpg"
        alt="JBP Logo"
        width={100}
        height={100}
        priority
        className="py-8"
      />
      <SignUp />
    </>
  )
}
