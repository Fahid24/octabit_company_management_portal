import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/component/card';
import { FloatingInput } from '@/component/FloatiingInput';
import SelectInput from '@/component/select/SelectInput';
// import Button from '@/component/Button';
import { useSelector } from 'react-redux';
import { useCreateJobSafetyMutation } from '@/redux/features/jobSafety/jobSafetyApiSlice';
import { toast } from '@/component/Toast';
import { TitleDivider } from '@/component/TitleDevider';
import { useNavigate } from 'react-router-dom';

// You might need to fetch employee data to populate these lists dynamically
// import { useGetAllEmployeesQuery } from '@/redux/features/admin/employee/employeeApiSlice';

const JobSafetyAnalysis = () => {
   const user = useSelector((state) => state.userSlice.user);
   const navigate = useNavigate();
   const employeeId = user?.user?._id;
   // console.log("employee ID: ..", employeeId);
   const [createJobSafety, { isLoading }] = useCreateJobSafetyMutation();
   const [formData, setFormData] = useState({
      employeeId: employeeId,
      team: [],
      personsInvolved: [],
      customerNameWorkOrder: '',
      dateOfProject: '',
      ppeRequired: [],
      conesSignsChocks: [],
      equipmentRequired: [],
      toolsRequired: [],
      chemicalsRequired: [],
      workActivities: [],
      potentialHazards: [],
      safetyMeasuresDiscussed: [],
      statesOfMind: [],
      errorsThatLeadToInjury: [],
      maintenanceChecksRequired: false,
      sprinklersIrrigation: '',
      pathLights: '',
      landscapedPlants: '',
      otherObstacles: '',
      groundProtectionMats: '',
      certificatesPermitsApprovals: '',
      mindsetAttitude: '',
      designatedAerialRescuePersonnel: [],
      whosCalling911: [],
      nearestHospital: '',
      nearestUrgentCare: '',
      approvedBy: [],
      // Add 'Other' text inputs if needed based on actual form logic
      teamOther: '',
      personsInvolvedOther: '',
      approvedByOther: '',
   });


   // Placeholder data - Replace with fetched data
   const teamOptions = ['Marcus Turner (Team 1)', 'Elah Banks (Team 2)', 'Brooks Schaper (Team 3)', 'Nelson Creese (Team 4)'];
   const personsOptions = ['Tyler Allison', 'Elah Banks', 'Kyle Kasnick', 'Nelson Creese', 'Charley McPherson', 'Tony Ruvalcaba', 'Brooks Schaper', 'Patrick Todd', 'Gabe Thompson', 'Donald Wallis', 'Brandon Weaver', 'Marcus Turner', 'Anthony Decriscolo', 'Jason Rigollet', 'Todd Sickler', 'Michael (Maui) Maasstas', 'Clay Brooks', 'Andrew Baxter', 'Jeff Shannon', 'Stephen Lamson', 'Nick Ruvalcaba'];
   // Add placeholder data for other lists (PPE, Equipment, etc.) based on images
   const ppeOptions = ['Hard Hats', 'Eye Protection', 'Ear Protection', 'Leg Protection', 'Chainsaw Pants', 'Full Face Respirator'];
   const conesSignsChocksOptions = ['All traffic cones have been placed', 'All wheel chocks have been placed', 'Tree Work Ahead sign has been placed'];
   const equipmentOptions = ['Bucket Truck', 'Chipper Dump Truck', 'Chipper', 'Winch Line', 'Dump Trailer', 'Mini Skid Steer and Grapple', 'Mini Skid Steer and Mulcher', 'Stump Grinder', 'Air Spade', 'Crane'];
   const toolsOptions = ['Climbing Gear', 'Climbing Ropes', 'GRCS', 'Speed Line Kit', 'Handsaw', 'Climbing Chainsaws', 'Medium Chainsaws', 'Large Chainsaws', 'Rigging Rope', 'Rigging Blocks', 'Pole Saw / Pole Pruner', 'Power Pole Saw'];
   const chemicalsOptions = ['Bar Oil', 'Diesel', 'Gasoline', 'Tree and Shrub (imidaclopryd)', 'Copper Fungicide', 'Herbicide'];
   const workActivitiesOptions = ['Cutting tree(s) from ground', 'Pulling trees over with rope', 'Cutting tree(s) aloft (climbing)', 'Lowering branches from within the tree', 'Lowering logs from within the tree', 'Sectioning chipper', 'Feeding chipper', 'Cutting logs on ground', 'Cutting loaded logs', 'Using Winch Line', 'Moving logs by hand', 'Moving logs with dolly', 'Two man lifting', 'Operating chainsaws', 'Working near power lines', 'Raxing', 'Ladder Work'];
   const potentialHazardsOptions = ['STRUCK BY: A falling object', 'STRUCK BY: A swinging object', 'FALLS: Out of a tree', 'FALLS: Off of a structure', 'STRAINS: Repetitive motion', 'STRAINS: Over exertion', 'STRAINS: Improper lifting', 'STRAINS: Exhaustion', 'CUT BY: Handsaw', 'CUT BY: Chainsaw', 'CUT BY: Chipper', 'SLIPS / TRIPS', 'CAUGHT or CRUSHED BETWEEN: Any two objects', 'ELECTROCUTION', 'EXPOSURE TO HARMFUL SUBSTANCE'];
   const safetyMeasuresOptions = ['Use audible or visible signals when ENTERING into a drop zone', 'Use audible or visible signals before DROPPING debris into drop zone', 'Use caution and proper footing when dragging / avoid dragging backwards', 'Inspect all ropes prior to use', 'Inspect all rigging devices prior to use', 'Use proper lowering devices', 'Use proper lifting techniques', 'Use tworman lifting when required', 'Use all PPE required', 'Two hands on chainsaw when cutting', 'Housekeeping - clean work areas'];
   const statesOfMindOptions = ['Complacency', 'Frustration', 'Fatigue', 'Rushing'];
   const errorsThatLeadToInjuryOptions = ['Loss of Balance Traction / Grip', 'Eyes not on task', 'Mind not on task', 'Line of fire'];
   const mindsetAttitudeOptions = ['All members of our team are in a positive mindset and have a good attitude.', 'One or more of our crew members is not in a positive mindset and/or has a bad attitude.'];


   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      if (type === 'checkbox') {
         setFormData(prev => ({
            ...prev,
            [name]: checked
               ? [...prev[name], value]
               : prev[name].filter(item => item !== value)
         }));
      } else if (type === 'radio') {
         setFormData(prev => ({
            ...prev,
            [name]: value
         }));
      } else {
         setFormData(prev => ({
            ...prev,
            [name]: value
         }));
      }
   };

   const handleSelectChange = (name, selectedOption) => {
      // Assuming SelectInput returns { value: '...', label: '...' } or an array of such
      setFormData(prev => ({
         ...prev,
         [name]: selectedOption ? selectedOption.value : '' // Handle single select
      }));
   };

   // const handleMultiSelectChange = (name, selectedOptions) => {
   //      setFormData(prev => ({
   //          ...prev,
   //          [name]: selectedOptions ? selectedOptions.map(option => option.value) : [] // Handle multi-select
   //      }));
   //  };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await createJobSafety(formData).unwrap();
         toast.success('Success', 'Job Safety Analysis form submitted successfully');
         if (user?.user?.role === "Admin") {
            navigate('/job-safety-list');
         }
         // Optionally reset form or redirect
      } catch (error) {
         // console.log("Error:", error);
         toast.error('Error', error?.data?.detail || 'Failed to submit Job Safety Analysis form');
      }
   };

   // Options for SelectInput components (examples, adjust as needed)
   const yesNoOptions = [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
   ];

   return (
      <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 bg-gradient-to-br min-h-screen">
         <div className="max-w-4xl mx-auto p- bg-white shadow-md rounded-lg ">
            <div className='relative rounded-t-lg bg-form-header-gradient p-4 text-gray-800'>
               <h1 className="text-xl md:text-2xl font-semibold text-black text-center">Job Safety Analysis (JSA)</h1>
               <TitleDivider color="black" className={"text-gray-900"} title="" />
               <p className="text- md:text-[17px] text-center mb-8">Use this form to define and control hazards associated with your project by documenting every task within each job to identify health and safety hazards as well as the steps to control each task.</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4 p-2">

               {/* User Info Section (Simplified) */}


               {/* Team Section */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl" >TEAM: *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 ">
                     {/* Replace with dynamic data for teams/employees */}
                     {teamOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer ">
                           <input
                              type="checkbox"
                              name="team"
                              value={option}
                              checked={formData.team.includes(option)}
                              onChange={handleChange}
                              className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                           />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                     {/* Add 'Other' checkbox and input */}
                     <label className="flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           name="team"
                           value="Other"
                           checked={formData.team.includes('Other')}
                           onChange={handleChange}
                           className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                        />
                        <span className="ml-2 text-gray-700">Other:</span>
                     </label>
                     {formData.team.includes('Other') && (
                        <FloatingInput
                           label="Specify Team (Other)"
                           type="text"
                           name="teamOther"
                           value={formData.teamOther}
                           onChange={handleChange}
                           className="mt-2"
                        />
                     )}
                  </CardContent>
               </Card>

               {/* Who is involved section */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Who is involved in today&apos;s activities? *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for employees */}
                     {personsOptions.map(person => (
                        <label key={person} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              name="personsInvolved"
                              value={person}
                              checked={formData.personsInvolved.includes(person)}
                              onChange={handleChange}
                              className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                           />
                           <span className="ml-2 text-gray-700">{person}</span>
                        </label>
                     ))}
                     {/* Add 'Other' checkbox and input */}
                     <label className="flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           name="personsInvolved"
                           value="Other"
                           checked={formData.personsInvolved.includes('Other')}
                           onChange={handleChange}
                           className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                        />
                        <span className="ml-2 text-gray-700">Other:</span>
                     </label>
                     {formData.personsInvolved.includes('Other') && (
                        <FloatingInput
                           label="Specify Persons Involved (Other)"
                           type="text"
                           name="personsInvolvedOther"
                           value={formData.personsInvolvedOther}
                           onChange={handleChange}
                           className="mt-2"
                        />
                     )}
                  </CardContent>
               </Card>

               {/* Customer Name & Work Order */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Customer Name &amp; Work Order # *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <FloatingInput
                        label="Your answer"
                        type="text"
                        name="customerNameWorkOrder"
                        value={formData.customerNameWorkOrder}
                        onChange={handleChange}
                        required
                     />
                  </CardContent>
               </Card>

               {/* Date of Project */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Date of Project *</CardTitle>
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

               {/* Personal Protective Equipment (PPE) Required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Personal Protective Equipment (PPE) Required *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for PPE options */}
                     {ppeOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="ppeRequired" value={option} checked={formData.ppeRequired.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Cones, Signs, Chocks, */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Cones, Signs, Chocks, *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Cones, Signs, Chocks options */}
                     {conesSignsChocksOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="conesSignsChocks" value={option} checked={formData.conesSignsChocks.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Equipment Required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Equipment Required *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Equipment options */}
                     {equipmentOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="equipmentRequired" value={option} checked={formData.equipmentRequired.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Tools Required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Tools Required *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Tools options */}
                     {toolsOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="toolsRequired" value={option} checked={formData.toolsRequired.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Chemicals Required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Chemicals Required *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Chemicals options */}
                     {chemicalsOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="chemicalsRequired" value={option} checked={formData.chemicalsRequired.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Work Activities (Check all that apply) */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Work Activities (Check all that apply) *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Work Activities options */}
                     {workActivitiesOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="workActivities" value={option} checked={formData.workActivities.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Potential Hazards (Check all that apply) */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Potential Hazards (Check all that apply) *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Potential Hazards options */}
                     {potentialHazardsOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="potentialHazards" value={option} checked={formData.potentialHazards.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Safety Measures Discussed (Check all that apply) */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Safety Measures Discussed (Check all that apply) *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Safety Measures options */}
                     {safetyMeasuresOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="safetyMeasuresDiscussed" value={option} checked={formData.safetyMeasuresDiscussed.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* States of Mind That Lead to Errors */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">States of Mind That Lead to Errors (Check all that were discussed as a team) *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for States of Mind options */}
                     {statesOfMindOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="statesOfMind" value={option} checked={formData.statesOfMind.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Errors That Lead to Injury */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Errors That Lead to Injury (Check all that were discussed as a team) *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Error Types options */}
                     {errorsThatLeadToInjuryOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="checkbox" name="errorsThatLeadToInjury" value={option} checked={formData.errorsThatLeadToInjury.includes(option)} onChange={handleChange} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Maintenance checks required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Maintenance checks required (e.g. rigging, ropes, blocks, saddle, pulleys, chainsaws, spurs, chaps, chipper, truck): life support equipment and rigging equipment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <label className="flex items-center cursor-pointer">
                        <input type="checkbox" name="maintenanceChecksRequired" checked={formData.maintenanceChecksRequired} onChange={(e) => setFormData({ ...formData, maintenanceChecksRequired: e.target.checked })} className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded" />
                        <span className="ml-2 text-gray-700">We have performed all maintenance checks and all equipment and tools are in good working order.</span>
                     </label>
                  </CardContent>
               </Card>

               {/* Sprinklers/irrigation system */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Are there sprinklers/irrigation system and so, have the sprinkler heads been marked? *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="sprinklersIrrigation"
                        value={yesNoOptions.find(option => option.value === formData.sprinklersIrrigation) || null}
                        onChange={(selected) => handleSelectChange('sprinklersIrrigation', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* path lights */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Are there path lights in your drop zone or drag path and if so, have the been moved or marked? *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="pathLights"
                        value={yesNoOptions.find(option => option.value === formData.pathLights) || null}
                        onChange={(selected) => handleSelectChange('pathLights', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* landscaped plants */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Are there landscaped plants in your drop zone or drag path and if so, have they been protected, moved or marked? *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="landscapedPlants"
                        value={yesNoOptions.find(option => option.value === formData.landscapedPlants) || null}
                        onChange={(selected) => handleSelectChange('landscapedPlants', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* Other obstacles */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Are there other obstacles in your drop zone or drag path and if so, have they been moved or marked? *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="otherObstacles"
                        value={yesNoOptions.find(option => option.value === formData.otherObstacles) || null}
                        onChange={(selected) => handleSelectChange('otherObstacles', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* Ground Protection Mats */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Ground Protection Mats *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="groundProtectionMats"
                        value={yesNoOptions.find(option => option.value === formData.groundProtectionMats) || null}
                        onChange={(selected) => handleSelectChange('groundProtectionMats', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* Certificates, permits and approvals required */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Certificates, permits and approvals required (e.g. street use, hot works, confined space, crane lift, isolation, tree removal, etc):</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <SelectInput
                        label="Choose"
                        name="certificatesPermitsApprovals"
                        value={yesNoOptions.find(option => option.value === formData.certificatesPermitsApprovals) || null}
                        onChange={(selected) => handleSelectChange('certificatesPermitsApprovals', selected)}
                        options={yesNoOptions}
                     />
                  </CardContent>
               </Card>

               {/* Mindset / Attitude */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Mindset / Attitude *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for Mindset / Attitude options if needed */}
                     {mindsetAttitudeOptions.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                           <input type="radio" name="mindsetAttitude" value={option} checked={formData.mindsetAttitude === option} onChange={handleChange} className="form-radio text-primary focus:ring-primary" />
                           <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Designated Aerial Rescue Personnel */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Designated Aerial Rescue Personnel *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for employees */}
                     {personsOptions.map(person => (
                        <label key={person} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              name="designatedAerialRescuePersonnel"
                              value={person}
                              checked={formData.designatedAerialRescuePersonnel.includes(person)}
                              onChange={handleChange}
                              className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                           />
                           <span className="ml-2 text-gray-700">{person}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Who's Calling 911? */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">Who&apos;s Calling 911? *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for employees */}
                     {personsOptions.map(person => (
                        <label key={person} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              name="whosCalling911"
                              value={person}
                              checked={formData.whosCalling911.includes(person)}
                              onChange={handleChange}
                              className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                           />
                           <span className="ml-2 text-gray-700">{person}</span>
                        </label>
                     ))}
                  </CardContent>
               </Card>

               {/* Nearest Hospital */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">The Nearest Hospital is *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <FloatingInput
                        label="Your answer"
                        type="text"
                        name="nearestHospital"
                        value={formData.nearestHospital}
                        onChange={handleChange}
                        required
                     />
                  </CardContent>
               </Card>

               {/* Nearest Urgent Care Facility */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">The Nearest Urgent Care Facility is *</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <FloatingInput
                        label="Your answer"
                        type="text"
                        name="nearestUrgentCare"
                        value={formData.nearestUrgentCare}
                        onChange={handleChange}
                        required
                     />
                  </CardContent>
               </Card>

               {/* ALL members of our team have reviewed this JSA. This JSA has been approved by */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl">ALL members of our team have reviewed this JSA. This JSA has been approved by *</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* Replace with dynamic data for employees */}
                     {personsOptions.map(person => (
                        <label key={person} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              name="approvedBy"
                              value={person}
                              checked={formData.approvedBy.includes(person)}
                              onChange={handleChange}
                              className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                           />
                           <span className="ml-2 text-gray-700">{person}</span>
                        </label>
                     ))}
                     {/* Add 'Other' checkbox and input */}
                     <label className="flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           name="approvedBy"
                           value="Other"
                           checked={formData.approvedBy.includes('Other')}
                           onChange={handleChange}
                           className="form-checkbox text-primary focus:ring-primary cursor-pointer rounded"
                        />
                        <span className="ml-2 text-gray-700">Other:</span>
                     </label>
                     {formData.approvedBy.includes('Other') && (
                        <FloatingInput
                           label="Specify Approver (Other)"
                           type="text"
                           name="approvedByOther"
                           value={formData.approvedByOther}
                           onChange={handleChange}
                           className="mt-2"
                        />
                     )}
                  </CardContent>
               </Card>

               {/* Submit Button */}
               <div className="flex justify-end gap-4 mt-6">
                  <button
                     type="submit"
                     className={`px-4 py-2 w-full font-semibold bg-primary text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     disabled={isLoading}
                  >
                     {isLoading ? 'Submitting...' : 'Submit'}
                  </button>
               </div>

            </form>
         </div>
      </div>
   );
};

export default JobSafetyAnalysis;
