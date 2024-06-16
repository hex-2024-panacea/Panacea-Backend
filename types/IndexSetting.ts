export default interface IndexSetting {
  perPage: number;
  getAuth: boolean;
  searchFields: string[];
  filterFields: string[];
  sortFields: string[];
  timeFields: string[];
}
