import handleErrorAsync from '../service/handleErrorAsync';
import handleSuccess from '../service/handleSuccess';
import { OrderModel } from '../models/order.model';
import { getFilters, pagination, getPage, getSort } from '../service/modelService';

//學員-已購買課程
const orderIndexSetting = {
  perPage: 15,
  getAuth: true,
  getAuthField: 'user',
  filterFields: ['status'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const userOrders = handleErrorAsync(async (req, res, next) => {
  const { page, perPage } = getPage(req, orderIndexSetting);
  const filters = getFilters(req, orderIndexSetting);
  const sort = getSort(req, orderIndexSetting);

  const results = await OrderModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .select(
      '_id createdAt courseId name price purchaseCount totalPrice remainingCount bookingCount status paymentType payTime',
    );

  const meta = await pagination(OrderModel, filters, page, orderIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});
