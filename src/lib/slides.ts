export interface SlideSource {
  label: string;
  url?: string;
}

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  type: 'title' | 'content' | 'image' | 'split' | 'quote' | 'three-column' | 'highlight';
  content?: string[];
  content2?: string[];
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  quote?: string;
  quoteSource?: string;
  columns?: { title: string; items: string[] }[];
  highlight?: string;
  highlightSub?: string;
  codeBlock?: string;
  badge?: string;
  sources?: SlideSource[];
}

export const slides: SlideData[] = [
  // --- SLIDE 1: Title ---
  {
    id: 1,
    title: 'Research Plan Implement (RPI)',
    subtitle: 'A framework for working with AI agents',
    type: 'title',
    sources: [
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
    ],
  },

  // --- SLIDE 2: The Problem ---
  {
    id: 2,
    title: 'The Problem with AI in Real Codebases',
    type: 'content',
    content: [
      'AI works well on ==greenfield== projects, where there is little existing code and fewer constraints.',
      'AI tends to create more rework on ==brownfield== projects, where the codebase already has:',
    ],
    bullets: [
      'Existing patterns and conventions',
      'Hidden constraints and edge cases',
      'Complex dependencies',
    ],
    content2: [
      'When the model does not have that context, it fills gaps with guesses. Those guesses often compile, but they do not fit the system.',
    ],
  },

  // --- SLIDE 3: Greenfield vs Brownfield chart ---
  {
    id: 3,
    title: 'AI Productivity by Project Type',
    subtitle: 'Greenfield projects gain 30\u201335% on simple tasks vs 15\u201320% in brownfield',
    type: 'image',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qmNEOCJqcFYJQHi3IzkzgqPNG1b56G.png',
    imageAlt: 'Software Engineering Productivity Increases from AI Use \u2014 Stanford University',
    imageCaption:
      'When the model does not have context, it fills gaps with guesses. Those guesses often compile, but they do not fit the system.',
    sources: [
      {
        label: 'Stanford study on 100,000 developers on engineering productivity',
        url: 'https://proxify.io/articles/stanford-study-of-100000-developers-on-engineering-productivity',
      },
    ],
  },

  // --- SLIDE 4: The Rework Problem ---
  {
    id: 4,
    title: 'The Rework Problem',
    subtitle: 'Stanford Case Study: ~355 engineers in a large enterprise',
    type: 'image',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-CSmgHOJWgsSmoJUN14Lc7PQU1T35Tn.png',
    imageAlt: 'Adopting AI didn\u2019t increase effective output and increased rework by 2.6x',
    imageCaption:
      'Adopting AI didn\u2019t increase \u201ceffective output\u201d and increased rework by 2.6x. Not lines of code, but a metric that replicates a panel of human experts.',
    sources: [
      {
        label: 'Stanford study on 100,000 developers on engineering productivity',
        url: 'https://proxify.io/articles/stanford-study-of-100000-developers-on-engineering-productivity',
      },
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
    ],
  },

  // --- SLIDE 5: Context Engineering quote ---
  {
    id: 5,
    title: 'The Solution: Context Engineering',
    type: 'quote',
    content: [
      'The current best working solution to the problem of AI guessing solutions is applying good context engineering.',
    ],
    quote:
      'Building with language models is becoming less about finding the right words and phrases for your prompts (prompt engineering), and more about answering the broader question of \u201cwhat configuration of context is most likely to generate our model\u2019s desired behavior?\u201d',
    quoteSource: 'Anthropic \u2014 Effective context engineering for AI agents',
    sources: [
      {
        label: 'Effective context engineering for AI agents',
        url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
      },
    ],
  },

  // --- SLIDE 6: Prompt Eng vs Context Eng diagram ---
  {
    id: 6,
    title: 'Prompt Engineering vs. Context Engineering',
    type: 'image',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%202-nYbiC0AtwPwcML32KIajM4IvNXW3zQ.png',
    imageAlt: 'Prompt engineering for single turn queries vs Context engineering for agents',
    imageCaption:
      'Context engineering is about curating the right docs, tools, memory files, and instructions into the context window \u2014 not just crafting a single prompt.',
    sources: [
      {
        label: 'Effective context engineering for AI agents',
        url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
      },
    ],
  },

  // --- SLIDE 7: Suboptimal Usage ---
  {
    id: 7,
    title: 'Suboptimal Agent Usage',
    subtitle: 'The \u201cimplement X and steer\u201d anti-pattern',
    type: 'content',
    content: [
      'The inefficient way to use an AI agent is to say \u201cimplement X\u201d and then steer it with a long back-and-forth: \u201cDon\u2019t do that, do this\u2026\u201d',
      'This approach is slow and inefficient because:',
    ],
    bullets: [
      'The agent is constantly re-orienting',
      'You are debugging the agent\u2019s assumptions instead of the code',
      '==Rework== needs to be done',
      'The conversation accumulates noise that makes the agent worse over time',
    ],
  },

  // --- SLIDE 8: Optimal Agent Usage ---
  {
    id: 8,
    title: 'Optimal Agent Usage',
    subtitle: 'Better initial request = better results',
    type: 'content',
    content: [
      'To get a good response from an agent, you usually need a better initial request. A strong request includes:',
    ],
    bullets: [
      'The ==context== required to ==understand the system==',
      'The ==constraints== and conventions to follow',
      'A ==plan== or structure for how the change should be approached',
    ],
    content2: [
      'You don\u2019t need to provide all of this by hand. You can leverage the agent (or subagents) to help you build this.',
    ],
  },

  // --- SLIDE 9: Correct, Complete, Noise-Free ---
  {
    id: 9,
    title: 'What Good Context Looks Like',
    subtitle: 'The context you give the agent should be:',
    type: 'three-column',
    columns: [
      {
        title: 'Correct',
        items: [
          'The true rules and conventions',
          'Architecture constraints',
          'How things work in your team',
        ],
      },
      {
        title: 'Complete',
        items: [
          'Enough detail so the agent does not need to guess',
          'Relevant files and entry points',
          'Testing criteria',
        ],
      },
      {
        title: 'Noise-Free',
        items: [
          'No mixed tasks',
          'No irrelevant conversation',
          'No long threads of corrections (back and forth)',
        ],
      },
    ],
  },

  // --- SLIDE 10: Why Long Chats Get Worse ---
  {
    id: 10,
    title: 'Why Long Chats Get Worse',
    type: 'split',
    content: [
      'The more you reuse the same chat session (the context window), the less effective the agent becomes. Past a certain point, important details get drowned out by older, less relevant content.',
      'In my experience, \u201cthe dumb zone\u201d starts from 60% of the context window usage. When that happens I switch to another chat session.',
    ],
    bullets: [
      'Keep only relevant information in the chat',
      'Use subagents to read code, map features, and find relevant files',
      'Start a new chat when you move to a new task',
    ],
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_2026-03-02_at_11.04.35_am-0pkJXyw2ygIEuDtNTEV3nRpsZa4mLv.png',
    imageAlt: 'The smart zone vs the dumb zone in context window usage',
    sources: [
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
      {
        label: 'Geoffrey Huntley',
        url: 'https://ghuntley.com/loop/',
      },
    ],
  },

  // --- SLIDE 11: Subagents ---
  {
    id: 11,
    title: 'Managing Context with Subagents',
    type: 'split',
    content: [
      'Subagents are not primarily for \u201croleplay\u201d (e.g. \u201cQA Engineer\u201d or \u201cSEO Expert\u201d). They are a tool for controlling how much context the main agent has to carry.',
    ],
    bullets: [
      'Read code and map how a feature works',
      'Find relevant files',
      'Summarise findings back to the main agent',
      'Prevent overflowing the main context with raw code',
    ],
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%203-iCox59zNtkjQnXLFwYkDnZClvNElEr.png',
    imageAlt: 'Main Agent and Sub Agent context windows diagram',
    sources: [
      {
        label: 'The Cheat Sheet for Context Engineering',
        url: 'https://hai2.ai/the-cheat-sheet-for-context-engineering-76969369b7f5',
      },
    ],
  },

  // --- SLIDE 12: Progressive Disclosure (AGENTS.md) ---
  {
    id: 12,
    title: 'Progressive Disclosure: AGENTS.md',
    subtitle: 'Another approach to mitigate guessing in AI agents',
    type: 'split',
    content: [
      'Add AGENTS.md files in important directories to provide \u201clocal context\u201d \u2014 ownership, conventions, and architecture notes.',
      'This helps, but it can drift over time. Treat it like documentation: useful, but only if maintained.',
    ],
    bullets: [
      'Don\u2019t document files \u2014 they ARE the source of truth',
      'Layer context from org \u2192 team \u2192 repo \u2192 module \u2192 file',
    ],
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_2026-03-02_at_11.22.00_am-UBaWe9umWMKbiTVZM0hLMbI8Ighhf9.png',
    imageAlt:
      'Org to team to repos hierarchy \u2014 Don\u2019t Document files, they ARE the source of truth',
    sources: [
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
    ],
  },

  // --- SLIDE 13: RPI Framework intro ---
  {
    id: 13,
    title: 'The RPI Framework',
    subtitle: 'Research \u2192 Plan \u2192 Implement',
    type: 'highlight',
    highlight: 'R  P  I',
    highlightSub:
      'A lightweight way to manage the agent\u2019s context so you get predictable, correct output. It follows a three-step process.',
    sources: [
      {
        label: 'HumanLayer RPI Framework',
        url: 'https://github.com/humanlayer/humanlayer/tree/main',
      },
    ],
  },

  // --- SLIDE 14: Step 1 - Research ---
  {
    id: 14,
    title: 'Step 1: Research',
    type: 'split',
    badge: 'Research',
    content: [
      'Goal: build an objective, reliable picture of how the system works.',
      'A practical pattern is to treat Research as producing a single artifact: a research.md document that contains only verified facts about the current system \u2014 no implementation plan, no guesses or opinions.',
    ],
    bullets: [
      'Understand the current behaviour and architecture',
      'Find the relevant files and entry points',
      'Stay objective \u2014 describe what is, not what you think is wrong',
      'Leverage subagents so the main agent stays grounded in the codebase truth',
    ],
    codeBlock: `==/research_codebase==
Research how cart/account/product patterns are implemented so we can add a wishlist feature.
Focus on:
- localized routes and App Router structure
- server actions for mutations
- API route patterns
- e-comm provider method factories and GraphQL fragments
- auth/session requirements
- existing tests/stories for similar flows
Also include requirements described in ==docs/tickets/ABC-742-save-for-later-cart-items.md==.`,
  },

  // --- SLIDE 15: Step 2 - Plan ---
  {
    id: 15,
    title: 'Step 2: Plan',
    type: 'split',
    badge: 'Plan',
    content: [
      'Goal: make the work explicit before you start changing code.',
      'The Plan phase should result in a concrete sequence of steps. It is a good sign if the plan includes small code snippets or pseudo-diffs showing what will change.',
      'Important: do not outsource thinking. Read the plan, modify it, expand or cut it \u2014 the human stays in the loop.',
    ],
    bullets: [
      'Outline the implementation steps',
      'Include filenames, key lines, and snippets when helpful',
      'Be explicit about testing steps and acceptance criteria',
    ],
    codeBlock: `==/create_plan== docs/tickets/ABC-742-save-for-later-cart-items.md based on the research done in ==docs/research/ABC-742-save-for-later-cart-items.md==`,
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_2026-03-02_at_11.27.03_am-8UhFe7VxFNcUEWUvkwWtAciLUHWB6y.png',
    imageAlt: 'research.md + PRD/Ticket flowing into /create_plan producing plan.md',
    sources: [
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
    ],
  },

  // --- SLIDE 16: Hierarchy of Leverage ---
  {
    id: 16,
    title: 'Do not outsource thinking',
    subtitle:
      'Important: ==do not outsource thinking==. Read the plan, modify it, expand it, or cut it down until it is correct. The human stays in the loop.',
    type: 'content',
  },

  // --- SLIDE 17: Step 3 - Implement ---
  {
    id: 17,
    title: 'Step 3: Implement',
    type: 'split',
    badge: 'Implement',
    content: [
      'Goal: execute a plan that is already \u201cthought through.\u201d',
      'If the research and planning were done properly, implementation is usually straightforward.',
    ],
    bullets: [
      'Write the code',
      'Keep the active context small and focused',
      'Review and test as you go',
      'Commit in small chunks when possible',
      'Update the plan if reality changes',
    ],
    codeBlock: `==/implement_plan== ==docs/plans/ABC-742-save-for-later-cart-items.md==`,
  },

  // --- SLIDE 19: Scaling Complexity ---
  {
    id: 19,
    title: 'To a Hammer, Everything Is a Nail',
    subtitle: 'This workflow will not be the right approach for every task',
    type: 'split',
    content: [
      'Very small changes may not need a detailed research document. Very complex changes may need deeper research and more detailed planning.',
      'The \u201csweet spot\u201d is found through practice.',
    ],
    bullets: [
      'Small fixes \u2192 just talk to Claude',
      'Small features across 3\u20135 files \u2192 make a simple plan, then work the plan',
      'Medium features across multiple repos \u2192 do 1 research, then build a plan, then implement phase by phase',
      'Big refactors and whole new features \u2192 multiple research steps, multiple plans, many implement sessions',
    ],
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_2026-03-02_at_11.33.49_am-6Y4XqdHAe21s9GTSmjR5TrWLitoPhg.png',
    imageAlt: 'Chart showing harder problems require more compaction and context engineering',
    sources: [
      {
        label: 'No Vibes Allowed \u2014 Dex Horthy, HumanLayer',
        url: 'https://www.youtube.com/watch?v=rmvDxxNubIg',
      },
    ],
  },

  // --- SLIDE 20: Closing Thoughts ---
  {
    id: 20,
    title: 'Closing Thoughts',
    type: 'content',
    content: ['==The role of the developer is evolving.== Here\u2019s what matters now:'],
    bullets: [
      'Things are changing\u2026 ==fast==',
      'Developers are starting to ==write less code== and ==read more code== (code outputs from agents, PRs)',
      'A ==baseline== for how to use AI needs to be shared across the team so everyone has a good starting point',
      'Teams still need ==deep knowledge== of their tools and frameworks',
      'Developers are evolving from pure implementers into ==system designers== (architects) and reviewers',
      'Cultural change may be needed for AI agents to work well in a team setting \u2014 ==not everyone is on board==',
    ],
  },

  // --- SLIDE 21: Thank You ---
  {
    id: 21,
    title: 'Demo Time',
    subtitle: 'Demo of the RPI Framework in action in a TF2 project',
    type: 'content',
    bullets: [
      '[Get the code from the repository](https://github.com/damian-demasi-aligent/research-plan-implement-framework)',
    ],
  },
  // --- SLIDE 22: Thank You ---
  {
    id: 22,
    title: 'Thank You',
    subtitle: 'Questions?',
    type: 'title',
  },
];
