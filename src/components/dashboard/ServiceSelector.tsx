
import { useEffect, useState, useCallback } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface Service {
  id: number;
  name: string;
  price: number;
  description: string | null;
  duration: number;
}

interface ServiceSelectorProps {
  selectedServices: number[];
  onSelectionChange: (ids: number[]) => void;
  disabled?: boolean;
}

const ServiceSelector = ({
  selectedServices,
  onSelectionChange,
  disabled = false
}: ServiceSelectorProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cachedServices, setCachedServices] = useState<Service[]>([]);

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      onSelectionChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onSelectionChange([...selectedServices, serviceId]);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      console.log('ServiceSelector: Fetching services from Supabase, attempt:', retryCount + 1);
      setLoading(true);
      setError(null);
      
      // Set a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
      });
      
      // Actual fetch promise
      const fetchPromise = supabase
        .from('services')
        .select('*')
        .order('name');
        
      // Race between timeout and fetch
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Request timed out'); })
      ]) as any;

      if (error) {
        console.error('ServiceSelector: Error fetching services:', error);
        setError('Failed to load services: ' + error.message);
        
        // Use cached services if available
        if (cachedServices.length > 0) {
          setServices(cachedServices);
          return;
        }
        
        throw error;
      }

      if (data && Array.isArray(data)) {
        console.log(`ServiceSelector: Fetched ${data.length} services`);
        setServices(data as Service[]);
        setCachedServices(data as Service[]); // Cache the services
      } else {
        console.log('ServiceSelector: No services returned or invalid data format');
        setServices([]);
      }
    } catch (err: any) {
      console.error('ServiceSelector: Fetch error:', err);
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('timed out')) {
        setError('Network connection issue. Please check your internet connection.');
        
        // Use cached services if available
        if (cachedServices.length > 0) {
          setServices(cachedServices);
        }
      } else {
        setError(err.message || 'Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, cachedServices]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Loading state with skeletons
  if (loading && services.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center justify-between px-3 py-2 rounded-md">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 rounded-md text-red-800">
        <p className="font-semibold">Error loading services</p>
        <p className="text-sm mt-1">{error}</p>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2 flex items-center gap-2" 
          onClick={handleRetry}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Retry
        </Button>
        {cachedServices.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">Using cached service data</p>
        )}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="border border-amber-300 bg-amber-50 p-4 rounded-md text-amber-800">
        <p>No services available. Please add services first.</p>
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2 flex items-center gap-2" 
          onClick={handleRetry}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
      {error && (
        <div className="text-sm text-amber-600 flex items-center gap-2 mb-2">
          <p>{cachedServices.length > 0 ? "Using cached data due to connection issue." : error}</p>
          <Button 
            size="sm" 
            variant="outline"
            className="h-7 px-2 flex items-center gap-1" 
            onClick={handleRetry}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      )}
      
      {services.map((service) => (
        <div
          key={service.id}
          className={`
            flex justify-between items-center px-3 py-2 rounded-md cursor-pointer
            ${selectedServices.includes(service.id) 
              ? 'bg-salon-green text-white' 
              : 'bg-gray-100 hover:bg-gray-200'}
          `}
          onClick={() => toggleService(service.id)}
        >
          <div className="flex flex-1">
            <div className="mr-3">
              {selectedServices.includes(service.id) && (
                <Check className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-xs opacity-80">
                {service.duration} min • ${service.price}
              </div>
            </div>
          </div>
          
          {selectedServices.includes(service.id) && (
            <Badge variant="secondary" className="bg-white text-salon-green">
              Selected
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;
