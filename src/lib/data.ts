import { supabase } from './supabase';

export interface ContactInfo {
  icon: string;
  title: string;
  details: string;
  link: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('platform, url')
      .order('id');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Could not read social links:', error);
    return [];
  }
}

export async function getContactInfo(): Promise<ContactInfo[]> {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .select('icon, title, details, link')
      .order('id');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Could not read contact info:', error);
    return [];
  }
}
