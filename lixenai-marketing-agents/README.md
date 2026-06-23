# LixenAI Marketing Agent Team

Internal multi-agent marketing command system for LixenAI.

## Purpose

The LixenAI Marketing Agent Team helps plan campaigns, recruit Agency Partners, write copy, generate ads, produce social content, and support partner sales enablement.

LixenAI is a productized AI automation and fulfillment company for service-based local businesses. The current partner-facing promise is:

```text
You close. We build, deploy, and deliver.
```

## Business Context

- Primary growth model: Agency Partner channel.
- Current production niche: med spa and aesthetic clinic.
- Partner funnel exists in GoHighLevel.
- GHL handles nurture automation, pipeline tracking, CRM workflows, and analytics dashboards.
- This system focuses on strategy, creative production, partner acquisition, copywriting, ad strategy, social content, and sales enablement.
- Paid acquisition is gated until proof, case studies, funnel performance, and fulfillment readiness are ready.

## Agent Team

| Agent | File | Primary Use |
| --- | --- | --- |
| Marketing Director Agent | `agents/marketing-director.md` | Weekly priorities, strategy, assignments, final review |
| Campaign Agent | `agents/campaign-agent.md` | Campaign briefs, timelines, channel plans, metrics |
| Partner Acquisition Agent | `agents/partner-acquisition-agent.md` | LinkedIn outreach, recruitment copy, qualification |
| Copywriting Agent | `agents/copywriting-agent.md` | Landing pages, CTAs, scripts, rewrites, conversion copy |
| Ads Manager Agent | `agents/ads-manager-agent.md` | Ad angles, ad copy, creative briefs, paid readiness |
| Social Media Agent | `agents/social-media-agent.md` | LinkedIn, Instagram, TikTok, Shorts, content calendars |
| Sales Enablement Agent | `agents/sales-enablement-agent.md` | Discovery, demo, objections, proposals, partner training |

## Recommended Operating Flow

1. Marketing Director receives business goal.
2. Marketing Director assigns Campaign Agent to create a campaign brief.
3. Campaign Agent defines offer angle, audience, channels, assets, and CTA.
4. Copywriting Agent writes core campaign copy.
5. Social Media Agent turns the campaign into organic content.
6. Ads Manager Agent creates paid or retargeting variants only if campaign readiness is approved.
7. Partner Acquisition Agent creates outreach and recruitment funnel assets.
8. Sales Enablement Agent creates scripts and closing support for partners.
9. Marketing Director reviews all outputs for strategic alignment and compliance.

## Folder Structure

```text
lixenai-marketing-agents/
  README.md
  agents/
    marketing-director.md
    campaign-agent.md
    partner-acquisition-agent.md
    copywriting-agent.md
    ads-manager-agent.md
    social-media-agent.md
    sales-enablement-agent.md
  workflows/
    weekly-marketing-workflow.md
    campaign-production-workflow.md
    partner-recruitment-workflow.md
    sales-enablement-workflow.md
  templates/
    campaign-brief-template.md
    ad-brief-template.md
    linkedin-outreach-template.md
    social-content-template.md
    landing-page-copy-template.md
    sales-script-template.md
  config/
    lixenai-brand-rules.yaml
    audience-segments.yaml
    compliance-rules.yaml
    offers.yaml
  qa/
    content-qa-checklist.md
    agent-output-review.md
    paid-ads-readiness-check.md
  examples/
    example-commands.md
    sample-agent-collaboration.md
```

## Global Rules

Use approved language:

- Agency Partner
- AI Growth System
- done-for-you deployment
- live demo
- niche snapshot
- fulfillment backend
- working price
- illustrative revenue example
- You close. LixenAI delivers.
- You close. We build, deploy, and deliver.

Avoid risky or unapproved language:

- GHL reseller
- passive income
- guaranteed appointments
- guaranteed earnings
- set-it-and-forget-it
- fully HIPAA compliant
- every niche is ready
- 24/7 human support unless contracted
- no work required
- done-for-you clients
- guaranteed first client
- guaranteed revenue
- own an AI company unless legal documents support ownership

## Compliance Rules

- Do not create unsupported income claims.
- Do not claim guaranteed clients, guaranteed revenue, or guaranteed appointments.
- Do not imply employment, salary, or wages for Agency Partners.
- Use "independent, performance-based partner opportunity" when describing the partner program.
- For paid ads, include a disclaimer when income examples are used.
- Treat med spa as the current production niche.
- Do not imply that all industries are production-ready.
- When mentioning other industries, say they are future or conditional opportunities unless approved.
- Tie marketing messages to business outcomes, not hype.
- All content must be clear, practical, founder-ready, and human-reviewed before publishing.

## Required Income Disclaimer

Use this whenever income examples are included in ads or partner-facing promotional material:

```text
Income examples are illustrative. Actual results depend on partner activity, niche, market, sales ability, and effort. LixenAI does not guarantee earnings of any specific amount. This is not an employment offer; partners are independent contractors.
```

## How To Use In Codex

Start with the Marketing Director Agent when the request is strategic:

```text
Use lixenai-marketing-agents/agents/marketing-director.md and create this week's partner recruitment plan.
```

Start with a specialist when the task is specific:

```text
Use lixenai-marketing-agents/agents/partner-acquisition-agent.md and create 10 LinkedIn DM scripts for high-ticket closers.
```

Use config files as constraints:

```text
Follow lixenai-marketing-agents/config/lixenai-brand-rules.yaml and lixenai-marketing-agents/config/compliance-rules.yaml.
```

Run QA before publishing:

```text
Review this output using lixenai-marketing-agents/qa/content-qa-checklist.md.
```

## Example Tasks

- Create a 14-day LinkedIn campaign to recruit founding LixenAI Agency Partners.
- Write 5 ad angles for sales professionals who want to sell AI automation without building the tech.
- Create a 90-second demo script for missed-call recovery.
- Write a landing page section explaining what the partner owns vs what LixenAI owns.
- Create 10 LinkedIn DM scripts for high-ticket closers.
- Create a weekly content calendar for LixenAI partner recruitment.
- Review this ad copy for risky claims.

## Production Notes

- This is an internal agent system, not a public-facing website.
- Human review is required before any asset is published, launched, or sent.
- Paid acquisition should remain organic-first until proof, funnel data, and fulfillment readiness are confirmed.
- Med spa and aesthetic clinic is the current production niche. Any other niche should be marked future or conditional unless approved.
