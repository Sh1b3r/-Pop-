document.addEventListener('DOMContentLoaded', () => {
    // Елементи меню (Sidebar)
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('mobile-sidebar');
    const navCenter = document.getElementById('desktop-nav');
    const headerRight = document.getElementById('desktop-controls'); // Права частина хедера
    
    // Елементи теми
    const body = document.body;
    const desktopThemeSwitch = document.getElementById('theme-switch');
    const favicon = document.getElementById('favicon');


    // Шляхи до логотипів (та інших елементів, що змінюють атрибути)
    const logoLightSrc = 'photo_5312278550180203579_y.png'; // Світлий логотип (для light-theme)
    const logoDarkSrc = 'photo_5357473601977782586_y.png'; // Темний логотип (для dark-theme)

    // Disney logos (swap depending on theme)
    const disneyBlackSrc = 'disneyblack.png';
    const disneyWhiteSrc = 'disneywhite.png';
    // Stitch-specific Disney logos
    const disneyStitchLightSrc = 'Disney_Stitch_logo.png';
    const disneyStitchDarkSrc = 'Disney_Stitch_logo (1).png';

    // ======================================================================
    // НОВИЙ ПУНКТ (ДОДАНО): КОНФІГУРАЦІЯ ЕЛЕМЕНТІВ, ЧУТЛИВИХ ДО ТЕМИ
    // 
    // Щоб додати новий елемент, чутливий до теми:
    // 1. Додайте атрибут data-theme-aware="[ваше-ім'я]" до елемента в HTML.
    // 2. Додайте конфігурацію в об'єкт themeAwareElements нижче.
    //
    // Приклад:
    // <img id="logoday" data-theme-aware="logo" src="...">
    // 
    // Конфігурація:
    // logo: {
    //   light: (el) => { el.src = logoLightSrc; }, 
    //   dark: (el) => { el.src = logoDarkSrc; }
    // }
    // ======================================================================

    const themeAwareElements = {
        // Конфігурація для елементу з data-theme-aware="logo" (наприклад, #logoday)
        logo: {
            // Дія при застосуванні світлої теми
            light: (el) => { 
                el.src = logoLightSrc; 
            },
            // Дія при застосуванні темної теми
            dark: (el) => { 
                el.src = logoDarkSrc; 
            }
        },
        // Конфігурація для Disney логотипу в продукті
        disney: {
            light: (el) => { el.src = disneyBlackSrc; },
            dark: (el) => { el.src = disneyWhiteSrc; }
        },
        // Конфігурація для Stitch logo swap
        'disney-stitch': {
            light: (el) => { el.src = disneyStitchLightSrc; },
            dark: (el) => { el.src = disneyStitchDarkSrc; }
        },
        // ПРИКЛАД для будь-якого іншого елемента, який змінює клас/атрибут
        // newElement: {
        //     light: (el) => { el.classList.remove('shadow-dark'); el.classList.add('shadow-light'); },
        //     dark: (el) => { el.classList.remove('shadow-light'); el.classList.add('shadow-dark'); }
        // }
    };
    // 1. КЛОНУВАННЯ КОНТЕНТУ ДЛЯ САЙДБАРУ (Логіка слайд-меню)
    
    // Перевірка існування елементів перед клонуванням
    if (navCenter && headerRight && sidebar) {
        // Клонування навігації
        const navClones = navCenter.cloneNode(true);
        navClones.classList.remove('nav-center');
        navClones.style.display = 'flex';
        navClones.style.flexDirection = 'column';
        navClones.style.gap = '20px';
        sidebar.appendChild(navClones);

        // Клонування елементів керування (включно з перемикачем теми)
        const controlsClone = headerRight.cloneNode(true);
        controlsClone.classList.remove('header-right');
        controlsClone.style.display = 'flex';
        controlsClone.style.flexDirection = 'column';
        controlsClone.style.gap = '20px';
        controlsClone.style.alignItems = 'flex-start';
        sidebar.appendChild(controlsClone);

        // Отримуємо мобільний світчер після клонування
        const mobileThemeSwitch = controlsClone.querySelector('#theme-switch');
        
        // 2. ФУНКЦІЯ ЗАСТОСУВАННЯ ТЕМИ (МОДИФІКОВАНО)
        const applyTheme = (isDark) => {
            const theme = isDark ? 'dark' : 'light';
            const oppositeTheme = isDark ? 'light' : 'dark';

            // 2.1. Основні класи на <body>
            body.classList.remove(`${oppositeTheme}-theme`);
            body.classList.add(`${theme}-theme`);
            if (favicon) {
            favicon.href = isDark ? logoDarkSrc : logoLightSrc;
            }
            
            // 2.2. Оновлення стану перемикачів
            if (desktopThemeSwitch) desktopThemeSwitch.checked = isDark;
            if (mobileThemeSwitch) mobileThemeSwitch.checked = isDark;

            // 2.3. ДИНАМІЧНА ОБРОБКА ЕЛЕМЕНТІВ, ЧУТЛИВИХ ДО ТЕМИ
            // Знаходимо всі елементи з атрибутом data-theme-aware
            const themeElements = document.querySelectorAll('[data-theme-aware]');
            
            themeElements.forEach(el => {
                const configKey = el.getAttribute('data-theme-aware'); // Отримуємо ключ конфігурації
                const config = themeAwareElements[configKey]; // Отримуємо об'єкт конфігурації
                
                if (config) {
                    // Викликаємо відповідну функцію для поточної теми
                    if (isDark && typeof config.dark === 'function') {
                        config.dark(el);
                    } else if (!isDark && typeof config.light === 'function') {
                        config.light(el);
                    }
                }
            });

            // 2.4. Збереження теми
            localStorage.setItem('theme', theme);
        };

        // 3. ІНІЦІАЛІЗАЦІЯ ТЕМИ (Завантаження) (МОДИФІКОВАНО)
        let storedTheme = localStorage.getItem('theme');
        // Якщо тема ще не збережена, використовуємо клас на <body> (наприклад index.html може мати статичний dark-theme)
        if (!storedTheme) {
            const bodyIsDark = body.classList.contains('dark-theme');
            storedTheme = bodyIsDark ? 'dark' : 'light';
            localStorage.setItem('theme', storedTheme);
        }
        let isDark = storedTheme === 'dark';

        // Встановлюємо початкові класи та стан перемикачів
        applyTheme(isDark);


        // 4. ОБРОБНИК ЗМІНИ ТЕМИ: викликається при зміні будь-якого перемикача (НЕЗМІННО)
        const handleSwitchChange = (e) => {
            // Оскільки applyTheme оновлює обидва світчера, достатньо викликати його один раз
            applyTheme(e.target.checked);
        }

        // 5. НАЛАШТУВАННЯ СЛУХАЧІВ ДЛЯ ТЕМИ (НЕЗМІННО)
        if (desktopThemeSwitch) {
            desktopThemeSwitch.addEventListener('change', handleSwitchChange);
        }
        if (mobileThemeSwitch) {
            // Оскільки це клонований елемент, ми додаємо слухача до нього
            mobileThemeSwitch.addEventListener('change', handleSwitchChange);
        }

        // 6. ЛОГІКА САЙДБАРУ (НЕЗМІННО)
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                sidebar.classList.toggle('active');
                menuBtn.classList.toggle('active');
            });
        }

        // Закриття бічної панелі при кліку поза нею
        document.addEventListener('click', (e) => {
            const isClickInsideSidebar = sidebar && sidebar.contains(e.target);
            const isClickOnMenuButton = menuBtn && menuBtn.contains(e.target);
            
            if (sidebar && menuBtn && sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnMenuButton) {
                sidebar.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });

        // При переході на сторінки авторизації, зберігаємо поточну тему — це гарантує, що
        // якщо головна сторінка використовує статичний клас (наприклад body.dark-theme),
        // сторінки login/register отримають правильну стилізацію.
        document.querySelectorAll('a[href$="login.html"], a[href$="register.html"], a#authorization-link').forEach(link => {
            link.addEventListener('click', () => {
                const curTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                localStorage.setItem('theme', curTheme);
            });
        });
    } else {
        // Якщо елементи слайд-меню відсутні, ініціалізуємо тільки тему (мінімальна версія)
        
        // 2. ФУНКЦІЯ ЗАСТОСУВАННЯ ТЕМИ (МОДИФІКОВАНО для мінімальної версії)
        const applyThemeSimple = (isDark) => {
            const theme = isDark ? 'dark' : 'light';
            const oppositeTheme = isDark ? 'light' : 'dark';
            
            body.classList.remove(`${oppositeTheme}-theme`);
            body.classList.add(`${theme}-theme`);
            if (favicon) {
            favicon.href = isDark ? logoDarkSrc : logoLightSrc;
            }
            
            // 2.3. ДИНАМІЧНА ОБРОБКА ЕЛЕМЕНТІВ
            const themeElements = document.querySelectorAll('[data-theme-aware]');
            
            themeElements.forEach(el => {
                const configKey = el.getAttribute('data-theme-aware');
                const config = themeAwareElements[configKey];
                
                if (config) {
                    if (isDark && typeof config.dark === 'function') {
                        config.dark(el);
                    } else if (!isDark && typeof config.light === 'function') {
                        config.light(el);
                    }
                }
            });
            
            if (desktopThemeSwitch) desktopThemeSwitch.checked = isDark;
            localStorage.setItem('theme', theme);
        };

        // 3. ІНІЦІАЛІЗАЦІЯ ТЕМИ (МОДИФІКОВАНО для мінімальної версії)
        let storedTheme = localStorage.getItem('theme');
        if (!storedTheme) {
            const bodyIsDark = body.classList.contains('dark-theme');
            storedTheme = bodyIsDark ? 'dark' : 'light';
            localStorage.setItem('theme', storedTheme);
        }
        let isDark = storedTheme === 'dark';
        applyThemeSimple(isDark);

        // 4. + 5. НАЛАШТУВАННЯ СЛУХАЧА (МОДИФІКОВАНО для мінімальної версії)
        if (desktopThemeSwitch) {
            desktopThemeSwitch.addEventListener('change', (e) => applyThemeSimple(e.target.checked));
        }
    }
});

