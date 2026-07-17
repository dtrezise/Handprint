<!-- BEGIN AI MODEL ROUTING GOVERNANCE -->
## AI model routing

Apply the rules-first Prompt Routing Test before substantive execution. For obvious routine prompts, this may be an implicit near-zero-overhead classification. For ambiguous, consequential, or multi-task prompts, consult `MODEL_ROUTING.md` and run `../ai-model-routing-governance/.venv/bin/python ../ai-model-routing-governance/scripts/route-prompt.py` before choosing a route.

Keep named-model facts in the central registry, honor `.ai-routing.local.yaml`, separate ChatGPT allowance from API billing, and do not invoke optional model adjudication without explicit opt-in.

For substantive routed work, append a compact routing receipt to the final response. Report the planned model, reasoning posture, and orchestration posture from the route; these product labels come from the replaceable execution-posture mapping, not stable doctrine. Distinguish the planned route from what actually executed. The Codex router automatically checks the exact active session identified by `CODEX_THREAD_ID`; when its output includes `Observed execution`, report that value as `host-metadata`. Mark execution as `unknown` only when the router cannot obtain that observation. Never claim that planned worker models executed merely because they appear in a route plan. Use `../ai-model-routing-governance/.venv/bin/python ../ai-model-routing-governance/scripts/render-routing-receipt.py` when a saved route JSON is available. Expand the receipt only when requested, and do not interrupt routine work with a feedback survey.
<!-- END AI MODEL ROUTING GOVERNANCE -->
