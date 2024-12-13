# Backend Setup Instructions

This document explains how to set up the backend for this project, including creating a Google Service Account, linking it to a Google Calendar, and configuring the necessary environment variables.

## Step 1: Create a Google Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **IAM & Admin > Service Accounts**.
4. Click **Create Service Account**.
5. Enter a name for the service account and click **Create and Continue**.
6. Skip the optional permissions and user access steps by clicking **Done**.

## Step 2: Generate a JSON Key for the Service Account

1. In the Service Accounts list, locate the newly created service account.
2. Click the **Actions** menu (three dots) and select **Manage Keys**.
3. Click **Add Key > Create New Key**.
4. Select **JSON** as the key type and download the key file.
5. Rename the JSON file to `service-account.json` and place it in the `backend` directory of this project.

## Step 3: Share Your Calendar with the Service Account

1. Open [Google Calendar](https://calendar.google.com/).
2. Go to the settings of the calendar you want to use.
3. In the **Share with specific people or groups** section, add the **client email** from the `service-account.json` file.
4. Grant **Make changes to events** permission and save.

## Step 4: Configure Environment Variables

1. In the `backend` directory, create a `.env` file.
2. Add the following line, replacing `YOUR_CALENDAR_ID` with the actual calendar ID (e.g., `primary` for the default calendar):
   ```env
   CALENDAR_ID=YOUR_CALENDAR_ID
   ```

## Final Notes

- Ensure the `service-account.json` file is **not tracked** by version control by confirming it's listed in `.gitignore`.
- The backend will use this setup to authenticate with Google Calendar and fetch events.

If you encounter any issues, consult the [Google Calendar API documentation](https://developers.google.com/calendar) or seek assistance from the project maintainer.
