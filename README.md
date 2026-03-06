# Expense Tracker

A full-stack web application for tracking income and expenses. Built with Node.js/Express backend and React/TypeScript frontend.

## Features

- 📊 Track income and expense transactions
- 💰 Categorized financial management
- 📈 Visual financial overview
- 🔄 Real-time updates
- 📱 Responsive design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Database** - Configured in db/db.js

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS / CSS Modules** - Styling

## Project Structure

```
EXPENSE/
├── backend/
│   ├── app.js                 # Main server file
│   ├── package.json           # Backend dependencies
│   ├── controllers/
│   │   ├── Expense.js         # Expense logic
│   │   └── Income.js          # Income logic
│   ├── routes/
│   │   └── transactions.js    # API routes
│   ├── models/
│   │   ├── ExpenseModel.js    # Expense schema
│   │   └── IncomeModel.js     # Income schema
│   └── db/
│       └── db.js              # Database connection
├── frontend/
│   ├── package.json           # Frontend dependencies
│   ├── src/
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # Entry point
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context for state
│   │   ├── styles/
│   │   │   └── Globalstyl.js  # Global styles
│   │   └── utils/             # Utility functions
│   └── package-lock.json
└── README.md                  # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure your database connection in `db/db.js`

4. Start the server:
```bash
npm start
```
The backend server will run on `http://localhost:5000` (or your configured port)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```
The frontend will open at `http://localhost:3000`

## Usage

1. **Add Income**: Record income transactions with details
2. **Add Expense**: Log expense transactions with categories
3. **View Dashboard**: See your financial overview
4. **Manage Transactions**: Edit or delete transactions as needed

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/income` - Add income
- `POST /api/transactions/expense` - Add expense
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is open source and available to use.

## Support

For issues or questions, please open an issue in the repository.
