# covid19-sequencing
COVID-19 sequencing dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build and Deploy

Please use `npm run deploy` to build the project with production
configuration. The build artifacts will be stored in the `docs/` directory.

We use a special branch `gh-pages` to host the static files for
Github Pages, so `docs/` directory should NOT be commited.

Whenever a Pull Request is approved and merged into `master`
branch, a Github Action will be triggered to:

- push the updated artifacts to `gh-pages` branch.
- deploy the latest website to its destination, which is hosted by Github Pages.


## Set Up Cors
1. [Get an authorization token from the google OAuth 2.0 playground](https://developers.google.com/oauthplayground/) - Select Access Approval, then select https://www.googleapis.com/auth/cloud-platform
2. submit curl request to update CORS policy:

```
curl --request PATCH \
 'https://storage.googleapis.com/storage/v1/b/cdc-covid-surveillance-broad-dashboard' \
 --header 'Authorization: Bearer [OAUTH2_TOKEN]' \
 --header 'Content-Type: application/json' \
 --data-binary @cors-policy.json
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
