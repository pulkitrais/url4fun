# URL4Fun - Professional URL Shortener

A professional URL shortener that converts any URL into custom shortened formats for popular social media platforms like YouTube, Spotify, Apple Music, and more.

## 🌟 Features

- **Custom URL Shortening**: Convert long URLs into short, shareable links
- **Multi-Platform Support**: YouTube, Spotify, Apple Music, Twitter, Instagram, TikTok
- **Custom Slugs**: Create memorable custom short codes
- **Click Analytics**: Track clicks and engagement on shortened URLs
- **URL Management**: Full CRUD operations on shortened URLs
- **Platform Detection**: Automatically detect social media URLs
- **Expiring Links**: Set expiration dates for temporary links
- **Tagging System**: Organize URLs with tags
- **RESTful API**: Easy-to-use REST API for integration
- **Responsive UI**: Modern React-based user interface

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/pulkitrais/url4fun.git
   cd url4fun
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your values**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/url4fun
   JWT_SECRET=your_secret_key
   BASE_SHORTENER_URL=http://localhost:3000/s
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

6. **Start the client (in another terminal)**
   ```bash
   npm run client
   ```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/url4fun

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# API Keys for Social Media Platforms
YOUTUBE_API_KEY=your_youtube_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Frontend URL
REACT_APP_API_URL=http://localhost:5000/api

# URL Shortener Configuration
BASE_SHORTENER_URL=http://localhost:3000/s
```

## 🔌 API Endpoints

### URL Operations

#### Create a Shortened URL
```http
POST /api/urls
Content-Type: application/json

{
  "originalUrl": "https://www.example.com/very/long/url",
  "platform": "youtube",
  "customSlug": "my-custom-code",
  "description": "My shortened link",
  "tags": ["important", "project"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "uuid-here",
    "originalUrl": "https://www.example.com/very/long/url",
    "shortCode": "abcd1234",
    "platform": "youtube",
    "customSlug": "my-custom-code",
    "customizedUrl": "https://youtu.be/abcd1234",
    "clicks": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get a Shortened URL
```http
GET /api/urls/:shortCode
```

#### Get All URLs (Paginated)
```http
GET /api/urls?page=1&limit=10
```

#### Update a URL
```http
PUT /api/urls/:shortCode
Content-Type: application/json

{
  "description": "Updated description",
  "tags": ["new-tag"],
  "isActive": true
}
```

#### Delete a URL
```http
DELETE /api/urls/:shortCode
```

### Platform Operations

#### Get Available Platforms
```http
GET /api/platforms
```

#### Get Platform Details
```http
GET /api/platforms/:platform
```

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **dotenv**: Environment configuration
- **CORS**: Cross-Origin Resource Sharing
- **UUID**: Unique identifier generation

### Frontend
- **React**: UI framework
- **Axios**: HTTP client
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Vite**: Build tool

### Testing & Development
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **Nodemon**: Auto-reload server

## 💻 Development

### Project Structure

```
url4fun/
├── server.js                 # Express server entry point
├── package.json             # Backend dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
│
├── models/
│   └── Url.js              # MongoDB URL schema
│
├── routes/
│   ├── urls.js             # URL shortener endpoints
│   ├── platforms.js        # Platform management endpoints
│   └── analytics.js        # Analytics endpoints
│
├── middleware/
│   └── validation.js       # Request validation middleware
│
├── utils/
│   └── urlUtils.js         # URL utility functions
│
└── client/                 # React frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.js
    └── package.json
```

### Running Tests

```bash
# Run backend tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Development Server

```bash
# Start with hot reload
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email support@url4fun.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] User authentication and authorization
- [ ] Advanced analytics dashboard
- [ ] QR code generation
- [ ] API rate limiting
- [ ] URL bulk upload
- [ ] Custom branding options
- [ ] Mobile app
- [ ] Integration with more platforms

---

**Made with ❤️ by Pulkit Rais