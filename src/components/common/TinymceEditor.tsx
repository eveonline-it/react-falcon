import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useAppContext } from 'providers/AppProvider';
import { Editor } from '@tinymce/tinymce-react';

interface TinymceEditorProps {
  value?: string;
  handleChange?: (value: string, editor: any) => void;
  height?: string | number;
  isInvalid?: boolean;
}

const TinymceEditor: React.FC<TinymceEditorProps> = ({ value, handleChange, height = '50vh', isInvalid }) => {
  const {
    config: { isDark, isRTL },
    getThemeColor
  } = useAppContext();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.dom.addStyle(`
        .mce-content-body {
          color: ${getThemeColor('emphasis-color')} !important;
          background-color: ${getThemeColor('tinymce-bg')} !important;
        }`);
    }
  }, [isDark]);

  return (
    <div className={classNames({ 'is-invalid': isInvalid })}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
        value={value}
        onEditorChange={handleChange}
        apiKey={import.meta.env.VITE_REACT_APP_TINYMCE_APIKEY}
        init={{
          height,
          menubar: false,
          content_style: `
            .mce-content-body {
              color: ${getThemeColor('emphasis-color')};
              background-color: ${getThemeColor('tinymce-bg')};
            }
            .tox-tbtn{
              background-color: red;
            }  
            `,
          statusbar: false,
          plugins: 'link image lists table media directionality',
          toolbar:
            'styleselect | bold italic link bullist numlist image blockquote table media undo redo',

          directionality: isRTL ? 'rtl' : 'ltr',
          theme_advanced_toolbar_align: 'center'
        }}
      />
    </div>
  );
};

export default TinymceEditor;
