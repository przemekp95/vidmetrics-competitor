# Project Title

VidMetrics Competitor Pulse

## Description

VidMetrics Competitor Pulse is a Next.js 16 MVP for competitor YouTube channel analysis.
It lets an analyst paste a public channel URL, resolve the channel on the server, and review
current-month uploads ranked by public momentum. The product is designed as a polished SaaS-style
demo with summary cards, a momentum chart, sortable and filterable results, and CSV export.

## API Endpoints

- `POST /api/analyze` - Accepts `{ "channelUrl": "..." }` and returns a normalized competitor analysis payload.

## Architecture Overview

The app uses a lean hexagonal structure:

- `app` handles the page and route entrypoints.
- `application` coordinates the analysis use case.
- `domain` owns ranking, metrics, and window calculations.
- `ports` defines the source and resolver interfaces.
- `infrastructure` contains the YouTube Data API adapter and channel URL resolver.

The UI is a client-driven workspace backed by a server-side analysis route. Public YouTube data is
resolved and normalized on the server, then rendered into a responsive dashboard. TDD is used for
domain and application logic, while the UI focuses on polished interaction and presentation.

## Project Structure

```text
.
|-- src/
|   |-- app/
|   |-- application/
|   |-- components/
|   |-- domain/
|   |-- infrastructure/
|   |-- ports/
|   |-- shared/
|   |-- transport/
|   `-- lib/
|-- public/
|-- docs/
`-- package.json
```

## Getting Started

### Dependencies

- Node.js 22 LTS or newer
- npm
- A YouTube Data API v3 key
- A Vercel account for deployment

### Environment Variables

- `YOUTUBE_API_KEY` - Required for server-side YouTube Data API requests.

Copy `.env.example` to `.env.local` and add the key before running the app.

### Installing

1. Install dependencies.

```bash
npm install
```

2. Copy the example environment file and add your YouTube API key.

```bash
copy .env.example .env.local
```

Then edit `.env.local`:

```bash
YOUTUBE_API_KEY=your_key_here
```

3. Run the app in development mode.

## Executing program

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Help

- If analysis returns a quota or API error, verify `YOUTUBE_API_KEY` and the Google Cloud YouTube Data API setup.
- If a pasted URL does not resolve, try a canonical channel URL or an `@handle` URL.
- If images fail to load in development, confirm the source domain is covered by `next.config.ts` image patterns.
- If the app will not start, verify that Node 22 LTS is installed and that npm is using the same installation.

## Authors

- OpenAI Codex

## Version History

- 0.1.0
  - Initial MVP implementation for competitor YouTube channel analysis.
  - Added server-side YouTube data normalization, UI filters, and CSV export.

## License

TBD

## Acknowledgments

- Next.js
- Tailwind CSS
- YouTube Data API v3
- Vercel
