
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  stylistId: number;
  stylistName: string;
}

const bookingFormSchema = z.object({
  name: z.string().min(3, { message: "الاسم يجب أن يكون أكثر من 3 أحرف" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  phone: z.string().min(10, { message: "رقم الهاتف يجب أن يكون أكثر من 10 أرقام" }),
  date: z.string().min(1, { message: "يرجى اختيار تاريخ" }),
  service: z.string().min(1, { message: "يرجى اختيار خدمة" }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingForm = ({ isOpen, onClose, stylistId, stylistName }: BookingFormProps) => {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      service: "",
    },
  });

  const handleSubmit = (data: BookingFormValues) => {
    console.log("Booking submitted:", { ...data, stylistId });
    toast.success("تم حجز موعدك بنجاح!", {
      description: `سيتم التواصل معك قريباً لتأكيد موعدك مع ${stylistName}`,
    });
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-salon-green text-xl font-serif">
            حجز موعد مع {stylistName}
          </DialogTitle>
          <DialogDescription>
            يرجى ملء النموذج أدناه لحجز موعدك. سنتصل بك لتأكيد التفاصيل.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسمك الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="example@mail.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+966 55 000 0000" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الموعد</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الخدمة المطلوبة</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                      {...field}
                    >
                      <option value="" disabled>اختر خدمة</option>
                      <option value="haircut">قص الشعر</option>
                      <option value="coloring">صباغة الشعر</option>
                      <option value="styling">تصفيف الشعر</option>
                      <option value="facial">العناية بالبشرة</option>
                      <option value="manicure">المانيكير والباديكير</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="mr-2"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                تأكيد الحجز
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
