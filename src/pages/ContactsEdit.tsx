import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isValidBDPhone, formatBDPhone, normalizeBDPhone, sanitizeText, isValidEmail, normalizeEmail } from "@/lib/validation";
import { ArrowLeft, Loader2 } from "lucide-react";

const ContactsEdit = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { index } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactId, setContactId] = useState<string>("");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadContact = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      
      try {
        setLoading(true);
        const contacts = await contactsService.getContacts(user.id);
        const idx = Number(index);
        
        if (contacts && contacts[idx]) {
          const contact = contacts[idx];
          setContactId(contact.id);
          setName(contact.name || "");
          setRelation(contact.relationship || "");
          setPhone(formatBDPhone(contact.phone_number || ""));
          setEmail(contact.email || "");
        } else {
          toast({
            title: "Contact Not Found",
            description: "The contact you're trying to edit doesn't exist",
            variant: "destructive"
          });
          navigate("/contacts");
        }
      } catch (error: any) {
        console.error('Error loading contact:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load contact",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadContact();
  }, [index, user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !contactId) return;
    
    // Validate inputs
    if (!name.trim() || name.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name (at least 2 characters)",
        variant: "destructive"
      });
      return;
    }
    
    if (!phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidBDPhone(phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid Bangladesh phone number (11 digits starting with 01)",
        variant: "destructive"
      });
      return;
    }
    
    if (email.trim() && !isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      await contactsService.updateContact(contactId, {
        name: sanitizeText(name),
        phone_number: normalizeBDPhone(phone),
        email: email.trim() ? normalizeEmail(email) : null,
        relationship: sanitizeText(relation) || null,
      });
      
      toast({
        title: "Success",
        description: "Contact updated successfully"
      });
      
      navigate("/contacts");
    } catch (error: any) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update contact",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/contacts")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Contact</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-2 block">
              Full Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              disabled={saving}
              required
              className="h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatBDPhone(e.target.value))}
              placeholder="01XXXXXXXXX"
              disabled={saving}
              required
              className="h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={saving}
              className="h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="relation" className="text-sm font-medium mb-2 block">
              Relationship (Optional)
            </Label>
            <Input
              id="relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="e.g., Parent, Spouse, Friend"
              disabled={saving}
              className="h-12"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 gradient-primary text-white font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate("/contacts")}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsEdit;
