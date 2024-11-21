import { VerificationResult as VerificationResultType } from './types'

interface VerificationResultProps {
    result: VerificationResultType
}

export function VerificationResult({ result }: VerificationResultProps) {
    return (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-green-800">Listing Fees:</h3>
            <ul className="text-sm text-green-700">
                <li>Insertion Fee: £{result.fees.insertionFee}</li>
                <li className="font-semibold">
                    Total Fees: £{result.fees.totalFees}
                </li>
            </ul>
        </div>
    )
}
