import { Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { EmergencyContact } from "@/types/database.types";
import { formatBDPhone } from "@/lib/validation";

const governmentHelplines = [
  { name: "Police (National Emergency)", phone: "999", relation: "Emergency" },
  { name: "Fire Service", phone: "999", relation: "Emergency" },
  { name: "Ambulance Service", phone: "999", relation: "Emergency" },
  { name: "Women & Children Helpline", phone: "109", relation: "Support" },
  { name: "Child Helpline", phone: "1098", relation: "Support" },
];

const Contacts = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load contacts from Supabase
  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await contactsService.getContacts(user.id);
      setContacts(data);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error Loading Contacts",
        description: error?.message || "Could not load your emergency contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate("/contacts/new");
  };

  const handleEdit = (contactId: string) => {
    navigate(`/contacts/edit/${contactId}`);
  };

  const handleDelete = async (contactId: string, contactName: string) => {
    try {
      await contactsService.deleteContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast({
        title: "Contact Deleted",
        description: `${contactName} has been removed from your contacts`
      });
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: error?.message || "Could not delete contact",
        variant: "destructive"
      });
    }
  };

  const handleCall = (phone: string) => {
    // Use tel: link to initiate call on supported devices
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("contacts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("contacts.subtitle")}</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Personal Emergency Contacts */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("contacts.yourContacts")} {contacts.length > 0 && `(${contacts.length})`}
            </h3>
            <Button
              size="sm"
              className="gradient-primary text-white rounded-full h-9 px-4 sm:px-6 w-full sm:w-auto"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("contacts.addNew")}
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card p-4 rounded-2xl shadow-soft border border-border animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  name={contact.name}
                  relation={contact.relationship || "Contact"}
                  phone={formatBDPhone(contact.phone_number)}
                  email={contact.email}
                  isPrimary={contact.is_primary}
                  onEdit={() => handleEdit(contact.id)}
                  onDelete={() => handleDelete(contact.id, contact.name)}
                  onCall={() => handleCall(contact.phone_number)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card p-8 rounded-2xl shadow-soft border border-border text-center">
              <p className="text-muted-foreground mb-4">
                You haven't added any emergency contacts yet
              </p>
              <Button
                onClick={handleAdd}
                className="gradient-primary text-white rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          )}
        </div>

        {/* Government Helplines */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {t("contacts.governmentHelpline")} (Bangladesh)
          </h3>
          
          <div className="space-y-3">
            {governmentHelplines.map((helpline, index) => (
              <div
                key={index}
                className="bg-card p-4 rounded-2xl shadow-soft border border-border flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-foreground">{helpline.name}</h4>
                  <p className="text-sm text-muted-foreground">{helpline.phone}</p>
                </div>
                <Button
                  size="sm"
                  className="gradient-primary text-white rounded-full"
                  onClick={() => handleCall(helpline.phone)}
                >
                  {t("contacts.call")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Contacts;
