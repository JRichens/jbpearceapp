import { Dispatch, SetStateAction } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { GithubPicker } from "react-color"
import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"

interface PolygonModalProps {
  onSubmit: () => void
  onClose: () => void
  polygonSTid: string
  setPolygonSTid: Dispatch<SetStateAction<string>>
  polygonDescription: string
  setPolygonDescription: Dispatch<SetStateAction<string>>
  polygonColour: string
  setPolygonColour: Dispatch<SetStateAction<string>>
  polygonArea: string
  setPolygonArea: Dispatch<SetStateAction<string>>
}

const PolygonModal: React.FC<PolygonModalProps> = ({
  onSubmit,
  onClose,
  polygonSTid,
  setPolygonSTid,
  polygonDescription,
  setPolygonDescription,
  polygonColour,
  setPolygonColour,
  polygonArea,
  setPolygonArea,
}) => {
  const handleSubmit = () => {
    onSubmit()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-end">
      <div className="bg-white p-4 rounded shadow-lg m-4">
        <h2 className="text-xl font-bold mb-4">Land Detail</h2>
        <div className="mb-4">
          <Label
            htmlFor="stid"
            className="block mb-1"
          >
            STid:
          </Label>
          <Input
            type="text"
            id="stid"
            value={polygonSTid}
            onChange={(e) => setPolygonSTid(e.target.value)}
            placeholder="ST5566 7788..."
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="mb-4">
          <Label
            htmlFor="description"
            className="block mb-1"
          >
            Description:
          </Label>
          <textarea
            id="description"
            value={polygonDescription}
            onChange={(e) => setPolygonDescription(e.target.value)}
            autoFocus
            className="w-full border border-gray-300 rounded px-2 py-1"
          ></textarea>
        </div>
        <div className="mb-4">
          <Label
            htmlFor="colour"
            className="block mb-1"
          >
            Colour:
          </Label>
          <GithubPicker
            color={polygonColour}
            onChange={(colour) => setPolygonColour(colour.hex)}
          />
        </div>
        <div className="mb-4">
          <Label
            htmlFor="area"
            className="block mb-1"
          >
            Area (hectares):
          </Label>
          <Input
            type="text"
            id="area"
            value={parseFloat(polygonArea).toFixed(2).toString()}
            onChange={(e) => setPolygonArea(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-between">
          <Button
            onClick={handleSubmit}
            className=""
          >
            Ok
          </Button>
          <Button
            onClick={onClose}
            variant="destructive"
            className=""
          >
            <Trash2 className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PolygonModal
