import { Card, CardContent, CardHeader, CardTitle } from "@/component/card";
import { FloatingInput } from "@/component/FloatiingInput";
import SelectInput from "@/component/select/SelectInput";
import { TitleDivider } from "@/component/TitleDevider";
import { useGetEmployeesQuery } from "@/redux/features/admin/employee/employeeApiSlice";
import {
  useGetVtrByIdQuery,
  useUpdateVtrMutation,
} from "@/redux/features/vtr/vtrApiSlice";
import { toast } from "@/component/Toast";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const VTRUpdateForm = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.userSlice.user.user);
  const navigate = useNavigate();
  const { data: vtrData, isLoading: isVtrLoading } = useGetVtrByIdQuery(id);
  const { data: employeesData, isLoading: isEmpLoading } = useGetEmployeesQuery(
    {
      page: 0,
      limit: 100000000000000,
      isPopulate: true,
      departmentHead: user?.role === "DepartmentHead" ? user?._id : "",
    }
  );
  const [updateVtr, { isLoading: isUpdating }] = useUpdateVtrMutation();
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [formData, setFormData] = useState({
    dateOfProject: "",
    workOrder: "",
    customerName: "",
    salesRep: "",
    crewTeam: "",
    crewMembers: [],
    timeSlots: {},
    timeToComplete: "",
    estimatedTime: "",
    actualTime: "",
    feedback: "",
    completedBy: user?.firstName + " " + user?.lastName,
  });

  useEffect(() => {
    if (vtrData?.data) {
      setFormData({ ...vtrData.data });
      setSelectedEmployee(vtrData.data.crewMembers || []);
    }
  }, [vtrData]);

  const salesReps = [
    "Matt Tindall",
    "David Krone",
    "Patrick Todd",
    "Chris Ruvalcaba",
  ];

  const crewTeams = ["Team 01", "Team 02", "Team 03", "Team 04"];

  const employeeOptions = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.map((emp) => ({
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
    }));
  }, [employeesData]);

  const timeSlotLabels = [
    "6 - 6:30am",
    "6:30 - 7am",
    "7 - 7:30am",
    "7:30 - 8am",
    "8 - 8:30am",
    "8:30 - 9am",
    "9 - 9:30am",
    "9:30 - 10am",
    "10 - 10:30am",
    "10:30 - 11am",
    "11 - 11:30am",
    "11:30 - 12pm",
    "12 - 12:30pm",
    "12:30 - 1pm",
    "1 - 1:30pm",
    "1:30 - 2pm",
    "2 - 2:30pm",
    "2:30 - 3pm",
    "3 - 3:30pm",
    "3:30 - 4pm",
    "4 - 4:30pm",
    "4:30 - 5pm",
    "5 - 5:30pm",
    "5:30 - 6pm",
    "6 - 6:30pm",
    "6:30 - 7pm",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeSlotChange = (slot, value) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: { ...prev.timeSlots, [slot]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateVtr({ id, ...formData }).unwrap();
      toast.success("Success!", "VTR updated successfully!");
      navigate("/vtr");
    } catch (error) {
      toast.error(
        "Error",
        error?.data?.message || "Failed to update VTR. Please try again."
      );
    }
  };

  if (isVtrLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 bg-gradient-to-br min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg ">
        <div className="relative rounded-t-lg bg-form-header-gradient p-4 text-gray-800">
          <h1 className="text-xl md:text-2xl font-semibold text-black text-center">
            Update Verifiable Time Record (VTR)
          </h1>
          <TitleDivider color="black" className={"text-gray-900"} title="" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* ...repeat the form fields as in VTRform.jsx, but using formData and handleChange... */}
          {/* For brevity, you can copy the same form fields from VTRform.jsx here, using formData and handleChange as above. */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Date of Project <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="mm/dd/yyyy"
                type="date"
                name="dateOfProject"
                value={formData.dateOfProject}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          {/* Customer Name & Work Order */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Work Order # <span className="text-red-500">*</span>
              </CardTitle>
              <div className="text-xs text-gray-500 mb-1">
                FORMAT: XXXXX
                <br />
                (No # sign please)
              </div>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="Your answer"
                type="text"
                name="workOrder"
                value={formData.workOrder}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Customer Name: <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="Your answer"
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <div>
              <CardHeader>
                <CardTitle className="text-xl">
                  SALES REP: <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-1">
                  {salesReps.map((rep) => (
                    <label key={rep} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="salesRep"
                        value={rep}
                        checked={formData.salesRep === rep}
                        onChange={handleChange}
                        required
                      />
                      {rep}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="salesRep"
                      value="Other"
                      checked={
                        (!salesReps.includes(formData.salesRep) &&
                          formData.salesRep !== "") ||
                        formData.salesRep === "Other"
                      }
                      onChange={() => {
                        setFormData((prev) => ({ ...prev, salesRep: "Other" }));
                      }}
                      required
                    />
                    Other
                    {((!salesReps.includes(formData.salesRep) &&
                      formData.salesRep !== "") ||
                      formData.salesRep === "Other") && (
                      <FloatingInput
                        type="text"
                        className="ml-2 rounded px-2"
                        placeholder="Enter name"
                        value={
                          salesReps.includes(formData.salesRep)
                            ? ""
                            : formData.salesRep === "Other"
                            ? ""
                            : formData.salesRep
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            salesRep: val === "" ? "Other" : val,
                          }));
                        }}
                        onFocus={() => {
                          if (
                            formData.salesRep !== "Other" &&
                            !salesReps.includes(formData.salesRep)
                          )
                            return;
                          setFormData((prev) => ({
                            ...prev,
                            salesRep: "Other",
                          }));
                        }}
                      />
                    )}
                  </label>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card>
            <div>
              <CardHeader>
                <CardTitle className="text-xl">
                  Crew: <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-1">
                  {crewTeams.map((rep) => (
                    <label key={rep} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="crewTeam"
                        value={rep}
                        checked={formData.crewTeam === rep}
                        onChange={handleChange}
                        required
                      />
                      {rep}
                    </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="crewTeam"
                      value="Other"
                      checked={
                        (!crewTeams.includes(formData.crewTeam) &&
                          formData.crewTeam !== "") ||
                        formData.crewTeam === "Other"
                      }
                      onChange={() => {
                        setFormData((prev) => ({ ...prev, crewTeam: "Other" }));
                      }}
                      required
                    />
                    Other
                    {((!crewTeams.includes(formData.crewTeam) &&
                      formData.crewTeam !== "") ||
                      formData.crewTeam === "Other") && (
                      <FloatingInput
                        type="text"
                        className="ml-2 rounded px-2"
                        placeholder="Enter name"
                        value={
                          crewTeams.includes(formData.crewTeam)
                            ? ""
                            : formData.crewTeam === "Other"
                            ? ""
                            : formData.crewTeam
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            crewTeam: val === "" ? "Other" : val,
                          }));
                        }}
                        onFocus={() => {
                          if (
                            formData.crewTeam !== "Other" &&
                            !crewTeams.includes(formData.crewTeam)
                          )
                            return;
                          setFormData((prev) => ({
                            ...prev,
                            crewTeam: "Other",
                          }));
                        }}
                      />
                    )}
                  </label>
                </div>
              </CardContent>
            </div>
          </Card>
          {/* Crew Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                CREW MEMBERS: <span className="text-red-500"> *</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SelectInput
                label="Employee"
                isMulti={true}
                value={employeeOptions.filter((e) =>
                  selectedEmployee.includes(e.value)
                )}
                onChange={(options) => {
                  const selectedValues = options
                    ? options.map((opt) => opt.value)
                    : [];
                  setSelectedEmployee(selectedValues);
                  setFormData((prev) => ({
                    ...prev,
                    crewMembers: selectedValues,
                  }));
                }}
                options={employeeOptions}
                isLoading={isEmpLoading}
              />
            </CardContent>
          </Card>
          {/* ...other fields... */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Time Slots: <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlotLabels.map((slot) => (
                <div key={slot} className="border rounded p-2">
                  <div className="font-medium text-sm mb-1">{slot}</div>
                  <label className="mr-4">
                    <input
                      type="radio"
                      name={slot}
                      value="TREE"
                      checked={formData.timeSlots[slot] === "TREE"}
                      onChange={() => handleTimeSlotChange(slot, "TREE")}
                    />{" "}
                    TREE
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={slot}
                      value="LAND"
                      checked={formData.timeSlots[slot] === "LAND"}
                      onChange={() => handleTimeSlotChange(slot, "LAND")}
                    />{" "}
                    LAND
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                I HAD ( X ) TO COMPLETE THIS PROJECT:{" "}
                <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[
                  "Not enough time",
                  "Right amount of time",
                  "More than enough time",
                ].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="timeToComplete"
                      value={option}
                      checked={formData.timeToComplete === option}
                      onChange={handleChange}
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                ESTIMATED TIME ON SITE: <span className="text-red-500">*</span>
              </CardTitle>
              <div className="text-xs text-gray-500 mb-1">
                FORMAT: X hrs, X mins OR X days
              </div>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="Your answer"
                type="text"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                ACTUAL TIME ON SITE: <span className="text-red-500">*</span>
              </CardTitle>
              <div className="text-xs text-gray-500 mb-1">
                FORMAT: X hrs, X mins OR X days
              </div>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="Your answer"
                type="text"
                name="actualTime"
                value={formData.actualTime}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Provide any feedback you have for sales and / or scheduling
                teams regarding this project below:
              </CardTitle>
              <div className="text-xs text-gray-500 mb-1">
                Your feedback helps to provoke discussion between Crew Leads,
                Sales & the Office so that we can continue to strive to set you
                up for success so you can focus on doing what you do best!
              </div>
            </CardHeader>

            <CardContent>
              <input
                type="textarea"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle Namle className="text-xl">
                Completed by: <span className="text-red-500">*</span>
              </CardTitle>
              <div>(Your name)</div>
            </CardHeader>
            <CardContent>
              <FloatingInput
                label="Your answer"
                type="text"
                name="completedBy"
                value={formData.completedBy}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded font-semibold"
              disabled={isUpdating}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VTRUpdateForm;
