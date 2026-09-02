Approved CDRL Prototype Source
You are a senior product designer, frontend architect, Next.js engineer, and interaction designer.

Build the APPROVED CDRL PROTOTYPE SOURCE exactly as specified below.

This prototype is the official visual and interaction reference for the full CDRL platform. Future public pages, marketplace features, LMS screens, organization portals, trainer portals, partner portals, and administration screens must extend this visual system rather than introducing a different design.

The prototype must be implemented as clean, reusable, production-quality source code.

Do not create a generic landing page.

Do not use a prebuilt website template.

Do not use default shadcn/ui styling.

Do not imitate generic SaaS dashboards.

The finished application must feel like a premium professional certification and digital-trust institution.

======================================================================
1. PRODUCT IDENTITY
======================================================================

Organization:

Centre for Digital Risk & Leadership

Abbreviation:

CDRL

Tagline:

Advancing Trust in the Digital Age

Core areas:

- Cybersecurity
- Governance, Risk, and Compliance
- AI Governance and Digital Ethics
- Executive and Digital Leadership
- Corporate Training
- Advisory and Consulting
- Professional Certification
- Digital Trust

Brand personality:

- Authoritative
- Modern
- Institutional
- Security-conscious
- Editorial
- African and globally relevant
- Professional
- Confident
- Premium
- Approachable
- Precise

The website must communicate that CDRL is a serious professional institution—not a casual online-course marketplace.

======================================================================
2. REQUIRED STACK
======================================================================

Use:

- Next.js with the latest stable App Router
- React
- TypeScript with strict mode
- Tailwind CSS where useful
- CSS Modules or global CSS for precise prototype styling
- Framer Motion
- Lucide React icons
- next/font
- next/image
- ESLint
- Prettier

The prototype must be capable of connecting to a separate Node.js backend later.

Create a clean API boundary.

Do not access Prisma or a database directly from the frontend.

For the approved prototype, local typed data may be used through a repository or service abstraction so it can later be replaced by real API calls without redesigning components.

Example:

