import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface CompanyStructureFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
  canEdit: boolean;
}

export const CompanyStructureForm: React.FC<CompanyStructureFormProps> = ({
  initialData,
  onSave,
  isSaving,
  canEdit
}) => {
  const [data, setData] = useState(initialData);

  const handleChange = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEntityChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Legal Entity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Legal Entity Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Company Legal Name</label>
            <input
              value={data.companyName || ""}
              onChange={(e) => handleEntityChange("companyName", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Company Type</label>
            <input
              value={data.companyType || ""}
              onChange={(e) => handleEntityChange("companyType", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Legal Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Legal Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input
              value={data.legalAddress?.street || ""}
              onChange={(e) => handleChange("legalAddress", "street", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              value={data.legalAddress?.city || ""}
              onChange={(e) => handleChange("legalAddress", "city", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input
              value={data.legalAddress?.country || ""}
              onChange={(e) => handleChange("legalAddress", "country", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Tax Registration Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Tax Registration Numbers</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">PAN (India)</label>
            <input
              value={data.taxRegistrationNumbers?.pan || ""}
              onChange={(e) => handleChange("taxRegistrationNumbers", "pan", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">EIN (USA)</label>
            <input
              value={data.taxRegistrationNumbers?.ein || ""}
              onChange={(e) => handleChange("taxRegistrationNumbers", "ein", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">GST Registration</label>
            <input
              value={data.taxRegistrationNumbers?.gst || ""}
              onChange={(e) => handleChange("taxRegistrationNumbers", "gst", e.target.value)}
              disabled={!canEdit}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => onSave(data)} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      )}
    </div>
  );
};
