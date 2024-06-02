import handleErrorAsync from "../service/handleErrorAsync";
import { CourseModel } from "../models/course.model";
import { createZod } from "../zods/course.zod";
import handleSuccess from "../service/handleSuccess";

//建立課程
export const create = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const { name, coverImage, description, category, subCategory, startDate, isActive } = req.body;
  createZod.parse({ name, coverImage, description, category, subCategory, startDate, isActive });

  let course = await CourseModel.create({
    coach:_id,
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive
  });

  return handleSuccess(res,200,'',course);
});
//建立編輯授課時間
//建立編輯授課價格
