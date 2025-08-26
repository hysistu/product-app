# Product App - Next.js Authentication

A modern Next.js 15 application with secure JWT authentication, connected to an Express.js backend.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with automatic token refresh
- 🎨 **Modern UI**: Beautiful, responsive design built with Tailwind CSS
- 🚀 **Next.js 15**: Built with the latest Next.js features and React 19
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🔒 **Protected Routes**: Automatic redirection for unauthenticated users
- 💾 **Local Storage**: Persistent authentication state
- 📝 **Form Validation**: Client-side validation with Yup and React Hook Form

## Prerequisites

- Node.js 18+
- Your Express.js backend running on `http://localhost:4000`

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd product-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Connection

This app is configured to connect to your Express.js backend at `http://localhost:4000`. Make sure your backend server is running and has the following endpoints:

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Expected Response Format

```json
{
  "message": "Success message",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "fullName": "John Doe",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Product Management

The app now includes comprehensive product management with:

- **Product CRUD Operations**: Create, read, update, and delete products
- **Category Management**: Add, edit, and delete product categories
- **Advanced Filtering**: Search by name, filter by category, brand, price range, and stock status
- **Pagination**: Handle large product catalogs efficiently
- **Stock Management**: Track product quantities with real-time updates

### Key Features Added

1. **Products List Page** (`/products`)

   - View all products with advanced filtering
   - Search functionality
   - Pagination support
   - Quick access to product details

2. **Product Creation** (`/products/create`)

   - Comprehensive product form
   - Category selection
   - Support for tags, images, and specifications
   - Form validation

3. **Product Details** (`/products/[id]`)

   - Complete product information
   - Image gallery
   - Stock status and pricing
   - Metadata and specifications

4. **Category Management** (`/categories`)
   - Create, edit, and delete categories
   - Category descriptions
   - Bulk category operations

## App Structure

```
src/
├── app/
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── dashboard/      # Protected dashboard
│   ├── layout.tsx      # Root layout with AuthProvider
│   └── page.tsx        # Landing page
├── components/
│   └── ProtectedRoute.tsx  # Route protection component
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── lib/
    └── api.ts             # API service functions
```

## Usage

### 1. Landing Page (`/`)

- Welcome page with navigation to login/register
- Automatically redirects authenticated users to dashboard
- Shows backend connection information

### 2. Registration (`/register`)

- Create new user account
- Form validation for all fields
- Password confirmation
- Automatic login after successful registration

### 3. Login (`/login`)

- Sign in with existing credentials
- Form validation
- Error handling for invalid credentials
- Redirects to dashboard on success

### 4. Dashboard (`/dashboard`)

- Protected route (requires authentication)
- Shows user profile information
- Quick action buttons
- Logout functionality
- Displays last login time

## Authentication Flow

1. **Registration**: User fills form → API call to backend → JWT token received → User logged in
2. **Login**: User provides credentials → API call to backend → JWT token received → User logged in
3. **Protected Routes**: Check authentication → Redirect to login if not authenticated
4. **API Calls**: Automatic token inclusion in headers
5. **Token Expiration**: Automatic logout and redirect to login
6. **Logout**: Clear local storage → API call to backend → Redirect to login

## Styling

The app uses Tailwind CSS for styling with:

- Responsive design patterns
- Modern color schemes (indigo/blue for primary, emerald/green for success)
- Smooth transitions and hover effects
- Consistent spacing and typography
- Shadow effects and rounded corners

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables are required for the frontend. The backend URL is hardcoded to `http://localhost:4000` in `src/lib/api.ts`.

### Customization

- **Backend URL**: Update `API_BASE_URL` in `src/lib/api.ts`
- **Styling**: Modify Tailwind classes in component files
- **Validation**: Update Yup schemas in form components
- **Routes**: Add new protected routes using the `ProtectedRoute` component

## Security Features

- JWT tokens stored in localStorage
- Automatic token inclusion in API requests
- Token expiration handling
- Protected route components
- Form validation and sanitization
- Secure logout process

## Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure your Express.js server is running on port 4000
2. **CORS Issues**: Make sure your backend allows requests from `http://localhost:3000`
3. **Authentication Loop**: Check that your JWT tokens are valid and not expired
4. **Form Validation Errors**: Verify that all required fields are filled correctly

### Debug Mode

Check the browser console for detailed error messages and API response information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
