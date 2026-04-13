export type LinkCategory = 'all' | 'general' | 'reference' | 'design' | 'development' | 'learning';

export interface ILink {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILinkFilters {
  keyword: string;
  category: LinkCategory;
}

export interface ILinksState {
  items: ILink[];
  filters: ILinkFilters;
}

export interface ICreateLinkFormValues {
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
}

export interface IUpdateLinkFormValues {
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
}