import handleErrorAsync from '../service/handleErrorAsync';
import { CourseModel } from '../models/course.model';
import { createZod, editPriceZod } from '../zods/course.zod';
import handleSuccess from '../service/handleSuccess';
import coursePrice from '../types/CoursePrice';
import { CoursePriceModel } from '../models/coursePrice.model';

//建立課程
export const createCourse = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const {
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive,
  } = req.body;

  createZod.parse({
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive,
  });

  let course = await CourseModel.create({
    coach: _id,
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive,
  });

  return handleSuccess(res, 200, '', course);
});
//建立編輯授課時間
export const editSchedule = handleErrorAsync(async (req, res, next) => {});
//建立編輯授課價格
export const editPrice = handleErrorAsync(async (req, res, next) => {
  let { courseId } = req.params;
  let priceArr = req.body.price;
  editPriceZod.parse(priceArr);

  const existPriceArr = priceArr.filter((price: coursePrice) => price.id);
  const existIdArr = priceArr.map((price: coursePrice) => price.id);
  //delete
  await CoursePriceModel.deleteMany({
    _id: { $nin: existIdArr },
    course: courseId,
  });
  //update
  const updateArr = existPriceArr.map((price: coursePrice) => {
    return {
      updateOne: {
        filter: {
          _id: price.id,
          course: courseId,
        },
        update: {
          ...price,
        },
      },
    };
  });
  await CoursePriceModel.bulkWrite(updateArr);
  //create
  const newPriceArr = priceArr
    .filter((price: coursePrice) => !price.id)
    .map((price: coursePrice) => {
      return {
        ...price,
        course: courseId,
      };
    });
  await CoursePriceModel.create(newPriceArr);

  const prices = await CoursePriceModel.find({
    course:courseId
  });
  handleSuccess(res, 200, 'get data', prices);
});
//教練取得課程
