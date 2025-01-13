'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import resizeImage from '@/utils/imageResizer'

import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { GetBreakingVehicles } from '@/actions/get-breakVehicles'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import moment from 'moment'
import NewVehicleDialog from './_componentes/newVehicleDialog'
import { BreakingVehicle } from '@/types/vehicles'
import { ConfirmDel } from './_componentes/confirmDel'
import Typewriter from 'typewriter-effect'
import { ThreeCircles } from 'react-loader-spinner'
import { GetUser } from '@/actions/get-user'
import { Label } from '@/components/ui/label'
import CountUp from 'react-countup'

import { UploadButton } from '@/utils/uploadthing'
import '@uploadthing/react/styles.css'
import { UpdateBreakingVehicle } from '@/actions/update-breakingVehicle'
import Photos from './_componentes/photos'

const BreakingVehicles = () => {
    const [search, setSearch] = useState('')

    const [selectedVehicle, setSelectedVehicle] =
        useState<BreakingVehicle | null>(null)
    const [newVehicleDialog, setNewVehicleDialog] = useState(false)
    const [confirmDel, setConfirmDel] = useState(false)
    const [userType, setUserType] = useState('')
    const [photoModal, setPhotoModal] = useState(false)
    const [modalPhotos, setModalPhotos] = useState<string[]>([])

    useEffect(() => {
        // Fetch user type
        const fetchUser = async () => {
            const user = await GetUser()
            user && setUserType(user.userTypeId)
        }
        fetchUser()
    }, [])

    const { data, error, isLoading } = useSWR(
        '/api/breaking-vehicles',
        GetBreakingVehicles,
        {
            refreshInterval: 2000, // Fetch data every 5 seconds
        }
    )

    return (
        <>
            <div className="max-w-3xl mb-6 px-4 md:px-8 py-4 mx-4 md:mx-8 shadow-md rounded-md bg-white border">
                <div className="flex flex-row items-center">
                    <h1 className="font-bold text-2xl">Breaking&nbsp;</h1>
                    {data && (
                        <CountUp
                            className="text-2xl font-bold"
                            end={data.length}
                        />
                    )}
                    <h1 className="font-bold text-2xl">&nbsp;Vehicles</h1>
                </div>
                <p>Search for vehicles that are breaking</p>
                <Separator className="my-2" />

                <div className="flex flex-row gap-3 relative mt-4">
                    <Label
                        htmlFor="search"
                        className="text-lg absolute left-2 -top-3 bg-white -m-1"
                    >
                        Search
                    </Label>
                    <Input
                        id="search"
                        placeholder="Any vehicle details.."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value.toUpperCase())
                        }
                        type="search"
                        name="search"
                        autoFocus
                        className="text-lg"
                    />
                    {userType !== 'user' && (
                        <Button
                            onClick={() => setNewVehicleDialog(true)}
                            variant={'secondary'}
                            className="text-lg "
                        >
                            <Plus className="pr-1 h-6 w-6" />
                            Add
                        </Button>
                    )}
                </div>
                {/* Map out the vehicles */}
                {isLoading && (
                    <>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
                            <Typewriter
                                options={{
                                    strings: [
                                        'Loading vehicles...',
                                        'Please wait...',
                                    ],
                                    autoStart: true,
                                    loop: true,
                                }}
                            />
                            <ThreeCircles color="#d3c22a" />
                        </div>
                    </>
                )}
                {data && (
                    <div
                        className={cn(`
              mt-3
              flex
              flex-row
              flex-wrap
              items-center
              gap-3
              `)}
                    >
                        {data
                            .sort((a, b) =>
                                moment(b.created).diff(moment(a.created))
                            )
                            .filter((vehicle) => {
                                const searchTerms = search
                                    .toLowerCase()
                                    .split(' ')
                                const {
                                    dvlaMake,
                                    dvlaModel,
                                    nomCC,
                                    fuelType,
                                    transmission,
                                    dvlaYearOfManufacture,
                                    modelSeries,
                                    reg,
                                } = vehicle.car

                                const modelText = dvlaModel
                                    ?.split(' ')
                                    .slice(0, 2)
                                    .join(' ')
                                const ccText = nomCC?.includes('.')
                                    ? nomCC
                                    : `${nomCC}.0`
                                const transmissionText = transmission?.includes(
                                    'AUTOMATIC'
                                )
                                    ? 'AUTO'
                                    : transmission
                                const modelSeriesText =
                                    modelSeries?.split(' ')[0]

                                const vehicleText = [
                                    dvlaMake,
                                    modelText,
                                    ccText,
                                    fuelType,
                                    transmissionText,
                                    dvlaYearOfManufacture?.toString(),
                                    modelSeriesText,
                                    reg,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                                    .toLowerCase()

                                return searchTerms.every((term) =>
                                    vehicleText.includes(term)
                                )
                            })
                            .map((vehicle) => (
                                <div
                                    className={cn(`
                    flex
                    flex-col
                    min-w-[300px]
                    min-h-[190px]
                    border
                    border-slate-200
                    p-1
                    rounded-md
                    shadow-sm
                    cursor-pointer
                    hover:shadow-md`)}
                                    key={vehicle.id}
                                >
                                    <div className="flex flex-row flex-grow justify-between">
                                        {/* Check if photos exist otherwise use default */}
                                        {vehicle.photos.length > 0 && (
                                            <>
                                                <div className="relative w-[145px] h-[100px]">
                                                    <Image
                                                        width={140}
                                                        height={100}
                                                        className="absolute inset-0 w-full h-full object-cover rounded-l-md shadow-sm"
                                                        src={vehicle.photos[0]}
                                                        alt=""
                                                        loading="lazy"
                                                        placeholder="blur"
                                                        blurDataURL={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                                                        onClick={() => {
                                                            // Popup a modal with the image
                                                            setSelectedVehicle(
                                                                vehicle
                                                            )
                                                            setPhotoModal(true)
                                                            setModalPhotos(
                                                                vehicle.photos
                                                            )
                                                        }}
                                                    />
                                                </div>

                                                {vehicle.photos.length > 1 && (
                                                    <div className="relative w-[145px] h-[100px]">
                                                        <Image
                                                            width={140}
                                                            height={100}
                                                            className="absolute inset-0 w-full h-full rounded-r-md object-cover shadow-sm"
                                                            src={
                                                                vehicle
                                                                    .photos[1]
                                                            }
                                                            alt=""
                                                            loading="lazy"
                                                            placeholder="blur"
                                                            blurDataURL={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                                                            onClick={() => {
                                                                // Popup a modal with the image
                                                                setSelectedVehicle(
                                                                    vehicle
                                                                )
                                                                setPhotoModal(
                                                                    true
                                                                )
                                                                setModalPhotos(
                                                                    vehicle.photos
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {vehicle.photos.length === 0 && (
                                            <>
                                                <Image
                                                    src={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                                                    width={140}
                                                    height={140}
                                                    alt=""
                                                />
                                                <Image
                                                    src={`https://ws.carwebuk.com${vehicle.car.imageUrl}`}
                                                    width={140}
                                                    height={140}
                                                    style={{
                                                        transform: 'scaleX(-1)',
                                                    }}
                                                    alt=""
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-medium">
                                            {vehicle.car.dvlaMake}{' '}
                                            {vehicle.car.dvlaModel
                                                ?.split(' ')
                                                .slice(0, 2)
                                                .join(' ')}
                                        </p>
                                        <p>
                                            {vehicle.car.nomCC?.includes('.')
                                                ? vehicle.car.nomCC
                                                : `${vehicle.car.nomCC}.0`}{' '}
                                            {vehicle.car.fuelType}{' '}
                                            {vehicle.car.transmission?.includes(
                                                'AUTOMATIC'
                                            )
                                                ? 'AUTO'
                                                : vehicle.car.transmission}
                                            {' - '}
                                            {vehicle.car.dvlaYearOfManufacture}
                                            {' ('}
                                            {
                                                vehicle.car.modelSeries?.split(
                                                    ' '
                                                )[0]
                                            }
                                            {')'}
                                        </p>
                                    </div>
                                    <Separator className="my-1" />
                                    <div className="flex flex-row justify-between items-center">
                                        <p>
                                            Added{' '}
                                            {moment(vehicle.created).fromNow()}
                                        </p>
                                        {userType !== 'user' && (
                                            <div className="flex flex-row gap-3 relative">
                                                {vehicle.photos.length < 2 && (
                                                    <UploadButton
                                                        content={{
                                                            button({ ready }) {
                                                                if (ready) {
                                                                    return (
                                                                        <ImagePlus />
                                                                    )
                                                                }
                                                                return (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                )
                                                            },
                                                        }}
                                                        appearance={{
                                                            button: 'h-8 w-8 text-white ut-ready:bg-green-500 ut-uploading:cursor-not-allowed rounded-r-none bg-none after:bg-green-500',
                                                            container:
                                                                'w-max flex-row rounded-md border-cyan-300 bg-slate-800',
                                                            allowedContent:
                                                                'hidden',
                                                        }}
                                                        key={vehicle.id}
                                                        endpoint="ebayPhotos"
                                                        onBeforeUploadBegin={async (
                                                            files
                                                        ) => {
                                                            try {
                                                                const resizedFiles =
                                                                    await Promise.all(
                                                                        files.map(
                                                                            async (
                                                                                file
                                                                            ) => {
                                                                                const resizedBlob =
                                                                                    await resizeImage(
                                                                                        file,
                                                                                        0.25
                                                                                    ) // Resize to 20% of original size
                                                                                return new File(
                                                                                    [
                                                                                        resizedBlob,
                                                                                    ],
                                                                                    file.name,
                                                                                    {
                                                                                        type: file.type,
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
                                                                    )
                                                                return resizedFiles
                                                            } catch (error) {
                                                                console.error(
                                                                    'Error resizing images:',
                                                                    error
                                                                )
                                                                return files // Return original files if resizing fails
                                                            }
                                                        }}
                                                        onClientUploadComplete={async (
                                                            res
                                                        ) => {
                                                            // Add the image path to the array of photos in the vehicle
                                                            const updatedVehicle =
                                                                {
                                                                    id: vehicle.id,
                                                                    carReg: vehicle.carReg,
                                                                    photos: [
                                                                        ...vehicle.photos,
                                                                        res[0]
                                                                            .url,
                                                                    ],
                                                                }
                                                            // Then update the vehicle in the database
                                                            await UpdateBreakingVehicle(
                                                                updatedVehicle
                                                            )
                                                        }}
                                                        onUploadError={(
                                                            error: Error
                                                        ) => {
                                                            // Do something with the error.
                                                        }}
                                                    />
                                                )}

                                                <Button
                                                    onClick={() => {
                                                        setConfirmDel(true)
                                                        setSelectedVehicle(
                                                            vehicle
                                                        )
                                                    }}
                                                    className="bg-red-700 p-1.5 py-0 h-8 hover:opacity-50 hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
            {/* Conditional dialogs */}
            <NewVehicleDialog
                newVehicleDialog={newVehicleDialog}
                setNewVehicleDialog={setNewVehicleDialog}
                search={search}
                setSearch={setSearch}
            />
            {selectedVehicle && (
                <ConfirmDel
                    open={confirmDel}
                    setOpen={setConfirmDel}
                    reg={selectedVehicle?.carReg}
                />
            )}
            <Photos
                open={photoModal}
                setOpen={setPhotoModal}
                photos={modalPhotos}
                setModalPhotos={setModalPhotos}
                userType={userType}
                selectedVehicle={selectedVehicle}
            />
        </>
    )
}

export default BreakingVehicles
