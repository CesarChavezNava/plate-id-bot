<div align="center">
  <img src="./images/logo.jpg" alt="PlateID Bot Logo">
</div>

# PlateID Bot

A Telegram bot that recognizes dishes from photos, lets users rate them, and manage food preferences and allergies.

## Quick overview

- Built with NestJS. Uses Firestore for persistence and AI agents for photo recognition.
- Main user interactions happen through Telegram commands and photo uploads.

## Features

- Register and manage a user profile
- Send a photo to identify a dish or menu
- Rate foods (like/dislike)
- Manage allergies and view lists of liked/disliked items

## Prerequisites

- Node.js v20+ and NPM or Yarn
- A Telegram bot token (get one from BotFather)
- (Optional) Google Cloud Firestore credentials (service account JSON) to persist profiles
- (Optional) OpenAI API key for the photo recognition agent

## Quick start

1. Clone the repo and install dependencies:

```powershell
git clone <repository-url>
cd plateid-bot
npm install
```

2. Create a `.env` file in the project root and add required variables. Minimal example:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# GCP
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

3. Run in development mode:

```powershell
npm run start:dev
```

Or build & run production:

```powershell
npm run build
npm run start:prod
```

Run tests:

```powershell
npm run test
```

## Architecture

The project follows a modular architecture based on [NestJS](https://nestjs.com/), organized into the following main components:

- **Agents (`src/agents/`)**: Encapsulate the logic for dish recognition and menu analysis.
- **Modules (`src/modules/`)**: Separate functionalities such as authentication, user profile, configuration, and shared utilities.
- **Internationalization (`src/i18n/`)**: Translation files to support multiple languages.
- **Telegram (`src/telegram/`)**: Implements integration and command handling for the Telegram bot.
- **Domain & Application**: Each module contains entities, use cases, repositories, and specific utilities to maintain separation of concerns.

This structure facilitates scalability, maintainability, and the extension of features in the project.

## Folder Structure Diagram

```text
src/
├── agents/         # Dish recognition and menu analysis logic
├── i18n/           # Translation files for internationalization
├── modules/        # Main business logic, organized by domain (auth, profile, config, shared)
├── telegram/       # Telegram bot integration, command handlers, guards, and utilities
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## Commands

Below are the main bot commands (found in `src/telegram/handlers`). For each command there's a short description, usage examples, and a placeholder where you can add an image showing the command in action.

- /start — Show welcome message and initial instructions
- /register — Register the user in the service
- /help — Show help and available commands
- /allergy <item> — Add an allergy to the user's profile
- /food <item> | <score> — Rate a food item; score can be 1 (like) or 0 (dislike)
- /list — Show foods or allergies
- Photo upload — Send an image; the bot will try to identify the dish and suggest rating options

### /start

Description: Welcome message and short instructions.

Usage:

`/start`

Image (add your screenshot here):

![start](images/commands/start.jpg)

### /register

Description: Register your Telegram user in the app.

Usage:

`/register`

Image (add your screenshot here):

![register](images/commands/register.jpg)

### /help

Description: Display help text and list of commands.

Usage:

`/help`

Image (add your screenshot here):

![help](images/commands/help.jpg)

### /allergy

Description: Add or list allergies for your profile.

Usage:

`/allergy <item>`

Image (add your screenshot here):

![allergy](images/commands/allergy.jpg)

### /food

Description: Rate a food item (like/dislike) or add a food entry.

Usage:

`/food <item> | <score>` (e.g. `/food sushi | 1`)

Image (add your screenshot here):

![food](images/commands/food.jpg)

### /list

Description: Show lists of allergies or foods.

Usage:

`/list`

Image (add your screenshot here):

![list](images/commands/list_allergies.jpg)

![list](images/commands/list_food.jpg)

### Photo upload

### Dish recognition

Description: Send a photo of a meal and the bot will attempt to recognize the dish and present rating / allergy compatibility information.

Usage:

Send an image in chat (no command required) with a caption (**food**).
![photo](images/commands/food_1.jpg)

Result:

![photo](images/commands/food_2.jpg)

### Menu analysis

Description: Send a photo of a menu and the bot will attempt to analyze it and suggest rating options.

Usage:

Send an image in chat (no command required) with a caption (**menu**).
![photo](images/commands/menu_1.jpg)

Result:

![photo](images/commands/menu_2.jpg)
