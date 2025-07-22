export type Bookmark = {
  id: string;
  name: string;
  source?: string;
  childrens: { link: string; title: string; id: string }[];
};
