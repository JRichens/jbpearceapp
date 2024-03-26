"use client"
import { useEffect, useState } from "react"

import Lottie from "lottie-react"
import animationData from "@/public/menuPointer.json"

const BlackOut = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true)
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      {show && (
        <Lottie
          animationData={animationData}
          loop={false}
        />
      )}
    </>
  )
}

export default BlackOut
