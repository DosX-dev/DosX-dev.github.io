/**
 * CyberPredator — PC Configurator Component Database
 * ─────────────────────────────────────────────────
 * Актуально на: Февраль 2026
 *
 * КАК ОБНОВЛЯТЬ:
 *  1. Найди нужную категорию (cpus / gpus / ram / etc.)
 *  2. Добавь/измени/удали объект по шаблону существующих записей
 *  3. Обязательно соблюдай структуру полей:
 *     - id       : уникальный строковый идентификатор (slug)
 *     - name     : полное коммерческое название
 *     - price    : цена в USD (число)
 *     - specs    : объект характеристик (для карточки)
 *     - socket   : (только для CPU) — используется для проверки совместимости с MB
 *     - chipsets : (только для MB)  — массив совместимых сокетов
 *     - tdp      : (CPU/GPU) потребление в ваттах — нужно для PSU-калькулятора
 *     - wattage  : (только для PSU) — мощность БП
 *     - form     : (MB) — "ATX" | "mATX" | "ITX"  /  (Case) — список поддерживаемых форм-форматов
 */

const COMPONENTS = {

  // ─── ПРОЦЕССОРЫ ────────────────────────────────────────────────────────────
  cpus: [
    // ── AMD Ryzen 9000 (Zen 5 / Granite Ridge, Socket AM5)
    {
      id: "r5-9600x",
      brand: "AMD",
      name: "Ryzen 5 9600X",
      price: 279,
      socket: "AM5",
      tdp: 65,
      specs: {
        "Ядра / Потоки": "6 / 12",
        "Частота (базовая / турбо)": "3.9 / 5.4 GHz",
        "Кэш L3": "32 MB",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "65 W",
        "Сокет": "AM5"
      },
      badge: null
    },
    {
      id: "r7-9700x",
      brand: "AMD",
      name: "Ryzen 7 9700X",
      price: 359,
      socket: "AM5",
      tdp: 65,
      specs: {
        "Ядра / Потоки": "8 / 16",
        "Частота (базовая / турбо)": "3.8 / 5.5 GHz",
        "Кэш L3": "32 MB",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "65 W",
        "Сокет": "AM5"
      },
      badge: null
    },
    {
      id: "r7-9800x3d",
      brand: "AMD",
      name: "Ryzen 7 9800X3D",
      price: 479,
      socket: "AM5",
      tdp: 120,
      specs: {
        "Ядра / Потоки": "8 / 16",
        "Частота (базовая / турбо)": "4.7 / 5.2 GHz",
        "Кэш L3": "96 MB (3D V-Cache)",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "120 W",
        "Сокет": "AM5"
      },
      badge: "ТОПОВЫЙ В ИГРАХ"
    },
    {
      id: "r7-9850x3d",
      brand: "AMD",
      name: "Ryzen 7 9850X3D",
      price: 529,
      socket: "AM5",
      tdp: 120,
      specs: {
        "Ядра / Потоки": "8 / 16",
        "Частота (базовая / турбо)": "4.7 / 5.6 GHz",
        "Кэш L3": "96 MB (3D V-Cache)",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "120 W",
        "Сокет": "AM5"
      },
      badge: "НОВИНКА 2026"
    },
    {
      id: "r9-9900x",
      brand: "AMD",
      name: "Ryzen 9 9900X",
      price: 449,
      socket: "AM5",
      tdp: 120,
      specs: {
        "Ядра / Потоки": "12 / 24",
        "Частота (базовая / турбо)": "4.4 / 5.6 GHz",
        "Кэш L3": "64 MB",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "120 W",
        "Сокет": "AM5"
      },
      badge: null
    },
    {
      id: "r9-9950x",
      brand: "AMD",
      name: "Ryzen 9 9950X",
      price: 649,
      socket: "AM5",
      tdp: 170,
      specs: {
        "Ядра / Потоки": "16 / 32",
        "Частота (базовая / турбо)": "4.3 / 5.7 GHz",
        "Кэш L3": "64 MB",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "170 W",
        "Сокет": "AM5"
      },
      badge: "ФЛАГМАН AMD"
    },
    {
      id: "r9-9950x3d",
      brand: "AMD",
      name: "Ryzen 9 9950X3D",
      price: 849,
      socket: "AM5",
      tdp: 170,
      specs: {
        "Ядра / Потоки": "16 / 32",
        "Частота (базовая / турбо)": "4.3 / 5.7 GHz",
        "Кэш L3": "128 MB (3D V-Cache)",
        "Техпроцесс": "4 nm (Zen 5)",
        "TDP": "170 W",
        "Сокет": "AM5"
      },
      badge: "ULTIMATE"
    },

    // ── Intel Core Ultra 200 (Arrow Lake-S, Socket LGA1851)
    {
      id: "cu5-245k",
      brand: "Intel",
      name: "Core Ultra 5 245K",
      price: 309,
      socket: "LGA1851",
      tdp: 125,
      specs: {
        "Ядра / Потоки": "14 (6P + 8E) / 14",
        "Частота (P-Core турбо)": "до 5.2 GHz",
        "Кэш L3": "24 MB",
        "Техпроцесс": "3 nm (Intel 4 / TSMC N6)",
        "TDP": "125 W",
        "Сокет": "LGA1851"
      },
      badge: null
    },
    {
      id: "cu5-245kf",
      brand: "Intel",
      name: "Core Ultra 5 245KF",
      price: 289,
      socket: "LGA1851",
      tdp: 125,
      specs: {
        "Ядра / Потоки": "14 (6P + 8E) / 14",
        "Частота (P-Core турбо)": "до 5.2 GHz",
        "Кэш L3": "24 MB",
        "Техпроцесс": "3 nm",
        "TDP": "125 W",
        "Сокет": "LGA1851",
        "Примечание": "Без встроенной графики"
      },
      badge: null
    },
    {
      id: "cu7-265k",
      brand: "Intel",
      name: "Core Ultra 7 265K",
      price: 394,
      socket: "LGA1851",
      tdp: 125,
      specs: {
        "Ядра / Потоки": "20 (8P + 12E) / 20",
        "Частота (P-Core турбо)": "до 5.5 GHz",
        "Кэш L3": "30 MB",
        "Техпроцесс": "3 nm",
        "TDP": "125 W",
        "Сокет": "LGA1851"
      },
      badge: null
    },
    {
      id: "cu7-265kf",
      brand: "Intel",
      name: "Core Ultra 7 265KF",
      price: 374,
      socket: "LGA1851",
      tdp: 125,
      specs: {
        "Ядра / Потоки": "20 (8P + 12E) / 20",
        "Частота (P-Core турбо)": "до 5.5 GHz",
        "Кэш L3": "30 MB",
        "Техпроцесс": "3 nm",
        "TDP": "125 W",
        "Сокет": "LGA1851",
        "Примечание": "Без встроенной графики"
      },
      badge: null
    },
    {
      id: "cu9-285k",
      brand: "Intel",
      name: "Core Ultra 9 285K",
      price: 589,
      socket: "LGA1851",
      tdp: 125,
      specs: {
        "Ядра / Потоки": "24 (8P + 16E) / 24",
        "Частота (P-Core турбо)": "до 5.7 GHz",
        "Кэш L3": "36 MB",
        "Техпроцесс": "3 nm",
        "TDP": "125 W",
        "Сокет": "LGA1851"
      },
      badge: "ФЛАГМАН INTEL"
    }
  ],

  // ─── МАТЕРИНСКИЕ ПЛАТЫ ─────────────────────────────────────────────────────
  motherboards: [
    // ── AMD AM5 / B650
    {
      id: "asus-prime-b650-a",
      brand: "ASUS",
      name: "PRIME B650-A WiFi",
      price: 179,
      socket: "AM5",
      form: "ATX",
      chipset: "B650",
      specs: {
        "Сокет": "AM5",
        "Чипсет": "B650",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 192 GB / 6400+ MHz",
        "PCIe": "1x PCIe 5.0 x16, 2x M.2 PCIe 5.0",
        "USB на задней панели": "USB 3.2 Gen 2x2, USB-C"
      }
    },
    {
      id: "msi-b650-tomahawk",
      brand: "MSI",
      name: "MAG B650 Tomahawk WiFi",
      price: 209,
      socket: "AM5",
      form: "ATX",
      chipset: "B650",
      specs: {
        "Сокет": "AM5",
        "Чипсет": "B650",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 192 GB / 7200+ MHz",
        "PCIe": "1x PCIe 5.0 x16, 2x M.2 PCIe 5.0",
        "USB на задней панели": "USB 3.2 Gen 2, USB-C 20Gbps"
      }
    },
    // ── AMD AM5 / X670E
    {
      id: "asus-rog-crosshair-x670e",
      brand: "ASUS",
      name: "ROG Crosshair X670E Hero",
      price: 499,
      socket: "AM5",
      form: "ATX",
      chipset: "X670E",
      specs: {
        "Сокет": "AM5",
        "Чипсет": "X670E",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 256 GB / 7200+ MHz OC",
        "PCIe": "2x PCIe 5.0 x16, 4x M.2 PCIe 5.0",
        "USB на задней панели": "USB 3.2 Gen 2x2 x2, Thunderbolt 4"
      }
    },
    {
      id: "msi-meg-x670e-ace",
      brand: "MSI",
      name: "MEG X670E ACE",
      price: 529,
      socket: "AM5",
      form: "ATX",
      chipset: "X670E",
      specs: {
        "Сокет": "AM5",
        "Чипсет": "X670E",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 256 GB / 7800+ MHz OC",
        "PCIe": "2x PCIe 5.0 x16, 4x M.2 PCIe 5.0",
        "USB на задней панели": "USB 3.2 Gen 2x2, Thunderbolt 4, WiFi 7"
      }
    },
    // ── AMD AM5 / X870E
    {
      id: "asus-rog-crosshair-x870e",
      brand: "ASUS",
      name: "ROG Crosshair X870E Hero",
      price: 649,
      socket: "AM5",
      form: "ATX",
      chipset: "X870E",
      specs: {
        "Сокет": "AM5",
        "Чипсет": "X870E",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 256 GB / 8000+ MHz OC",
        "PCIe": "2x PCIe 5.0 x16, 5x M.2 (3x PCIe 5.0)",
        "USB на задней панели": "USB 3.2 Gen 2x2 x3, Thunderbolt 5, WiFi 7"
      }
    },
    // ── Intel LGA1851 / Z890
    {
      id: "asus-prime-z890-a",
      brand: "ASUS",
      name: "PRIME Z890-A WiFi",
      price: 239,
      socket: "LGA1851",
      form: "ATX",
      chipset: "Z890",
      specs: {
        "Сокет": "LGA1851",
        "Чипсет": "Z890",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 192 GB / 8000+ MHz",
        "PCIe": "1x PCIe 5.0 x16, 3x M.2 PCIe 5.0",
        "USB на задней панели": "USB 3.2 Gen 2x2, USB-C 40Gbps"
      }
    },
    {
      id: "msi-z890-tomahawk",
      brand: "MSI",
      name: "MAG Z890 Tomahawk WiFi",
      price: 279,
      socket: "LGA1851",
      form: "ATX",
      chipset: "Z890",
      specs: {
        "Сокет": "LGA1851",
        "Чипсет": "Z890",
        "Форм-фактор": "ATX",
        "Слоты RAM": "4x DDR5 до 192 GB / 9200+ MHz OC",
        "PCIe": "1x PCIe 5.0 x16, 3x M.2 PCIe 5.0/4.0",
        "USB на задней панели": "USB 3.2 Gen 2x2, Thunderbolt 4, WiFi 7"
      }
    },
    {
      id: "asus-rog-maximus-z890",
      brand: "ASUS",
      name: "ROG Maximus Z890 Apex",
      price: 649,
      socket: "LGA1851",
      form: "ATX",
      chipset: "Z890",
      specs: {
        "Сокет": "LGA1851",
        "Чипсет": "Z890",
        "Форм-фактор": "ATX",
        "Слоты RAM": "2x DDR5 до 128 GB / 10400+ MHz OC",
        "PCIe": "1x PCIe 5.0 x16, 4x M.2 PCIe 5.0",
        "USB на задней панели": "Thunderbolt 5, USB 3.2 Gen 2x2 x4, WiFi 7"
      }
    }
  ],

  // ─── ОПЕРАТИВНАЯ ПАМЯТЬ DDR5 ───────────────────────────────────────────────
  ram: [
    {
      id: "ddr5-16-6000",
      name: "16 GB DDR5-6000 (1×16 GB)",
      price: 55,
      specs: {
        "Объём": "16 GB (1 модуль)",
        "Стандарт": "DDR5-6000",
        "Таймингиы (CL)": "CL36",
        "Напряжение": "1.35 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    },
    {
      id: "ddr5-32-6000",
      name: "32 GB DDR5-6000 (2×16 GB)",
      price: 100,
      specs: {
        "Объём": "32 GB (2×16 GB, Dual Channel)",
        "Стандарт": "DDR5-6000",
        "Тайминги (CL)": "CL36",
        "Напряжение": "1.35 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    },
    {
      id: "ddr5-32-7200",
      name: "32 GB DDR5-7200 (2×16 GB)",
      price: 130,
      specs: {
        "Объём": "32 GB (2×16 GB, Dual Channel)",
        "Стандарт": "DDR5-7200",
        "Тайминги (CL)": "CL34",
        "Напряжение": "1.40 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    },
    {
      id: "ddr5-64-6000",
      name: "64 GB DDR5-6000 (2×32 GB)",
      price: 185,
      specs: {
        "Объём": "64 GB (2×32 GB, Dual Channel)",
        "Стандарт": "DDR5-6000",
        "Тайминги (CL)": "CL36",
        "Напряжение": "1.35 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    },
    {
      id: "ddr5-64-7200",
      name: "64 GB DDR5-7200 (2×32 GB)",
      price: 255,
      specs: {
        "Объём": "64 GB (2×32 GB, Dual Channel)",
        "Стандарт": "DDR5-7200",
        "Тайминги (CL)": "CL34",
        "Напряжение": "1.40 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    },
    {
      id: "ddr5-128-6400",
      name: "128 GB DDR5-6400 (4×32 GB)",
      price: 420,
      specs: {
        "Объём": "128 GB (4×32 GB, Quad Channel)",
        "Стандарт": "DDR5-6400",
        "Тайминги (CL)": "CL32",
        "Напряжение": "1.35 V",
        "Профиль": "XMP 3.0 / EXPO"
      }
    }
  ],

  // ─── ВИДЕОКАРТЫ ────────────────────────────────────────────────────────────
  gpus: [
    // ── NVIDIA GeForce RTX 50 Series (January 2025)
    {
      id: "rtx-5060",
      brand: "NVIDIA",
      name: "GeForce RTX 5060",
      price: 299,
      tdp: 150,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "8 GB GDDR7",
        "Шина памяти": "128-bit",
        "TDP": "150 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm (TSMC N4)"
      },
      badge: null
    },
    {
      id: "rtx-5060ti",
      brand: "NVIDIA",
      name: "GeForce RTX 5060 Ti",
      price: 429,
      tdp: 180,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "16 GB GDDR7",
        "Шина памяти": "128-bit",
        "TDP": "180 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm (TSMC N4)"
      },
      badge: null
    },
    {
      id: "rtx-5070",
      brand: "NVIDIA",
      name: "GeForce RTX 5070",
      price: 549,
      tdp: 250,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "12 GB GDDR7",
        "Шина памяти": "192-bit",
        "TDP": "250 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: null
    },
    {
      id: "rtx-5070ti",
      brand: "NVIDIA",
      name: "GeForce RTX 5070 Ti",
      price: 749,
      tdp: 300,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "16 GB GDDR7",
        "Шина памяти": "256-bit",
        "TDP": "300 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: "ЛУЧШИЙ ВЫБОР"
    },
    {
      id: "rtx-5080",
      brand: "NVIDIA",
      name: "GeForce RTX 5080",
      price: 999,
      tdp: 360,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "16 GB GDDR7",
        "Шина памяти": "256-bit",
        "TDP": "360 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: null
    },
    {
      id: "rtx-5090",
      brand: "NVIDIA",
      name: "GeForce RTX 5090",
      price: 1999,
      tdp: 575,
      specs: {
        "Архитектура": "Blackwell",
        "Видеопамять": "32 GB GDDR7",
        "Шина памяти": "512-bit",
        "TDP": "575 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: "АБСОЛЮТНЫЙ ТОП"
    },

    // ── AMD Radeon RX 9000 Series (2025)
    {
      id: "rx-9060xt",
      brand: "AMD",
      name: "Radeon RX 9060 XT",
      price: 349,
      tdp: 160,
      specs: {
        "Архитектура": "RDNA 4",
        "Видеопамять": "16 GB GDDR6",
        "Шина памяти": "128-bit",
        "TDP": "160 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm (TSMC N4)"
      },
      badge: null
    },
    {
      id: "rx-9070",
      brand: "AMD",
      name: "Radeon RX 9070",
      price: 499,
      tdp: 220,
      specs: {
        "Архитектура": "RDNA 4",
        "Видеопамять": "16 GB GDDR6",
        "Шина памяти": "256-bit",
        "TDP": "220 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: null
    },
    {
      id: "rx-9070xt",
      brand: "AMD",
      name: "Radeon RX 9070 XT",
      price: 599,
      tdp: 250,
      specs: {
        "Архитектура": "RDNA 4",
        "Видеопамять": "16 GB GDDR6",
        "Шина памяти": "256-bit",
        "TDP": "250 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: "Отличный AMD"
    },
    {
      id: "rx-9080",
      brand: "AMD",
      name: "Radeon RX 9080",
      price: 749,
      tdp: 300,
      specs: {
        "Архитектура": "RDNA 4",
        "Видеопамять": "32 GB GDDR6",
        "Шина памяти": "256-bit",
        "TDP": "300 W",
        "PCIe": "PCIe 5.0 x16",
        "Техпроцесс": "4 nm"
      },
      badge: null
    }
  ],

  // ─── НАКОПИТЕЛИ ───────────────────────────────────────────────────────────
  storage: [
    {
      id: "ssd-1tb-pcie4",
      name: "1 TB NVMe PCIe 4.0 SSD",
      price: 70,
      specs: {
        "Объём": "1 TB",
        "Интерфейс": "M.2 NVMe PCIe 4.0 x4",
        "Скорость чтения": "7,400 MB/s",
        "Скорость записи": "6,800 MB/s",
        "Форм-фактор": "M.2 2280"
      }
    },
    {
      id: "ssd-2tb-pcie4",
      name: "2 TB NVMe PCIe 4.0 SSD",
      price: 120,
      specs: {
        "Объём": "2 TB",
        "Интерфейс": "M.2 NVMe PCIe 4.0 x4",
        "Скорость чтения": "7,400 MB/s",
        "Скорость записи": "6,900 MB/s",
        "Форм-фактор": "M.2 2280"
      }
    },
    {
      id: "ssd-1tb-pcie5",
      name: "1 TB NVMe PCIe 5.0 SSD",
      price: 130,
      specs: {
        "Объём": "1 TB",
        "Интерфейс": "M.2 NVMe PCIe 5.0 x4",
        "Скорость чтения": "12,400 MB/s",
        "Скорость записи": "11,200 MB/s",
        "Форм-фактор": "M.2 2280"
      }
    },
    {
      id: "ssd-2tb-pcie5",
      name: "2 TB NVMe PCIe 5.0 SSD",
      price: 220,
      specs: {
        "Объём": "2 TB",
        "Интерфейс": "M.2 NVMe PCIe 5.0 x4",
        "Скорость чтения": "14,000 MB/s",
        "Скорость записи": "12,000 MB/s",
        "Форм-фактор": "M.2 2280"
      }
    },
    {
      id: "ssd-4tb-pcie5",
      name: "4 TB NVMe PCIe 5.0 SSD",
      price: 380,
      specs: {
        "Объём": "4 TB",
        "Интерфейс": "M.2 NVMe PCIe 5.0 x4",
        "Скорость чтения": "14,500 MB/s",
        "Скорость записи": "13,500 MB/s",
        "Форм-фактор": "M.2 2280"
      }
    }
  ],

  // ─── СИСТЕМЫ ОХЛАЖДЕНИЯ CPU ────────────────────────────────────────────────
  cooling: [
    {
      id: "air-budget",
      name: "Воздушный кулер 120 W (Thermalright Assassin X 120 SE)",
      price: 30,
      type: "air",
      maxTdp: 120,
      specs: {
        "Тип": "Воздушное охлаждение",
        "Рассеиваемая мощность": "до 120 W TDP",
        "Вентилятор": "120 mm PWM",
        "Уровень шума": "≤ 28 dBA",
        "Совместимость": "AM5, LGA1851, AM4, LGA1700"
      }
    },
    {
      id: "air-mid",
      name: "Воздушный кулер 180 W (Thermalright Peerless Assassin 120 SE)",
      price: 55,
      type: "air",
      maxTdp: 180,
      specs: {
        "Тип": "Воздушное охлаждение (башня с двумя вент.)",
        "Рассеиваемая мощность": "до 180 W TDP",
        "Вентиляторы": "2 × 120 mm PWM",
        "Уровень шума": "≤ 25 dBA",
        "Совместимость": "AM5, LGA1851, AM4, LGA1700"
      }
    },
    {
      id: "aio-240",
      name: "СЖО 240 мм (ASUS ROG STRIX LC II 240)",
      price: 90,
      type: "aio",
      maxTdp: 180,
      specs: {
        "Тип": "Система жидкостного охлаждения",
        "Радиатор": "240 мм",
        "Вентиляторы": "2 × 120 mm PWM ARGB",
        "Рассеиваемая мощность": "до 180 W TDP",
        "Совместимость": "AM5, LGA1851, AM4, LGA1700"
      }
    },
    {
      id: "aio-360",
      name: "СЖО 360 мм (NZXT Kraken Elite 360)",
      price: 140,
      type: "aio",
      maxTdp: 300,
      specs: {
        "Тип": "Система жидкостного охлаждения",
        "Радиатор": "360 мм",
        "Вентиляторы": "3 × 120 mm PWM ARGB",
        "Рассеиваемая мощность": "до 300 W TDP",
        "Совместимость": "AM5, LGA1851, AM4, LGA1700"
      }
    },
    {
      id: "aio-420",
      name: "СЖО 420 мм (be quiet! Silent Loop 3 420)",
      price: 200,
      type: "aio",
      maxTdp: 400,
      specs: {
        "Тип": "Система жидкостного охлаждения",
        "Радиатор": "420 мм",
        "Вентиляторы": "3 × 140 mm PWM",
        "Рассеиваемая мощность": "до 400 W TDP",
        "Уровень шума": "≤ 24 dBA (макс.)",
        "Совместимость": "AM5, LGA1851, AM4, LGA1700"
      }
    }
  ],

  // ─── БЛОКИ ПИТАНИЯ ─────────────────────────────────────────────────────────
  psus: [
    {
      id: "psu-650w",
      name: "650W 80+ Gold (Seasonic Focus GX-650)",
      price: 90,
      wattage: 650,
      specs: {
        "Мощность": "650 W",
        "Сертификация": "80+ Gold",
        "Модульность": "Fully Modular",
        "Разъём GPU": "1× PCIe 16-pin (600W ATX3.0)",
        "Гарантия": "10 лет"
      }
    },
    {
      id: "psu-750w",
      name: "750W 80+ Gold (Corsair RM750x)",
      price: 110,
      wattage: 750,
      specs: {
        "Мощность": "750 W",
        "Сертификация": "80+ Gold",
        "Модульность": "Fully Modular",
        "Разъём GPU": "2× PCIe 8-pin / 16-pin адаптер",
        "Гарантия": "10 лет"
      }
    },
    {
      id: "psu-850w",
      name: "850W 80+ Gold (be quiet! Straight Power 12)",
      price: 130,
      wattage: 850,
      specs: {
        "Мощность": "850 W",
        "Сертификация": "80+ Gold",
        "Модульность": "Fully Modular",
        "Разъём GPU": "2× PCIe 16-pin (ATX 3.0)",
        "Гарантия": "10 лет"
      }
    },
    {
      id: "psu-1000w",
      name: "1000W 80+ Gold (Seasonic Prime GX-1000)",
      price: 160,
      wattage: 1000,
      specs: {
        "Мощность": "1000 W",
        "Сертификация": "80+ Gold",
        "Модульность": "Fully Modular",
        "Разъём GPU": "2× PCIe 16-pin (ATX 3.0)",
        "Гарантия": "12 лет"
      }
    },
    {
      id: "psu-1200w",
      name: "1200W 80+ Platinum (ASUS ROG THOR 1200P2)",
      price: 210,
      wattage: 1200,
      specs: {
        "Мощность": "1200 W",
        "Сертификация": "80+ Platinum",
        "Модульность": "Fully Modular",
        "Разъём GPU": "3× PCIe 16-pin (ATX 3.0)",
        "Дисплей": "Встроенный OLED для мониторинга",
        "Гарантия": "10 лет"
      }
    },
    {
      id: "psu-1600w",
      name: "1600W 80+ Titanium (Corsair AX1600i)",
      price: 380,
      wattage: 1600,
      specs: {
        "Мощность": "1600 W",
        "Сертификация": "80+ Titanium",
        "Модульность": "Fully Modular Digital",
        "Разъём GPU": "4× PCIe 16-pin (ATX 3.0)",
        "Гарантия": "10 лет"
      }
    }
  ],

  // ─── КОРПУСА ───────────────────────────────────────────────────────────────
  cases: [
    {
      id: "case-lian-li-o11d",
      name: "Lian Li O11 Dynamic EVO (Mid Tower ATX)",
      price: 149,
      supports: ["ATX", "mATX", "ITX"],
      maxAioRadiator: 360,
      specs: {
        "Тип": "Mid Tower",
        "Форм-фактор MB": "ATX / mATX / Mini-ITX",
        "Отсеки 3.5\" / 2.5\"": "2 / 6",
        "Макс. радиатор": "360 mm (бок + верх + перед)",
        "Макс. высота CPU-кулера": "167 mm",
        "Tempered Glass": "Двойное"
      }
    },
    {
      id: "case-fractal-north",
      name: "Fractal Design North (Mid Tower ATX)",
      price: 109,
      supports: ["ATX", "mATX", "ITX"],
      maxAioRadiator: 360,
      specs: {
        "Тип": "Mid Tower",
        "Форм-фактор MB": "ATX / mATX / Mini-ITX",
        "Дизайн": "Деревянная передняя панель",
        "Макс. радиатор": "360 mm (верх) / 280 mm (перед)",
        "Макс. высота CPU-кулера": "169 mm",
        "Материал": "Сталь + дерево"
      }
    },
    {
      id: "case-nzxt-h7-flow",
      name: "NZXT H7 Flow (Mid Tower ATX)",
      price: 129,
      supports: ["ATX", "mATX", "ITX"],
      maxAioRadiator: 420,
      specs: {
        "Тип": "Mid Tower",
        "Форм-фактор MB": "ATX / mATX / Mini-ITX",
        "Макс. радиатор": "420 mm (верх) / 360 mm (перед)",
        "Макс. высота CPU-кулера": "185 mm",
        "USB-C на передней панели": "USB-C 3.2 Gen 2",
        "Tempered Glass": "Одностороннее"
      }
    },
    {
      id: "case-be-quiet-silent-7",
      name: "be quiet! Silent Base 802 (Full Tower E-ATX)",
      price: 179,
      supports: ["E-ATX", "ATX", "mATX", "ITX"],
      maxAioRadiator: 420,
      specs: {
        "Тип": "Full Tower",
        "Форм-фактор MB": "E-ATX / ATX / mATX / Mini-ITX",
        "Макс. радиатор": "420 mm (верх + перед)",
        "Звукоизоляция": "Панели с акустической набивкой",
        "Макс. высота CPU-кулера": "185 mm",
        "Отсеки 3.5\" / 2.5\"": "3 / 4"
      }
    },
    {
      id: "case-coolermaster-td500",
      name: "Cooler Master MasterBox TD500 Mesh V2 (Mid Tower ATX)",
      price: 89,
      supports: ["ATX", "mATX", "ITX"],
      maxAioRadiator: 360,
      specs: {
        "Тип": "Mid Tower",
        "Форм-фактор MB": "ATX / mATX / Mini-ITX",
        "Вентиляторы в комплекте": "3 × 120 mm ARGB",
        "Макс. радиатор": "360 mm (перед)",
        "Макс. высота CPU-кулера": "165 mm",
        "USB на передней панели": "2× USB 3.0, 1× USB-C"
      }
    }
  ]
};
