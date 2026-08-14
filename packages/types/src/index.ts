export type UserRole =
  | "mf_admin"
  | "mf_ops"
  | "org_admin"
  | "org_buyer"
  | "org_viewer";

export type OrderStatus =
  | "submitted"
  | "acknowledged"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrganizationDTO {
  id: string;
  name: string;
  status: "invited" | "active" | "suspended";
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  categoryId: string | null;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  imageUrl: string | null;
  active: boolean;
}

export interface CartItemDTO {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  imageUrl: string | null;
}

export interface OrderSummaryDTO {
  id: string;
  reference: string;
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
}

export interface BrandingSettingsDTO {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}
