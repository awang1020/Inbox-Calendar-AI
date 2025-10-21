# FlowTask – Modern Task Management Dashboard

FlowTask is a modern, responsive task management experience built with Next.js 14, TypeScript, and Tailwind CSS. It provides a Kanban-inspired workflow, rich filtering, and a sleek UI that works beautifully across desktop and mobile.

## ✨ Features

- **Task lifecycle management** – create, edit, delete, and categorize tasks across work, personal, study, wellness, and more.
- **Visual Kanban board** – organize tasks by status with color-coded priorities and inline status updates.
- **Powerful filters** – search, sort, and filter by category, priority, status, or deadline.
- **Progress insights** – track completion percentage and key metrics in an at-a-glance dashboard.
- **Dark mode ready** – built-in theme toggle powered by `next-themes`.

## 🧱 Project structure

```
.
├── app/                 # Next.js App Router pages and global layout
├── components/
│   ├── layout/          # App shell, header, global UI elements
│   ├── task/            # Task board, filters, forms, and stats
│   └── theme/           # Theme provider wrapper
├── context/             # Global state management (TaskProvider)
├── lib/                 # Shared utilities
├── public/              # Static assets
├── types/               # Shared TypeScript types
├── tailwind.config.ts   # Tailwind CSS configuration
└── README.md
```

## 🧠 State management

Task state is managed with a lightweight `TaskProvider` that wraps the app and exposes `addTask`, `updateTask`, and `deleteTask` actions through React context and a reducer. This keeps state colocated with UI logic while remaining easy to extend (e.g., replacing with a server-backed store).

## 🛠️ Getting started

```bash
pnpm install # or npm install / yarn install
pnpm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to explore the dashboard.

## 🧭 Best practices highlighted

- **Modular components** – UI is decomposed into focused components (`TaskCard`, `TaskBoard`, `TaskFilters`, etc.) to encourage reuse and scalability.
- **Type safety** – shared `Task` and enum types live in `types/` and are reused across components and context.
- **Design tokens** – Tailwind CSS powers design consistency with custom colors, radii, and shadows defined in the config.
- **Accessible interactions** – Buttons, filters, and the floating action button include focus states and descriptive labels.
- **Responsive-first layout** – the Kanban board and filters gracefully adapt to mobile, tablet, and desktop breakpoints.

Feel free to extend FlowTask with integrations, persistence, or automation workflows to fit your productivity style.
