# CouponManager

## Project Overview  
CouponManager is a web application that allows users to create, manage, and track promotional coupons. It provides a dashboard to generate coupon codes, monitor their usage, and analyze redemption statistics — making it easy for businesses to run campaigns efficiently.

## Tech Stack  
- **Language & Framework**: JavaScript / TypeScript with **Next.js** (or React, whichever you're using)  
- **Backend**: Node.js (or API layer)  
- **Database**: (e.g., PostgreSQL / Supabase / MongoDB — adjust as per your setup)  
- **Authentication**: (e.g., Supabase Auth / JWT)  
- **Styling**: Tailwind CSS (or your CSS framework)  
- **Utilities / Libraries**:  
  - Axios or Fetch for HTTP requests  
  - SWR or React Query for data fetching (if used)  
  - Formik / React Hook Form (if you use it for forms)  
  - Chart.js / Recharts (if you have analytics dashboards)  

## How to Run  

### Prerequisites  
- **Node.js** (version ≥ 14.x or as required)  
- (Optional) **npm** or **yarn**  
- (If using) Supabase / Database credentials / `.env` setup  

### Setup Steps  
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/couponmanager.git
   cd couponmanager
   
2. Install dependencies:
   ```bash
    npm install  
    # or  
    yarn install  

3. Configure environment variables:
Copy .env.example to .env
Fill in your database URL, API keys, Supabase keys, etc.

4. Running the Application
To start the development server:

npm run dev  
# or  
yarn dev  

Visit http://localhost:3000 (or whichever port you’re using) in your browser to access the app.
