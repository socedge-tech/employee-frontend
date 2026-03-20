import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getCustomFields, type CustomField } from "../../api/settings.ts";
import { toast } from "sonner";

export function CustomFieldsTab() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomFields();
      setFields(data);
    } catch (error) {
      console.error("Failed to fetch custom fields", error);
      toast.error("Failed to load custom fields");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Fields</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-60">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No custom fields configured</p>
            <p className="text-sm text-gray-400">Add fields to support organization-specific data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Label</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Module</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Required</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{field.label}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{field.module}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{field.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{field.required ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
