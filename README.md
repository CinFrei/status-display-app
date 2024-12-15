# Status Display App

This project is a status display application consisting of two main parts:

- **Frontend**: Angular application
- **Backend**: Node.js with Express.js

### Project Structure

- **Frontend**: Located in the `frontend` directory. The frontend is built using Angular and interacts with the backend API.
- **Backend**: Located in the `backend` directory. The backend is built with Node.js and Express.js, handling the logic for data processing and API communication.

For detailed setup and configuration instructions, refer to the `README.md` files in the respective directories:

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

### Environment Variables

Both the frontend and backend require environment variables to be configured before starting the project. Instructions for creating and managing the environment files can be found in the individual `README.md` files:

- **Frontend**: See the [frontend/README.md](frontend/README.md) for details on configuring environment variables.
- **Backend**: See the [backend/README.md](backend/README.md) for details on configuring environment variables.

### Project Setup and Start

1. **Install Dependencies**  
   First, install the required dependencies for both the frontend and backend. Run the following commands from the root directory:

   ```bash
   npm install
   ```

This will install dependencies for both the frontend and backend.

2. **Start the Backend Server**
   Navigate to the backend directory and start the server with nodemon:

```bash
cd backend
npm run dev
```

(If error: Make sure nodemon is installed as a dev dependency, or install it globally using npm install -g nodemon)

3. **Start the Frontend Development Server**
   Navigate to the frontend directory and start the Angular development server:

```bash
cd ../frontend
ng serve
```

Once both servers are running, the application will be accessible in your browser at http://localhost:4200/.

### Additional Information

For further details on how to work with the Angular frontend, please refer to the [frontend/README.md](frontend/README.md).

For further details on how to work with the Node.js/Express.js backend, please refer to the [backend/README.md](backend/README.md).

Dieses Projekt nutzt einen angepassten Fork von [Kindle Touch Kiosk](https://github.com/bishopdynamics/kindle-touch-kiosk), der unter der MIT-Lizenz veröffentlicht wurde.
