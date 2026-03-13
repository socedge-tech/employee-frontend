import { apiFetch } from "./config";

export interface Team {
  id: number;
  name: string;
  description: string;
  leadId?: string;
  members?: string[];
}

export const getTeams = async (): Promise<Team[]> => {
  const response = await apiFetch("/teams");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createTeam = async (data: Partial<Team>): Promise<Team> => {
  const response = await apiFetch("/teams", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateTeam = async (id: number, data: Partial<Team>): Promise<Team> => {
  const response = await apiFetch(`/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteTeam = async (id: number): Promise<void> => {
  const response = await apiFetch(`/teams/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
};
