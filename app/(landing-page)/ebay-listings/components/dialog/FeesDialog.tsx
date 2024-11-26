'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { FeesDialogProps } from '../../types/form.types'

export function FeesDialog({
    open,
    onOpenChange,
    verificationResult,
    isLoading,
    onSubmit,
}: FeesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ready To List</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Insertion Fee:</span>
                            <span className="font-semibold">
                                £
                                {verificationResult?.fees?.insertionFee ||
                                    '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Total Fees:</span>
                            <span className="font-semibold">
                                £{verificationResult?.fees?.totalFees || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        className="w-full text-xl"
                        disabled={isLoading}
                        onClick={onSubmit}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            'Submit Listing'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
