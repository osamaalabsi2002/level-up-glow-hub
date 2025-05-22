
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface BookingAuthPromptProps {
  navigate: NavigateFunction;
}

const BookingAuthPrompt = ({ navigate }: BookingAuthPromptProps) => {
  return (
    <Alert className="bg-amber-50 border border-amber-200">
      <AlertDescription className="flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <span>You need to have an account to book an appointment.</span>
        <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
          Sign in
        </Button>
        <span>or</span>
        <Button variant="link" className="p-0" onClick={() => navigate('/register')}>
          Create an account
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default BookingAuthPrompt;
