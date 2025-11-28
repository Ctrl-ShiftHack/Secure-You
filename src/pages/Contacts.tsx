import { Plus, AlertTriangle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { EmergencyContact } from "@/types/database.types";
import { formatBDPhone } from "@/lib/validation";
import { getCurrentLocation } from "@/lib/emergency";
import { calculateDistance, formatDistance, geocodeAddress } from "@/lib/googleMapsServices";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);
  const [contactDistances, setContactDistances] = useState<Record<string, string>>({});

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
      
      // Calculate distances for contacts with addresses
      if (window.google) {
        try {
          const userLocation = await getCurrentLocation();
          const distances: Record<string, string> = {};
          
          for (const contact of data) {
            if (contact.address) {
              try {
                const contactLocation = await geocodeAddress(contact.address);
                if (contactLocation) {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    contactLocation.lat,
                    contactLocation.lng
                  );
                  distances[contact.id] = formatDistance(distance);
                }
              } catch (err) {
                console.log(`Could not geocode ${contact.name}:`, err);
              }
            }
          }
          
          setContactDistances(distances);
        } catch (err) {
          console.log('Could not calculate distances:', err);
        }
      }
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

  const handleDeleteClick = (contactId: string, contactName: string) => {
    setContactToDelete({ id: contactId, name: contactName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    
    try {
      await contactsService.deleteContact(contactToDelete.id);
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
      toast({
        title: "Contact Deleted",
        description: `${contactToDelete.name} has been removed from your contacts`
      });
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: error?.message || "Could not delete contact",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleCall = (phone: string) => {
    // Use tel: link to initiate call on supported devices
    window.location.href = `tel:${phone}`;
  };

  const handleNavigate = async (contact: EmergencyContact) => {
    if (!contact.address) {
      toast({
        title: "No Address",
        description: "This contact doesn't have an address set",
        variant: "destructive"
      });
      return;
    }

    try {
      const userLocation = await getCurrentLocation();
      const contactLocation = await geocodeAddress(contact.address);
      
      if (contactLocation) {
        // Open in Google Maps with directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${contactLocation.lat},${contactLocation.lng}`;
        window.open(url, '_blank');
      } else {
        toast({
          title: "Address Not Found",
          description: "Could not find location for this address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Could not start navigation",
        variant: "destructive"
      });
    }
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
                  address={contact.address}
                  distance={contactDistances[contact.id]}
                  isPrimary={contact.is_primary}
                  onEdit={() => handleEdit(contact.id)}
                  onDelete={() => handleDeleteClick(contact.id, contact.name)}
                  onCall={() => handleCall(contact.phone_number)}
                  onNavigate={contact.address ? () => handleNavigate(contact) : undefined}
                />
                  isPrimary={contact.is_primary}
                  onEdit={() => handleEdit(contact.id)}
                  onDelete={() => handleDeleteClick(contact.id, contact.name)}
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Contact?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{contactToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contacts;
