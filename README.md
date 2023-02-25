## U-Me-Chan :: flooder
Шутка, чтобы обхитрить Хому

## Внутреннее устройство программы
![Диаграмма](https://github.com/U-Me-Chan/flooder/blob/main/scheme.excalidraw.png?raw=true)

## Установка
```shell
git clone https://github.com/U-Me-Chan/flooder.git && \
cd flooder && \
yarn install --frozen-lockfile && \
yarn db:clientgen && \
yarn db:migrate
```

## Запуск
```shell
yarn start
```

## Куда класть свои *.txt с корпусами
В директорию `corpus`, там есть уже есть парочка txt-файлов. При старте сервис не будет их читать, только при запуске процесса кравлинга.

Ещё есть директория `corpus-reserv`, из неё тоже происходит чтение, однако туда складывают корпуса network-кравлеры, просто как копию.

## API-endpoints
По-дефолту запускается и слушает на 3030 порту, http://localhost:3030/
```
- Генерирует текст:
  GET /

- Генерирует дерево текстов:
  GET /tree

- Запускает процесс кравлинга:
  GET /crawler/run
```
