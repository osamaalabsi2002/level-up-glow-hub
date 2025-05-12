
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stylist } from "@/types/dashboard";
import { toast } from "sonner";

interface StylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stylist: Partial<Stylist>) => void;
  editStylist?: Stylist;
}

const StylistFormModal = ({ isOpen, onClose, onSave, editStylist }: StylistFormModalProps) => {
  const [name, setName] = useState(editStylist?.name || "");
  const [role, setRole] = useState(editStylist?.role || "");
  const [bio, setBio] = useState(editStylist?.bio || "");
  const [image, setImage] = useState(editStylist?.image || "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFpcmRyZXNzZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60");
  const [specialties, setSpecialties] = useState(editStylist?.specialties.join(", ") || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "اسم المصمم مطلوب";
    if (!role.trim()) newErrors.role = "دور المصمم مطلوب";
    if (!image.trim()) newErrors.image = "صورة المصمم مطلوبة";
    if (!specialties.trim()) newErrors.specialties = "تخصصات المصمم مطلوبة";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const stylistData: Partial<Stylist> = {
      name,
      role,
      image,
      bio: bio || undefined,
      specialties: specialties.split(",").map(item => item.trim()),
      rating: editStylist?.rating || 5.0,
      reviews: editStylist?.reviews || 0,
      available: editStylist?.available !== undefined ? editStylist.available : true,
      experience: editStylist?.experience || 1,
    };
    
    if (editStylist) {
      stylistData.id = editStylist.id;
    }
    
    onSave(stylistData);
    onClose();
    toast.success(editStylist ? "تم تحديث بيانات المصمم بنجاح" : "تمت إضافة المصمم بنجاح");
  };

  const resetForm = () => {
    if (editStylist) {
      setName(editStylist.name);
      setRole(editStylist.role);
      setBio(editStylist.bio || "");
      setImage(editStylist.image);
      setSpecialties(editStylist.specialties.join(", "));
    } else {
      setName("");
      setRole("");
      setBio("");
      setImage("https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFpcmRyZXNzZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60");
      setSpecialties("");
    }
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editStylist ? "تعديل بيانات المصمم" : "إضافة مصمم جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">اسم المصمم</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">دور المصمم</Label>
            <Input 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className={errors.role ? "border-red-500" : ""}
              placeholder="مثال: مصمم شعر أول"
            />
            {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image">رابط الصورة</Label>
            <Input 
              id="image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)}
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="specialties">التخصصات (مفصولة بفواصل)</Label>
            <Input 
              id="specialties" 
              value={specialties} 
              onChange={(e) => setSpecialties(e.target.value)}
              className={errors.specialties ? "border-red-500" : ""}
              placeholder="مثال: قص الشعر, صبغة الشعر, تسريحات الشعر"
            />
            {errors.specialties && <p className="text-red-500 text-xs">{errors.specialties}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio">نبذة عن المصمم (اختياري)</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="submit">{editStylist ? "تحديث" : "إضافة"}</Button>
            <Button type="button" variant="outline" onClick={() => {
              onClose();
              resetForm();
            }}>
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StylistFormModal;
