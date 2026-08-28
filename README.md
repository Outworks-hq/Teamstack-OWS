# Unified Ops Workspace

Build TeamStack OWS — First Functional MVP

Build the first functional MVP of TeamStack OWS — Operations Workspace based directly on the attached desktop reference image.

VISUAL REQUIREMENT — VERY IMPORTANT

The attached image is the source of truth for the homepage design.

Reproduce it as closely as possible:

same overall page structure

same white/light visual style

same spacing and proportions

same typography hierarchy

same TeamStack OWS branding placement

same navigation placement

same hero layout

same dashboard preview placement

same rounded cards

same restrained purple accent

same clean professional appearance

Do not redesign the homepage.

Do not add:

gradients

glowing effects

abstract technology graphics

oversized sidebars

excessive navigation

unnecessary sections

generic SaaS dashboard styling

The homepage should look essentially like the attached reference.

PRODUCT

TeamStack OWS = TeamStack Operations Workspace.

It is a separate operations app that gives teams one clean place to organize, monitor, understand, and eventually control the backend/business platforms their company uses.

Examples:

AWS

Stripe

GitHub

Vercel

Twilio

Netlify

Google Workspace

CRM platforms

sales systems

other approved tools

It does not replace these platforms.

It creates one organized operating layer over them.

MVP GOAL

Do not attempt to build every deep external API integration yet.

Build the complete TeamStack OWS environment so it can already be used by a team, while leaving the integration architecture ready for developers to connect real APIs later.

For the first version, users should be able to:

create an account

create a Workspace

create Units inside a Workspace

invite members

assign roles and permissions

add external platforms/systems to a Unit

organize those platforms

open the original external platform from OWS

record and view system status

receive/store supported notifications and alerts

see activity/history

see billing information

see access information

see how systems relate to each other

use Console and Control Room views

Use Supabase for authentication, users, Workspaces, Units, membership, permissions, connected-system records, notifications, activity history, and other internal OWS data.

STRUCTURE

Workspace

A Workspace represents one organization.

The person who creates it starts as the main Workspace owner/admin.

A user may create or belong to multiple Workspaces.

Each separate Workspace should operate independently.

Units

A Workspace can contain multiple Units.

Examples:

Development

Marketing

Operations

Finance

Sales

Different users can belong to different Units.

Each Unit has its own:

members

permissions

connected systems

activity

alerts

usage

billing responsibility

ROLES & PERMISSIONS

Support:

Workspace Owner

Unit Admin

Editor

Viewer

Custom permissions

Non-admin members can still be allowed to perform actions depending on their permissions.

The Unit Admin has overall Unit control, including:

opening/closing the Unit

managing members

assigning permissions

deciding which tools are used

managing connected systems

overseeing Unit usage

BILLING STRUCTURE

Do not make this traditional per-seat pricing.

Regular members can participate without being directly charged.

Billing responsibility belongs to the Unit’s assigned payer.

Support the structure for:

Central billing

Workspace owner covers all Units.

Unit billing

Individual Unit admins are responsible for their Unit.

For this MVP, build the billing/account structure and UI. Deep production billing logic can be completed later.

MAIN APP

1. Console

This is the everyday operations view.

Show:

connected systems

system status

alerts

billing

deployments/activity

access

recent changes

basic actions

Keep it clean like the dashboard shown in the attached reference.

Do not overload it with graphs or unnecessary cards.

2. Control Room

A deeper operational view for:

critical alerts

live incidents

system health

team activity

access logs

recent changes

recovery actions

TeamStack proof/activity logs

This should feel more serious than Console but still visually clean.

3. Systems

Allow a Unit admin to add and organize systems such as:

AWS

Stripe

GitHub

Vercel

Twilio

Netlify

Google Workspace

custom system

For systems without a real API integration yet, allow users to:

add the system

name it

assign it to a Unit

categorize it

save its external dashboard URL

add notes

assign responsible members

display status

open the original platform in a new tab

