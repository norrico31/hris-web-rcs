import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

export default function TextEditor({ setTextFromEditor, textFromEditor }: { textFromEditor: string; setTextFromEditor: React.Dispatch<React.SetStateAction<string>> }) {
    return <CKEditor
        editor={ClassicEditor}
        data={textFromEditor}
        onChange={(evt, editor) => {
            const data = editor.getData()
            setTextFromEditor(data)
            console.log('text editor editor: ', editor)
            console.log('text editor evt: ', evt)
            console.log('text editor data: ', data)
        }}
    />
}
