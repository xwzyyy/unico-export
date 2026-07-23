import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const compilerPath = resolve('compiler/unico-ir-compiler.mjs');
const verifiedImageUrl = 'https://images.unsplash.com/photo-1767169768227-79688439fb37?auto=format&fit=crop&w=1200&q=80';

function runCompiler(ir, canonicalContent) {
  const directory = mkdtempSync(join(tmpdir(), 'unico-ir-test-'));
  const inputPath = join(directory, 'unico-design-ir.json');
  const outputPath = join(directory, 'unico-export-result.json');
  const canonicalPath = join(directory, 'unico-page.json');
  writeFileSync(inputPath, `${JSON.stringify(ir, null, 2)}\n`);
  if (canonicalContent !== undefined) writeFileSync(canonicalPath, canonicalContent);
  const execution = spawnSync(process.execPath, [compilerPath, inputPath, outputPath, canonicalPath], { encoding: 'utf8' });
  const result = JSON.parse(readFileSync(outputPath, 'utf8'));
  return { directory, execution, result, canonicalPath };
}

function cleanup(directory) {
  rmSync(directory, { recursive: true, force: true });
}

test('compiles valid IR, estimates text height, and removes empty navbar carriers', () => {
  const run = runCompiler({
    mode: 'replace',
    message: 'controlled-variation-v4 test',
    canvasWidth: 386,
    explicitComponents: ['brand-navbar'],
    sections: [
      {
        id: 'navbar-carrier',
        children: [{ type: 'brand-navbar', id: 'main-nav', brandName: 'Studio', showLogo: false }],
      },
      {
        id: 'hero',
        height: 580,
        bgColor: '#111111',
        children: [
          { type: 'text', id: 'hero-title', text: 'A deliberate mobile page', x: 20, y: 24, w: 346, fontSize: 36, lineHeight: 1.1, color: '#ffffff' },
          { type: 'text', id: 'hero-body', text: 'Longer supporting copy wraps safely and receives a conservative automatic height.', x: 20, y: 132, w: 346, fontSize: 16, color: '#ffffff' },
          { type: 'img', id: 'hero-image', src: verifiedImageUrl, x: 20, y: 220, w: 346, h: 260, fit: 'cover', objectPosition: '50% 35%' },
        ],
      },
    ],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.equal(run.result.validation.passed, true);
    assert.equal(run.result.designJson.length, 2);
    assert.equal(run.result.designJson[0].type, 'brand-navbar');
    assert.equal(run.result.designJson[1].type, 'free-box');
    const children = run.result.designJson[1].field.structure.child.component_list.value;
    assert.equal('height' in children[1].field.styles.child, false);
    assert.equal(children[1].field.styles.child.paddingBlock.value, 10);
    assert.match(children[2].field.styles.child.customCSS.value, /object-fit: cover/);
    assert.ok(existsSync(run.canonicalPath));
  } finally {
    cleanup(run.directory);
  }
});

test('rejects overlapping text without writing the canonical page', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'bad-text',
      height: 240,
      children: [
        { type: 'text', id: 'title', text: 'Overlapping title', x: 20, y: 20, w: 346, fontSize: 32 },
        { type: 'text', id: 'body', text: 'This starts too early.', x: 20, y: 35, w: 346, fontSize: 16 },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.equal(run.result.validation.passed, false);
    assert.match(run.result.validation.errors.join('\n'), /overlapping text boxes/);
    assert.equal(existsSync(run.canonicalPath), false);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects same-column text gaps below 8px', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'tight-text',
      height: 240,
      children: [
        { type: 'text', id: 'label', text: 'Section label', x: 20, y: 20, w: 346, h: 30, fontSize: 16 },
        { type: 'text', id: 'title', text: 'Section title', x: 20, y: 54, w: 346, h: 30, fontSize: 16 },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /only 4px/);
  } finally {
    cleanup(run.directory);
  }
});

