import { supabase } from './supabase';
import type { Profile, EmergencyContact, Incident } from '../types/database.types';

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, emergency_contacts(*)')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  }
};

export const contactsService = {
  async getContacts(userId: string) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });
    
    if (error) throw error;
    return data as EmergencyContact[];
  },

  async addContact(contact: Omit<EmergencyContact, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([contact])
      .select()
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  },

  async updateContact(contactId: string, updates: Partial<EmergencyContact>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  },

  async deleteContact(contactId: string) {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
  }
};

export const incidentsService = {
  async getIncidents(userId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Incident[];
  },

  async getIncident(incidentId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async createIncident(incident: Omit<Incident, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async updateIncident(incidentId: string, updates: Partial<Incident>) {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', incidentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  }
};