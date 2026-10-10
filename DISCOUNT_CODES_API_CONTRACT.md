# مشخصات وب‌سرویس کدهای تخفیف فروشگاه

این سند برای تیم بک‌اند است. فرانت‌اند فعلی Next.js به API بیرونی متصل است و بک‌اند این قابلیت در این مخزن وجود ندارد. مسیرهای مدیریت زیر با wrapper فعلی فرانت‌اند هماهنگ‌اند؛ مسیر اعتبارسنجی و ثبت سفارش نیز قرارداد پیشنهادی برای تکمیل checkout است.

## ۱. قواعد محصول

- دو نوع کد وجود دارد: **سراسری** که فقط ادمین سامانه می‌سازد، و **اختصاصی فروشگاه** که فقط مالک همان فروشگاه می‌سازد.
- کد سراسری برای فروشگاه‌هایی قابل استفاده است که `shopType` آن‌ها در فهرست کد باشد. کد اختصاصی علاوه بر تطبیق `shopType`، فقط روی همان `shopId` قابل استفاده است.
- نوع تخفیف: `percentage` یا `fixed`. تخفیف فقط روی مبلغ کالاهای واجد شرایط اعمال می‌شود؛ **هزینه ارسال شامل تخفیف نیست**.
- هر کد سقف اجباری برای تعداد دفعات مصرف هر حساب (`maxUsesPerUser`) و سقف اجباری تعداد حساب‌های متفاوت (`maxDistinctUsers`) دارد.
- متن کد در تمام سامانه، میان scope سراسری و فروشگاهی، یکتا است.
- تاریخ انتهایی واردشده شامل کل همان روز در منطقه زمانی `Asia/Tehran` است؛ پس از `23:59:59.999` آن روز منقضی است.
- فقط حساب مشتری احرازشده می‌تواند کد را مصرف کند. هویت مصرف‌کننده از توکن احراز هویت گرفته شود، نه از بدنه درخواست.
- کدهای مصرف‌شده حذف فیزیکی نشوند؛ فقط غیرفعال شوند تا سابقه سفارش‌ها قابل حسابرسی بماند.

## ۲. مدل داده پیشنهادی

### `DiscountCode`

```json
{
  "_id": "discount-code-id",
  "code": "WELCOME20",
  "normalizedCode": "WELCOME20",
  "scope": "global",
  "shopId": null,
  "discountKind": "percentage",
  "discountValue": 20,
  "shopTypes": ["water", "bread"],
  "expiresOn": "2026-12-31",
  "expiresAt": "2027-01-01T03:29:59.999Z",
  "maxDistinctUsers": 500,
  "maxUsesPerUser": 2,
  "uniqueUsersCount": 0,
  "totalUsesCount": 0,
  "isActive": true,
  "createdBy": "admin-user-id",
  "createdAt": "2026-10-11T10:00:00.000Z",
  "updatedAt": "2026-10-11T10:00:00.000Z"
}
```

قواعد فیلدها:

| فیلد | الزام و اعتبارسنجی |
|---|---|
| `code` | رشتهٔ ۳ تا ۴۰ نویسه؛ trim و حذف فاصله‌های داخلی و تبدیل به حروف بزرگ پیش از ذخیره/جست‌وجو. فقط حروف، عدد، `_` و `-` پیشنهاد می‌شود. |
| `normalizedCode` | مقدار نرمال‌شدهٔ سمت سرور؛ ایندکس unique سراسری و case-insensitive. مقدار ارسالی کلاینت قابل اعتماد نیست. |
| `scope` | یکی از `global` یا `shop`. از route/مجوز سرور تعیین شود، نه از body. |
| `shopId` | برای `shop` اجباری و برای `global` برابر `null`؛ از route استخراج و مجوز مالکیت بررسی شود. |
| `discountKind` | یکی از `percentage` یا `fixed`. |
| `discountValue` | عدد مثبت؛ درصد عدد صحیح ۱ تا ۱۰۰. مبلغ ثابت عدد صحیح مثبت در تومان. |
| `shopTypes` | آرایهٔ غیرخالی از انواع مجاز فروشگاه، مطابق مقادیر `shopType` در سیستم. |
| `expiresOn` | تاریخ میلادی `YYYY-MM-DD` در تقویم API. منطقه زمانی انتهای روز حتماً تهران باشد؛ زمان دستگاه کاربر مبنا نیست. |
| `maxDistinctUsers` | عدد صحیح مثبت؛ تعداد مشتریان یکتایی که کد برایشان رزرو/مصرف موفق شده است. |
| `maxUsesPerUser` | عدد صحیح مثبت و اجباری؛ سقف رزروهای فعال به‌علاوهٔ مصرف‌های نهایی هر کاربر. |
| شمارنده‌ها | فقط سرور محاسبه و برگرداند؛ کلاینت حق نوشتن آن‌ها را ندارد. شمارش باید رزروهای فعال را نیز برای کنترل ظرفیت لحاظ کند. |
| `isActive` | بولی؛ غیرفعال‌کردن، مصرف جدید را متوقف کند ولی سفارش‌های قبلی را تغییر ندهد. |

