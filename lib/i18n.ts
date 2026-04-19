import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "app_language";
const rtlLanguages = new Set(["fa"]);

const resources = {
  en: {
    translation: {
      common: {
        select: "Select…",
        optional: "optional",
      },
      appShell: {
        welcome: "Welcome",
        signOut: "Sign out",
        sections: "Sections",
      },
      nav: {
        dashboard: "Dashboard",
        users: "Users",
        customers: "Customers",
        products: "Products",
        unitMeasures: "Unit Measures",
        orders: "Orders",
        transfers: "Transfers",
        drivers: "Drivers",
        payments: "Payments",
        expenses: "Expenses",
        accountTypes: "Account Types",
        accounts: "Accounts",
        chartOfAccounts: "Chart of Accounts",
        adjustments: "Adjustments",
        tracking: "Tracking",
        reports: "Reports",
        settings: "Settings",
      },
      settings: {
        title: "Settings",
        description: "Choose your preferred language.",
        languageLabel: "Language",
        helper: "Save changes to apply.",
        save: "Save",
      },
      language: {
        english: "English",
        persian: "فارسی",
      },
      footer: {
        copy: "© {{year}} Logistics",
        loggedInAt: "Logged in: {{date}}",
        notLoggedIn: "Not logged in",
        userFallback: "User",
        userLabel: "User:",
      },
      crud: {
        refresh: "Refresh",
        createTitle: "Create",
        submit: "Submit",
        listTitle: "List",
        editHeading: "Edit #{{id}}",
        cancel: "Cancel",
        save: "Save",
        actions: "Actions",
        clickRow: "Click row",
        noRecords: "No records",
        detailsTitle: "{{title}} details",
        edit: "Edit",
        delete: "Delete",
        confirmDelete: "Confirm delete",
        confirmDeleteDescription:
          "Are you sure you want to delete {{label}}?",
        number: "No.",
        loadFailed: "Load failed",
        createSuccess: "Created successfully",
        updateSuccess: "Updated successfully",
        deleteSuccess: "Deleted successfully",
        createFailed: "Create failed",
        updateFailed: "Update failed",
        deleteFailed: "Delete failed",
      },
      pages: {
        accounts: {
          title: "Accounts",
          subtitle: "Manage accounts",
        },
        chartOfAccounts: {
          title: "Chart of accounts",
          subtitle: "Full account structure and balances",
        },
        accountTypes: {
          title: "Account Types",
          subtitle: "Manage account types",
        },
        adjustments: {
          title: "Adjustments",
          subtitle: "Manage adjustments",
        },
        drivers: {
          title: "Drivers",
          subtitle: "Manage drivers",
        },
        expenses: {
          title: "Expenses (Costs)",
          subtitle: "Manage expenses",
        },
        payments: {
          title: "Payments (Revenue)",
          subtitle: "Manage payments",
        },
        tracking: {
          title: "Tracking",
          subtitle: "Manage tracking updates",
        },
        unitMeasures: {
          title: "Unit Measures",
          subtitle: "Manage units and conversions",
          form: {
            baseUnit: "Base unit",
            baseUnitNone: "None (base unit)",
            relatedUnitsTitle: "Related units",
            addRelatedUnit: "Add related unit",
            relatedUnitsBaseOnly: "Related units can only be created for base units. Clear the base unit to add related units.",
            errors: {
              nameRequired: "Name is required.",
              factorRequired: "Factor is required for related units.",
              relatedForBaseOnly: "Related units can only be created for base units.",
              eachRelatedNeeds: "Each related unit needs a name and factor > 0.",
            },
            submit: "Submit",
            submitting: "Submitting...",
            remove: "Remove",
          },
        },
        reports: {
          title: "Financial reports",
          subtitle: "Revenue, expenses, profit/loss summary",
        },
        users: {
          title: "Users",
          subtitle: "Manage users",
        },
        customers: {
          title: "Customers",
          subtitle: "Manage customers",
        },
        products: {
          title: "Products / Goods / Packages",
          subtitle: "Manage products",
        },
        orders: {
          title: "Orders",
          subtitle: "Manage orders and items",
          status: {
            pending: "pending",
            shipped: "shipped",
            delivered: "delivered",
            cancelled: "cancelled",
          },
          form: {
            new: "New",
            customerPlaceholder: "Select customer…",
            itemsTitle: "Items",
            addItem: "Add item",
            remove: "Remove",
            submit: "Submit",
            submitting: "Submitting...",
          },
        },
        transfers: {
          title: "Transfers (Shipments)",
          subtitle: "Manage transfers",
          status: {
            assigned: "assigned",
            inTransit: "in transit",
            completed: "completed",
          },
        },
      },
      fields: {
        code: "Code",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        username: "Username",
        password: "Password",
        role: "Role",
        phone: "Phone",
        accountTypeId: "Account type",
        balance: "Balance",
        description: "Description",
        createdAt: "Created",
        updatedAt: "Updated",
        symbol: "Symbol",
        baseUnit: "Base unit",
        factor: "Factor",
        order: "Order",
        origin: "Origin",
        destination: "Destination",
        status: "Status",
        amount: "Amount",
        method: "Method",
        paid_at: "Paid at",
        shipped_at: "Shipped at",
        delivered_at: "Delivered at",
        location: "Location",
        driver: "Driver",
        transfer: "Transfer",
        customer: "Customer",
        product: "Product",
        quantity: "Quantity",
        weight: "Weight",
        price: "Price",
        compare_at_price: "Compare at",
        image_url: "Image",
        is_active: "Active",
        unitMeasure: "Unit measure",
        unit_measure_id: "Unit measure",
        unitPrice: "Unit price",
        lineTotal: "Line total",
        related_id: "Related id",
        related_type: "Related type",
        reason: "Reason",
        amount_delta: "Amount (+/-)",
        vehicle_type: "Vehicle type",
        license_number: "License number",
        account: "Account",
        type: "Type",
        category: "Category",
        totalPrice: "Total price",
        order_summary: "Order",
        origin_location: "Origin",
        driver_label: "Driver",
        order_id: "Order",
        driver_id: "Driver",
        vehicle_info: "Vehicle info",
      },
      home: {
        brand: "Logistics Suite",
        title: "Transfer & Delivery Management",
        adminLogin: "Admin login",
        heroTitle: "Track your shipment instantly",
        heroSubtitle:
          "Check the latest status, location updates, and delivery progress for your transfer.",
        placeholderTracking: "Enter tracking number",
        searching: "Searching...",
        track: "Track",
        errorEmpty: "Enter a tracking number to search.",
        errorInvalid: "Tracking number must be a positive number.",
        errorNotFound: "Unable to find this tracking number.",
        resultTitle: "Tracking result",
        currentStatus: "Current status",
        transferStatus: "Transfer status",
        route: "Route",
        orderStatus: "Order status",
        lastUpdate: "Last update",
        historyTitle: "Tracking history",
        location: "Location",
        feature1Title: "Shipment visibility",
        feature1Body:
          "Monitor transfer progress, driver updates, and delivery milestones in one place.",
        feature2Title: "Reliable operations",
        feature2Body:
          "Coordinate orders, transfers, payments, and expenses with a single system of record.",
        feature3Title: "Accurate reporting",
        feature3Body:
          "Track revenue, costs, and performance using built-in analytics dashboards.",
      },
      login: {
        signInTitle: "Sign in",
        createAdminTitle: "Create admin",
        signInDesc: "Use your admin credentials to access the dashboard.",
        createAdminDesc: "Create the first admin account for this dashboard.",
        name: "Name",
        lastName: "Last name",
        username: "Username",
        email: "Email",
        password: "Password",
        pleaseWait: "Please wait…",
        signIn: "Sign in",
        createAdmin: "Create admin",
        createFirstAdmin: "Create the first admin account",
        backToSignIn: "Back to sign in",
        authFailed: "Authentication failed",
      },
    },
  },
  fa: {
    translation: {
      common: {
        select: "انتخاب…",
        optional: "اختیاری",
      },
      appShell: {
        welcome: "خوش آمدید",
        signOut: "خروج",
        sections: "بخش‌ها",
      },
      nav: {
        dashboard: "داشبورد",
        users: "کاربران",
        customers: "مشتریان",
        products: "محصولات",
        unitMeasures: "واحدها",
        orders: "سفارش‌ها",
        transfers: "انتقال‌ها",
        drivers: "رانندگان",
        payments: "پرداخت‌ها",
        expenses: "هزینه‌ها",
        accountTypes: "انواع حساب",
        accounts: "حساب‌ها",
        chartOfAccounts: "چارت حساب‌ها",
        adjustments: "اصلاحات",
        tracking: "رهگیری",
        reports: "گزارش‌ها",
        settings: "تنظیمات",
      },
      settings: {
        title: "تنظیمات",
        description: "زبان دلخواه خود را انتخاب کنید.",
        languageLabel: "زبان",
        helper: "برای اعمال تغییرات ذخیره کنید.",
        save: "ذخیره",
      },
      language: {
        english: "English",
        persian: "فارسی",
      },
      footer: {
        copy: "© {{year}} لجستیک",
        loggedInAt: "زمان ورود: {{date}}",
        notLoggedIn: "وارد نشده‌اید",
        userFallback: "کاربر",
        userLabel: "کاربر:",
      },
      crud: {
        refresh: "تازه‌سازی",
        createTitle: "ایجاد",
        submit: "ثبت",
        listTitle: "لیست",
        editHeading: "ویرایش #{{id}}",
        cancel: "لغو",
        save: "ذخیره",
        actions: "عملیات",
        clickRow: "روی ردیف کلیک کنید",
        noRecords: "هیچ رکوردی وجود ندارد",
        detailsTitle: "جزئیات {{title}}",
        edit: "ویرایش",
        delete: "حذف",
        confirmDelete: "تأیید حذف",
        confirmDeleteDescription:
          "آیا مطمئن هستید که می‌خواهید {{label}} را حذف کنید؟",
        number: "شماره",
        loadFailed: "بارگذاری ناموفق بود",
        createSuccess: "با موفقیت ایجاد شد",
        updateSuccess: "با موفقیت ویرایش شد",
        deleteSuccess: "با موفقیت حذف شد",
        createFailed: "ایجاد ناموفق بود",
        updateFailed: "ویرایش ناموفق بود",
        deleteFailed: "حذف ناموفق بود",
      },
      pages: {
        accounts: {
          title: "حساب‌ها",
          subtitle: "مدیریت حساب‌ها",
        },
        chartOfAccounts: {
          title: "چارت حساب‌ها",
          subtitle: "ساختار کامل حساب‌ها و مانده‌ها",
        },
        accountTypes: {
          title: "انواع حساب",
          subtitle: "مدیریت انواع حساب",
        },
        adjustments: {
          title: "اصلاحات",
          subtitle: "مدیریت اصلاحات",
        },
        drivers: {
          title: "رانندگان",
          subtitle: "مدیریت رانندگان",
        },
        expenses: {
          title: "هزینه‌ها",
          subtitle: "مدیریت هزینه‌ها",
        },
        payments: {
          title: "پرداخت‌ها",
          subtitle: "مدیریت پرداخت‌ها",
        },
        tracking: {
          title: "رهگیری",
          subtitle: "مدیریت به‌روزرسانی‌های رهگیری",
        },
        unitMeasures: {
          title: "واحدها",
          subtitle: "مدیریت واحدها و تبدیل‌ها",
          form: {
            baseUnit: "واحد پایه",
            baseUnitNone: "هیچ‌کدام (واحد پایه)",
            relatedUnitsTitle: "واحدهای مرتبط",
            addRelatedUnit: "افزودن واحد مرتبط",
            relatedUnitsBaseOnly: "واحدهای مرتبط فقط برای واحدهای پایه قابل ایجاد هستند. پایه را پاک کنید تا واحدهای مرتبط اضافه کنید.",
            errors: {
              nameRequired: "وارد کردن نام اجباری است.",
              factorRequired: "برای واحدهای مرتبط وارد کردن ضریب الزامی است.",
              relatedForBaseOnly: "واحدهای مرتبط فقط برای واحدهای پایه قابل ایجاد هستند.",
              eachRelatedNeeds: "هر واحد مرتبط نیاز به نام و ضریب > 0 دارد.",
            },
            submit: "ثبت",
            submitting: "در حال ارسال...",
            remove: "حذف",
          },
        },
        reports: {
          title: "گزارش‌های مالی",
          subtitle: "خلاصه درآمد، هزینه و سود/زیان",
        },
        users: {
          title: "کاربران",
          subtitle: "مدیریت کاربران",
        },
        customers: {
          title: "مشتریان",
          subtitle: "مدیریت مشتریان",
        },
        products: {
          title: "محصولات / کالا / بسته‌ها",
          subtitle: "مدیریت محصولات",
        },
        orders: {
          title: "سفارش‌ها",
          subtitle: "مدیریت سفارش‌ها و اقلام",
          status: {
            pending: "در انتظار",
            shipped: "ارسال شده",
            delivered: "تحویل شده",
            cancelled: "لغو شده",
          },
          form: {
            new: "جدید",
            customerPlaceholder: "انتخاب مشتری…",
            itemsTitle: "اقلام",
            addItem: "افزودن آیتم",
            remove: "حذف",
            submit: "ثبت",
            submitting: "در حال ارسال...",
          },
        },
        transfers: {
          title: "انتقال‌ها",
          subtitle: "مدیریت انتقال‌ها",
          status: {
            assigned: "اختصاص داده شده",
            inTransit: "در حال انتقال",
            completed: "تکمیل شده",
          },
        },
      },
      fields: {
        code: "کد",
        name: "نام",
        lastName: "نام خانوادگی",
        email: "ایمیل",
        username: "نام کاربری",
        password: "رمز عبور",
        role: "نقش",
        phone: "تلفن",
        accountTypeId: "نوع حساب",
        balance: "موجودی",
        description: "توضیحات",
        createdAt: "ایجاد شده",
        updatedAt: "به‌روزرسانی شده",
        symbol: "نماد",
        baseUnit: "واحد پایه",
        factor: "ضریب",
        order: "سفارش",
        origin: "مبدأ",
        destination: "مقصد",
        status: "وضعیت",
        amount: "مبلغ",
        method: "روش",
        paid_at: "تاریخ پرداخت",
        shipped_at: "ارسال شده",
        delivered_at: "تحویل شده",
        location: "مقصد",
        driver: "راننده",
        transfer: "انتقال",
        customer: "مشتری",
        product: "محصول",
        quantity: "تعداد",
        weight: "وزن",
        price: "قیمت",
        compare_at_price: "قیمت مقایسه",
        image_url: "تصویر",
        is_active: "فعال",
        unitMeasure: "واحد سنجش",
        unit_measure_id: "واحد سنجش",
        unitPrice: "قیمت واحد",
        lineTotal: "مجموعه",
        related_id: "شناسه مرتبط",
        related_type: "نوع مرتبط",
        reason: "دلیل",
        amount_delta: "مبلغ (+/-)",
        vehicle_type: "نوع وسیله نقلیه",
        license_number: "شماره گواهینامه",
        account: "حساب",
        type: "نوع",
        category: "دسته‌بندی",
        totalPrice: "قیمت کل",
        order_summary: "سفارش",
        origin_location: "مبدأ",
        driver_label: "راننده",
        order_id: "سفارش",
        driver_id: "راننده",
        vehicle_info: "اطلاعات وسیله نقلیه",
      },
      home: {
        brand: "مجموعه لجستیک",
        title: "مدیریت انتقال و تحویل",
        adminLogin: "ورود مدیر",
        heroTitle: "محموله خود را فوری رهگیری کنید",
        heroSubtitle:
          "آخرین وضعیت، به‌روزرسانی موقعیت و پیشرفت تحویل را مشاهده کنید.",
        placeholderTracking: "شماره رهگیری را وارد کنید",
        searching: "در حال جستجو...",
        track: "رهگیری",
        errorEmpty: "برای جستجو شماره رهگیری را وارد کنید.",
        errorInvalid: "شماره رهگیری باید عددی مثبت باشد.",
        errorNotFound: "این شماره رهگیری پیدا نشد.",
        resultTitle: "نتیجه رهگیری",
        currentStatus: "وضعیت فعلی",
        transferStatus: "وضعیت انتقال",
        route: "مسیر",
        orderStatus: "وضعیت سفارش",
        lastUpdate: "آخرین به‌روزرسانی",
        historyTitle: "تاریخچه رهگیری",
        location: "موقعیت",
        feature1Title: "شفافیت محموله",
        feature1Body:
          "پیشرفت انتقال، به‌روزرسانی راننده و مراحل تحویل را یکجا ببینید.",
        feature2Title: "عملیات قابل اعتماد",
        feature2Body:
          "سفارش‌ها، انتقال‌ها، پرداخت‌ها و هزینه‌ها را در یک سیستم هماهنگ کنید.",
        feature3Title: "گزارش‌دهی دقیق",
        feature3Body:
          "درآمد، هزینه‌ها و عملکرد را با داشبوردهای تحلیلی دنبال کنید.",
      },
      login: {
        signInTitle: "ورود",
        createAdminTitle: "ایجاد مدیر",
        signInDesc: "با اطلاعات مدیر وارد داشبورد شوید.",
        createAdminDesc: "اولین حساب مدیر را برای این داشبورد بسازید.",
        name: "نام",
        lastName: "نام خانوادگی",
        username: "نام کاربری",
        email: "ایمیل",
        password: "رمز عبور",
        pleaseWait: "لطفاً صبر کنید…",
        signIn: "ورود",
        createAdmin: "ایجاد مدیر",
        createFirstAdmin: "ایجاد اولین حساب مدیر",
        backToSignIn: "بازگشت به ورود",
        authFailed: "احراز هویت ناموفق بود",
      },
    },
  },
} as const;

export const supportedLanguages = ["en", "fa"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return "en";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && supportedLanguages.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  const browser = window.navigator.language?.split("-")[0];
  if (browser && supportedLanguages.includes(browser as SupportedLanguage)) {
    return browser as SupportedLanguage;
  }
  return "en";
}

function applyDocumentLanguage(lang: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = rtlLanguages.has(lang) ? "rtl" : "ltr";
}

const initialLanguage = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(i18n.language);

i18n.on("languageChanged", (lang) => {
  applyDocumentLanguage(lang);
});

export function setLanguage(lang: SupportedLanguage) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  void i18n.changeLanguage(lang);
}

export default i18n;
