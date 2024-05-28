/*
Tapki Online mod by DosX

Телеграм => @DosX_Plus
*/

const dev = ["log", "info", "warn", "error", "debug"].reduce((obj, method) => { // Процедура упрощения создания логов через stdConsole ( ... )
    obj[method] = (...args) => stdConsole(method, ...args); // Создаем свойство с именем, соответствующим текущему элементу массива method, его значением является стрелочная функция (ей передаётся всё содержимое аргументов)
    return obj; // Возвращаем объект obj для использования в следующей итерации цикла reduce
}, {});

function stdConsole(functionName, message) { // Обнуление и вызов процедур вывода логов console.*
    if (!isNative(console[functionName])) window.console = ((document.body.appendChild(document.createElement("iframe"))).style.display = "none").contentWindow.console;
    console[functionName](message);
}

function isNative(f) { // Процедура проверки функций на нативность
    return !!f && (typeof f).toLowerCase() == "function" &&
        (f === Function.prototype ||
            /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(f)));
}

function measureTime(func, ...args) {
    const start = performance.now();
    func(...args);
    const end = performance.now();
    dev.log(`Функция выполнялась ${end - start} миллисекунд`);
}

function formatNumber(inNumber) { return inNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
function getRandomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRandomArrayElement(arr) { return arr[getRandomNumber(0, arr.length - 1)]; }
function getMainDomain(url) { return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('.').slice(-2).join('.'); }

const root = document.location.href.split("/")[3],
    mainServer = root == 'play', testServer = root == 'browser-public';

if (getMainDomain(document.domain) == 'tankionline.com' &&
    (mainServer || testServer)) {

    if (testServer) document.title += " ( !!!! Тестовый сервер !!!! )"

    document.title += " (modded with Tapki Online by DosX)"

    let langParam = localStorage.getItem("language_store_key");
    if (langParam && langParam !== "RU") {
        alert("Включите русский язык для корректной работы Tapki Online!");
    }

    function replaceText(patternSearch, patternReplace) {
        for (const aTag of document.querySelectorAll("span, h1, h2, h3, p, label")) {
            if (aTag.textContent.toLowerCase() === patternSearch.toLowerCase()) {
                aTag.textContent = patternReplace;
                return;
            }
        }
    }

    (async () => {
        dev.log("TAPKI ONLINE LOADED! :)"); // Модификация загружена

        setInterval(() => { updateMenuElements(); }, 100);

        setInterval(() => { updatePlayButtonText() }, 1200);

        setInterval(() => { updateUITexts(); }, 35);
    })();


    function updateMenuElements() {

        [
            {
                element: document.getElementsByClassName("UserInfoContainerStyle-blockForIconTankiOnline")[0],
                newSource: "<span style=\"color: white; font-family: RubikRegular; font-size: 1.8vw;\"><b>ТАПКИ ОНЛАЙН" + testServer ? ": ТЕСТ!" : "" + "</b></span>"
            },
            {
                element: document.getElementsByClassName("StartScreenComponentStyle-loadingBlock")[0],
                newSource: "<span style=\"color: white; font-family: RubikRegular; font-size: 22px;\">Тыкай любую кнопочку</span>"
            },
            {
                element: document.getElementById("loading-text"),
                newSource: "ЗАГРУЗОЧКА ТАНКЕСКИ"
            }
        ].forEach(({ element, newSource }) => {
            if (element && element.innerHTML !== newSource) {
                element.innerHTML = newSource;
            }
        });

        const languageParam = document.getElementsByClassName("DropDownStyle-dropdownControl")[0];
        if (languageParam) {
            try {
                const languageControl = languageParam.querySelector("div div span");
                if (languageControl.innerText.includes("Русский")) {
                    languageParam.style = "pointer-events: none;";
                    languageControl.innerText = "Модифицированный язык (Тапки Онлайн)";
                }
            } catch (exc) { }
        }

    }

    /*
    TODO:
        LobbyLoaderComponentStyle-logo (src="https://tankionline.com/play/static/images/logo.e64f36db.svg"), custom logo
    */

    function updatePlayButtonText() {
        const playButtonContainer = document.getElementsByClassName("MainScreenComponentStyle-playButtonContainer")[0],
            newStyle = "font-size: 1.5vw; text-align: center;";
        if (playButtonContainer) {
            const playButton = playButtonContainer.querySelector("span");
            if (playButton.style !== newStyle) playButton.style = newStyle;
            playButton.innerText = getRandomArrayElement([
                "Нагибать",
                "Уничтожать",
                "Править миром",
                "Почувствовать превосходство",
                "Играть",
                "В бой!",
                "За маму и папу",
                "За родину",
                "Я готов",
                "Ты сможешь",
                "Где раки зимуют?",
                "Проявить себя",
                "Служить Ореху",
                "На поля сражений"
            ]);
        }
    }

    function updateUITexts() {
        try {
            const dictionary = {
                "контейнеры": "Ящички",
                "миссии": "Задачки",
                "гараж": "Дом, милый дом",
                "магазин": "За покупочками",
                "настройки": "Настроечки",
                "челленджи": "Квестик",
                "загрузка": "Загрузочка любимых танчиков...",
                "пушка": "Пушечка",
                "корпус": "Корпусик",
                "защита": "Резистики",
                "новости": "Новенькое",
                "быстрый бой": "Быстренько поиграть",
                "режимы": "Режимчики",
                "захват флага": "Тряпочки",
                "регби": "Мячики",
                "джаггернаут": "Нагибашка",
                "контроль точек": "Захвати и убеги",
                "штурм": "Атакуй или защити",
                "pro-битвы": "Пофаниться",
                "паркур": "Пинать болт",
                "рельсы": "Лазерное шоу",
                "осада": "Побороться за точку",
                "специальный режим": "Отпразновать",
                "танкоины": "Монетки",
                "купить боевой пропуск": "Купить пропуск квестика",
                "купить": "Ладно, давайте",
                "играниченные предложения": "Спецухи",
                "обучение": "Нубикам",
                "выйти из игры?": "Выйти из танчиков?",
                "премиум отсутствует": "А у тебя премки нет :(",
                "следующая подсказка": "Ещё подсказочку",
                "дроны": "Самолётики",
                "пушки": "Пушечки",
                "корпуса": "Корпусики",
                "краски": "Раскрасочки",
                "закрыть": "Уберись",
                "отмена": "Передумал",
                "игра": "Игрулька",
                "графика": "Графончик",
                "аккаунт": "Аккаунтик",
                "победа!": "УРА УРА УРА",
                "поражение": "У-у-у...",
                "премиум аккаунт": "Премка",
                "кристаллы": "Крисы",
                "витрина": "Нара и прочий мусор",
                "скидки отсутствуют": "Ничё нет :(",
                "золотые ящики": "Голды",
                "комплекты": "Комплектики",
                "ядерная энергия": "Ядерный жмых",
                "ремкомплект": "Аптека",
                "повышенная защита": "Броня посильнее",
                "повышенный урон": "Ящик пельменей",
                "ускорение": "Буст",
                "мина": "Какашка",
                "\"ремкомплект\" ": "\"Аптека\" ",
                "\"повышенная защита\" ": "\"Броня посильнее\" ",
                "\"повышенный урон\" ": "\"Ящик пельменей\" ",
                "\"ускорение\" ": "\"Буст\" ",
                "\"мина\" ": "\"Какашка\" ",
                "золотой ящик": "Голд",
                "n2-бомба": "Пульт от ядерки",
                "хорнет": "Хорёк",
                "мамонт": "Жиробас",
                "скаут-радар": "WallHack",
                "сбой": "Опять эти ошибки >:O",
                "подробнее": "Давай больше инфы",
                "bfg-пушка": "Протухший апельсин",
                "васп": "Малявка",
                "хоппер": "Летак",
                "огнемёт": "Жига",
                "рельса": "Реля",
                "подрывной прыжок": "Прыг",
                "установить": "Приклеить на супер клей момент",
                "установлено": "Приклеено супер клеем",
                "купить товар": "Мам, ну купи",
                "характеристики": "Характы",
                "забрать": "Забрать божий дар",
                "забрать награду": "Забрать божий дар",
                "выполнить": "Заслужить",
                "выполнено": "Забрано",
                "ничья": "Победила дружба",
                "купить премиум": "Дать деньги ореху за премку",
                "недоступно": "Заплати налог!",
                "друзья": "Друзяшки",
                "завершено": "А уже всё",
                "улучшить": "Проапгрейдить",
                "способ оплаты": "Выберите способ потерять деньги",
                "пожалуйста, выберите наиболее удобный для вас способ оплаты":
                    "Пожалуйста, выберите наиболее удобный для вас способ проспонсировать Ореха",
                "ультраконтейнеры": "Ультраконты",
                "подсказка": "Назойливая подсказка",
                "все миссии выполнены": "Ты выполнил все заданочки, молодец!",
                "контейнер": "Ящик с хламом",
                "открыть": "Распахнуть",
                "возможные награды": "Возможные награды, но из всего этого тебе выпадет только мусор",
                "/скины": "/Скинчики",
                "снять все": "Снять с себя всё это",
                "снять": "Скинуть с себя",
                "звёзды": "Звёздочки",
                "подтвердить": "Я согласен",
                "сбросить все": "Верните всё обратно :(",
                "смоки": "Смока",
                "бесплатно": "Прожиточный минимум",
                "боевой пропуск": "Премия",
                "временно недоступно": "Ё-маё! Тут ничего нет",
                "командный бой": "Пиу-пиу бах-бах командами",
                "скрыть свой рейтинг": "Стыдиться своего рейтинга",
                "включить": "А давай",
                "ok": "Окей",
                "не хватает танкоинов": "Монеток нет",
                "подтверждение покупки": "А ты точно хочешь это?",
                "ваш выбор": "Ты выбрал...",
                "в сети": "Играет в танчики",
                "бонус за вход в игру": "Подарок за красивые глазки",
                "сменить": "Ну такое, давай дальше",
                "следующая миссия": "Следующая заданка",
                "max": "фулл",
                "меню паузы": "Менюшка",
                "друзья в сети": "Друзяшки в сети",
                "показать все": "Чекнуть все",
                "назад": "Вернуться",
                "далее": "Дальше...",
                "покупка произведена успешно": "Ты успешно потратился!",
                "ограниченные предложения": "Крутые ништяки",
                "специальные предложения": "Спецухи",
                "продано": "Ты это забрал себе",
                "звук": "Звучание",
                "нажимая на кнопку «подтвердить», вы подтверждаете покупку за кристаллы":
                    "Нажимая кнопку «Я согласен», ты подтверждаешь спуск кристаллов в трубу",
                "цена: ": "Цена с учётом НДС: ",
                "список битв": "Список битвочек",
                "выбери битву": "Выбери битвочку",
                "уничтожения": "Киллов",
                "поддержка": "Помощь товарищам",
                "клан": "Кланчик",
                "гаусс": "Гусь",
                "закрытая битва": "Приватка",
                "ящики с бонусами": "Дары Ореха с небес",
                "улучшения": "Апгрейды",
                "овердрайвы": "Оверки",
                "припасы": "Нара",
                "создание битвы": "Создание битвочки",
                "ваша награда": "Забирай этот клам",
                "пригласить друга": "Созвать друзяшек",
                "вернуться в игру [P]": "Э, возвращайся! [P]",
                "твой танк уже ждет тебя: ": "Твой танчик уже соскучился. Кик через ",
                "покинуть битву": "Ливнуть отсюда",
                "поиск битвы": "Жди, жди...",
                "новое звание": "Поздравляем с новой званкой!",
                "вы собираетесь купить": "Ты собираешься потратиться на",
                "изида": "Изя",
                "рикошет": "Рик",
                "среднее время ожидания": "Примерный тайминг",
                "текущее время ожидания": "Ты уже ждёшь",
                "новый аккаунт": "Зарегаться",
                "авторизация": "Войти в свой акк",
                "игровой аккаунт": "Акк Танчиков",
                "авторизуйся через": "Войди в акк Танчиков"
            };

            Object.entries(dictionary).forEach(([key, value]) => {
                replaceText(key, value);
            });


        } catch (exc) {
            dev.error(`*(Tanki Offline) ${exc}`);
        }
    }
}

document.addEventListener("keydown", function (event) { // Shift + [F || А (кириллица)]
    if (event.ctrlKey && event.shiftKey && (event.key === "F" || event.key === "А")) {
        hideData();
    }
});

let hidden = false;
function hideData() {
    if (confirm("Визуально скрыть данные аккаунта? (для анонимного скриншота)\n\nДля отключения функции перезайдите в игру.")) {
        if (!hidden) {
            hidden = true;
            setInterval(() => {
                const elements = document.querySelectorAll(".UserScoreComponentStyle-blockRightPanel .ksc-0, .BreadcrumbsComponentStyle-rightButtonsContainer .ksc-0");

                [0, 3].forEach(element => { // 0 = кристаллы; 3 = танкоины
                    if (elements[element]) elements[element].innerText = formatNumber(getRandomNumber(1, 9999999));
                });

                let playerInfo = document.getElementsByClassName("UserInfoContainerStyle-textDecoration");
                playerInfo[0].innerText = playerInfo[0].innerText.split("|")[0] + `| ${Math.random().toString(36).substring(2)}`;
                playerInfo[1].innerText = `${formatNumber(getRandomNumber(1, 2222222))} / ${formatNumber(getRandomNumber(2222222, 9999999))}`;

            }, 500)
        } else {
            alert("Данные уже скрыты.");
        }
    }
}
