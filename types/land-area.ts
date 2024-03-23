export type Coordinates = number[][][]

export interface Geometry {
  type: string
  coordinates: Coordinates
}

export interface Properties {
  index: number
  ID: string
  SHEET_ID: string
  PARCEL_ID: string
  VALID_FROM: string
  VALID_TO: string
  LFA_CODE: string
  CREATED_ON: string
  AREA_HA: string
  SBI: string
  SHAPE_AREA: number
  SHAPE_PERIMETER: number
}

export interface Feature {
  type: string
  id: string
  geometry: Geometry
  geometry_name: string
  properties: Properties
  bbox: number[]
}

export interface FeatureCollection {
  type: string
  features: Feature[]
}

export type LocalPolygon = {
  id: string
  created: Date
  issuedDate: string
  modified: Date
  STid: string
  description: string
  area: string
  colour: string
  centerLat: number | null
  centerLng: number | null
  coordinates: string[]
  polygonRef: google.maps.Polygon | null // Add the polygonRef property with its type
}

export type NewLandArea = {
  issuedDate: string
  STid: string
  description: string
  area: string
  colour: string
  centerLat: number
  centerLng: number
  coordinates: string[]
}
// // TAKEN FROM
// model LandArea {
//   id          String @id @default(cuid())
//   created     DateTime @default(now())
//   issuedDate  String
//   modified    DateTime @updatedAt
//   STid        String @default("ST0000 0000")
//   description String @default("Land Area")
//   area        String
//   colour      String @default("#008B02")
//   centerLat   Float?
//   centerLng   Float?
//   coordinates String[]
// }