برای شمارش و کنترل همزمانی، اتکا به شمارنده‌های ساده‌ای که جداگانه از redemptionها به‌روزرسانی می‌شوند کافی نیست. ایندکس یکتا روی `normalizedCode` و عملیات تراکنشی/اتمیک لازم است.

### `DiscountRedemption` / رزرو مصرف

برای ثبت ردگیری اتمیک هر تلاش موفق، مدل/رکورد جداگانه نگهداری شود:

```json
{
  "_id": "redemption-id",
  "discountCodeId": "discount-code-id",
  "userId": "authenticated-user-id",
  "orderId": "order-id",
  "status": "reserved",
  "discountAmount": 40000,
  "reservedAt": "2026-10-11T10:00:00.000Z",
  "committedAt": null,
  "releasedAt": null
}
```

`status` حداقل `reserved | committed | released` باشد. برای درخواست‌های موازی، محدودیت کاربر/کل کاربران با درنظرگرفتن redemptionهای `reserved` و `committed` در یک تراکنش یا عملیات اتمیک کنترل شود. رزرو رهاشده دیگر سهمیه مصرف نکند.

## ۳. API مدیریت کدها

تمام درخواست‌ها باید از `Authorization`/توکن فعلی سامانه استفاده کنند. پاسخ فهرست در فرانت‌اند به صورت آرایه یا `{ "data": [...] }` قابل خواندن است؛ ترجیحاً قالب یکنواخت `{ "data": ... }` استفاده شود.

### مدیریت کدهای سراسری — فقط ادمین

| متد | مسیر | شرح |
|---|---|---|
| `GET` | `/discount-codes/admin` | فهرست کدهای سراسری؛ فیلتر اختیاری `isActive`, `search`, `page`, `perpage`. |
| `POST` | `/discount-codes/admin` | ایجاد کد سراسری. |
| `PATCH` | `/discount-codes/admin/:id` | ویرایش تنظیمات یا تغییر `isActive`. |

### مدیریت کدهای یک فروشگاه — فقط مالک همان فروشگاه

| متد | مسیر | شرح |
|---|---|---|
| `GET` | `/shops/:shopId/discount-codes` | فهرست کدهای همان فروشگاه؛ هیچ فروشگاه دیگری در پاسخ نباشد. |
| `POST` | `/shops/:shopId/discount-codes` | ایجاد کد با `scope=shop` و `shopId` مسیر. |
| `PATCH` | `/shops/:shopId/discount-codes/:id` | ویرایش تنظیمات یا تغییر `isActive`؛ کد حتماً متعلق به همین فروشگاه باشد. |

در `POST` بدنه شامل `code`, `discountKind`, `discountValue`, `shopTypes`, `expiresOn`, `maxDistinctUsers`, `maxUsesPerUser` است. در `PATCH` همین فیلدها اختیاری‌اند و `{ "isActive": false }` برای غیرفعال‌سازی و `{ "isActive": true }` برای فعال‌سازی استفاده می‌شود.

**امنیت مالکیت:** هر درخواست فروشگاهی باید `shopId` را با کاربر احرازشده از دیتابیس تطبیق دهد و نقش را `shop_owner` و مالک فروشگاه را همان کاربر تأیید کند. شناسهٔ query، localStorage، `createdBy` ارسالی و کنترل‌های فرانت‌اند مرجع مجوز نیستند. ادمین فقط در صورت داشتن مجوز صریح backend به کدهای فروشگاهی دسترسی داشته باشد.

ویرایش کد و محدودیت‌ها برای سفارش‌های آینده اعمال شود؛ snapshot تخفیف سفارش‌های ثبت‌شده تغییر نکند. اگر تغییر سقف از مصرف فعلی کمتر باشد، یا رد شود با `409`, یا فقط کاهش‌های سازگار پذیرفته شود؛ رفتار در تمام APIها یکسان باشد.

### نمونهٔ ایجاد کد

```http
POST /discount-codes/admin
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "code": " welcome 20 ",
  "discountKind": "percentage",
  "discountValue": 20,
  "shopTypes": ["water", "bread"],
  "expiresOn": "2026-12-31",
  "maxDistinctUsers": 500,
  "maxUsesPerUser": 2
}
```

