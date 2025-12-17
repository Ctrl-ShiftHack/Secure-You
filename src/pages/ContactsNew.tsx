import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService } from "@/services/api";
import { isValidBDPhone, normalizeBDPhone, formatBDPhone, getPhoneErrorMessage, isValidEmail, normalizeEmail, isValidName, sanitizeText } from "@/lib/validation";

const ContactsNew = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    // Auto-format as user types
    if (value.length >= 10 && isValidBDPhone(value)) {
      setPhone(formatBDPhone(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters, letters only)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate phone
    const phoneError = getPhoneErrorMessage(phone);
    if (phoneError) {
      toast({
        title: "Invalid Phone Number",
        description: phoneError,
        variant: "destructive"
      });
      return;
    }
    
    // Validate email if provided
    const trimmedEmail = email.trim();
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add contacts",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Fail fast if Supabase hangs
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 12000);

      await contactsService.createContact({
        user_id: user.id,
        name: sanitizeText(trimmedName),
        phone_number: normalizeBDPhone(phone),
        email: trimmedEmail ? normalizeEmail(trimmedEmail) : null,
        relationship: sanitizeText(relation.trim()) || null,
        is_primary: isPrimary,
      }, abortController.signal);

      clearTimeout(timeoutId);
      
      toast({
        title: "Contact Added",
        description: `${trimmedName} has been added to your emergency contacts`
      });
      
      navigate("/contacts");
    } catch (error: any) {
      console.error('Error creating contact:', error);
      const message = error?.name === 'AbortError'
        ? 'Request timed out. Please check your connection and try again.'
        : error?.message || 'Could not add contact. Please try again.';

      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-2">{t("contacts.addNew")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Add an emergency contact with their details</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter contact's full name"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <Label>Phone Number *</Label>
            <Input 
              value={phone} 
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+880 1XXX XXX XXX or 01XXXXXXXXX"
              type="tel"
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bangladesh mobile number (11 digits)
            </p>
          </div>
          
          <div>
            <Label>Email (Optional)</Label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              type="email"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label>Relationship (Optional)</Label>
            <Input 
              value={relation} 
              onChange={(e) => setRelation(e.target.value)}
              placeholder="e.g., Family, Friend, Doctor"
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded border-input"
              disabled={loading}
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              Set as primary emergency contact
            </Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1 gradient-primary text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Contact"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsNew;
