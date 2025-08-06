# System Architecture Diagram

```
                    🌐 STREAMING GATEWAY ARCHITECTURE 🌐

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                              USER INTERACTION LAYER                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           🖥️  SENDER SERVICE                               │
│                          (localhost:3000)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend UI                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ Text Input  │  │Destination  │  │   Submit    │                  │   │
│  │  │    Field    │  │  URL Field  │  │   Button    │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  API Route: /api/forward                            │   │
│  │  • Accepts: { text: string, destination: string }                   │   │
│  │  • Validates input parameters                                       │   │
│  │  • Makes HTTP POST to destination                                   │   │
│  │  • Returns processed response                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ HTTP POST
                                          │ Content-Type: application/json
                                          │ Body: { text, destination }
                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                      🌉 MIDDLEWARE SERVICE (API Gateway)                   │
│                          (localhost:3001)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  API Route: /api/process                            │   │
│  │                                                                     │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │   │
│  │  │   Request   │    │ Validation  │    │   Forward   │              │   │
│  │  │ Validation  │───▶│ & Parsing   │───▶│ to Receiver │              │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘              │   │
│  │                                              │                      │   │
│  │  ┌─────────────┐    ┌─────────────┐         │                       │   │
│  │  │  Response   │    │   Error     │         │                       │   │
│  │  │Aggregation  │◀───│  Handling   │◀────────┘                       │   │
│  │  └─────────────┘    └─────────────┘                                 │   │
│  │                                                                     │   │
│  │  Features:                                                          │   │
│  │  • Acts as proxy/gateway                                            │   │
│  │  • Routes requests to receiver                                      │   │
│  │  • Handles error propagation                                        │   │
│  │  • Transforms response format                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ HTTP POST
                                          │ Content-Type: application/json
                                          │ Body: { text }
                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        🔄 RECEIVER SERVICE                                 │
│                          (localhost:3002)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  API Route: /api/process                            │   │
│  │                                                                     │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │   │
│  │  │   Receive   │    │  Business   │    │   Format    │              │   │
│  │  │   Request   │───▶│   Logic     │───▶│  Response   │              │   │
│  │  └─────────────┘    │ (Reverse)   │    └─────────────┘              │   │
│  │                     └─────────────┘                                 │   │
│  │                                                                     │   │
│  │  Business Logic:                                                    │   │
│  │  • Input: "hello world"                                             │   │
│  │  • Process: text.split('').reverse().join('')                       │   │
│  │  • Output: "dlrow olleh"                                            │   │
│  │                                                                     │   │
│  │  Response Format:                                                   │   │
│  │  {                                                                  │   │
│  │    "original": "hello world",                                       │   │
│  │    "result": "dlrow olleh",                                         │   │
│  │    "message": "Text successfully reversed"                          │   │
│  │  }                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                               DATA FLOW SEQUENCE                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

1. 👤 User enters "Hello World" in Sender UI
2. 📤 Sender POST /api/forward → Middleware
3. 🌉 Middleware POST /api/process → Receiver  
4. 🔄 Receiver processes: "Hello World" → "dlroW olleH"
5. 📥 Receiver returns result to Middleware
6. 🌉 Middleware aggregates response and returns to Sender
7. 👤 User sees final result: "dlroW olleH"

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                             GATEWAY BENEFITS                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✅ Single Entry Point     │ Clients only need to know middleware endpoint
✅ Request Routing        │ Gateway routes to appropriate backend services  
✅ Error Handling         │ Centralized error handling and propagation
✅ Protocol Translation   │ Can transform request/response formats
✅ Service Abstraction    │ Backend services can change without client changes
✅ Cross-cutting Concerns │ Authentication, logging, monitoring in one place
```

## Technology Stack Details

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    Component    │   Technology    │     Purpose     │     Port        │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Sender          │ Next.js + React │ User Interface  │ 3000            │
│ Middleware      │ Next.js API     │ API Gateway     │ 3001            │
│ Receiver        │ Next.js API     │ Business Logic  │ 3002            │
│ Language        │ TypeScript      │ Type Safety     │ -               │
│ Styling         │ Tailwind CSS    │ UI Styling      │ -               │
│ HTTP Client     │ Fetch API       │ API Requests    │ -               │
│ Deployment      │ Vercel          │ Hosting         │ -               │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```