```text
Next.js UI
    ↓
Typed data service
    ↓
Mock repository for prototype
    ↓ later replaced with
Node.js REST API
Do not hardcode data directly throughout visual components.

====================================================================== 3. REFERENCE MATERIALS
Inspect these supplied reference screenshots before implementing:

uploads/ 
C:\Users\USER\Desktop\PROJECTS\CDRL\cdrlFE\cdrl-platform\apps\web\uplods

Use the screenshots to understand:

Layout proportions
Page width
Header structure
Hero composition
Content hierarchy
Heading sizes
Text wrapping
Card dimensions
Section spacing
Footer structure
Responsive intent
The screenshots may show an earlier palette.

Do not reproduce the earlier colors.

Apply the approved palette in this specification while preserving the reference layout and visual hierarchy.

====================================================================== 4. APPROVED COLOR PALETTE
Use only these four primary brand colors.

PRIMARY BRAND GREEN

#70F250
RGB 112, 242, 80
Use for:

Primary buttons
Links
Active navigation
Focus indicators
Progress
Certification highlights
Course icons
Arrows
Shopping-bag count
Selected states
Important interactions
Eyebrows on dark sections
BLACK

#000000
RGB 0, 0, 0
Use for:

Primary navigation
Utility bar
Hero sections
Page heroes
Footer
LMS shell
Course-detail hero
Cybersecurity sections
Executive sections
Institutional CTA panels
Primary text on peach
DEEP GREEN

#013920
RGB 1, 57, 32
Use for:

Trust and security surfaces
Course cards
Governance content
Cybersecurity content
AI-governance content
Corporate-training sections
Selected filters
Institutional depth
Borders on peach
Supporting text on peach
PEACH

#FFF7E4
RGB 255, 247, 228
Use for:

Educational surfaces
Course details
Articles
Research
Forms
Learning content
Floating information cards
Content pages
Learning-plan pages
Footer and dark-surface typography
Create these tokens:

:root {
  --cdrl-green: #70f250;
  --cdrl-black: #000000;
  --cdrl-deep-green: #013920;
  --cdrl-peach: #fff7e4;

  --cdrl-text-dark: #000000;
  --cdrl-text-light: #fff7e4;
  --cdrl-text-muted-dark: rgba(1, 57, 32, 0.78);
  --cdrl-text-muted-light: rgba(255, 247, 228, 0.72);

  --cdrl-border-dark: rgba(112, 242, 80, 0.28);
  --cdrl-border-light: rgba(1, 57, 32, 0.22);
  --cdrl-focus: #70f250;
}
Do not use legacy CDRL colors such as:

#071722
#087F74
#B6DFD5
#F1EFE9
Do not add blue, purple, orange, or unrelated accent colors.

Opacity variations of the four approved colors are allowed.

====================================================================== 5. TYPOGRAPHY
Use:

Manrope for headings
DM Sans for body text
Load both with next/font/google.

Example:

import { DM_Sans, Manrope } from "next/font/google";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
Typography characteristics:

Editorial
Tight heading tracking
Compact heading line height
Strong hierarchy
Comfortable body line height
Small uppercase eyebrows
Controlled line lengths
Recommended sizes:

Desktop hero: 56–64px
Desktop page hero: 56–60px
Desktop section heading: 40–46px
Course card heading: 22–24px
Body: 15–18px
Eyebrow: 10–11px
Mobile hero: 40–44px
Mobile section heading: 32–36px
Heading tracking:

letter-spacing: -0.045em;
Eyebrow tracking:

letter-spacing: 0.15em;
Do not substitute Inter, Arial, Roboto, serif fonts, or browser-default typography.

====================================================================== 6. DESIGN PRINCIPLES
The prototype must use:

Large editorial typography
Strong black foundations
Bright green interactive energy
Deep-green institutional surfaces
Peach learning surfaces
Structured grid layouts
Thin borders
Generous negative space
Minimal corner rounding
Precise alignment
Restrained shadows
Small uppercase section labels
Functional iconography
Strong contrast
Consistent content widths
Do not use:

Excessive rounded rectangles
Glassmorphism
Generic gradients
Decorative blobs
Generic dashboard cards
Cartoon illustrations
Large drop shadows on every component
Oversized pill buttons
Unrelated accent colors
Excessive animations
Template-like landing-page sections
====================================================================== 7. LAYOUT SYSTEM
Use a centered content container.

.cdrl-container {
  width: min(100% - 56px, 1184px);
  margin-inline: auto;
}

@media (max-width: 700px) {
  .cdrl-container {
    width: min(100% - 40px, 1184px);
  }
}
Spacing system:

Large desktop sections: 90–110px vertical
Medium sections: 65–80px vertical
Mobile sections: 65–80px vertical
Card gaps: 18–30px
Large column gaps: 70–100px
Desktop side padding: 28px
Mobile side padding: 20px
Primary breakpoints:

Desktop: greater than 1040px
Tablet: 701px–1040px
Mobile: 700px and below
====================================================================== 8. REQUIRED ROUTES
Build real Next.js App Router routes.

/
 /about
 /training
 /training/[slug]
 /corporate-training
 /advisory
 /research
 /events
 /partnerships
 /leadership
 /contact
 /learning-plan
Also create:

/not-found
Use:

next/link
Route-specific metadata
Shared root layout
Shared header and footer
Loading states where necessary
Error boundaries where appropriate
Deep-link support
Browser back and forward support
Do not implement routing through a single React state variable.

====================================================================== 9. GLOBAL ANNOUNCEMENT BAR
Display:

“Registration is open for our June 2026 certification cohort”

Action:

“View programs”

Behavior:

The action navigates to Events
Entire text remains legible on mobile
Arrow moves slightly on hover
Visual treatment:

Green background
Black text
Black action text
Compact 34px approximate height
Small type
Centered content
====================================================================== 10. UTILITY BAR
Display:

Left:

“Advancing Trust in the Digital Age”

Right:

Partner With Us
Learning Portal
EN
Language chevron
Visual treatment:

Black background
Peach text
Peach text at reduced opacity where appropriate
Compact height
Small type
No oversized controls
“Partner With Us” navigates to Partnerships.

“Learning Portal” may navigate to a prototype Learning Plan or future login destination, but it must not be a dead button.

====================================================================== 11. PRIMARY HEADER
Create an original CDRL logo lockup.

LOGO

Green geometric “C” mark
CDRL wordmark
Full organization name underneath
Peach text on the black header
Compact institutional treatment
DESKTOP NAVIGATION

Home
About
Training
Corporate Training
Advisory
Research
Events
Partnerships
Leadership
Contact
ACTIONS

Search
Learning Plan
Learning-plan count
Mobile-menu trigger
Visual treatment:

Black background
Peach navigation links
Green hover and active states
Deep-green bottom border
Sticky position
Approximately 78px height
No white navigation bar
SEARCH INTERACTION

Clicking Search opens a header-relative search panel.

The panel must have:

Black background
Peach text
Green focus indicator
Search icon
Meaningful placeholder
Escape-to-close
Automatic input focus
Correct focus restoration
MOBILE MENU

Use:

Black panel
Peach links
Deep-green separators
Green arrows
Green active state
Functional close control
Accessible focus behavior
aria-expanded
aria-controls
====================================================================== 12. HOMEPAGE
Build the homepage in this exact order.

12.1 HERO
Eyebrow:

“CENTRE FOR DIGITAL RISK & LEADERSHIP”

Heading:

“Advancing Trust in the Digital Age.”

Supporting text:

“Professional certification training in cybersecurity, governance, AI risk, and digital leadership—built for Africa's evolving digital economy.”

Actions:

Explore Training Programs
Book Corporate Training
Proof points:

4 — Specialist learning tracks
14+ — Professional programs
Global — Standards, African context
Visual treatment:

Black background
Peach heading
Green emphasized phrase
Muted peach supporting text
Green primary CTA with black text
Green-bordered secondary CTA
Deep-green proof-point dividers
Hero visual:

Large vertical deep-green security shape
Shape may resemble a shield or tall rounded institutional frame
Green offset shadow
Large green shield icon
Peach floating upcoming-cohort card
Deep-green or green trust statement card
Layered but controlled composition
Upcoming card:

Next cohort
ISO 27001 Lead Implementer
June 2026 · Lagos / Virtual
Trust statement:

Digital trust starts with capable leaders.
On mobile:

Stack copy above visual
Stack CTA buttons
Keep floating cards visible
Prevent overlap and horizontal overflow
12.2 WHO WE ARE
Eyebrow:

“WHO WE ARE”

Heading:

“Building the professionals who will secure and govern Africa's digital future.”

Body:

“CDRL is a professional eLearning and advisory platform equipping individuals and organizations with practical knowledge, globally recognized frameworks, and leadership capabilities.”

Action:

“Discover CDRL”

Visual treatment:

Peach background
Two-column editorial layout
Black heading
Green emphasized phrase
Deep-green body copy
Black or deep-green text link
Green arrow interaction
12.3 TRAINING TRACKS
Eyebrow:

“OUR TRAINING TRACKS”

Heading:

“Expertise for every layer of digital trust.”

Action:

“View all programs”

Cards:

Cybersecurity

“Build practical information security and cyber resilience capabilities.”

Governance, Risk & Compliance

“Strengthen enterprise risk, compliance, and governance practices.”

AI Governance & Digital Ethics

“Lead responsible AI adoption with confidence and accountability.”

Executive Leadership

“Equip boards and leaders to govern technology and digital risk.”

Visual treatment:

Black section
Four-column desktop grid
Deep-green borders
Small numbered labels
Green icons
Peach headings
Muted peach descriptions
Green arrows
Deep-green hover background
Entire card clickable
Minimal corner radius
12.4 FEATURED CERTIFICATIONS
Eyebrow:

“FEATURED CERTIFICATIONS”

Heading:

“Start your next professional milestone.”

Action:

“Browse marketplace”

Show:

ISO/IEC 27001 Foundation
ISO/IEC 27001 Lead Implementer
ISO/IEC 27001 Lead Auditor
Course-card treatment:

Deep-green background
Peach typography
Green book icon
Green arrow
Track and delivery metadata
Thin green divider
Black hover background
Upward hover movement of 3–4px
No heavy shadow
12.5 CORPORATE TRAINING
Eyebrow:

“FOR ORGANIZATIONS”

Heading:

“Build a workforce ready for tomorrow's digital risks.”

Body:

“From cyber awareness to executive briefings, our tailored programs turn digital risk into organizational resilience.”

Services:

Cybersecurity Awareness Training
Executive Cyber Risk Briefings
Digital Risk Assessments
Governance Workshops
Action:

“Explore Corporate Training”

Visual treatment:

Deep-green background
Green eyebrow
Peach heading
Peach supporting text
Green service numbers
Green check icons
Green horizontal dividers
Green or peach CTA with sufficient contrast
12.6 UPCOMING PROGRAM
Display:

18–21
June 2026
ISO/IEC 27001 Lead Implementer
Lagos / Virtual
4-day intensive
Register Now
Visual treatment:

Peach background
Editorial horizontal layout
Large black date
Deep-green details
Green CTA
Stack cleanly on mobile
12.7 RESEARCH AND INSIGHTS
Eyebrow:

“RESEARCH & INSIGHTS”

Heading:

“Ideas shaping digital leadership.”

Action:

“All insights”

Articles:

The Future of AI Governance in Africa
Why Cybersecurity Leadership Matters
Understanding ISO 27001 for Organizations
Card treatment:

Peach background
Deep-green borders
Deep-green category label
Black heading
Deep-green body text
Green arrow
Deep-green hover background
Peach hover typography
No large border radius
12.8 LEADERSHIP PREVIEW
Display:

Adeyinka Oladimeji MSc

Founder & Lead Trainer

PECB Certified Trainer
ISO/IEC 27001 Lead Auditor
Cybersecurity Educator & Governance Advisor

Action:

“Meet our founder”

Use the supplied professional portrait asset.

Do not generate a replacement.

Visual treatment:

Black background
Portrait on the left
Content on the right
Green eyebrow
Peach heading
Green role
Muted peach supporting text
Green CTA
Exact controlled image crop
Stacked mobile layout
====================================================================== 13. TRAINING MARKETPLACE
Route:

/training
Page hero:

Eyebrow:

“TRAINING & CERTIFICATION”

Heading:

“Credentials that build confidence.”

Description:

“Discover flexible, practitioner-led programs designed to advance careers and strengthen organizations.”

Use:

Black page hero
Green eyebrow
Peach heading
Muted peach description
CATALOG

Use a peach surface.

Include:

Search input
Track filters
Responsive course grid
Functional filtering
Functional course navigation
Empty result state
Filters:

All
Cybersecurity
GRC
AI Governance
Executive Leadership
Course data:

CYBERSECURITY

ISO/IEC 27001 Foundation
ISO/IEC 27001 Lead Implementer
ISO/IEC 27001 Lead Auditor
Cybersecurity Fundamentals
GRC

Enterprise Risk Management
ISO 31000 Risk Management
Compliance & Regulatory Governance
AI GOVERNANCE

AI Governance Fundamentals
Responsible AI Leadership
AI Risk Management
ISO/IEC 42001 AI Management Systems
EXECUTIVE LEADERSHIP

Cybersecurity for Executives
Digital Risk for Board Leaders
Technology Governance & Leadership
Each course includes:

Title
Subtitle
Track
Level
Delivery mode
Slug
Course-card colors:

Deep green background
Peach text
Green icons
Green arrows
Green divider
Black hover background
====================================================================== 14. COURSE DETAILS
Route:

/training/[slug]
Course-detail hero:

Black background
Back to Training
Green track and level
Peach course title
Green course subtitle
Muted peach description
Content surface:

Peach background
Black headings
Deep-green body text
Green check icons
Include:

Course overview
What you receive
Delivery information
Flexible schedule
Availability across Africa
Add to Learning Plan
Corporate-enrollment note
“What you receive”:

Expert-led learning experience
Digital course materials
Practical exercises and case studies
Assessment and completion credential
Continued access through the CDRL learning portal
“Add to Learning Plan” must:

Add the course to client state.
Persist the plan in local storage for the prototype.
Update the header count.
Navigate to /learning-plan.
Prevent duplicate items.
Abstract persistence so it can later use a backend endpoint.

====================================================================== 15. LEARNING PLAN
Route:

/learning-plan
Preserve two states.

EMPTY

Heading:

“Your learning journey starts here.”

Message:

“No programs selected yet.”

Body:

“Explore the marketplace and add a program to your learning plan.”

Action:

“Explore Training”

SELECTED

Heading:

“1 program selected.”

Use plural text for multiple items.

Message:

“Ready to speak with an enrollment advisor?”

Body:

“We will help you confirm delivery options, dates, and enrollment.”

Action:

“Complete Enquiry”

Visual treatment:

Black page hero
Peach content surface
Green shopping-bag icon
Black heading
Deep-green body
Green CTA
Black CTA text
The selected-state action navigates to Contact.

====================================================================== 16. ABOUT
Route:

/about
Page hero:

Eyebrow:

“ABOUT CDRL”

Heading:

“Purpose-led. Practice-focused. Africa-ready.”

Description:

“We help professionals and organizations lead with confidence in a world defined by technology and risk.”

Sections:

Who We Are
Our Mission
Our Vision
Our Core Values
Mission:

“To equip professionals and organizations with the knowledge, frameworks, and leadership required to manage digital risks in an evolving technological landscape.”

Vision:

“To become a leading African hub for digital risk education, cybersecurity leadership, and governance excellence.”

Core values:

Integrity
Excellence
Innovation
Professional Leadership
Digital Trust
Use the approved numbered editorial-row layout.

====================================================================== 17. CORPORATE TRAINING
Route:

/corporate-training
Eyebrow:

“CORPORATE TRAINING”

Heading:

“Turn digital risk awareness into organizational resilience.”

Description:

“Tailored learning experiences for teams, executives, and boards.”

Sections:

Why Corporate Training Matters
Our Services
Risks:

Cyber attacks
Insider threats
Regulatory exposure
Services:

Cybersecurity Awareness Training
Executive Cyber Risk Briefings
Digital Risk Assessments
Governance Workshops
Use:

Black page hero
Peach content
Deep-green editorial rows
Green icons
Final black CTA panel
====================================================================== 18. ADVISORY
Route:

/advisory
Eyebrow:

“ADVISORY & CONSULTING”

Heading:

“Practical guidance for stronger digital governance.”

Description:

“Translate standards and risk priorities into systems your organization can operate and sustain.”

Services:

ISO 27001 Implementation
Cybersecurity Risk Assessment
Information Security Audits
Digital Governance Advisory
Business Continuity Planning
Use the approved content-page system.

====================================================================== 19. RESEARCH
Route:

/research
Eyebrow:

“RESEARCH & INSIGHTS”

Heading:

“Clear thinking for complex digital questions.”

Description:

“Analysis and practical commentary for decision-makers across Africa.”

Articles:

The Future of AI Governance in Africa
Why Cybersecurity Leadership Matters
Understanding ISO 27001 for Organizations
Use:

Black page hero
Peach article surface
Deep-green borders
Black headings
Green article accents
Article cards must be interactive and must not be dead buttons.

For the prototype, they may open a simple article preview panel or a dynamic article route if implemented.

====================================================================== 20. EVENTS
Route:

/events
Eyebrow:

“EVENTS & MASTERCLASSES”

Heading:

“Learn live. Lead with confidence.”

Description:

“Join upcoming certification programs, briefings, and practitioner masterclasses.”

Events:

ISO/IEC 27001 Lead Implementer

June 18–21, 2026
Lagos / Virtual
Four-day intensive program
Official course materials
Certification exam preparation
Cyber Risk Leadership Masterclass

August 2026
Virtual
For senior leaders and board members
Executive briefing format
Every Register action must work.

For the prototype, registration may open a functional modal or navigate to Contact with the event interest preselected.

====================================================================== 21. PARTNERSHIPS
Route:

/partnerships
Eyebrow:

“PARTNERSHIPS”

Heading:

“Stronger ecosystems build greater digital trust.”

Description:

“We collaborate with institutions that share our commitment to capability, standards, and responsible innovation.”

Sections:

Certification Bodies
Universities
Corporate Partners
Do not invent partner names or accreditations.

Use descriptive institutional content only.

====================================================================== 22. LEADERSHIP
Route:

/leadership
Eyebrow:

“LEADERSHIP”

Heading:

“Experience that turns knowledge into action.”

Description:

“Meet the practitioner behind CDRL's mission.”

Display:

Adeyinka Oladimeji MSc

Founder & Lead Trainer

PECB Certified Trainer
ISO/IEC 27001 Lead Auditor
Cybersecurity Educator & Governance Advisor

Biography:

“Adeyinka brings professional expertise in information security, governance, and leadership development to every CDRL engagement. His work helps professionals move beyond theory and enables organizations to build practical, sustainable digital trust capabilities.”

Quote:

“Africa's digital future depends on leaders who understand both opportunity and responsibility.”

Use the supplied portrait and preserve its crop.

Do not fabricate further qualifications or employment history.

====================================================================== 23. CONTACT
Route:

/contact
Eyebrow:

“CONTACT”

Heading:

“Let's build digital trust together.”

Description:

“Tell us how CDRL can support your professional or organizational goals.”

Contact details:

training@cdrl.africa
+234 (0) 000 000 0000
Lagos, Nigeria
LinkedIn
Form fields:

Name
Organization
Interest
Message
Interest options:

Professional Training
Corporate Training
Advisory & Consulting
Partnership
Form behavior:

Validate required fields
Show accessible inline errors
Show a submission state
Show a success state
Do not reload the page
Success:

Heading:

“Thank you.”

Message:

“Your message has been received. Our team will respond shortly.”

For the prototype, submission may use a mock asynchronous service.

Keep the service abstract so it can later call a Node.js API.

====================================================================== 24. SHARED CONTENT-PAGE CTA
At the end of institutional pages, show:

Heading:

“Ready to take the next step?”

Action:

“Talk to CDRL”

Visual treatment:

Black panel
Peach heading
Green CTA
Black CTA text
Green arrow movement
The action navigates to Contact.

====================================================================== 25. FOOTER
Create a complete footer.

Top area:

Light CDRL logo

Description:

“Professional education for cybersecurity, governance, AI risk, and digital leadership.”

Action:

“Talk to our team”

Footer columns:

TRAINING

Cybersecurity
GRC
AI Governance
Executive Leadership
FOR ORGANIZATIONS

Corporate Training
Advisory
Partnerships
Digital Risk Assessments
CDRL

About
Research
Events
Leadership
Contact
CONTACT

training@cdrl.africa
+234 (0) 000 000 0000
Lagos, Nigeria · Serving Africa
LinkedIn
Legal row:

Copyright
Privacy
Terms
Accessibility
Visual treatment:

Black background
Green headings
Peach text
Muted peach links
Green hover states
Deep-green dividers
Responsive grid
Two columns on mobile
No footer link may be dead.

Create simple legal pages if the links are included.

====================================================================== 26. ANIMATIONS
Use Framer Motion for restrained, professional animation.

Create shared motion tokens:

export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.32,
    slow: 0.55,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
  },
};
PAGE TRANSITIONS

Opacity 0 to 1
Translate Y 8px to 0
Duration 280–350ms
Do not animate the persistent header and footer
SECTION REVEALS

Opacity 0 to 1
Translate Y 20–28px to 0
Duration 450–600ms
Trigger once
Subtle card stagger of 50–80ms
CARDS

On hover:

Translate Y -3px or -4px
Arrow moves 4–6px right
Border transitions to green
Background transitions according to the approved palette
Duration 180–240ms
BUTTONS

On hover:

Arrow moves 4px right
Colors transition
No dramatic scale
On press:

Scale to approximately 0.98
HERO

Copy fades and rises
Hero visual fades in after copy
Floating cards enter from opposite sides
Shield icon fades or draws in
Optional subtle idle motion on floating cards
Maximum idle translation: 4–6px
Idle duration: 5–7 seconds
NAVIGATION

Green text transition
Search panel fades and slides down
Mobile menu fades and slides down
Slight row staggering
SUCCESS STATE

Check icon scales from 0.9 to 1
Fade in
No confetti
No particles
Do not animate:

Every paragraph
Every icon continuously
Content in ways that delay reading
Large sections with dramatic parallax
Navigation with long delays
====================================================================== 27. REDUCED MOTION
Use useReducedMotion() for Framer Motion.

Also include:

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
When reduced motion is enabled:

Content is immediately visible
No continuous floating movement
No transform-based route reveal
Simple color changes may remain
====================================================================== 28. ACCESSIBILITY
Target WCAG 2.2 AA.

Implement:

Skip-to-content link
Semantic header, main and footer
Correct heading order
Keyboard-accessible navigation
Visible green focus rings
Accessible mobile menu
Accessible search
Accessible forms
Proper labels
Inline validation
Error summaries where appropriate
Screen-reader success announcements
Descriptive portrait alt text
Correct button and link semantics
Sufficient contrast
Reduced-motion support
Minimum practical touch targets
Do not rely on bright green small text over peach where contrast is insufficient.

On peach:

Use black for primary text
Use deep green for supporting text
Use green for controls, icons and larger accents
====================================================================== 29. PROTOTYPE DATA ARCHITECTURE
Create typed data files or services.

Suggested:

src/
  data/
    courses.ts
    pages.ts
    events.ts
    articles.ts
    navigation.ts
  services/
    course-service.ts
    content-service.ts
    learning-plan-service.ts
    contact-service.ts
  types/
    course.ts
    content.ts
    event.ts
Example course type:

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  track:
    | "Cybersecurity"
    | "GRC"
    | "AI Governance"
    | "Executive Leadership";
  level: string;
  deliveryMode: string;
  overview: string;
}
The visual components must receive data through props.

Do not place the full course catalog inside the page JSX.

====================================================================== 30. RECOMMENDED SOURCE STRUCTURE
app/
  layout.tsx
  page.tsx
  globals.css
  not-found.tsx

  about/
    page.tsx

  training/
    page.tsx
    [slug]/
      page.tsx

  corporate-training/
    page.tsx

  advisory/
    page.tsx

  research/
    page.tsx

  events/
    page.tsx

  partnerships/
    page.tsx

  leadership/
    page.tsx

  contact/
    page.tsx

  learning-plan/
    page.tsx

components/
  brand/
    Logo.tsx

  layout/
    AnnouncementBar.tsx
    UtilityBar.tsx
    Header.tsx
    MobileNavigation.tsx
    SearchPanel.tsx
    Footer.tsx
    PageTransition.tsx

  actions/
    PrimaryButton.tsx
    SecondaryButton.tsx
    TextLink.tsx

  typography/
    Eyebrow.tsx
    DisplayHeading.tsx
    SectionHeading.tsx

  cards/
    TrainingTrackCard.tsx
    CourseCard.tsx
    InsightCard.tsx
    EventCard.tsx

  sections/
    PageHero.tsx
    SectionHeader.tsx
    EditorialRows.tsx
    CTASection.tsx

  forms/
    ContactForm.tsx
    FormField.tsx
    SelectField.tsx
    TextareaField.tsx

  motion/
    Reveal.tsx
    StaggerGroup.tsx
    StaggerItem.tsx

features/
  courses/
  learning-plan/
  contact/
  search/

data/
services/
types/
public/
  images/
  icons/
====================================================================== 31. RESPONSIVE REQUIREMENTS
DESKTOP

Full navigation
Two-column hero
Four-column training-track grid
Three-column featured-course grid
Three-column insight grid
Two-column corporate section
Horizontal upcoming-event row
Two-column leadership section
Four-column footer
TABLET

Mobile navigation
Two-column track grid
Two-column course grid where appropriate
Reduced heading sizes
Reduced hero visual
Two-column footer
MOBILE

Stacked hero
Stacked CTAs
Hero visual after copy
Repositioned floating cards
Single-column track grid
Single-column course grid
Single-column insight grid
Stacked corporate section
Stacked upcoming event
Stacked leadership section
Single-column content rows
Single-column contact form
Two-column compact footer
Stacked legal row
Test at:

1440 × 1000
1280 × 800
1024 × 900
768 × 1024
390 × 844
360 × 800
Do not allow horizontal scrolling.

====================================================================== 32. METADATA
Default title:

“CDRL | Centre for Digital Risk & Leadership”

Default description:

“CDRL professional training in cybersecurity, governance, AI risk, and digital leadership certification across Africa.”

Theme color:

#000000
Create:

Favicon using black, green and peach
Route metadata
Open Graph defaults
Sitemap
Robots.txt
Canonical metadata
Do not change visible content solely for SEO.

====================================================================== 33. FUNCTIONAL REQUIREMENTS
Every visible interaction must work.

Required interactions:

Announcement CTA
Header navigation
Search open and close
Mobile menu
Course search
Course filters
Course-card navigation
Course details
Add to Learning Plan
Learning-plan count
Learning-plan persistence
Learning-plan empty state
Learning-plan selected state
Complete Enquiry action
Contact form
Contact validation
Contact success state
Event registration action
Research-card action
Footer navigation
External LinkedIn action
No dead buttons.

No href="#".

No placeholder alerts as the final interaction.

Use appropriate prototype-level panels, routes or state changes.

====================================================================== 34. VISUAL VALIDATION
Before implementation:

Inspect all supplied screenshots.
Record the layout proportions.
Record the component hierarchy.
Record the heading wrapping.
Record the spacing.
Record the responsive intent.
After implementation, capture screenshots at:

1440 × 1000
1024 × 900
390 × 844
Compare:

Header height
Hero height
Heading scale
Heading wrapping
Content width
Section spacing
Card proportions
Borders
Image crop
Button dimensions
Grid behavior
Footer structure
The palette should match this specification, even if the supplied screenshots show older colors.

====================================================================== 35. IMPLEMENTATION ORDER
Complete the work in this order:

Inspect screenshots and assets.
Create the Next.js application structure.
Configure TypeScript.
Configure fonts.
Add global color and spacing tokens.
Add typed prototype data.
Build the logo.
Build the announcement bar.
Build the utility bar.
Build the primary header.
Build search.
Build mobile navigation.
Build the footer.
Build reusable action components.
Build reusable typography components.
Build motion primitives.
Build the homepage hero.
Build Who We Are.
Build Training Tracks.
Build Featured Certifications.
Build Corporate Training.
Build Upcoming Program.
Build Research and Insights.
Build Leadership Preview.
Build the Training marketplace.
Build course details.
Build Learning Plan.
Build About.
Build Corporate Training.
Build Advisory.
Build Research.
Build Events.
Build Partnerships.
Build Leadership.
Build Contact.
Add route transitions.
Add section reveals.
Add card interactions.
Add reduced-motion support.
Add responsive behavior.
Add accessibility.
Add metadata.
Run visual comparisons.
Fix discrepancies.
Run linting.
Run type checking.
Run tests.
Run the production build.
Fix all errors.
Document the prototype structure.
Do not stop after creating the homepage.

====================================================================== 36. DEFINITION OF DONE
The approved prototype is complete only when:

All required routes exist.
All routes use the same approved design system.
The exact four-color palette is used.
No visible legacy palette remains.
Manrope is used for headings.
DM Sans is used for body text.
The black header is complete.
The hero matches the approved composition.
The training-track section is complete.
The course marketplace works.
Course filters work.
Course search works.
Course-detail routes work.
Learning-plan behavior works.
Learning-plan count updates.
Learning-plan persistence works.
Content pages are complete.
Leadership uses the supplied portrait.
Contact validation works.
Contact success state works.
Footer links work.
Animations are restrained and consistent.
Reduced-motion mode works.
Desktop layout is correct.
Tablet layout is correct.
Mobile layout is correct.
Accessibility checks pass.
No dead buttons remain.
No placeholder pages remain.
TypeScript strict mode passes.
Linting passes.
Production build passes.
FINAL INSTRUCTION:

Build the approved CDRL prototype as the authoritative frontend source for the wider CDRL platform.

Use the supplied screenshots for layout and composition, but apply the approved black, green, deep-green and peach palette.

Do not create a different interpretation of the interface.

Do not stop at planning or scaffolding.

Continue until every route, component, interaction, animation, responsive state and production build is complete.


## Final execution instruction to append

```text
Start by inspecting:

- uploads/image.png


Then implement the complete approved prototype.

The screenshots define layout and composition. The written palette in this specification defines the final colors.

Do not ask for clarification. Make implementation decisions that preserve the approved design concept.

Do not stop after creating files. Continue through visual validation, responsive testing, accessibility checks, linting, type checking and production build verification.