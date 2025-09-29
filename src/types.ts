export type DateRange = { from?: Date; to?: Date };

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
};