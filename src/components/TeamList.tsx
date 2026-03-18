import React from 'react';
import { Eye, Pencil, Users } from 'lucide-react';

export interface Team {
  id: string | number;
  name: string;
  description: string;
  lead: string;
}

interface TeamListProps {
  teams: Team[];
  onViewTeam: (teamId: string | number) => void;
  onEditTeam: (teamId: string | number) => void;
}

/**
 * TeamList Component
 * 
 * A premium, responsive list component for displaying organizational teams.
 * Features a smooth action overlay on hover without layout shifting.
 */
const TeamList: React.FC<TeamListProps> = ({ teams, onViewTeam, onEditTeam }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Lead</th>
              <th className="px-6 py-4 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teams.length > 0 ? (
              teams.map((team) => (
                <tr 
                  key={team.id} 
                  className="group hover:bg-indigo-50/30 transition-all duration-200 cursor-default"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-1 max-w-md">
                      {team.description || "No description provided"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {team.lead}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {/* Action Container - Absolute positioning ensures no layout shift */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-2 transition-opacity duration-200 pr-2">
                      <button
                        onClick={() => onViewTeam(team.id)}
                        className="p-1.5 text-indigo-600 hover:bg-white hover:shadow-md rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTeam(team.id)}
                        className="p-1.5 text-gray-600 hover:bg-white hover:shadow-md rounded-lg border border-transparent hover:border-gray-200 transition-all"
                        title="Edit Team"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                  No teams found. Add your first team to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Example Usage ---
/*
import TeamList, { Team } from './components/TeamList';

const MyPage = () => {
  const sampleTeams: Team[] = [
    { 
      id: 1, 
      name: "Engineering Core", 
      description: "Handles primary backend infrastructure and API services.", 
      lead: "Alex Rivera" 
    },
    { 
      id: 2, 
      name: "Frontend UI/UX", 
      description: "Focuses on design systems and customer-facing interfaces.", 
      lead: "Sarah Chen" 
    },
    { 
      id: 3, 
      name: "Product Growth", 
      description: "Data-driven team optimized for user acquisition metrics.", 
      lead: "Marcus Thorne" 
    }
  ];

  const handleView = (id: string | number) => console.log("Viewing team:", id);
  const handleEdit = (id: string | number) => console.log("Editing team:", id);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Teams Management</h2>
      <TeamList 
        teams={sampleTeams} 
        onViewTeam={handleView} 
        onEditTeam={handleEdit} 
      />
    </div>
  );
};
*/

export default TeamList;
