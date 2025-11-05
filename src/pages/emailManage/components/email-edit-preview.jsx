import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function EmailPreview({ emailContent }) {
  const [copied, setCopied] = useState(false)
  const currentYear = new Date().getFullYear()

  const generateEmailHTML = () => {
    return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: white; font-family: Arial, Helvetica, sans-serif;">
  <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <tr>
      <td style="padding-bottom: 20px;">
        ${emailContent.body || ''}
      </td>
    </tr>
 
    <tr>
      <td style="padding-bottom: 20px;">
        ${emailContent.footer || ''}
      </td>
    </tr>

    <tr>
      <td colspan="2" style="padding-top: 0px;">
        <p style="margin: 0; text-align: center; color: gray;">Copyright © ${currentYear} OptimalMD Technologies, LLC,
          All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  const copyHTML = () => {
    navigator.clipboard.writeText(generateEmailHTML())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">From:</div>
            <div className="col-span-2">admin.portal@yopmail.com</div>

            <div className="font-medium">To:</div>
            <div className="col-span-2">
              {emailContent.to || <span className="text-gray-400">No recipient specified</span>}
            </div>

            <div className="font-medium">Subject:</div>
            <div className="col-span-2 font-medium">
              {emailContent.subject || <span className="text-gray-400">No subject</span>}
            </div>
          </div>
        </div>
        <button
          onClick={copyHTML}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy HTML
            </>
          )}
        </button>
      </div>

      <div className="border rounded-md p-4 bg-white">
        <div className="space-y-4 mb-4">
          <div dangerouslySetInnerHTML={{ __html: emailContent.body || '' }} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border">
        <h3 className="text-sm font-medium mb-2">Preview Notes:</h3>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>This is a preview of how your email will look</li>
          <li>The From field, header logo, and copyright footer are fixed</li>
          <li>The To, Subject, message body, and footer content are editable</li>
          <li>Variables like $firstName will be replaced with actual values when sent</li>
        </ul>
      </div>
    </div>
  )
}