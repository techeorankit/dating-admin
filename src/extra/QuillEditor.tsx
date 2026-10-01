import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
}) as React.ComponentType<any>;

const DEFAULT_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  modules?: object;
}

const QuillEditor = ({
  value,
  onChange,
  placeholder = "Write something amazing...",
  modules = DEFAULT_MODULES,
}: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSyncedValue = useRef<string | null>(null);
  const valueRef = useRef(value);

  valueRef.current = value ?? "";

  const syncEditorContent = useCallback((editor: any, content: string) => {
    const normalizedContent = content ?? "";

    if (normalizedContent === lastSyncedValue.current) {
      return;
    }

    lastSyncedValue.current = normalizedContent;
    editor.clipboard.dangerouslyPasteHTML(normalizedContent);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;
    let attempts = 0;

    const trySync = async () => {
      if (cancelled) {
        return true;
      }

      const { default: Quill } = await import("quill");
      const containerEl = containerRef.current?.querySelector(".ql-container");

      if (!containerEl) {
        return false;
      }

      const editor = Quill.find(containerEl);
      if (!editor) {
        return false;
      }

      syncEditorContent(editor, valueRef.current);
      return true;
    };

    const poll = () => {
      void trySync().then((done) => {
        if (done || cancelled) {
          return;
        }

        attempts += 1;
        if (attempts < 30) {
          timeoutId = window.setTimeout(poll, 100);
        }
      });
    };

    timeoutId = window.setTimeout(poll, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [value, syncEditorContent]);

  const handleChange = (content: string, _delta: unknown, source: string) => {
    if (source !== "user") {
      return;
    }

    lastSyncedValue.current = content;
    onChange(content);
  };

  return (
    <div ref={containerRef}>
      <ReactQuill
        theme="snow"
        placeholder={placeholder}
        modules={modules}
        onChange={handleChange}
      />
    </div>
  );
};

export default QuillEditor;
