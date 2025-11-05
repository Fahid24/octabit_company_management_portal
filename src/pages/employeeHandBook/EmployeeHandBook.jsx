"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/component/FloatiingInput";



const EmployeeHandbook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const contentRef = useRef(null);
  const matchRefs = useRef([]);



  // Function to get text content and apply highlighting

  // Update highlights and count matches
  useEffect(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    const textNodes = [];

    // Clear previous highlights
    const existingHighlights = content.querySelectorAll(".search-highlight");
    existingHighlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(highlight.textContent || ""),
          highlight
        ); 
        parent.normalize();
      }
    });

    if (!searchTerm.trim()) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    // Find all text nodes
    const walker = document.createTreeWalker(
      content,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Apply highlighting
    let matchCount = 0;
    const newMatchRefs = [];

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );

      if (regex.test(text)) {
        const highlightedHTML = text.replace(regex, (match) => {
          const markElement = `<mark class="bg-yellow-300 px-1 rounded search-highlight" data-match="${matchCount++}">${match}</mark>`;
          return markElement;
        });

        const wrapper = document.createElement("span");
        wrapper.innerHTML = highlightedHTML;

        // Replace text node with highlighted content
        const parent = textNode.parentNode;
        if (parent) {
          while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, textNode);
          }
          parent.removeChild(textNode);
        }
      }
    });

    // Update match references
    const highlights = content.querySelectorAll(".search-highlight");
    matchRefs.current = Array.from(highlights);
    setTotalMatches(highlights.length);
    setCurrentMatch(highlights.length > 0 ? 1 : 0);

    // Scroll to first match
    if (highlights.length > 0) {
      highlights[0].scrollIntoView({ behavior: "smooth", block: "center" });
      highlights[0].classList.add("ring-2", "ring-blue-500");
    }
  }, [searchTerm]);

  // Navigate to specific match
  const navigateToMatch = (direction) => {
    if (totalMatches === 0) return;

    // Remove current highlight
    matchRefs.current.forEach((ref) => {
      ref.classList.remove("ring-2", "ring-blue-500");
    });

    let newMatch;
    if (direction === "next") {
      newMatch = currentMatch >= totalMatches ? 1 : currentMatch + 1;
    } else {
      newMatch = currentMatch <= 1 ? totalMatches : currentMatch - 1;
    }

    setCurrentMatch(newMatch);

    // Highlight and scroll to new match
    const targetMatch = matchRefs.current[newMatch - 1];
    if (targetMatch) {
      targetMatch.classList.add("ring-2", "ring-blue-500");
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        targetMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:pl-24 pb-20 md:pb-4">
      {/* Navigation with Search */}
      <nav className="fixed top-16 left-0 right-0">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border-gray-200 p-1">
              <div className="relative">
                <FloatingInput
                  type="text"
                  label=""
                  placeholder="Search in handbook..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 transition-all duration-200"
                />
                <Search className="absolute left-3 top-[58%] transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="flex items-center border-l border-gray-200 pl-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => navigateToMatch('prev')}
                      className=" rounded-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      disabled={currentMatch <= 1}
                    >
                      <ChevronUp className=" h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 min-w-[50px] text-center">
                      {currentMatch} of {totalMatches}
                    </span>
                    <button
                      onClick={() => navigateToMatch('next')}
                      className="rounded-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      disabled={currentMatch >= totalMatches}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  {totalMatches === 0 && (
                    <span className="text-sm text-gray-500">No matches</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed nav */}
      <div className="pt-16">
        {/* Content */}
        <div ref={contentRef}>
          {/* Page 1 */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-center mb-4">
              Employee Handbook [2021]
            </h1>
            <h2 className="text-2xl font-semibold text-center mb-8">
              Monkeymans Tree Service
            </h2>
          </div>

          {/* Page 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">FORWARD</h2>
            <p className="mb-4">
              THESE POLICIES OF MONKEYMANS TREE SERVICE ARE GENERAL GUIDELINES
              OF OUR CURRENT POLICIES. THEY ARE NOT INFLEXIBLE RULES OR
              REQUIREMENTS. THEY MAY BE CHANGED BY THE COMPANY AT ANY TIME
              WITHOUT NOTICE OR MODIFIED AS INDIVIDUAL CIRCUMSTANCES MAY REQUIRE
              IN THE BEST INTERESTS OF EFFICIENT MANAGEMENT OF THE COMPANY.
              NOTHING IN THE POLICIES AS THEY NOW EXIST OR MAY, IN THE FUTURE,
              BE REVISED IS INTENDED OR SHOULD BE CONSTRUED AS A CONTRACT OF
              EMPLOYMENT, EXPRESS OR IMPLIED, NOR A PROMISE OF EMPLOYMENT FOR A
              SPECIFIC PERIOD OF TIME, NOR A REQUIREMENT THAT ANY SPECIFIC
              PROCEDURE BE FOLLOWED IN HANDLING PERSONNEL ISSUES.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-4">
              Welcome to the Monkeymans Tree Service team of tree care
              professionals! We sincerely hope that your work experience with
              Monkeymans Tree Service will be as pleasant and rewarding as
              possible.
            </h3>

            <p className="mb-4">
              You are now employed by a company dedicated to the professional
              care of trees and shrubs as well as to the satisfaction of its
              clients throughout the Portland Metro Area.
            </p>

            <p className="mb-4">
              Monkeymans Tree Service is a full-service tree company and has
              residential, commercial and municipal clients. We are a
              service-oriented business that prides itself on customer
              satisfaction and professionalism. We expect no less of our
              employees.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-4">INTRODUCTION</h3>

            <p className="mb-4">
              This summarizes Monkeymans Tree Service's employment guidelines
              and is intended as a reference for all employees. While no such
              document could hope to answer every question about Monkeymans,
              Monkeymans has included essential items, such as employee
              benefits, earning of PTO and company management practices, based
              on common questions from new employees. Monkeymans reserves the
              right to revise, modify, delete, or add to any and all policies,
              procedures, work rules, or benefits stated in this Handbook or in
              any document at any time. No oral statements or representations
              can in any way change or alter the provisions of this Handbook.
            </p>

            <p className="mb-4">
              Monkeymans encourages all employees to read the Handbook carefully
              and ask questions about anything that is still unclear.
            </p>

            <p>
              To document your reading and understanding of the Handbook, please
              sign and date the employee acknowledgement form (last page) and
              return it to the office.
            </p>
          </div>

          {/* Page 5 */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-6"></h1>
            <h2 className="text-2xl font-bold mb-4">TCIA CODE OF ETHICS</h2>

            <p className="mb-4">
              Monkeymans Tree Service is an active member of the Tree Care
              Industry Association (TCIA). Within this association, we are
              actively working to become an Accredited Company based on our
              documentation training and safety thru the TCIA. Below are the
              ethics that we follow:
            </p>

            <p className="mb-4">
              Tree Care Industry Association recognizes that the manner in which
              members conduct business reflects upon the professionalism of the
              entire tree care industry and the arboriculture profession.
              Therefore, upon acceptance into membership, TCIA requests that
              members abide by the Arborist Pledge and the TCIA Code of Ethics
              in word, action, and within the spirit of integrity, which is at
              the core of these principles.
            </p>

            <p className="mb-4">
              Members of Tree Care Industry Association assume a responsibility
              to the profession, society and their peers by pledging to uphold
              and abide by the following:
            </p>

            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Arborists have the responsibility to provide professional care
                of trees for current and future generations. We pledge to be
                advocates and practitioners of the highest arboricultural
                standards and practices.
              </li>
              <li>
                Since arboriculture is an ever-changing science, we pledge to
                educate ourselves, our constituents, and our clients in the most
                current research and practices available to the industry.
              </li>
              <li>
                We pledge to conduct ourselves and businesses in an honest and
                dignified manner, reflecting our adherence to the laws that
                Govern us locally, nationally and internationally. We will
                endeavor to grow our work force through training and employee
                development.
              </li>
              <li>
                We agree that the arboriculture profession is extremely high
                profile in public perception. We pledge to look and act
                professional, so as to reflect a positive image for the green
                industry and promote our profession.
              </li>
              <li>
                We agree that safety, training and education are of the utmost
                importance in maintaining a professional workforce. We pledge to
                provide for the safety and training of employees to ensure a
                healthy work environment.
              </li>
              <li>
                We pledge to respect the views, ideas and contributions of our
                peers. Open and honest communications, sharing of ideas and
                experiences has been a cornerstone of TCIA membership, fostering
                Goodwill between companies. We pledge to continue this
                tradition.
              </li>
              <li>
                As members of TCIA, we believe that active participation on
                committees and Boards, and serving in other areas of leadership
                is extremely important to keeping a healthy, diverse
                association.
              </li>
            </ol>

            <p className="mt-4">
              © Tree Care Industry Association. All Rights Reserved.
            </p>
          </div>

          {/* Page 6 */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-6"></h1>
            <h2 className="text-2xl font-bold mb-4">
              1. EMPLOYMENT POLICIES AND PRACTICES
            </h2>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.1. STATEMENT OF AT-WILL EMPLOYMENT STATUS
            </h3>
            <p className="mb-4">
              Employment with MONKEYMANS is on an at-will basis. This means that
              the employment relationship may be terminated by either the
              employee or MONKEYMANS at any time, with or without notice and for
              any reason not expressly prohibited by law. Nothing in this
              Handbook or in any document or statement other than written
              agreements shall limit the right to terminate employment at-will.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.2. EQUAL EMPLOYMENT OPPORTUNITY (EEO)
            </h3>
            <p className="mb-4">
              MONKEYMANS is an equal opportunity employer. MONKEYMANS is company
              committed to creating a workforce that reflects the diversity of
              qualified individuals in the labor market. MONKEYMANS recruits,
              hires, trains, and promotes persons in all job titles, without
              regard to race, color, sex, national origin, age, religion,
              marital status, disability, veteran status, sexual orientation,
              gender identity, or other characteristic protected by law.
              MONKEYMANS does not discriminate against any applicant or employee
              in hiring or in the terms, conditions, and privileges of
              employment based upon pregnancy, childbirth, or related medical
              conditions. MONKEYMANS will make reasonable accommodation for
              religious beliefs. Employment decisions and personnel actions,
              including, but not limited to, compensation, benefits, promotion,
              demotion, layoff/recall, termination, and training are based on
              ensuring equal employment opportunity and long-term financial
              stability.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.3. IMMIGRATION COMPLIANCE
            </h3>
            <p className="mb-4">
              MONKEYMANS is committed to employing only United States citizens
              and non-citizens who are authorized to work in the United States.
              MONKEYMANS will not unlawfully discriminate on the basis of
              citizenship or national origin. In compliance with the Immigration
              Reform and Control Act of 1986, each new employee must complete
              the Employment Eligibility Verification Form I-9 and present
              documentation establishing identity and employment eligibility.
              Former employees who are rehired must also complete the form,
              regardless of the length of time between terminations and rehire.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.4. DISABILITY - REASONABLE ACCOMMODATION
            </h3>
            <p className="mb-4">
              MONKEYMANS does not discriminate against any applicant or employee
              in hiring or in the terms, conditions and privileges of employment
              due to physical or mental disability. MONKEYMANS is committed to
              making reasonable accommodations to allow an otherwise qualified
              applicant or employee to perform the job. Any employees with
              access to information on employee physical or mental disabilities
              shall maintain the confidentiality of the information to the
              extent reasonably possible and shall not release information to
              unauthorized personnel.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.5. JOB DESCRIPTIONS
            </h3>
            <p className="mb-4">
              Please see Appendix A for detailed job descriptions and
              qualifications.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.6. PERSONNEL FILES AND RECORDS
            </h3>
            <p className="mb-4">
              Personnel records are maintained on every employee. Although these
              records are company property, MONKEYMANS provides opportunities,
              upon request, for employees to inspect their own personnel file in
              accordance with Oregon State law. Personnel records are held as
              confidential as possible. MONKEYMANS will not release the
              information to anyone who has not been authorized by the employee
              other than to verify past or present employment status, or as
              required by law. Each employee is responsible to notify the
              accounting office of changes to address, telephone number, marital
              status and dependents.
            </p>
          </div>

          {/* Continue with remaining content... */}
          {/* For brevity, I'll include a few more sections to show the pattern */}

          {/* Page 7 */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-2">1.7. PERFORMANCE REVIEWS</h3>
            <p className="mb-4">
              To ensure that you receive a regular evaluation of your job
              performance and to review wages, MONKEYMANS requires that
              management meet with you at the end of approximately three months
              of continuous employment and thereafter at appropriate intervals
              to be established by the company to discuss your performance and
              overall attitude at your job. At the end of three months, you will
              be given a New Employee Performance Review where general items,
              equipment operation, professional skills, safety and goals will be
              reviewed. Introductory Period Performance Reviews are not
              necessarily tied to salary adjustments.
            </p>

            <p className="mb-4">
              A Periodic Performance Review will be given at appropriate
              intervals to review in more detail, general items, equipment
              operation, professional skills, safety and goals. Each employee
              may be asked to fill out a Self Evaluation form, which asks the
              employee to set goals for the coming year. Employees also may be
              asked to evaluate their peers using a Peer Review Form. MONKEYMANS
              encourages each employee to talk to the facilitator about goals
              for professional development, licensing (if applicable), and how
              MONKEYMANS can help achieve them. These reviews become a part of
              the employee's personnel file. MONKEYMANS strives to conduct
              reviews in the timeliest manner possible.
            </p>

            <p className="mb-4">
              MONKEYMANS will strive to provide a work environment that is
              comfortable, safe, and conducive to productivity. If there is
              dissatisfaction with your performance, your supervisor may work
              with you to resolve the problem. Unsatisfactory performance as
              well as rules violations may be communicated to the employee by
              verbal warming and/or informal discussion, written warning, or
              probation, depending on the frequency and severity of the issue.
              However, the company reserves the right in the interest of safety
              and efficient administration of its business, to discipline or
              terminate any employees, in its discretion, with or without cause,
              and with or without following general procedures.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              1.8. INTRODUCTION PERIOD
            </h3>
            <p className="mb-4">
              It is the policy of this company to consider the first three
              months of employment as an introductory period of employment.
              During this time and throughout your employment, you will be
              evaluated according to the following factors.
            </p>

            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Attendance</li>
              <li>Ability to work well with fellow employees and customers</li>
              <li>Quality of work</li>
              <li>Quantity of work</li>
              <li>Observance of safety procedures</li>
              <li>Proper use of equipment</li>
              <li>Compliance with rules and policies</li>
              <li>Professional growth</li>
            </ul>

            <p className="mb-4">
              The introductory period is an important time for you, as it
              provides you with an opportunity to better evaluate our company
              and your position, and to determine whether you wish to develop
              your career with us. As always, Monkeymans Tree Service may
              terminate the employee at any time for any reason during this
              period.
            </p>

            <h2 className="text-xl font-bold mt-4 mb-2">
              1.9. Definitions of Employment Status
            </h2>
            <p className="mb-6">
              The following terms will be used to describe the classification of
              employees and their employment status:
            </p>

            <div className="space-y-4">
              <div>
                <p>
                  <span className="font-semibold">Introductory Employee</span> –
                  Employees who have been employed less than 90 days do not yet
                  qualify for full-time regular employment. Introductory
                  employees are not entitled to company benefits such as health
                  insurance, PTO time, and holiday pay.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Regular Full-time</span> –
                  Employees hired for an unspecified duration and regularly
                  scheduled to work 40 hours or more per week. Regular full-time
                  employees are eligible for the employee benefits program after
                  completing 3 months of continuous employment. Hours may be
                  under 40 hours depending on workload and client scheduling.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Regular Part-time</span> –
                  Employees regularly scheduled to work fewer than 40 hours per
                  week. To be eligible for the employee benefits program as
                  detailed in the benefits section, an employee must regularly
                  work a minimum of 32 hours per week as approved by the
                  Supervisor, and complete 3 months of continuous employment.
                  Holiday pay will be paid at the equivalent of their normal
                  daily working hours.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Temporary Employees</span> –
                  Employees who are hired for a pre-established period, usually
                  during peak workloads and generally for no more than three
                  months. They may work a full-time or part-time schedule.
                  Temporary employees are not eligible for the employee benefits
                  program.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Seasonal Employees</span> –
                  Employees may be hired on a seasonal or as-needed basis with
                  no established time periods. Seasonal employees are not
                  eligible for the employee benefits program.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Exempt Employees</span> –
                  Employees who are exempt from the overtime compensation
                  provisions of state and federal wage and hour laws. Exempt
                  employees are expected to work all hours necessary to achieve
                  company and project objectives.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Nonexempt Employees</span> –
                  Employees who are subject to overtime compensation for time
                  worked beyond 40 hours in a workweek, as provided by state and
                  federal wage and hour laws.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Employment At-Will</span> –
                  Describes the relationship between employees and MONKEYMANS,
                  in which each has the right to terminate the employment
                  relationship at any time for any lawful reason. Employment
                  with MONKEYMANS is on an at-will basis and nothing in this
                  Handbook or in any document or statement other than written
                  agreements shall limit the right to terminate employment
                  at-will.
                </p>
              </div>

              <div>
                <p>
                  <span className="font-semibold">Independent Contractors</span>{" "}
                  – Individuals or business entities that provide services on a
                  contract basis for MONKEYMANS. Independent Contractors are not
                  eligible for the employee benefits program.
                </p>
              </div>

              <div>
                <p>
                  Employees who terminate for any reason and then return to work
                  for MONKEYMANS Tree Service will be classified as Introductory
                  and as such are not eligible for benefits until they become
                  regular, full-time employees. Their seniority date will be
                  adjusted to the rehire date. Previous seniority is lost upon
                  termination.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">
                1.10. OUTSIDE EMPLOYMENT
              </h2>
              <p>
                Employees who wish to hold additional employment must obtain
                prior permission from MONKEYMANS's Principals and for no reason
                may an employee have or obtain any employment with another like
                company.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">1.11. LAYOFFS</h2>
              <p>
                We try to operate our company in such a way that we can provide
                steady work for all our employees, but, unfortunately, there may
                be times when business and other conditions which we cannot
                control force us to terminate or layoff employees. When this
                becomes necessary, the company will consider work record,
                skills, length of service, attitude and ability in determining
                which employee shall be terminated or laid off. A temporary
                layoff is defined as a layoff when the return date is known. An
                indefinite layoff is defined as a layoff when the return date is
                not known.
              </p>
              <p className="mt-2">
                When we temporarily layoff a regular, full-time employee,
                certain employee benefits continue as if they were still
                working, i.e., health insurance benefits continue.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">1.12. JURY DUTY</h2>
              <p>
                We realize it is an obligation of citizenship to serve on a
                jury. If you receive a jury summons, report the fact promptly to
                your supervisor. If you are called for jury duty, you will be
                granted a leave of absence without pay.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">
                1.13. RESIGNATION AND TERMINATION
              </h2>
              <p>
                Employees who resign their employment with MONKEYMANS should
                give at least two weeks notice so that the company can find a
                replacement. Employees are required to return any MONKEYMANS
                charge cards, keys, and other company property on or before
                their last day.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">
                1.14. RECRUITMENT OF NEW STAFF
              </h2>
              <p>
                In order for MONKEYMANS to continue success as a quality Tree
                Care / Landscape Maintenance company, MONKEYMANS needs staff who
                work ethic, abilities, and efficiency are superior to those of
                its competitors. MONKEYMANS looks for individuals with integrity
                and honesty, and the ability to work collaboratively with the
                crew and crew leaders.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mt-4 mb-2">1.15. TRAINING</h2>
              <p>
                <span className="font-semibold">Tree Care Apprentice</span> (New
                Hire) (or equivalent training) is a basic level of training for
                new employees. The employee should be trained and understand:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>
                  The job tasks of an apprentice and the physical demands of the
                  work
                </li>
                <li>
                  Importance of safety, maintaining a professional image, and
                  avoiding substance abuse
                </li>
                <li>Introduction to ANSI Z133.1 safety standards</li>
                <li>Personal Protective Equipment</li>
                <li>How to stretch and lift properly to avoid back injury</li>
                <li>
                  Basic recognition of common job hazards (potential slips,
                  trips and falls, strains and sprains, struck-bys, chain saw
                  cuts, road hazards, etc.)
                </li>
                <li>
                  Introduction to tree hazards (dead branches, decay, root rot,
                  etc.)
                </li>
                <li>See training section of this handbook</li>
              </ol>
            </div>

            <div>
              <p className="mt-3">
                <span className="font-semibold ">
                  Ground Operations Specialist
                </span>{" "}
                (or equivalent training) provides a basic level of safety
                training to ground workers. The employee should be competent in
                tree care apprentice and should be trained and able to practice:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 grid grid-cols-2 gap-x-8">
                <li>Defensive driving</li>
                <li>Parking and backing vehicles</li>
                <li>Driving in poor weather, emergency parking</li>
                <li>Job site hazard inspection</li>
                <li>Traffic control</li>
                <li>Work planning</li>
                <li>Job briefings</li>
                <li>Emergency preparation, prevention and response</li>
                <li>Preparing equipment for the day</li>
                <li>Assisting and working with climbers</li>
                <li>Line handling (working with ropes)</li>
                <li>Basic knots</li>
                <li>Storing chain saws, gas and oil</li>
                <li>Walking with chain saws</li>
                <li>Chain saw Personal Protective Equipment</li>
                <li>Starting chain saws</li>
                <li>Cutting spring poles</li>
                <li>Proper bucking techniques</li>
                <li>Proper tree-felling techniques (notch, backcut, hinge)</li>
                <li>Avoiding struck-by injuries</li>
                <li>Work-zone, landing-zone, drop-zone guidelines</li>
                <li>Setting up and positioning a chipper</li>
                <li>Dragging and stacking brush</li>
                <li>Feeding the chipper</li>
                <li>Proper chipper operation</li>
                <li>Chipper maintenance precautions</li>
              </ol>
            </div>

            <div>
              <p className="mt-3">
                <span className="font-semibold">Tree Climber Specialist</span>{" "}
                (or equivalent training) provides a basic level of safety
                training to tree climbers. The employee should be capable of
                performing all Ground Operations Specialist duties and be
                trained and able to practice:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 grid grid-cols-2 gap-x-8">
                <li>Personal Protective Equipment for climbers</li>
                <li>Identification and use of climbing equipment</li>
                <li>Pre-climb inspection</li>
                <li>Gear inspection</li>
                <li>Climbing knots</li>
                <li>Climbing work plan</li>
                <li>Installing ropes</li>
                <li>Methods for ascending the tree</li>
                <li>Isolating a throwline</li>
                <li>Identification and use of climbing spurs</li>
                <li>Fitting climbing spurs</li>
                <li>
                  Proper lanyard and climbing rope use with climbing spurs
                </li>
                <li>Typing-in</li>
                <li>Safe climbing techniques</li>
                <li>Installation and use of a false crotch</li>
                <li>Limb-walking</li>
                <li>
                  Techniques for double-crotching, recrotching and redirecting
                </li>
                <li>Work positioning</li>
                <li>Working on spars</li>
                <li>Descending</li>
                <li>Identification and use of rigging equipment</li>
                <li>Rigging forces</li>
                <li>Methods for calculating wood strength</li>
                <li>Hazard assessment for rigging</li>
                <li>Rigging knots</li>
                <li>
                  Techniques for lowering with control lines only (natural
                  crotch, belay, etc.)
                </li>
                <li>
                  Techniques for lowering with lowering devices (block and
                  tackle, rope brake, ratcheting devices, etc.)
                </li>
                <li>Identifying electrical hazards</li>
              </ol>
            </div>

            <div>
              <p className="mt-3">
                <span className="font-semibold">Tree Care Specialist</span> (or
                equivalent training) provides a basic level of technical
                training for sales staff, technical services employees (PHC
                technicians, etc.), or managers. The employee should be capable
                of performing all Ground Operations Specialist and Tree Climber
                Specialist duties and be trained and able to practice:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 grid grid-cols-2 gap-x-8">
                <li>Working safely in tree care</li>
                <li>Tree biology</li>
                <li>Soils</li>
                <li>Compartmentalization of decay in trees (CODIT)</li>
                <li>Basics of pruning</li>
                <li>Identification and selection of trees</li>
                <li>Pruning standards</li>
                <li>Transplanting trees</li>
                <li>Diagnosing tree problems</li>
                <li>Abiotic injury</li>
                <li>Construction injury</li>
                <li>Insect and other animal pests</li>
                <li>Diseases</li>
                <li>Pesticide Application guidelines</li>
                <li>Tree fertilization and irrigation</li>
                <li>Tree support and lightning protection</li>
              </ol>
            </div>

            <div>
              <p className="mt-3">
                <span className="font-semibold">Crew Leader</span> (or
                equivalent training) provides a basic level of management
                training for crew leaders. The employee should be capable of
                performing all Ground Operations Specialist, Tree Climber
                Specialist, and Tree Care Specialist duties and be trained and
                able to practice:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 grid grid-cols-2 gap-x-8">
                <li>Personal and crew safety</li>
                <li>Client and public safety</li>
                <li>Production</li>
                <li>Quality and professionalism</li>
                <li>Leadership skills</li>
                <li>Communication skills</li>
                <li>Developing crew skills and knowledge</li>
                <li>Performance and feedback</li>
              </ol>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-6"></h1>
            <h2 className="text-2xl font-bold mb-4">
              2. COMPENSATION
            </h2>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.1. PAYCHECKS AND TIMECARDS
            </h3>
            <p className="mb-4">
            MONKEYMANS has bi-weekly payroll periods from Monday through Sunday.  Payroll checks are processed by the Office
 Manager for the previous two weeks ending.  Pay dates are every other Thursday.  If a scheduled payday falls on a holiday,
 employees will receive paychecks not later than the next workday. Crew leaders are required to complete and submit
 accurate work orders recording client name and address, hours by job, start and stop times (including travel time,
 dump, and equipment time), to the office by the end of each workday.  On the Monday preceding payday, employees
 will have the chance to review and sign their timesheets. Timesheets are maintained as a permanent record. If an error is
 discovered in a paycheck, or if a paycheck is lost or stolen, notify accounting immediately.  If pay period or frequency is changed,
 employees will be given a 2-week notice.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.2. HOURS OF WORK
            </h3>
            <p className="mb-4">
            MONKEYMANS's work week is Monday through Sunday. All employees are expected to work an estimated eight hours per day
 within this timeframe.  Depending on workload and time of year, a 4 day, 10-hour per day schedule may be arranged.  Due to the
 specialized nature of this industry, start and ending times are not standard.  However, unless notified in advance; normal
 workdays start at 7:00AM.  We require the trucks to roll out as close to 7:00AM as possible because of the nature of our
 business.  Your crew leader or general foreman will setup the daily workload and inform you of the schedule as far in advance as
 possible.  Most standard size jobs are setup to be completed within one visit; therefore over 8 hours in a day, up until dusk, may
 be needed to finish jobs
            </p>
            <p className="mb-4">
            As the workload requires you may be needed to work additional hours or weekends.  Storm cleanup is a special situation
 beyond the employer's control that usually requires overtime from the crews performing the work.  You may never work any
 unauthorized time.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.3. OVERTIME
            </h3>
            <p className="mb-4">
            Non-exempt employees are paid on an hourly basis and are eligible for overtime pay.  Employees will be paid at the rate of 1.5
 times the regular rate for hours worked beyond forty (40) hours per workweek. Overtime must be approved in advance by each
 employee's immediate supervisor.  According to the federal Fair Labor Standards Act (FLSA), only actual hours worked are
 computed for purposes of determining hours worked for overtime calculation.  Vacation and holiday time or any other time for
 which you are compensated but not actually working are not counted towards overtime
            </p>
            <p className="mb-4">  
            Exempt employees are paid a monthly salary and are exempt from overtime provisions.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.4. ON-CALL STATUS
            </h3>
            <p className="mb-4">
            As a professional full-service tree care company, Monkeymans Tree Service must offer their clients emergency call response.  It
 will be required that a minimum of one climber and one grounds person be on-call during the week (including weekends) for
 emergency calls.  The schedule will be rotating and MONKEYMANS will try to accommodate personal commitments.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.5.  REST AND LUNCH PERIODS - NON-EXEMPT EMPLOYEES
            </h3>
            <p className="mb-4">
            A half-hour unpaid lunch break is required to be taken at an appropriate time.  Lunches and nonalcoholic beverages will be
 brought with the employee and eaten on the job site. A 10 to 15 minutes paid break may be taken by the employee during every
 4 hours worked in a day.  Typically, this works out to one morning and one afternoon break.   Unpaid breaks must be accounted
 for on the daily timesheet.  Eating while driving a company owned vehicle is prohibited
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.6. BUSINESS AND TRAVEL EXPENSES
            </h3>
            <p className="mb-4">
            MONKEYMANS will reimburse employees for reasonable expenses for travel, business meetings and other expenses incurred
 in connection with company business.  Reimbursable expenses should be submitted along with the timecard for the pay period
 in which they occurred and will be paid to the employee on an untaxed basis.  Employees must request reimbursement within 30
 days of the allowable expense
            </p>
            <p className="mb-4">
            Because the IRS places stringent requirements to substantiate travel and entertainment expenses, all requests for
 reimbursement of expenses must be accompanied by a receipt thoroughly describing the expense.  Mileage will be reimbursed
 at the current rate as determined by the IRS
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.7. PAYROLL DEDUCTIONS
            </h3>
            <p className="mb-4">
            MONKEYMAN'S is required to deduct from each employee's pay, where applicable, federal and state withholding taxes, social 
security taxes, worker's compensation assessment, and any garnishments or court ordered assignments. Other deductions may 
be made, with written authorization, for items such as employee purchases, insurance contributions, charitable contributions and 
credit union accounts
            </p>
            <h3 className="text-xl font-bold mt-4 mb-2">
              2.8. CHECK CASHING
            </h3>
            <p className="mb-4">
            MONKEYMAN'S IS NOT A BANK and is not able to offer check cashing to it's employees. If you need to cash your check, 
            please open an account at a credit union or a savings and loan institution
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              2.9. DIRECT DEPOSIT
            </h3>
            <p className="mb-4">
            MONKEYMAN'S encourages all employees to utilize direct deposit to receive pay. Direct Deposit can be set up with your HR 
            Manager or through the ADP Mobile Solutions App or website. 
            </p>
            <p className="mb-4">MONKEYMAN'S requires a completed and signed Direct Deposit Authorization Form to be able to provide this service</p>
            <p className="mb-4">Payroll is typically submitted bi-weekly on Tuesday and will be deposited to your account as early as the following Wednesday 
            (dependent upon your banking institution), and no later than the following Friday.</p>
            <p className="mb-4"> Paychecks will be mailed to the office if direct deposit is not utilized and employees will be required to and responsible for 
            picking up their paychecks during regular office hours</p>
          </div>

          {/* Page 12 (approx) - Employee Benefits & Leave Policies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              3. EMPLOYEE BENEFITS & LEAVE POLICIES
            </h2>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.1. HOLIDAYS
            </h3>
            <p className="mb-4">
              MONKEYMANS will give all regular full-time employees a paid day off on the following holidays:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>New Year&apos;s Day</li>
              <li>Memorial Day</li>
              <li>Independence Day</li>
              <li>Labor Day</li>
              <li>Thanksgiving Day</li>
              <li>Christmas Day</li>
            </ul>
            <p className="mb-4">
              The day after Thanksgiving, Christmas, and New Year&apos;s may be a non-paid day off depending on workload.
            </p>
            <p className="mb-4">
              You are eligible for holiday pay after 90 days of continuous full-time employment. Paid holidays are not included in calculations of
              overtime. You must work the scheduled workday immediately prior and after a schedule holiday in order to collect holiday pay,
              unless special arrangements are worked out beforehand. Employees on leave of absence are not eligible for holiday pay.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.2. PERSONAL TIME OFF (PTO)
            </h3>
            <p className="mb-4">
              MONKEYMANS provides paid personal time off (PTO) as one of the many ways in which it shows appreciation for its
              employees&apos; hard work and dedication. PTO is an allowance of paid time which can be used for vacation, sick leave or any other
              personal use. All regular, full-time employees are eligible for PTO. Employees begin to accrue or earn PTO from time of hire,
              however the time accrued will not be available for use until employees&apos; 91st day of employment. As a reminder, each employee&apos;s
              PTO balance is printed every payroll period on their check stub. Due to the constraints of the accounting program the
              employee&apos;s PTO balance is shown with a label of &quot;vacation&quot; but is really PTO and treated as such.
            </p>

            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Year</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly Accrual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1 year</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">40 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1.33 hrs per pay period</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">over 3 years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">80 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.08 hrs per pay period</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">over 7 years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">120 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.60 hrs per pay period</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-4">
              Whenever possible, PTO is to be requested in advance and approved by your general foreman using absence request form and
              reported on your timesheet. Due to scheduling for this industry, a minimum of 1 week notice is requested if planning on taking 2
              days off in a row, and 2 weeks written notice is requested if planning over 3 days off in row. MONKEYMANS reserves the right
              to deny PTO at any time.
            </p>

            <p className="mb-4">
              A maximum of 40 hours may be used in the first year of employment, regardless of whether more hours are accrued. A
              maximum of 50% unused hours in a calendar year can be carried over to a new calendar year, with a maximum of 40 hours.
              Accrued PTO hours will be paid at 50 percent upon resignation/termination at company&apos;s discretion.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.3. INCLEMENT WEATHER
            </h3>
            <p className="mb-4">
              All employees should use their best judgment in the event of an emergency weather situation. Employees should report to work
              if they are able to do so safely, but no employee should endanger themselves or others. It is recommended that tire chains
              and/or traction devices be kept in personal and company vehicles during winter months. MONKEYMANS occasionally works
              during or soon after inclement weather for regular business or emergency calls. If dangerous weather is projected, the
              Principals may choose to change work schedule hours in advance. Employees who stay home due to weather may use PTO
              time, or the Principals may grant an authorized unpaid absence.
            </p>
          </div>

          {/* Page 13 (approx) - Workers' Compensation and 401K */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mt-4 mb-2">
              3.4. WORKERS&apos; COMPENSATION
            </h3>
            <p className="mb-4">
              State law provides for compensation in the event an employee suffers an industrial injury or occupational illness as defined by
              the worker&apos;s compensation law. In the event of an industrial injury or occupational illness of any kind, notify your Supervisor or
              the President immediately. Medical fees and weekly loss of time benefits are paid as provided in the state worker&apos;s
              compensation law.
            </p>
            <p className="mb-4 font-semibold italic">
              On-the-job injuries must be immediately reported to your supervisor, even if no medical treatment is necessary.
            </p>
            <p className="mb-4">
              Our expense for Workers&apos; Compensation insurance is directly related to the amount of usage. Monkeymans Tree Service ends
              up paying for the claims eventually through higher premiums. By keeping safety a priority and holding down the premiums for
              this insurance, you help yourself, your co-workers, and the company. Safety first - Safety last - Safety always.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.5 401K, RETIREMENT, 125 CAFETERIA PLANS
            </h3>
            <p className="mb-4">
              All regular, full-time employees who are at least 21 years of age and have completed 90 days of employment at
              MONKEYMAN&apos;S are eligible to participate in the 401(k) plan. Employees will be auto enrolled at a contribution of 3% if they do
              not opt out or enroll enroll themselves within 45 days of their 90th day of employment with MONKEYMAN&apos;S, with a 1% increase
              on their employment anniversary each year, up to a maximum of 10%. Employees are responsible to opt out or manually enroll
              themselves if they do not wish to enroll or participate in annual increases. This can be managed through the ADP Mobile
              Solutions App or website. MONKEYMAN&apos;S will match 100% of the first 3% of employee&apos;s contribution, plus 50% of the next
              2%. Please refer to the vesting schedule below.
            </p>

            <p className="mb-4">
              All full-time employees will automatically be enrolled in the company&apos;s profit sharing plan after completing one year of
              employment with the company. Vesting will be on a six-year graded schedule, beginning at 20% vested at year one and
              reaching 100% vested at five years of employment.
            </p>

            <p className="mb-4">
              As with your insurance benefits, refer to your Summary Plan Description (SPD) provided by the benefits administrator for
              specifics. If you have further questions about retirement or profit-sharing rights, consult with the benefits administrator. This
              benefit, as well as other benefits, may be canceled or changed at the discretion of the Company, unless otherwise required by
              law.
            </p>

            <h4 className="text-lg font-semibold mt-4 mb-2">401(k) Vesting Schedule:</h4>

            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years of Service</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vesting</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">0-2 years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0% vested</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5+ years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100% vested</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Page 14 (approx) - Group Health, Education, and Incentives */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mt-4 mb-2">
              3.6. Group Health Insurance
            </h3>
            <p className="mb-4">
              MONKEYMAN&apos;S is proud to offer employer paid medical, dental &amp; vision coverage for all full-time employees.
              Employees may also enroll qualified dependents, such as spouse and children, however will be responsible to
              pay dependent premiums through pre-tax payroll deductions.
            </p>

            <p className="mb-4">
              Newly hired full-time employees <span className="underline font-semibold">must enroll in coverage within their first 30 days of employment</span>, with coverage
              becoming <span className="underline font-semibold">effective the 1st of the month following their 30th day of employment</span>.
            </p>

            <p className="mb-2 font-semibold">EXAMPLE:</p>
            <p className="mb-4">
              Employee is hired on March 15th. Their 30th day of employment is April 14th. Their deadline to
              enroll is April 14th and their coverage will become effective on May 1st.
            </p>

            <p className="mb-4">
              Open Enrollment will be offered annually in March. If you miss open enrollment or experience a qualifying life
              event, you may be able to enroll, cancel or make changes mid-year. Qualifying life events are listed below.
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Marriage</li>
              <li>Birth or adoption of a child, or having a child placed in your home</li>
              <li>Involuntary loss of other health coverage</li>
              <li>Divorce, legal separation or death</li>
            </ul>

            <p className="mb-4">
              Please direct questions to your HR Manager and / or plan documents and SPD (Summary Plan Description) for
              further information about MONKEYMAN&apos;S group health insurance.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.7. Education Assistance Program
            </h3>
            <p className="mb-4">
              MONKEYMANS supports employee&apos;s professional development and encourages efforts toward continued education.
              The company is proud to offer education assistance to its employees. MONKEYMAN&apos;S provides all regular, full-time
              employees, who have completed at least 90 days of employment, with an annual allotment of up to $1,500 towards
              approved tuition and books for courses in which a passing grade of C or higher is received. To avoid abuse of the
              reimbursement program, employees who are terminated or resign within one year of receiving assistance will be
              required to pay back the full amount.
            </p>
            <p className="mb-4">
              Prior to starting a course, be sure to review the Education Assistance Policy &amp; Application, which you can obtain from
              your Human Resources Representative, for more information about eligibility and requirements of the program.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.8. INCENTIVES
            </h3>
            <p className="mb-4">
              MONKEYMANS tries to give special recognition to all employees whose on-the-job safety, performance, dependability and
              leadership is exemplary. The recognition may be in the form of a cash bonus or other tangible token of MONKEYMANS&apos;
              appreciation. Such awards are generally given at the end of the year. MONKEYMANS reserves the right to grant more than
              one, or no award during the year, or to change the amount of an award or type of award.
            </p>
          </div>

          {/* Page 15 (approx) - Leave of Absence and others */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mt-4 mb-2">
              3.9. LEAVE OF ABSENCE
            </h3>
            <p className="mb-4">
              <span className="font-semibold italic">Leave Without Pay</span> - If you do not have sufficient PTO time accrued to cover a necessary and approved leave, you may be
              granted leave without pay for up to one month at the company&apos;s discretion. A longer leave is considered a leave of absence.
              During a leave without pay, insurance coverage and other benefits continue, but PTO does not accrue. Please be aware that
              your absence places added burden on other employees who must handle the workload that you would ordinarily handle. It is for
              this reason that MONKEYMANS reserves the right to refuse leaves without pay or limit the duration of that leave.
            </p>
            <p className="mb-4">
              <span className="font-semibold italic">Leave of Absence</span> &ndash; You may be granted a leave of absence for reasons of a personal, family, educational, or civic nature.
              Upon your return, MONKEYMANS will make an effort to place you in a position comparable to the one you left. PTO does not
              accrue during a leave of absence and other benefits will be suspended until you return to work.
            </p>

            <p className="mb-4">
              While no employee is guaranteed a leave of absence, the Principals will consider their request very seriously and reach a
              decision based on workload, profitability and project needs. As always, MONKEYMANS will afford reasonable accommodation
              to qualified employees with a known disability or for an employee&apos;s religious beliefs. MONKEYMANS will also provide leave
              under particular circumstances as mandated by federal or state law.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2">
              3.10. MEDICAL LEAVE
            </h3>
            <p className="mb-4">
              The Oregon Family Medical Leave (OFML) &amp; Family Medical Leave Act (FMLA) pertains to companies with <span className="underline font-semibold">more than 25</span>
              (OFLA) / <span className="underline font-semibold">50</span> (FMLA) employees, which does not apply to MONKEYMANS at this time. Information on OFML can be
              obtained from the HR Manager.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 italic">
              3.11.MONKEYMAN&apos;S PREGNANCY LEAVE
            </h3>
            <p className="mb-4">
              An employee is required to give 30 days notice of an anticipated delivery date and leave. MONKEYMANS may require medical
              verification that the employee is physically able to return to work. Following the pregnancy, the employee will be returned to their
              former job or an equivalent job without loss of benefits or rights that were accrued at the time leave was taken, reduced by any
              paid leave used during the leave. If MONKEYMANS&apos;s circumstances have changed so that no equivalent job exists, the
              employee will be reinstated to any other position that is available and suitable.
            </p>
            <p className="mb-4">
              The employee is entitled to use any accrued PTO during the leave, otherwise the leave will be unpaid. Additional PTO will not
              be accrued during pregnancy leave. MONKEYMANS will allow an employee affected by pregnancy, childbirth or related medical
              conditions to transfer temporarily to a less strenuous or hazardous position for the duration of the pregnancy, if the transfer is
              reasonably necessary, the employee requests a transfer, and the request for transfer can be reasonably accommodated. The
              employer may require medical substantiation that a transfer is reasonably necessary.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 italic">
              3.12. BEREAVEMENT LEAVE
            </h3>
            <p className="mb-4">
              Unpaid bereavement leaves, up to three days, will be granted in the event of death of an immediate member of the family.
              Immediate family is defined as spouse, children, parents, siblings, corresponding in-laws and domestic partner. PTO may be
              used.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 italic">
              3.13. MILITARY LEAVE
            </h3>
            <p className="mb-4">
              Employees who require time off to fulfill military duties will be treated in accordance with applicable requirements of state and
              federal laws. Employees should notify their supervisor and provide a copy of their orders as soon as possible. An eligible
              employee who provides advance written or oral notice of reserve training or military service will be granted an unpaid military
              leave of absence for up to five years. During their military leave of absence, their benefit coverage will be the same as for any
              other employee on an unpaid leave of absence. Medical coverage may be continued based on the provisions of the Uniformed
              Services Employment Rights Act of 1994 (USERRA). Employees may apply any accrued PTO before the beginning of their
              unpaid military service leave if they wish; however, they are not obliged to do so.
            </p>
          </div>

          {/* Page 16 (approx) - Company Policies and Procedures */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              4. COMPANY POLICIES AND PROCEDURES
            </h2>

            <p className="mb-4">
              The rules suggested below were created for both the safety of the employee as well as the employer. These policies of
              MONKEYMANS are general guidelines of our current policies. They are not inflexible rules or requirements. They may be
              changed by the company at any time without notice or modified as individual circumstances may require in the best interest of
              the efficient management of the company. Nothing in the policies as they now exist or may, in the future, be revised, is intended,
              or should be construed as a contract of employment, express or implied, nor a promise of employment for a specific period of
              time, nor a requirement that any specific procedure be followed in handling personnel issues. If you know ahead of time that you
              will need time off, fill out Absence Request Form.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.1. ABSENCE FROM WORK OR TARDINESS
            </h3>
            <p className="mb-4">
              Tardiness and absenteeism without Monkeymans or reason, at the sole discretion of the Company, will not be tolerated. It
              causes problems with daily, pre-scheduled jobs and does not reflect professionalism to the client. An employee must notify their
              immediate supervisor prior to being late or absent. Any employee that does not notify them is subject to disciplinary action up to
              and including dismissal. MONKEYMANS may make reasonable efforts to find alternative solutions to this problem, including a
              leave of absence, but it may become necessary to reassign or terminate a habitually absent or tardy employee. This policy is not
              applicable to employees on designated state or federal military, family, maternity, or medical leave.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.2. ETHICAL BEHAVIOR
            </h3>
            <p className="mb-4">
              Our Monkeymans name and reputation result, in large part, from our sense (and actions) of honor. That means the work-related
              activities &ndash; of every employee, salesperson, and owner &ndash; must reflect standards of honesty, loyalty, trustworthiness, fairness,
              concern for others and accountability.
            </p>
            <p className="mb-4">
              Employees are expected to be sensitive to any situations that can adversely impact Monkeymans Tree Service&apos;s reputation.
              They are expected to use good judgment and common sense in the way they conduct business.
            </p>
            <p className="mb-4">
              As an employee of Monkeymans Tree Service, you are likely to have access to information of a private and extremely confidential
              nature. At no time will matters of information, verbal or printed, relating to the company&apos;s operations be discussed or
              disseminated outside the company. Removal of any records, reports, or data in any form from company premises is strictly
              prohibited without the express consent of an officer of the company. Failure to adhere to this policy may result in disciplinary
              action, including separation from employment, at the sole discretion of the company. All employees should avoid personal
              financial situations that could impede or appear to impede their loyalty to the Company.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.3. OPEN DOOR POLICY
            </h3>
            <p className="mb-4">
              We strive to operate the company on the basis of open communication between all employees. We need employees to have a
              non-threatening environment in which to freely voice their ideas, concerns, and questions. We need people to share ideas and
              give feedback for the company to be successful. Everyone is entitled to a response (i.e., feedback to their ideas or concerns
              and answers to their questions) and has the right to take concerns to a higher level if not satisfied first by their immediate
              supervisor.
            </p>
            <p className="mb-4">
              All employees are encouraged to use the approach of direct communication.
            </p>
            <p className="mb-4">
              <span className="font-semibold">Example:</span> If you have a problem or concern, deal directly with the person involved. Should the situation not be remedied, follow
              the &ldquo;chain of command&rdquo;. In other words, speak with your crew leader or supervisor. Should the situation still not be resolved, go
              up the chain of command, however, always start at the source and then, if necessary, involve other levels of management.
            </p>
            <p className="mb-4">
              <span className="font-semibold">Exception: Harassment</span> &ndash; if you believe you are being harassed, follow the specific procedures outlined in that section.
            </p>
          </div>

          {/* Page 17 (approx) - Company Policies and Procedures */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              4. COMPANY POLICIES AND PROCEDURES
            </h2>

            <p className="mb-4">
              The rules suggested below were created for both the safety of the employee as well as the employer. These policies of
              MONKEYMANS are general guidelines of our current policies. They are not inflexible rules or requirements. They may be
              changed by the company at any time without notice or modified as individual circumstances may require in the best interest of
              the efficient management of the company. Nothing in the policies as they now exist or may, in the future, be revised, is intended,
              or should be construed as a contract of employment, express or implied, nor a promise of employment for a specific period of
              time, nor a requirement that any specific procedure be followed in handling personnel issues. If you know ahead of time that you
              will need time off, fill out Absence Request Form.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.1. ABSENCE FROM WORK OR TARDINESS
            </h3>
            <p className="mb-4">
              Tardiness and absenteeism without Monkeymans or reason, at the sole discretion of the Company, will not be tolerated. It
              causes problems with daily, pre-scheduled jobs and does not reflect professionalism to the client. An employee must notify their
              immediate supervisor prior to being late or absent. Any employee that does not notify them is subject to disciplinary action up to
              and including dismissal. MONKEYMANS may make reasonable efforts to find alternative solutions to this problem, including a
              leave of absence, but it may become necessary to reassign or terminate a habitually absent or tardy employee. This policy is not
              applicable to employees on designated state or federal military, family, maternity, or medical leave.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.2. ETHICAL BEHAVIOR
            </h3>
            <p className="mb-4">
              Our Monkeymans name and reputation result, in large part, from our sense (and actions) of honor. That means the work-related
              activities &ndash; of every employee, salesperson, and owner &ndash; must reflect standards of honesty, loyalty, trustworthiness, fairness,
              concern for others and accountability.
            </p>
            <p className="mb-4">
              Employees are expected to be sensitive to any situations that can adversely impact Monkeymans Tree Service&apos;s reputation.
              They are expected to use good judgment and common sense in the way they conduct business.
            </p>
            <p className="mb-4">
              As an employee of Monkeymans Tree Service, you are likely to have access to information of a private and extremely confidential
              nature. At no time will matters of information, verbal or printed, relating to the company&apos;s operations be discussed or
              disseminated outside the company. Removal of any records, reports, or data in any form from company premises is strictly
              prohibited without the express consent of an officer of the company. Failure to adhere to this policy may result in disciplinary
              action, including separation from employment, at the sole discretion of the company. All employees should avoid personal
              financial situations that could impede or appear to impede their loyalty to the Company.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.3. OPEN DOOR POLICY
            </h3>
            <p className="mb-4">
              We strive to operate the company on the basis of open communication between all employees. We need employees to have a
              non-threatening environment in which to freely voice their ideas, concerns, and questions. We need people to share ideas and
              give feedback for the company to be successful. Everyone is entitled to a response (i.e., feedback to their ideas or concerns
              and answers to their questions) and has the right to take concerns to a higher level if not satisfied first by their immediate
              supervisor.
            </p>
            <p className="mb-4">
              All employees are encouraged to use the approach of direct communication.
            </p>
            <p className="mb-4">
              <span className="font-semibold">Example:</span> If you have a problem or concern, deal directly with the person involved. Should the situation not be remedied, follow
              the &ldquo;chain of command&rdquo;. In other words, speak with your crew leader or supervisor. Should the situation still not be resolved, go
              up the chain of command, however, always start at the source and then, if necessary, involve other levels of management.
            </p>
            <p className="mb-4">
              <span className="font-semibold">Exception: Harassment</span> &ndash; if you believe you are being harassed, follow the specific procedures outlined in that section.
            </p>
          </div>

          {/* Page 18 (approx) - Communication and Alcohol/Drugs */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.4. COMMITMENT TO DIRECT COMMUNICATION
            </h3>
            <p className="mb-4">
              In order to work together more productively, and avoid confusing or damaging activity, we will strive to practice the following as
              part of our company culture:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                Voice any concerns about the actions or omissions of another person directly with that person, and not a third party or
                group. (This does not rule out testing new ideas amongst a group, which is encouraged.) Do not spread negative
                feelings that you have not shared with the person involved.
              </li>
              <li>Be open to accepting concerns presented by others and make an honest assessment.</li>
              <li>
                If someone falls into the damaging practice of talking unfairly about another person, stop the damage by helping that
                person direct their concerns to the person they were talking about.
              </li>
              <li>Deal directly with problems; do not divert, ignore, bottle up feelings, etc.</li>
              <li>
                Spreading rumors is an unacceptable practice because of the conflict, problems, and needless worry that can occur.
                Use the Open-Door Policy to get a direct answer.
              </li>
              <li>
                If you are not satisfied with a response after voicing a concern, or there is still a specific disagreement, take your
                concern to the next higher level (i.e., use the Open-Door Policy).
              </li>
            </ul>

            <p className="mb-4">
              These practices are consistent with our company Monkeymans&apos;s all of making decisions and handling knowledge, and ability to
              work with diversified personalities within the MONKEYMANS team, business ethics and attitudes.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.5. ALCOHOL AND DRUGS
            </h3>
            <p className="mb-4">
              MONKEYMANS has a strong commitment to provide a safe workplace for its employees. Our Monkeymans al is to maintain a
              workplace free from the effects of harmful substances and protect employee&apos; safety, follow the law, and eliminate potential
              damage to people and the company. This policy cannot be taken lightly. It involves personal safety, customer expectations, and
              legal requirements.
            </p>

            <p className="mb-4">
              Employees are responsible for their own behavior. Our preferred approach is to help employees overcome any impairment
              problems that they might have and improve their effectiveness as productive team members.
            </p>

            <p className="mb-4">
              Our policy prohibits the use, sale, distribution, manufacture, or possession of alcohol or drugs, paraphernalia, the unauthorized
              use of prescription drugs, the use of any legally obtained drug (prescriptions or over-the-counter medications) when such use
              adversely affects the employee&apos;s job performance or safety, or any combination thereof, on MONKEYMANS premises or any
              location at which company business is conducted including client / consultant offices and jobsites. This policy prohibits reporting
              to work or working while under the influence of alcohol or illegal drugs. Any employee found to be working under the influence is
              subject to immediate dismissal.
            </p>

            <p className="mb-4">
              Where the law permits, MONKEYMANS reserves the right to conduct drug testing for baseline testing, random testing purposes,
              pre-employment screening, specific incidents, probable cause, fitness for duty, and post-accident. This list is not intended to
              limit the events which would require a drug test, and MONKEYMANS reserves the right to test for alcohol and drug abuse for
              other lawful reasons. A positive test result will be deemed a violation of this policy and will result in disciplinary action, up to and
              including termination.
            </p>

            <p className="mb-4">
              MONKEYMANS reserves the right to inspect and/or search any MONKEYMANS property, as well as the employee&apos;s personal
              property on MONKEYMANS premises, in MONKEYMANS vehicles or on leased premises for alcohol, controlled or illegal
              substances, or other substances which impair safe job performance or any illegal property. Refusal to submit to any such
              inspection or refusal to cooperate in an investigation shall subject the employee to corrective action including immediate
              termination.
            </p>

          </div>

          {/* Page 19 (approx) - Workplace Conduct */}
          <div className="mb-12">
           

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.6. HARASSMENT
            </h3>
            <p className="mb-4">
              MONKEYMANS has a zero-tolerance policy towards harassment. Harassment is defined as conduct that substantially interferes
              with an employee&apos;s work performance or creates an intimidating, hostile or offensive work environment, including
              threatening/offensive conduct directed toward a person&apos;s sex, race, age, disability, religion, national origin, past, current or future
              military status, marital status, sexual orientation, or gender identity. The policy applies to any conduct on and off
              MONKEYMANS premises by any manager, coworker, vendor or client that affects an employee&apos;s work environment. Employees
              who feel they have been victims of harassment should report the incident to the Supervisor or President. Information regarding
              the incident will be held in confidence.
            </p>

            <p className="mb-4">
              MONKEYMANS is committed to maintaining a working environment free of sexual harassment. Sexual harassment is any form
              of sexually offensive touching or verbal conduct, including, but is not limited to, unwelcome sexual advances, or sexually
              offensive comments, requests for sexual favors, verbal abuse, leering, sexual gestures, the display of derogatory or sexually
              suggestive pictures or objects, and physical conduct such as touching or impeding movement. Any physical or verbal conduct of
              a sexual nature constitutes sexual harassment when:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Submission to the conduct is made either an explicit or implicit condition of employment.</li>
              <li>Submission to or rejection of the conduct is used as the basis for employment, salary or other benefits.</li>
              <li>
                The harassment unreasonably interferes with an employee&apos;s work performance or creates an intimidating, difficult,
                hostile or offensive work environment.
              </li>
            </ol>

            <p className="mb-4">
              Any employee that feels he/she has been harassed should take the following steps:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>
                Employees are encouraged to report harassment of any kind because the company cannot take corrective action
                without being made award of the problem.
              </li>
              <li>
                Employees, at their option, should report harassment complaints to a supervisor other than the alleged offender. A
                female employee who prefers to make a complaint to a female member of the staff will be accommodated. Supervisors
                must, promptly report all sexual harassment complaints to the President. Complaints should be as specific as possible
                as to the date, time, place, and nature of incidents complained of, as well as whether there are any witnesses to the
                misconduct.
              </li>
              <li>
                The President or his designated representative is responsible for promptly conducting a thorough confidential
                investigation of the alleged misconduct.
              </li>
              <li>
                If, upon the completion of the company&apos;s investigation, it determines that prohibited conduct did occur, it shall promptly
                implement corrective and disciplinary action, including the possibility of discharge of offending persons.
              </li>
            </ol>

            <p className="mb-4">
              Harassment is a serious offense and any employee found to have engaged in such conduct is subject to severe discipline,
              including discharge. In the event a complaint of harassment is found to be totally and completely without basis, appropriate
              disciplinary measures may be taken against the employee who brought the false complaint.
            </p>
          </div>

          {/* Page 20 (approx) - Workplace Conduct continued */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.7. MOONLIGHTING
            </h3>
            <p className="mb-4">
              Solicitation or performance of tree service work or arborist consulting for yourself or anyone other than Monkeymans Tree
              Service is forbidden on or off the clock. Using Monkeymans Tree Service equipment for personal use and working
              independently for established MONKEYMANS customers are grounds for immediate dismissal. MONKEYMANS will pay you a
              commission for any work you bring in.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.8. USE OF COMPANY VEHICLES / EQUIPMENT
            </h3>
            <p className="mb-4">
              Employees shall only use MONKEYMANS vehicles and equipment when working on company time. Non-employees are not
              allowed to use company equipment or drive / ride along in company vehicles at any time. You are expected to exercise due care
              in your use of company property and use such property only for authorized purposes. Negligence in the care and use of
              company property may be considered cause for suspension and/or dismissal.
            </p>
            <p className="mb-4">
              Your immediate supervisor must be notified immediately when a vehicle or piece of equipment needs repair. Worn out or broken
              tools must be turned in for replacement.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.9. ACCIDENT / INCIDENT REPORTING
            </h3>
            <p className="mb-4">
              Employees shall report all bodily injury / accidents / near misses, customer property accident / incidents / breakage immediately
              to their immediate supervisor. Vehicle / equipment accident / incidents / breakage should be reported immediately or at the end
              of the day depending on severity to your immediate supervisor.
            </p>
            <p className="mb-4">
              If an accident occurs which requires professional medical treatment, the worker must fill out a workers&apos; compensation form 801
              form as soon as possible. Form 801 can be requested from the office manager. When the attending physician releases the
              worker to return to work, they must submit a release form listing any modified duties (if any) from the attending physician to the
              office.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.10. SMOKING POLICY
            </h3>
            <p className="mb-4">
              To protect your coworker&apos;s health and to present a professional image at all times, MONKEYMANS has the following policy on
              smoking. No smoking is allowed during business hours in offices, in company equipment shop, or anywhere in or near a client&apos;
              home, deck, porch or property. Smoking is only allowed on scheduled breaks and during lunch as long as you are at least 25&apos;
              from any customer, employee, equipment or office. No smoking in MONKEYMANS vehicles.
            </p>

            <h3 className="text-xl font-bold mt-4 mb-2 ">
              4.11. TELEPHONE USE
            </h3>
            <p className="mb-4">
              All telephone calls should be handled promptly and courteously. Phones should be answered with a greeting such as:
              &ldquo;Moneyman&apos;s Tree Service, good morning (or afternoon).&rdquo; If you take a message, you should pass it on as quickly as possible to
              the person to whom it was directed.
            </p>
            <p className="mb-4">
              In general, personal incoming and outgoing calls should not be made during company time, although MONKEYMANS realizes
              that there are times that such calls are necessary. We ask that you keep these calls to a minimum and not let them interfere with
              your work. Try to place personal calls on your breaks or at lunch. Long conversations on unimportant matters may result in
              disciplinary action. Long distance personal calls should not be made on company telephones. Over charges on company
              cellular phones from personal calls must be reimbursed to the company. Note: If you are taking a personal call, you are not on
              company time.
            </p>

          </div>

          {/* Continue with all remaining sections... */}

          {/* Acknowledgment section at the end */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ACKNOWLEDGMENT</h2>
            <p className="mb-4">
              This is for your use and a source of information about MONKEYMANS
              and your job. It is not a contract of employment, express or
              implied, but sets forth regulations of employment, methods for
              resolving conflicts, and an explanation of your benefits and
              policies. By signing below, you acknowledge as follows:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-6">
              <li>I received a copy of the handbook.</li>
              <li>
                I serve at will. MONKEYMANS or I may terminate my employment
                relationship at any time, for any reason not expressly
                prohibited by law.
              </li>
              <li>
                It is my responsibility to read and understand the handbook and
                am invited to ask any questions that I may have.
              </li>
              <li>
                MONKEYMANS reserves the right to revise, modify, delete or add
                to any and all policies, procedures, work rules or benefits
                stated in this Handbook or in any document at any time, with or
                without notice to me.
              </li>
              <li>
                MONKEYMANS does not guarantee any employee specific benefits
                because the employee benefits program, policies and procedures
                may change from time to time without employee consent; benefits
                are reviewed annually and subject to change.
              </li>
              <li>
                No representative of company, other than its Principals, has the
                authority to enter into any agreement for employment for a
                specified period of time or make any agreement contrary to the
                policies contained in this manual; and
              </li>
            </ol>
            <p className="mb-6">
              Please sign and return this acknowledgement to Office Manager.
            </p>

            <div className="border-t border-black pt-4">
              <div className="flex justify-between mb-8">
                <div className="w-1/2 border-b border-black pb-1">
                  Employee Signature
                </div>
                <div className="w-1/2 border-b border-black pb-1">Date</div>
              </div>
              <div className="w-1/2 border-b border-black pb-1">
                Employee Printed Name
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHandbook;
