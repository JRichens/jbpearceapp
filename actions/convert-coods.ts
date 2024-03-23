"use server"

type ReturnedCoords = {
  status: string
  easting: number
  northing: number
  latitude: number
  longitude: number
}

const ConvertCoords = async (coord: number[]) => {
  const cood1 = coord[0].toString().slice(0, 6)
  const cood2 = coord[1].toString().slice(0, 6)
  const response = await fetch(
    `https://api.getthedata.com/bng2latlong/${cood1}/${cood2}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  const data: ReturnedCoords = await response.json()

  //   console.log("data", {
  //     lat: data.LATITUDE,
  //     lng: data.LONGITUDE,
  //   })

  return {
    lat: data.latitude,
    lng: data.longitude,
  }
}

export default ConvertCoords
