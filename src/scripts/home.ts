type HomeElement = HTMLElement;

type SongMark = {
  height: number;
  accent: boolean;
};

type BlockDefinition = {
  props: string[];
  defaults: Record<string, string>;
  inline: boolean;
};

type Block = {
  id: number;
  tag: string;
  props: Record<string, string>;
  element: HomeElement;
  code: HomeElement;
  inline: boolean;
  popover?: HomeElement;
};

type MediaSelection = {
  name: string;
  path: string;
  size: string;
  art: string;
  kind?: string;
  src?: string;
};

type FrontmatterImage = {
  name: string;
  path: string;
  kb: string;
  hash: string;
  dimensions: string;
  src: string;
};

const one = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector);

const many = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(selector));

const textValue = (element: HomeElement) => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return element.textContent?.trim() ?? '';
};

const parseSpaceSeparated = (value: string) =>
  new Set(value.trim().split(/\s+/).filter(Boolean));

const parseCommaSeparated = (value: string) =>
  new Set(value.split(',').map((item) => item.trim()).filter(Boolean));

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type HomeTrustedTypes = Window & {
  trustedTypes?: {
    createPolicy: (name: string, rules: { createHTML: (value: string) => string }) => { createHTML: (value: string) => unknown };
  };
};

const homeHtmlPolicy = (window as HomeTrustedTypes).trustedTypes?.createPolicy('chirp-home', {
  createHTML: (value) => value,
});

const setHtml = (element: HomeElement, value: string) => {
  element.innerHTML = (homeHtmlPolicy?.createHTML(value) ?? value) as string;
};



const activate = (element: HomeElement | null, handler: () => void) => {
  if (!element) return;
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  });
};

