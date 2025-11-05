import React from 'react';

const ProjectDetailsTable = ({ projectBreakdown }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Details</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Assigned</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Completion</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projectBreakdown.map((project) => (
            <tr key={project.projectId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.projectName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.assigned}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.completed}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.completionRate}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.avgCompletion}%</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${project.completionRate >= 75 ? 'bg-green-100 text-green-800' : 
                    project.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {project.completionRate >= 75 ? 'On Track' : 
                   project.completionRate >= 50 ? 'Needs Attention' : 'Behind Schedule'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProjectDetailsTable;
