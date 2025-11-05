import { useRef, useEffect, useCallback } from "react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  ImageIcon,
  SquarePlus,
  Table,
} from "lucide-react"
import { useState } from "react"
import { toast } from "./Toast"

const SyntaxHighlightedCode = ({ code, onChange, onFocus, minHeight }) => {
  const [highlightedCode, setHighlightedCode] = useState("")
  const textareaRef = useRef(null)
  const preRef = useRef(null)

  const highlightHTML = useCallback((html) => {
    // Just escape HTML and apply basic coloring without complex regex
    let result = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")

    // Simple highlighting - just color the basic elements
    result = result
      // HTML tags - color the entire tag structure
      .replace(
        /(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)([^&]*?)(&gt;)/g,
        '<span style="color: #569cd6;">$1$2</span><span style="color: #92c5f8;">$3</span><span style="color: #569cd6;">$4</span>',
      )
      // Attribute values in quotes (simple pattern)
      .replace(/=(&quot;[^&]*?&quot;)/g, '=<span style="color: #ce9178;">$1</span>')
      // Comments
      .replace(/(&lt;!--.*?--&gt;)/gs, '<span style="color: #6a9955;">$1</span>')

    return result
  }, [])

  useEffect(() => {
    const highlighted = highlightHTML(code)
    setHighlightedCode(highlighted)
  }, [code, highlightHTML])

  // Sync scroll between textarea and pre
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop
      preRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  // Handle tab key for indentation
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newValue = code.substring(0, start) + "  " + code.substring(end)
      onChange({ target: { value: newValue } })

      // Restore cursor position
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }
  }

  const lineCount = code.split("\n").length
  const lineNumberWidth = Math.max(2, lineCount.toString().length) * 8 + 16

  return (
    <div className="relative w-full bg-gray-900" style={{ minHeight }}>
      {/* Line numbers */}
      <div
        className="absolute left-0 top-0 bg-gray-800 border-r border-gray-700 text-gray-400 font-mono text-xs select-none pointer-events-none z-10"
        style={{
          width: `${lineNumberWidth}px`,
          minHeight,
          padding: "16px 8px",
          lineHeight: "1.5",
          fontSize: "13px",
          fontFamily: 'Consolas, "Courier New", monospace',
        }}
      >
        {code.split("\n").map((_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>

      <pre
        ref={preRef}
        className="absolute inset-0 font-mono text-sm overflow-auto whitespace-pre-wrap break-words pointer-events-none z-20"
        style={{
          minHeight,
          lineHeight: "1.5",
          tabSize: 2,
          fontSize: "13px",
          fontFamily: 'Consolas, "Courier New", monospace',
          paddingLeft: `${lineNumberWidth + 8}px`,
          paddingTop: "16px",
          paddingRight: "16px",
          paddingBottom: "16px",
          color: "#d4d4d4", // Default text color
        }}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />

      <textarea
        ref={textareaRef}
        value={code}
        onChange={onChange}
        onFocus={onFocus}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="relative w-full font-mono text-sm bg-transparent text-transparent focus:outline-none resize-none overflow-auto z-30"
        style={{
          minHeight,
          lineHeight: "1.5",
          tabSize: 2,
          fontSize: "13px",
          fontFamily: 'Consolas, "Courier New", monospace',
          paddingLeft: `${lineNumberWidth + 8}px`,
          paddingTop: "16px",
          paddingRight: "16px",
          paddingBottom: "16px",
          caretColor: "#ffffff",
        }}
        spellCheck="false"
        placeholder=""
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  )
}

// Formatting toolbar component (moved here as it's tightly coupled with the editor)
const FormattingToolbar = ({ onFormat, editorRef, buttonBackgroundColor, setButtonBackgroundColor }) => (
  <div className="flex items-center gap-2 p-2 bg-gray-50 border-b flex-wrap overflow-x-auto">
    <select
      onChange={(e) => onFormat("fontName", editorRef, e.target.value)}
      className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
    >
      <option value="">Font</option>
      <option value="Arial">Arial</option>
      <option value="Helvetica">Helvetica</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
      <option value="Verdana">Verdana</option>
      <option value="Trebuchet MS">Trebuchet MS</option>
      <option value="Tahoma">Tahoma</option>
      <option value="Lucida Console">Lucida Console</option>
      <option value="Impact">Impact</option>
      <option value="Comic Sans MS">Comic Sans MS</option>
      <option value="Segoe UI">Segoe UI</option>
      <option value="Calibri">Calibri</option>
      <option value="Cambria">Cambria</option>
      <option value="Garamond">Garamond</option>
      <option value="Palatino Linotype">Palatino Linotype</option>
      <option value="Monaco">Monaco</option>
      <option value="Roboto">Roboto</option>
      <option value="Open Sans">Open Sans</option>
      <option value="Lato">Lato</option>
      <option value="Poppins">Poppins</option>
      <option value="Montserrat">Montserrat</option>
    </select>

    <select
      onChange={(e) => onFormat("fontSize", editorRef, e.target.value)}
      className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
    >
      <option value="">Size</option>
      <option value="1">Small</option>
      <option value="2">Medium</option>
      <option value="3">Large</option>
      <option value="4">X-Large</option>
      <option value="5">XX-Large</option>
    </select>

    <div className="flex items-center gap-1">
      <label htmlFor="textColorPicker" className="text-xs text-gray-700">
        Text Color
      </label>
      <input
        id="textColorPicker"
        type="color"
        onChange={(e) => onFormat("foreColor", editorRef, e.target.value)}
        className="h-8 w-8 p-0 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
        title="Text Color"
        style={{ backgroundColor: "white" }}
        defaultValue="#28282B"
      />
    </div>

    <div className="flex items-center gap-1">
      <label htmlFor="highlightColorPicker" className="text-xs text-gray-700">
        Highlight
      </label>
      <input
        id="highlightColorPicker"
        type="color"
        onChange={(e) => onFormat("backColor", editorRef, e.target.value)}
        className="h-8 w-8 p-0 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
        title="Highlight Color"
        style={{ backgroundColor: "white" }}
      />
    </div>

    <div className="flex items-center gap-1">
      <label htmlFor="buttonColorPicker" className="text-xs text-gray-700">
        Button Color
      </label>
      <input
        id="buttonColorPicker"
        type="color"
        value={buttonBackgroundColor}
        onChange={(e) => setButtonBackgroundColor(e.target.value)}
        className="h-8 w-8 p-0 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
        title="Button Color"
        style={{ backgroundColor: "white" }}
      />
    </div>

    <div className="h-6 w-px bg-gray-300 mx-1" />

    <button
      type="button"
      onClick={() => onFormat("bold", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Bold"
    >
      <Bold className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onFormat("italic", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Italic"
    >
      <Italic className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onFormat("underline", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Underline"
    >
      <Underline className="h-4 w-4" />
    </button>
    <div className="h-6 w-px bg-gray-300 mx-1" />
    <button
      type="button"
      onClick={() => onFormat("alignLeft", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Align Left"
    >
      <AlignLeft className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onFormat("alignCenter", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Align Center"
    >
      <AlignCenter className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onFormat("alignRight", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Align Right"
    >
      <AlignRight className="h-4 w-4" />
    </button>
    <div className="h-6 w-px bg-gray-300 mx-1" />
    <button
      type="button"
      onClick={() => onFormat("list", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Bullet List"
    >
      <List className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onFormat("link", editorRef)}
      className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
      title="Insert Link"
    >
      <Link className="h-4 w-4" />
    </button>
    <div
      onClick={() => onFormat("insertButton", editorRef, null, buttonBackgroundColor)}
      className="flex cursor-pointer flex-col items-center gap-1 border border-gray-200 p-1 rounded-md"
    >
      <button
        type="button"
        // onClick={() => onFormat("insertButton", editorRef, null, buttonBackgroundColor)}
        className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
        title="Insert Button"
      >
        <SquarePlus className="h-4 w-4" />
      </button>
      <span className="text-xs text-gray-600">Insert Button</span>
    </div>
    <div
      onClick={() => onFormat("insertImage", editorRef)}
      className="flex cursor-pointer flex-col items-center gap-1 border border-gray-200 p-1 rounded-md"
    >
      <button
        type="button"
        // onClick={() => onFormat("insertImage", editorRef)}
        className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
      <span className="text-xs text-gray-600">Insert Image</span>
    </div>
    <div
      onClick={() => onFormat("insertTable", editorRef)}
      className="flex cursor-pointer flex-col items-center gap-1 border border-gray-200 p-1 rounded-md"
    >
      <button
        type="button"
        className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-primary-100 transition-colors"
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </button>
      <span className="text-xs text-gray-600">Insert Table</span>
    </div>
  </div>
)

export function RichTextEditor({
  initialContent,
  onContentChange,
  onFocus,
  minHeight = "120px",
  buttonBackgroundColor,
  setButtonBackgroundColor,
}) {
  const editorRef = useRef(null)
  const isUpdatingFromCode = useRef(false)
  const [editorContent, setEditorContent] = useState(initialContent)

  const saveCursorPosition = useCallback(() => {
    if (!editorRef?.current) return null

    const selection = window.getSelection()
    if (selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    if (!editorRef.current.contains(range.commonAncestorContainer)) return null

    // Get text offset instead of DOM range for more reliable restoration
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    return {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length + range.toString().length,
    }
  }, [])

  const restoreCursorPosition = useCallback((position) => {
    if (!position || !editorRef?.current) return

    const selection = window.getSelection()
    const range = document.createRange()

    let charCount = 0
    const nodeStack = [editorRef.current]
    let node,
      foundStart = false,
      foundEnd = false

    while ((node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.textContent.length

        if (!foundStart && position.start >= charCount && position.start <= nextCharCount) {
          range.setStart(node, position.start - charCount)
          foundStart = true
        }

        if (foundStart && position.end >= charCount && position.end <= nextCharCount) {
          range.setEnd(node, position.end - charCount)
          foundEnd = true
          break
        }

        charCount = nextCharCount
      } else {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i])
        }
      }
    }

    if (foundStart) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [])

  // Setup link handlers
  const setupLinkHandlers = useCallback(() => {
    if (!editorRef?.current) return

    const links = editorRef.current.querySelectorAll("a")
    links.forEach((link) => {
      link.style.color = "#3a41e2 !important" // OptimalMD green color
      link.style.textDecoration = "underline !important"

      // Remove existing event listeners to prevent duplicates
      const newLink = link.cloneNode(true)
      link.parentNode.replaceChild(newLink, link)

      // Make links not clickable in the editor by preventing default behavior
      newLink.addEventListener("click", (e) => {
        e.preventDefault()
      })
    })
  }, [])

  // Apply formatting function
  const applyFormatting = useCallback(
    (format, editorRef, value = null, buttonColor = null) => {
      const editor = editorRef.current
      if (!editor) return

      saveCursorPosition()
      editor.focus()

      switch (format) {
        case "bold":
          document.execCommand("bold", false)
          break
        case "italic":
          document.execCommand("italic", false)
          break
        case "underline":
          document.execCommand("underline", false)
          break
        case "alignLeft":
          document.execCommand("justifyLeft", false)
          break
        case "alignCenter":
          document.execCommand("justifyCenter", false)
          break
        case "alignRight":
          document.execCommand("justifyRight", false)
          break
        case "list":
          document.execCommand("insertUnorderedList", false)
          break
        case "link":
          const url = prompt("Enter URL:", "https://")
          if (url) {
            document.execCommand("createLink", false, url)
            setupLinkHandlers() // Re-apply handlers after link insertion
          }
          break
        case "fontName":
          if (value) document.execCommand("fontName", false, value)
          break
        case "fontSize":
          if (value) document.execCommand("fontSize", false, value)
          break
        case "foreColor":
          if (value) document.execCommand("foreColor", false, value)
          break
        case "backColor":
          if (value) document.execCommand("backColor", false, value)
          break
        case "insertButton":
          const buttonText = prompt("Enter button text:", "Click Me")
          if (!buttonText) return
          const buttonLink = prompt("Enter button link (URL):", "https://")
          if (!buttonLink) return

          const finalButtonColor = buttonColor || "#3a41e2"
          const buttonHtml = `<p style="text-align: left;"><a href="${buttonLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: ${finalButtonColor}; color: white !important; text-decoration: none; border-radius: 5px; font-family: inherit; font-size: inherit;">${buttonText}</a></p>`
          document.execCommand("insertHTML", false, buttonHtml)
          break
        case "insertImage":
          const input = document.createElement("input")
          input.type = "file"
          input.accept = "image/*"
          input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (readerEvent) => {
                const base64Data = readerEvent.target.result
                const imgWidth = prompt("Enter image width (e.g., 300px or 50%):", "300px")
                const imgHeight = prompt("Enter image height (e.g., 200px or auto):", "auto")

                const imgHtml = `<p style="text-align: left;"><img src="${base64Data}" style="max-width: 100%; height: auto; display: inline-block; width: ${imgWidth || "auto"}; height: ${imgHeight || "auto"};" /></p>`
                document.execCommand("insertHTML", false, imgHtml)
                onContentChange(editor.innerHTML) // Update parent state
                restoreCursorPosition()
              }
              reader.readAsDataURL(file)
            }
          }
          input.click()
          break
        case "insertTable":
          const rows = prompt("Enter number of rows:", "3")
          const cols = prompt("Enter number of columns:", "3")
          if (rows && cols && !isNaN(rows) && !isNaN(cols) && Number.parseInt(rows) > 0 && Number.parseInt(cols) > 0) {
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">'
            tableHtml += '<thead><tr style="background-color: #f2f2f2;">'
            for (let i = 0; i < Number.parseInt(cols); i++) {
              tableHtml += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">&nbsp;</th>' // Added &nbsp;
            }
            tableHtml += "</tr></thead><tbody>"
            for (let i = 0; i < Number.parseInt(rows); i++) {
              tableHtml += "<tr>"
              for (let j = 0; j < Number.parseInt(cols); j++) {
                tableHtml += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>' // Added &nbsp;
              }
              tableHtml += "</tr>"
            }
            tableHtml += "</tbody></table>"
            document.execCommand("insertHTML", false, tableHtml)
          } else {
            toast.error("Please enter valid numbers for rows and columns.")
          }
          break
        default:
          return
      }

      // Update the content state after formatting (unless it's an image, which handles its own)
      if (format !== "insertImage") {
        onContentChange(editor.innerHTML)
        restoreCursorPosition()
      }
    },
    [onContentChange, saveCursorPosition, restoreCursorPosition, setupLinkHandlers],
  )

  const handleInput = useCallback(() => {
    if (isUpdatingFromCode.current) return

    const currentContent = editorRef.current.innerHTML

    // Update states without triggering cursor position changes
    setEditorContent(currentContent)
    onContentChange(currentContent)
    setupLinkHandlers()
  }, [onContentChange, setupLinkHandlers])

  const handleHtmlContentChange = (e) => {
    const newHtml = e.target.value
    const cursorPosition = saveCursorPosition()

    setEditorContent(newHtml)
    onContentChange(newHtml)

    // Update visual editor with new HTML content
    if (editorRef.current) {
      isUpdatingFromCode.current = true
      editorRef.current.innerHTML = newHtml
      setupLinkHandlers()

      // Restore cursor position after a brief delay to allow DOM to update
      setTimeout(() => {
        if (cursorPosition) {
          restoreCursorPosition(cursorPosition)
        }
        isUpdatingFromCode.current = false
      }, 0)
    }
  }

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      isUpdatingFromCode.current = true
      editorRef.current.innerHTML = initialContent
      setEditorContent(initialContent)
      setupLinkHandlers()
      isUpdatingFromCode.current = false
    }
  }, [initialContent, setupLinkHandlers])

  // Add CSS to style links in the editor
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      [contenteditable] a {
        color: #3a41e2 !important;
        text-decoration: underline !important;
        cursor: pointer !important;
      }
      [contenteditable] a:hover {
        text-decoration: underline !important;
        opacity: 0.8;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <FormattingToolbar
        onFormat={applyFormatting}
        editorRef={editorRef}
        buttonBackgroundColor={buttonBackgroundColor}
        setButtonBackgroundColor={setButtonBackgroundColor}
      />
      <div className="flex h-full">
        <div className="w-1/2 border-r bg-white">
          <div
            ref={editorRef}
            contentEditable
            className="p-4 focus:outline-none bg-white"
            style={{ minHeight: minHeight }}
            onInput={handleInput}
            onFocus={onFocus}
          />
        </div>
        <div className="w-1/2 bg-gray-900">
          <SyntaxHighlightedCode
            code={editorContent}
            onChange={handleHtmlContentChange}
            onFocus={onFocus}
            minHeight={minHeight}
          />
        </div>
      </div>
    </div>
  )
}