Design the data structure so real API connectors can replace or enhance this later.

4. Notifications & Alerts

Create one unified notification area.

Notifications can belong to:

a Workspace

a Unit

a connected system

Support:

informational

warning

critical

resolved

Real platform notifications can be connected later. For now, make the internal notification system functional and capable of storing future external notifications.

CONNECTED OPERATIONS

TeamStack OWS should show how systems work together, not only which systems exist.

Example:

Ads → Website → CRM → Email → Stripe → Customer Access

Build a simple visual Connected Operations view where users can:

add systems to a flow

connect one system to another

show the direction information moves

name the relationship

organize multiple operational flows

click a system to view its details

This does not need to automatically discover API relationships yet.

Users can manually build these relationships in the MVP, while the architecture should allow developers to automate this later.

SYSTEM DETAILS

Clicking a connected system should open a clean detail view showing:

system name

logo/icon

Unit

status

external link

responsible members

recent activity

alerts

notes

connections to other systems

available actions

If an action is not supported by a real integration yet, do not fake it as functional.

Mark it clearly as unavailable until integration is connected.

FUTURE INTEGRATION ARCHITECTURE

Structure the app so developers can later add API connectors without rebuilding the interface.

Future integrations should be able to provide:

OAuth/account authorization

notifications

status information

billing information

deployments

user/access information

analytics

approved actions

data transfer between systems

Do not hard-code the product around only AWS, Stripe, GitHub, etc.

The system needs to support adding more connectors later.

FIRST INTEGRATION WEDGE

Visually support these first:

GitHub

Vercel

AWS

Stripe

Google Workspace

But do not waste development time attempting to fully recreate their backend functionality.

The first OWS version can primarily organize them, link to them, display available internal information, store alerts, and prepare the interface for deeper integrations.

HOMEPAGE

Reproduce the attached homepage extremely closely.

Keep:

TeamStack OWS

One workspace. Every system. Clear control.

The dashboard shown beneath the hero should represent the actual product users enter after signing in.

Main navigation:

Product

Console

Control Room

Integrations

Pricing

CTA:

Book a demo

See how it works

Do not add extra marketing sections until the attached homepage and actual app environment are working correctly.

RESPONSIVE BEHAVIOR

This product is desktop-first.

The desktop layout should preserve the clean wide workspace shown in the reference.

Tablet and mobile can adapt afterward, but do not turn the desktop interface into a large mobile-style layout.

IMPORTANT BUILD ORDER

Build in this order:

Exact homepage visual shell from reference

Authentication

Workspace creation

Units

Members and permissions

Console

Systems

Notifications/alerts

Control Room

Connected Operations

Billing/account structure

Do not redesign the attached homepage while building functionality.

The goal is a usable TeamStack OWS environment now, with clean architecture that a developer can later extend with real external APIs and deeper actions.

The Units should be completely customizable.

They do not have to be predefined departments like Marketing, Finance, or Development. Those are just examples.

Whoever creates/manages the Workspace should be able to create a Unit and choose:

Unit name

Unit purpose

members

admin

permissions

what functions are enabled

what systems/integrations belong inside it

who is responsible for those systems

So a Unit could be:

Marketing
New York Operations
Client A
Website Infrastructure
Sales Funnel
Product Launch
Executive Office
or anything else the organization wants.

Then the Unit admin adds the systems that actually belong there.

Example:

Website Infrastructure
→ GitHub
→ Vercel
→ AWS
→ Cloudflare

Sales
→ Stripe
→ CRM
→ email platform
→ analytics

The structure should be:

Create Unit → name it yourself → configure its functions/permissions → add the integrations that Unit uses.

I’d actually change the Lovable prompt line from:

Examples: Development, Marketing, Operations, Finance, Sales

to:

Units are fully customizable. Workspace owners/admins name and configure their own Units based on how their organization operates. Departments such as Marketing or Development are only examples, not predefined Unit types.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a3e4e782-aa1e-4d32-b6ff-fc3f00f31963).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