test('requires explicit image fit and rejects provable distortion or unsafe cropping', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [
      { id: 'missing-fit', height: 240, children: [{ type: 'img', id: 'image-a', src: verifiedImageUrl, x: 20, y: 20, w: 346, h: 180 }] },
      { id: 'distorted-fill', height: 240, children: [{ type: 'img', id: 'image-b', src: verifiedImageUrl, x: 20, y: 20, w: 346, h: 100, fit: 'fill', sourceWidth: 400, sourceHeight: 800 }] },
      { id: 'unsafe-cover', height: 240, children: [{ type: 'img', id: 'image-c', src: verifiedImageUrl, x: 20, y: 20, w: 346, h: 120, fit: 'cover', sourceWidth: 800, sourceHeight: 1200 }] },
    ],
  });
  try {
    assert.equal(run.execution.status, 1);
    const errors = run.result.validation.errors.join('\n');
    assert.match(errors, /fit is required/);
    assert.match(errors, /would distort the source/);
    assert.match(errors, /set objectPosition/);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects high-layer backgrounds over text and separate text over buttons', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'bad-layering',
      height: 320,
      children: [
        { type: 'rectangle', id: 'panel', x: 20, y: 20, w: 346, h: 120, zIndex: 8, bgColor: '#000000' },
        { type: 'text', id: 'panel-title', text: 'Hidden title', x: 40, y: 50, w: 300, zIndex: 5, color: '#ffffff' },
        { type: 'button', id: 'cta', text: 'Book now', x: 20, y: 180, w: 346, h: 48, zIndex: 3 },
        { type: 'text', id: 'fake-button-label', text: 'Book now', x: 80, y: 188, w: 200, zIndex: 4 },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    const errors = run.result.validation.errors.join('\n');
    assert.match(errors, /covering/);
    assert.match(errors, /button's own text field/);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects mixing top-level business components with free-positioned content', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'mixed-events',
      children: [
        { type: 'text', text: 'Upcoming events', x: 20, y: 20, w: 346 },
        { type: 'event-list', styleMode: 0 },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /only non-navbar child/);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects out-of-bounds components and duplicate IDs', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'bounds',
      height: 300,
      children: [
        { type: 'img', id: 'duplicate', src: verifiedImageUrl, x: -20, y: 0, w: 420, h: 200 },
        { type: 'button', id: 'duplicate', text: 'Action', x: 20, y: 220, w: 346, h: 48 },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    const errors = run.result.validation.errors.join('\n');
    assert.match(errors, /horizontal section bounds/);
    assert.match(errors, /duplicate id/);
  } finally {
    cleanup(run.directory);
  }
});

test('stops on malformed canonical pages and preserves the original file', () => {
  const original = '{ invalid canonical json';
  const run = runCompiler({
    mode: 'extend',
    sections: [{ id: 'new', height: 240, children: [{ type: 'text', text: 'New section', x: 20, y: 20, w: 346 }] }],
  }, original);
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /Cannot safely read existing canonical page/);
    assert.equal(readFileSync(run.canonicalPath, 'utf8'), original);
  } finally {
    cleanup(run.directory);
  }
});

test('extend preserves complete canonical components and appends only new free boxes', () => {
  const seed = runCompiler({
    mode: 'replace',
    sections: [
      { id: 'legacy-events', children: [{ type: 'event-list', id: 'legacy-event-list' }] },
      {
        id: 'legacy-section',
        height: 180,
        children: [{ type: 'text', id: 'legacy-text', text: 'Existing content', x: 20, y: 40, w: 346 }],
      },
      {
        id: 'legacy-rich-carrier',
        height: 180,
        children: [{ type: 'rich-text', id: 'legacy-rich', html: '<p>Existing formatted content</p>', x: 20, y: 40, w: 346 }],
      },
    ],
  });
  assert.equal(seed.execution.status, 0, seed.execution.stderr);
  const legacyRich = seed.result.designJson[2].field.structure.child.component_list.value[0];
  const legacyDesign = [legacyRich, ...seed.result.designJson.slice(0, 2)];
  const canonical = `${JSON.stringify({ designJson: legacyDesign, message: 'legacy' }, null, 2)}\n`;
  const run = runCompiler({
    mode: 'extend',
    sections: [{ id: 'addition', height: 240, children: [{ type: 'text', id: 'addition-text', text: 'New content', x: 20, y: 20, w: 346 }] }],
  }, canonical);
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.deepEqual(run.result.designJson.slice(0, 3), legacyDesign);
    assert.equal(run.result.designJson[3].type, 'free-box');
  } finally {
    cleanup(seed.directory);
    cleanup(run.directory);
  }
});

