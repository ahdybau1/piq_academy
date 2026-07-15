export interface SubscriptionTierRow {
  id: string;
  name: string;
  class_node_id: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string | null;
}
