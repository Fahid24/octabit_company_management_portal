"use client"

import { useState } from "react"
import { FloatingInput } from "@/component/FloatiingInput"
import { FloatingTextarea } from "@/component/FloatingTextarea"
import { Badge } from "@/component/badge"
import { X, Plus } from "lucide-react"
import Button from "@/component/Button"
import { useGetDepartmentsQuery } from "@/redux/features/department/departmentApiSlice"
import { FileUpload } from "@/component/FileUpload"
import PropTypes from "prop-types"

const levelOptions = ["Beginner", "Intermediate", "Advanced"]
const languageOptions = ["English", "Spanish", "French", "German", "Chinese", "Japanese"]

export function CourseInfoForm({ data, updateData, validationErrors = {} }) {
  const [newTag, setNewTag] = useState("")
  const { data: departmentsApiData, isLoading: departmentsLoading, isError: departmentsError } = useGetDepartmentsQuery({ isPopulate: false })
  const departmentOptions = Array.isArray(departmentsApiData?.data)
    ? departmentsApiData.data.filter(d => !d.isDeleted).map(dept => ({ label: dept.name, value: dept._id }))
    : []

  const addDepartment = (deptId, deptName) => {
    if (deptId === "SELECT_ALL") {
      // Select all departments
      const allDepartments = departmentOptions.map(dept => ({
        id: dept.value,
        name: dept.label
      }));
      updateData({ departments: allDepartments });
      return;
    }
    
    if (
      deptId &&
      !data.departments.some((d) => d === deptId) && deptName
    ) {
      updateData({
        departments: [...data.departments, { id: deptId, name: deptName }],
      })
    }
  }

  const removeDepartment = (deptId) => {
    updateData({
      departments: data.departments.filter((d) => {
        if (typeof d === "string") return d !== deptId
        if (typeof d === "object" && d !== null) return d.id !== deptId
        return true
      }),
    })
  }

  const clearAllDepartments = () => {
    updateData({ departments: [] });
  }

  const addTag = () => {
    if (newTag && !data.tags.includes(newTag)) {
      updateData({ tags: [...data.tags, newTag] })
      setNewTag("")
    }
  }

  const removeTag = (tag) => {
    updateData({ tags: data.tags.filter((t) => t !== tag) })
  }

  const clearAllTags = () => {
    updateData({ tags: [] });
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <FloatingInput
            id="title"
            label="Module Title *"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            error={validationErrors.title}
          />
        </div>
        <div>
          <FloatingInput
            type="select"
            label="Level *"
            value={data.level}
            onChange={(e) => updateData({ level: e.target.value })}
            options={levelOptions.map((level) => ({ label: level, value: level }))}
            error={validationErrors.level}
            style={{ paddingLeft: "1rem" }}
          />
        </div>
      </div>

      <div>
        <FloatingInput
          id="summary"
          label="Module Summary *"
          value={data.summary}
          onChange={(e) => updateData({ summary: e.target.value })}
          error={validationErrors.summary}
        />
      </div>

      <div>
        <FloatingTextarea
          id="description"
          label="Module Description *"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={4}
          error={validationErrors.description}
        />
      </div>

      <div>
        <FileUpload
          label="Module Thumbnail"
          accept=".jpg,.jpeg,.png,.webp"
          value={data.thumbnail ? { fileUrl: data.thumbnail, name: "Thumbnail" } : null}
          onChange={(file) => {
            // file can be null or an object with fileUrl
            updateData({ thumbnail: file && file.fileUrl ? file.fileUrl : "" })
          }}
          required={false}
          isMultiFile={false}
          onFileClick={(file) => {
            if (file?.fileUrl) {
              window.open(file.fileUrl, "_blank");
            } else {
              console.warn("No file URL available.");
            }
          }}
        />
        {data.thumbnail && (
          <div className="mt-2">
            <img
              src={data.thumbnail}
              alt="Module Thumbnail Preview"
              className="max-h-40 rounded border border-gray-200 shadow"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <FloatingInput
            type="select"
            label="Departments *"
            value=""
            onChange={(e) =>
              addDepartment(
                e.target.value,
                e.target.options[e.target.selectedIndex].text
              )
            }
            options={[
              // Add "Select All" option if there are unselected departments
              ...(departmentOptions.filter(
                (opt) =>
                  !data.departments.some(
                    (d) => (typeof d === "object" && d !== null ? d.id : d) === opt.value
                  )
              ).length > 1 ? [{ label: "Select All", value: "SELECT_ALL" }] : []),
              // Add remaining departments
              ...departmentOptions.filter(
                (opt) =>
                  !data.departments.some(
                    (d) => (typeof d === "object" && d !== null ? d.id : d) === opt.value
                  )
              )
            ]}
            disabled={departmentsLoading || departmentsError}
            error={validationErrors.departments}
            style={{ paddingLeft: "1rem" }}
          />
          {departmentsLoading && (
            <div className="text-xs text-gray-500 mt-1">Loading departments...</div>
          )}
          {departmentsError && (
            <div className="text-xs text-red-500 mt-1">Failed to load departments</div>
          )}
          {data.departments.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Selected ({data.departments.length})
                </span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllDepartments}
                  className="text-xs px-2 py-1 h-6 text-gray-600 hover:text-red-600 hover:border-red-300"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.departments.map((dept) => {
                  // Support both {id, name} and string id for backward compatibility
                  const deptId = typeof dept === "string" ? dept : dept.id
                  const deptName = typeof dept === "string"
                    ? (departmentOptions.find((d) => d.value === dept) || {}).label || dept
                    : dept.name
                  return (
                    <Badge key={deptId} variant="secondary" className="flex items-center gap-1">
                      {deptName}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeDepartment(deptId)} />
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <FloatingInput
            type="select"
            label="Language *"
            value={data.language}
            onChange={(e) => updateData({ language: e.target.value })}
            options={languageOptions.map((lang) => ({ label: lang, value: lang }))}
            style={{ paddingLeft: "1rem" }}
            error={validationErrors.language}
          />
        </div>
      </div>

      <div>
        <div className="flex gap-2">
          <FloatingInput
            value={newTag}
            label="Tags"
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTag()}
          />
          <Button 
            type="button" 
            onClick={addTag} 
            size="sm"
            className="rounded-md flex items-center justify-center transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tags ({data.tags.length})
              </span>                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllTags}
                  className="text-xs px-2 py-1 h-6"
                >
                  Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="flex items-center gap-1 px-3 py-1 rounded-full transition-all"
                >
                  {tag}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

CourseInfoForm.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    summary: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    departments: PropTypes.array,
    level: PropTypes.string,
    language: PropTypes.string,
    tags: PropTypes.array,
  }).isRequired,
  updateData: PropTypes.func.isRequired,
  validationErrors: PropTypes.object,
}