سرور آن را به `WELCOME20` نرمال کند؛ اگر هم‌نامِ نرمال‌شده‌ای در هر scope وجود دارد، با `409 CODE_ALREADY_EXISTS` پاسخ دهد.

### نمونهٔ پاسخ ایجاد/فهرست

```json
{
  "data": {
    "_id": "discount-code-id",
    "code": "WELCOME20",
    "scope": "global",
    "shopId": null,
    "discountKind": "percentage",
    "discountValue": 20,
    "shopTypes": ["water", "bread"],
    "expiresOn": "2026-12-31",
    "expiresAt": "2027-01-01T03:29:59.999Z",
    "maxDistinctUsers": 500,
    "maxUsesPerUser": 2,
    "uniqueUsersCount": 12,
    "totalUsesCount": 18,
    "isActive": true,
    "createdAt": "2026-10-11T10:00:00.000Z",
    "updatedAt": "2026-10-11T10:00:00.000Z"
  }
}
```

## ۴. اعتبارسنجی کد در checkout

### پیش‌نمایش — بدون رزرو

پیشنهاد می‌شود endpoint جدا برای پیش‌نمایش قیمت باشد. این endpoint نباید سهمیه را رزرو یا مصرف کند؛ پاسخ آن صرفاً برآورد است و ثبت نهایی دوباره باید محاسبه شود.

```http
POST /discount-codes/validate
```

```json
{
  "code": "WELCOME20",
  "shopId": "shop-id",
  "items": [
    { "productId": "product-id", "variantId": "variant-id", "quantity": 2 }
  ]
}
```

هویت کاربر باید از token، نوع فروشگاه و قیمت‌ها از دیتابیس استخراج شوند. قیمت ارسالی از کلاینت ملاک نیست. پاسخ موفق:

```json
{
  "data": {
    "valid": true,
    "code": "WELCOME20",
    "discountKind": "percentage",
    "discountValue": 20,
    "itemsSubtotal": 200000,
    "discountAmount": 40000,
    "deliveryCost": 15000,
    "totalPayable": 175000,
    "expiresAt": "2027-01-01T03:29:59.999Z"
  }
}
```

اگر frontend و backend فعلاً نخواهند preview route اضافه کنند، می‌توان مرحله پیش‌نمایش را حذف کرد؛ اما محاسبه و کنترل قطعی هنگام ایجاد سفارش همچنان الزامی است.

## ۵. ثبت سفارش و مصرف کد

دو checkout موجود ابتدا از این route استفاده می‌کنند:

- `POST /orders/shop-order`
- در نسخهٔ فعلی frontend مسیرهای جایگزین هم وجود دارند: `POST /orders/water` و `POST /orders/bread`.

همهٔ مسیرهایی که سفارش فروشگاهی می‌سازند باید قرارداد تخفیف و محاسبهٔ یکسان داشته باشند؛ بهتر است ابتدا مسیر اصلی پایدار شود و fallback در frontend فقط برای `404/405` باشد، نه برای timeout/خطای عمومی، تا یک سفارش دوبار ساخته نشود. برای ایجاد سفارش از `Idempotency-Key` یکتا نیز پشتیبانی شود.

### ورودی سفارش (بخش‌های فعلی + افزوده)

```json
{
  "shopId": "shop-id",
  "shopType": "water",
  "items": [
    {
      "productId": "product-id",
      "variantId": "variant-id",
      "quantity": 2
    }
  ],
  "discountCode": "WELCOME20",
  "addressId": "address-id",
  "selectedSlot": { "_id": "slot-id", "startTime": "10:00", "endTime": "12:00" },
  "paymentMethod": "wallet"
}
```

فیلدهای فعلی فرانت‌اند مثل `shopName`, `itemsPrice`, `totalPrice`, `deliveryCost`, `price` هر قلم و `userId` ممکن است در درخواست باشند، ولی بک‌اند باید آن‌ها را **غیرقابل اعتماد** بداند. سرور باید محصول/variant فعال، قیمت معتبر، موجودی، تخفیف، هزینه ارسال، مالک فروشگاه و کاربر را از دیتابیس احراز کند. `discountCode` اختیاری است؛ حذف یا خالی بودنش یعنی سفارش عادی.

مقادیر پرداختی فعلی فرانت‌اند: `wallet`, `card_to_card`, `cash_on_delivery`; مقدار `gateway` در UI فعلی هنوز غیرفعال/آینده است. aliasهای `online` و `cash` در type قدیمی API وجود دارند؛ بک‌اند ترجیحاً آن‌ها را نپذیرد یا به مقادیر استاندارد نگاشت کند.