test('final output validation rejects incomplete component contracts from canonical JSON', () => {
  const incompleteCanonical = {
    designJson: [
      {
        id: 'legacy-section',
        label: 'Legacy Section',
        type: 'free-box',
        field: {
          structure: {
            label: 'Freeform Container',
            child: {
              component_list: {
                label: 'Widgets List',
                type: 'component_list',
                value: [{
                  id: 'broken-text',
                  label: 'Text',
                  type: 'text',
                  field: {
                    structure: { label: 'Text Content', child: {} },
                    styles: { label: 'Text Style', child: {} },
                  },
                }],
              },
            },
          },
          styles: { label: 'Container Style', child: {} },
        },
      },
      {
        id: 'broken-events',
        label: 'Event List',
        type: 'event-list',
        component: {
          name: 'event-list',
          props: { data: { events: [] } },
        },
      },
    ],
  };
  const run = runCompiler({
    mode: 'extend',
    sections: [{
      id: 'addition',
      height: 160,
      children: [{ type: 'text', id: 'addition-text', text: 'New content', x: 20, y: 40, w: 346 }],
    }],
  }, `${JSON.stringify(incompleteCanonical, null, 2)}\n`);
  try {
    assert.equal(run.execution.status, 1);
    assert.equal(run.result.validation.passed, false);
    assert.match(run.result.validation.errors.join('\n'), /missing required field/);
    assert.match(run.result.validation.errors.join('\n'), /data\.styleMode/);
    assert.deepEqual(JSON.parse(readFileSync(run.canonicalPath, 'utf8')), incompleteCanonical);
  } finally {
    cleanup(run.directory);
  }
});

test('enforces deprecated, explicit-only, and single-use component policies', () => {
  const deprecated = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'deprecated-shape',
      height: 160,
      children: [{ type: 'circle', id: 'circle', x: 20, y: 20, w: 80, h: 80 }],
    }],
  });
  const undeclared = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'undeclared-rating',
      height: 160,
      children: [{ type: 'rating', id: 'rating', rating: '4.8', reviewCount: '128', x: 20, y: 20, w: 250, h: 60 }],
    }],
  });
  const repeated = runCompiler({
    mode: 'replace',
    sections: [
      { id: 'events-one', children: [{ type: 'event-list', id: 'events-1' }] },
      { id: 'events-two', children: [{ type: 'event-list', id: 'events-2' }] },
    ],
  });
  const declared = runCompiler({
    mode: 'replace',
    explicitComponents: ['rating'],
    sections: [{
      id: 'declared-rating',
      height: 160,
      children: [{ type: 'rating', id: 'rating', rating: '4.8', reviewCount: '128', x: 20, y: 20, w: 250, h: 60 }],
    }],
  });
  try {
    assert.equal(deprecated.execution.status, 1);
    assert.match(deprecated.result.validation.errors.join('\n'), /deprecated/);
    assert.equal(undeclared.execution.status, 1);
    assert.match(undeclared.result.validation.errors.join('\n'), /explicitly requested/);
    assert.equal(repeated.execution.status, 1);
    assert.match(repeated.result.validation.errors.join('\n'), /at most once/);
    assert.equal(declared.execution.status, 0, declared.execution.stderr);
  } finally {
    cleanup(deprecated.directory);
    cleanup(undeclared.directory);
    cleanup(repeated.directory);
    cleanup(declared.directory);
  }
});

