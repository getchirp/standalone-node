export interface SidebarGroup {
  label: string;
  items: { label: string; href: string }[];
}

export const sidebar: SidebarGroup[] = [
  {
    label: 'Getting started',
    items: [
      { label: 'Installation', href: '/docs/getting-started/installation' },
      { label: 'Update or remove Chirp', href: '/docs/getting-started/update-remove' },
      { label: 'Project structure', href: '/docs/getting-started/project-structure' },
      { label: 'Your first edit', href: '/docs/getting-started/your-first-edit' },
      { label: 'Local-only mode', href: '/docs/getting-started/local-only' },
    ],
  },
  {
    label: 'Content & schemas',
    items: [
      { label: 'Astro content collections', href: '/docs/content/collections' },
      { label: 'Field types', href: '/docs/content/field-types' },
      { label: 'Describe field attributes', href: '/docs/content/describe-attributes' },
      { label: 'Taxonomies in YAML', href: '/docs/content/taxonomies' },
      { label: 'Validation and limits', href: '/docs/content/validation' },
    ],
  },
  {
    label: 'Using the editor',
    items: [
      { label: 'Editing basics', href: '/docs/editor/basics' },
      { label: 'Command palette and shortcuts', href: '/docs/editor/navigation' },
      { label: 'Saving and conflicts', href: '/docs/editor/saving' },
      { label: 'Media library', href: '/docs/editor/media-library' },
    ],
  },
];
