import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box } from '@chakra-ui/react';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean']
  ]
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent', 'link', 'image'
];

type Props = { value: string; onChange: (value: string) => void };

export default function RichTextEditor({ value, onChange }: Props) {
  return (
    <Box className="text-editor">
      <ReactQuill
        theme="snow"
        style={{ height: '120px' }}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
    </Box>
  );
}
