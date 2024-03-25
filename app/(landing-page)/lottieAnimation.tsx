"use client"

import Lottie from "lottie-react"
import animationData from "@/public/appAnimation.json"

export default function LottieAnimation() {
  return (
    <Lottie
      animationData={animationData}
      loop={false}
    />
  )
}
