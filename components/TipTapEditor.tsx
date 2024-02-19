"use client"

import { GetTaskDetails } from "@/actions/get-task-details"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { useEffect, useState } from "react"
import TipTapMenu from "./TipTapMenu"
import { Button } from "./ui/button"

type Props = {
  initialContent: string
}

const TipTapEditor = ({ initialContent }: Props) => {
  const [editorState, setEditorState] = useState(initialContent)
  const [editorClicked, setEditorClicked] = useState(false)
  const [saveClicked, setSaveClicked] = useState(false)

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor?.isFocused === true) {
      setEditorClicked(true)
    }
  }, [editor?.isFocused])

  return (
    <div className="h-[600px] max-w-screen-md">
      {(editor?.isFocused || editorClicked) && (
        <>
          <div className="flex flex-row space-x-2 items-center justify-center pb-2 mb-1 border-b-2 border-b-gray-300">
            <TipTapMenu editor={editor} />
            <Button
              onClick={() => {
                // Save our new daily check into database
                setSaveClicked(true)
              }}
            >
              Save
            </Button>
          </div>
        </>
      )}

      <article className="prose lg:prose-xl">
        <EditorContent editor={editor} />
      </article>
    </div>
  )
}

export default TipTapEditor
