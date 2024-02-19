import Image from "next/image"
import Link from "next/link"

export const Logo = () => {
  return (
    <>
      <Link href="/">
        <div className="hover:opacity-60 transition">
          <Image
            src="/FULLLOGO.jpg"
            alt="JBP Logo"
            width={70}
            height={70}
            className=""
          />
        </div>
      </Link>
    </>
  )
}
