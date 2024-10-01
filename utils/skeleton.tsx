// src/utils/skeleton.tsx
import React from 'react'
import { Skeleton } from '@mui/material' // Adjust this import based on your project structure

interface SkeletonRowProps {
    widths: number[]
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({ widths }) => (
    <div className="flex flex-row gap-4">
        {widths.map((width, index) => (
            <Skeleton key={index} className={`w-[${width}%] h-10 rounded-md`} />
        ))}
    </div>
)

interface SkeletonLoaderProps {
    rows?: number
    rowWidths?: number[] | number[][]
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    rows = 3,
    rowWidths = [25, 40, 10, 10, 10],
}) => {
    // Ensure rowWidths is always an array of arrays
    const normalizedRowWidths = Array.isArray(rowWidths[0])
        ? (rowWidths as number[][])
        : Array(rows).fill(rowWidths)

    return (
        <div className="flex flex-col gap-2 border border-slate-200 rounded-md shadow-sm p-4">
            {[...Array(rows)].map((_, index) => (
                <SkeletonRow
                    key={index}
                    widths={
                        normalizedRowWidths[index % normalizedRowWidths.length]
                    }
                />
            ))}
        </div>
    )
}
