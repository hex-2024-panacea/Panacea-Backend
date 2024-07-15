import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { UserModel } from '../models/users.model';
import { adminUpdateCoachInfoZod, adminReviewCoachZod } from '../zods/admin.zod';
import { CourseModel } from '../models/course.model';
import { OrderModel } from '../models/order.model';
import { getFilters, pagination, getPage, getSort } from '../service/modelService';

const getUserModel = async (id: string, email: string, _page: number, _pageSize: number, isCoach: boolean) => {
  const query = id || email ? { _id: id, email, isCoach } : { isCoach };
  const select = '-password -isAdmin -isCoach -__v';
  return await UserModel.find(query)
    .select(select)
    .skip((_page - 1) * _pageSize)
    .limit(_pageSize);
};

// 後台 - 學員列表
export const adminUserList = handleErrorAsync(async (req, res, next) => {
  const { page, pageSize, id, email } = req.query;
  try {
    const _page = parseInt(page as string) || 1; // 默認第 1 頁
    const _pageSize = parseInt(pageSize as string) || 10; // 默認每頁 10 筆
    const userModelData = await getUserModel(id as string, email as string, _page, _pageSize, false);
    const total = await UserModel.countDocuments({ isCoach: false });
    const lastPage = Math.ceil(total / _pageSize);
    return handleSuccess(res, 200, 'Success', userModelData, {
      currentPage: _page, // 當前頁面
      lastPage, // 最後一頁頁數
      perPage: _pageSize, // 每頁多少筆資料
      total, // 總共多少筆
    });
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 後台 - 學員編輯資料
export const adminUpdateUserInfo = handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  try {
    const validationResult = await adminUpdateCoachInfoZod.safeParse(req.body);
    if (validationResult.success) {
      await UserModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          updatedAt: Date.now(),
          ...req.body,
        },
      );
      return handleSuccess(res, 200, 'Edited Successfully');
    } else {
      return appErrorService(400, JSON.stringify(validationResult.error.errors), next);
    }
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 後台 - 教練列表
export const adminCoachList = handleErrorAsync(async (req, res, next) => {
  const { page, pageSize, id, email } = req.query;
  try {
    const _page = parseInt(page as string) || 1; // 默認第 1 頁
    const _pageSize = parseInt(pageSize as string) || 10; // 默認每頁 10 筆
    const userModelData = await getUserModel(id as string, email as string, _page, _pageSize, true);
    const total = await UserModel.countDocuments({ isCoach: true });
    const lastPage = Math.ceil(total / _pageSize);
    return handleSuccess(res, 200, 'Success', userModelData, {
      currentPage: _page, // 當前頁面
      lastPage, // 最後一頁頁數
      perPage: _pageSize, // 每頁多少筆資料
      total, // 總共多少筆
    });
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 後台 - 更新教練資料
export const adminUpdateCoachInfo = handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  try {
    const validationResult = await adminUpdateCoachInfoZod.safeParse(req.body);
    if (validationResult.success) {
      await UserModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          updatedAt: Date.now(),
          ...req.body,
        },
      );
      return handleSuccess(res, 200, 'Edited Successfully');
    } else {
      return appErrorService(400, JSON.stringify(validationResult.error.errors), next);
    }
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

type updateDataType = {
  approvalStatus: 'pending' | 'success' | 'fail';
  reason: string;
};
// 後台 - 審核教練
export const adminReviewCoach = handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  const { approvalStatus, reason }: updateDataType = req.body;
  try {
    adminReviewCoachZod.parse(req.body);
    const updateData: updateDataType = {
      approvalStatus,
      reason: approvalStatus === 'fail' ? reason : '',
    };
    await UserModel.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true, runValidators: true });
    return handleSuccess(res, 200, 'Edited Successfully');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
//後台 - 課程列表
const courseIndexSetting = {
  perPage: 15,
  searchFields: ['name'],
  filterFields: ['category', 'subCategory'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const getCourseList = handleErrorAsync(async (req, res, next) => {
  const { page, perPage } = getPage(req, courseIndexSetting);
  const filters = getFilters(req, courseIndexSetting);
  const sort = getSort(req, courseIndexSetting);

  const results = await CourseModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .populate({
      path: 'coach',
      select: '_id name avatar',
    })
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

  const meta = await pagination(CourseModel, filters, page, courseIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});
//後台 - 訂單列表
const orderIndexSetting = {
  perPage: 15,
  filterFields: ['status'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const getOrderList = handleErrorAsync(async (req, res, next) => {
  const { page, perPage } = getPage(req, orderIndexSetting);
  const filters = getFilters(req, orderIndexSetting);
  const sort = getSort(req, orderIndexSetting);

  const results = await OrderModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .populate({
      path: 'course',
      select: '_id name description coverImage category subCategory',
      populate: {
        path: 'coach',
        select: '_id name avatar',
      },
    })
    .populate({
      path: 'user',
      select: '_id name avatar',
    });

  const meta = await pagination(CourseModel, filters, page, courseIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});
//後台 - 課程審核
export const reviewCourse = handleErrorAsync(async (req, res, next) => {
  const { id } = req.params;
  const { approvalStatus, reason }: updateDataType = req.body;
  try {
    adminReviewCoachZod.parse(req.body);
    const updateData: updateDataType = {
      approvalStatus,
      reason: approvalStatus === 'fail' ? reason : '',
    };
    await CourseModel.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true, runValidators: true });
    return handleSuccess(res, 200, 'Edited Successfully');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
