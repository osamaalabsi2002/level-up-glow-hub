
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "@/types/dashboard";
import { toast } from "sonner";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Partial<Service>) => void;
  editService?: Service;
}

const ServiceFormModal = ({ isOpen, onClose, onSave, editService }: ServiceFormModalProps) => {
  const [name, setName] = useState(editService?.name || "");
  const [description, setDescription] = useState(editService?.description || "");
  const [price, setPrice] = useState(editService?.price?.toString() || "");
  const [duration, setDuration] = useState(editService?.duration?.toString() || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "اسم الخدمة مطلوب";
    if (!description.trim()) newErrors.description = "وصف الخدمة مطلوب";
    if (!price.trim()) newErrors.price = "سعر الخدمة مطلوب";
    else if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = "يرجى إدخال سعر صالح";
    if (!duration.trim()) newErrors.duration = "مدة الخدمة مطلوبة";
    else if (isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = "يرجى إدخال مدة صالحة";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const serviceData: Partial<Service> = {
      name,
      description,
      price: Number(price),
      duration: Number(duration),
    };
    
    if (editService) {
      serviceData.id = editService.id;
    }
    
    onSave(serviceData);
    onClose();
    toast.success(editService ? "تم تحديث الخدمة بنجاح" : "تمت إضافة الخدمة بنجاح");
  };

  const resetForm = () => {
    if (editService) {
      setName(editService.name);
      setDescription(editService.description);
      setPrice(editService.price.toString());
      setDuration(editService.duration.toString());
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
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
          <DialogTitle>{editService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">اسم الخدمة</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">وصف الخدمة</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">السعر (ريال)</Label>
              <Input 
                id="price" 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">المدة (دقيقة)</Label>
              <Input 
                id="duration" 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && <p className="text-red-500 text-xs">{errors.duration}</p>}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="submit">{editService ? "تحديث" : "إضافة"}</Button>
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

export default ServiceFormModal;
