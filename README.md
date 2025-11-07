# SecureYou Alert System

A React-based personal safety and emergency alert system built with modern web technologies.

## Features

- 🆘 SOS Emergency Button
- 👥 Emergency Contacts Management
- 📍 Location Tracking
- 🚨 Incident Reporting
- 🔐 Secure Authentication
- 🌐 Progressive Web App (PWA)

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) (v7 or newer)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdnhsiam/secure-you-alert-main.git
   cd secure-you-alert-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit .env with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   └── ...             # Custom components
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
│   └── locales/        # Translation files
├── lib/                # Utility functions
├── pages/              # Application pages/routes
└── App.tsx            # Root component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features in Detail

### Emergency SOS
- Quick access emergency button
- Location tracking during emergencies
- Automatic contact notification

### Contact Management
- Add and manage emergency contacts
- Priority contact settings
- Quick dial integration

### Incident Reporting
- Detailed incident logging
- Location and timestamp tracking
- Media attachment support

### Settings and Customization
- Language preferences
- Notification settings
- Profile management

## Security Features

- Secure authentication
- Data encryption
- Privacy-focused design
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use conventional commits
- Write tests for new features
- Follow the existing code style

## Localization

The app supports multiple languages:
- English (en)
- Spanish (es)
- Bengali (bn)

To add a new language, create a new JSON file in `src/i18n/locales/`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository.