const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");

dotenv.config();

// Load Models
const User = require("./models/User");
const State = require("./models/State");
const City = require("./models/City");
const Address = require("./models/UserAdress");
const Shop = require("./models/Shop");
const ServiceOrder = require("./models/ServiceOrder");
const InventoryLog = require("./models/InventoryLog");
const ShopNotification = require("./models/ShopNotification");
const WasteCategory = require("./models/WasteCategory");
const Waste = require("./models/Waste");
const TimeSlot = require("./models/TimeSlot");
const Order = require("./models/Order");
const Ticket = require("./models/Ticket");
const News = require("./models/News");
const Banners = require("./models/Banners");
const Withdrawal = require("./models/Withdrawal");

const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY || "test").toString();
};

async function seed() {
    try {
        console.log("Connecting to MongoDB:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully!");

        // 1. Clear / Reset Collections for clean state
        console.log("Clearing existing sample data...");
        await Promise.all([
            User.deleteMany({}),
            State.deleteMany({}),
            City.deleteMany({}),
            Address.deleteMany({}),
            Shop.deleteMany({}),
            ServiceOrder.deleteMany({}),
            InventoryLog.deleteMany({}),
            ShopNotification.deleteMany({}),
            WasteCategory.deleteMany({}),
            Waste.deleteMany({}),
            TimeSlot.deleteMany({}),
            Order.deleteMany({}),
            Ticket.deleteMany({}),
            News.deleteMany({}),
            Banners.deleteMany({}),
            Withdrawal.deleteMany({})
        ]);

        // 2. Create States and Cities
        console.log("Seeding States & Cities...");
        const khorasan = await State.create({
            name: { fa: "خراسان رضوی", en: "Khorasan Razavi" },
            location: { lat: 36.2972, lng: 59.6067 }
        });
        const tehranState = await State.create({
            name: { fa: "تهران", en: "Tehran" },
            location: { lat: 35.6892, lng: 51.3890 }
        });

        const sarakhsCity = await City.create({
            name: { fa: "سرخس", en: "Sarakhs" },
            state: khorasan._id
        });
        const mashhadCity = await City.create({
            name: { fa: "مشهد", en: "Mashhad" },
            state: khorasan._id
        });
        const tehranCity = await City.create({
            name: { fa: "تهران", en: "Tehran" },
            state: tehranState._id
        });

        // 3. Create Users with Different Roles
        console.log("Seeding Users...");
        const adminUser = await User.create({
            username: "admin",
            password: encryptPassword("admin123"),
            name: "حسین",
            lastName: "بازئی (مدیر کل)",
            email: "admin@pasmand.ir",
            nationalId: "0921234567",
            role: "admin",
            finance: 2500000,
            score: 150,
            active: true,
            shaba: "IR120170000000123456789001"
        });

        const shopWaterOwner = await User.create({
            username: "shop_water",
            password: encryptPassword("water123"),
            name: "علی",
            lastName: "رضایی (مالک آب تسویه)",
            email: "water_shop@pasmand.ir",
            nationalId: "0921234568",
            role: "shop_owner",
            finance: 1800000,
            score: 95,
            active: true,
            shaba: "IR120170000000123456789002"
        });

        const shopBreadOwner = await User.create({
            username: "shop_bread",
            password: encryptPassword("bread123"),
            name: "محمد",
            lastName: "کریمی (مالک نانوایی)",
            email: "bread_shop@pasmand.ir",
            nationalId: "0921234569",
            role: "shop_owner",
            finance: 3400000,
            score: 120,
            active: true,
            shaba: "IR120170000000123456789003"
        });

        const shopManagerUser = await User.create({
            username: "shop_manager",
            password: encryptPassword("manager123"),
            name: "سارا",
            lastName: "احمدی (مدیر فروشگاه)",
            email: "manager@pasmand.ir",
            nationalId: "0921234570",
            role: "shop_manager",
            finance: 500000,
            score: 40,
            active: true
        });

        const shopAgentUser = await User.create({
            username: "shop_agent",
            password: encryptPassword("agent123"),
            name: "رضا",
            lastName: "طاهری (اپراتور فروشگاه)",
            email: "agent@pasmand.ir",
            nationalId: "0921234571",
            role: "shop_agent",
            finance: 200000,
            score: 25,
            active: true
        });

        const driverUser = await User.create({
            username: "driver",
            password: encryptPassword("driver123"),
            name: "رسول",
            lastName: "پیک و سفیر",
            email: "driver@pasmand.ir",
            nationalId: "0921234572",
            role: "driver",
            finance: 750000,
            score: 80,
            active: true
        });

        const rasolUser = await User.create({
            username: "rasol",
            password: encryptPassword("Rasol6959"),
            name: "رسول",
            lastName: "محمدی",
            email: "rasol@pasmand.ir",
            nationalId: "0921234573",
            role: "driver",
            finance: 400000,
            score: 50,
            active: true
        });

        const user1 = await User.create({
            username: "user1",
            password: encryptPassword("user123"),
            name: "مریم",
            lastName: "حسینی",
            email: "user1@pasmand.ir",
            nationalId: "0921234574",
            role: "user",
            finance: 350000,
            score: 65,
            active: true,
            invitedCode: "PAS101"
        });

        const user2 = await User.create({
            username: "user2",
            password: encryptPassword("user123"),
            name: "امیر",
            lastName: "کاظمی",
            email: "user2@pasmand.ir",
            nationalId: "0921234575",
            role: "user",
            finance: 120000,
            score: 30,
            active: true,
            invitedCode: "PAS102"
        });

        const user3 = await User.create({
            username: "09032176063",
            password: encryptPassword("user123"),
            name: "حسین",
            lastName: "بزئی",
            email: "hb@pasmand.ir",
            nationalId: "0921234576",
            role: "user",
            finance: 580000,
            score: 85,
            active: true,
            invitedCode: "PAS103"
        });

        // 4. Create Addresses
        console.log("Seeding Addresses...");
        const adminAddress = await Address.create({
            Address: {
                title: "دفتر مرکزی مدیریت",
                city: sarakhsCity._id,
                boulevard: "بلوار امام رضا (ع)",
                alley: "کوچه شهید رجایی ۴",
                plaque: "۱۲",
                unit: "۱",
                postalCode: "9361812345",
                info: "ساختمان اداری پسماند و خدمات شهری",
                lat: 36.5448,
                lng: 61.1578
            },
            user: adminUser._id,
            active: true
        });
        await User.findByIdAndUpdate(adminUser._id, {
            activeAddress: adminAddress._id,
            userAddress: [adminAddress._id]
        });

        const user1Address1 = await Address.create({
            Address: {
                title: "منزل سرخس",
                city: sarakhsCity._id,
                boulevard: "خیابان شهید بهشتی",
                alley: "کوچه بهارستان ۲",
                plaque: "۲۸",
                unit: "۳",
                postalCode: "9361845678",
                info: "درب قهوه‌ای، طبقه دوم",
                lat: 36.5455,
                lng: 61.1590
            },
            user: user1._id,
            active: true
        });
        await User.findByIdAndUpdate(user1._id, {
            activeAddress: user1Address1._id,
            userAddress: [user1Address1._id]
        });

        const user2Address1 = await Address.create({
            Address: {
                title: "محل کار",
                city: sarakhsCity._id,
                boulevard: "میدان قدس",
                alley: "خیابان طالقانی شرقی",
                plaque: "۵۵",
                unit: "همکف",
                postalCode: "9361898765",
                info: "فروشگاه لوازم خانگی",
                lat: 36.5430,
                lng: 61.1560
            },
            user: user2._id,
            active: true
        });
        await User.findByIdAndUpdate(user2._id, {
            activeAddress: user2Address1._id,
            userAddress: [user2Address1._id]
        });

        const user3Address1 = await Address.create({
            Address: {
                title: "منزل مسکونی",
                city: sarakhsCity._id,
                boulevard: "بلوار جانبازان",
                alley: "کوچه لاله ۴",
                plaque: "۱۴",
                unit: "۲",
                postalCode: "9361811223",
                info: "طبقه اول زنگ ۲",
                lat: 36.5470,
                lng: 61.1610
            },
            user: user3._id,
            active: true
        });
        await User.findByIdAndUpdate(user3._id, {
            activeAddress: user3Address1._id,
            userAddress: [user3Address1._id]
        });

        // 5. Create Shops with Products and Variants
        console.log("Seeding Shops and Products...");

        // Water Shop 1
        const waterShop1 = await Shop.create({
            name: "ایستگاه تصفیه آب زلال سرخس",
            shopType: "water",
            owner: shopWaterOwner._id,
            city: sarakhsCity._id,
            cityName: "سرخس",
            address: "سرخس، میدان امام خمینی، ابتدای خیابان فلسطین، پلاک ۴۲",
            phone: "05134522010",
            description: "عرضه مستقیم و با کیفیت آب تصفیه شده چند مرحله‌ای با فناوری اسمز معکوس و استاندارد بهداشتی",
            image: "download/files/water_shop1.jpg",
            active: true,
            available: true,
            minOrderAmount: 20000,
            deliveryFee: 15000,
            operatingHours: { open: "07:30", close: "23:00" },
            teamMembers: [
                { user: shopManagerUser._id, role: "manager", active: true },
                { user: shopAgentUser._id, role: "operator", active: true }
            ],
            products: [
                {
                    name: "گالن آب تصفیه بهداشتی",
                    description: "آب شیرین و گوارای تصفیه شده با دستگاه‌های صنعتی اسمز معکوس RO",
                    price: 25000,
                    stock: 150,
                    available: true,
                    category: "آب گالنی",
                    variants: [
                        { name: "گالن ۲۰ لیتری (پر)", price: 25000, stock: 80, available: true, description: "گالن ۲۰ لیتری استاندارد" },
                        { name: "گالن ۱۰ لیتری (پر)", price: 15000, stock: 40, available: true, description: "گالن ۱۰ لیتری دسته‌دار" },
                        { name: "گالن ۵ لیتری (پر)", price: 9000, stock: 30, available: true, description: "گالن ۵ لیتری خانگی" }
                    ]
                },
                {
                    name: "آب مقطر خالص آزمایشگاهی",
                    description: "آب دیونیزه و مقطر مناسب اتو، رادیاتور خودرو، باتری و مصارف صنعتی",
                    price: 35000,
                    stock: 50,
                    available: true,
                    category: "آب مقطر",
                    variants: [
                        { name: "بطری ۴ لیتری", price: 35000, stock: 30, available: true, description: "۴ لیتری خالص" },
                        { name: "بطری ۱ لیتری", price: 12000, stock: 20, available: true, description: "۱ لیتری خالص" }
                    ]
                },
                {
                    name: "پمپ دستی گالن آب",
                    description: "پمپ مکانیکی فشاری برای تخلیه راحت آب از گالن‌های ۲۰ لیتری",
                    price: 85000,
                    stock: 25,
                    available: true,
                    category: "تجهیزات و لوازم",
                    variants: []
                }
            ],
            totalStock: 225
        });

        // Water Shop 2
        const waterShop2 = await Shop.create({
            name: "مرکز پخش آب تصفیه کوثر",
            shopType: "water",
            owner: shopWaterOwner._id,
            city: sarakhsCity._id,
            cityName: "سرخس",
            address: "سرخس، بلوار جانبازان، تقاطع مدرس، پلاک ۸",
            phone: "05134524455",
            description: "توزیع سریع آب تصفیه شده و آب معدنی خنک در سطح شهرستان سرخس",
            image: "download/files/water_shop2.jpg",
            active: true,
            available: true,
            minOrderAmount: 25000,
            deliveryFee: 12000,
            operatingHours: { open: "08:00", close: "22:00" },
            teamMembers: [
                { user: shopAgentUser._id, role: "operator", active: true }
            ],
            products: [
                {
                    name: "آب تصفیه معدنی کوثر",
                    description: "تصفیه شده با املاح استاندارد و تاییدیه بهداشت",
                    price: 24000,
                    stock: 120,
                    available: true,
                    category: "آب گالنی",
                    variants: [
                        { name: "۲۰ لیتری", price: 24000, stock: 70, available: true },
                        { name: "۱۰ لیتری", price: 14000, stock: 50, available: true }
                    ]
                },
                {
                    name: "پک آب معدنی ۱.۵ لیتری (۶ عددی)",
                    description: "باکس ۶ تایی آب معدنی طبیعی",
                    price: 54000,
                    stock: 45,
                    available: true,
                    category: "بسته‌بندی",
                    variants: []
                }
            ],
            totalStock: 165
        });

        // Bread Shop 1
        const breadShop1 = await Shop.create({
            name: "نانوایی سنتی و فانتزی برکت",
            shopType: "bread",
            owner: shopBreadOwner._id,
            city: sarakhsCity._id,
            cityName: "سرخس",
            address: "سرخس، خیابان امام خمینی، روبروی پارک وحدت، پلاک ۱۱۵",
            phone: "05134528890",
            description: "پخت انواع نان سنتی تنوری، بربری، سنگک و لواش با بهترین آرد سبوس‌دار و کنجد تازه",
            image: "download/files/bread_shop1.jpg",
            active: true,
            available: true,
            minOrderAmount: 15000,
            deliveryFee: 10000,
            operatingHours: { open: "06:00", close: "21:30" },
            teamMembers: [
                { user: shopManagerUser._id, role: "manager", active: true },
                { user: shopAgentUser._id, role: "operator", active: true }
            ],
            products: [
                {
                    name: "نان سنگک سنتی ریگی",
                    description: "پخت سنتی روی سنگ داغ با آرد کامل سبوس‌دار",
                    price: 15000,
                    stock: 200,
                    available: true,
                    category: "نان سنتی",
                    variants: [
                        { name: "سنگک پرکنجد دو رو", price: 25000, stock: 60, available: true, description: "کنجد درجه یک دوطرفه" },
                        { name: "سنگک کنجدی یک رو", price: 20000, stock: 70, available: true, description: "کنجد روی نان" },
                        { name: "سنگک ساده", price: 15000, stock: 70, available: true, description: "سنگک سنتی ساده" }
                    ]
                },
                {
                    name: "نان بربری داغ تنوری",
                    description: "بربری ترد و خوش‌طعم با کنجد و سیاهدانه",
                    price: 10000,
                    stock: 180,
                    available: true,
                    category: "نان سنتی",
                    variants: [
                        { name: "بربری کنجدی", price: 15000, stock: 100, available: true },
                        { name: "بربری ساده", price: 10000, stock: 80, available: true }
                    ]
                },
                {
                    name: "نان لواش دسته‌بندی شده",
                    description: "لواش نرم و نازک محلی سرخس",
                    price: 30000,
                    stock: 100,
                    available: true,
                    category: "نان لواش",
                    variants: [
                        { name: "بسته ۳۰ تایی لواش", price: 45000, stock: 50, available: true },
                        { name: "بسته ۲۰ تایی لواش", price: 30000, stock: 50, available: true }
                    ]
                },
                {
                    name: "نان تافتون سنتی",
                    description: "بسته ۱۰ تایی نان تافتون گرد",
                    price: 25000,
                    stock: 60,
                    available: true,
                    category: "نان سنتی",
                    variants: []
                }
            ],
            totalStock: 540
        });

        // Bread Shop 2
        const breadShop2 = await Shop.create({
            name: "مجتمع نان و شیرینی بهار",
            shopType: "bread",
            owner: shopBreadOwner._id,
            city: sarakhsCity._id,
            cityName: "سرخس",
            address: "سرخس، خیابان طالقانی، نبش طالقانی ۱۲",
            phone: "05134526677",
            description: "تولید انواع نان حجیم و نیمه حجیم، نان تست پروتئینه، جو و شیرمال تازه",
            image: "download/files/bread_shop2.jpg",
            active: true,
            available: true,
            minOrderAmount: 20000,
            deliveryFee: 12000,
            operatingHours: { open: "07:00", close: "22:00" },
            teamMembers: [],
            products: [
                {
                    name: "نان تست مغزدار و جو",
                    description: "نان تست غنی شده با غلات و سبوس جو، عالی برای صبحانه و رژیم",
                    price: 45000,
                    stock: 75,
                    available: true,
                    category: "نان فانتزی",
                    variants: [
                        { name: "نان تست هفت غله (بسته کامل)", price: 55000, stock: 35, available: true },
                        { name: "نان تست جو و شوید", price: 45000, stock: 40, available: true }
                    ]
                },
                {
                    name: "نان شیرمال سنتی زعفرانی",
                    description: "نان شیرمال گرم با کره و مغز گردو و بادام",
                    price: 35000,
                    stock: 50,
                    available: true,
                    category: "نان محلی",
                    variants: [
                        { name: "شیرمال مغزدار گردویی", price: 48000, stock: 25, available: true },
                        { name: "شیرمال ساده کنجدی", price: 35000, stock: 25, available: true }
                    ]
                },
                {
                    name: "نان باگت فرانسوی (بسته ۳ تایی)",
                    description: "باگت ترد مناسب ساندویچ",
                    price: 28000,
                    stock: 60,
                    available: true,
                    category: "نان فانتزی",
                    variants: []
                }
            ],
            totalStock: 185
        });

        // 6. Create Service Orders (Water & Bread)
        console.log("Seeding Service Orders...");

        // Water Order 1 - Delivered
        const pWaterGalon = waterShop1.products[0];
        const vWater20 = pWaterGalon.variants[0];
        await ServiceOrder.create({
            serviceType: "water",
            user: user1._id,
            shop: waterShop1._id,
            orderedProducts: [
                {
                    product: pWaterGalon._id,
                    productName: pWaterGalon.name,
                    variant: vWater20._id,
                    variantName: vWater20.name,
                    quantity: 2,
                    unitPrice: 25000,
                    totalPrice: 50000
                }
            ],
            address: user1Address1._id,
            addressDetails: {
                city: "سرخس",
                boulevard: "خیابان شهید بهشتی",
                alley: "کوچه بهارستان ۲",
                plaque: "۲۸",
                unit: "۳",
                postalCode: "9361845678",
                fullAddress: "سرخس، خیابان شهید بهشتی، کوچه بهارستان ۲، پلاک ۲۸، واحد ۳",
                lat: 36.5455,
                lng: 61.1590
            },
            status: "delivered",
            totalPrice: 50000,
            deliveryFee: 15000,
            discount: 0,
            finalPrice: 65000,
            paymentStatus: "paid",
            paymentMethod: "wallet",
            notes: "لطفا قبل از ارسال تماس بگیرید",
            deliveredAt: new Date(Date.now() - 3600000 * 5),
            timeline: [
                { status: "pending", date: new Date(Date.now() - 3600000 * 8), comment: "ثبت سفارش توسط کاربر", actor: user1._id },
                { status: "accepted", date: new Date(Date.now() - 3600000 * 7), comment: "سفارش توسط ایستگاه آب تایید شد", actor: shopWaterOwner._id },
                { status: "ready", date: new Date(Date.now() - 3600000 * 6), comment: "گالن‌های آب آماده بارگیری شدند", actor: shopAgentUser._id },
                { status: "shipped", date: new Date(Date.now() - 3600000 * 5.5), comment: "سفارش تحویل پیک گردید", actor: driverUser._id },
                { status: "delivered", date: new Date(Date.now() - 3600000 * 5), comment: "سفارش با موفقیت به مشتری تحویل داده شد", actor: driverUser._id }
            ]
        });

        // Water Order 2 - Ready
        const pWaterDistilled = waterShop1.products[1];
        const vWaterDist4 = pWaterDistilled.variants[0];
        await ServiceOrder.create({
            serviceType: "water",
            user: user2._id,
            shop: waterShop1._id,
            orderedProducts: [
                {
                    product: pWaterGalon._id,
                    productName: pWaterGalon.name,
                    variant: vWater20._id,
                    variantName: vWater20.name,
                    quantity: 1,
                    unitPrice: 25000,
                    totalPrice: 25000
                },
                {
                    product: pWaterDistilled._id,
                    productName: pWaterDistilled.name,
                    variant: vWaterDist4._id,
                    variantName: vWaterDist4.name,
                    quantity: 1,
                    unitPrice: 35000,
                    totalPrice: 35000
                }
            ],
            address: user2Address1._id,
            addressDetails: {
                city: "سرخس",
                boulevard: "میدان قدس",
                alley: "خیابان طالقانی شرقی",
                plaque: "۵۵",
                unit: "همکف",
                postalCode: "9361898765",
                fullAddress: "سرخس، میدان قدس، خیابان طالقانی شرقی، پلاک ۵۵، همکف",
                lat: 36.5430,
                lng: 61.1560
            },
            status: "ready",
            totalPrice: 60000,
            deliveryFee: 15000,
            discount: 5000,
            finalPrice: 70000,
            paymentStatus: "pending",
            paymentMethod: "cash_on_delivery",
            notes: "پرداخت نقدی یا با کارتخوان در محل",
            timeline: [
                { status: "pending", date: new Date(Date.now() - 3600000 * 3), comment: "ثبت سفارش جدید", actor: user2._id },
                { status: "accepted", date: new Date(Date.now() - 3600000 * 2), comment: "تایید توسط فروشگاه", actor: shopManagerUser._id },
                { status: "ready", date: new Date(Date.now() - 3600000 * 1), comment: "آماده ارسال - در انتظار اعزام پیک", actor: shopAgentUser._id }
            ]
        });

        // Water Order 3 - Pending
        await ServiceOrder.create({
            serviceType: "water",
            user: user3._id,
            shop: waterShop2._id,
            orderedProducts: [
                {
                    product: waterShop2.products[0]._id,
                    productName: waterShop2.products[0].name,
                    variant: waterShop2.products[0].variants[0]._id,
                    variantName: waterShop2.products[0].variants[0].name,
                    quantity: 3,
                    unitPrice: 24000,
                    totalPrice: 72000
                }
            ],
            address: user3Address1._id,
            addressDetails: {
                city: "سرخس",
                boulevard: "بلوار جانبازان",
                alley: "کوچه لاله ۴",
                plaque: "۱۴",
                unit: "۲",
                postalCode: "9361811223",
                fullAddress: "سرخس، بلوار جانبازان، کوچه لاله ۴، پلاک ۱۴، واحد ۲",
                lat: 36.5470,
                lng: 61.1610
            },
            status: "pending",
            totalPrice: 72000,
            deliveryFee: 12000,
            discount: 0,
            finalPrice: 84000,
            paymentStatus: "paid",
            paymentMethod: "online",
            notes: "عصر ساعت ۶ به بعد ارسال شود",
            timeline: [
                { status: "pending", date: new Date(Date.now() - 1800000), comment: "ثبت سفارش توسط مشتری", actor: user3._id }
            ]
        });

        // Bread Order 1 - Shipped
        const pSangak = breadShop1.products[0];
        const vSangakKonjed = pSangak.variants[0];
        const pBarbari = breadShop1.products[1];
        const vBarbariKonjed = pBarbari.variants[0];
        await ServiceOrder.create({
            serviceType: "bread",
            user: user1._id,
            shop: breadShop1._id,
            orderedProducts: [
                {
                    product: pSangak._id,
                    productName: pSangak.name,
                    variant: vSangakKonjed._id,
                    variantName: vSangakKonjed.name,
                    quantity: 2,
                    unitPrice: 25000,
                    totalPrice: 50000
                },
                {
                    product: pBarbari._id,
                    productName: pBarbari.name,
                    variant: vBarbariKonjed._id,
                    variantName: vBarbariKonjed.name,
                    quantity: 2,
                    unitPrice: 15000,
                    totalPrice: 30000
                }
            ],
            address: user1Address1._id,
            addressDetails: {
                city: "سرخس",
                boulevard: "خیابان شهید بهشتی",
                alley: "کوچه بهارستان ۲",
                plaque: "۲۸",
                unit: "۳",
                postalCode: "9361845678",
                fullAddress: "سرخس، خیابان شهید بهشتی، کوچه بهارستان ۲، پلاک ۲۸، واحد ۳",
                lat: 36.5455,
                lng: 61.1590
            },
            status: "shipped",
            totalPrice: 80000,
            deliveryFee: 10000,
            discount: 0,
            finalPrice: 90000,
            paymentStatus: "paid",
            paymentMethod: "online",
            notes: "نان‌ها کاملا داغ و برشته باشند",
            timeline: [
                { status: "pending", date: new Date(Date.now() - 3600000 * 2), comment: "ثبت سفارش نان داغ", actor: user1._id },
                { status: "accepted", date: new Date(Date.now() - 3600000 * 1.5), comment: "سفارش وارد مرحله پخت شد", actor: shopBreadOwner._id },
                { status: "ready", date: new Date(Date.now() - 3600000 * 0.8), comment: "پخت انجام شد و در پاکت بهداشتی قرار گرفت", actor: shopAgentUser._id },
                { status: "shipped", date: new Date(Date.now() - 3600000 * 0.3), comment: "سفیر در حال رساندن نان به مقصد است", actor: driverUser._id }
            ]
        });

        // Bread Order 2 - Delivered
        const pLavash = breadShop1.products[2];
        const vLavash30 = pLavash.variants[0];
        await ServiceOrder.create({
            serviceType: "bread",
            user: user3._id,
            shop: breadShop1._id,
            orderedProducts: [
                {
                    product: pLavash._id,
                    productName: pLavash.name,
                    variant: vLavash30._id,
                    variantName: vLavash30.name,
                    quantity: 1,
                    unitPrice: 45000,
                    totalPrice: 45000
                }
            ],
            address: user3Address1._id,
            addressDetails: {
                city: "سرخس",
                boulevard: "بلوار جانبازان",
                alley: "کوچه لاله ۴",
                plaque: "۱۴",
                unit: "۲",
                postalCode: "9361811223",
                fullAddress: "سرخس، بلوار جانبازان، کوچه لاله ۴، پلاک ۱۴، واحد ۲",
                lat: 36.5470,
                lng: 61.1610
            },
            status: "delivered",
            totalPrice: 45000,
            deliveryFee: 10000,
            discount: 5000,
            finalPrice: 50000,
            paymentStatus: "paid",
            paymentMethod: "wallet",
            deliveredAt: new Date(Date.now() - 3600000 * 12),
            timeline: [
                { status: "pending", date: new Date(Date.now() - 3600000 * 14), comment: "ثبت سفارش", actor: user3._id },
                { status: "accepted", date: new Date(Date.now() - 3600000 * 13.5), comment: "تایید سفارش نان", actor: shopBreadOwner._id },
                { status: "ready", date: new Date(Date.now() - 3600000 * 13), comment: "بسته‌بندی لواش آماده شد", actor: shopAgentUser._id },
                { status: "shipped", date: new Date(Date.now() - 3600000 * 12.5), comment: "ارسال شد", actor: driverUser._id },
                { status: "delivered", date: new Date(Date.now() - 3600000 * 12), comment: "تحویل گردید", actor: driverUser._id }
            ]
        });

        // 7. Create Inventory Logs
        console.log("Seeding Inventory Logs...");
        await InventoryLog.create([
            {
                shop: waterShop1._id,
                product: pWaterGalon._id,
                variant: vWater20._id,
                previousStock: 100,
                newStock: 80,
                difference: -20,
                reason: "کسر موجودی پس از ثبت و ارسال سفارشات روز",
                type: "order_deduct",
                user: shopManagerUser._id
            },
            {
                shop: waterShop1._id,
                product: pWaterGalon._id,
                variant: vWater20._id,
                previousStock: 50,
                newStock: 100,
                difference: 50,
                reason: "شارژ روزانه مخازن و پرکردن گالن‌های جدید",
                type: "restock",
                user: shopWaterOwner._id
            },
            {
                shop: breadShop1._id,
                product: pSangak._id,
                variant: vSangakKonjed._id,
                previousStock: 0,
                newStock: 60,
                difference: 60,
                reason: "نوبت پخت صبحگاهی سنگک",
                type: "restock",
                user: shopBreadOwner._id
            }
        ]);

        // 8. Create Shop Notifications
        console.log("Seeding Shop Notifications...");
        await ShopNotification.create([
            {
                recipient: shopWaterOwner._id,
                shop: waterShop1._id,
                title: "سفارش جدید آب تصفیه",
                message: "سفارش جدیدی با مبلغ ۷۰,۰۰۰ تومان برای ایستگاه تصفیه آب زلال ثبت شد.",
                type: "order_created",
                isRead: false
            },
            {
                recipient: shopBreadOwner._id,
                shop: breadShop1._id,
                title: "هشدار موجودی آرد و نان",
                message: "موجودی بسته ۲۰ تایی نان لواش به زیر ۵۰ بسته رسیده است.",
                type: "inventory_alert",
                isRead: true,
                readAt: new Date(Date.now() - 3600000 * 2)
            },
            {
                recipient: adminUser._id,
                title: "عضویت فروشگاه جدید",
                message: "فروشگاه «نانوایی سنتی و فانتزی برکت» با موفقیت فعال شد.",
                type: "system",
                isRead: false
            }
        ]);

        // 9. Create Waste Categories & Wastes
        console.log("Seeding Waste Categories & Waste Items...");
        const catPaper = await WasteCategory.create({
            title: { fa: "کاغذ و مقوا", en: "Paper & Cardboard" },
            desc: { fa: "انواع کارتن‌های تمیز، کتاب و دفتر، روزنامه و مقوا", en: "Cartons, books, newspapers" },
            active: true
        });

        const catPlastic = await WasteCategory.create({
            title: { fa: "پلاستیک و پلیمر", en: "Plastic & Polymers" },
            desc: { fa: "بطری‌های پت نوشیدنی، ظروف پلاستیکی شوینده، دبه و نایلون", en: "PET bottles, HDPE containers" },
            active: true
        });

        const catMetal = await WasteCategory.create({
            title: { fa: "فلزات و قوطی", en: "Metals & Cans" },
            desc: { fa: "قوطی‌های کنسرو و رب، آهن‌آلات، مس و آلومینیوم", en: "Aluminum cans, iron, copper" },
            active: true
        });

        const catGlass = await WasteCategory.create({
            title: { fa: "شیشه و بلور", en: "Glass" },
            desc: { fa: "انواع بطری‌ها و ظروف شیشه‌ای سالم و شکسته", en: "Glass bottles and jars" },
            active: true
        });

        const wasteCarton = await Waste.create({
            title: "کارتن و جعبه مقوایی تمیز",
            price: 8500,
            info: "قیمت به ازای هر کیلوگرم - کارتن‌های تمیز و بدون رطوبت",
            category: catPaper._id,
            active: true
        });

        const wastePET = await Waste.create({
            title: "بطری پت (آب معدنی و نوشابه)",
            price: 16000,
            info: "قیمت به ازای هر کیلوگرم - پرس شده یا خالی از مایعات",
            category: catPlastic._id,
            active: true
        });

        const wastePlastHeavy = await Waste.create({
            title: "پلاستیک بادی و فشرده (دبه و ظروف شوینده)",
            price: 13500,
            info: "قیمت به ازای هر کیلوگرم - ظروف شامپو، دبه‌های روغن و شوینده",
            category: catPlastic._id,
            active: true
        });

        const wasteAluminum = await Waste.create({
            title: "قوطی آلومینیومی (رانی، نوشابه و اسپری)",
            price: 65000,
            info: "قیمت به ازای هر کیلوگرم - قوطی‌های آلومینیومی تمیز",
            category: catMetal._id,
            active: true
        });

        const wasteIron = await Waste.create({
            title: "آهن و قوطی فلزی (رب و کمپوت)",
            price: 18000,
            info: "قیمت به ازای هر کیلوگرم آهن‌آلات سبک و قوطی کنسرو",
            category: catMetal._id,
            active: true
        });

        // 10. Create TimeSlots for Waste Pickups
        console.log("Seeding TimeSlots...");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        const slotObj1 = await TimeSlot.create({
            day: today,
            slots: [
                { startTime: "08:00", endTime: "11:00", capacity: 15, remaining: 11 },
                { startTime: "11:00", endTime: "14:00", capacity: 15, remaining: 14 },
                { startTime: "16:00", endTime: "19:00", capacity: 20, remaining: 18 }
            ],
            active: true
        });

        const slotObj2 = await TimeSlot.create({
            day: tomorrow,
            slots: [
                { startTime: "08:00", endTime: "11:00", capacity: 15, remaining: 15 },
                { startTime: "11:00", endTime: "14:00", capacity: 15, remaining: 15 },
                { startTime: "16:00", endTime: "19:00", capacity: 20, remaining: 19 }
            ],
            active: true
        });

        const slotObj3 = await TimeSlot.create({
            day: dayAfter,
            slots: [
                { startTime: "09:00", endTime: "12:00", capacity: 20, remaining: 20 },
                { startTime: "15:00", endTime: "18:00", capacity: 20, remaining: 20 }
            ],
            active: true
        });

        // 11. Create Waste Orders (Order model)
        console.log("Seeding Waste Collection Orders...");
        await Order.create({
            user: user1._id,
            address: user1Address1._id,
            timeSlot: slotObj1._id,
            slot: slotObj1.slots[0]._id,
            status: "collected",
            active: true,
            totalPrice: 125000,
            desc: "تحویل درب منزل - کارتن‌ها بسته‌بندی شده‌اند",
            wastes: [
                { item: wasteCarton._id, count: 10, price: 8500, title: wasteCarton.title },
                { item: wastePET._id, count: 2.5, price: 16000, title: wastePET.title }
            ],
            recciveTime: new Date(Date.now() - 3600000 * 4)
        });

        await Order.create({
            user: user2._id,
            address: user2Address1._id,
            timeSlot: slotObj1._id,
            slot: slotObj1.slots[2]._id,
            status: "pending",
            active: true,
            totalPrice: 195000,
            desc: "ضایعات آلومینیوم و قوطی کنسرو در حیاط پشتی",
            wastes: [
                { item: wasteAluminum._id, count: 3, price: 65000, title: wasteAluminum.title }
            ]
        });

        await Order.create({
            user: user3._id,
            address: user3Address1._id,
            timeSlot: slotObj2._id,
            slot: slotObj2.slots[2]._id,
            status: "pending",
            active: true,
            totalPrice: 94500,
            desc: "ضایعات پلاستیک دبه‌ای و کارتن",
            wastes: [
                { item: wastePlastHeavy._id, count: 7, price: 13500, title: wastePlastHeavy.title }
            ]
        });

        // 12. Create Support Tickets
        console.log("Seeding Support Tickets...");
        await Ticket.create([
            {
                user: user1._id,
                typeTicket: "سفارش آب",
                title: "تاخیر در تحویل گالن آب تصفیه",
                desc: "سلام، من سفارش گالن آب داده بودم، می‌خواستم بدونم کی پیک میرسه؟",
                status: "closed",
                Response: [
                    {
                        id: 1,
                        role: "user",
                        author: "مریم حسینی",
                        text: "سلام، من سفارش گالن آب داده بودم، می‌خواستم بدونم کی پیک میرسه؟",
                        createdAt: new Date(Date.now() - 3600000 * 6)
                    },
                    {
                        id: 2,
                        role: "admin",
                        author: "پشتیبانی پسماند و خدمات سرخس",
                        text: "با سلام و احترام، سفیر محترم در مسیر آدرس شما هستند و ظرف ۱۵ دقیقه آینده تحویل داده خواهد شد.",
                        createdAt: new Date(Date.now() - 3600000 * 5.5)
                    }
                ]
            },
            {
                user: user2._id,
                typeTicket: "درخواست تسویه",
                title: "واریز موجودی کیف پول به شماره شبا",
                desc: "درخواست تسویه حساب به شماره شبای ثبت شده داشتم.",
                status: "open",
                Response: [
                    {
                        id: 1,
                        role: "user",
                        author: "امیر کاظمی",
                        text: "درخواست تسویه حساب به مبلغ ۱۲۰,۰۰۰ تومان را ثبت کرده‌ام، با تشکر",
                        createdAt: new Date(Date.now() - 3600000 * 2)
                    }
                ]
            },
            {
                user: shopWaterOwner._id,
                typeTicket: "مدیریت فروشگاه",
                title: "درخواست افزایش سهمیه آب تصفیه",
                desc: "با توجه به تقاضای بالای شهروندان در سرخس، درخواست اضافه شدن ظرفیت مخازن ایستگاه را دارم.",
                status: "pending",
                Response: [
                    {
                        id: 1,
                        role: "shop_owner",
                        author: "علی رضایی",
                        text: "درخواست بررسی و تایید ظرفیت جدید",
                        createdAt: new Date(Date.now() - 3600000 * 24)
                    }
                ]
            }
        ]);

        // 13. Create News & Articles
        console.log("Seeding News...");
        await News.create([
            {
                title: "راه‌اندازی سامانه هوشمند سفارش آنلاین آب تصفیه و نان تازه در سرخس",
                desc: "شهروندان گرامی سرخس از این پس می‌توانند به راحتی از طریق سامانه، آب تصفیه استاندارد و انواع نان‌های سنتی و فانتزی را درب منزل دریافت نمایند.",
                tag: ["خدمات شهروندی", "آب تصفیه", "نان داغ", "سرخس"],
                otherInfo: ["ارسال سریع", "پوشش سراسری شهرستان"],
                imgBanner: "download/News/service_launch.jpg",
                releaseDate: "1404/11/25"
            },
            {
                title: "جدول هفتگی جمع‌آوری پسماندهای خشک و قابل بازیافت",
                desc: "به اطلاع همشهریان محترم می‌رساند با تفکیک پسماند از مبدأ و تحویل به ناوگان بازیافت، علاوه بر حفظ محیط زیست از پاداش نقدی در کیف پول بهره‌مند شوید.",
                tag: ["تفکیک پسماند", "محیط زیست", "بازیافت"],
                otherInfo: ["طرح تشویقی"],
                imgBanner: "download/News/waste_schedule.jpg",
                releaseDate: "1404/11/20"
            },
            {
                title: "تخفیف ۱۰ درصدی سفارشات نان سنگک و بربری برای مشترکین فعال",
                desc: "به پاس همراهی شهروندان در طرح تفکیک زباله، تخفیف‌های ویژه‌ای برای خرید از نانوایی‌های منتخب در سامانه اعمال گردید.",
                tag: ["تخفیف", "نانوایی", "باشگاه مشتریان"],
                otherInfo: ["مهلت تا پایان ماه"],
                imgBanner: "download/News/bread_discount.jpg",
                releaseDate: "1404/11/15"
            }
        ]);

        // 14. Create Banners
        console.log("Seeding Banners...");
        await Banners.create([
            {
                title: "سفارش آنلاین آب تصفیه بهداشتی درب منزل",
                desc: "گالن‌های ۲۰ لیتری و ۱۰ لیتری با تضمین کیفیت و تصفیه چند مرحله‌ای",
                otherInfo: ["تحویل فوری", "ایستگاه‌های معتبر سرخس"]
            },
            {
                title: "نان داغ سنتی و تازه هر صبح و عصر",
                desc: "انواع نان سنگک کنجدی، بربری داغ و لواش سبوس‌دار",
                otherInfo: ["بسته‌بندی بهداشتی", "نانوایی برکت"]
            },
            {
                title: "پسماند خشک خود را به پول نقد تبدیل کنید",
                desc: "ثبت آسان درخواست جمع‌آوری کارتن، پلاستیک و قوطی‌های بازیافتی با بالاترین قیمت",
                otherInfo: ["واریز مستقیم به کیف پول"]
            }
        ]);

        // 15. Create Withdrawals
        console.log("Seeding Withdrawals...");
        await Withdrawal.create([
            {
                user: user1._id,
                amount: 150000,
                method: "bank",
                status: "approved",
                name: "مریم حسینی",
                description: "برداشت وجه درآمد حاصل از تحویل کارتن و پسماند خشک",
                adminDescription: "واریز از طریق سامانه پایا با شماره پیگیری ۹۸۲۳۷۴۱",
                requestTime: new Date(Date.now() - 3600000 * 48),
                processTime: new Date(Date.now() - 3600000 * 24),
                active: true
            },
            {
                user: user2._id,
                amount: 120000,
                method: "bank",
                status: "pending",
                name: "امیر کاظمی",
                description: "تسویه حساب درآمد بازیافت قوطی‌های آلومینیومی",
                requestTime: new Date(Date.now() - 3600000 * 3),
                active: true
            },
            {
                user: shopWaterOwner._id,
                amount: 1000000,
                method: "bank",
                status: "approved",
                name: "علی رضایی",
                description: "تسویه درآمد فروش آب تصفیه هفتگی",
                adminDescription: "تایید و تسویه شد",
                requestTime: new Date(Date.now() - 3600000 * 72),
                processTime: new Date(Date.now() - 3600000 * 48),
                active: true
            }
        ]);

        console.log("==================================================");
        console.log("🎉 ALL SEED DATA SUCCESSFULLY INSERTED INTO DB!");
        console.log("==================================================");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed with error:", err);
        process.exit(1);
    }
}

seed();
