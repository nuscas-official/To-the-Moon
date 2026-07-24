'use client'

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  CodeToggle
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export default function RichTextEditor({ markdown, onChange }: RichTextEditorProps) {
  return (
    <div className="border border-border bg-surface overflow-hidden text-neutral-800 focus-within:border-accent transition-colors shadow-sm">
      <MDXEditor
        markdown={markdown}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: async (file: File) => {
              // Compress file client-side using canvas WebP conversion
              const { compressImageClient } = await import('@/lib/image-client')
              const compressedFile = await compressImageClient(file)

              const formData = new FormData()
              formData.append('file', compressedFile)
              formData.append('folder', 'posts')

              const res = await fetch('/api/uploads/upload', {
                method: 'POST',
                body: formData,
              })

              const data = await res.json()
              if (!res.ok) {
                throw new Error(data.error || 'Failed to upload image')
              }

              return data.url
            }
          }),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-border bg-neutral-50/80 backdrop-blur-sm sticky top-0 z-10">
                <UndoRedo />
                <span className="w-[1px] h-4 bg-neutral-300 mx-1" />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <span className="w-[1px] h-4 bg-neutral-300 mx-1" />
                <BlockTypeSelect />
                <ListsToggle />
                <span className="w-[1px] h-4 bg-neutral-300 mx-1" />
                <CreateLink />
                <InsertImage />
              </div>
            )
          })
        ]}
        contentEditableClassName="markdown-body min-h-[400px] p-6 focus:outline-none prose max-w-none prose-sm"
      />
    </div>
  )
}
