export const occupations = [
  { label: "Software Engineer", value: "Software Engineer" },
  { label: "Web Developer", value: "Web Developer" },
  { label: "UI/UX Designer", value: "UI/UX Designer" },
  { label: "Data Analyst", value: "Data Analyst" },
  { label: "IT Support Specialist", value: "IT Support Specialist" },
  { label: "Network Administrator", value: "Network Administrator" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "QA Tester", value: "QA Tester" },

  { label: "Doctor", value: "Doctor" },
  { label: "Nurse", value: "Nurse" },
  { label: "Pharmacist", value: "Pharmacist" },
  { label: "Medical Assistant", value: "Medical Assistant" },
  { label: "Lab Technician", value: "Lab Technician" },
  { label: "Physiotherapist", value: "Physiotherapist" },
  { label: "Dentist", value: "Dentist" },
  { label: "Psychologist", value: "Psychologist" },

  { label: "Teacher", value: "Teacher" },
  { label: "Professor", value: "Professor" },
  { label: "Lecturer", value: "Lecturer" },
  { label: "Academic Researcher", value: "Academic Researcher" },
  { label: "School Administrator", value: "School Administrator" },
  { label: "Tutor", value: "Tutor" },

  { label: "Accountant", value: "Accountant" },
  { label: "Auditor", value: "Auditor" },
  { label: "Financial Analyst", value: "Financial Analyst" },
  { label: "Banker", value: "Banker" },
  { label: "Business Consultant", value: "Business Consultant" },
  { label: "HR Manager", value: "HR Manager" },
  { label: "Marketing Executive", value: "Marketing Executive" },
  { label: "Sales Representative", value: "Sales Representative" },

  { label: "Government Employee", value: "Government Employee" },
  { label: "Lawyer", value: "Lawyer" },
  { label: "Judge", value: "Judge" },
  { label: "Police Officer", value: "Police Officer" },
  { label: "Military Personnel", value: "Military Personnel" },
  { label: "Civil Servant", value: "Civil Servant" },

  { label: "Electrician", value: "Electrician" },
  { label: "Plumber", value: "Plumber" },
  { label: "Carpenter", value: "Carpenter" },
  { label: "Mechanic", value: "Mechanic" },
  { label: "Welder", value: "Welder" },
  { label: "Technician", value: "Technician" },

  { label: "Driver", value: "Driver" },
  { label: "Pilot", value: "Pilot" },
  { label: "Flight Attendant", value: "Flight Attendant" },
  { label: "Travel Agent", value: "Travel Agent" },
  { label: "Delivery Person", value: "Delivery Person" },

  {
    label: "Customer Service Representative",
    value: "Customer Service Representative",
  },
  { label: "Cashier", value: "Cashier" },
  { label: "Store Manager", value: "Store Manager" },
  { label: "Receptionist", value: "Receptionist" },
  { label: "Waiter/Waitress", value: "Waiter/Waitress" },
  { label: "Hotel Staff", value: "Hotel Staff" },

  { label: "Graphic Designer", value: "Graphic Designer" },
  { label: "Content Writer", value: "Content Writer" },
  { label: "Photographer", value: "Photographer" },
  { label: "Journalist", value: "Journalist" },

  { label: "Homemaker", value: "Homemaker" },
  { label: "Retired", value: "Retired" },
  { label: "Unemployed", value: "Unemployed" },
  { label: "Freelancer", value: "Freelancer" },
  { label: "Self-Employed", value: "Self-Employed" },
  { label: "Entrepreneur", value: "Entrepreneur" },
  { label: "Other", value: "Other" },
];

// Employment type options
export const employmentTypeOptions = [
  { value: "FullTime", label: "Full Time" },
  { value: "PartTime", label: "Part Time" },
  { value: "Seasonal", label: "Seasonal" },
  { value: "Contractual", label: "Contractual" },
  { value: "Intern", label: "Intern" },
  { value: "Probation", label: "Probation" },
];

// Status options
export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Terminated", label: "Terminated" },
  { value: "Resigned", label: "Resigned" },
  { value: "OnLeave", label: "On Leave" },
  { value: "Pending", label: "Pending" },
];

// Gender and Marital Status options
export const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const religionOptions = [
  { value: "Islam", label: "Islam" },
  { value: "Hinduism", label: "Hinduism" },
  { value: "Christianity", label: "Christianity" },
  { value: "Buddhism", label: "Buddhism" },
  { value: "Other", label: "Other" },
];

export const relationOptions = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "spouse", label: "Spouse" },
  { value: "other", label: "Other" },
];

export const jobTypeOptions = [
  { value: "Remote", label: "Remote" },
  { value: "Offline", label: "Offline" },
  { value: "Hybrid", label: "Hybrid" },
];

export const docTypeOptions = [
  { value: "Identity", label: "Identity" },
  { value: "Certificate", label: "Certificate" },
  { value: "Others", label: "Others" },
];

