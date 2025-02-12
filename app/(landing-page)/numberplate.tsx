'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

const NumberPlate = () => {
    return (
        <div className="flex flex-row items-center justify-center flex-wrap gap-2">
            <div className="flex items-center justify-center">
                <div className="relative">
                    <input
                        type="text"
                        className="text-center rounded-lg w-[285px] h-[60px] pl-10 pr-2 text-5xl font-bold text-black uppercase border-2 border-slate-500 outline-none font-charles-wright"
                        maxLength={8}
                        placeholder="Vehicle..."
                        onKeyDown={(event) => {
                            if (event.key === ' ') {
                                event.preventDefault()
                            }
                        }}
                        autoFocus
                    />

                    <div className="flex flex-col items-center justify-center rounded-l-lg absolute top-0 left-0 w-8 h-[60px]  text-sm font-bold text-white bg-blue-600 ">
                        <Image
                            src="/Flag_of_the_United_Kingdom.svg"
                            width={24}
                            height={16}
                            className="p-1"
                            alt="Flag of the United Kingdom"
                        />
                        <p>UK</p>
                    </div>
                </div>
            </div>
            <input
                type="text"
                className="text-center rounded-lg w-[285px] h-[60px] pl-2 pr-2 text-5xl font-bold text-black uppercase border-2 border-slate-500 outline-none"
                maxLength={8}
                placeholder="Postcode..."
                onKeyDown={(event) => {
                    if (event.key === ' ') {
                        event.preventDefault()
                    }
                }}
            />
            <Button className="bg-gold hover:bg-darkgold text-white text-2xl w-[285px]">
                Quote
            </Button>
        </div>
    )
}

export default NumberPlate