test('completes nested fixed-component link fields before the final audit', () => {
  const run = runCompiler({
    mode: 'replace',
    explicitComponents: ['navigation'],
    sections: [
      {
        id: 'navigation-carrier',
        children: [{
          type: 'navigation',
          id: 'navigation',
          items: [{ text: 'Home', link: { page: 'home' } }],
        }],
      },
      {
        id: 'banner-carrier',
        children: [{
          type: 'banner',
          id: 'banner',
          items: [{ src: verifiedImageUrl, link: { page: 'events' } }],
        }],
      },
    ],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.deepEqual(run.result.designJson[0].component.props.list[0].link, {
      page: 'home',
      appid: '',
      type: '',
      name: '',
    });
    assert.deepEqual(run.result.designJson[1].component.props.list[0].link, {
      name: '',
      type: '',
      appid: '',
      page: 'events',
    });
  } finally {
    cleanup(run.directory);
  }
});

test('records and validates the UI/UX controlled-variation design profile', () => {
  const section = {
    id: 'profile-section',
    height: 160,
    children: [{ type: 'text', id: 'profile-text', text: 'Distinctive content', x: 20, y: 40, w: 346 }],
  };
  const missing = runCompiler({ mode: 'replace', sections: [section] });
  const malformed = runCompiler({
    mode: 'replace',
    designProfile: { source: 'ui-ux-pro-max' },
    sections: [section],
  });
  const valid = runCompiler({
    mode: 'replace',
    designProfile: {
      source: 'ui-ux-pro-max-fallback',
      query: 'editorial service mobile landing page',
      direction: 'Editorial service guide',
      variationSeed: 'service-ledger-12',
      axes: {
        layout: 'asymmetric editorial stack',
        palette: 'warm paper and ink',
        typography: 'display serif and compact sans',
        imageRhythm: 'alternating landscape and portrait crops',
      },
    },
    sections: [section],
  });
  try {
    assert.equal(missing.execution.status, 0, missing.execution.stderr);
    assert.match(missing.result.validation.warnings.join('\n'), /No designProfile/);
    assert.equal(malformed.execution.status, 1);
    assert.match(malformed.result.validation.errors.join('\n'), /designProfile.*missing required field/);
    assert.equal(valid.execution.status, 0, valid.execution.stderr);
    assert.doesNotMatch(valid.result.validation.warnings.join('\n'), /No designProfile/);
  } finally {
    cleanup(missing.directory);
    cleanup(malformed.directory);
    cleanup(valid.directory);
  }
});

test('all active components compile to valid JSON and report composition metrics', () => {
  const visual = [
    ['text', { text: 'Specific content' }],
    ['img', { src: verifiedImageUrl, fit: 'contain', sourceWidth: 1200, sourceHeight: 800 }],
    ['button', { text: 'Book a session' }],
    ['rectangle', {}],
    ['rich-text', { html: '<p>Formatted content</p>' }],
    ['video-player', { url: 'assets/video.mp4' }],
    ['countdown', { title: 'Registration closes', targetDate: '2026-08-01' }],
    ['tabs', { tabs: [{ title: 'One', height: 180, children: [{ type: 'text', text: 'Tab content', x: 10, y: 10, w: 280 }] }] }],
    ['accordion', { items: [{ title: 'Question', content: 'Answer' }] }],
    ['map', { address: 'Venue address', embedUrl: 'https://maps.google.com/embed' }],
    ['rating', { rating: '4.8', reviewCount: '128' }],
    ['social-share', { title: 'Share' }],
    ['person-profile', { name: 'Person name' }],
    ['inquiry-box', { title: 'Contact' }],
  ];
  const fixed = ['goods-list', 'coupon', 'search', 'discount-promotion', 'event-list', 'event-calendar', 'blog-list'];
  const sections = visual.map(([type, fields]) => ({
    id: `visual-${type}`,
    height: 520,
    children: [{ type, id: `child-${type}`, x: 20, y: 20, w: 346, ...fields }],
  }));
  sections.unshift({ id: 'navbar', children: [{ type: 'brand-navbar', id: 'nav', brandName: 'Brand', showLogo: false }] });
  sections.push({ id: 'fixed-banner', children: [{ type: 'banner', id: 'banner', items: [{ src: verifiedImageUrl }] }] });
  sections.push({ id: 'fixed-navigation', children: [{ type: 'navigation', id: 'navigation', items: [{ text: 'Home' }] }] });
  sections.push({ id: 'fixed-store', children: [{ type: 'store-information', id: 'store', storeName: 'Store' }] });
  sections.push({ id: 'fixed-service', children: [{ type: 'service-list', id: 'service', storeName: 'Service Provider' }] });
  for (const type of fixed) sections.push({ id: `fixed-${type}`, children: [{ type, id: `child-${type}` }] });

  const run = runCompiler({
    mode: 'replace',
    canvasWidth: 386,
    explicitComponents: [
      'video-player', 'countdown', 'tabs', 'accordion', 'rating', 'social-share',
      'person-profile', 'coupon', 'navigation', 'brand-navbar', 'search',
      'discount-promotion',
    ],
    sections,
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.equal(run.result.validation.passed, true);
    assert.equal(run.result.validation.metrics.componentCounts.text, 2);
    assert.equal(run.result.validation.metrics.imageCount, 1);
    assert.equal(run.result.validation.metrics.richTextCount, 1);
    assert.ok(run.result.validation.metrics.corePrimitiveRatio > 0);
    assert.equal(run.result.designJson.length, 26);
  } finally {
    cleanup(run.directory);
  }
});

test('reports a quantified warning when rich text usage is excessive', () => {
  const sections = [
    { id: 'plain', height: 240, children: [{ type: 'text', id: 'plain-text', text: 'Plain text', x: 20, y: 20, w: 346 }] },
    ...[1, 2, 3].map((index) => ({
      id: `rich-${index}`,
      height: 240,
      children: [{ type: 'rich-text', id: `rich-text-${index}`, html: `<p>Formatted ${index}</p>`, x: 20, y: 20, w: 346 }],
    })),
  ];
  const run = runCompiler({ mode: 'replace', sections });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.equal(run.result.validation.metrics.richTextCount, 3);
    assert.equal(run.result.validation.metrics.richTextRatio, 0.75);
    assert.match(run.result.validation.warnings.join('\n'), /Rich text represents 75%/);
  } finally {
    cleanup(run.directory);
  }
});

test('text components match the exact Unico contract without a height field', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'text-contract',
      height: 220,
      children: [{
        type: 'text',
        id: 'hero-title',
        label: 'Hero title',
        text: "Hey Pong Yo, Let's Mahjong!",
        x: 8,
        y: 103,
        w: 367,
        fontSize: 48,
        fontFamily: 'Bungee, sans-serif',
        color: 'rgb(255, 255, 255)',
        fontWeight: '700',
        letterSpacing: -0.48,
        lineHeight: 1.05,
        justify: 'center',
        zIndex: 4,
      }],
    }],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    const component = run.result.designJson[0].field.structure.child.component_list.value[0];
    assert.deepEqual(component, {
      id: 'hero-title',
      label: 'Text',
      type: 'text',
      field: {
        structure: {
          label: 'Text Content',
          child: {
            text: { label: 'Text', type: 'text', value: "Hey Pong Yo, Let's Mahjong!" },
            link: {
              label: 'Link Settings',
              type: 'link',
              value: { page: '', url: '', type: 'external', serviceId: '', productId: '' },
            },
          },
        },
        styles: {
          label: 'Text Style',
          child: {
            width: { label: 'Width', type: 'width', value: 367 },
            paddingInline: { label: 'Horizontal Padding', type: 'paddingInline', value: 20 },
            paddingBlock: { label: 'Vertical Padding', type: 'paddingBlock', value: 10 },
            fontSize: { label: 'Font Size', type: 'fontSize', value: 48 },
            fontFamily: { label: 'Font Family', type: 'fontFamily', value: 'Bungee, sans-serif' },
            color: { label: 'Font Color', type: 'color', value: 'rgb(255, 255, 255)' },
            fontWeight: { label: 'Font Weight', type: 'fontWeight', value: '700' },
            letterSpacing: { label: 'Letter Spacing', type: 'letterSpacing', value: -0.48 },
            lineHeight: { label: 'Line Height', type: 'lineHeight', value: 1.05 },
            fontStyle: { label: 'Italic', type: 'fontStyle', value: 'normal' },
            textDecoration: { label: 'Underline', type: 'textDecoration', value: 'none' },
            justify: { label: 'Layout', type: 'justify', value: 'center' },
            zIndex: { label: 'Levels', type: 'zIndex', value: 4 },
            top: { label: 'Top Distance', type: 'top', value: 103 },
            left: { label: 'Left Distance', type: 'left', value: 8 },
          },
        },
      },
    });
  } finally {
    cleanup(run.directory);
  }
});

