import { useState, useEffect } from "react";
import { Switch } from "../ui/switch"; // Assuming a Switch component exists or I'll create one
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { getIntegrations, updateIntegration, type Integration } from "../../api/settings.ts";
import { toast } from "sonner";

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to fetch integrations", error);
      toast.error("Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateIntegration(id, { status: !currentStatus });
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: !currentStatus } : i));
      toast.success(`Integration ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update integration");
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ExternalLink className="w-6 h-6 text-indigo-600" />
              </div>
              <Switch 
                checked={integration.status} 
                onCheckedChange={() => handleToggle(integration.id, integration.status)}
              />
            </div>
            <CardTitle className="mt-4">{integration.name}</CardTitle>
            <CardDescription>Connect your workflow with {integration.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="text-sm font-medium text-indigo-600 hover:underline">
              Configure Settings
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
