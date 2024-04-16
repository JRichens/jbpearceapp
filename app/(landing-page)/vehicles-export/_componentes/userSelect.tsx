"use client"

import { useEffect, useState } from "react"

import useSWR from "swr"

import { motion, AnimatePresence } from "framer-motion"

import { AddUserList, GetUserPlus, GetUsersLists } from "@/actions/get-users"
import { Exporting } from "@prisma/client"
type UserList = {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
  exportings: Exporting[]
}

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ListPlusIcon, PlusIcon, User2Icon } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

type Props = {
  userSelectModal: boolean
  setUserSelectModal: React.Dispatch<React.SetStateAction<boolean>>
}

const UserSelect = ({ userSelectModal, setUserSelectModal }: Props) => {
  const { data, error } = useSWR("userPlus", GetUserPlus)
  const [formState, setFormState] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userLists, setUserLists] = useState<UserList[]>([])
  const [typedListName, setTypedListName] = useState("")

  const list = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: "afterChildren",
      },
    },
    hiddenFromRight: {
      opacity: 0,
      x: 80,
      transition: {
        when: "afterChildren",
      },
    },
    exit: {
      opacity: 0,
      x: -80,
      transition: {
        when: "afterChildren",
      },
    },
  }
  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  }

  const handleClose = () => {
    setFormState(0)
    setSelectedUserId("")
    setUserLists([])
    setTypedListName("")
    setUserSelectModal(false)
  }

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId)
    // retrieve the user lists
    const lists = await GetUsersLists(userId)
    lists && setUserLists(lists)
    setFormState(1)
  }

  const handleCreateList = async () => {
    if (typedListName) {
      const list = await AddUserList(selectedUserId, typedListName)
      // retrieve the user lists
      const lists = await GetUsersLists(selectedUserId)
      lists && setUserLists(lists)
      setFormState(1)
    }
  }

  return (
    <>
      <Dialog
        open={userSelectModal}
        onOpenChange={setUserSelectModal}
      >
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {formState === 0 || formState === 1
                ? "Send to List"
                : formState === 2
                ? "New List Name"
                : "Send to List"}
            </DialogTitle>
            <DialogDescription>
              {formState === 0
                ? "Select the user who is buying the engine"
                : formState === 1
                ? "Select the list for the user"
                : formState === 2
                ? "Enter a suitable name for the list"
                : "Select the user who is buying the engine"}
            </DialogDescription>
            <Separator />
          </DialogHeader>
          <div className="relative h-[200px]">
            {/* State 0 - Select User */}
            <AnimatePresence>
              {formState === 0 && (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={list}
                  className="overflow-y-auto absolute top-0 left-0 w-full h-full flex flex-col items-center gap-2"
                >
                  {data?.map((user) => (
                    <motion.li
                      key={user.id}
                      variants={item}
                      className="w-3/4"
                    >
                      <Button
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <User2Icon className="mr-2 h-4 w-4" /> {user.name}
                      </Button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            {/* State 1 - Select List */}
            <AnimatePresence>
              {formState === 1 && (
                <motion.ul
                  initial="hiddenFromRight"
                  animate="visible"
                  exit="exit"
                  variants={list}
                  className="overflow-y-auto absolute top-0 left-0 w-full h-full flex flex-col items-center gap-2"
                >
                  <motion.li
                    variants={item}
                    className="w-3/4"
                  >
                    <Button
                      variant={"secondary"}
                      className="w-full"
                      onClick={() => setFormState(2)}
                    >
                      <PlusIcon className="mr-2 h-5 w-5" /> New List
                    </Button>
                  </motion.li>

                  {userLists.map((list) => (
                    <motion.li
                      key={list.id}
                      variants={item}
                      className="w-3/4"
                    >
                      <Button
                        key={list.id}
                        onClick={() => {}}
                        variant="outline"
                        className="w-full"
                      >
                        <ListPlusIcon className="mr-2 h-5 w-5" /> {list.name}
                      </Button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            {/* State 2 - New List */}
            <AnimatePresence>
              {formState === 2 && (
                <motion.ul
                  initial="hiddenFromRight"
                  animate="visible"
                  exit="exit"
                  variants={list}
                  className="absolute top-0 left-0 w-full h-full flex flex-col items-center gap-2"
                >
                  <motion.li
                    variants={item}
                    className="w-3/4"
                  >
                    <Input
                      placeholder="List Name"
                      value={typedListName}
                      onChange={(e) => setTypedListName(e.target.value)}
                      autoFocus
                      className="w-full my-1"
                    />
                  </motion.li>
                  <motion.li
                    variants={item}
                    className="w-3/4"
                  >
                    <Button
                      variant={"secondary"}
                      onClick={handleCreateList}
                      className="w-full"
                    >
                      Create
                    </Button>
                  </motion.li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserSelect
