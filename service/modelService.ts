import { Request } from 'express';
import FilterSetting from '../types/FilterSetting';

export const pagination = async function (
  model: any,
  query: any,
  currentPage: number,
) {
  const perPage = 15;
  const page = Math.max(0, currentPage - 1);
  const total = await model.countDocuments(query).exec();
  const totalPages = Math.ceil(total / perPage);

  const results = await model
    .find(query)
    .limit(perPage)
    .skip(perPage * page)
    .exec();

  const meta = {
    currentPage: currentPage,
    lastPage: totalPages,
    perPage,
    total,
  };

  return {
    results,
    meta,
  };
};
export const getFilters = function (req: Request, setting: FilterSetting) {};
