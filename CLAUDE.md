# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Knowledge Card Generator** - a web application that converts knowledge text into structured learning cards using AI. The application uses OpenAI-compatible APIs with the `gemini-2.5-pro` model to process text and generate JSON-formatted knowledge cards.

## Architecture

### File Structure
- `index.html` - Main HTML file with modern layout (input area on top, cards below, modal API config)
- `script.js` - Core application logic including API calls and card rendering
- `json-extractor.js` - Robust JSON extraction utility for handling AI responses
- `style.css` - Custom styles including scrollbar theming and animations
- `system-prompt.md` - Development requirements and "代码魔盒" role definition
- `idea.md` - Project specifications and AI system prompt for card generation

### Key Design Patterns

**Layout Philosophy**: Input-first workflow with API configuration hidden in modal dialogs. Uses Bento Grid aesthetic with Tailwind CSS for all styling.

**AI Integration**: Uses JsonCard Engine system prompt to generate structured knowledge cards. The JSON extractor handles various AI response formats including markdown code blocks, mixed text, and malformed JSON.

**Error Resilience**: Multi-layer JSON extraction strategy prevents "AI返回的不是有效的JSON格式" errors through intelligent parsing and format fixing.

## Development Commands

### Testing JSON Extractor
```bash
cd "C:\MyFile\SmallProjects\knowledge-card-generator"
node json-extractor.js
```

### Opening in Browser
```bash
# Open index.html in default browser (Windows)
start index.html
```

## AI System Integration

### Model Configuration
- **Model**: `gemini-2.5-pro`
- **API**: OpenAI-compatible endpoints
- **Response Format**: JSON array with Q/A structure
- **Highlighting**: Uses `**text**` markdown for emphasis in answers

### JSON Schema Expected
```json
[
  {
    "Q": "question string",
    "A": "answer string with **highlighted** keywords"
  },
  {
    "Q": "question for list",
    "A": ["**first point**", "**second point**"]
  }
]
```

## Critical Implementation Details

**JSON Extraction**: Always use `JsonExtractor.extractJson()` when processing AI responses. It handles markdown code blocks, mixed content, and common JSON formatting issues.

**Configuration Persistence**: API settings auto-save to localStorage and restore on page load. Modal-based configuration keeps UI clean.

**Error Handling**: Detailed error messages distinguish between network failures, API errors, and JSON parsing issues.

**Responsive Design**: Desktop-first with 3-column card grid, collapsing to 2-column on tablet and single column on mobile.

## Styling Guidelines

- **Framework**: Tailwind CSS (CDN) only, no custom CSS beyond style.css
- **Theme**: Dark theme with gray-900 background and blue-400 accents
- **Icons**: Font Awesome 6.4.0 for all iconography
- **Scrollbars**: Custom styled to match dark theme aesthetic
- **Animations**: Subtle hover effects and loading states for better UX

## LocalStorage Schema
```javascript
{
  baseUrl: string,
  apiKey: string,
  modelName: string,
  savedAt: ISO date string
}
```