test('estimates rich-text height from content width, padding, and font size', () => {
  const samples = [
    { id: 'narrow', text: 'Easy walks and easy talks for weekends.', width: 88, fontSize: 12, expectedHeight: 120 },
    { id: 'wide', text: 'Every new guest gets a welcome, an introduction, and helpful guidance.', width: 346, fontSize: 14, expectedHeight: 70 },
    { id: 'medium', text: 'Walk by the sea and meet new friends.', width: 190, fontSize: 12, expectedHeight: 57 },
  ];
  const run = runCompiler({
    mode: 'replace',
    sections: samples.map((sample) => ({
      id: `rich-${sample.id}`,
      height: 180,
      children: [{
        type: 'rich-text',
        id: sample.id,
        text: sample.text,
        x: 20,
        y: 20,
        w: sample.width,
        fontSize: sample.fontSize,
        paddingInline: 10,
        paddingBlock: 10,
      }],
    })),
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    const heights = run.result.designJson.map((section) => {
      const component = section.field.structure.child.component_list.value[0];
      assert.equal(component.field.styles.child.paddingInline.value, 10);
      assert.equal(component.field.styles.child.paddingBlock.value, 10);
      return component.field.styles.child.height.value;
    });
    assert.deepEqual(heights, samples.map(({ expectedHeight }) => expectedHeight));
  } finally {
    cleanup(run.directory);
  }
});

test('rejects image-provider detail pages and accepts verified CDN image URLs', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [
      {
        id: 'bad-image-page',
        height: 240,
        children: [{
          type: 'img',
          id: 'page-url',
          src: 'https://unsplash.com/photos/mahjong-tiles-arranged-on-a-table-yUaqsVKIHYE',
          x: 20,
          y: 20,
          w: 346,
          h: 180,
          fit: 'cover',
        }],
      },
      {
        id: 'good-image-cdn',
        height: 240,
        children: [{
          type: 'img',
          id: 'direct-url',
          src: 'https://images.unsplash.com/photo-1767169768227-79688439fb37?auto=format&fit=crop&w=1200&q=80',
          x: 20,
          y: 20,
          w: 346,
          h: 180,
          fit: 'cover',
        }],
      },
    ],
  });
  try {
    assert.equal(run.execution.status, 1);
    const errors = run.result.validation.errors.join('\n');
    assert.match(errors, /not a direct image URL/);
    assert.doesNotMatch(errors, /good-image-cdn/);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects explicit rich-text heights below the estimated content height', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'short-rich-text',
      height: 180,
      children: [{
        type: 'rich-text',
        id: 'rich-copy',
        text: 'Every new guest gets a welcome, an introduction, and helpful guidance.',
        x: 20,
        y: 20,
        w: 346,
        h: 40,
        padding: 10,
        fontSize: 14,
      }],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /rich-text height 40 is too small.*70/);
  } finally {
    cleanup(run.directory);
  }
});

