export const pagination = async function (
  model: any,
  query: any,
  page: number,
) {
  const perPage = 15;
  const currentPage = Math.max(0, page);
  const total = await model.countDocuments(query).exec();
  const totalPages = Math.ceil(total / perPage);

  const meta = {
    currentPage: currentPage + 1,
    lastPage: totalPages,
    perPage,
    total,
  };
  return {
    query,
    meta,
  };
};
