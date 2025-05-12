
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Star, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Stylist } from "@/types/dashboard";
import StylistFormModal from "./StylistFormModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StylistsTabProps {
  stylists: Stylist[];
  onAddStaff: (stylist: Partial<Stylist>) => void;
  onEditStaff: (stylist: Stylist) => void;
}

const StylistsTab = ({ stylists, onAddStaff, onEditStaff }: StylistsTabProps) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | undefined>(undefined);
  const [localStylists, setLocalStylists] = useState<Stylist[]>(stylists);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    const stylist = localStylists.find(s => s.id === id);
    if (stylist) {
      setEditingStylist(stylist);
    }
  };
  
  const handleDeleteStylist = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('stylists')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete error:", error);
        throw new Error(error.message || "Failed to delete stylist");
      }
      
      // Remove from local state
      const updatedStylists = localStylists.filter(s => s.id !== id);
      // Update the localStylists list
      setLocalStylists(updatedStylists);
      toast.success("تم حذف المصمم بنجاح");
    } catch (error: any) {
      console.error("Error deleting stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء حذف المصمم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStylist = async (stylist: Partial<Stylist>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stylists')
        .insert({
          name: stylist.name || "",
          role: stylist.role || "",
          image: stylist.image || "",
          bio: stylist.bio || "",
          specialties: stylist.specialties || [],
          rating: stylist.rating || 5.0,
          reviews: stylist.reviews || 0,
          available: stylist.available !== undefined ? stylist.available : true,
          experience: stylist.experience || 1
        })
        .select();
      
      if (error) {
        console.error("Insert error:", error);
        throw new Error(error.message || "Failed to add stylist");
      }
      
      if (data && data[0]) {
        // Format the returned data
        const newStylist: Stylist = {
          id: data[0].id,
          name: data[0].name,
          role: data[0].role,
          image: data[0].image,
          rating: data[0].rating,
          reviews: data[0].reviews,
          specialties: data[0].specialties,
          bio: data[0].bio || "",
          available: data[0].available,
          experience: data[0].experience,
          services: [],
          clientReviews: []
        };
        
        // Add the new stylist to state
        setLocalStylists([...localStylists, newStylist]);
        onAddStaff(newStylist);
        setIsAddModalOpen(false);
        toast.success("تمت إضافة المصمم بنجاح");
      }
    } catch (error: any) {
      console.error("Error adding stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة المصمم");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditStylist = async (updatedStylist: Stylist) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('stylists')
        .update({
          name: updatedStylist.name,
          role: updatedStylist.role,
          image: updatedStylist.image,
          bio: updatedStylist.bio,
          specialties: updatedStylist.specialties,
          rating: updatedStylist.rating,
          reviews: updatedStylist.reviews,
          available: updatedStylist.available,
          experience: updatedStylist.experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStylist.id);
      
      if (error) {
        console.error("Update error:", error);
        throw new Error(error.message || "Failed to update stylist");
      }
      
      // Update the stylist in state
      const updatedStylists = localStylists.map(stylist => 
        stylist.id === updatedStylist.id ? updatedStylist : stylist
      );
      setLocalStylists(updatedStylists);
      onEditStaff(updatedStylist);
      setEditingStylist(undefined);
      toast.success("تم تحديث بيانات المصمم بنجاح");
    } catch (error: any) {
      console.error("Error updating stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء تحديث بيانات المصمم");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update local state when props change
  useEffect(() => {
    if (JSON.stringify(stylists) !== JSON.stringify(localStylists)) {
      setLocalStylists(stylists);
    }
  }, [stylists]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {localStylists.map((stylist) => (
        <Card key={stylist.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-1/3">
                <img 
                  src={stylist.image} 
                  alt={stylist.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-2/3 p-6">
                <h3 className="text-lg font-semibold mb-1">{stylist.name}</h3>
                <p className="text-salon-green text-sm mb-3">{stylist.role}</p>
                
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-gold fill-gold" />
                  <span className="ml-1 text-sm">
                    {stylist.rating} ({stylist.reviews} تقييم)
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {stylist.specialties?.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="bg-gray-50">
                      {specialty}
                    </Badge>
                  ))}
                  {stylist.specialties && stylist.specialties.length > 2 && (
                    <Badge variant="outline" className="bg-gray-50">
                      +{stylist.specialties.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(stylist.id)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteStylist(stylist.id)}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    حذف
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-salon-green hover:bg-salon-darkGreen text-white"
                    onClick={() => navigate(`/stylist/${stylist.id}`)}
                  >
                    عرض الجدول
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center p-12">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center p-8"
            onClick={handleAddClick}
            disabled={isLoading}
          >
            <Plus className="h-8 w-8 mb-2 text-salon-green" />
            <span>إضافة مصمم جديد</span>
          </Button>
        </CardContent>
      </Card>

      {/* Add Stylist Modal */}
      {isAddModalOpen && (
        <StylistFormModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddStylist}
        />
      )}

      {/* Edit Stylist Modal */}
      {editingStylist && (
        <StylistFormModal
          isOpen={!!editingStylist}
          onClose={() => setEditingStylist(undefined)}
          onSave={(stylist) => {
            handleEditStylist({...editingStylist, ...stylist} as Stylist);
          }}
          editStylist={editingStylist}
        />
      )}
    </div>
  );
};

export default StylistsTab;
