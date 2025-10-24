export interface CreateTipDto {
  title: string;
  content: string;
  category: string;
  source_url: string | null;
}
