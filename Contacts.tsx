import { Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ContactCard } from "@/components/ContactCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const initialContacts = [
  { name: "Emergency Contact 1", relation: "Family", phone: "+880 1712 345678" },
  { name: "Emergency Contact 2", relation: "Friend", phone: "+880 1901 020762" },
  { name: "Dr. Ahmed", relation: "Doctor", phone: "+880 1345 6789" },
];

const governmentHelplines = [
  { name: "Police", phone: "+880 1320 019998" },
  { name: "Fire Service", phone: "+999" },
  { name: "Ambulance", phone: "+880 1759 808078" },
];

const Contacts = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(() => {
    try {
      const raw = localStorage.getItem("secureyou_contacts");
      return raw ? JSON.parse(raw) : initialContacts;
    } catch (e) {
      return initialContacts;
    }
  });

  // persist contacts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("secureyou_contacts", JSON.stringify(contacts));
    } catch (e) {}
  }, [contacts]);

  const handleAdd = () => {
    // Navigate to a contact creation route or open a modal (placeholder)
    navigate("/contacts/new");
  };

  const handleEdit = (index: number) => {
    // Navigate to edit screen (placeholder)
    navigate(`/contacts/edit/${index}`);
  };

  const handleDelete = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCall = (phone: string) => {
    // Use tel: link to initiate call on supported devices
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">{t("contacts.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("contacts.subtitle")}</p>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {/* Personal Emergency Contacts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("contacts.yourContacts")}
            </h3>
            <Button
              size="sm"
              className="gradient-primary text-white rounded-full h-8 px-4"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("contacts.addNew")}
            </Button>
          </div>
          
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <ContactCard
                key={index}
                {...contact}
                onEdit={() => handleEdit(index)}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </div>
        </div>

        {/* Government Helplines */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {t("contacts.governmentHelpline")}
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
