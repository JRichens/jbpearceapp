import { StringDecoder } from "string_decoder"

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
  plotNo: string
  registryNo: string
  purchaseDate: string
  purchasePrice: number
  name: string
  ownership: string | null
  STid: string | null
  description: string
  area: string
  colour: string
  centerLat: number | null
  centerLng: number | null
  coordinates: string[]
  notes: string | null
  notesRead: boolean | null
  agValue: number | null
  hopeValue: number | null
  type: string | null
  polygonRef: google.maps.Polygon | null // Add the polygonRef property with its type
}

export type LocalFarmPolygon = {
  id: string
  parcelId: string | null
  created: Date
  modified: Date
  STid: string | null
  name: string
  description: string
  activityCode: string | null
  hectares: string
  acres: string
  colour: string
  centerLat: number | null
  centerLng: number | null
  coordinates: string[]
  polygonRef: google.maps.Polygon | null // Add the polygonRef property with its type
}

export type NewLandArea = {
  issuedDate: string
  plotNo: string
  registryNo: string
  purchaseDate: string
  purchasePrice: number
  name: string
  ownership: string
  STid: string
  description: string
  area: string
  colour: string
  centerLat: number
  centerLng: number
  coordinates: string[]
  agValue: number
  hopeValue: number
  type: string
}

export type NewFarmLandArea = {
  parcelId: string
  STid: string | null
  name: string
  description: string
  activityCode: string | null
  hectares: string
  acres: string
  colour: string
  centerLat: number | null
  centerLng: number | null
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