test('button horizontal and vertical padding both default to 0', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'button-padding',
      height: 160,
      children: [{ type: 'button', id: 'cta', text: 'Book now', x: 20, y: 40, w: 346, h: 48 }],
    }],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    const styles = run.result.designJson[0].field.structure.child.component_list.value[0].field.styles.child;
    assert.equal(styles.paddingInline.value, 0);
    assert.equal(styles.paddingBlock.value, 0);
  } finally {
    cleanup(run.directory);
  }
});

test('image components accept only real web image URLs and reject every SVG source', () => {
  const invalidSources = [
    'assets/generated.svg',
    'https://cdn.example.test/generated.svg',
    'https://images.example.test/render?format=svg',
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    'assets/local-photo.jpg',
  ];
  const run = runCompiler({
    mode: 'replace',
    sections: invalidSources.map((src, index) => ({
      id: `invalid-image-${index}`,
      height: 160,
      children: [{ type: 'img', id: `image-${index}`, src, x: 20, y: 20, w: 120, h: 100, fit: 'cover' }],
    })),
  });
  try {
    assert.equal(run.execution.status, 1);
    const errors = run.result.validation.errors.join('\n');
    assert.match(errors, /SVG images are forbidden/);
    assert.match(errors, /must use a verified HTTP\(S\) image URL/);
  } finally {
    cleanup(run.directory);
  }
});

