import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";

const ContactsEdit = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { index } = useParams();
  const idx = Number(index);

  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("secureyou_contacts");
      const contacts = raw ? JSON.parse(raw) : [];
      const c = contacts[idx];
      if (c) {
        setName(c.name || "");
        setRelation(c.relation || "");
        setPhone(c.phone || "");
      }
    } catch (e) {}
  }, [idx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const raw = localStorage.getItem("secureyou_contacts");
      const contacts = raw ? JSON.parse(raw) : [];
      contacts[idx] = { name, relation, phone };
      localStorage.setItem("secureyou_contacts", JSON.stringify(contacts));
    } catch (e) {}
    navigate("/contacts");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-2">{t("contacts.title")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Relation</Label>
            <Input value={relation} onChange={(e) => setRelation(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 gradient-primary text-white">Save</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactsEdit;
