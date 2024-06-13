import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import { CourseModel } from '../models/course.model';
import { createZod, editPriceZod, editScheduleZod } from '../zods/course.zod';
import handleSuccess from '../service/handleSuccess';
import CoursePrice from '../types/CoursePrice';
import CourseSchedule from '../types/CourseSchedule';
import { CoursePriceModel } from '../models/coursePrice.model';
import { CourseScheduleModel } from '../models/courseSchedule.model';

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
export const editSchedule = handleErrorAsync(async (req, res, next) => {
  let { courseId } = req.params;
  const userId = req.user!.id;
  //用 start_time 排序 body 裡帶的 schedule
  let scheduleArr = req.body.schedule;
  editScheduleZod.parse(scheduleArr);
  scheduleArr.sort((a: CourseSchedule, b: CourseSchedule) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  //delete 時間區間內，沒有被預約，且id沒有出現在body的schedule
  const existScheduleArr = scheduleArr.filter(
    (schedule: CourseSchedule) => schedule.id,
  );
  const existIdArr = scheduleArr.map((schedule: CourseSchedule) => schedule.id);
  await CourseScheduleModel.deleteMany({
    _id: { $nin: existIdArr },
    startTime: { $gte: new Date(scheduleArr[0].startTime) },
    endTime: { $lte: new Date(scheduleArr.slice(-1)[0].endTime) },
    course: courseId,
    coach: userId,
    isBooked: false,
  });
  //update 在 body 且有帶 id 的 schedule
  const updateArr = existScheduleArr.map((schedule: CourseSchedule) => {
    return {
      updateOne: {
        filter: {
          _id: schedule.id,
          course: courseId,
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        },
      },
    };
  });
  await CourseScheduleModel.bulkWrite(updateArr);
  //create 在 body 沒有帶 id 的 schedule
  const newScheduleArr = scheduleArr
    .filter((schedule: CourseSchedule) => !schedule.id)
    .map((schedule: CourseSchedule) => {
      return {
        ...schedule,
        course: courseId,
        coach: userId,
      };
    });
  await CourseScheduleModel.create(newScheduleArr);

  const schedules = await CourseScheduleModel.find({
    course: courseId,
    startTime: { $gte: new Date(scheduleArr[0].startTime) },
    endTime: { $lte: new Date(scheduleArr.slice(-1)[0].endTime) },
  });
  handleSuccess(res, 200, 'get data', schedules);
});
//建立編輯授課價格
export const editPrice = handleErrorAsync(async (req, res, next) => {
  let { courseId } = req.params;
  let priceArr = req.body.price;
  editPriceZod.parse(priceArr);

  const existPriceArr = priceArr.filter((price: CoursePrice) => price.id);
  const existIdArr = priceArr.map((price: CoursePrice) => price.id);
  //delete
  await CoursePriceModel.deleteMany({
    _id: { $nin: existIdArr },
    course: courseId,
  });
  //update
  const updateArr = existPriceArr.map((price: CoursePrice) => {
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
    .filter((price: CoursePrice) => !price.id)
    .map((price: CoursePrice) => {
      return {
        ...price,
        course: courseId,
      };
    });
  await CoursePriceModel.create(newPriceArr);

  const prices = await CoursePriceModel.find({
    course: courseId,
  });
  handleSuccess(res, 200, 'get data', prices);
});
//教練課程詳情頁
export const coachGetCourse = handleErrorAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user?.id;
  const course = await CourseModel.findOne({
    _id: courseId,
    coach: userId,
  })
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
  if (course) {
    return handleSuccess(res, 200, 'get data', course);
  } else {
    return appErrorService(400, 'no data', next);
  }
});
//教練刪除課程
export const deleteCourse = handleErrorAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  //判斷是否有今天以後的預約課程 bookingSchedule，有的話不可刪除課程
  const course = await CourseModel.findOneAndDelete({
    course: courseId,
    coach: userId,
  });
  if (course) {
    //delete coursePrice,courseSchedule,bookingCourse
  } else {
    return appErrorService(400, '發生錯誤', next);
  }
});
//教練課程列表
const filterSetting = {
  searchFields: ['name'],
  filterFields: ['category', 'subCategory'],
  orderFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const coachGetCourses = handleErrorAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const { currentPage, orderWay, orderBy, category, subCategory } = req.query;
  //totalPage,currentPage,limit,skip
});