test('rectangle cards without height include the estimated height of contained text', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'auto-card',
      children: [
        { type: 'rectangle', id: 'card', x: 20, y: 20, w: 346, zIndex: 1, bgColor: '#ffffff', radius: 16 },
        {
          type: 'text',
          id: 'card-copy',
          text: 'This card description wraps across several lines and extends beyond the rectangle default height.',
          x: 40,
          y: 44,
          w: 306,
          fontSize: 16,
          lineHeight: 1.5,
          zIndex: 2,
        },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    const section = run.result.designJson[0];
    const children = section.field.structure.child.component_list.value;
    const cardHeight = children[0].field.styles.child.height.value;
    const sectionHeight = section.field.styles.child.height.value;
    assert.ok(cardHeight > 80);
    assert.ok(sectionHeight >= 20 + cardHeight + 32);
  } finally {
    cleanup(run.directory);
  }
});

test('rejects explicit rectangle card heights that cannot contain their text', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'short-card',
      height: 240,
      children: [
        { type: 'rectangle', id: 'card', x: 20, y: 20, w: 346, h: 80, zIndex: 1, bgColor: '#ffffff' },
        {
          type: 'text',
          id: 'card-copy',
          text: 'This card description wraps across several lines and extends beyond the rectangle default height.',
          x: 40,
          y: 44,
          w: 306,
          fontSize: 16,
          lineHeight: 1.5,
          zIndex: 2,
        },
      ],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /card height 80 is too small/);
  } finally {
    cleanup(run.directory);
  }
});

test('business components occupy carrier sections but compile beside free boxes', () => {
  const run = runCompiler({
    mode: 'replace',
    explicitComponents: ['coupon'],
    sections: [
      { id: 'intro', height: 160, children: [{ type: 'text', id: 'intro-text', text: 'Event introduction', x: 20, y: 40, w: 346 }] },
      { id: 'event-carrier', children: [{ type: 'event-list', id: 'event', styleMode: 0 }] },
      { id: 'service-carrier', children: [{ type: 'service-list', id: 'service', storeName: 'Service Provider' }] },
      { id: 'product-carrier', children: [{ type: 'product-list', id: 'products' }] },
      { id: 'blog-carrier', children: [{ type: 'blog', id: 'blog' }] },
      { id: 'coupon-carrier', children: [{ type: 'coupon', id: 'coupon' }] },
      { id: 'inquiry-carrier', children: [{ type: 'inquiry', id: 'inquiry', title: 'Contact us' }] },
      { id: 'map-carrier', children: [{ type: 'map', id: 'map', address: 'Venue', embedUrl: 'https://www.google.com/maps/embed' }] },
      { id: 'store-carrier', children: [{ type: 'storeinfo', id: 'store', storeName: 'Store' }] },
      { id: 'outro', height: 160, children: [{ type: 'text', id: 'outro-text', text: 'Contact us', x: 20, y: 40, w: 346 }] },
    ],
  });
  try {
    assert.equal(run.execution.status, 0, run.execution.stderr);
    assert.deepEqual(run.result.designJson.map(({ type }) => type), [
      'free-box', 'event-list', 'service-list', 'goods-list', 'blog-list',
      'coupon', 'inquiry-box', 'map', 'store-information', 'free-box',
    ]);
    assert.deepEqual(run.result.designJson[1], {
      id: 'event',
      label: 'Event List',
      type: 'event-list',
      component: {
        name: 'event-list',
        props: { data: { events: [], styleMode: 0 } },
      },
    });
    for (const component of run.result.designJson.slice(1, 9)) {
      assert.notEqual(component.type, 'free-box');
    }
  } finally {
    cleanup(run.directory);
  }
});

test('skill source files contain no Chinese characters', () => {
  const textExtensions = new Set(['.json', '.md', '.mjs']);
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      if (entry === '.git') continue;
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) visit(path);
      else if (textExtensions.has(entry.slice(entry.lastIndexOf('.')))) files.push(path);
    }
  };
  visit(resolve('.'));
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /[\u3400-\u9fff]/u, `${file} contains Chinese characters`);
  }
});

test('rejects non-English CJK text in generated IR', () => {
  const run = runCompiler({
    mode: 'replace',
    sections: [{
      id: 'english-only',
      height: 160,
      children: [{ type: 'text', id: 'copy', text: '\u4f60\u597d', x: 20, y: 40, w: 346 }],
    }],
  });
  try {
    assert.equal(run.execution.status, 1);
    assert.match(run.result.validation.errors.join('\n'), /English-only/);
  } finally {
    cleanup(run.directory);
  }
});