export const identityDocNames = [
  { value: "NID", label: "National ID (NID)" },
  { value: "Smart NID", label: "Smart National ID" },
  { value: "Passport", label: "Passport" },
  { value: "Birth Certificate", label: "Birth Certificate" },
  { value: "Driving License", label: "Driving License" },
  { value: "Student ID", label: "Student ID" },
  { value: "Employee ID", label: "Employee ID" },
  { value: "Parent NID", label: "Parent's National ID" },
  { value: "Parent Passport", label: "Parent's Passport" },
  { value: "Guardian NID", label: "Guardian's NID" },
  { value: "TIN Certificate", label: "TIN Certificate (Tax ID)" },
  { value: "Trade License", label: "Trade License" }, // For business owners
  { value: "Utility Bill", label: "Utility Bill (as address proof)" },
];

export const certificateDocNames = [
  { value: "JSC", label: "JSC" }, // Junior School Certificate
  { value: "SSC", label: "SSC" }, // Secondary School Certificate
  { value: "HSC", label: "HSC" }, // Higher Secondary Certificate
  { value: "Diploma", label: "Diploma" }, // Polytechnic/Technical education
  { value: "BSC", label: "B.Sc" }, // Bachelor of Science
  { value: "BA", label: "BA" }, // Bachelor of Arts
  { value: "BBA", label: "BBA" }, // Bachelor of Business Administration
  { value: "LLB", label: "LLB" }, // Bachelor of Laws
  { value: "MBBS", label: "MBBS" }, // Bachelor of Medicine
  { value: "MSC", label: "M.Sc" }, // Master of Science
  { value: "MA", label: "MA" }, // Master of Arts
  { value: "MBA", label: "MBA" }, // Master of Business Administration
  { value: "MPhil", label: "MPhil" }, // Master of Philosophy
  { value: "PhD", label: "PhD" }, // Doctor of Philosophy
  { value: "Professional", label: "Professional Certificate" }, // e.g., IT, ACCA, CA
  { value: "Training", label: "Training Certificate" }, // Job or govt training
  { value: "Language", label: "Language Certificate" }, // e.g., IELTS, TOEFL
  { value: "Others", label: "Other Certificate" },
];

export const designationOptions = [
  { value: "Director", label: "Director" },
  { value: "Founder", label: "Founder" },
  { value: "Head Of Accounts", label: "Head Of Accounts" },
  { value: "Sr. Executive (HR & Admin)", label: "Sr. Executive" },
  { value: "Lead Creative Specialist", label: "Lead Creative Specialist" },
  { value: "Associate Creative Designer", label: "Associate Creative Designer" },
  { value: "Junior Designer", label: "Junior Designer" },
  { value: "Junior Designer (UI/UX)", label: "Junior Designer (UI/UX)" },
  { value: "Lead Software Engineer", label: "Lead Software Engineer" },
  { value: "Associate Lead Software Engineer", label: "Associate Lead Software Engineer" },
  { value: "Associate Software Engineer", label: "Associate Software Engineer" },
  { value: "Associate Software Developer", label: "Associate Software Developer" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Junior Software Engineer", label: "Junior Software Engineer" },
  { value: "Intern Developer", label: "Intern Developer"},
  { value: "Junior QA Engineer", label: "Junior QA Engineer" },
  { value: "Lead Marketing Specialist", label: "Lead Marketing Specialist" },
  { value: "Associate Marketing Specialist", label: "Associate Marketing Specialist" },
  { value: "Marketing Intern", label: "Marketing Intern" },
  { value: "Marketing Associate", label: "Marketing Associate" },
  { value: "Senior Marketing Specialist", label: "Senior Marketing Specialist" },
  { value: "Marketing Executive", label: "Marketing Executive" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Content Specialist", label: "Content Specialist" },
  { value: "Content Writer", label: "Content Writer" },
  { value: "Junior Content Writer", label: "Junior Content Writer" },
  { value: "Frontend Intern", label: "Frontend Intern" },
  { value: "Intern", label: "Intern" },
];



export const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

export const roleOptions = [
  { value: "Employee", label: "Employee" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "DepartmentHead", label: "Department Head" },
];

export const proofTypeOptions = [
  { value: "Electricity Bill", label: "Electricity Bill" },
  { value: "Water Bill", label: "Water Bill" },
  { value: "Gas Bill", label: "Gas Bill" },
  { value: "Internet Bill", label: "Internet Bill" },
  { value: "Telephone/Landline Bill", label: "Telephone/Landline Bill" },
  { value: "Rent Receipt", label: "Rent Receipt" },
  { value: "Bank Statement", label: "Bank Statement" },
  { value: "Tax Bill", label: "Tax Bill" },
  { value: "Other", label: "Other" },
];

export const workLocationOptions = [
  { value: "Offline", label: "Offline" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
];


export const shiftOptions = [
  { value: "Day", label: "Day Shift" },
  { value: "Night", label: "Night Shift" },
];
