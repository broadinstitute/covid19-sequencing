# covid19-sequencing
COVID-19 sequencing dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

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
