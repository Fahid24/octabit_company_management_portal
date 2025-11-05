import {
    useCreateTemplateMutation,
    useDeleteTemplateMutation,
    useGetTemplatesQuery,
    useUpdateTemplateMutation,
    useGetCategoriesQuery,
} from "@/redux/features/email/emailApiSlice"
import Tooltip from "@/component/Tooltip"

import {
    AlertCircle,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    CircleAlert,
    Eye,
    Italic,
    Link,
    List,
    Mail,
    Pencil,
    Plus,
    Search,
    Trash2,
    Underline,
    X,
    Settings,
    RotateCcw,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { CreateTemplateModal } from "./components/CreateTemplateModal"
import UpdateTemplateModal from "./components/UpdateTemplateModal"
import PreviewTemplateModal from "./components/PreviewTemplateModal"
import ManageCategoryModal from "./components/ManageCategoryModal"
import Loader from "@/component/Loader"
import Tooltip2 from "@/component/Tooltip2"
import Select from "react-select"
import { toast } from "@/component/Toast"

const Template = () => {
    const [activeField, setActiveField] = useState(null)
    const [showNewTemplateForm, setShowNewTemplateForm] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
    const [previewTemplate, setPreviewTemplate] = useState(null)
    const [templateType, setTemplateType] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [showManageCategoryModal, setShowManageCategoryModal] = useState(false)
    const [spinning, setSpinning] = useState(false)
    const [emailContent, setEmailContent] = useState({
        from: "admin.portal@yopmail.com",
        to: "",
        subject: "",
        messageBody:
            "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to reach out regarding your recent inquiry about our services.</p><p>Looking forward to hearing from you soon.</p>",
        footer: `<tr><td style="padding: 0px;"><p style="margin: 0 0 10px 0; " >As always, if you have any questions or need assistance, you may contact us at <a href="mailto:admin.portal@yopmail.com" style="color: #3a41e2; font-weight: 700; text-decoration: none;">admin.portal@yopmail.com</a>.</p><p style="margin: 0;">Thank you for choosing OptimalMD,</p><p style="margin: 0;">Shawn Fry</p><p style="margin: 0;">OptimalMD Technologies</p></td></tr><td style="padding: 0px;">            <p style="margin: 20px 0px 0px; text-align: justify;"><font size="2" style="" color="#808080">This message, and any attachments, is for the exclusive use of the intended recipient and                may contain privileged, proprietary or confidential information intended solely for use by OptimalMD                Technologies, LLC. and the intended recipient. If you are not the intended recipient, please notify me via                return email. Please also delete this message, its attachments and all copies, electronic or print, without                further distribution.</font></p>            </td>`,
    })
    const [newTemplate, setNewTemplate] = useState({
        title: "",
        content: "<p>Enter your email body here...</p>",
        des: "",
    })
    const [selectedTemplateCategory, setSelectedTemplateCategory] = useState(null)

    const user = useSelector((state) => state.userSlice.user)

    // Refs for the editors
    const messageBodyEditorRef = useRef(null)
    const footerEditorRef = useRef(null)
    const templateEditorRef = useRef(null)
    const editTemplateEditorRef = useRef(null)

    // Flag to prevent content updates from input events when we're programmatically changing content
    const isUpdatingContent = useRef(false)

    // Store the last known cursor position
    const lastCursorPosition = useRef(null)

    // Redux API hooks
    const {
        data,
        isLoading: getLoad,
        error: getError,
        refetch,
    } = useGetTemplatesQuery(
        {
            status: templateType?.value,
            category: selectedCategory?.value || "",
        },
        { refetchOnMountOrArgChange: true },
    )
    // Add this after the existing Redux API hooks
    const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery()
    const [createTemplate, { isLoading }] = useCreateTemplateMutation()
    const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation()
    const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation()

    // Fallback templates in case API fails
    const [emailTemplates, setEmailTemplates] = useState([
        {
            id: "welcome",
            name: "Welcome Email",
            body: "<p>Hi $firstName,</p><p>Welcome to OptimalMD! We're thrilled to have you join our community of healthcare professionals.</p><p>Our platform is designed to help you streamline your practice and provide better care for your patients.</p><p>If you have any questions, please don't hesitate to reach out.</p>",
        },
        {
            id: "followup",
            name: "Follow-up Email",
            body: "<p>Hi $firstName,</p><p>I hope this email finds you well. I wanted to follow up on our recent conversation about OptimalMD's services.</p><p>Have you had a chance to review the information I sent over? I'd be happy to answer any questions you might have.</p>",
        },
        {
            id: "appointment",
            name: "Appointment Reminder",
            body: "<p>Hi $firstName,</p><p>This is a friendly reminder about your upcoming appointment on $appointmentDate.</p><p>If you need to reschedule, please let us know at least 24 hours in advance.</p><p>We look forward to seeing you!</p>",
        },
        {
            id: "thankyou",
            name: "Thank You Email",
            body: "<p>Hi $firstName,</p><p>Thank you for choosing OptimalMD for your healthcare needs. We appreciate your trust in our services.</p><p>Your feedback is important to us. If you have a moment, we'd love to hear about your experience.</p>",
        },
        {
            id: "billing",
            name: "Billing Information",
            body: "<p>Hi $firstName,</p><p>I'm writing to provide you with information about your recent billing statement from OptimalMD.</p><p>Your invoice #$invoiceNumber for $amount is due on $dueDate. You can view and pay your invoice online through our secure patient portal.</p><p>If you have any questions about your bill, please contact our billing department.</p>",
        },
        {
            id: "newfeature",
            name: "New Feature Announcement",
            body: "<p>Hi $firstName,</p><p>We're excited to announce a new feature on the OptimalMD platform!</p><p>We've added $featureName to help you better manage your practice. This new tool allows you to $featureDescription.</p><p>Log in to your account to try it out today!</p>",
        },
        {
            id: "prescription",
            name: "Prescription Renewal",
            body: "<p>Hi $firstName,</p><p>This is a notification that your prescription for $medication is due for renewal.</p><p>Please contact our office at your earliest convenience to schedule an appointment for evaluation before your current prescription expires on $expiryDate.</p>",
        },
        {
            id: "labresults",
            name: "Lab Results Available",
            body: "<p>Hi $firstName,</p><p>Your recent lab results are now available for review in your patient portal.</p><p>Please log in to view your results. If you have any questions or concerns, don't hesitate to contact us to discuss them with your healthcare provider.</p>",
        },
        {
            id: "referral",
            name: "Specialist Referral",
            body: "<p>Hi $firstName,</p><p>As discussed during your recent appointment, I've referred you to $specialistName, a specialist in $specialtyArea.</p><p>Their office will contact you shortly to schedule an appointment, or you can reach them directly at $specialistPhone.</p>",
        },
        {
            id: "feedback",
            name: "Feedback Request",
            body: "<p>Hi $firstName,</p><p>Thank you for your recent visit to OptimalMD. We value your opinion and would appreciate your feedback on your experience.</p><p>Please take a moment to complete our short survey by clicking the link below:</p><p><a href='$surveyLink' style='color: #3a41e2;'>Patient Satisfaction Survey</a></p>",
        },
    ])

    // Initialize editor content on mount
    useEffect(() => {
        if (messageBodyEditorRef.current) {
            messageBodyEditorRef.current.innerHTML = emailContent.messageBody
        }
        if (footerEditorRef.current) {
            footerEditorRef.current.innerHTML = emailContent.footer
        }
    }, [])
    // console.log(data)
    // Filter templates based on search term and category
    const filteredTemplates = data?.filter((template) => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            if (!template?.title?.toLowerCase().includes(searchLower)) {
                return false
            }
        }

        // Category filter
        // if (selectedCategory && selectedCategory.value !== "all") {
        //   if (selectedCategory.value === "uncategorized") {
        //     // Show templates without category
        //     if (template.categoryId) return false
        //   } else {
        //     // Show templates with specific category
        //     if (template.categoryId !== selectedCategory.value) return false
        //   }
        // }

        return true
    })

    // Save cursor position before any state update
    const saveCursorPosition = (editorRef) => {
        if (!editorRef?.current) return
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            if (editorRef.current.contains(range.commonAncestorContainer)) {
                lastCursorPosition.current = {
                    editorRef,
                    range: range.cloneRange(),
                }
            }
        }
    }

    // Restore cursor position after state update
    const restoreCursorPosition = () => {
        if (!lastCursorPosition.current) return
        const { editorRef, range } = lastCursorPosition.current
        if (editorRef?.current) {
            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
            editorRef.current.focus()
        }
    }

    // Completely revised content change handler
    const handleContentChange = (field, editorRef) => {
        if (isUpdatingContent.current) return
        // Save cursor position
        saveCursorPosition(editorRef)
        // Update state without triggering re-render of the editor content
        setEmailContent((prev) => ({
            ...prev,
            [field]: editorRef.current.innerHTML,
        }))
        // Setup link handlers
        setupLinkHandlers(editorRef)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEmailContent((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNewTemplateChange = (e) => {
        const { name, value } = e.target
        setNewTemplate({
            ...newTemplate,
            [name]: value,
        })
    }

    const handleTemplateContentChange = (editorRef) => {
        if (!editorRef?.current) return
        setNewTemplate({
            ...newTemplate,
            content: editorRef.current.innerHTML,
        })
    }

    // Add email validation function after the setupLinkHandlers function
    const validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    // Replace the saveNewTemplate function with this updated version
    const saveNewTemplate = async () => {
        if (!newTemplate.title.trim()) {
            toast.error("Please provide a title for your template")
            return
        }

        if (!newTemplate.content?.trim() || newTemplate.content === "<p>Enter your email body here...</p>") {
            toast.error("Please provide content for your template")
            return
        }

        try {
            // Create a new template object
            const templateId = newTemplate.title.toLowerCase().replace(/\s+/g, "-")
            const templateContent = newTemplate.content
            const newTemplateObj = {
                id: templateId,
                name: newTemplate.title,
                body: templateContent,
            }

            // Add to templates array (fallback)
            setEmailTemplates([...emailTemplates, newTemplateObj])

            // Send to API
            await createTemplate({
                subject: newTemplate.subject || "",
                header: "",
                footer: "",
                title: newTemplate.title,
                des: newTemplate.des || "",
                body: `<link href="https://fonts.googleapis.com/css2?family=DM+Sans&family=Lato&family=Montserrat&family=Open+Sans&family=Poppins&family=Roboto&display=swap" rel="stylesheet">
                ${templateContent}`,
                category: selectedTemplateCategory?.value || "",
                userId: user?._id,
                userModel: user?.role,
            }).unwrap()

            toast.success("Template created successfully!")
            await refetch()

            // Reset form and close it
            setNewTemplate({ title: "", subject: "", content: "<p>Enter your email body here...</p>" })
            setSelectedTemplateCategory(null)
            setShowNewTemplateForm(false)
        } catch (err) {
            toast.error("Failed to create template. Please try again.")
            console.error("Template creation error:", err)
        }
    }

    // Replace the saveEditedTemplate function with this updated version
    const saveEditedTemplate = async () => {
        if (!newTemplate.title.trim()) {
            toast.error("Please provide a title for your template")
            return
        }

        if (!newTemplate.content?.trim() || newTemplate.content === "<p>Enter your email body here...</p>") {
            toast.error("Please provide content for your template")
            return
        }

        try {
            // Get content directly from the editor
            const editorContent = newTemplate.content

            // Update the template in the API
            await updateTemplate({
                id: editingTemplate,
                title: newTemplate.title,
                des: newTemplate.des || "",
                subject: newTemplate.subject || "",
                header: "",
                footer: "",
                body: editorContent,
                userId: user?._id,
                userModel: user?.role,
                category: selectedTemplateCategory?.value || "",
            }).unwrap()

            toast.success("Template updated successfully!")
            await refetch()

            // Update local state for immediate UI update
            const updatedTemplates = emailTemplates.map((template) => {
                if (template.id === editingTemplate) {
                    return {
                        id: editingTemplate,
                        name: newTemplate.title,
                        body: editorContent,
                    }
                }
                return template
            })
            setEmailTemplates(updatedTemplates)

            setNewTemplate({ title: "", subject: "", content: "<p>Enter your email body here...</p>" })
            setSelectedTemplateCategory(null)
            setEditingTemplate(null)
        } catch (err) {
            toast.error(err?.data?.error || "Failed to update template. Please try again.")
            console.error("Template update error:", err)
        }
    }

    const cancelEdit = () => {
        setEditingTemplate(null)
        setSelectedTemplateCategory(null)
        setNewTemplate({ title: "", subject: "", content: "<p>Enter your email body here...</p>" })
    }

    const confirmDeleteTemplate = (templateId) => {
        setShowDeleteConfirm(templateId)
    }

    const deleteTemplateItem = async (templateId) => {
        const data = {
            id: templateId,
            userId: user?._id,
            userModel: user?.role,
        }

        try {
            await deleteTemplate(data).unwrap()
            toast.success("Template deleted successfully!")
            await refetch()

            // Update local state for immediate UI update
            const updatedTemplates = emailTemplates.filter((template) => template.id !== templateId)
            setEmailTemplates(updatedTemplates)
            setShowDeleteConfirm(null)
        } catch (err) {
            toast.error("Failed to delete template. Please try again.")
            console.error("Template deletion error:", err)
        }
    }

    const applyFormatting = (format, editorRef = null, value = null) => {
        // Determine which editor to use
        let editor
        if (editorRef) {
            editor = editorRef.current
        } else if (activeField === "messageBody") {
            editor = messageBodyEditorRef.current
        } else if (activeField === "footer") {
            editor = footerEditorRef.current
        } else {
            return
        }

        if (!editor) return

        // Save cursor position
        saveCursorPosition(editorRef || (activeField === "messageBody" ? messageBodyEditorRef : footerEditorRef))

        // Make sure the editor has focus
        editor.focus()

        // Apply the formatting
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
                    // Apply styling to all links in the editor
                    const links = editor.querySelectorAll("a")
                    links.forEach((link) => {
                        link.style.color = "#3a41e2" // Changed from #0000FF to the OptimalMD green color
                        link.style.textDecoration = "underline"
                        link.style.cursor = "pointer"
                        // Add target="_blank" to open in new tab
                        link.setAttribute("target", "_blank")
                        // Prevent contentEditable from capturing clicks on links
                        link.addEventListener("click", (e) => {
                            if (!e.ctrlKey && !e.metaKey) {
                                e.preventDefault()
                                window.open(link.href, "_blank")
                            }
                        })
                    })
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
            default:
                return
        }

        // Update the content state after formatting
        if (editorRef === templateEditorRef) {
            handleTemplateContentChange(templateEditorRef)
        } else if (activeField === "messageBody") {
            handleContentChange("messageBody", messageBodyEditorRef)
        } else if (activeField === "footer") {
            handleContentChange("footer", footerEditorRef)
        }

        // Restore cursor position
        restoreCursorPosition()
    }

    // Add this function after the applyFormatting function
    const setupLinkHandlers = (editorRef) => {
        if (!editorRef?.current) return

        const links = editorRef.current.querySelectorAll("a")
        links.forEach((link) => {
            link.style.color = "#3a41e2" // OptimalMD green color
            link.style.textDecoration = "underline"
            // Remove existing event listeners to prevent duplicates
            const newLink = link.cloneNode(true)
            link.parentNode.replaceChild(newLink, link)
            // Make links not clickable in the editor by preventing default behavior
            newLink.addEventListener("click", (e) => {
                e.preventDefault()
            })
        })
    }

    // Completely revised applyTemplate function
    const applyTemplate = (templateId) => {
        // First check API data
        const apiTemplate = data?.find((t) => t._id === templateId || t.id === templateId)
        // Fallback to local templates if not found in API data
        const template = apiTemplate || emailTemplates.find((t) => t.id === templateId)

        if (template && messageBodyEditorRef.current) {
            // Set the flag to prevent input event handlers from updating state
            isUpdatingContent.current = true

            try {
                // Directly update the editor content
                messageBodyEditorRef.current.innerHTML = template.body

                // Update the React state without re-rendering the editor
                setEmailContent((prev) => ({
                    ...prev,
                    messageBody: template.body,
                }))

                // Set active field
                setActiveField("messageBody")

                // Focus the editor
                messageBodyEditorRef.current.focus()

                // Move cursor to the end
                const range = document.createRange()
                const selection = window.getSelection()

                // Place cursor at the end
                range.selectNodeContents(messageBodyEditorRef.current)
                range.collapse(false) // false means collapse to end
                selection.removeAllRanges()
                selection.addRange(range)

                // Scroll to the end if needed
                messageBodyEditorRef.current.scrollTop = messageBodyEditorRef.current.scrollHeight

                // Setup link handlers
                setupLinkHandlers(messageBodyEditorRef)
            } finally {
                // Reset the flag
                isUpdatingContent.current = false
            }
        }
    }

    // Formatting toolbar component for reuse
    const FormattingToolbar = ({ onFormat, editorRef }) => (
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
            <select
                onChange={(e) => onFormat("foreColor", editorRef, e.target.value)}
                className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                style={{ backgroundColor: "white" }}
            >
                <option value="">Text Color</option>
                <option value="#28282B" style={{ color: "#28282B" }}>
                    Black
                </option>
                <option value="#ffffff" style={{ color: "#28282B" }}>
                    White
                </option>
                <option value="#3a41e2" style={{ color: "#3a41e2" }}>
                    OptimalMD Green
                </option>
                <option value="#FF0000" style={{ color: "#FF0000" }}>
                    Red
                </option>
                <option value="#0000FF" style={{ color: "#0000FF" }}>
                    Blue
                </option>
                <option value="#008000" style={{ color: "#008000" }}>
                    Green
                </option>
                <option value="#FFA500" style={{ color: "#FFA500" }}>
                    Orange
                </option>
                <option value="#800080" style={{ color: "#800080" }}>
                    Purple
                </option>
                <option value="#A52A2A" style={{ color: "#A52A2A" }}>
                    Brown
                </option>
                <option value="#808080" style={{ color: "#808080" }}>
                    Gray
                </option>
            </select>
            <select
                onChange={(e) => onFormat("backColor", editorRef, e.target.value)}
                className="h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                style={{ backgroundColor: "white" }}
            >
                <option value="">Highlight</option>
                <option value="#ffffff" style={{ backgroundColor: "#ffffff" }}>
                    None
                </option>
                <option value="#ffff00" style={{ backgroundColor: "#ffff00" }}>
                    Yellow
                </option>
                <option value="#00ffff" style={{ backgroundColor: "#00ffff" }}>
                    Cyan
                </option>
                <option value="#ff00ff" style={{ backgroundColor: "#ff00ff" }}>
                    Magenta
                </option>
                <option value="#ffd700" style={{ backgroundColor: "#ffd700" }}>
                    Gold
                </option>
                <option value="#f0f8ff" style={{ backgroundColor: "#f0f8ff" }}>
                    Light Blue
                </option>
                <option value="#f5f5dc" style={{ backgroundColor: "#f5f5dc" }}>
                    Beige
                </option>
                <option value="#f0fff0" style={{ backgroundColor: "#f0fff0" }}>
                    Light Green
                </option>
            </select>
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
        </div>
    )

    // Add CSS to style links in the editor
    useEffect(() => {
        // Create a style element
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

    // Add this useEffect after the other useEffects
    useEffect(() => {
        if (messageBodyEditorRef.current) {
            setupLinkHandlers(messageBodyEditorRef)
        }
        if (footerEditorRef.current) {
            setupLinkHandlers(footerEditorRef)
        }
    }, [])

    // 3. Add a new state for the resizable panel
    const [templatePanelWidth, setTemplatePanelWidth] = useState(300) // Default width
    const resizeDragRef = useRef(null)
    const isResizingRef = useRef(false)

    // 4. Add resize functionality
    useEffect(() => {
        const handleMouseDown = (e) => {
            isResizingRef.current = true
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        const handleMouseMove = (e) => {
            if (!isResizingRef.current) return
            // Calculate the new width based on mouse position
            const containerRect = document.querySelector(".email-editor-container").getBoundingClientRect()
            const newWidth = Math.max(200, Math.min(500, containerRect.right - e.clientX))
            setTemplatePanelWidth(newWidth)
        }

        const handleMouseUp = () => {
            isResizingRef.current = false
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }

        const resizeHandle = resizeDragRef.current
        if (resizeHandle) {
            resizeHandle.addEventListener("mousedown", handleMouseDown)
        }

        return () => {
            if (resizeHandle) {
                resizeHandle.removeEventListener("mousedown", handleMouseDown)
            }
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [])

    const startEditTemplate = (template) => {
        setEditingTemplate(template._id || template.id)
        setNewTemplate({
            title: template.title || template.name,
            subject: template.subject || "",
            des: template.des || "",
            content: template.body,
            placeholders: template?.placeholders,
            category: template?.category || "",
        })
        // Reset the selected category when starting to edit
        setSelectedTemplateCategory(null)
    }

    const reactSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? "#3a41e2" : provided.borderColor,
            boxShadow: state.isFocused ? "0 0 0 1px #3a41e2" : provided.boxShadow,
            "&:hover": {
                borderColor: state.isFocused ? "#3a41e2" : provided.borderColor,
            },
            minHeight: "38px", // Match input height
            fontSize: "0.875rem", // text-sm
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#3a41e2" : state.isFocused ? "#e6f7f5" : provided.backgroundColor,
            color: state.isSelected ? "white" : provided.color,
            fontSize: "0.875rem", // text-sm
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#e6f7f5", // Light green background for selected tags
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#3a41e2", // Green text for selected tags
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#3a41e2",
            "&:hover": {
                backgroundColor: "#3a41e2",
                color: "white",
            },
        }),


    }



    const handleReset = () => {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 1000); // Stop spinning after 1 second
        setSearchTerm("");
        setTemplateType(null);
        setSelectedCategory(null);
    };

    return (
        <div className="mx-auto  px-4 sm:px-32">
            <div className="p-4 max-w-screen-2xl mx-auto py-10 sm:px-10">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-xl sm:text-2xl text-gray-700">Email Templates</h3>
                    <button
                        onClick={() => {
                            setShowNewTemplateForm(true)
                            setEditingTemplate(null)
                            setSelectedTemplateCategory(null)
                            setNewTemplate({
                                title: "",
                                content: "<p>Enter your email body here...</p>",
                            })
                            // Update the editor content after the component renders
                            setTimeout(() => {
                                if (templateEditorRef.current) {
                                    templateEditorRef.current.innerHTML = "<p>Enter your email body here...</p>"
                                }
                            }, 0)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-sm sm:text-lg rounded-md text-white bg-primary hover:bg-primary transition-colors"
                    >
                        <Plus size={18} /> New Template
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                    {/* Search Templates */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-lg  max-w-96  pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    <div className="w-[250px]">
                        <Select
                            options={[
                                { value: "all", label: "All Templates" },
                                { value: "built-in", label: "Built-in Templates" },
                                { value: "custom", label: "Custom Templates" },
                            ]}
                            value={templateType}
                            onChange={(option) => setTemplateType(option)}
                            placeholder="Select Template Type"
                            isClearable
                            classNamePrefix="react-select"
                            styles={reactSelectStyles}
                        />
                    </div>

                    <div className="w-[250px]">
                        <Select
                            options={[
                                { value: "", label: "All Categories" },
                                ...(categories?.map((category) => ({
                                    value: category._id,
                                    label: category.name,
                                })) || []),
                            ]}
                            value={selectedCategory}
                            onChange={(option) => setSelectedCategory(option)}
                            placeholder={categoriesLoading ? "Loading categories..." : "Select Template Category"}
                            isClearable
                            isDisabled={categoriesLoading}
                            classNamePrefix="react-select"
                            styles={reactSelectStyles}
                        />
                    </div>

                    <div>
                        <button
                            onClick={() => setShowManageCategoryModal(true)}
                            className="flex items-center gap-1 px-2 py-3 text-xs rounded-md text-white bg-primary hover:bg-primary transition-colors"
                        >
                            <Settings size={16} />
                            Manage Categories
                        </button>
                    </div>
                    <div>
                        <Tooltip content={spinning ? "Resetting..." : "Reset"} position="top">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1 p-3 text-xs rounded-md text-white bg-primary hover:bg-primary transition-colors"
                            >
                                <RotateCcw
                                    size={16}
                                    className={spinning ? "animate-spin" : ""}
                                />
                            </button>
                        </Tooltip>

                    </div>
                </div>

                {/* Loading state for templates */}
                {getLoad && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Loader />
                    </div>
                )}

                {/* Error state for templates */}
                {getError && (
                    <div className="flex flex-col items-center justify-center p-4 text-center border border-red-200 rounded-md bg-red-50">
                        <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
                        <p className="text-xs text-red-500">Failed to load templates</p>
                    </div>
                )}

                {/* No templates found */}
                {!getLoad && filteredTemplates?.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-4 text-center border border-dashed rounded-md">
                        <AlertCircle className="h-5 w-5 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">No templates found</p>
                    </div>
                )}

                {/* Templates list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredTemplates?.map((template) => (
                        <div
                            key={template._id || template.id}
                            className="group bg-white rounded-lg border border-gray-200 hover:border-[#16a34a] shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] p-4"
                        >
                            <div className="hover:text-primary">
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-[#16a34a] group-hover:text-white transition-all duration-300">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <p
                                            className={`${template?.type === "built-in" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"} text-xs font-medium me-2 px-2.5 py-1 rounded-lg`}
                                        >
                                            {template?.type === "built-in" ? "Built-in" : "Custom"}
                                        </p>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-1 ">
                                        {template?.des && (
                                            <Tooltip2 text={template?.des} position="top">
                                                <button className="p-1.5 rounded-md bg-gray-100 hover:bg-[#16a34a] hover:text-white transition-all duration-200">
                                                    <CircleAlert className="h-3.5 w-3.5" />
                                                </button>
                                            </Tooltip2>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsPreviewModalOpen(true)
                                                setPreviewTemplate(template)
                                            }}
                                            className="p-1.5 rounded-md bg-gray-100 hover:bg-[#16a34a] hover:text-white transition-all duration-200"
                                            title="View template"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                startEditTemplate(template)
                                            }}
                                            className="p-1.5 rounded-md bg-gray-100 hover:bg-[#16a34a] hover:text-white transition-all duration-200"
                                            title="Edit template"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        {template?.type !== "built-in" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    confirmDeleteTemplate(template._id || template.id)
                                                }}
                                                className="p-1.5 rounded-md bg-gray-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                                                title="Delete template"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h4 className="font-medium text-sm">{template.title || template.name}</h4>
                                <p className="font-normal text-xs mb-1">{template.subject || "No subject provided"}</p>
                            </div>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === (template._id || template.id) && (
                                <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-2 rounded-md">
                                    <p className="text-lg text-center mb-2">Delete this template?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowDeleteConfirm(null)
                                            }}
                                            className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteTemplateItem(template._id || template.id)
                                            }}
                                            className="px-2 py-1 text-sm text-white bg-red-500 rounded-md"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Modals */}
                <PreviewTemplateModal
                    isModalOpen={isPreviewModalOpen}
                    setIsModalOpen={setIsPreviewModalOpen}
                    previewTemplate={previewTemplate}
                    setPreviewTemplate={setPreviewTemplate}
                />

                <CreateTemplateModal
                    open={showNewTemplateForm}
                    setOpen={setShowNewTemplateForm}
                    setShowNewTemplateForm={setShowNewTemplateForm}
                    setNewTemplate={setNewTemplate}
                    handleNewTemplateChange={handleNewTemplateChange}
                    newTemplate={newTemplate}
                    isLoading={isLoading}
                    saveNewTemplate={saveNewTemplate}
                    setSelectedTemplateCategory={setSelectedTemplateCategory}
                    selectedTemplateCategory={selectedTemplateCategory}
                />

                <UpdateTemplateModal
                    isUpdating={isUpdating}
                    open={editingTemplate}
                    setOpen={setEditingTemplate}
                    handleNewTemplateChange={handleNewTemplateChange}
                    newTemplate={newTemplate}
                    saveEditedTemplate={saveEditedTemplate}
                    editTemplateEditorRef={editTemplateEditorRef}
                    handleTemplateContentChange={handleTemplateContentChange}
                    applyFormatting={applyFormatting}
                    FormattingToolbar={FormattingToolbar}
                    cancelEdit={cancelEdit}
                    selectedTemplateCategory={selectedTemplateCategory}
                    setSelectedTemplateCategory={setSelectedTemplateCategory}
                />

                <ManageCategoryModal isOpen={showManageCategoryModal} setIsOpen={setShowManageCategoryModal} />
            </div>
        </div>
    )
}

export default Template
