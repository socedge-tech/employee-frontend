import axiosInstance from "./axiosInstance";

export interface Employee {
  id: number;
  username: string;
  email: string;
  status: boolean;
  created_at: string;
  details?: {
    id: number;
    user_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    marital_status: string;
    blood_group: string;
    phone: string;
    secondary_phone?: string;
    secondary_email?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    employee_id: string;
    department_id: number;
    job_role: string;
    employment_type: string;
    start_date: string;
    work_location: string;
    work_schedule?: string;
    reporting_manager_id?: number;
    probation_period?: number;
    base_salary: string;
    currency: string;
    salary_frequency: string;
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    routing_number?: string;
    ifsc_number?: string;
    department?: {
      id: number;
      department_name: string;
    };
    [key: string]: any;
  };
  roles?: any[];
  [key: string]: any;
}

export const getEmployees = async (params: any = {}): Promise<Employee[]> => {
  try {
    const response = await axiosInstance.get("/employees", { params });
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch employees" };
  }
};

export const getEmployee = async (id: number): Promise<Employee> => {
  try {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch employee details" };
  }
};

export const createEmployee = async (data: any): Promise<Employee> => {
  try {
    const response = await axiosInstance.post("/employees", data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to create employee" };
  }
};

export const updateEmployee = async (id: number, data: any): Promise<Employee> => {
  try {
    const response = await axiosInstance.put(`/employees/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to update employee" };
  }
};

export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/employees/${id}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to delete employee" };
  }
};
