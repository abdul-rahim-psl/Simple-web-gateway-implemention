# Streaming Gateway Architecture Project

A learning project demonstrating the **API Gateway pattern** using Next.js, TypeScript, and REST APIs. This project implements a distributed system with three interconnected services that showcase how modern microservices communicate through a centralized gateway.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     SENDER      │    │   MIDDLEWARE    │    │    RECEIVER     │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │    UI     │  │    │  │  Gateway  │  │    │  │ Processor │  │
│  │ Component │  │<───┼─>│  Service  │<─┼────┼─>│  Service  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│POST /api/forward│    │POST /api/process│    │POST /api/process│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                  
                                    
                                 
                         ┌───────▼────────┐
                         │  Data Flow:    │
                         │ 1. Text Input  │
                         │ 2. Forward     │
                         │ 3. Process     │
                         │ 4. Reverse     │
                         │ 5. Return      │
                         └────────────────┘
```

## 🎯 What is an API Gateway?

An **API Gateway** is a server that acts as an intermediary between clients and backend services. It serves as a single entry point for multiple microservices, providing several benefits:

### Why Use an API Gateway?
1. **Simplified Client Logic**: Clients don't need to know about multiple service endpoints
2. **Cross-Cutting Concerns**: Handle authentication, logging, rate limiting in one place
3. **Service Evolution**: Backend services can change without affecting clients
4. **Performance**: Can implement caching, request/response transformation
5. **Security**: Single point to implement security policies

## 🚀 Implementation Details

This project demonstrates a simplified gateway pattern with three services:

### 1. **Sender Service** (Frontend + API)
- **Purpose**: User interface and request originator
- **Technology**: Next.js with React frontend
- **Features**:
  - Text input form with configurable destination URLs
  - Real-time response display
  - Error handling and loading states
- **API Endpoint**: `POST /api/forward`

### 2. **Middleware Service** (API Gateway)
- **Purpose**: Acts as the gateway/proxy service
- **Technology**: Next.js API routes
- **Features**:
  - Receives requests from sender
  - Routes requests to receiver service
  - Handles error propagation
  - Response aggregation and transformation
- **API Endpoint**: `POST /api/process`

### 3. **Receiver Service** (Backend Processor)
- **Purpose**: Business logic processing
- **Technology**: Next.js API routes
- **Features**:
  - Receives text from middleware
  - Reverses the string (business logic)
  - Returns processed result
- **API Endpoint**: `POST /api/process`

## 📊 Data Flow

1. **User Input**: User enters text in the Sender UI
2. **Forward Request**: Sender calls `POST /api/forward` with text and destination URL
3. **Gateway Routing**: Middleware receives request and forwards to Receiver
4. **Processing**: Receiver reverses the string and returns result
5. **Response Chain**: Result flows back through Middleware to Sender
6. **Display**: Sender displays the processed result to user

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: REST APIs with fetch()
- **Deployment**: Vercel (Production)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd streaming
   ```

2. **Install dependencies for all services**
   ```bash
   # Sender
   cd sender
   npm install
   
   # Middleware
   cd ../middleware
   npm install
   
   # Receiver
   cd ../receiver
   npm install
   ```

3. **Start all services** (in separate terminals)
   ```bash
   # Terminal 1 - Sender
   cd sender
   npm run dev # Runs on http://localhost:3000
   
   # Terminal 2 - Middleware
   cd middleware
   npm run dev -- -p 3001 # Runs on http://localhost:3001
   
   # Terminal 3 - Receiver
   cd receiver
   npm run dev -- -p 3002 # Runs on http://localhost:3002
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser
   - Enter text to be processed
   - Watch it flow through the gateway architecture!

## 🧪 Testing the Gateway

### Local Testing
1. Enter text like "Hello World" in the Sender UI
2. Ensure destination URL is `http://localhost:3001/api/process`
3. Click "Forward Text"
4. Observe the result: "dlroW olleH" (reversed)

### API Testing with curl
```bash
# Test Receiver directly
curl -X POST http://localhost:3002/api/process \
  -H "Content-Type: application/json" \
  -d '{"text":"hello"}'

# Test through Gateway (Middleware)
curl -X POST http://localhost:3001/api/process \
  -H "Content-Type: application/json" \
  -d '{"text":"hello"}'

# Test Sender's forward endpoint
curl -X POST http://localhost:3000/api/forward \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","destination":"http://localhost:3001/api/process"}'
```

## 📚 Learning Objectives

This project teaches:

1. **Microservices Architecture**: How to decompose applications into smaller services
2. **API Gateway Pattern**: Centralized routing and request handling
3. **Service Communication**: HTTP-based inter-service communication
4. **Error Handling**: Proper error propagation in distributed systems
5. **TypeScript**: Type-safe API development
6. **Next.js**: Full-stack development with API routes
7. **REST API Design**: RESTful service design principles

## 🔄 Possible Extensions

- **Authentication**: Add JWT-based auth in the gateway
- **Rate Limiting**: Implement request throttling
- **Caching**: Add Redis-based response caching
- **Load Balancing**: Multiple receiver instances
- **WebSocket**: Real-time communication
- **Database**: Persistent data storage
- **Monitoring**: Logging and metrics collection
- **Service Discovery**: Dynamic service registration

## 🤝 Contributing

Feel free to fork this project and experiment with different gateway patterns and features!

---

*This project is designed for educational purposes to understand distributed systems and API gateway patterns.*
