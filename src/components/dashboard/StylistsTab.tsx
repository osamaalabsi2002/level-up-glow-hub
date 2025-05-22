
import { useState, useEffect } from "react";
import { Stylist } from "@/types/dashboard";
import StylistFormModal from "./stylists/form/StylistFormModal";
import StylistCard from "./stylists/StylistCard";
import AddStylistCard from "./stylists/AddStylistCard";
import { useStylistOperations } from "@/hooks/useStylistOperations";

interface StylistsTabProps {
  stylists: Stylist[];
  onAddStaff: (stylist: Partial<Stylist>) => void;
  onEditStaff: (stylist: Stylist) => void;
}

const StylistsTab = ({ stylists, onAddStaff, onEditStaff }: StylistsTabProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | undefined>(undefined);
  
  const {
    localStylists,
    setLocalStylists,
    isLoading,
    handleDeleteStylist,
    handleAddStylist,
    handleEditStylist
  } = useStylistOperations(stylists);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    const stylist = localStylists.find(s => s.id === id);
    if (stylist) {
      setEditingStylist(stylist);
    }
  };
  
  // Handle adding a stylist
  const onSaveStylist = async (stylist: Partial<Stylist>) => {
    const newStylist = await handleAddStylist(stylist);
    if (newStylist) {
      onAddStaff(newStylist);
      setIsAddModalOpen(false);
    }
    return newStylist;
  };
  
  // Handle editing a stylist
  const onUpdateStylist = async (stylist: Partial<Stylist>) => {
    if (editingStylist) {
      const updatedStylist = await handleEditStylist({...editingStylist, ...stylist} as Stylist);
      if (updatedStylist) {
        onEditStaff(updatedStylist);
        setEditingStylist(undefined);
      }
      return updatedStylist;
    }
    return null;
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
        <StylistCard
          key={stylist.id}
          stylist={stylist}
          onEdit={handleEditClick}
          onDelete={handleDeleteStylist}
          isLoading={isLoading}
        />
      ))}
      
      <AddStylistCard 
        onClick={handleAddClick}
        isLoading={isLoading}
      />

      {/* Add Stylist Modal */}
      {isAddModalOpen && (
        <StylistFormModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={onSaveStylist}
        />
      )}

      {/* Edit Stylist Modal */}
      {editingStylist && (
        <StylistFormModal
          isOpen={!!editingStylist}
          onClose={() => setEditingStylist(undefined)}
          onSave={onUpdateStylist}
          editStylist={editingStylist}
        />
      )}
    </div>
  );
};

export default StylistsTab;
