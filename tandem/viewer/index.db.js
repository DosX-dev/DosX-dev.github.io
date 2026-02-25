/**
 * Tandem Portfolio Viewer — Engine v1.0
 * База данных сайтов для просмотра в Gallery
 *
 * Формат записи:
 * {
 *   id:          уникальный номер (int)
 *   title:       заголовок проекта
 *   description: краткое описание
 *   path:        путь до index.html проекта (относительно корня)
 * }
 */

const TANDEM_SITES = [
    {
        id: 0,
        title: "Главная",
        description: "Добро пожаловать в Tandem Portfolio Viewer! Выберите проект из галереи для просмотра.",
        path: "home/index.html"
    },
    {
        id: 1,
        title: "Сайт юриста Владимира",
        description: "Сайт юриста с акцентом на профессионализм и надежность",
        path: "works/example-lawyer/index.html"
    },
    {
        id: 2,
        title: "ЧОО «Астра»",
        description: "Охранное агентство с акцентом на безопасность и надежность",
        path: "works/example-astra/index.html"
    }, {
        id: 3,
        title: "Страница программы «JSTD AI»",
        description: "Анализатор JavaScript кода с помощью искусственного интеллекта",
        path: "works/example-jstd/index.html"
    },
    {
        id: 4,
        title: "Сайт флориста Анастасии",
        description: "Сайт флориста с акцентом на атмосферу и стиль",
        path: "works/example-florist/index.html"
    },
    {
        id: 5,
        title: "Дизайнер Евгений Демидов",
        description: "Портфолио графического дизайнера — Photoshop, брендинг, motion",
        path: "works/example-designer/index.html"
    },
    {
        id: 6,
        title: "ArcVPN — Свободный интернет",
        description: "VPN-клиент с обходом ТСПУ — YouTube, Discord, Instagram из РФ",
        path: "works/example-vpn/index.html"
    },
    {
        id: 7,
        title: "Кондитер Виктория — Сладкий момент",
        description: "Авторские торты ручной работы — свадебные, детские и муссовые десерты в г. Тандем",
        path: "works/example-cakes/index.html"
    },
];
