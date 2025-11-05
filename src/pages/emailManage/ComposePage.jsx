"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useFetchEmailsQuery, useSendEmailMutation } from "@/redux/features/email/emailApiSlice"
// import { useFetchPlansQuery } from "@/redux/features/plans/plansApiSlice"
// import { useFetchOrganizationsForSelectQuery } from "@/redux/features/organizations/organizationApiSlice"
import { EmailPreview } from "./components/email-preview"
import { EmailEditor } from "./components/email-editor"
import { toast } from "@/component/Toast"
import { companyEmail } from "@/constant/companyInfo"

export default function ComposePage() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const modalRef = useRef(null)
  const user = useSelector((state) => state.userSlice.user)
  const [sendEmail, { isLoading, isSuccess, isError, error }] = useSendEmailMutation()

  const [userType, setUserType] = useState("systemUsers") // "systemUsers" or "clients"

  // Email filter states
  const [selectionType, setSelectionType] = useState("allUsers") // "allUsers", "byRole", "byDepartment"
  const [filters, setFilters] = useState({
    role: [],
    department: [], // Will store department IDs
    status: [], // Default to Active for allUsers
  })

  const [clientFilters, setClientFilters] = useState({
    clientIds: [],
    member: [],
    senderType: "both", // "clients", "members", "both"
  })

  // Lifted states for bulk email sending
  const [isBulkSendMode, setIsBulkSendMode] = useState(false)
  const [bulkSendOptions, setBulkSendOptions] = useState([])

  // Fetch employee emails based on filters
  const { data: employeeEmails, isLoading: isLoadingEmails } = useFetchEmailsQuery(
    userType === "systemUsers"
      ? {
          role: filters.role,
          status: filters.status,
          department: filters.department,
        }
      : {
          role: "client",
          clientIds: clientFilters.clientIds,
          member: clientFilters.member,
          senderType: clientFilters.senderType,
        },
    {
      skip:
        userType === "systemUsers"
          ? selectionType === "allUsers" && filters.status.length === 0
          : clientFilters.clientIds.length === 0,
    },
  )

  const handleUserTypeChange = (type) => {
    setUserType(type)
    // Reset filters when switching user types
    setFilters({
      role: [],
      department: [],
      status: type === "systemUsers" ? ["Active"] : [],
    })
    setClientFilters({
      clientIds: [],
      member: [],
      senderType: "both",
    })
    setSelectionType("allUsers")
  }

  // Handle selection type changes
  const handleSelectionTypeChange = (type) => {
    setSelectionType(type)
    if (userType === "systemUsers") {
      if (type === "allUsers") {
        setFilters({
          role: [],
          department: [],
          status: ["Active"],
        })
      } else if (type === "byRole") {
        setFilters({
          role: [],
          department: [],
          status: [],
        })
      } else if (type === "byDepartment") {
        setFilters({
          role: [],
          department: [],
          status: [],
        })
      }
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (userType === "systemUsers") {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }))
    } else {
      setClientFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }))
    }
  }

  const [emailContent, setEmailContent] = useState({
    from: companyEmail,
    to: "",
    subject: "",
    messageBody: `
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans&family=Lato&family=Montserrat&family=Open+Sans&family=Poppins&family=Roboto&display=swap" rel="stylesheet">
       <p>Enter your email body here...</p>
          `,
    footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; ">As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;"><p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and may contain privileged, proprietary or confidential information intended solely for use by OptimalMD Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify us via return email. Please also delete this message, its attachments and all copies, electronic or print, without further distribution.</font></p></td></tr>`,
  })

  // Fetch data for react-select options (lifted)
  // const { data: fetchedPlans, isLoading: fetchingPlans } = useFetchPlansQuery({
  //   category: "",
  //   search: ""
  // })
  const fetchedPlans = []
  const fetchingPlans = false
  // const { data: orgSelectData, isLoading: isOrgSelectDataLoading } = useFetchOrganizationsForSelectQuery()
  const orgSelectData = []
  const isOrgSelectDataLoading = false

  // Prepare options for react-select (lifted)
  const planOptions = fetchedPlans?.map((plan) => ({ value: plan._id, label: plan.name })) || []
  const orgOptions = orgSelectData?.orgs?.map((org) => ({ value: org._id, label: org.orgName })) || []

  const handleSendEmail = async () => {
    try {
      // Validate email fields
      if (!emailContent.to) {
        toast.error("Please enter a recipient email address")
        return
      }

      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      if (!emailRegex.test(String(emailContent.to).toLowerCase())) {
        toast.error("Please enter a valid email address")
        return
      }

      if (!emailContent.subject) {
        toast.error("Please enter an email subject")
        return
      }

      if (!emailContent.messageBody || emailContent.messageBody.trim() === "") {
        toast.error("Please enter a message body")
        return
      }

      await sendEmail({
        to: emailContent.to,
        subject: emailContent.subject,
        body: emailContent.messageBody,
        userId: user._id,
      }).unwrap()

      toast.success("Email sent successfully")
      setEmailContent({
        from: companyEmail,
        to: "",
        subject: "",
        messageBody: "",
        footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0;">As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin@haquedigital.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin@haquedigital.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Founder & CEO</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;"><p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and may contain privileged, proprietary or confidential information intended solely for use by OptimalMD Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify us via return email. Please also delete this message, its attachments and all copies, electronic or print, without further distribution.</font></p></td></tr>`,
      })
      setOpen(false)
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error(error?.data?.message || "Failed to send email")
    }
  }

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscapeKey)
    } else {
      document.removeEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [open])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [open])

  return (
    <div className="mx-auto px-4 sm:px-32">
      <div className="bg-white  mx-auto pb-10">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Email Template Editor</h2>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "edit" ? "border-b-2 border-gray-800 text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "preview" ? "border-b-2 border-gray-800 text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "edit" ? (
            <EmailEditor
              setIsBulkSendMode={setIsBulkSendMode}
              emailContent={emailContent}
              isSingleLoading={isLoading}
              setEmailContent={setEmailContent}
              handleSendEmail={handleSendEmail}
              userType={userType}
              onUserTypeChange={handleUserTypeChange}
              selectionType={selectionType}
              onSelectionTypeChange={handleSelectionTypeChange}
              filters={userType === "systemUsers" ? filters : clientFilters}
              onFilterChange={handleFilterChange}
              employeeEmails={employeeEmails?.emails || []}
              isLoadingEmails={isLoadingEmails}
              isBulkSendMode={isBulkSendMode}
              setBulkSendOptions={setBulkSendOptions}
              bulkSendOptions={bulkSendOptions}
            />
          ) : (
            <EmailPreview
              emailContent={emailContent}
              isBulkSendMode={isBulkSendMode}
              bulkSendOptions={bulkSendOptions}
              planOptions={planOptions}
              orgOptions={orgOptions}
            />
          )}
        </div>
      </div>
    </div>
  )
}
