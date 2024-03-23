export type BreakingVehicle = {
  car: {
    uniqueId: string
    reg: string
    vinOriginalDvla: string | null
    dvlaMake: string | null
    dvlaModel: string | null
    modelSeries: string | null
    modelVariant: string | null
    nomCC: string | null
    colourCurrent: string | null
    dvlaYearOfManufacture: string | null
    originCountry: string | null
    weight: string | null
    euroStatus: string | null
    engineCode: string | null
    engineCapacity: string | null
    noCylinders: string | null
    fuelType: string | null
    transmission: string | null
    aspiration: string | null
    maxBHP: string | null
    maxTorque: string | null
    driveType: string | null
    gears: string | null
    vehicleCategory: string | null
    imageUrl: string | null
    exportVehicle: boolean | null
    addedToExport: Date | null
    breakingVehicle: boolean | null
    addedToBreaking: Date | null
    createdAt: Date
    updatedAt: Date
  }
  id: string
  carReg: string
  created: Date
  updated: Date
  photos: string[]
}
