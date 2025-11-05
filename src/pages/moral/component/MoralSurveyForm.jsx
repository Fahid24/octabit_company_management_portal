import { TitleDivider } from "@/component/TitleDevider";
import { useState } from "react";
import { FloatingInput } from "@/component/FloatiingInput";
import { FloatingTextarea } from "@/component/FloatingTextarea";
import { UserIcon } from "lucide-react";
import { useCreateMoralSurveyMutation } from "@/redux/features/morale/moraleApiSlice";
import { toast } from "@/component/Toast";
import { useSelector } from "react-redux";
import { data } from "autoprefixer";
import { companyName } from "@/constant/companyInfo";

const SURVEY_QUESTIONS = [
  {
    id: "morale",
    question: `How would you rate your overall morale at ${companyName}?`,
    type: "radio",
    required: true,
    options: ["Very High", "High", "Neutral", "Low", "Very Low"],
  },
  {
    id: "support",
    question: "How supported do you feel by your team lead and colleagues?",
    type: "radio",
    required: true,
    options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
  },
  {
    id: "expectations",
    question: "How clear are your daily tasks, goals, and expectations?",
    type: "radio",
    required: true,
    options: [
      "Very Clear",
      "Mostly Clear",
      "Sometimes Confusing",
      "Often Unclear",
      "No Idea",
    ],
  },
  {
    id: "skillsUsage",
    question:
      "Do you feel your skills and talents are being fully utilized in your current role?",
    type: "radio",
    required: true,
    options: [
      "Fully Used",
      "Mostly Used",
      "Somewhat Used",
      "Underused",
      "Not Used",
    ],
  },
  {
    id: "recognition",
    question:
      "Do you feel recognized and appreciated for your work and effort?",
    type: "radio",
    required: true,
    options: ["Frequently", "Sometimes", "Rarely", "Never"],
  },
  {
    id: "safety",
    question:
      "How well do your current tools, systems, and workflows support your productivity?",
    type: "radio",
    required: true,
    options: [
      "Very Safe",
      "Mostly Safe",
      "Sometimes Unsafe",
      "Often Unsafe",
      "Not Safe",
    ],
  },
  {
    id: "improvementSuggestions",
    question: `What's one thing ${companyName} could do to improve your work experience?`,
    type: "textarea",
    required: false,
  },
  {
    id: "followUp",
    question: "Would you like someone to follow up with you privately?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
    // hasFollowUp: true,
    // followUpField: {
    //   id: 'followUpEmail',
    //   type: 'input',
    //   label: 'Your Email',
    //   icon: <UserIcon className="h-5 w-5" />,
    //   showWhen: 'Yes'
    // }
  },
];

const MoralSurveyForm = () => {
  // Initialize form data based on questions

  const initialFormData = SURVEY_QUESTIONS.reduce((acc, question) => {
    acc[question.id] = "";
    if (question.followUpField) {
      acc[question.followUpField.id] = "";
    }
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialFormData);

  const [createMoralSurvey, { isLoading: isSubmitting }] =
    useCreateMoralSurveyMutation();
  const user = useSelector((state) => state.userSlice.user);
  const employeeId = user?.user?._id;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Submitting Survey Data:', formData);
    let dataToSend = {};
    if (formData.followUp === "Yes") {
      dataToSend = {
        ...formData,
        employeeId: employeeId,
      };
    } else {
      dataToSend = {
        ...formData,
      };
    }

    try {
      // console.log('Sending Data:', dataToSend);
      await createMoralSurvey(dataToSend).unwrap();
      toast.success("Success", "Thanks for your survey");
      setFormData(initialFormData);
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast.error(
        "Error",
        error?.data?.message || "Failed to submit survey. Please try again."
      );
    }
  };

  const renderQuestion = (question, index) => {
    const questionNumber = index + 1;

    if (question.type === "radio") {
      return (
        <div key={question.id} className="pb-4 border-b border-primary">
          <label className="block text-base font-medium text-gray-700 mb-2">
            {questionNumber}. {question.question}
          </label>
          <div className="flex flex-wrap gap-4">
            {question.options.map((option) => (
              <label
                key={option}
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  required={question.required}
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={handleChange}
                  className="form-radio cursor-pointer"
                />
                <span className="ml-2 text-gray-700 text-sm">{option}</span>
              </label>
            ))}
          </div>

          {/* Render follow-up field if exists */}
          {/* {question.hasFollowUp && question.followUpField && formData[question.id] === question.followUpField.showWhen && (
            <div className="mt-4 max-w-md">
              {question.followUpField.type === 'input' && (
                <FloatingInput
                  label={question.followUpField.label}
                  name={question.followUpField.id}
                  value={formData[question.followUpField.id]}
                  onChange={handleChange}
                  icon={question.followUpField.icon}
                  className=""
                />
              )}
            </div>
          )} */}
        </div>
      );
    }

    if (question.type === "textarea") {
      return (
        <div key={question.id} className="pb-4 border-b border-primary">
          <label className="block text-base font-medium text-gray-700 mb-2">
            {questionNumber}. {question.question}
          </label>
          <FloatingTextarea
            name={question.id}
            value={formData[question.id]}
            onChange={handleChange}
            rows={4}
            className="mt-1"
            required={question.required}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:pl-24 pb-20 md:pb-4 text-gray-900 space-y-3">
      <div className="max-w-4xl mx-auto pb-6 bg-white shadow-md rounded-lg">
        <div className="bg-form-header-gradient p-4 mb-4 rounded-t-md text-gray-800">
          <h2 className="text-2xl font-semibold text-center text-">
            Employee Morale Survey
          </h2>
          <TitleDivider color="black" className={"text-gray-900"} title="" />
          <p className="text-gray-600 text-center mb-8">
            We care about how you&apos;re doing out there. This short survey
            helps us improve your work experience. Be honest — all responses are
            confidential unless you request a follow-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6">
          {SURVEY_QUESTIONS.map((question, index) =>
            renderQuestion(question, index)
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-8 py-2 w-full border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-[#8c6b43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoralSurveyForm;
