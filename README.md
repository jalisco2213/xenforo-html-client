# xenforo-html-client

JavaScript-клиент для работы с форумами на движке XenForo через парсинг HTML. Библиотека предоставляет инструменты для обхода антибот-защиты, получения данных о темах, постах, участниках и категориях.

---

## Установка

```bash
npm install github:jalisco2213/xenforo-html-client
```

### Зависимости

| Пакет | Назначение |
|---|---|
| `axios` | HTTP-запросы |
| `cheerio` | Парсинг HTML |
| `https-proxy-agent` | Поддержка HTTPS-прокси |
| `socks-proxy-agent` | Поддержка SOCKS-прокси |
| `vm2` | Безопасное выполнение JS в sandbox |

---

## Быстрый старт

```js
const xenforo = require('xenforo-html-client');

// Настройка базового URL форума
xenforo.configure({ baseUrl: 'https://forum.example.com' });

// Обход антибот-защиты
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...';
const antibot = await xenforo.bypassAntibot(userAgent);

console.log(antibot.cookie);     // Значение cookie для дальнейших запросов
console.log(antibot.userAgent);  // User-Agent, использованный при обходе
```

---

## Конфигурация

### `configure(options)`

Устанавливает глобальные настройки библиотеки.

**Параметры:**

| Параметр | Тип | Описание |
|---|---|---|
| `options.baseUrl` | `string` | Базовый URL форума (например, `https://forum.example.com`) |

**Возвращает:** объект `{ baseUrl: string }`

```js
xenforo.configure({ baseUrl: 'https://forum.example.com' });
```

Базовый URL также можно задать через переменную окружения:

```bash
XENFORO_BASE_URL=https://forum.example.com
```

---

### `getBaseUrl(value?)`

Возвращает текущий базовый URL. Приоритет источников:

1. Значение, переданное напрямую в аргументе `value`
2. Значение, установленное через `configure()`
3. Переменная окружения `XENFORO_BASE_URL`

Если ни один источник не задан — выбрасывает ошибку.

```js
const url = xenforo.getBaseUrl(); // 'https://forum.example.com'
```

---

### `normalizeBaseUrl(value)`

Приводит URL к стандартному виду: убирает пробелы и завершающие слеши.

```js
xenforo.normalizeBaseUrl('https://forum.example.com///');
// → 'https://forum.example.com'
```

---

## Обход антибот-защиты

### `bypassAntibot(userAgent, proxy?, baseUrl?)`

Выполняет обход антибот-системы форума (R3ACTLAB-ARZ1). Загружает страницу форума, извлекает зашифрованные коды из HTML и расшифровывает их с помощью алгоритма AES, после чего формирует корректное значение cookie.

**Параметры:**

| Параметр | Тип | По умолчанию | Описание |
|---|---|---|---|
| `userAgent` | `string` | — | User-Agent для HTTP-запроса |
| `proxy` | `string` | `null` | URL прокси-сервера (опционально) |
| `baseUrl` | `string` | `null` | Переопределение базового URL (опционально) |

**Поддерживаемые форматы прокси:**
- `http://host:port` — HTTP/HTTPS-прокси
- `socks5://host:port` — SOCKS5-прокси
- `socks4://host:port` — SOCKS4-прокси

**Возвращает:** `Promise<{ cookie: string, userAgent: string }>`

| Поле | Описание |
|---|---|
| `cookie` | Строка вида `R3ACTLAB-ARZ1=<value>; expires=...`, готовая к подстановке в заголовок `Cookie` |
| `userAgent` | User-Agent, использованный при запросе |

**Пример без прокси:**

```js
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
);

console.log(antibot.cookie);
// R3ACTLAB-ARZ1=abc123...; expires=Thu, 31-Dec-37 23:55:55 GMT; path=/
```

**Пример с SOCKS5-прокси:**

```js
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 ...',
  'socks5://127.0.0.1:9050'
);
```

**Пример с HTTP-прокси и явным baseUrl:**

```js
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 ...',
  'http://proxy.example.com:8080',
  'https://forum.example.com'
);
```

**Выбрасывает:** `Error` с сообщением `Error bypassing antibot: <причина>`, если обход не удался.

---

## Использование полученного cookie

После вызова `bypassAntibot` полученное значение cookie нужно объединить с остальными сессионными cookie форума и передавать в заголовке `Cookie` при каждом последующем запросе:

```js
const antibot = await xenforo.bypassAntibot(userAgent);
const antibotValue = antibot.cookie.split(';')[0]; // Только значение, без expires/path

const cookie = antibotValue
  + '; xf_csrf=<ваш_csrf_токен>'
  + '; xf_session=<ваш_session_токен>'
  + '; xf_user=<ваш_user_токен>';

const response = await axios.get('https://forum.example.com/forums/1/', {
  headers: {
    'User-Agent': userAgent,
    'Cookie': cookie
  }
});
```

---

## Модели данных

Библиотека экспортирует классы-модели для удобного представления объектов форума.

### `Thread` — тема форума

```js
const { Thread } = require('xenforo-html-client');

const thread = new Thread({
  threadId: 123,
  title: 'Заголовок темы',
  author: 'username',
  date: '2024-01-15T10:00:00Z',
  categoryId: 5,
  posts: [],
  replyCount: 42,
  isLocked: false
});
```

**Свойства объекта:**

