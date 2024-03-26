"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image"
import { DeletePhoto } from "@/actions/del-photos"
import { BreakingVehicle } from "@/types/vehicles"
import { Loader2 } from "lucide-react"
import Typewriter from "typewriter-effect"
import { ThreeCircles } from "react-loader-spinner"

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  photos: string[]
  setModalPhotos: React.Dispatch<React.SetStateAction<string[]>>
  userType: string
  selectedVehicle: BreakingVehicle | null
}

const Photos = ({
  open,
  setOpen,
  photos,
  setModalPhotos,
  userType,
  selectedVehicle,
}: Props) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [delOpen, setDelOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newPhotos, setNewPhotos] = useState<string[]>([])

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
      console.log("current slide: ", api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <>
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[725px]">
          <Carousel
            setApi={setApi}
            opts={{}}
            className="w-full"
          >
            <CarouselContent>
              {photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-0">
                        <div className="relative w-full h-full ">
                          <Image
                            width={1024}
                            height={1024}
                            src={photo}
                            alt="photo"
                            placeholder="blur"
                            blurDataURL={`https://ws.carwebuk.com${selectedVehicle?.car.imageUrl}`}
                            className="absolute z-10 inset-0 w-full h-full rounded-md object-contain"
                          />
                          <>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 text-white text-xl flex flex-col items-center gap-4 bg-black p-4 bg-opacity-50 rounded-2xl shadow-xl">
                              <Typewriter
                                options={{
                                  strings: [
                                    "Loading photo...",
                                    "Please wait...",
                                  ],
                                  autoStart: true,
                                  loop: true,
                                }}
                              />
                              <ThreeCircles color="#d3c22a" />
                            </div>
                          </>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <DialogFooter>
            <div className="flex flex-row gap-2 justify-end ">
              {userType !== "user" && (
                <Button
                  variant="destructive"
                  onClick={() => setDelOpen(true)}
                >
                  Delete
                </Button>
              )}
              <Button
                onClick={() => {
                  setOpen(false)
                }}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={delOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-row gap-3 justify-end">
              <AlertDialogAction
                disabled={deleting}
                className="w-24 bg-red-600 hover:bg-red-800"
                onClick={async () => {
                  try {
                    setDeleting(true)
                    // Isolate the filename only
                    const fileName = photos[current - 1].split("/").pop()
                    // Create the new photos array
                    setNewPhotos(
                      photos.filter((item) => item !== photos[current - 1])
                    )
                    // Delete the photo and update the photos array in database
                    if (fileName && selectedVehicle) {
                      await DeletePhoto(
                        fileName,
                        selectedVehicle.carReg,
                        photos.filter((item) => item !== photos[current - 1])
                      )
                    }
                    setModalPhotos(newPhotos)
                  } catch (error) {
                    console.log(error)
                  } finally {
                    setDeleting(false)
                  }
                  setDelOpen(false)
                  // if no more images, close the modal
                  photos.filter((item) => item !== photos[current - 1]) &&
                    setOpen(false)
                }}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
              <AlertDialogCancel
                className="w-24 mt-0"
                onClick={() => {
                  setDelOpen(false)
                }}
              >
                Cancel
              </AlertDialogCancel>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Photos