### محاسبهٔ مبلغ

```text
itemsSubtotal = جمع (قیمت canonical هر variant × quantity)
percentageDiscount = floor(itemsSubtotal × discountValue / 100)
fixedDiscount = min(discountValue, itemsSubtotal)
discountAmount = مبلغ حاصل فقط روی اقلام مشمول
payable = itemsSubtotal - discountAmount + deliveryCost
```

واحد مبلغ تخفیف ثابت و مقادیر پاسخ checkout در این UI تومان است. اگر واحد ذخیره‌سازی بک‌اند ریال است، تبدیل فقط در مرز API و به‌صورت یکدست انجام شود. برای تخفیف درصدی قاعدهٔ گردکردن باید ثابت و در تمام مسیرها یکسان باشد؛ پیشنهاد: گردکردن به پایین به تومان صحیح. مبلغ قابل پرداخت منفی نشود و تخفیف هیچ‌گاه از subtotal کالا بیشتر نباشد.

### عملیات اتمیک ثبت نهایی

در یک تراکنش منطقی/دیتابیسی:
1. کاربر از token و فروشگاه/نوع فروشگاه از دیتابیس تعیین شود.
2. فعال‌بودن کد، بازه اعتبار تهران، scope، shopId، `shopTypes`, سقف کاربران یکتا و دفعات همان کاربر بررسی شود.
3. محصولات، variant، قیمت، موجودی و هزینه ارسال دوباره canonical خوانده شوند و مبلغ نهایی محاسبه شود.
4. سهمیه به‌صورت اتمیک رزرو و سفارش با snapshot تخفیف ثبت شود.
5. برای `wallet` موجودی کافی بررسی و debit کیف پول با ثبت سفارش اتمیک انجام شود؛ از فرانت‌اند انتظار ثبت تراکنش مالی یا تعیین مبلغ debit نرود.
6. خطای ثبت سفارش/پرداخت باید رزرو را rollback/release کند. کلید idempotency جلوی debit یا سفارش تکراری را بگیرد.

### پاسخ سفارش موفق

```json
{
  "data": {
    "_id": "order-id",
    "orderId": "ORD-12345",
    "status": "pending",
    "paymentMethod": "wallet",
    "paymentStatus": "completed",
    "itemsPrice": 200000,
    "discountAmount": 40000,
    "deliveryCost": 15000,
    "totalPrice": 175000,
    "discount": {
      "discountCodeId": "discount-code-id",
      "code": "WELCOME20",
      "scope": "global",
      "discountKind": "percentage",
      "discountValue": 20,
      "itemsSubtotalBeforeDiscount": 200000,
      "discountAmount": 40000,
      "itemsSubtotalAfterDiscount": 160000,
      "deliveryCost": 15000,
      "totalPayable": 175000
    }
  }
}
```

سفارش بدون کد باید `discount: null` و `discountAmount: 0` داشته باشد (یا قرارداد سازگار ثابت دیگری) و `totalPrice` همچنان مقدار authoritative سرور باشد. snapshot تخفیف در سفارش تغییرناپذیر باشد؛ تغییر/غیرفعال‌سازی کد روی سفارش قبلی اثر نگذارد.

## ۶. چرخهٔ عمر رزرو و پرداخت

با توجه به روش‌های پرداخت، رویداد قطعی مصرف را بک‌اند مشخص و در تمام state transitionها اعمال کند:

| روش پرداخت | رفتار پیشنهادی |
|---|---|
| `wallet` | رزرو، سفارش و debit کیف پول در ایجاد سفارش اتمیک؛ redemption پس از موفقیت debit نهایی شود. |
| `card_to_card` | رزرو هنگام ثبت سفارش/رسید؛ redemption بعد از تأیید پرداخت/رسید نهایی شود. رد سفارش یا رسید نامعتبر، رزرو را آزاد کند. |
| `cash_on_delivery` | رزرو هنگام ثبت سفارش؛ برای جلوگیری از مصرف بی‌نهایت سفارش لغوشده، redemption هنگام پذیرش سفارش توسط فروشگاه نهایی شود. قبل از پذیرش، لغو/رد سهمیه را آزاد کند. |
| `gateway` | فقط بعد از callback موفق و تأییدشدهٔ درگاه نهایی شود؛ callback idempotent باشد. این روش در UI فعلی فعال نیست. |

این جدول پیشنهاد برای قرارداد است؛ اگر سیاست کسب‌وکار فرق دارد، رویداد commit باید پیش از انتشار با فرانت‌اند و تیم سفارش نهایی شود.