const track = document.getElementById('carouselTrack');
const btnNext = document.querySelector('.carousel-btn.next');
const btnPrev = document.querySelector('.carousel-btn.prev');

let position = 0;
let cardWidth = 0;
let originalCount = 0;
let autoScroll;

document.addEventListener('DOMContentLoaded', () => {
    // Выбираем все возможные контейнеры для прокрутки
    const scrollContainers = document.querySelectorAll('.products, .carousel-container, .products-container, .carousel-track');

    scrollContainers.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false;
        
        // Переменные для инерции
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;
        let animationId = null;

        // Базовые настройки стиля для свободной прокрутки
        slider.style.cursor = 'grab';
        slider.style.userSelect = 'none'; 
        slider.style.webkitUserSelect = 'none';
        slider.style.overflowX = 'auto';
        
        // Полностью отключаем привязку к слайдам для "свободного" эффекта
        slider.style.scrollSnapType = 'none';
        slider.style.scrollBehavior = 'auto';

        // Отключаем стандартное перетаскивание ссылок и картинок
        const preventDefaultDrag = (e) => e.preventDefault();
        slider.querySelectorAll('img, a').forEach(el => {
            el.addEventListener('dragstart', preventDefaultDrag);
        });

        // Функция инерции (Momentum Scrolling)
        const beginMomentum = () => {
            if (Math.abs(velocity) < 0.2) return; // Порог остановки
            
            slider.scrollLeft -= velocity;
            velocity *= 0.95; // Коэффициент замедления (0.95 = долгий выкат)
            animationId = requestAnimationFrame(beginMomentum);
        };

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            slider.style.cursor = 'grabbing';
            
            // Останавливаем текущую анимацию инерции при клике
            cancelAnimationFrame(animationId);

            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            
            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
        });

        slider.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            slider.style.cursor = 'grab';
            beginMomentum();
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            
            if (isDragging) {
                // Блокируем клик, если было движение
                const preventClick = (event) => {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    slider.removeEventListener('click', preventClick, true);
                };
                slider.addEventListener('click', preventClick, true);
                beginMomentum();
            }
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX); 
            
            // Если сдвиг заметный, активируем режим перетаскивания
            if (Math.abs(walk) > 3) {
                isDragging = true;
                e.preventDefault();
                slider.scrollLeft = scrollLeft - walk;
                
                // Расчет мгновенной скорости для инерции
                const currentTime = Date.now();
                const timeElapsed = currentTime - lastTime;
                if (timeElapsed > 0) {
                    const distance = e.pageX - lastX;
                    velocity = distance / (timeElapsed / 16); 
                    lastX = e.pageX;
                    lastTime = currentTime;
                }
            }
        });
    });
});