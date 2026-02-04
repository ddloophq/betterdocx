import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';

export const linkItems: LinkItemType[] = [
  { text: 'Home', url: '/' },
  { text: 'Docs', url: '/docs' },
  { text: 'Demos', url: 'https://github.com/ddloophq/betterdocx/tree/master/demo' },
  { text: 'API', url: 'https://docx.js.org/api/' },
  { text: 'GitHub', url: 'https://github.com/ddloophq/betterdocx' },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'better docx',
    },
  };
}
