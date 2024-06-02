import handleErrorAsync from "../service/handleErrorAsync";
import { CourseModel } from "../models/course.model";

export const create = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
});