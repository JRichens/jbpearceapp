export type IdData = {
    code: string
    fullName: string
    firstLineAddress: string
    postcode: string
    registration: string
    paymentType: 'BACS' | 'CHEQUE'
    telephone: string
    accountNo: string
    sortCode: string
    image1?: string
    image2?: string
}

export type ApiResponse = {
    success: boolean
    count: number
    data: IdData[]
}
