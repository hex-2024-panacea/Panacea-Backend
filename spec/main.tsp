import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "Panacea API service",
})
@useAuth(BearerAuth)
@server("https://panacea-api.zeabur.app", "test server")

namespace Panacea;

namespace General {
  enum ResponseCode {
      OK: "100001",
      NO_DATA: "10002",
      NOT_FOUND: "20001",
      SERVER_ERROR: "50001",
  }

  model HttpResponse<T> {
      code: ResponseCode;
      message?: string;
      data?: T;
      errors?: [{}];
  }

  model HttpRequest<T> {
    ...T
  }
}



namespace Model {
  model User {
    name: string;
    username: string;
    password: string;
    email: string;
    ssoType: string;
    ssoToken: string;
    accessToken: string;
    emailVerifiedAt: plainDate;
    sendVerifyMailAt: plainDate;
    createdAt: plainDate;
    updatedAt: plainDate;
    deletedAt: plainDate;
  }

  model Coach {
    userId: integer;
    firstName: string;
    lastName: string;
    birthday: plainDate;
    occupation: "Nutritionist" | "Counselor";
    profession: "Workout" | "Consult";
    professionSpecialist: string;
    auditStatus: "WAITING" | "REVIEWING" | "VERIFIED";
    languages: []; // lang, prof
    introduction: string;
    bankCode: string;
    bankAccountName: string;
    bankAccountNumber: string;
    submitAuditAt: plainDate;
    AuditedAt: plainDate;
    createdAt: plainDate;
    updatedAt: plainDate;
  }

  model Course {
    userId: integer;
    name: string;
    category: "fitness";
    shortIntroduction?: string;
    fullIntroduction: string;
    bannerImage?: url;
    thumbnailImage?: url;
    auditStatus: "WAITING" | "VERIFIED" | "AUDITED" | "CLOSED" | "BANNED";
    startDate: plainDate;
    endDate: plainDate;
    datePeriod: []; // time text
    priceSet: []; // time/amount
    totalPeriodCount: integer;
    remainPeriodCount: integer;
    acceptAppointment: boolean;
    createdAt: plainDate;
    updatedAt: plainDate;
    deletedAt: plainDate;
  }

  model CourseAppointment {
    userId: integer;
    coachId: integer;
    classId: integer;
    takeStatus: "WAITING" | "ONGOING" | "TAKEN" | "CANCEL";
    date: plainDate;
  }

  model Order {
    buyerId: integer;
    currency: string;
    amount: integer;
    paymentMethod: "credit";
    paidAt: plainDate;
    cancelAt: plainDate;
    purchasedAt: plainDate;
    createdAt: plainDate; 
  }

  model Notification {
    userId: integer;
    type: "system" | "message";
    title: string;
    content: string;
    link: string;
    createdAt: plainDate;
    readAt: plainDate;
  }
}


@route("api")
namespace Api {
  using General;

  @route("ping")
  namespace Ping{
    @get op ping(): HttpResponse<string>;

  }

  @route("auth")
    namespace Auth {
      @doc("註冊")
      @route("/register")
      namespace Register {
        model Body {
          email: string;
          password: string;
        }
        model Data {
          link: url;
          remainTimes: integer;
        }
        @post op register(@body req: HttpRequest<Body>): HttpResponse<Data>;
      }

      @doc("登入")
      @route("/sign-in")
      namespace SignIn {
        model Body {
          email: string;
          password: string;
        }
        model Data {
          link: url;
          hash: string;
        }
        op signIn(@body req: HttpRequest<Body>): HttpResponse<Data>;
      }

      @doc("寄送驗證信")
      @route("/verify-mail")
      namespace VerifyMail {
          model Body {
            email: string;
          }
          model Data {
            result: string;
          }
          op list(@body body: Body): HttpResponse<Data>;
        }
  }

  @route("users")
  namespace User {
    @doc("取得使用者列表")
    @route("/")
    @get op listUsers(): HttpResponse<"">;

    @doc("取得使用者資訊")
    @route("/")
    @get op getUser(@path id: integer): HttpResponse<"">;

    @doc("更新使用者資訊")
    @route("/")
    @put op updateUser(@body body: string): HttpResponse<"">;

    @doc("刪除使用者")
    @route("/")
    @delete op deleteUser(@path id: integer): HttpResponse<"">;
  }

  @route("notifications")
  namespace Notification {
      @doc("取得訊息")
      @route("/")
      @get op listNotifications(): HttpResponse<"">;

      @doc("已讀訊息")
      @route("/")
      @post op readNotifications(): HttpResponse<"">;

      @doc("已讀全部訊息")
      @route("read-all")
      @post op readAll(): HttpResponse<"">;
  }

  @route("upload")
  namespace Upload {
    @route("image")
    namespace Image {
          @doc("Upload image asset")
          model Body {
            file: bytes
          }
          model Data {
            url: string
          }
          @post op uploadImage(@body req: HttpRequest<Body>): HttpResponse<Data>;
    }
  }

  @route("admin")
  namespace Admin {
    @route("/")
    interface Admin {
      @get get(@query id: string): Admin[];
    }

  }
}