const formatKilobytes = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function initHome() {
  if (!document.body.classList.contains('page-body-home')) return;
  if (document.documentElement.dataset.chirpHomeReady === 'true') return;
  document.documentElement.dataset.chirpHomeReady = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultTitle = 'One schema to rule the editor';
  const defaultPrimary = 'Get started';
  const defaultSecondary = 'See how it works';
  const state = {
    title: defaultTitle,
    primary: defaultPrimary,
    secondary: defaultSecondary,
    category: 'release-notes',
    tags: new Set(['plugins', 'preview']),
    related: new Set(['local-by-design', 'editor-canvas']),
    draft: true,
    described: false,
    blocks: [] as Block[],
    selectedMedia: null as MediaSelection | null,
    image: null as MediaSelection | null,
    fmImage: null as FrontmatterImage | null,
  };

  let saveTimer = 0;
  let blockSequence = 0;
  let addSongTick: () => void = () => undefined;
  let ctaBlock: Block | null = null;
  let titleTicked = false;
  let componentTicked = false;
  let categoryTicked = false;
  let tagsTicked = false;

  const header = one<HomeElement>('.site-header');
  let headerFrame = 0;
  const updateHeader = () => {
    headerFrame = 0;
    header?.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', () => {
    if (!headerFrame) headerFrame = window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  const markInteraction = () => {
    addSongTick();
    const wave = one<HomeElement>('[data-home-wave]');
    if (!wave) return;
    const tick = document.createElement('i');
    tick.className = 'accent interaction-tick';
    tick.setAttribute('aria-hidden', 'true');
    wave.append(tick);
    window.setTimeout(() => tick.remove(), reducedMotion ? 0 : 1800);
  };

  /* ---------- the accumulating songline ---------- */
  const songlineTrack = one<HomeElement>('[data-home-songline-track]');
  const closingSong = one<HomeElement>('[data-home-song-target]');
  const songMarks: SongMark[] = [];
  const songDot = document.createElement('span');
  songDot.className = 'home-songline-dot';
  songDot.setAttribute('aria-hidden', 'true');
  songlineTrack?.append(songDot);
  let songPlayed = false;

  const parseSong = (value: string | undefined) =>
    (value ?? '').split(',').map((part) => Number.parseInt(part, 10) || 6).filter(Boolean);

  const rebuildSong = () => {
    if (closingSong) closingSong.replaceChildren();
    songMarks.forEach((mark) => {
      const bar = document.createElement('i');
      if (mark.accent) bar.className = 'accent';
      const height = Math.min(72, Math.round(mark.height * 2.6));
      bar.dataset.height = String(height);
      bar.style.setProperty('--bar-scale', String(height / 2));
      if (songPlayed) bar.classList.add('is-grown');
      closingSong?.append(bar);
    });
  };

  const growSongPhrase = (phrase: HomeElement) => {
    window.requestAnimationFrame(() => {
      many<HomeElement>('i', phrase).forEach((bar, index) => {
        window.setTimeout(() => { bar.classList.add('is-grown'); }, reducedMotion ? 0 : 70 * index);
      });
    });
  };

  const addPhrase = (heights: number[], accentLast: boolean) => {
    if (!songlineTrack || !heights.length) return;
    const phrase = document.createElement('span');
    phrase.className = 'home-songline-phrase';
    heights.forEach((height, index) => {
      const bar = document.createElement('i');
      const accent = accentLast && index === heights.length - 1;
      const finalHeight = Math.round(height);
      bar.dataset.height = String(finalHeight);
      bar.style.setProperty('--bar-scale', String(finalHeight / 2));
      if (accent) bar.className = 'accent';
      phrase.append(bar);
      songMarks.push({ height: Math.round(height), accent });
    });
    songlineTrack.insertBefore(phrase, songDot);
    growSongPhrase(phrase);
    rebuildSong();
  };

  const addTick = () => {
    if (!songlineTrack) return;
    const phrase = document.createElement('span');
    phrase.className = 'home-songline-phrase';
    const bar = document.createElement('i');
    bar.className = 'accent';
    bar.dataset.height = '13';
    bar.style.setProperty('--bar-scale', '6.5');
    phrase.append(bar);
    songlineTrack.insertBefore(phrase, songDot);
    songMarks.push({ height: 13, accent: true });
    growSongPhrase(phrase);
    rebuildSong();
  };
  addSongTick = addTick;

  const songSections = many<HTMLElement>('[data-home-song]');
  if (songlineTrack && songSections.length) {
    addPhrase(parseSong(songSections[0].dataset.homeSong), true);
    if ('IntersectionObserver' in window) {
      const songObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          addPhrase(parseSong((entry.target as HTMLElement).dataset.homeSong), true);
          songObserver.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      songSections.slice(1).forEach((section) => songObserver.observe(section));
    } else {
      songSections.slice(1).forEach((section) => addPhrase(parseSong(section.dataset.homeSong), true));
    }
  }

  const playSong = () => {
    if (songPlayed) return;
    songPlayed = true;
    rebuildSong();
    many<HomeElement>('i', closingSong ?? document.createElement('div')).forEach((bar, index) => {
      window.setTimeout(() => { bar.classList.add('is-grown'); }, reducedMotion ? 0 : index * 22);
    });
  };

  const closingSection = one<HTMLElement>('#get');
  if (closingSection && 'IntersectionObserver' in window) {
    const closingObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.setTimeout(playSong, reducedMotion ? 0 : 300);
      closingObserver.disconnect();
    }, { threshold: 0.2 });
    closingObserver.observe(closingSection);
  }

  /* ---------- lightweight reveal-on-scroll ---------- */
  const revealElements = many<HTMLElement>('[data-home-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  }
  document.documentElement.classList.add('home-reveal-ready');

  /* ---------- mobile navigation ---------- */
  const mobileNav = one<HTMLDetailsElement>('.mobile-nav');
  many<HTMLAnchorElement>('a', mobileNav ?? document).forEach((link) => {
    if (mobileNav?.contains(link)) {
      link.addEventListener('click', () => mobileNav.removeAttribute('open'));
    }
  });

  /* ---------- terminal typing ---------- */
  const terminalOutput = one<HomeElement>('[data-terminal-output]');
  let terminalTyped = false;
  const terminalLines = [
    '<span class="terminal-prompt">~</span> pnpm astro add chirp',
    '<span class="terminal-ok">✓</span> added chirp@1.0.0 to devDependencies',
    '',
    '<span class="terminal-prompt">~</span> pnpm dev',
    '<span class="terminal-ok">chirp</span>  reading src/content.config.ts',
    '<span class="terminal-ok">chirp</span>  3 collections · 5 entries',
    '<span class="terminal-ready">chirp  ready → http://localhost:4321</span>',
  ];

  const typeTerminal = () => {
    if (!terminalOutput || terminalTyped) return;
    terminalTyped = true;
    terminalOutput.replaceChildren();
    let lineIndex = 0;
    const nextLine = () => {
      if (lineIndex >= terminalLines.length) {
        const caret = document.createElement('span');
        caret.className = 'terminal-caret';
        caret.setAttribute('aria-hidden', 'true');
        terminalOutput.append(caret);
        return;
      }
      const html = terminalLines[lineIndex++];
      const probe = document.createElement('div');
      setHtml(probe, html);
      const text = probe.textContent ?? '';
      const span = document.createElement('span');
      terminalOutput.append(span);
      let characterIndex = 0;
      const typeCharacter = () => {
        characterIndex += 1;
        span.textContent = text.slice(0, characterIndex);
        if (characterIndex < text.length) {
          window.setTimeout(typeCharacter, reducedMotion ? 0 : 14);
          return;
        }
        setHtml(span, html);
        terminalOutput.append(document.createTextNode('\n'));
        window.setTimeout(nextLine, reducedMotion ? 0 : 140);
      };
      if (!text.length) {
        terminalOutput.append(document.createTextNode('\n'));
        window.setTimeout(nextLine, reducedMotion ? 0 : 140);
      } else {
        typeCharacter();
      }
    };
    nextLine();
  };

  if (terminalOutput && 'IntersectionObserver' in window) {
    const terminalObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.setTimeout(typeTerminal, reducedMotion ? 0 : 350);
      terminalObserver.disconnect();
    }, { threshold: 0.4 });
    terminalObserver.observe(terminalOutput);
  } else {
    typeTerminal();
  }

  /* ---------- shared document targets ---------- */
  const publishedTitle = one<HomeElement>('[data-published-title]');
  const publishedChanged = one<HomeElement>('[data-published-changed]');
  const publishedFrontmatterImage = one<HomeElement>('[data-published-frontmatter-image]');
  const publishedBodyImage = one<HomeElement>('[data-published-body-image]');
  const publishedStaticArt = one<HomeElement>('[data-published-static-art]');
  const publishedCta = one<HomeElement>('[data-published-cta]');
  const collectionTitle = one<HomeElement>('[data-collection-title]');
  const collectionChangelogStatus = one<HomeElement>('[data-collection-changelog-status]');
  const collectionChangelogTags = one<HomeElement>('[data-collection-changelog-tags]');
  const diffCount = one<HomeElement>('[data-diff-count]');
  const diffBody = one<HomeElement>('[data-diff-body]');
  const editorSaved = one<HomeElement>('[data-editor-saved]');
  const editorDiff = one<HomeElement>('[data-editor-diff]');

  const editorTitle = one<HTMLInputElement>('[data-editor-title]');
  const drawerTitle = one<HomeElement>('[data-editor-title-drawer]');
  const editorFile = one<HTMLInputElement>('[data-editor-file]');
  const editorBrowse = one<HomeElement>('[data-editor-browse]');
  const editorImagePath = one<HomeElement>('[data-editor-image-path]');
  const editorImageHint = one<HomeElement>('[data-editor-image-hint]');
  const editorImagePreview = one<HomeElement>('[data-editor-image-preview]');
  const editorImageThumb = one<HTMLImageElement>('[data-editor-image-thumb]');

  const componentRoot = one<HomeElement>('.feature-visual-components');
  const editorWindow = one<HomeElement>('.editor-feature-window');
  const editorCanvas = one<HomeElement>('[data-editor-canvas]', editorWindow ?? document);
  const editorHint = one<HomeElement>('[data-editor-hint]', editorWindow ?? document);
  const slashMenu = one<HomeElement>('[data-slash-menu]', editorWindow ?? document);
  const editorBlocks = one<HomeElement>('[data-editor-blocks]', editorWindow ?? document);
  let selectedOption = 0;

  const schemaRoot = one<HomeElement>('.feature-visual-schema');
  const schemaToggle = one<HomeElement>('[data-schema-toggle]', schemaRoot ?? document);
  const schemaNote = one<HomeElement>('[data-schema-toggle-note]', schemaRoot ?? document);
  const schemaForm = one<HomeElement>('.schema-form', schemaRoot ?? document);
  const schemaCodeWindow = one<HomeElement>('.schema-code-window', schemaRoot ?? document);
  const schemaCodeDefault = one<HomeElement>('[data-schema-code-default]', schemaRoot ?? document);
  const schemaCodeRefined = one<HomeElement>('[data-schema-code-refined]', schemaRoot ?? document);
  const schemaCategory = one<HTMLInputElement>('[data-schema-category]', schemaRoot ?? document);
  const schemaTagsInputs = many<HTMLInputElement | HTMLTextAreaElement>('[data-schema-tags-input]', schemaRoot ?? document);
  const schemaRelatedInput = one<HTMLInputElement>('[data-schema-related-input]', schemaRoot ?? document);
  const schemaDraftInput = one<HTMLInputElement>('[data-schema-draft-input]', schemaRoot ?? document);
  const schemaDraftToggle = one<HomeElement>('[data-schema-draft-toggle]', schemaRoot ?? document);
  const schemaPreview = one<HomeElement>('[data-schema-preview]', schemaRoot ?? document);
  const schemaCategoryOptions = many<HomeElement>('[data-schema-category-option]', schemaRoot ?? document);
  const schemaRelated = many<HomeElement>('[data-schema-related]', schemaRoot ?? document);

  const collectionsRoot = one<HomeElement>('.feature-visual-collections');
  const collectionSearch = one<HomeElement>('[data-collection-search]', collectionsRoot ?? document);
  const collectionStatus = one<HomeElement>('[data-collection-status]', collectionsRoot ?? document);
  const collectionType = one<HomeElement>('[data-collection-type]', collectionsRoot ?? document);
  let statusFilter = 'all';
  let typeFilter = 'all';
  let searchPlaceholder = true;

  const mediaRoot = one<HomeElement>('.feature-visual-media');
  const mediaGrid = one<HomeElement>('[data-media-grid]', mediaRoot ?? document);
  const mediaSearch = one<HomeElement>('[data-media-search]', mediaRoot ?? document);
  const previewArt = one<HomeElement>('[data-media-preview-art]', mediaRoot ?? document);
  const previewName = one<HomeElement>('[data-media-preview-name]', mediaRoot ?? document);
  const previewPath = one<HomeElement>('[data-media-preview-path]', mediaRoot ?? document);
  const previewSize = one<HomeElement>('[data-media-preview-size]', mediaRoot ?? document);
  const previewHint = one<HomeElement>('[data-media-preview-hint]', mediaRoot ?? document);
  const mediaPostLine = one<HomeElement>('[data-media-post-line]', mediaRoot ?? document);
  const mediaPostImage = one<HomeElement>('[data-media-post-image]', mediaRoot ?? document);
  const mediaPostStatus = one<HomeElement>('[data-media-post-status]', mediaRoot ?? document);
  const mediaInsert = one<HTMLButtonElement>('[data-media-insert]', mediaRoot ?? document);
  const mediaReveal = one<HTMLButtonElement>('[data-media-reveal]', mediaRoot ?? document);

  const blockDefinitions: Record<string, BlockDefinition> = {
    CtaPair: { props: ['primary', 'secondary'], defaults: { primary: defaultPrimary, secondary: defaultSecondary }, inline: false },
    Card: { props: ['title'], defaults: { title: 'Local by design' }, inline: true },
    Image: { props: ['src', 'alt'], defaults: { src: 'src/images/editor-canvas.png', alt: 'The editor canvas' }, inline: false },
    Hero: { props: ['heading'], defaults: { heading: 'Your Astro content.' }, inline: false },
  };

  const renderBlockSource = (block: Block) => {
    const definition = blockDefinitions[block.tag] ?? { props: [], defaults: {}, inline: false };
    const attributes = definition.props
      .filter((prop) => block.props[prop])
      .map((prop) => `${prop}="${block.props[prop]}"`)
      .join(' ');
    return `<${block.tag}${attributes ? ` ${attributes}` : ''} />`;
  };

  const renderBlockMarkup = (block: Block) => {
    const definition = blockDefinitions[block.tag] ?? { props: [], defaults: {}, inline: false };
    const attributes = definition.props
      .filter((prop) => block.props[prop])
      .map((prop) => ` <span class="mdx-attribute">${escapeHtml(prop)}="${escapeHtml(block.props[prop])}"</span>`)
      .join('');
    return `<span class="mdx-punctuation">&lt;</span><span class="mdx-tag">${escapeHtml(block.tag)}</span>${attributes} <span class="mdx-punctuation">/&gt;</span>`;
  };

  const hasCtaBlock = () => state.blocks.some((block) => block.tag === 'CtaPair');

  const changedCount = () => {
    let count = 0;
    if (hasCtaBlock()) count += 1;
    if (state.image) count += 1;
    if (state.fmImage) count += 1;
    if (state.tags.size) count += 1;
    if (!state.draft) count += 1;
    if (state.category !== 'release-notes') count += 1;
    if (state.title !== defaultTitle) count += 1;
    return count;
  };

  const renderMediaArt = (target: HomeElement, media: MediaSelection, alt = media.name) => {
    target.replaceChildren();
    if (media.src) {
      const image = document.createElement('img');
      image.src = media.src;
      image.alt = alt;
      target.append(image);
    } else {
      setHtml(target, media.art);
    }
  };

  const syncFrontmatterImage = () => {
    if (!state.fmImage) {
      if (editorImagePath) editorImagePath.textContent = '-';
      if (editorImagePreview) editorImagePreview.hidden = true;
      if (editorImageThumb) editorImageThumb.removeAttribute('src');
      if (editorImageHint) editorImageHint.textContent = 'z.string().optional() → image · read locally, never uploaded';
      return;
    }
    if (editorImagePath) editorImagePath.textContent = state.fmImage.path;
    const hasSource = Boolean(state.fmImage.src);
    if (editorImagePreview) editorImagePreview.hidden = !hasSource;
    if (editorImageThumb) {
      if (hasSource && editorImageThumb.src !== state.fmImage.src) editorImageThumb.src = state.fmImage.src;
      if (!hasSource) editorImageThumb.removeAttribute('src');
    }
    const dimensions = state.fmImage.dimensions ? `${state.fmImage.dimensions} · ` : '';
    if (editorImageHint) editorImageHint.textContent = `sha-256 ${state.fmImage.hash} · ${dimensions}${state.fmImage.kb} · never left the tab`;
  };

  const syncComponent = () => {
    many<HomeElement>('[data-render-primary]').forEach((element) => {
      if (document.activeElement !== element) element.textContent = state.primary;
    });
    many<HomeElement>('[data-render-secondary]').forEach((element) => {
      const active = document.activeElement === element;
      if (!active) {
        element.textContent = state.secondary;
        element.style.display = state.secondary ? '' : 'none';
      } else {
        element.style.display = '';
      }
    });
    many<HomeElement>('[data-mdx-primary]').forEach((element) => { element.textContent = state.primary; });
    many<HomeElement>('[data-mdx-secondary]').forEach((element) => {
      element.textContent = state.secondary;
      const mark = element.closest('mark') as HTMLElement | null;
      if (mark) mark.style.display = state.secondary ? '' : 'none';
    });
    state.blocks.forEach((block) => {
      if (block.tag === 'CtaPair') {
        block.props.primary = state.primary;
        block.props.secondary = state.secondary;
      }
      setHtml(block.code, renderBlockMarkup(block));
    });
  };

  const setSchemaVisibility = (element: HomeElement, visible: boolean) => {
    element.hidden = !visible;
    element.style.display = visible ? '' : 'none';
  };

  const syncSchema = () => {
    many<HomeElement>('[data-schema-default]', schemaRoot ?? document).forEach((element) => { setSchemaVisibility(element, !state.described); });
    many<HomeElement>('[data-schema-refined]', schemaRoot ?? document).forEach((element) => { setSchemaVisibility(element, state.described); });
    if (schemaCodeDefault) setSchemaVisibility(schemaCodeDefault, !state.described);
    if (schemaCodeRefined) setSchemaVisibility(schemaCodeRefined, state.described);
    many<HomeElement>('[data-schema-tag]', schemaRoot ?? document).forEach((tag) => {
      const selected = state.tags.has(tag.dataset.schemaTag ?? '');
      tag.classList.toggle('is-selected', selected);
      tag.setAttribute('aria-pressed', String(selected));
    });
    schemaRelated.forEach((tag) => {
      const selected = state.related.has(tag.dataset.schemaRelated ?? '');
      tag.classList.toggle('is-selected', selected);
      tag.setAttribute('aria-pressed', String(selected));
    });
    schemaCategoryOptions.forEach((option) => {
      const selected = option.dataset.schemaCategoryOption === state.category;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', String(selected));
    });
    schemaDraftToggle?.classList.toggle('is-off', !state.draft);
    schemaDraftToggle?.setAttribute('aria-pressed', String(state.draft));
    if (schemaDraftInput && document.activeElement !== schemaDraftInput) schemaDraftInput.value = String(state.draft);
    if (schemaCategory && document.activeElement !== schemaCategory) schemaCategory.value = state.category;
    schemaTagsInputs.forEach((input) => {
      if (document.activeElement !== input) input.value = Array.from(state.tags).join(' ');
    });
    if (schemaRelatedInput && document.activeElement !== schemaRelatedInput) schemaRelatedInput.value = Array.from(state.related).join(', ');
    schemaForm?.classList.toggle('is-refined', state.described);
    schemaCodeWindow?.classList.toggle('is-refined', state.described);
    if (schemaNote) schemaNote.textContent = state.described
      ? 'intent described - same schema, richer controls'
      : 'fields as the types infer them - describe your intent to refine';
    if (schemaToggle) {
      schemaToggle.classList.toggle('is-on', state.described);
      schemaToggle.setAttribute('aria-pressed', String(state.described));
    }
    if (schemaPreview) {
      const tags = Array.from(state.tags).map((tag) => `<mark>${escapeHtml(tag)}</mark>`).join(', ');
      const related = Array.from(state.related).map((entry) => `<mark>${escapeHtml(entry)}</mark>`).join(', ');
      setHtml(schemaPreview, `title: <mark>"A draft in progress"</mark>\ncategory: <mark>${escapeHtml(state.category)}</mark>\ntags: [${tags}]\nrelated: [${related}]\nprice: <b>0</b>\ndraft: <b>${state.draft}</b>`);
    }
  };

  const syncCollections = () => {
    if (collectionTitle) collectionTitle.textContent = state.title || 'Untitled';
    if (collectionChangelogTags) collectionChangelogTags.textContent = state.tags.size ? Array.from(state.tags).join(', ') : '-';
    if (collectionChangelogStatus) {
      collectionChangelogStatus.textContent = state.draft ? 'Draft' : 'Published';
      collectionChangelogStatus.className = state.draft ? 'status-draft' : 'status-published';
    }
  };

  const syncMediaPost = () => {
    if (!state.image) return;
    const baseName = state.image.name.replace(/\.[a-z0-9]+$/i, '');
    if (mediaPostLine) mediaPostLine.textContent = `![${baseName}](${state.image.path})`;
    if (mediaPostImage) renderMediaArt(mediaPostImage, state.image);
    if (mediaPostStatus) mediaPostStatus.textContent = 'saving…';
    window.setTimeout(() => { if (mediaPostStatus) mediaPostStatus.textContent = 'saved ✓'; }, reducedMotion ? 0 : 650);
  };

  const syncPublished = () => {
    if (publishedTitle) publishedTitle.textContent = state.title || 'Untitled';
    const count = changedCount();
    if (publishedChanged) {
      publishedChanged.textContent = count
        ? `${count}${count === 1 ? ' change' : ' changes'} on the way down`
        : 'unmodified';
    }
    if (publishedFrontmatterImage) {
      const hasSource = Boolean(state.fmImage?.src);
      publishedFrontmatterImage.hidden = !hasSource;
      publishedFrontmatterImage.replaceChildren();
      if (state.fmImage?.src) {
        const image = document.createElement('img');
        image.src = state.fmImage.src;
        image.alt = state.fmImage.name;
        publishedFrontmatterImage.append(image);
      }
    }
    if (publishedBodyImage) {
      publishedBodyImage.hidden = !state.image;
      publishedBodyImage.replaceChildren();
      if (state.image) renderMediaArt(publishedBodyImage, state.image);
    }
    if (publishedStaticArt) publishedStaticArt.hidden = Boolean(state.image);
    if (publishedCta) {
      publishedCta.hidden = !hasCtaBlock();
      publishedCta.replaceChildren();
      if (hasCtaBlock()) {
        const primary = document.createElement('b');
        primary.textContent = state.primary;
        const secondary = document.createElement('i');
        secondary.textContent = state.secondary;
        publishedCta.append(primary);
        if (state.secondary) publishedCta.append(secondary);
      }
    }
    syncCollections();
  };

  const renderDiff = () => {
    if (!diffBody) return;
    const homeChanged = Boolean(state.image || state.fmImage || hasCtaBlock() || state.title !== defaultTitle);
    const changelogChanged = Boolean(state.tags.size || !state.draft || state.category !== 'release-notes');
    let files = 0;
    const lines: string[] = [];
    const line = (className: string, value: string) => `<span class="${className}">${escapeHtml(value)}</span>`;

    if (homeChanged) {
      files += 1;
      lines.push(line('diff-heading', '@@ src/content/pages/home.mdx @@'));
      if (state.title !== defaultTitle) {
        lines.push(line('diff-remove', `-title: "${defaultTitle}"`));
        lines.push(line('diff-add', `+title: "${state.title || 'Untitled'}"`));
      }
      if (state.fmImage) lines.push(line('diff-add', `+image: ${state.fmImage.path}`));
      lines.push(line('diff-line', ' Chirp adds a visual Markdown and mdx editor to the project you already have.'));
      if (state.image) {
        const baseName = state.image.name.replace(/\.[a-z0-9]+$/i, '');
        lines.push(line('diff-add', `+![${baseName}](${state.image.path})`));
      }
      if (hasCtaBlock()) lines.push(line('diff-add', `+${renderBlockSource(ctaBlock as Block)}`));
    }
    if (changelogChanged) {
      files += 1;
      lines.push(line('diff-heading', '@@ src/content/changelog/plugins-foundation.md @@'));
      lines.push(line('diff-line', ' title: "Plugins foundation - draft"'));
      if (state.category !== 'release-notes') {
        lines.push(line('diff-remove', '-category: release-notes'));
        lines.push(line('diff-add', `+category: ${state.category}`));
      }
      if (state.tags.size) lines.push(line('diff-add', `+tags: [${Array.from(state.tags).join(', ')}]`));
      if (!state.draft) {
        lines.push(line('diff-remove', '-draft: true'));
        lines.push(line('diff-add', '+draft: false'));
      }
    }
    setHtml(diffBody, lines.length
      ? lines.join('')
      : '<span class="diff-ghost">- insert the component, pick a category and some tags, add an image above; the changes land here -</span>');
    if (diffCount) diffCount.textContent = files ? `${files} ${files === 1 ? 'file' : 'files'} changed` : '0 files changed';
  };

  const syncAll = () => {
    syncFrontmatterImage();
    syncComponent();
    syncSchema();
    syncMediaPost();
    syncPublished();
    renderDiff();
  };

  const flashSave = () => {
    if (editorSaved) editorSaved.textContent = 'saving…';
    if (editorDiff) editorDiff.textContent = 'main · 1 file changed';
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      if (editorSaved) editorSaved.textContent = 'saved ✓';
    }, reducedMotion ? 0 : 550);
  };

  /* ---------- local image hashing and frontmatter preview ---------- */
  const fnv1a = (value: string) => {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    return (`0000000${hash.toString(16)}`).slice(-8);
  };

  const readFileDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('image data was not returned as a string'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('image could not be read'));
    reader.readAsDataURL(file);
  });

  const hashFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    if (window.crypto?.subtle?.digest) {
      try {
        const digest = await window.crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(digest), (byte) => (`0${byte.toString(16)}`).slice(-2)).join('').slice(0, 10);
      } catch {
        return fnv1a(`${file.name}:${file.size}:${file.lastModified}`);
      }
    }
    return fnv1a(`${file.name}:${file.size}:${file.lastModified}`);
  };

  const hydrateFrontmatterImage = async (file: File, image: FrontmatterImage) => {
    const dataUrlPromise = readFileDataUrl(file).catch(() => '');
    try {
      image.hash = await hashFile(file);
    } catch {
      image.hash = fnv1a(`${file.name}:${file.size}:${file.lastModified}`);
    }
    const dataUrl = await dataUrlPromise;
    if (state.fmImage !== image) return;
    let bodyImageChanged = false;
    if (dataUrl && image.src !== dataUrl) {
      image.src = dataUrl;
      if (state.selectedMedia?.path === image.path) state.selectedMedia.src = dataUrl;
      if (state.image?.path === image.path) {
        state.image.src = dataUrl;
        bodyImageChanged = true;
      }
    }
    syncFrontmatterImage();
    syncUploadedTile();
    if (bodyImageChanged) syncMediaPost();
    renderDiff();
    syncPublished();

    if (!image.src) return;
    const probe = new Image();
    probe.onload = () => {
      if (state.fmImage !== image) return;
      image.dimensions = `${probe.naturalWidth} × ${probe.naturalHeight}`;
      syncFrontmatterImage();
      syncUploadedTile();
      syncPublished();
    };
    probe.src = image.src;
  };

  const setFrontmatterImage = (file: File) => {
    const image: FrontmatterImage = {
      name: file.name,
      path: `src/images/${file.name}`,
      kb: formatKilobytes(file.size),
      hash: 'hashing…',
      dimensions: '',
      src: '',
    };
    state.fmImage = image;
    syncFrontmatterImage();
    syncPublished();
    renderDiff();
    flashSave();
    markInteraction();
    void hydrateFrontmatterImage(file, image);
  };

  activate(editorBrowse, () => editorFile?.click());
  editorFile?.addEventListener('change', () => {
    const file = editorFile.files?.[0];
    editorFile.value = '';
    if (file) setFrontmatterImage(file);
  });

  /* ---------- media selection and insertion ---------- */
  const readMedia = (tile: HomeElement): MediaSelection => {
    const name = tile.dataset.mediaName || one<HomeElement>('.media-tile-meta b', tile)?.textContent?.trim() || 'asset';
    const size = tile.dataset.mediaSize || one<HomeElement>('.media-tile-meta small', tile)?.textContent?.trim() || '';
    return {
      name,
      size,
      path: tile.dataset.mediaPath || `src/images/${name}`,
      art: one<HomeElement>('.media-tile-art', tile)?.innerHTML ?? '',
      kind: tile.dataset.mediaKind,
      src: tile.dataset.mediaSrc,
    };
  };

  const updateMediaPreview = () => {
    if (!state.selectedMedia) return;
    if (previewArt) renderMediaArt(previewArt, state.selectedMedia);
    if (previewName) previewName.textContent = state.selectedMedia.name;
    if (previewPath) previewPath.textContent = state.selectedMedia.path;
    if (previewSize) previewSize.textContent = state.selectedMedia.size;
    if (previewHint) previewHint.textContent = state.selectedMedia.src
      ? `Read from your disk into this tab - ${state.fmImage?.hash ?? 'hashing…'}. Nothing was sent anywhere.`
      : 'Stored on disk. No uploads, no transforms, no CDN.';
  };

  const selectMedia = (tile: HomeElement, announce = true) => {
    state.selectedMedia = readMedia(tile);
    many<HomeElement>('.media-tile', mediaGrid ?? document).forEach((item) => {
      const selected = item === tile;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    updateMediaPreview();
    if (announce) markInteraction();
  };

  const wireMediaTile = (tile: HomeElement) => {
    if (tile.dataset.mediaBound === 'true') return;
    tile.dataset.mediaBound = 'true';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.addEventListener('click', () => selectMedia(tile));
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectMedia(tile);
      }
    });
  };

  const syncUploadedTile = () => {
    if (!mediaGrid || !state.fmImage?.src) return;
    let tile = one<HomeElement>('[data-uploaded-media-tile]', mediaGrid);
    const isNewTile = !tile;
    if (!tile) {
      tile = document.createElement('div');
      tile.className = 'media-tile';
      tile.dataset.uploadedMediaTile = 'true';
      const art = document.createElement('div');
      art.className = 'media-tile-art';
      const image = document.createElement('img');
      image.alt = '';
      art.append(image);
      const meta = document.createElement('div');
      meta.className = 'media-tile-meta';
      const name = document.createElement('b');
      const size = document.createElement('small');
      meta.append(name, size);
      tile.append(art, meta);
      mediaGrid.prepend(tile);
      wireMediaTile(tile);
    }
    tile.dataset.mediaName = state.fmImage.name;
    tile.dataset.mediaPath = state.fmImage.path;
    tile.dataset.mediaSize = `${state.fmImage.dimensions ? `${state.fmImage.dimensions} · ` : ''}${state.fmImage.kb}`;
    tile.dataset.mediaSrc = state.fmImage.src;
    tile.dataset.mediaKind = 'uploaded';
    const image = one<HTMLImageElement>('img', tile);
    const name = one<HomeElement>('b', tile);
    const size = one<HomeElement>('small', tile);
    if (image) image.src = state.fmImage.src;
    if (name) name.textContent = state.fmImage.name;
    if (size) size.textContent = tile.dataset.mediaSize;
    const meta = one<HomeElement>('.media-tile-meta', tile);
    if (meta) {
      one<HomeElement>('.in-use-badge', meta)?.remove();
      if (state.fmImage) {
        const badge = document.createElement('span');
        badge.className = 'in-use-badge';
        badge.textContent = 'in use - home.mdx';
        meta.append(badge);
      }
    }
    if (isNewTile || state.selectedMedia?.path === state.fmImage.path) selectMedia(tile, false);
  };

  const insertSelectedMedia = () => {
    if (!state.selectedMedia) return;
    state.image = { ...state.selectedMedia };
    syncMediaPost();
    syncPublished();
    renderDiff();
    if (previewHint) previewHint.textContent = `Inserted ${state.image.path} into home.mdx. The file stayed on disk.`;
    if (mediaPostStatus) mediaPostStatus.textContent = 'saving…';
    window.setTimeout(() => { if (mediaPostStatus) mediaPostStatus.textContent = 'saved ✓'; }, reducedMotion ? 0 : 650);
    syncUploadedTile();
    flashSave();
    markInteraction();
  };

  const firstTile = one<HomeElement>('.media-tile', mediaGrid ?? document);
  if (firstTile) {
    many<HomeElement>('.media-tile', mediaGrid ?? document).forEach((tile) => {
      const name = one<HomeElement>('.media-tile-meta b', tile)?.textContent?.trim() ?? 'asset';
      const size = one<HomeElement>('.media-tile-meta small', tile)?.textContent?.trim() ?? '';
      tile.dataset.mediaName = name;
      tile.dataset.mediaPath = `src/images/${name}`;
      tile.dataset.mediaSize = size;
      wireMediaTile(tile);
    });
    state.selectedMedia = readMedia(firstTile);
  }

  if (mediaSearch) {
    let mediaPlaceholder = true;
    mediaSearch.addEventListener('focus', () => {
      if (mediaPlaceholder) {
        mediaPlaceholder = false;
        mediaSearch.textContent = '';
      }
    });
    mediaSearch.addEventListener('input', () => {
      const query = mediaSearch.textContent?.trim().toLowerCase() ?? '';
      many<HomeElement>('.media-tile', mediaGrid ?? document).forEach((tile) => {
        tile.hidden = Boolean(query) && !(tile.textContent?.toLowerCase().includes(query));
      });
    });
    mediaSearch.addEventListener('blur', () => {
      if (!mediaSearch.textContent?.trim()) {
        mediaPlaceholder = true;
        mediaSearch.textContent = '⌕ Search media…';
      }
    });
  }
  mediaInsert?.addEventListener('click', insertSelectedMedia);
  mediaReveal?.addEventListener('click', () => {
    if (previewHint && state.selectedMedia) previewHint.textContent = `Finder reveal is available in the local app. File: ${state.selectedMedia.path}`;
    markInteraction();
  });

  if (mediaRoot && 'IntersectionObserver' in window) {
    const mediaObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.setTimeout(() => {
        if (!state.image && state.selectedMedia?.kind !== 'uploaded') insertSelectedMedia();
      }, reducedMotion ? 0 : 3200);
      mediaObserver.disconnect();
    }, { threshold: 0.3 });
    mediaObserver.observe(mediaRoot);
  }

  /* ---------- title and component inspector state ---------- */
  const onTitleInput = (source: HomeElement) => {
    state.title = textValue(source);
    if (editorTitle && document.activeElement !== editorTitle) editorTitle.value = state.title;
    if (drawerTitle && document.activeElement !== drawerTitle) drawerTitle.textContent = state.title;
    syncPublished();
    renderDiff();
    flashSave();
    if (!titleTicked) {
      titleTicked = true;
      markInteraction();
    }
  };
  editorTitle?.addEventListener('input', () => onTitleInput(editorTitle));
  drawerTitle?.addEventListener('input', () => onTitleInput(drawerTitle));

  many<HomeElement>('[data-component-prop]', componentRoot ?? document).forEach((element) => {
    element.addEventListener('input', () => {
      const prop = element.dataset.componentProp;
      if (prop === 'primary') state.primary = textValue(element) || defaultPrimary;
      if (prop === 'secondary') state.secondary = textValue(element);
      syncComponent();
      syncPublished();
      renderDiff();
      flashSave();
      if (!componentTicked) {
        componentTicked = true;
        markInteraction();
      }
    });
  });

  /* ---------- mdx block insertion and props ---------- */
  const closePopover = () => {
    many<HomeElement>('.home-popover', editorBlocks ?? document).forEach((popover) => popover.remove());
    state.blocks.forEach((block) => {
      block.popover = undefined;
      block.element.classList.remove('is-selected');
    });
  };

  const openPopover = (block: Block) => {
    closePopover();
    block.element.classList.add('is-selected');
    const definition = blockDefinitions[block.tag];
    const popover = document.createElement('div');
    popover.className = 'home-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', `${block.tag} props`);

    const headerRow = document.createElement('div');
    headerRow.className = 'home-popover-head';
    const title = document.createElement('span');
    title.textContent = 'props - written back as mdx attributes';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'home-popover-close';
    close.setAttribute('aria-label', 'Close props');
    close.textContent = '×';
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      closePopover();
    });
    headerRow.append(title, close);
    popover.append(headerRow);

    (definition?.props ?? []).forEach((prop) => {
      const field = document.createElement('label');
      field.textContent = prop;
      const input = document.createElement('input');
      input.value = block.props[prop] ?? definition?.defaults[prop] ?? '';
      input.maxLength = 90;
      input.addEventListener('input', () => {
        block.props[prop] = input.value;
        if (block.tag === 'CtaPair') {
          state.primary = block.props.primary || defaultPrimary;
          state.secondary = block.props.secondary || '';
        }
        syncComponent();
        syncPublished();
        renderDiff();
        flashSave();
      });
      field.append(input);
      popover.append(field);
    });

    const footer = document.createElement('div');
    footer.className = 'home-popover-actions';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'remove block';
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      const parent = block.element.parentElement;
      block.popover?.remove();
      block.element.remove();
      if (parent?.matches('[data-editor-inline-line]') && !parent.children.length) parent.remove();
      state.blocks = state.blocks.filter((item) => item !== block);
      if (block === ctaBlock) ctaBlock = state.blocks.find((item) => item.tag === 'CtaPair') ?? null;
      closePopover();
      syncAll();
      flashSave();
      markInteraction();
    });
    footer.append(remove);
    popover.append(footer);
    block.element.insertAdjacentElement('afterend', popover);
    block.popover = popover;
    if (!reducedMotion) one<HTMLInputElement>('input', popover)?.focus();
  };

  const insertBlock = (tag: string) => {
    if (!editorBlocks || !blockDefinitions[tag]) return;
    const definition = blockDefinitions[tag];
    const element = document.createElement('div');
    element.className = `editor-inserted-block${definition.inline ? ' is-inline' : ''}`;
    element.dataset.blockTag = tag;
    element.dataset.blockId = String(++blockSequence);
    const code = document.createElement('code');
    const block: Block = {
      id: blockSequence,
      tag,
      props: { ...definition.defaults },
      element,
      code,
      inline: definition.inline,
    };
    if (tag === 'CtaPair') {
      block.props.primary = state.primary;
      block.props.secondary = state.secondary;
      ctaBlock = block;
    }
    setHtml(code, renderBlockMarkup(block));
    const propsButton = document.createElement('button');
    propsButton.type = 'button';
    propsButton.textContent = 'props';
    propsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      openPopover(block);
    });
    element.append(code, propsButton);
    if (definition.inline) {
      let line = one<HomeElement>('[data-editor-inline-line]', editorBlocks);
      if (!line) {
        line = document.createElement('div');
        line.dataset.editorInlineLine = 'true';
        editorBlocks.append(line);
      }
      line.append(element);
    } else {
      editorBlocks.append(element);
    }
    state.blocks.push(block);
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      if (event.target !== propsButton) openPopover(block);
    });
    if (slashMenu) slashMenu.hidden = true;
    editorHint?.setAttribute('aria-expanded', 'false');
    syncAll();
    flashSave();
    markInteraction();
    openPopover(block);
  };

  const options = many<HomeElement>('[data-block-tag]', slashMenu ?? document);
  const selectOption = (index: number) => {
    if (!options.length) return;
    selectedOption = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      option.classList.toggle('is-selected', optionIndex === selectedOption);
      option.setAttribute('aria-selected', String(optionIndex === selectedOption));
    });
  };
  options.forEach((option, index) => {
    option.addEventListener('mouseenter', () => selectOption(index));
    option.addEventListener('click', (event) => {
      event.stopPropagation();
      insertBlock(option.dataset.blockTag ?? 'Card');
    });
    option.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        insertBlock(option.dataset.blockTag ?? 'Card');
      }
    });
  });
  selectOption(0);

  const toggleSlash = (open: boolean) => {
    if (!slashMenu) return;
    slashMenu.hidden = !open;
    editorHint?.setAttribute('aria-expanded', String(open));
  };
  editorHint?.addEventListener('click', () => {
    editorCanvas?.focus();
    toggleSlash(Boolean(slashMenu?.hidden));
  });
  editorWindow?.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || (event.target as HTMLElement).isContentEditable) return;
    if (event.key === '/') {
      event.preventDefault();
      toggleSlash(true);
    } else if (slashMenu && !slashMenu.hidden && event.key === 'ArrowDown') {
      event.preventDefault();
      selectOption(selectedOption + 1);
    } else if (slashMenu && !slashMenu.hidden && event.key === 'ArrowUp') {
      event.preventDefault();
      selectOption(selectedOption - 1);
    } else if (slashMenu && !slashMenu.hidden && event.key === 'Enter') {
      event.preventDefault();
      insertBlock(options[selectedOption]?.dataset.blockTag ?? 'Card');
    }
  });
  editorCanvas?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.editor-inserted-block') && !target.closest('.home-popover') && !target.closest('[data-slash-menu]') && !(target instanceof HTMLInputElement)) {
      editorCanvas.focus();
    }
  });
  if (editorWindow && slashMenu && 'IntersectionObserver' in window) {
    const editorObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      window.setTimeout(() => { if (!state.blocks.length) toggleSlash(true); }, reducedMotion ? 0 : 2600);
      editorObserver.disconnect();
    }, { threshold: 0.35 });
    editorObserver.observe(editorWindow);
  }
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.editor-inserted-block') && !target.closest('.home-popover')) closePopover();
  });

  /* ---------- schema refinements, tags and draft ---------- */
  activate(schemaToggle, () => {
    state.described = !state.described;
    syncSchema();
    markInteraction();
  });
  schemaCategory?.addEventListener('input', () => {
    state.category = textValue(schemaCategory) || 'release-notes';
    syncSchema();
    syncPublished();
    renderDiff();
    flashSave();
    if (!categoryTicked) {
      categoryTicked = true;
      markInteraction();
    }
  });
  schemaTagsInputs.forEach((input) => input.addEventListener('input', () => {
    state.tags = parseSpaceSeparated(input.value);
    syncSchema();
    syncPublished();
    renderDiff();
    flashSave();
    if (!tagsTicked) tagsTicked = true;
    markInteraction();
  }));
  schemaRelatedInput?.addEventListener('input', () => {
    state.related = parseCommaSeparated(schemaRelatedInput.value);
    syncSchema();
    markInteraction();
  });
  schemaCategoryOptions.forEach((option) => {
    activate(option, () => {
      const value = option.dataset.schemaCategoryOption;
      if (!value) return;
      state.category = value;
      syncSchema();
      syncPublished();
      renderDiff();
      flashSave();
      markInteraction();
    });
  });
  many<HomeElement>('[data-schema-tag]', schemaRoot ?? document).forEach((tag) => {
    activate(tag, () => {
      const value = tag.dataset.schemaTag;
      if (!value) return;
      if (state.tags.has(value)) state.tags.delete(value); else state.tags.add(value);
      syncSchema();
      syncPublished();
      renderDiff();
      flashSave();
      if (!tagsTicked) {
        tagsTicked = true;
        markInteraction();
      } else {
        markInteraction();
      }
    });
  });
  schemaRelated.forEach((tag) => {
    activate(tag, () => {
      const value = tag.dataset.schemaRelated;
      if (!value) return;
      if (state.related.has(value)) state.related.delete(value); else state.related.add(value);
      syncSchema();
      markInteraction();
    });
  });
  schemaDraftInput?.addEventListener('input', () => {
    const value = schemaDraftInput.value.trim().toLowerCase();
    state.draft = value !== 'false' && value !== '0' && value !== 'no';
    syncSchema();
    syncPublished();
    renderDiff();
    flashSave();
  });
  activate(schemaDraftToggle, () => {
    state.draft = !state.draft;
    syncSchema();
    syncPublished();
    renderDiff();
    flashSave();
    markInteraction();
  });

  /* ---------- collection search and filters ---------- */
  const filterCollections = () => {
    const query = searchPlaceholder ? '' : textValue(collectionSearch ?? document.body).toLowerCase();
    many<HTMLTableRowElement>('tbody tr', collectionsRoot ?? document).forEach((row) => {
      const category = row.dataset.category ?? '';
      const matches = (!query || row.textContent?.toLowerCase().includes(query))
        && (statusFilter === 'all' || category === statusFilter)
        && typeFilter === 'all';
      row.hidden = !matches;
    });
  };
  collectionSearch?.addEventListener('focus', () => {
    if (searchPlaceholder) {
      searchPlaceholder = false;
      collectionSearch.textContent = '';
    }
  });
  collectionSearch?.addEventListener('input', filterCollections);
  collectionSearch?.addEventListener('blur', () => {
    if (!collectionSearch.textContent?.trim()) {
      searchPlaceholder = true;
      collectionSearch.textContent = '⌕ Search entries…';
    }
  });

  const cycleFilter = (kind: 'status' | 'type') => {
    const values: Array<[string, string]> = kind === 'status'
      ? [['all', 'Filter'], ['engineering', 'Engineering'], ['philosophy', 'Philosophy'], ['product', 'Product']]
      : [['all', 'All collections'], ['pages', 'Pages'], ['changelog', 'Changelog'], ['posts', 'Posts']];
    const current = kind === 'status' ? statusFilter : typeFilter;
    const index = values.findIndex(([value]) => value === current);
    const next = values[(index + 1) % values.length];
    if (kind === 'status') statusFilter = next[0]; else typeFilter = next[0];
    const target = kind === 'status' ? collectionStatus : collectionType;
    if (target) {
      target.replaceChildren();
      target.append(document.createTextNode(next[1]));
      const caret = document.createElement('i');
      caret.textContent = '▾';
      target.append(caret);
      target.classList.toggle('is-active', next[0] !== 'all');
    }
    filterCollections();
    markInteraction();
  };
  activate(collectionStatus, () => cycleFilter('status'));
  activate(collectionType, () => cycleFilter('type'));

  /* ---------- command copy ---------- */
  const copyCommand = async (button: HTMLButtonElement) => {
    const command = button.dataset.copyCommand;
    const status = button.parentElement?.querySelector('[data-copy-status]');
    if (!command) return;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = command;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.inset = '0 auto auto 0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      textarea.remove();
    }
    if (copied) {
      button.dataset.copyLabel ??= button.textContent || 'copy';
      button.textContent = 'copied ✓';
      button.classList.add('is-copied');
      if (status) status.textContent = 'Command copied to clipboard.';
      window.setTimeout(() => {
        button.textContent = button.dataset.copyLabel || 'copy';
        button.classList.remove('is-copied');
      }, 1800);
    } else if (status) {
      status.textContent = 'Copy unavailable. Select the command to copy it manually.';
    }
    markInteraction();
  };
  many<HTMLButtonElement>('[data-copy-command]').forEach((button) => {
    button.dataset.copyLabel ??= button.textContent || 'copy';
    button.addEventListener('click', () => { void copyCommand(button); });
  });

  /* ---------- command palette ---------- */
  const initCommandPalette = () => {
    const palette = document.createElement('div');
  palette.className = 'home-command-palette';
  palette.setAttribute('aria-hidden', 'true');
  setHtml(palette, '<div class="home-command-palette-dialog" role="dialog" aria-modal="true" aria-label="Chirp command palette"><div class="home-command-palette-search"><span aria-hidden="true">⌘</span><input type="search" aria-label="Search commands or content" placeholder="Type a command or search content…" autocomplete="off" /><kbd>esc</kbd></div><div class="home-command-palette-list" role="listbox"></div></div>');
  document.body.append(palette);
  const paletteInput = one<HTMLInputElement>('input', palette);
  const paletteList = one<HomeElement>('.home-command-palette-list', palette);
  const paletteActions = [
    ['Open home.mdx in the editor', 'canvas markdown', '#editor'],
    ['Inspect the CtaPair component', 'blocks mdx', '#components'],
    ['Browse all entries', 'collections pages posts changelog', '#collections'],
    ['Open the media library', 'images assets', '#media'],
    ['Review the diff', 'git local changes', '#local'],
    ['Get started - pnpm astro add chirp', 'install command', '#get'],
  ] as const;
  let paletteSelected = 0;
  let previousFocus: HTMLElement | null = null;

  const matchingActions = () => paletteActions.filter(([label, hint]) => `${label} ${hint}`.toLowerCase().includes((paletteInput?.value ?? '').toLowerCase()));
  const renderPalette = () => {
    if (!paletteList) return;
    const matches = matchingActions();
    paletteList.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'home-command-palette-item';
      empty.textContent = 'No commands match.';
      paletteList.append(empty);
      return;
    }
    paletteSelected = Math.max(0, Math.min(paletteSelected, matches.length - 1));
    matches.forEach(([label, hint], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `home-command-palette-item${index === paletteSelected ? ' is-selected' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === paletteSelected));
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '▸';
      const labelNode = document.createTextNode(` ${label}`);
      const where = document.createElement('span');
      where.className = 'where';
      where.textContent = hint;
      button.append(arrow, labelNode, where);
      button.addEventListener('mouseenter', () => { paletteSelected = index; renderPalette(); });
      button.addEventListener('click', () => go(matches[index][2]));
      paletteList.append(button);
    });
  };
  const closePalette = () => {
    const wasOpen = palette.classList.contains('is-open');
    palette.classList.remove('is-open');
    palette.setAttribute('aria-hidden', 'true');
    paletteInput?.blur();
    if (wasOpen) previousFocus?.focus();
    previousFocus = null;
  };
  const openPalette = () => {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    palette.classList.add('is-open');
    palette.setAttribute('aria-hidden', 'false');
    paletteSelected = 0;
    if (paletteInput) {
      paletteInput.value = '';
      renderPalette();
      window.setTimeout(() => paletteInput.focus(), reducedMotion ? 0 : 30);
    }
    markInteraction();
  };
  const go = (target: string) => {
    closePalette();
    one<HTMLElement>(target)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  many<HomeElement>('[data-command-palette-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openPalette();
    });
  });
  paletteInput?.addEventListener('input', () => { paletteSelected = 0; renderPalette(); });
  palette.addEventListener('click', (event) => { if (event.target === palette) closePalette(); });

    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        palette.classList.contains('is-open') ? closePalette() : openPalette();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        flashSave();
        markInteraction();
        return;
      }
      if (event.key === 'Escape') {
        if (palette.classList.contains('is-open')) closePalette();
        closePopover();
        toggleSlash(false);
      }
      if (!palette.classList.contains('is-open')) return;
      const matches = matchingActions();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        paletteSelected = (paletteSelected + 1) % Math.max(1, matches.length);
        renderPalette();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        paletteSelected = Math.max(0, paletteSelected - 1);
        renderPalette();
      } else if (event.key === 'Enter' && matches[paletteSelected]) {
        event.preventDefault();
        go(matches[paletteSelected][2]);
      }
    });

    renderPalette();
  };

  window.setTimeout(() => {
    syncAll();
    initCommandPalette();
  }, 0);
}
