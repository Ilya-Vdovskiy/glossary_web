# Глоссарий по зарубежной литературе XIX века

Next.js-сайт для учебного глоссария НовГУ. Сайт читает готовые JSON-файлы из `src/data`; Word-документы используются только на этапе разового парсинга.

## Команды

```bash
npm install
npm run parse:glossary
npm run dev
```

Откройте `http://localhost:3000`.

## Данные

- термины и источники: `terminy.docx` -> `src/data/glossary.json`
- научная часть: `nauka_glossariy.docx`
- ГОСТы и часть литературы: `gosty_and_spisok.docx`
- источники: `istockhniky.docx`
- рецензия: `retsenzia.docx`
- дополнительные материалы: `src/data/support-documents.json`

После генерации JSON сайт больше не обращается к `.docx` во время работы.
