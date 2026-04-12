export type LinkCategory =
  | "general"
  | "reference"
  | "design"
  | "development"
  | "learning";

export interface Link {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkFilters {
  keyword: string;
  category: "all" | LinkCategory;
}

export interface LinksState {
  items: Link[];
  filters: LinkFilters;
}

export interface CreateLinkFormValues {
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
}

export interface UpdateLinkFormValues {
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
}