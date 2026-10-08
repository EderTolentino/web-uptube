# UPTube — Full-Stack Video Platform

**UPTube** is a team-developed academic video platform created as the final project of the **UPSkill programme at ISCTE**.

> **Portfolio restoration in progress.** Source code has been restored from a historical project revision into a new repository without the original Git history. The application has not yet been re-tested locally, and screenshots and database setup instructions will be added after verification.

## Technology stack

- **Frontend:** React 18, React Router, Sass and Material UI
- **Backend:** Node.js, Express and Passport
- **Database:** MySQL
- **Integrations:** Nodemailer, Google/GitHub OAuth and video-processing tools

## Features in the historical source

User registration and login, video management, channels, playlists, subscriptions, search, viewing history, interactions and administration. These features are documented from source-code inspection; their current runtime behaviour is not yet verified.

## Project structure

```text
client/  React frontend
server/  Express API and database integration
```

## Setup status

Local setup and testing are pending. Copy `server/.env.example` to `server/.env` and provide your **own** credentials. Do not commit `.env` or session files.

## Security

This is a fresh public repository, without the Git history of the original private backup. Historical credentials must be rotated independently; deleting them from the latest source does not revoke them.

The original frontend lockfile was not imported because its contents could not be retrieved completely; run `npm install` in `client/` to regenerate it. The backend lockfile is included.

## Credits

Developed collaboratively as an UPSkill/ISCTE final group project. Team members and individual contributions will be documented accurately after confirmation.

## Next steps

- Finish source-code security review and import
- Recover/document the MySQL schema
- Test the application locally
- Add screenshots and a demonstration
