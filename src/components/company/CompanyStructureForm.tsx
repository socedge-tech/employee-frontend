import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import {
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Trash2,
  PlusCircle,
  Eye,
  Pencil,
} from "lucide-react";
import { Button } from "../ui/button";

interface CompanyStructureFormProps {
  companyData: any;
  setCompanyData: (data: any) => void;
  updateField: (section: any, field: string, value: any) => void;
  activeTab: string;
  isReadOnly: boolean;
  addLocation: () => void;
  updateLocation: (id: string, field: string, value: any) => void;
  removeLocation: (id: string) => void;
}

export const CompanyStructureForm: React.FC<CompanyStructureFormProps> = ({
  companyData,
  setCompanyData,
  updateField,
  activeTab,
  isReadOnly,
  addLocation,
  updateLocation,
  removeLocation,
}) => {
  if (activeTab === "legal") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Panel */}
        <div className="lg:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Legal Entity & Tax Information
                </h4>
                <p className="text-sm text-blue-700">
                  Define the legally registered entity, which is critical for
                  taxation and statutory compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Legal Entity Information */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Legal Entity Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyData.legalEntityName}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      legalEntityName: e.target.value,
                    })
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter legal entity name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Code/ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyData.companyCode}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      companyCode: e.target.value,
                    })
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter company code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={companyData.companyType}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      companyType: e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
                >
                  <option value="" disabled>
                    Select Company Type
                  </option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Public Limited">Public Limited</option>
                  <option value="LLP">LLP</option>
                  <option value="Corporation">Corporation</option>
                  <option value="LLC">LLC</option>
                  <option value="Sole Proprietorship">
                    Sole Proprietorship
                  </option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <input
                  type="text"
                  value={companyData.jurisdiction}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      jurisdiction: e.target.value,
                    })
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="e.g., Delaware, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={companyData.currency}
                  onChange={(e) =>
                    !isReadOnly && updateField("currency", "", e.target.value)
                  }
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year End
                </label>
                <input
                  type="date"
                  value={companyData.fiscalYearEnd}
                  onChange={(e) =>
                    !isReadOnly &&
                    updateField("fiscalYearEnd", "", e.target.value)
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Legal Address */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Legal Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyData.legalAddress.street}
                  onChange={(e) =>
                    !isReadOnly &&
                    updateField("legalAddress", "street", e.target.value)
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.legalAddress.city}
                    onChange={(e) =>
                      !isReadOnly &&
                      updateField("legalAddress", "city", e.target.value)
                    }
                    readOnly={isReadOnly}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.legalAddress.state}
                    onChange={(e) =>
                      !isReadOnly &&
                      updateField("legalAddress", "state", e.target.value)
                    }
                    readOnly={isReadOnly}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.legalAddress.zipCode}
                    onChange={(e) =>
                      !isReadOnly &&
                      updateField("legalAddress", "zipCode", e.target.value)
                    }
                    readOnly={isReadOnly}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Enter zip code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={companyData.legalAddress.country}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      const newCountry = e.target.value;
                      let newCompType = companyData.companyType;
                      if (newCountry === "India")
                        newCompType = "Private Limited";
                      else if (newCountry === "USA")
                        newCompType = "Corporation";

                      setCompanyData({
                        ...companyData,
                        legalAddress: {
                          ...companyData.legalAddress,
                          country: newCountry,
                        },
                        companyType: newCompType,
                      });
                    }}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
                  >
                    <option value="" disabled>
                      Select Country
                    </option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Tax Registration Number */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded text-xs font-bold">
                %
              </span>
              Tax Registration Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {companyData.legalAddress.country === "India"
                    ? "Permanent Account Number (PAN)"
                    : companyData.legalAddress.country === "USA"
                      ? "EIN / TIN"
                      : companyData.legalAddress.country === "France"
                        ? "SIRET Number"
                        : "Tax Registration Number"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={
                    companyData.legalAddress.country === "India"
                      ? (companyData.taxRegistrationNumbers?.pan ?? "")
                      : companyData.legalAddress.country === "USA"
                        ? (companyData.taxRegistrationNumbers?.ein ?? "")
                        : companyData.legalAddress.country === "France"
                          ? (companyData.taxRegistrationNumbers?.siret ?? "")
                          : (companyData.taxRegistrationNumbers?.other ?? "")
                  }
                  onChange={(e) => {
                    if (isReadOnly) return;
                    const val = e.target.value.toUpperCase();
                    const country = companyData.legalAddress.country;
                    const taxKey =
                      country === "India"
                        ? "pan"
                        : country === "USA"
                          ? "ein"
                          : country === "France"
                            ? "siret"
                            : "other";
                    updateField("taxRegistrationNumbers", taxKey, val);
                  }}
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent uppercase ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder={
                    companyData.legalAddress.country === "India"
                      ? "Enter PAN (e.g., ABCDE1234F)"
                      : companyData.legalAddress.country === "USA"
                        ? "Enter EIN/TIN (e.g., 12-3456789)"
                        : companyData.legalAddress.country === "France"
                          ? "Enter SIRET (14 digits)"
                          : "Enter Tax Registration Number"
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Tax ID (Optional)
                </label>
                <input
                  type="text"
                  value={companyData.taxRegistrationNumbers.other}
                  onChange={(e) =>
                    !isReadOnly &&
                    updateField(
                      "taxRegistrationNumbers",
                      "other",
                      e.target.value,
                    )
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter secondary tax ID"
                />
              </div>
            </div>
            {companyData.legalAddress.country === "India" && (
              <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                <span className="font-semibold">Note:</span> GST and Tax rules
                may vary across different states in India.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === "organizational") {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 text-sm mb-1">
                Organizational Structure
              </h4>
              <p className="text-sm text-purple-700">
                Define functional units, cost centers, and job hierarchy.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Business Units & Divisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Units
                </label>
                <textarea
                  value={companyData.businessUnits?.join("\n") || ""}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      businessUnits: e.target.value.split("\n"),
                    })
                  }
                  readOnly={isReadOnly}
                  rows={4}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter each business unit on a new line&#10;e.g., Product A&#10;Region B&#10;Service C"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each business unit on a new line
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Cost Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Center Codes
              </label>
              <textarea
                value={companyData.costCenters?.join("\n") || ""}
                onChange={(e) =>
                  !isReadOnly &&
                  setCompanyData({
                    ...companyData,
                    costCenters: e.target.value.split("\n"),
                  })
                }
                readOnly={isReadOnly}
                rows={4}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                placeholder="Enter each cost center on a new line&#10;e.g., CC-100 - Engineering&#10;CC-200 - Sales&#10;CC-300 - Marketing"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for financial tracking and allocating employee costs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === "geographical") {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 text-sm mb-1">
                Geographical & Location Structure
              </h4>
              <p className="text-sm text-green-700">
                Add physical office locations for reginal compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Office Locations</h3>
          {!isReadOnly && (
            <Button onClick={addLocation} size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" /> Add Location
            </Button>
          )}
        </div>

        {companyData.locations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No locations added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {companyData.locations.map((loc: any) => (
              <Card
                key={loc.id}
                className="shadow-sm border-gray-200 overflow-hidden"
              >
                <CardHeader className="bg-gray-50 border-b border-gray-200 flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    {loc.locationName || "New Location"}
                  </CardTitle>
                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="View Location"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Location"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(loc.id)}
                        className="h-10 w-10 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Remove Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Name
                      </label>
                      <input
                        type="text"
                        value={loc.locationName}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "locationName", e.target.value)
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="e.g. Headquarters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Code
                      </label>
                      <input
                        type="text"
                        value={loc.locationCode}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "locationCode", e.target.value)
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="e.g. HQ-001"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={loc.address.street}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "address", {
                            ...loc.address,
                            street: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={loc.address.city}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "address", {
                            ...loc.address,
                            city: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={loc.address.state}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "address", {
                            ...loc.address,
                            state: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter state/province"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        value={loc.address.zipCode}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "address", {
                            ...loc.address,
                            zipCode: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter zip code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={loc.address.country}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "address", {
                            ...loc.address,
                            country: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select
                        value={loc.timeZone}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "timeZone", e.target.value)
                        }
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
                      >
                        <option value="">Select Time Zone</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="America/New_York">USA (Eastern)</option>
                        <option value="Europe/London">UK (GMT)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Location/Establishment
                      </label>
                      <input
                        type="text"
                        value={loc.taxLocation}
                        onChange={(e) =>
                          !isReadOnly &&
                          updateLocation(loc.id, "taxLocation", e.target.value)
                        }
                        readOnly={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                        placeholder="Enter tax location"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "hrPayroll") {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900 text-sm mb-1">
                HR & Payroll Structure
              </h4>
              <p className="text-sm text-orange-700">
                Configure payroll settings and working calendar.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Payroll Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payroll Statutory Unit (PSU)
              </label>
              <input
                type="text"
                value={companyData.payrollStatutoryUnit}
                onChange={(e) =>
                  !isReadOnly &&
                  setCompanyData({
                    ...companyData,
                    payrollStatutoryUnit: e.target.value,
                  })
                }
                readOnly={isReadOnly}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isReadOnly ? "bg-gray-50" : ""}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Employer
              </label>
              <input
                type="text"
                value={companyData.legalEmployer}
                onChange={(e) =>
                  !isReadOnly &&
                  setCompanyData({
                    ...companyData,
                    legalEmployer: e.target.value,
                  })
                }
                readOnly={isReadOnly}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isReadOnly ? "bg-gray-50" : ""}`}
                placeholder="Entity that signs contracts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legislative Data Group (LDG)
              </label>
              <input
                type="text"
                value={companyData.legislativeDataGroup || ""}
                onChange={(e) =>
                  !isReadOnly &&
                  setCompanyData({
                    ...companyData,
                    legislativeDataGroup: e.target.value,
                  })
                }
                readOnly={isReadOnly}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isReadOnly ? "bg-gray-50" : ""}`}
                placeholder="Payroll information grouping"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contains currency, tax rules, and pension types
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Frequency <span className="text-red-500">*</span>
              </label>
              <select
                value={companyData.payFrequency}
                onChange={(e) =>
                  !isReadOnly &&
                  setCompanyData({
                    ...companyData,
                    payFrequency: e.target.value,
                  })
                }
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Working Calendar & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Working Hours per Week
                </label>
                <input
                  type="number"
                  value={companyData.workingCalendar?.standardHours || 40}
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      workingCalendar: {
                        ...companyData.workingCalendar,
                        standardHours: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  min="0"
                  max="168"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Working Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(
                          companyData.workingCalendar?.workingDays || []
                        ).includes(day)}
                        onChange={(e) => {
                          if (isReadOnly) return;
                          const days = e.target.checked
                            ? [
                                ...(companyData.workingCalendar?.workingDays ||
                                  []),
                                day,
                              ]
                            : (
                                companyData.workingCalendar?.workingDays || []
                              ).filter((d: string) => d !== day);
                          setCompanyData({
                            ...companyData,
                            workingCalendar: {
                              ...companyData.workingCalendar,
                              workingDays: days,
                            },
                          });
                        }}
                        disabled={isReadOnly}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Holidays
                </label>
                <textarea
                  value={
                    companyData.workingCalendar?.publicHolidays?.join("\n") ||
                    ""
                  }
                  onChange={(e) =>
                    !isReadOnly &&
                    setCompanyData({
                      ...companyData,
                      workingCalendar: {
                        ...companyData.workingCalendar,
                        publicHolidays: e.target.value
                          .split("\n")
                          .filter((v: string) => v.trim()),
                      },
                    })
                  }
                  readOnly={isReadOnly}
                  rows={6}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent ${isReadOnly ? "bg-gray-50" : ""}`}
                  placeholder="Enter each holiday on a new line&#10;e.g., New Year's Day - Jan 1&#10;Christmas - Dec 25"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each public holiday on a new line
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