- لغو یا رد سفارش قبل از commit: وضعیت redemption به `released` تغییر کند و ظرفیت کاربر/کد آزاد شود.
- لغو سفارش بعد از commit: refund و برگشت سهمیه طبق سیاست صریح انجام شود؛ عملیات تکراری نباید دوبار refund یا دوبار مصرف را برگرداند.
- انقضای کد پس از ثبت موفق، سفارش موجود را بی‌اعتبار نمی‌کند.
- timeout/پرداخت ناموفق باید رزرو را با timeout مشخص آزاد کند؛ job پاکسازی رزروهای منقضی لازم است.
- endpointهای تغییر وضعیت موجود فروشگاه/ادمین باید همین منطق رزرو و refund را اجرا کنند؛ صرف تغییر `status` کافی نیست.

## ۷. خطاهای قراردادی

قالب ثابت پیشنهادی:

```json
{
  "error": {
    "code": "DISCOUNT_CODE_EXPIRED",
    "message": "کد تخفیف منقضی شده است"
  }
}
```

| HTTP | `error.code` پیشنهادی | مورد |
|---|---|---|
| `400` | `INVALID_DISCOUNT_CODE`, `INVALID_DISCOUNT_VALUE`, `INVALID_SHOP_TYPES` | ورودی نامعتبر |
| `401` | `UNAUTHENTICATED` | token نامعتبر/نبودن کاربر |
| `403` | `DISCOUNT_CODE_FORBIDDEN` | نقش/مالکیت مجاز نیست |
| `404` | `DISCOUNT_CODE_NOT_FOUND`, `SHOP_NOT_FOUND` | کد یا فروشگاه پیدا نشد |
| `409` | `CODE_ALREADY_EXISTS` | تکرار normalized code؛ یا رقابت روی ظرفیت |
| `409` | `DISCOUNT_CODE_INACTIVE`, `DISCOUNT_CODE_EXPIRED`, `SHOP_TYPE_NOT_ALLOWED`, `SHOP_SCOPE_MISMATCH`, `USER_USE_LIMIT_REACHED`, `MAX_USERS_REACHED` | کد قابل استفاده نیست |
| `409` | `INSUFFICIENT_WALLET_BALANCE`, `OUT_OF_STOCK` | سفارش در وضعیت فعلی قابل ثبت نیست |
| `422` | `INVALID_ORDER_ITEMS` | قلم/تعداد نامعتبر |

کد خطا machine-readable باشد تا UI متن فارسی مناسب نمایش دهد. پاسخ error از endpoint preview و ثبت سفارش نیز یکسان باشد.

## ۸. امنیت، سازگاری و آزمون‌های الزامی

- هیچ‌وقت به `userId`, `shopId`, قیمت کالا، مبلغ تخفیف، total، شمارنده مصرف یا نقش ارسالی کلاینت اعتماد نشود.
- APIهای ادمین admin-only و API فروشگاه owner-only باشند؛ بررسی دسترسی در server middleware/service برای تک‌تک درخواست‌ها.
- unique index برای normalized code؛ transaction/atomic update برای سقف کاربر یکتا، سقف هر حساب، wallet و ثبت سفارش.
- ثبت audit log برای ساخت/ویرایش/فعال/غیرفعال‌سازی شامل actor و زمان؛ اطلاعات حساس مشتری در لیست کد نمایش داده نشود.
- آزمون‌ها: درصدی/ثابت و گردکردن، تخفیف بیشتر از subtotal، هزینه ارسال بدون تخفیف، scope فروشگاهی، نوع مجاز/غیرمجاز، انقضای آخرین لحظهٔ روز تهران، کد نرمال‌شده تکراری بین scopeها، سقف distinct users، سقف هر حساب، دو درخواست همزمان برای آخرین ظرفیت، لغو/رد، wallet ناکافی، پرداخت/رسید ناموفق، callback تکراری، idempotency و fallback endpointها.

## ۹. وضعیت پیاده‌سازی فرانت‌اند در این مخزن

فرانت‌اند اکنون برای صفحات مدیریت از این مسیرها استفاده می‌کند: `GET/POST/PATCH /discount-codes/admin` و `GET/POST/PATCH /shops/:shopId/discount-codes`. این wrapperها/صفحات را می‌توان در `lib/api/discount-codes.ts` و `components/discount-code-manager.tsx` دید. بخش checkout هنوز عمداً به API متصل نشده؛ قبل از فعال‌کردن آن، ابتدا endpointهای مدیریت و قرارداد preview/create-order، snapshot و wallet را در بک‌اند پیاده کنید.
