# Status-Display-App für Kindle Touch E-Ink

## Overview

This application enables the display of status information on a Kindle Touch E-Ink display. It combines:

- **An Angular frontend app**, to display the status data in an organized manner.
- **A Node.js backend with Express.js**, which processes and provides the necessary data.
- **A Kiosk mode**, based on the helpful Docker VNC Kiosk server by [BishopDynamics](https://github.com/bishopdynamics/kindle-touch-kiosk).

## Acknowledgements

The VNC Kiosk Server `vnc-kiosk-server-custom` is based on the original [VNC Kiosk Server by BishopDynamics](https://github.com/bishopdynamics/kindle-touch-kiosk/tree/main/docker-vnc-kiosk-server).

**Modifications**:

- The password was changed (the original developer used 'badpass' as a placeholder).
- Some parts of the Docker Compose configuration were removed or adjusted to simplify the setup.

## Installation

### 1. **Prerequisites**:

- **A Kindle Touch with E-Ink display** (Instructions for converting a Kindle into a VNC monitor can be found at [MobileReads](https://wiki.mobileread.com/wiki/K5_Index), or comfortable at [BishopDynamics kindle-touch-kiosk](https://github.com/bishopdynamics/kindle-touch-kiosk/tree/main)).
- **Docker**, to run the app and the Kiosk.
- **Google Calendar API** service account API to use your calendar.
- **Lat, Long and TimeZone**, for weather an time.
- **Node.js and Angular**, for app development (if desired).

### 2. **Steps**:

- ### backend

  - Create an **Google Service Api Code** and connect it to your **personal calendar** [Google Calendar API Setup Guide](./google-calendar-setup-guide.md)
  - Create in `status-display-app-backend` an `.env` with these vars:
    ```js
    CALENDAR_ID=123example@group.calendar.google.com
    MOON_CALENDAR_ID=123example@group.calendar.google.com
    BIRTHSDAYS_CALENDAR_ID=123example@group.calendar.google.com
    ```
  - Create in `status-display-app-backend` an `service-account.json` with these vars:
    ```json
    {
      "type": "service_account",
      "project_id": "#",
      "private_key_id": "#",
      "private_key": "#",
      "client_email": "#",
      "client_id": "#",
      "auth_uri": "#",
      "token_uri": "#",
      "auth_provider_x509_cert_url": "#",
      "client_x509_cert_url": "#",
      "universe_domain": "#"
    }
    ```

- ### frontend

  - Create in `status-display-app-frontend/src/environments` an `environment.production.ts` with these vars:

    ```typescript
    export const environment = {
      production: true,
      latitude: "#",
      longitude: "#",
      timezone: "#",
      backendCalendarUrl: "http://backend:3000/api/calendar",

      PERSON1_EMAIL: "#",
      PERSON2_EMAIL: "#",
      HOUSEHOLD_CALENDAR_MAIL: "#",
      BIRTHDAY_CALENDAR_MAIL: "#",
      HOLIDAY_CALENDAR_MAIL: "#",
      MOON_CALENDAR_MAIL: "#",
    };
    ```

  - Create in `status-display-app-frontend/src/environments` an `environment.ts` with these vars:

    ```typescript
    export const environment = {
      production: true,
      latitude: "#",
      longitude: "#",
      timezone: "#",
      backendCalendarUrl: "http://localhost:3000/api/calendar",

      PERSON1_EMAIL: "#",
      PERSON2_EMAIL: "#",
      HOUSEHOLD_CALENDAR_MAIL: "#",
      BIRTHDAY_CALENDAR_MAIL: "#",
      HOLIDAY_CALENDAR_MAIL: "#",
      MOON_CALENDAR_MAIL: "#",
    };
    ```

- ### kiosk
  - Create in `vnc-kiosk-server-custom` an `vnc_password.txt` with your password:
    ```js
    badpass;
    ```

## Start

In root write in shell

```shell
docker compose up --build
```

## License

The [frontend](./status-display-app-frontend/) `status-display-app-frontend` and [backend](./status-display-app-backend/) `status-display-app-backend` components of this project are licensed under the [MIT License](https://en.wikipedia.org/wiki/MIT_License#License_terms).
See the LICENSE file for details. ©CinFrei.

The [kiosk](./vnc-kiosk-server-custom/) `vnc-kiosk-server-custom` is based on the publicly shared code by [BishopDynamics](https://github.com/bishopdynamics/kindle-touch-kiosk). Modifications include changes to the password, the addition of a landscape extension and adjustments to the Docker Compose configuration.
