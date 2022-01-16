CBIC Exchange Rate API
----------------------

Firebase hosted API to fetch and cache exchange rates from [CBIC][CBIC] and cache them in firestore.

## Why?

Because opening the website and scrolling PDF every time is not what programmers do.
They instead waste 4 hours writing a script to automate 30 mins of their life.

## How to use

Host it on your own firebase project.

Steps:

- `npm i -g firebase-tools`

- `firebase login`

- `firebase init`

   This will add a .firebaserc file based on which project you chose
   
- `firebase deploy`

   This will need Blaze plan for your firebase project, but don't worry it only bill a tiny amount (< $1)

- The firebase functions URl should be in console, in form: `https://<region>-<project id>.cloudfunctions.net/rate`

- Call `$ http get https://<region>-<project id>.cloudfunctions.net/rate/date/<DD-MM-YYYY>`

  *Note: Fetching details for a new year will take some time, after which it will be instant*

  *Note2: For current year, if it detects any new PDF is added, it will index the whole year again. This can be improved, PRs welcome*

### Use in Google Sheets

Add this in your App script

```
function CBICRate(ddmmyyyy) {
  const url = 'https://<region>-<project id>.cloudfunctions.net/rate/date/' + ddmmyyyy;
  const response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  const json = response.getContentText();
  const data = JSON.parse(json);
  return data.eRate;
}
```

And use it as `=CBICRate(B59)`

## License

ISC

[CBIC]: https://www.cbic.gov.in/Exchange-Rate-Notifications
