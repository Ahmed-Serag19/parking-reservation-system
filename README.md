


# 🅿️ Parking Reservation System – Frontend

A production-ready frontend application for managing parking reservations with **real-time updates**, built using **modern React technologies**.

![Parking Reservation System](./parking-reservation-diagram.png)

See [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) for detailed architecture information.
---

##  Live Demo

- **Gate Check-in**: `http://localhost:5173/gate/gate_1`  
- **Employee Checkpoint**: `http://localhost:5173/checkpoint` (Login: `emp1` / `pass1`)  
- **Admin Dashboard**: `http://localhost:5173/admin` (Login: `admin` / `adminpass`)  

---

##  Features

### Gate Screen – Check-in
- Visitor & Subscriber parking flows  
- Real-time zone availability (WebSocket)  
- Printable tickets  
- Fully responsive (mobile, tablet, desktop)  

### Employee Checkpoint – Checkout
- Ticket lookup with debounced input  
- Subscription plate verification with override option  
- Detailed time-based breakdown  

### Admin Dashboard – Control Panel
- Real-time parking state reports  
- Zone and rate management  
- Rush hours & vacation rate configuration  
- Live audit log of admin actions  
- Employee account management  

---

##  Tech Stack

- **Framework**: React 18 + Vite  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS + shadcn/ui  
- **State Management**: Zustand + React Query  
- **Forms & Validation**: React Hook Form + Zod  
- **Real-time**: Native WebSocket  
- **Testing**: Vitest + React Testing Library  

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+  
- npm or yarn  
- Backend server running on `http://localhost:3000`  

### Installation
```bash
git clone <repository-url>
cd parking-reservation-system
npm install
npm run dev
````

The app will be available at: `http://localhost:5173`

---

## 📱 User Flows

* **Gate Check-in** → Select zone → Print ticket → Park
* **Employee Checkout** → Lookup ticket → Verify plate → Process payment
* **Admin Dashboard** → Monitor zones → Manage rates → Configure rush/vacation periods

---

##  Testing

```bash
npm test           # Run all tests
npm run test:ui    # Run tests with UI
npm run test:coverage # Run with coverage report
```

Test coverage includes:

* Gate check-in flows
* Employee checkout validation
* Admin dashboard controls & real-time updates

---

##  Documentation

* [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
* [Backend Endpoint Coverage](./BACKEND_STATUS.md)

---

##  Deployment

```bash
npm run build
npm run preview
```

Build output will be in `dist/`, deployable to Vercel, Netlify, AWS S3, or Docker.

---

## 🎯 Highlights

* 100% feature-complete frontend
* Real-time WebSocket integration
* Responsive, accessible UI (WCAG 2.1 AA)
* Robust error handling & offline caching
* Comprehensive test coverage

---

## 📄 License

MIT License

```


