const radToDeg = 180 / Math.PI
const degToRad = Math.PI / 180

const a = 6377563.396
const b = 6356256.909
const f0 = 0.9996012717
const lat0 = 49 * degToRad
const lon0 = -2 * degToRad
const n0 = -100000.0
const e0 = 400000.0
const e2 = 1 - (b * b) / (a * a)
const n = (a - b) / (a + b)
const n2 = n * n
const n3 = n * n * n

function OsGridToLatLong(northing: number, easting: number): [number, number] {
  let lat = lat0
  let m = 0.0

  while (northing - n0 - m >= 1e-5) {
    lat = (northing - n0 - m) / (a * f0) + lat

    const ma = (1 + n + (5 / 4) * n2 + (5 / 4) * n3) * (lat - lat0)
    const mb =
      (3 * n + 3 * n * n + (21 / 8) * n3) *
      Math.sin(lat - lat0) *
      Math.cos(lat + lat0)
    const mc =
      ((15 / 8) * n2 + (15 / 8) * n3) *
      Math.sin(2 * (lat - lat0)) *
      Math.cos(2 * (lat + lat0))
    const md =
      (35 / 24) * n3 * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0))

    m = b * f0 * (ma - mb + mc - md)
  }

  const cosLat = Math.cos(lat)
  const sinLat = Math.sin(lat)
  const nu = (a * f0) / Math.sqrt(1 - e2 * sinLat * sinLat)
  const rho = (a * f0 * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5)
  const eta2 = nu / rho - 1

  const tanLat = Math.tan(lat)
  const tan2lat = tanLat * tanLat
  const tan4lat = tan2lat * tan2lat
  const tan6lat = tan4lat * tan2lat

  const secLat = 1 / cosLat

  const nu3 = nu * nu * nu
  const nu5 = nu3 * nu * nu
  const nu7 = nu5 * nu * nu

  const vii = tanLat / (2 * rho * nu)
  const viii =
    (tanLat / (24 * rho * nu3)) * (5 + 3 * tan2lat + eta2 - 9 * tan2lat * eta2)
  const ix = (tanLat / (720 * rho * nu5)) * (61 + 90 * tan2lat + 45 * tan4lat)

  const x = secLat / nu
  const xi = (secLat / (6 * nu3)) * (nu / rho + 2 * tan2lat)
  const xii = (secLat / (120 * nu5)) * (5 + 28 * tan2lat + 24 * tan4lat)
  const xiia =
    (secLat / (5040 * nu7)) *
    (61 + 662 * tan2lat + 1320 * tan4lat + 720 * tan6lat)

  const de = easting - e0
  const de2 = de * de
  const de3 = de2 * de
  const de4 = de2 * de2
  const de5 = de3 * de2
  const de6 = de4 * de2
  const de7 = de5 * de2

  lat = lat - vii * de2 + viii * de4 - ix * de6
  const lon = lon0 + x * de - xi * de3 + xii * de5 - xiia * de7

  return [lat * radToDeg, lon * radToDeg]
}

export default OsGridToLatLong