| Свойство | Тип | Описание |
|---|---|---|
| `id` | `number` | ID темы |
| `title` | `string` | Заголовок темы |
| `author` | `string` | Автор темы |
| `date` | `Date` | Дата создания (объект `Date`) |
| `category` | `number` | ID категории |
| `posts` | `Array` | Массив постов (по умолчанию `[]`) |
| `replyCount` | `number` | Количество ответов |
| `isLocked` | `boolean` | Заблокирована ли тема |

---

### `Post` — пост в теме

```js
const { Post } = require('xenforo-html-client');

const post = new Post({
  postId: 456,
  creator: 'username',
  htmlContent: '<p>Текст поста</p>',
  createDate: '2024-01-15T11:00:00Z',
  thread: 123,
  textContent: 'Текст поста'
});
```

**Свойства объекта:**

| Свойство | Тип | Описание |
|---|---|---|
| `id` | `number` | ID поста |
| `author` | `string` | Автор поста |
| `content` | `string` | HTML-содержимое поста |
| `date` | `string` | Дата создания |
| `thread` | `number` | ID темы, к которой относится пост |
| `textContent` | `string` | Текстовое содержимое (без HTML) |

---

### `Member` — участник форума

```js
const { Member } = require('xenforo-html-client');

const member = new Member({
  userId: 789,
  username: 'john_doe',
  role: 'Модератор',
  roles: ['Модератор', 'VIP'],
  messageCount: 1500,
  reactionScore: 320,
  trophyPoints: 75,
  lastActivity: '2024-01-15T12:00:00Z'
});
```

**Свойства объекта:**

| Свойство | Тип | Описание |
|---|---|---|
| `id` | `number` | ID пользователя |
| `username` | `string` | Никнейм |
| `role` | `string` | Основная роль |
| `roles` | `Array` | Все роли пользователя |
| `messageCount` | `number` | Количество сообщений |
| `reactionScore` | `number` | Счёт реакций |
| `trophyPoints` | `number` | Очки трофеев |
| `lastActivity` | `string` | Время последней активности |

---

### `Category` — категория форума

```js
const { Category } = require('xenforo-html-client');

const category = new Category({
  categoryId: 1,
  title: 'Общий раздел',
  description: 'Обсуждение общих тем'
});
```

**Свойства объекта:**

| Свойство | Тип | Описание |
|---|---|---|
| `id` | `number` | ID категории |
| `title` | `string` | Название категории |
| `description` | `string` | Описание категории |

---

## Обработка ошибок

### `IncorrectLoginData`

Выбрасывается при неверных данных авторизации.

```js
const { IncorrectLoginData } = require('xenforo-html-client');

try {
  // ... операция с авторизацией
} catch (err) {
  if (err instanceof IncorrectLoginData) {
    console.error('Неверный логин или пароль');
  }
}
```

### `ThisIsYouError`

Выбрасывается при попытке выполнить действие над собственным профилем (например, подписаться на себя).

```js
const { ThisIsYouError } = require('xenforo-html-client');

try {
  // ...
} catch (err) {
  if (err instanceof ThisIsYouError) {
    console.error('Нельзя выполнить это действие над собственным профилем');
  }
}
```

---

## Тестовый файл

Чтобы быстро проверить работу библиотеки, создайте файл `test.cjs` и вставьте в него код ниже. Замените значения cookie своими — их можно скопировать из браузера (DevTools → Application → Cookies).

```js
require('dotenv').config();
const xenforo = require('xenforo-html-client');

xenforo.configure({ baseUrl: process.env.XENFORO_BASE_URL });

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 OPR/86.0.4363.64';

async function main() {
    const antibot = await xenforo.bypassAntibot(userAgent);
    const antibotValue = antibot.cookie.split(';')[0];

    const cookie = antibotValue
        + '; xf_csrf=<ваш_xf_csrf>'
        + '; xf_session=<ваш_xf_session>'
        + '; xf_tfa_trust=<ваш_xf_tfa_trust>'
        + '; xf_user=<ваш_xf_user>';

    console.log('Всё готово!');
    console.log('Cookie:', cookie);
}

main().catch(console.error);
```

**Запуск:**

```bash
node test.cjs
```

**Ожидаемый вывод:**

```
Всё готово!
Cookie: R3ACTLAB-ARZ1=abc123...; xf_csrf=... ; xf_session=...
```

---

## Переменные окружения

| Переменная | Описание |
|---|---|
| `XENFORO_BASE_URL` | Базовый URL форума. Используется как fallback, если `configure()` не вызывался |

Рекомендуется использовать файл `.env` совместно с пакетом `dotenv`:

```bash
XENFORO_BASE_URL=https://forum.example.com
```

```js
require('dotenv').config();
const xenforo = require('xenforo-html-client');
// baseUrl подхватится автоматически из переменной окружения
```

---

## Экспортируемое API

```js
const {
  configure,          // Функция настройки
  getBaseUrl,         // Получение базового URL
  normalizeBaseUrl,   // Нормализация URL
  bypassAntibot,      // Обход антибот-защиты
  IncorrectLoginData, // Класс ошибки: неверные данные входа
  ThisIsYouError,     // Класс ошибки: действие над собственным профилем
  Category,           // Модель категории
  Member,             // Модель участника
  Thread,             // Модель темы
  Post                // Модель поста
} = require('xenforo-html-client');
```