export default interface IndexSetting {
  perPage: number;
  getAuth?: boolean;
  getAuthField?: string;
  searchFields?: string[];
  filterFields?: string[];
  sortFields?: string[];
  timeFields?: string[];
}
