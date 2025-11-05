import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function EmailPreview({ emailContent, isBulkSendMode, bulkSendOptions, planOptions, orgOptions }) {
  const [copied, setCopied] = useState(false)
  const currentYear = new Date().getFullYear()

  const generateEmailHTML = () => {
    return `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: white; font-family: Arial, Helvetica, sans-serif;">
<table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">


  <tr>
    <td style="padding-bottom: 20px;">
      ${emailContent.messageBody}
    </td>
  </tr>

  <tr>
    <td style="padding-bottom: 20px;">
      ${emailContent.footer}
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

  // Function to generate the "To" display string for bulk mode
  const getBulkToDisplay = () => {
    const { role, plan, orgId } = bulkSendOptions

    const roleLabels = {
      SubAffiliate: "Sub-Affiliate Partners",
      AffiliatePartner: "Affiliate Partners",
      SalesPartner: "Benefits Administrators",
      Organization: "Organization",
      User: "Individual Users",
      Plan: "Plans",
    }

    let displayString = roleLabels[role] || "Bulk Users"

    if (role === "Organization" && orgId) {
      const selectedOrg = orgOptions.find((org) => org.value === orgId)
      if (selectedOrg) {
        displayString += ` (${selectedOrg.label})`
      }
    } else if (role === "Plan" && plan.length > 0) {
      const selectedPlanNames = planOptions
        .filter((p) => plan.includes(p.value))
        .map((p) => p.label)
        .join(", ")
      displayString += ` (${selectedPlanNames})`
    }

    return displayString
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">From:</div>
            <div className="col-span-2">{emailContent.from}</div>

            <div className="font-medium">To:</div>
            <div className="col-span-2">
              {isBulkSendMode
                ? getBulkToDisplay()
                : emailContent.to || <span className="text-gray-400">No recipient specified</span>}
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

      <div className="p-4 max-w-xl mx-auto bg-white">
        <div className="space-y-4 mb-4 text-wrap">
          <div dangerouslySetInnerHTML={{ __html: emailContent.messageBody }} />
        </div>
      </div>
    </div>
  )
}
