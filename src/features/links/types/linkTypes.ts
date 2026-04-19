export const LINK_CATEGORY_OPTIONS = [
  "docs",
  "design",
  "dev",
  "learning",
  "tools",
  "other",
] as const;

export type LinkCategory = (typeof LINK_CATEGORY_OPTIONS)[number];

export interface ILink {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ILinkFilters {
  keyword: string;
  category: "all" | LinkCategory;
}

export interface ILinksState {
  items: ILink[];
  filters: ILinkFilters;
}

export interface ICreateLinkFormValues {
  title: string;
  url: string;
  category: LinkCategory;
}

export interface UpdateLinkFormValues extends ICreateLinkFormValues {}
