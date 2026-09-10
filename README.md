# TasteForge - Full-Stack Unified Restaurant & Cloud Kitchen Platform

> A full-stack unified restaurant and cloud kitchen platform featuring smart table ordering, real-time KDS, and automated inventory.

TasteForge is a robust, full-stack unified backend architecture designed for modern restaurants and cloud kitchens. It bridges the gap between self-service kiosks, smart table ordering, and real-time kitchen operations, providing a seamless flow from order placement to inventory deduction.

## 🚀 Key Features & Modules

*   **Unified Order Processing (Omnichannel):** Dual-flow session management supporting direct customer self-service (Kiosks/Smart Tables) and Waiter-assisted offline orders.
*   **Real-Time KDS (Kitchen Display System):** WebSocket-powered (Socket.io) interactive dashboards for chefs. Order states (Pending ➔ Preparing ➔ Cooked) sync instantly across the network without manual page reloads.
*   **Automated Inventory & Spoilage Tracking:** Dynamic raw material deduction triggered automatically when a chef marks an order as 'Cooked'. Includes manual kitchen spoilage logging.
*   **Custom Build & Dynamic Billing Engine:** Server-side calculation of multi-layered custom meals, variants (Adult/Child portions), and automated Tax/VAT addition to prevent frontend data tampering.
*   **Advanced RBAC & Security:** JWT-based Role-Based Access Control separating environments for Admin/Owner, Chefs, Cashiers, Waiters, and Customers.
*   **Anti-Spam & Payment Verification:** Strict 5-minute order cancellation window, automated strike systems for spam prevention, and a dedicated Cashier dashboard for "Cash on Counter" Token/OTP verification.

## 💻 Tech Stack

**Frontend:**
*   React.js / Next.js (UI & Client Logic)
*   Tailwind CSS (Styling)
*   Redux Toolkit / Context API (State Management)

**Backend & Database:**
*   Node.js & Express.js (RESTful API Architecture)
*   MongoDB & Mongoose (Database & ODM)
*   Socket.io (Real-time bidirectional communication)
*   Bcrypt.js & JSON Web Tokens (Security & Authentication)

## 🔮 Future Scope (v2.0)
The backend architecture is pre-configured to easily scale and adapt future modules:
*   **Online Delivery System:** Expanding the `orderType` schema to support remote delivery addresses.
*   **Payment Gateway Integration:** Direct integration with Stripe/SSLCommerz for online payments.
*   **AI Analytics:** Machine learning models for predicting peak hours and inventory restocking alerts based on historical order data.

## ⚙️ Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/tasteforge-unified-core.git](https://github.com/your-username/tasteforge-unified-core.git)