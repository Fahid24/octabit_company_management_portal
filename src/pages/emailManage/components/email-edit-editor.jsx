import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
} from 'lucide-react';

export function EmailEditor({ emailContent, setEmailContent }) {
  const [activeField, setActiveField] = useState(null);
  const editorRef = useRef(null);
  const isUpdatingContent = useRef(false);
  const lastCursorPosition = useRef(null);

  // Update editor content when emailContent.body changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingContent.current) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = emailContent.body || '';

      // Only update if content is actually different to avoid unnecessary updates
      if (currentContent !== newContent) {
        isUpdatingContent.current = true;
        editorRef.current.innerHTML = newContent;
        setupLinkHandlers();
        isUpdatingContent.current = false;
      }
    }
  }, [emailContent.body]);

  const saveCursorPosition = () => {
    if (!editorRef?.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastCursorPosition.current = range.cloneRange();
      }
    }
  };

  const restoreCursorPosition = () => {
    if (!lastCursorPosition.current || !editorRef?.current) return;

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(lastCursorPosition.current);
    editorRef.current.focus();
  };

  const handleContentChange = () => {
    if (isUpdatingContent.current) return;
    saveCursorPosition();

    setEmailContent((prev) => ({
      ...prev,
      body: editorRef.current.innerHTML,
    }));

    setupLinkHandlers();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFormatting = (format, value = null) => {
    if (!editorRef?.current) return;

    saveCursorPosition();
    editorRef.current.focus();

    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false);
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          document.execCommand('createLink', false, url);
          setupLinkHandlers();
        }
        break;
      case 'fontName':
        if (value) document.execCommand('fontName', false, value);
        break;
      case 'fontSize':
        if (value) document.execCommand('fontSize', false, value);
        break;
      case 'foreColor':
        if (value) document.execCommand('foreColor', false, value);
        break;
      case 'backColor':
        if (value) document.execCommand('hiliteColor', false, value);
        break;
      default:
        return;
    }

    handleContentChange();
    restoreCursorPosition();
  };

  const setupLinkHandlers = () => {
    if (!editorRef?.current) return;

    const links = editorRef.current.querySelectorAll('a');
    links.forEach((link) => {
      link.style.color = '#3a41e2';
      link.style.textDecoration = 'underline';
      link.setAttribute('target', '_blank');

      // Clone to remove existing event listeners
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
    });
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      [contenteditable] a {
        color: #3a41e2 !important;
        text-decoration: underline !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      setupLinkHandlers();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To
            </label>
            <input
              id="to"
              name="to"
              type="email"
              value={emailContent.to}
              onChange={handleInputChange}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={emailContent.subject}
              onChange={handleInputChange}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message Body
        </label>
        <div className="border rounded-md overflow-hidden">
          <div className="flex items-center gap-2 p-2 bg-gray-50 border-b flex-wrap">
            <select
              onChange={(e) => applyFormatting('fontName', e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded"
            >
              <option value="">Font</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>

            <select
              onChange={(e) => applyFormatting('foreColor', e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              style={{ backgroundColor: 'white' }}
            >
              <option value="">Text Color</option>
              <option value="#28282B" style={{ color: '#28282B' }}>
                Black
              </option>
              <option value="#ffffff" style={{ color: '#28282B' }}>
                White
              </option>
              <option value="#3a41e2" style={{ color: '#3a41e2' }}>
                OptimalMD Green
              </option>
              <option value="#FF0000" style={{ color: '#FF0000' }}>
                Red
              </option>
              <option value="#0000FF" style={{ color: '#0000FF' }}>
                Blue
              </option>
              <option value="#008000" style={{ color: '#008000' }}>
                Green
              </option>
              <option value="#FFA500" style={{ color: '#FFA500' }}>
                Orange
              </option>
              <option value="#800080" style={{ color: '#800080' }}>
                Purple
              </option>
              <option value="#A52A2A" style={{ color: '#A52A2A' }}>
                Brown
              </option>
              <option value="#808080" style={{ color: '#808080' }}>
                Gray
              </option>
            </select>

            <select
              onChange={(e) => applyFormatting('backColor', e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              style={{ backgroundColor: 'white' }}
            >
              <option value="">Highlight</option>
              <option value="#ffffff" style={{ backgroundColor: '#ffffff' }}>
                None
              </option>
              <option value="#ffff00" style={{ backgroundColor: '#ffff00' }}>
                Yellow
              </option>
              <option value="#00ffff" style={{ backgroundColor: '#00ffff' }}>
                Cyan
              </option>
              <option value="#ff00ff" style={{ backgroundColor: '#ff00ff' }}>
                Magenta
              </option>
              <option value="#ffd700" style={{ backgroundColor: '#ffd700' }}>
                Gold
              </option>
              <option value="#f0f8ff" style={{ backgroundColor: '#f0f8ff' }}>
                Light Blue
              </option>
              <option value="#f5f5dc" style={{ backgroundColor: '#f5f5dc' }}>
                Beige
              </option>
              <option value="#f0fff0" style={{ backgroundColor: '#f0fff0' }}>
                Light Green
              </option>
            </select>

            <select
              onChange={(e) => applyFormatting('fontSize', e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded"
            >
              <option value="">Size</option>
              <option value="1">Small</option>
              <option value="2">Medium</option>
              <option value="3">Large</option>
            </select>

            <button
              onClick={() => applyFormatting('bold')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('italic')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('underline')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('alignLeft')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('alignCenter')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('alignRight')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('list')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyFormatting('link')}
              className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100"
            >
              <Link className="h-4 w-4" />
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="p-4 min-h-[200px] focus:outline-none"
            onInput={handleContentChange}
            onFocus={() => setActiveField('body')}
          />
        </div>
      </div>
    </div>
  );
}