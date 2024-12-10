import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useListingForm } from '../../hooks/useListingForm'
import { ListingFormSection } from './ListingFormSection'
import { PriceComparisonSection } from '../price-comparison/PriceComparisonSection'

export function ListingForm() {
    const {
        formState,
        setFormState,
        vehicle,
        setVehicle,
        productionYearInfo,
        isLoadingProductionYear,
        handleFormChange,
        handleSubmit,
        handlePhotosChange,
        handleCategoryChange,
        handleTitleParamChange,
        resetForm,
    } = useListingForm()

    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
    const [showFeesDialog, setShowFeesDialog] = useState(false)
    const [hasSearchedVehicle, setHasSearchedVehicle] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)

    return (
        <div className="relative w-full overflow-x-clip">
            {pageNumber === 1 && (
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="space-y-6 p-1"
                >
                    <ListingFormSection
                        formState={formState}
                        setFormState={setFormState}
                        vehicle={vehicle}
                        setVehicle={setVehicle}
                        productionYearInfo={productionYearInfo}
                        isLoadingProductionYear={isLoadingProductionYear}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        handlePhotosChange={handlePhotosChange}
                        handleCategoryChange={handleCategoryChange}
                        handleTitleParamChange={handleTitleParamChange}
                        resetForm={resetForm}
                        selectedPlacements={selectedPlacements}
                        setSelectedPlacements={setSelectedPlacements}
                        showFeesDialog={showFeesDialog}
                        setShowFeesDialog={setShowFeesDialog}
                        hasSearchedVehicle={hasSearchedVehicle}
                        setHasSearchedVehicle={setHasSearchedVehicle}
                        setPageNumber={setPageNumber}
                    />
                </motion.div>
            )}

            {pageNumber === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                >
                    <PriceComparisonSection
                        vehicle={vehicle}
                        partDescription={formState.partDescription}
                        selectedCategory={formState.selectedCategory}
                        formState={formState}
                    />
                </motion.div>
            )}

            {/* Sticky Switch Page Button - Only shown when category is selected */}
            {formState.selectedCategory && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.3 }}
                    animate={{
                        opacity: 1,
                        y: [-20, -30, 0],
                        scale: [0.3, 1.2, 1],
                        transition: {
                            duration: 0.8,
                            y: {
                                times: [0, 0.6, 1],
                                ease: 'easeOut',
                            },
                            scale: {
                                times: [0, 0.6, 1],
                                duration: 0.7,
                            },
                        },
                    }}
                    exit={{ opacity: 0, y: -40, scale: 0.3 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button
                        onClick={() => setPageNumber(pageNumber === 1 ? 2 : 1)}
                        className="h-[60px] w-[60px] rounded-full"
                    >
                        <span className="relative">
                            {pageNumber === 1 ? (
                                <ArrowRight className="w-6 h-6" />
                            ) : (
                                <ArrowLeft className="w-6 h-6" />
                            )}
                        </span>
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
