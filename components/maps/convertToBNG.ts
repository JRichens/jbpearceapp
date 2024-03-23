import proj4 from "proj4"

const wgs84 = "+proj=longlat +datum=WGS84 +no_defs"
const bng =
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"

export function convertToBNG(
  latitude: number,
  longitude: number
): [number, number] {
  const [easting, northing] = proj4(wgs84, bng, [longitude, latitude])
  const easting4 = parseInt(Math.round(easting).toString().slice(0, 4))
  const northing4 = parseInt(Math.round(northing).toString().slice(0, 4))
  return [easting4, northing4]
}
