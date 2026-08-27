# Litellm reference data

Data files copied from BerriAI/litellm (MIT license, portions under
litellm's own LICENSE terms — see the litellm repository for details).

- `model_prices_and_context_window.json` — pricing + context window DB for
  hundreds of LLMs. Useful as reference when setting ModelRatio / ModelPrice
  in new-api admin settings.
- `model_prices_and_context_window.schema.json` — JSON schema of the above.
- `provider_endpoints_support.json` — provider endpoint capability matrix.
- `policy_templates.json` — guardrails policy templates.

These are static snapshots. Refresh them from upstream when needed:
https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
