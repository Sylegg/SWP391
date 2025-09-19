# API Integration Documentation

## Backend APIs Connected

Tôi đã tích hợp thành công các API backend vào frontend:

### 🎯 API Endpoints Đã Kết Nối

1. **Login API**
   - **Endpoint**: `POST /api/auth/login`
   - **Port**: 6969
   - **Request**: 
     ```json
     {
       "identifier": "email@example.com",
       "password": "password123"
     }
     ```
   - **Response**: 
     ```json
     {
       "token": "jwt_token",
       "refreshToken": "refresh_token", 
       "username": "user_name",
       "role": "USER_ROLE"
     }
     ```

2. **Register API**
   - **Endpoint**: `POST /api/auth/register`
   - **Request**:
     ```json
     {
       "username": "Họ và tên",
       "phone": "0901234567",
       "email": "email@example.com", 
       "address": "",
       "password": "password123",
       "confirmPassword": "password123"
     }
     ```
   - **Response**: String confirmation message

3. **Admin Register API**
   - **Endpoint**: `POST /api/auth/registerAdmin`
   - **Same structure as register**

### 🔧 Files Modified

1. **`/lib/api.ts`** - ⭐ NEW FILE
   - AuthAPI class với các method login/register
   - Error handling
   - Token management
   - Type-safe interfaces

2. **`/contexts/AuthContext.tsx`** - ✅ UPDATED
   - Removed mock data
   - Integrated real API calls
   - Proper error handling
   - Token storage

3. **`/app/login/page.tsx`** - ✅ UPDATED
   - Removed demo accounts
   - Added backend connection indicator
   - Real authentication flow

4. **`/.env.local`** - ✅ UPDATED
   - Added API_BASE_URL configuration

### 🚀 How to Use

1. **Start Backend Server**:
   ```bash
   cd SWP391_be-main
   mvn spring-boot:run
   ```
   Server will run on: `http://localhost:6969`

2. **Start Frontend**:
   ```bash
   cd frontend2
   npm run dev
   ```
   Frontend will run on: `http://localhost:3000`

3. **Test Authentication**:
   - Go to `/login`
   - Create a new account using the Register tab
   - Or use existing accounts from your database
   - Login with created credentials

### 🎨 Features Implemented

✅ **Real API Integration**
- No more mock data
- Actual backend communication
- JWT token handling

✅ **Error Handling**
- Network errors
- Authentication failures
- User-friendly error messages

✅ **Security**
- Token-based authentication
- Secure token storage
- Automatic token cleanup on logout

✅ **Type Safety**
- TypeScript interfaces for all API calls
- Proper type checking
- IntelliSense support

### 🔐 Authentication Flow

1. User enters credentials
2. Frontend calls `AuthAPI.login()`
3. Backend validates and returns JWT token
4. Frontend stores token and user data
5. User is redirected to appropriate dashboard
6. Token is included in subsequent API calls

### 🐛 Troubleshooting

- **CORS Issues**: Make sure backend allows frontend origin
- **Connection Failed**: Check if backend is running on port 6969
- **Token Errors**: Check JWT configuration in backend
- **Role Mapping**: Verify role names match between frontend/backend

### 📝 Next Steps

1. **Test with Database**: Create users in your database
2. **Role-based Routing**: Test different user roles
3. **Token Refresh**: Implement automatic token refresh
4. **Password Reset**: Add forgot password functionality
5. **Profile Management**: Connect user profile APIs