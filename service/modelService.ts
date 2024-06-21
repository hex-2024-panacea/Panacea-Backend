import UserRequest from '../types/UserRequest';
import IndexSetting from '../types/IndexSetting';

export const pagination = async function (
  model: any,
  query: any,
  currentPage: number,
  setting: IndexSetting,
) {
  const perPage = setting.perPage;
  const total = await model.countDocuments(query).exec();
  const totalPages = Math.ceil(total / perPage);

  const meta = {
    currentPage: currentPage,
    lastPage: totalPages,
    perPage,
    total,
  };

  return meta;
};
export const getPage = function (req: UserRequest, setting: IndexSetting) {
  const currentPage = (req.query.currentPage as string)
    ? Number(req.query.currentPage)
    : 1;
  const page = Math.max(0, currentPage - 1);
  const perPage = setting.perPage;
  return { page, perPage };
};
export const indexHandler = async function (
  model: any,
  req: UserRequest,
  setting: IndexSetting,
) {
  //UNDONE:目前還沒有想好select,populate 該怎麼拆出去寫
  const { page, perPage } = getPage(req, setting);
  const filters = getFilters(req, setting);
  const sort = getSort(req, setting);

  const results = await model
    .find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .select('-coach')
    .populate({
      path: 'coursePrice',
      select: '_id -course count price',
      options: {
        sort: {
          count: 1,
          price: 1,
        },
      },
    });

  const meta = await pagination(model, filters, page, setting);

  return {
    results,
    meta,
  };
};
export const getFilters = function (req: UserRequest, setting: IndexSetting) {
  interface Query {
    startTime?: string;
    endTime?: string;
    timeField?: (typeof timeFields)[number];
  }

  let filters: { [key: string]: any } = {};
  const { searchFields = [], filterFields = [], timeFields = [] } = setting;
  // search
  searchFields.forEach((field) => {
    if (req.query[field]) {
      filters[field] = new RegExp(`${req.query[field]}`, 'i');
    }
  });
  // startTime,endTime
  const { startTime, endTime, timeField = 'createdAt' } = req.query as Query;
  if (startTime && endTime && timeFields.includes(timeField as string)) {
    filters[timeField] = {
      $gte: new Date(startTime),
      $lte: new Date(endTime),
    };
  }
  // filterFields
  filterFields.forEach((field) => {
    if (req.query[field]) {
      const filterArr = (req.query[field] as string).split(',');
      filters[field] = {
        $in: filterArr,
      };
    }
  });
  //getAuth
  if (setting.getAuth) {
    const userId = req.user?.id;
    filters.user = userId;
  }
  return filters;
};
export const getSort = function (req: UserRequest, setting: IndexSetting) {
  interface Query {
    orderWay?: string;
    orderBy?: 'desc' | 'asc';
  }
  let sort: { [key: string]: any } = {};
  const { sortFields = [] } = setting;
  const { orderWay, orderBy } = req.query as Query;
  if (orderWay && orderBy && sortFields.includes(orderBy)) {
    sort[orderBy] = orderWay === 'desc' ? -1 : 1;
  }
  return sort;
};
