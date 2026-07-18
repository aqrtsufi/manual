# AQRT Manual content guide

## Manual

The English manual is stored as one plain-text file per PDF page:

```text
content/en/manual/pages/001.txt
...
content/en/manual/pages/085.txt
```

The table of contents is in:

```text
content/en/manual/toc.yml
```

The app reads the text exactly as stored. To replace the extracted text from an authorised PDF:

```bash
python scripts/extract-manual-text.py path/to/manual.pdf
```


## Allah’s 99 Beautiful Names

Edit:

```text
content/en/names/names.yml
```

Each entry uses:

```yaml
- number: 1
  arabic: "الرَّحْمَنُ"
  transliteration: "Ar-Rahmaan"
  meaning: "The Beneficent"
```

Keep the numbering unique and sequential from 1 through 99. The content validator stops the build if an entry is missing or blank. The reader displays one name at a time and supports swipe, arrow keys, navigation buttons and the range control.

## Daily quotes

Quote files are stored in:

```text
content/en/quotes/*.txt
```
The first non-empty line is the author for every quote in that file. The remaining text contains one or more quotes separated by empty lines.
```text
Author name

First quote.

Second quote.
```
The app pools every quote from every `.txt` file and selects one daily.
Quran selections
All English Quran selections are stored in:
```text
content/en/quran/verse.yml
```
```yaml
translator: "Translator name"
verses:
  - id: "2-152"
    sura: "Al Baqara"
    verse: "152"
    text: "Verse translation."
    featured: true
```
The home page displays `Sura name:verse number` and the translator beneath the selected verse.



## Gregorian and Diyanet events

Edit:

```text
content/events/events.yml
```

Gregorian example:

```yaml
- id: "event-id"
  title: ""
  calendar: "gregorian"
  date: "2026-01-09"
  start: "2026-01-09T19:00:00"
  timezone: "America/New_York"
  url: ""
```

Diyanet Islamic-date example:

```yaml
- id: "event-id"
  title: ""
  calendar: "diyanet"
  hijriDay: 12
  hijriMonth: "Rebiülevvel"
  startTime: "19:00"
  timezone: "America/New_York"
  url: ""
```

The browser converts timed events to the visitor's local timezone.

## YouTube links

Edit:

```text
content/en/videos/videos.txt
```

One line per link:

```text
Name | https://www.youtube.com/embed/VIDEO_ID?start=120&end=480
```

Both start and end values stay inside the saved link. Lines beginning with `#` are ignored.

## Weekly pages

Add files using these names:

```text
content/en/weekly/2026-W29-summary.md
content/en/weekly/2026-W29-assignment.md
content/en/weekly/2026-W29-contemplation.md
```

The newest week is selected automatically for each button.

## Weekly activities

Edit:

```text
content/en/activities/activities.yml
```

Format:

```yaml
- week: "2026-W29"
  title: ""
  url: ""
```

## Future translations

The folders are already present:

```text
content/fr
content/de
content/es
```

Mirror the English folder structure. A language becomes selectable automatically when translated content files are present.
