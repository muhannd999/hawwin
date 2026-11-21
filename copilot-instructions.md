# Hawwin — AI Coding Rules

- Always write clean, modular TypeScript with strict types (no `any`).
- UI is 100% Arabic (RTL). Use logical/RTL-safe flexbox layouts and clean Arabic typography.
- NEVER place Gemini API keys or secrets inside the Expo client app. All AI requests must go through Supabase Edge Functions (use mock responses first during UI development).
- Keep components small and separated: `app/(tabs)/` for screens, `components/` for reusable UI, `services/` for API calls, `types/` for interfaces.
- Use a calm, minimal design palette: soft off-white background (`#F8F9FA`), clean white cards (`#FFFFFF`), calm teal/emerald primary accent (`#0F766E`), and clear readable dark text (`#111827`).
- Before writing complex code, keep solutions simple and MVP-focused without over-engineering.