import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

export default function TextEditor({ setTextFromEditor, textFromEditor }: { textFromEditor: string; setTextFromEditor: React.Dispatch<React.SetStateAction<string>> }) {
    return <CKEditor
        editor={ClassicEditor}
        data={textFromEditor}
        onChange={(_, editor) => {
            const data = editor.getData()
            setTextFromEditor(data)
        }}
    />
}
