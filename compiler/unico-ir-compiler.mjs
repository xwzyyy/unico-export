#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] || 'unico-design-ir.json');
const outputPath = resolve(process.argv[3] || 'unico-export-result.json');
const canonicalPath = resolve(process.argv[4] || 'unico-page.json');
const CANVAS_WIDTH = 386;
const MIN_TEXT_GAP = 8;
const FOREGROUND_CONTENT_TYPES = new Set([
  'text', 'rich-text', 'button', 'img-text', 'video-player', 'countdown', 'tabs',
  'accordion', 'map', 'rating', 'social-share', 'person-profile', 'inquiry-box',
]);
const SUPPORTED_CHILD_TYPES = new Set([
  'text',
  'img',
  'button',
  'rectangle',
  'circle',
  'rich-text',
  'img-text',
  'video-player',
  'countdown',
  'tabs',
  'accordion',
  'map',
  'rating',
  'social-share',
  'person-profile',
  'inquiry-box',
  'goods-list',
  'coupon',
  'navigation',
  'brand-navbar',
  'search',
  'banner',
  'store-information',
  'discount-promotion',
  'service-list',
  'event-list',
  'event-calendar',
  'blog-list',
]);

const FIXED_COMPONENT_TYPES = new Set([
  'goods-list', 'coupon', 'navigation', 'brand-navbar', 'search', 'banner',
  'store-information', 'discount-promotion', 'service-list', 'event-list',
  'event-calendar', 'blog-list',
]);

const TOP_LEVEL_BLOCK_TYPES = new Set([
  ...FIXED_COMPONENT_TYPES,
  'map',
  'inquiry-box',
]);

const FREQUENT_COMPONENT_TYPES = new Set([
  'text',
  'img',
  'button',
  'rectangle',
]);

const MODERATE_COMPONENT_TYPES = new Set([
  'rich-text',
]);

const CONDITIONAL_SINGLE_USE_TYPES = new Set([
  'banner',
  'blog-list',
  'service-list',
  'event-list',
  'event-calendar',
  'store-information',
  'inquiry-box',
  'goods-list',
  'map',
]);

const DEPRECATED_COMPONENT_TYPES = new Set([
  'img-text',
  'circle',
]);

const EXPLICIT_ONLY_COMPONENT_TYPES = new Set(
  [...SUPPORTED_CHILD_TYPES].filter((type) => (
    !FREQUENT_COMPONENT_TYPES.has(type)
    && !MODERATE_COMPONENT_TYPES.has(type)
    && !CONDITIONAL_SINGLE_USE_TYPES.has(type)
    && !DEPRECATED_COMPONENT_TYPES.has(type)
  )),
);

const DEFAULT_DIMENSIONS = {
  text: [320, 40],
  img: [120, 80],
  button: [120, 48],
  rectangle: [120, 80],
  circle: [80, 80],
  'rich-text': [320, 120],
  'img-text': [320, 160],
  'video-player': [320, 220],
  countdown: [320, 150],
  tabs: [320, 340],
  accordion: [320, 300],
  map: [320, 240],
  rating: [250, 60],
  'social-share': [320, 100],
  'person-profile': [320, 400],
  'inquiry-box': [320, 420],
};

const BASE_POSITIONED_STYLE_FIELDS = ['width', 'height', 'zIndex', 'top', 'left'];
const TEXT_STYLE_FIELDS = [
  'width', 'paddingInline', 'paddingBlock', 'fontSize', 'fontFamily', 'color',
  'fontWeight', 'letterSpacing', 'lineHeight', 'fontStyle', 'textDecoration',
  'justify', 'zIndex', 'top', 'left',
];
const TYPOGRAPHIC_STYLE_FIELDS = [
  'fontSize', 'color', 'fontWeight', 'fontFamily', 'lineHeight', 'justify',
];
const BORDER_STYLE_FIELDS = ['bgColor', 'radius', 'borderColor', 'borderWidth'];
const FIELD_COMPONENT_CONTRACTS = {
  text: {
    structure: ['text', 'link'],
    styles: TEXT_STYLE_FIELDS,
  },
  img: {
    structure: ['upload', 'link'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'radius', 'customCSS'],
  },
  button: {
    structure: ['text', 'link'],
    styles: [
      ...BASE_POSITIONED_STYLE_FIELDS,
      ...TYPOGRAPHIC_STYLE_FIELDS,
      ...BORDER_STYLE_FIELDS,
      'paddingInline',
      'paddingBlock',
    ],
  },
  rectangle: {
    structure: ['link'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, ...BORDER_STYLE_FIELDS],
  },
  circle: {
    structure: ['link'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, ...BORDER_STYLE_FIELDS],
  },
  'rich-text': {
    structure: ['content'],
    styles: [
      ...BASE_POSITIONED_STYLE_FIELDS,
      ...TYPOGRAPHIC_STYLE_FIELDS,
      'radius',
      'paddingInline',
      'paddingBlock',
    ],
  },
  'img-text': {
    structure: ['img_text_list'],
    styles: [
      ...BASE_POSITIONED_STYLE_FIELDS,
      'paddingInline',
      'paddingBlock',
      'radius',
      'fontSize',
      'fontFamily',
      'color',
      'backgroundColor',
      'fontWeight',
    ],
  },
  'video-player': {
    structure: ['videoUrl'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor'],
  },
  countdown: {
    structure: ['title', 'targetDate'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor', 'color'],
  },
  tabs: {
    structure: [
      'tabCount',
      'tab1Title', 'tab1Content',
      'tab2Title', 'tab2Content',
      'tab3Title', 'tab3Content',
      'tab4Title', 'tab4Content',
      'tab5Title', 'tab5Content',
    ],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor', 'color'],
  },
  accordion: {
    structure: ['items'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor', 'borderColor', 'activeColor'],
  },
  map: {
    structure: ['address', 'embedUrl', 'linkUrl'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor'],
  },
  rating: {
    structure: ['rating', 'reviewCount'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'color'],
  },
  'social-share': {
    structure: [
      'title',
      'showFacebook', 'facebookUrl',
      'showTwitter', 'twitterUrl',
      'showLinkedin', 'linkedinUrl',
      'showWhatsapp', 'whatsappUrl',
      'showEmail', 'emailUrl',
    ],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor', 'buttonStyle'],
  },
  'person-profile': {
    structure: ['avatar', 'name', 'title', 'bio', 'email', 'phone', 'linkedin', 'twitter', 'website'],
    styles: [...BASE_POSITIONED_STYLE_FIELDS, 'bgColor', 'color', 'avatarSize'],
  },
  'inquiry-box': {
    structure: [
      'title', 'nameLabel', 'contactLabel', 'inquiryTitleLabel', 'contentLabel',
      'pictureLabel', 'submitButtonText', 'successMessage',
    ],
    styles: [
      ...BASE_POSITIONED_STYLE_FIELDS,
      'bgColor', 'primaryColor', 'buttonColor', 'buttonTextColor',
      'inputBorderColor', 'labelColor', 'titleColor',
    ],
  },
};

const FIXED_COMPONENT_NAMES = {
  'goods-list': 'fix-goods-list',
  coupon: 'fix-coupon',
  navigation: 'fix-menus',
  'brand-navbar': 'fix-brand-navbar',
  search: 'fix-search',
  banner: 'fix-banner',
  'store-information': 'store-information',
  'discount-promotion': 'discount-promotion',
  'service-list': 'service-list',
  'event-list': 'event-list',
  'event-calendar': 'event-calendar',
  'blog-list': 'blog-list',
};

const POSITION_PATHS = ['top', 'mode', 'isSeat', 'zIndex'];
const SPACING_PATHS = ['marginLR', 'marginTop', 'marginBottom', 'borderTopLR', 'borderBottomLR'];
const FIXED_COMPONENT_PROP_PATHS = {
  'goods-list': [
    'data.gap', 'data.num', 'data.list', 'data.mode', 'data.type', 'data.source',
    'data.isShadow', 'data.attribute', 'data.isVoucher', 'data.allProducts',
    ...POSITION_PATHS.map((field) => `position.${field}`),
    'styleColor.color', 'styleColor.backgroundColor',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
  ],
  'discount-promotion': [
    'data.gap', 'data.num', 'data.list', 'data.mode', 'data.type', 'data.source',
    'data.isShadow', 'data.attribute', 'data.isVoucher', 'data.allProducts',
    ...POSITION_PATHS.map((field) => `position.${field}`),
    'styleColor.color', 'styleColor.backgroundColor',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
  ],
  coupon: [
    'data.title', 'data.subtitle', 'data.logo', 'data.couponName', 'data.merchantName',
    'data.themeColor', 'data.titleColor', 'data.subtitleColor', 'data.backgroundImage',
    'data.titleFontFamily', 'data.titleFontSize', 'data.titleFontWeight',
    'data.subtitleFontFamily', 'data.subtitleFontSize', 'data.subtitleFontWeight',
    'data.couponNameFontFamily', 'data.couponNameFontSize', 'data.couponNameFontWeight',
    'data.merchantNameFontFamily', 'data.merchantNameFontSize', 'data.merchantNameFontWeight',
  ],
  search: [
    'mode', 'placeholder', 'backgroundColor',
    ...POSITION_PATHS.map((field) => `position.${field}`),
    'styleColor.color', 'styleColor.opacity', 'styleColor.backgroundColor',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
    'styleSpacing.padding',
  ],
  navigation: [
    'style.shape', 'style.pageNum', 'style.rowNum', 'style.iconSize',
    'styleColor.color', 'styleColor.backgroundColor', 'styleColor.opacity',
    'styleColor.fontWeight', 'styleColor.fontStyle', 'styleColor.textDecoration',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
    ...POSITION_PATHS.map((field) => `position.${field}`),
    'list',
  ],
  'brand-navbar': [
    'brand.logo', 'brand.name', 'brand.showLogo',
    'layout.mode', 'layout.itemGap', 'layout.paddingX', 'layout.height',
    'styleColor.backgroundColor', 'styleColor.textColor',
    'styleColor.menuBackgroundColor', 'styleColor.menuTextColor',
    'typography.brandFontSize', 'typography.navFontSize', 'typography.fontWeight',
    'iconStyle.brandIconSize', 'iconStyle.itemIconSize', 'iconStyle.menuIconSize',
    'items',
  ],
  banner: [
    'mode', 'height',
    'styleColor.color', 'styleColor.backgroundColor', 'styleColor.opacity',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
    'indicatorDots', 'autoplay', 'list',
  ],
  'store-information': [
    'data.backgroundImage', 'data.logo', 'data.storeName', 'data.slogan',
    'data.phone', 'data.email', 'data.address', 'data.businessHours',
  ],
  'event-list': ['data.events', 'data.styleMode'],
  'event-calendar': [
    'data.events', 'data.viewMode', 'data.styleMode', 'data.themePreset',
    'data.primaryColor', 'data.secondaryColor', 'data.accentColor',
    'data.backgroundColor', 'data.surfaceColor', 'data.textColor', 'data.mutedTextColor',
  ],
  'service-list': [
    'data.storeName', 'data.totalSales', 'data.logo', 'data.themeColor',
    'data.categories', 'data.services',
  ],
  'blog-list': [
    'data.blogContents',
    ...SPACING_PATHS.map((field) => `styleSpacing.${field}`),
    'styleColor.titleColor', 'styleColor.titleFontSize', 'styleColor.titleFontWeight',
    'styleColor.subtitleColor', 'styleColor.subtitleFontSize', 'styleColor.subtitleFontWeight',
    'styleColor.backgroundColor',
  ],
};

main();

function main() {
  let ir;
  let canonicalEnvelope;
  try {
    ir = JSON.parse(readFileSync(inputPath, 'utf8'));
    canonicalEnvelope = readCanonicalEnvelope(canonicalPath);
  } catch (error) {
    writeFailureResult(error instanceof Error ? error.message : String(error));
    return;
  }

  const irValidation = validateIr(ir, { hasCanonical: Boolean(canonicalEnvelope) });
  if (!irValidation.passed) {
    writeFailureResult(irValidation.errors, irValidation.warnings, canonicalEnvelope?.designJson || [], irValidation.metrics);
    return;
  }

  let compiledDesignJson;
  try {
    compiledDesignJson = compileUnicoDesign(ir);
  } catch (error) {
    writeFailureResult(error instanceof Error ? error.message : String(error), irValidation.warnings, canonicalEnvelope?.designJson || [], irValidation.metrics);
    return;
  }

  const designJson = ir.mode === 'replace' || !canonicalEnvelope
    ? compiledDesignJson
    : extendCanonicalDesign(canonicalEnvelope.designJson, compiledDesignJson);
  const outputValidation = validateDesignJson(designJson);
  const validation = {
    passed: outputValidation.passed,
    errors: outputValidation.errors,
    warnings: irValidation.warnings,
    metrics: irValidation.metrics,
  };
  const resultEnvelope = {
    type: 'unico_design_result',
    message: ir.message || 'Generated Unico DND JSON from Unico design IR.',
    designJson,
    validation,
  };

  writeFileSync(outputPath, `${JSON.stringify(resultEnvelope, null, 2)}\n`);
  if (!validation.passed) {
    process.exitCode = 1;
    return;
  }
  writeFileSync(canonicalPath, `${JSON.stringify({
    designJson,
    message: resultEnvelope.message,
  }, null, 2)}\n`);
}

function writeFailureResult(errors, warnings = [], designJson = [], metrics = undefined) {
  const normalizedErrors = Array.isArray(errors) ? errors : [String(errors)];
  writeFileSync(outputPath, `${JSON.stringify({
    type: 'unico_design_result',
    message: 'Unico IR compilation failed. Fix validation errors and run the compiler again.',
    designJson,
    validation: { passed: false, errors: normalizedErrors, warnings, ...(metrics ? { metrics } : {}) },
  }, null, 2)}\n`);
  for (const error of normalizedErrors) console.error(error);
  process.exitCode = 1;
}

function readCanonicalEnvelope(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    const value = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!Array.isArray(value?.designJson)) {
      throw new Error('Existing unico-page.json must be an object with a designJson array.');
    }
    return value;
  } catch (error) {
    throw new Error(`Cannot safely read existing canonical page: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extendCanonicalDesign(currentDesignJson, additions) {
  const newNavbar = additions.find((component) => component.type === 'brand-navbar');
  const preserved = newNavbar
    ? currentDesignJson.filter((component) => component.type !== 'brand-navbar')
    : currentDesignJson;
  return [
    ...(newNavbar ? [newNavbar] : []),
    ...preserved,
    ...additions.filter((component) => component.type !== 'brand-navbar'),
  ];
}

function compileUnicoDesign(input) {
  const sections = Array.isArray(input.sections) ? input.sections : [];
  const navbars = sections.flatMap((section) => Array.isArray(section.children) ? section.children : [])
    .filter((child) => normalizeType(child.type) === 'brand-navbar')
    .map((child, index) => compileFixedChild(child, index, 'navbar'));
  const compiledBlocks = sections.flatMap((section, index) => {
    const children = (Array.isArray(section.children) ? section.children : [])
      .filter((child) => normalizeType(child.type) !== 'brand-navbar');
    if (children.length === 1 && TOP_LEVEL_BLOCK_TYPES.has(normalizeType(children[0].type))) {
      return [compileTopLevelBlock(children[0], index, section.id || `section-${index + 1}`)];
    }
    return children.length ? [compileSection({ ...section, children }, index)] : [];
  });
  return [...navbars.slice(0, 1), ...compiledBlocks];
}

function compileTopLevelBlock(child, index, scope) {
  const type = normalizeType(child.type);
  return FIXED_COMPONENT_TYPES.has(type)
    ? compileFixedChild(child, index, scope)
    : compileChild(child, index, scope);
}

function compileSection(section, index) {
  const width = number(section.width, CANVAS_WIDTH);
  const children = resolveAutoCardHeights(Array.isArray(section.children) ? section.children : []);
  const height = section.height === undefined
    ? recommendedSectionHeight(children)
    : number(section.height, 480);
  return {
    id: safeId(section.id || `section-${index + 1}`, `section-${index + 1}`),
    label: string(section.label || section.name || `Section ${index + 1}`),
    type: 'free-box',
    field: {
      structure: {
        label: 'Freeform Container',
        child: {
          sectionName: control('Section Name', 'text', string(section.name || section.label || `Section ${index + 1}`)),
          component_list: {
            label: 'Widgets List',
            type: 'component_list',
            value: children.map((child, childIndex) => compileChild(child, childIndex, section.id || `section-${index + 1}`)),
          },
        },
      },
      styles: {
        label: 'Container Style',
        child: {
          width: control('Container Width', 'width', width),
          height: control('Container Height', 'height', height),
          justify: control('Layout', 'justify', string(section.justify || 'left')),
          bgColor: control('Background Color', 'bgColor', color(section.bgColor || section.background || 'transparent')),
        },
      },
      config: {
        label: 'Alignment & Grid Settings',
        child: {
          editMode: control('Edit Mode', 'editMode', 'free-form'),
          showGuides: control('Show Alignment Guides', 'showGuides', true),
          enableHorizontalScroll: control('Enable Horizontal Scroll', 'enableHorizontalScroll', false),
          gridSize: control('Grid Size (px)', 'gridSize', 10),
        },
      },
    },
  };
}

function recommendedSectionHeight(children) {
  const fixedHeights = {
    'goods-list': 720,
    coupon: 300,
    navigation: 260,
    search: 120,
    banner: 520,
    'store-information': 320,
    'discount-promotion': 720,
    'service-list': 680,
    'event-list': 720,
    'event-calendar': 760,
    'blog-list': 680,
  };
  let flowHeight = 0;
  let positionedBottom = 0;
  for (const child of children) {
    const type = normalizeType(child.type);
    if (fixedHeights[type]) {
      flowHeight += fixedHeights[type];
      continue;
    }
    const width = resolvedChildWidth(child, type);
    const childHeight = resolvedChildHeight(child, type, width);
    positionedBottom = Math.max(
      positionedBottom,
      number(child.y ?? child.top, 0) + childHeight,
    );
  }
  return Math.max(240, flowHeight + positionedBottom + 32);
}

function resolveAutoCardHeights(children) {
  return children.map((child, childIndex) => {
    let type;
    try {
      type = normalizeType(child?.type);
    } catch {
      return child;
    }
    if (type !== 'rectangle' || child.h !== undefined || child.height !== undefined || child.autoFitContent === false) {
      return child;
    }
    const inferredHeight = inferredCardHeight(child, childIndex, children);
    return inferredHeight > DEFAULT_DIMENSIONS.rectangle[1] ? { ...child, h: inferredHeight } : child;
  });
}

function inferredCardHeight(card, cardIndex, children) {
  const cardX = number(card.x ?? card.left, 0);
  const cardY = number(card.y ?? card.top, 0);
  const cardWidth = resolvedChildWidth(card, 'rectangle');
  const cardZIndex = number(card.zIndex, cardIndex + 1);
  const bottomPadding = Math.max(0, number(card.contentPaddingBottom, 16));
  let nextCardTop = Infinity;

  for (const [index, candidate] of children.entries()) {
    if (index === cardIndex) continue;
    let type;
    try {
      type = normalizeType(candidate?.type);
    } catch {
      continue;
    }
    if (type !== 'rectangle') continue;
    const candidateY = number(candidate.y ?? candidate.top, 0);
    if (candidateY <= cardY) continue;
    const candidateX = number(candidate.x ?? candidate.left, 0);
    const candidateWidth = resolvedChildWidth(candidate, type);
    const overlap = Math.min(cardX + cardWidth, candidateX + candidateWidth) - Math.max(cardX, candidateX);
    if (overlap > 0) nextCardTop = Math.min(nextCardTop, candidateY);
  }

  let contentBottom = cardY;
  for (const [index, candidate] of children.entries()) {
    if (index === cardIndex || candidate?.allowCardOverflow) continue;
    let type;
    try {
      type = normalizeType(candidate?.type);
    } catch {
      continue;
    }
    if (type === 'rectangle' || type === 'circle' || FIXED_COMPONENT_TYPES.has(type)) continue;
    const candidateX = number(candidate.x ?? candidate.left, 0);
    const candidateY = number(candidate.y ?? candidate.top, 0);
    const candidateWidth = resolvedChildWidth(candidate, type);
    const candidateZIndex = number(candidate.zIndex, index + 1);
    const horizontallyContained = candidateX >= cardX && candidateX + candidateWidth <= cardX + cardWidth;
    if (!horizontallyContained || candidateY < cardY || candidateY >= nextCardTop || candidateZIndex <= cardZIndex) continue;
    const candidateHeight = resolvedChildHeight(candidate, type, candidateWidth);
    contentBottom = Math.max(contentBottom, candidateY + candidateHeight);
  }

  return Math.max(DEFAULT_DIMENSIONS.rectangle[1], Math.ceil(contentBottom - cardY + bottomPadding));
}

function compileChild(child, index, scope = 'component') {
  const type = normalizeType(child.type);
  if (FIXED_COMPONENT_TYPES.has(type)) return compileFixedChild(child, index, scope);
  const base = {
    id: safeId(child.id || `${scope}-${type}-${index + 1}`, `${scope}-${type}-${index + 1}`),
    label: type === 'text' ? 'Text' : string(child.label || child.text || child.name || defaultComponentLabel(type)),
    type,
    field: {
      structure: { label: structureLabel(type), child: structureChild(type, child, `${scope}-${type}-${index + 1}`) },
      styles: { label: styleLabel(type), child: styleChild(type, child, index) },
    },
  };
  return base;
}

function compileFixedChild(child, index, scope) {
  const type = normalizeType(child.type);
  return {
    id: safeId(child.id || `${scope}-${type}-${index + 1}`, `${scope}-${type}-${index + 1}`),
    label: string(child.label || child.title || child.name || defaultComponentLabel(type)),
    type,
    component: fixedComponent(type, child),
  };
}

function fixedComponent(type, child) {
  const position = { top: number(child.top ?? child.y, 0), mode: 'static', isSeat: true, zIndex: number(child.zIndex, 5) };
  const spacing = { marginLR: 0, marginTop: 0, marginBottom: 0, borderTopLR: 0, borderBottomLR: 0 };
  if (type === 'goods-list' || type === 'discount-promotion') return {
    name: type === 'goods-list' ? 'fix-goods-list' : 'discount-promotion',
    props: {
      data: { gap: number(child.gap, 0), num: number(child.num, 99), list: [], mode: string(child.mode || 'mode-1'), type: [], source: string(child.source || 'source-1'), isShadow: child.isShadow !== false, attribute: number(child.attribute, 0), isVoucher: child.isVoucher !== false, allProducts: child.allProducts !== false },
      position,
      styleColor: { color: color(child.color || '#000000'), backgroundColor: color(child.bgColor || '#f5f6f7') },
      styleSpacing: { ...spacing, marginTop: number(child.marginTop, 83), marginBottom: number(child.marginBottom, 86) },
    },
  };
  if (type === 'coupon') return { name: 'fix-coupon', props: { data: {
    title: string(child.title || 'FREE COUPON'), subtitle: string(child.subtitle || 'Click to claim'), logo: string(child.logo || ''), couponName: string(child.couponName || 'Special Discount'), merchantName: string(child.merchantName || 'Your Store Name'), themeColor: color(child.themeColor || '#90ee90'), titleColor: color(child.titleColor || '#333333'), subtitleColor: color(child.subtitleColor || '#666666'), backgroundImage: string(child.backgroundImage || ''), titleFontFamily: string(child.titleFontFamily || 'inherit'), titleFontSize: number(child.titleFontSize, 24), titleFontWeight: child.titleFontWeight ?? 'bold', subtitleFontFamily: string(child.subtitleFontFamily || 'inherit'), subtitleFontSize: number(child.subtitleFontSize, 14), subtitleFontWeight: child.subtitleFontWeight ?? 'normal', couponNameFontFamily: string(child.couponNameFontFamily || 'inherit'), couponNameFontSize: number(child.couponNameFontSize, 18), couponNameFontWeight: child.couponNameFontWeight ?? 'normal', merchantNameFontFamily: string(child.merchantNameFontFamily || 'inherit'), merchantNameFontSize: number(child.merchantNameFontSize, 16), merchantNameFontWeight: child.merchantNameFontWeight ?? 'normal',
  } } };
  if (type === 'search') return { name: 'fix-search', props: { mode: string(child.mode || 'mode-1'), placeholder: string(child.placeholder || 'Enter keywords to search'), backgroundColor: color(child.backgroundColor || '#f6f7fa'), position: { ...position, top: number(child.top ?? child.y, 44), zIndex: number(child.zIndex, 1) }, styleColor: { color: color(child.color || '#000000'), opacity: number(child.opacity, 1), backgroundColor: color(child.bgColor || '#ffffff') }, styleSpacing: { ...spacing, padding: number(child.padding, 24), borderTopLR: number(child.radius, 24), borderBottomLR: number(child.radius, 24) } } };
  if (type === 'navigation') return { name: 'fix-menus', props: { style: { shape: string(child.shape || 'round'), pageNum: number(child.pageNum, 2), rowNum: number(child.rowNum, 4), iconSize: number(child.iconSize, 50) }, styleColor: { color: color(child.color || '#000000'), backgroundColor: color(child.bgColor || '#f6f7fa'), opacity: number(child.opacity, 1), fontWeight: child.fontWeight ?? 'normal', fontStyle: child.fontStyle ?? 'normal', textDecoration: child.textDecoration ?? 'none' }, styleSpacing: spacing, position: { ...position, zIndex: number(child.zIndex, 1) }, list: (Array.isArray(child.items) ? child.items : []).map((item) => ({ text: string(item.text || item.label || 'Button'), useText: item.useText !== false, mode: string(item.mode || 'mode-1'), link: { page: '', appid: '', type: '', name: '', ...(item.link && typeof item.link === 'object' ? item.link : {}) }, icon: string(item.icon || ''), color: color(item.color || '#000000'), backgroundColor: color(item.backgroundColor || '#ffffff') })) } };
  if (type === 'brand-navbar') return { name: 'fix-brand-navbar', props: { brand: { logo: string(child.logo || child.brand?.logo || ''), name: string(child.brandName || child.brand?.name || 'Merchant Name'), showLogo: child.showLogo ?? child.brand?.showLogo ?? true }, layout: { mode: string(child.layout?.mode || child.mode || 'inline'), itemGap: number(child.layout?.itemGap ?? child.itemGap, 16), paddingX: number(child.layout?.paddingX ?? child.paddingX, 16), height: number(child.layout?.height ?? child.height, 64) }, styleColor: { backgroundColor: color(child.styleColor?.backgroundColor || child.bgColor || '#ffffff'), textColor: color(child.styleColor?.textColor || child.color || '#111827'), menuBackgroundColor: color(child.styleColor?.menuBackgroundColor || '#111827'), menuTextColor: color(child.styleColor?.menuTextColor || '#ffffff') }, typography: { brandFontSize: number(child.typography?.brandFontSize ?? child.brandFontSize, 18), navFontSize: number(child.typography?.navFontSize ?? child.navFontSize, 14), fontWeight: child.typography?.fontWeight ?? child.fontWeight ?? '600' }, iconStyle: { brandIconSize: number(child.iconStyle?.brandIconSize, 40), itemIconSize: number(child.iconStyle?.itemIconSize, 18), menuIconSize: number(child.iconStyle?.menuIconSize, 20) }, items: (Array.isArray(child.items) ? child.items : []).map((item, itemIndex) => ({ id: safeId(item.id || `brand-navbar-item-${itemIndex + 1}`, `brand-navbar-item-${itemIndex + 1}`), label: string(item.label || item.text || `Item ${itemIndex + 1}`), renderMode: string(item.renderMode || 'text'), icon: string(item.icon || ''), target: { kind: 'section', sectionId: string(item.sectionId || ''), ...(item.target && typeof item.target === 'object' ? item.target : {}) } })) } };
  if (type === 'banner') return { name: 'fix-banner', props: { mode: string(child.mode || 'card'), height: number(child.height, 500), styleColor: { color: color(child.color || '#000000'), backgroundColor: color(child.bgColor || '#f6f7fa'), opacity: number(child.opacity, 1) }, styleSpacing: spacing, indicatorDots: child.indicatorDots !== false, autoplay: child.autoplay !== false, list: (Array.isArray(child.items) ? child.items : []).map((item) => ({ pic: string(item.pic || item.src || item.url || ''), link: { name: '', type: '', appid: '', page: '', ...(item.link && typeof item.link === 'object' ? item.link : {}) } })) } };
  if (type === 'store-information') return { name: 'store-information', props: { data: { backgroundImage: string(child.backgroundImage || ''), logo: string(child.logo || ''), storeName: string(child.storeName || ''), slogan: string(child.slogan || ''), phone: string(child.phone || ''), email: string(child.email || ''), address: string(child.address || ''), businessHours: string(child.businessHours || '') } } };
  if (type === 'event-list') return { name: 'event-list', props: { data: { events: [], styleMode: number(child.styleMode, 0) } } };
  if (type === 'event-calendar') return { name: 'event-calendar', props: { data: { events: [], viewMode: string(child.viewMode || 'month'), styleMode: number(child.styleMode, 0), themePreset: string(child.themePreset || 'amber-velvet'), primaryColor: color(child.primaryColor || '#b45309'), secondaryColor: color(child.secondaryColor || '#7c2d12'), accentColor: color(child.accentColor || '#fbbf24'), backgroundColor: color(child.backgroundColor || '#110d09'), surfaceColor: color(child.surfaceColor || '#261813'), textColor: color(child.textColor || '#fff7ed'), mutedTextColor: color(child.mutedTextColor || '#fcd9a6') } } };
  if (type === 'service-list') return { name: 'service-list', props: { data: { storeName: string(child.storeName || 'Service Provider'), totalSales: 0, logo: string(child.logo || ''), themeColor: color(child.themeColor || '#2F80ED'), categories: [{ label: 'All', value: 'all', icon: 'apps' }, { label: 'Promotions', value: 'discount', icon: 'discount' }, { label: 'New', value: 'new', icon: 'new' }, { label: 'Popular', value: 'popular', icon: 'fire' }, { label: 'Featured', value: 'featured', icon: 'star' }], services: [] } } };
  if (type === 'blog-list') return { name: 'blog-list', props: { data: { blogContents: {} }, styleSpacing: spacing, styleColor: { titleColor: color(child.titleColor || '#000000'), titleFontSize: number(child.titleFontSize, 30), titleFontWeight: child.titleFontWeight ?? 'bold', subtitleColor: color(child.subtitleColor || '#666666'), subtitleFontSize: number(child.subtitleFontSize, 20), subtitleFontWeight: child.subtitleFontWeight ?? 'normal', backgroundColor: color(child.bgColor || '#ffffff') } } };
  throw new Error(`Unsupported fixed Unico component type: ${type}`);
}

function structureChild(type, child, scope) {
  if (type === 'text') {
    return {
      text: control('Text', 'text', string(child.text || child.content || '')),
      link: control('Link Settings', 'link', link(child.link)),
    };
  }
  if (type === 'button') {
    return {
      text: control('Text', 'text', string(child.text || child.label || 'Button')),
      link: control('Link Settings', 'link', link(child.link)),
    };
  }
  if (type === 'img') {
    return {
      upload: control('Image', 'upload', string(child.src || child.url || child.upload || '')),
      link: control('Link Settings', 'link', link(child.link)),
    };
  }
  if (type === 'rich-text') {
    return {
      content: control('Content', 'html', string(child.html || child.content || child.text || '')),
    };
  }
  if (type === 'img-text') {
    const rawItems = Array.isArray(child.items) ? child.items : [];
    return {
      img_text_list: control('Image Text List', 'img_text_list', rawItems.map((item) => ({
        name: string(item?.name || item?.text || ''),
        imgUrl: string(item?.imgUrl || item?.src || item?.url || ''),
        href: string(item?.href || ''),
      }))),
    };
  }
  if (type === 'video-player') {
    return {
      videoUrl: control('Video URL', 'video', string(child.url || child.videoUrl || child.src || '')),
    };
  }
  if (type === 'countdown') {
    return {
      title: control('Title', 'text', string(child.title || 'Countdown')),
      targetDate: control('Target Date', 'text', string(child.targetDate || '')),
    };
  }
  if (type === 'tabs') {
    const tabs = (Array.isArray(child.tabs) && child.tabs.length ? child.tabs : [{ title: 'Tab 1', children: [] }]).slice(0, 5);
    const result = {
      tabCount: control('Number of Tabs (1-5)', 'number', tabs.length),
    };
    for (let tabIndex = 0; tabIndex < 5; tabIndex += 1) {
      const tab = tabs[tabIndex] || {};
      const tabChildren = resolveAutoCardHeights(Array.isArray(tab.children) ? tab.children : []);
      result[`tab${tabIndex + 1}Title`] = control(`Tab ${tabIndex + 1} Title`, 'text', string(tab.title || `Tab ${tabIndex + 1}`));
      result[`tab${tabIndex + 1}Content`] = control('', 'field', {
        structure: {
          label: `Tab ${tabIndex + 1} Container`,
          child: {
            component_list: control('Widgets List', 'component_list', tabChildren
              .map((tabChild, childIndex) => compileChild(tabChild, childIndex, `${scope}-tab-${tabIndex + 1}`))),
          },
        },
        styles: {
          label: 'Container Style',
          child: {
            height: control('Container Height', 'height', number(tab.height, 300)),
            justify: control('Layout', 'justify', justify(tab.justify)),
            bgColor: control('Background Color', 'bgColor', color(tab.bgColor || tab.background || 'transparent')),
          },
        },
      });
    }
    return result;
  }
  if (type === 'accordion') {
    const items = Array.isArray(child.items) ? child.items : [];
    return {
      items: control('Accordion Items', 'accordion_list', items.map((item) => ({
        title: string(item?.title || ''),
        content: string(item?.content || item?.text || ''),
      }))),
    };
  }
  if (type === 'map') {
    return {
      address: control('Address', 'text', string(child.address || '')),
      embedUrl: control('Map Embed URL (iframe src)', 'text', string(child.embedUrl || '')),
      linkUrl: control('Map Link URL', 'text', string(child.linkUrl || child.url || '')),
    };
  }
  if (type === 'rating') {
    return {
      rating: control('Rating Value', 'text', string(child.rating || '')),
      reviewCount: control('Review Count', 'text', string(child.reviewCount || '')),
    };
  }
  if (type === 'social-share') {
    return {
      title: control('Title', 'text', string(child.title || 'Share this page')),
      showFacebook: control('Show Facebook', 'switch', child.showFacebook !== false),
      facebookUrl: control('Facebook Share URL', 'text', string(child.facebookUrl || '')),
      showTwitter: control('Show Twitter', 'switch', child.showTwitter !== false),
      twitterUrl: control('Twitter Share URL', 'text', string(child.twitterUrl || '')),
      showLinkedin: control('Show LinkedIn', 'switch', child.showLinkedin !== false),
      linkedinUrl: control('LinkedIn Share URL', 'text', string(child.linkedinUrl || '')),
      showWhatsapp: control('Show WhatsApp', 'switch', child.showWhatsapp !== false),
      whatsappUrl: control('WhatsApp Share URL', 'text', string(child.whatsappUrl || '')),
      showEmail: control('Show Email', 'switch', child.showEmail !== false),
      emailUrl: control('Email Share URL', 'text', string(child.emailUrl || '')),
    };
  }
  if (type === 'person-profile') {
    return {
      avatar: control('Avatar Image', 'upload', string(child.avatar || child.src || '')),
      name: control('Name', 'text', string(child.name || '')),
      title: control('Job Title', 'text', string(child.title || '')),
      bio: control('Biography', 'text', string(child.bio || '')),
      email: control('Email', 'text', string(child.email || '')),
      phone: control('Phone', 'text', string(child.phone || '')),
      linkedin: control('LinkedIn URL', 'text', string(child.linkedin || '')),
      twitter: control('Twitter URL', 'text', string(child.twitter || '')),
      website: control('Website', 'text', string(child.website || '')),
    };
  }
  if (type === 'inquiry-box') {
    return {
      title: control('Title', 'text', string(child.title || 'Contact Us')),
      nameLabel: control('Name Field Label', 'text', string(child.nameLabel || 'Name')),
      contactLabel: control('Contact Field Label', 'text', string(child.contactLabel || 'Phone or Email')),
      inquiryTitleLabel: control('Title Field Label', 'text', string(child.inquiryTitleLabel || 'Title')),
      contentLabel: control('Content Field Label', 'text', string(child.contentLabel || 'Content')),
      pictureLabel: control('Picture Field Label', 'text', string(child.pictureLabel || 'Picture (Optional)')),
      submitButtonText: control('Submit Button Text', 'text', string(child.submitButtonText || 'Submit')),
      successMessage: control('Success Message', 'text', string(child.successMessage || 'Your inquiry has been submitted.')),
    };
  }
  return {
    link: control('Link Settings', 'link', link(child.link)),
  };
}

function styleChild(type, child, index) {
  const width = resolvedChildWidth(child, type);
  if (type === 'text') return textStyleChild(child, index, width);
  const height = resolvedChildHeight(child, type, width);
  const styles = {
    width: control('Width', 'width', width),
    height: control('Height', 'height', height),
    zIndex: control('Levels', 'zIndex', number(child.zIndex, index + 1)),
    top: control('Top Distance', 'top', number(child.y ?? child.top, 0)),
    left: control('Left Distance', 'left', number(child.x ?? child.left, 0)),
  };

  if (type === 'button' || type === 'rich-text') {
    styles.fontSize = control('Font Size', 'fontSize', number(child.fontSize, 15));
    styles.color = control('Font Color', 'color', color(child.color || (type === 'button' ? '#ffffff' : '#111111')));
    styles.fontWeight = control('Bold', 'fontWeight', child.fontWeight ?? child.weight ?? 'normal');
    styles.fontFamily = control('Font Family', 'fontFamily', string(child.fontFamily || 'inherit'));
    styles.lineHeight = control('Line Height', 'lineHeight', child.lineHeight ?? 'normal');
    styles.justify = control('Alignment', 'justify', justify(child.align || child.textAlign || child.justify));
  }

  if (type === 'button' || type === 'rectangle' || type === 'circle') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || child.background || child.backgroundColor || (type === 'button' ? '#111111' : 'transparent')));
    styles.radius = control('Border Radius', 'radius', number(child.radius ?? child.borderRadius, type === 'circle' ? 999 : 0));
    styles.borderColor = control('Border Color', 'color', color(child.borderColor || 'transparent'));
    styles.borderWidth = control('Border Width', 'borderWidth', number(child.borderWidth, 0));
  }

  if (type === 'img' || type === 'rich-text') {
    styles.radius = control('Border Radius', 'radius', number(child.radius ?? child.borderRadius, 0));
  }

  if (type === 'img') {
    const fit = imageFit(child.fit ?? child.fitMode);
    const objectPosition = string(child.objectPosition || '50% 50%');
    const customCSS = string(child.customCSS).trim();
    styles.customCSS = control('Custom CSS', 'customCSS', [
      `object-fit: ${fit}; object-position: ${objectPosition};`,
      customCSS,
    ].filter(Boolean).join(' '));
  }

  if (type !== 'img' && string(child.customCSS).trim()) {
    styles.customCSS = control('Custom CSS', 'customCSS', string(child.customCSS).trim());
  }

  if (type === 'button') {
    styles.paddingInline = control('Horizontal Padding', 'paddingInline', number(child.paddingInline, 0));
    styles.paddingBlock = control('Vertical Padding', 'paddingBlock', number(child.paddingBlock, 0));
  }

  if (type === 'rich-text') {
    styles.paddingInline = control('Horizontal Padding', 'paddingInline', number(child.paddingInline ?? child.padding, 10));
    styles.paddingBlock = control('Vertical Padding', 'paddingBlock', number(child.paddingBlock ?? child.padding, 10));
  }

  if (type === 'img-text') {
    styles.paddingInline = control('Horizontal Padding', 'paddingInline', number(child.paddingInline, 20));
    styles.paddingBlock = control('Vertical Padding', 'paddingBlock', number(child.paddingBlock, 10));
    styles.radius = control('Image Radius', 'radius', number(child.radius ?? child.borderRadius, 10));
    styles.fontSize = control('Font Size', 'fontSize', number(child.fontSize, 16));
    styles.fontFamily = control('Font Family', 'fontFamily', string(child.fontFamily || 'inherit'));
    styles.color = control('Font Color', 'color', color(child.color || '#000000'));
    styles.backgroundColor = control('Background Color', 'color', color(child.bgColor || child.backgroundColor || 'transparent'));
    styles.fontWeight = control('Bold', 'fontWeight', child.fontWeight ?? 'normal');
  }

  if (type === 'video-player') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#000000'));
  }

  if (type === 'countdown') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ff6b6b'));
    styles.color = control('Text Color', 'color', color(child.color || '#ffffff'));
  }

  if (type === 'tabs') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ffffff'));
    styles.color = control('Active Color', 'color', color(child.activeColor || child.color || '#1890ff'));
  }

  if (type === 'accordion') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ffffff'));
    styles.borderColor = control('Border Color', 'color', color(child.borderColor || '#e8e8e8'));
    styles.activeColor = control('Active Color', 'color', color(child.activeColor || '#1890ff'));
  }

  if (type === 'map') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#f0f2f5'));
  }

  if (type === 'rating') {
    styles.color = control('Star Color', 'color', color(child.color || '#faad14'));
  }

  if (type === 'social-share') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ffffff'));
    styles.buttonStyle = control('Button Style', 'text', string(child.buttonStyle || 'rounded'));
  }

  if (type === 'person-profile') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ffffff'));
    styles.color = control('Text Color', 'color', color(child.color || '#262626'));
    styles.avatarSize = control('Avatar Size', 'width', number(child.avatarSize, 120));
  }

  if (type === 'inquiry-box') {
    styles.bgColor = control('Background Color', 'bgColor', color(child.bgColor || '#ffffff'));
    styles.primaryColor = control('Primary Color', 'color', color(child.primaryColor || '#1890ff'));
    styles.buttonColor = control('Button Color', 'bgColor', color(child.buttonColor || child.primaryColor || '#1890ff'));
    styles.buttonTextColor = control('Button Text Color', 'color', color(child.buttonTextColor || '#ffffff'));
    styles.inputBorderColor = control('Input Border Color', 'color', color(child.inputBorderColor || '#d9d9d9'));
    styles.labelColor = control('Label Color', 'color', color(child.labelColor || '#262626'));
    styles.titleColor = control('Title Color', 'color', color(child.titleColor || '#000000'));
  }

  if (child.letterSpacing !== undefined) {
    styles.letterSpacing = control('Letter Spacing', 'letterSpacing', child.letterSpacing);
  }

  return styles;
}

function textStyleChild(child, index, width) {
  const styles = {
    width: control('Width', 'width', width),
    paddingInline: control('Horizontal Padding', 'paddingInline', number(child.paddingInline ?? child.padding, 20)),
    paddingBlock: control('Vertical Padding', 'paddingBlock', number(child.paddingBlock ?? child.padding, 10)),
    fontSize: control('Font Size', 'fontSize', number(child.fontSize, 16)),
    fontFamily: control('Font Family', 'fontFamily', string(child.fontFamily || 'inherit')),
    color: control('Font Color', 'color', color(child.color || '#111111')),
    fontWeight: control('Font Weight', 'fontWeight', child.fontWeight ?? child.weight ?? 'normal'),
    letterSpacing: control('Letter Spacing', 'letterSpacing', number(child.letterSpacing, 0)),
    lineHeight: control('Line Height', 'lineHeight', child.lineHeight ?? 1.35),
    fontStyle: control('Italic', 'fontStyle', string(child.fontStyle || 'normal')),
    textDecoration: control('Underline', 'textDecoration', string(child.textDecoration || 'none')),
    justify: control('Layout', 'justify', justify(child.align || child.textAlign || child.justify)),
    zIndex: control('Levels', 'zIndex', number(child.zIndex, index + 1)),
    top: control('Top Distance', 'top', number(child.y ?? child.top, 0)),
    left: control('Left Distance', 'left', number(child.x ?? child.left, 0)),
  };
  if (string(child.customCSS).trim()) {
    styles.customCSS = control('Custom CSS', 'customCSS', string(child.customCSS).trim());
  }
  return styles;
}

function validateIr(input, { hasCanonical = false } = {}) {
  const errors = [];
  const warnings = [];
  const seenIds = new Map();
  const metrics = collectIrMetrics(input);
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { passed: false, errors: ['IR root must be a JSON object'], warnings, metrics };
  }
  validateEnglishOnly(input, 'IR', errors);
  validateComponentUsagePolicy(input, metrics, errors);

  const mode = input.mode ?? 'extend';
  if (mode !== 'extend' && mode !== 'replace') {
    errors.push('mode must be "extend" or "replace"');
  }
  if (input.canvasWidth !== undefined && number(input.canvasWidth, NaN) !== CANVAS_WIDTH) {
    errors.push(`canvasWidth must be ${CANVAS_WIDTH}`);
  }
  if (!Array.isArray(input.sections) || input.sections.length === 0) {
    errors.push('sections must be a non-empty array');
    return { passed: false, errors, warnings, metrics };
  }

  let navbarCount = 0;
  let contentSectionCount = 0;
  for (const [sectionIndex, section] of input.sections.entries()) {
    const sectionPath = `sections[${sectionIndex}]`;
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      errors.push(`${sectionPath} must be an object`);
      continue;
    }
    registerId(section.id, `section-${sectionIndex + 1}`, sectionPath, seenIds, errors);
    const sectionWidth = strictNumber(section.width, CANVAS_WIDTH, `${sectionPath}.width`, errors);
    if (sectionWidth <= 0 || sectionWidth > CANVAS_WIDTH) {
      errors.push(`${sectionPath}.width must be greater than 0 and no more than ${CANVAS_WIDTH}`);
    }
    const rawChildren = Array.isArray(section.children) ? section.children : null;
    if (!rawChildren || rawChildren.length === 0) {
      errors.push(`${sectionPath}.children must be a non-empty array`);
      continue;
    }
    const children = resolveAutoCardHeights(rawChildren);

    const normalized = [];
    for (const [childIndex, child] of children.entries()) {
      const childPath = `${sectionPath}.children[${childIndex}]`;
      if (!child || typeof child !== 'object' || Array.isArray(child)) {
        errors.push(`${childPath} must be an object`);
        continue;
      }
      let type;
      try {
        type = normalizeType(child.type);
      } catch (error) {
        errors.push(`${childPath}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      normalized.push({ child, childIndex, childPath, type });
      if (type === 'brand-navbar') navbarCount += 1;
    }

    const nonNavbar = normalized.filter(({ type }) => type !== 'brand-navbar');
    if (nonNavbar.length > 0) contentSectionCount += 1;
    const topLevelChildren = nonNavbar.filter(({ type }) => TOP_LEVEL_BLOCK_TYPES.has(type));
    if (topLevelChildren.length > 0 && nonNavbar.length !== 1) {
      errors.push(`${sectionPath} contains top-level component ${topLevelChildren.map(({ type }) => type).join(', ')}; every top-level component must be the only non-navbar child in its IR section`);
    }

    const inferredHeight = recommendedSectionHeight(nonNavbar.map(({ child }) => child));
    const sectionHeight = section.height === undefined
      ? inferredHeight
      : strictNumber(section.height, inferredHeight, `${sectionPath}.height`, errors);
    if (sectionHeight <= 0) errors.push(`${sectionPath}.height must be greater than 0`);
    if (topLevelChildren.length === 1 && FIXED_COMPONENT_TYPES.has(topLevelChildren[0].type) && section.height !== undefined && sectionHeight < inferredHeight) {
      errors.push(`${sectionPath}.height ${sectionHeight} is below the safe minimum ${inferredHeight} for ${topLevelChildren[0].type}`);
    }
    if (nonNavbar.length > 16) {
      warnings.push(`${sectionPath} has ${nonNavbar.length} children; review whether the section should be split into clearer groups`);
    }

    const textBoxes = [];
    const visualBoxes = [];
    for (const { child, childIndex, childPath, type } of normalized) {
      registerId(child.id, `${section.id || `section-${sectionIndex + 1}`}-${type}-${childIndex + 1}`, childPath, seenIds, errors);
      if (type === 'brand-navbar') {
        validateOptionalOnlineImageSource(child.logo, `${childPath}.logo`, errors);
        continue;
      }
      if (FIXED_COMPONENT_TYPES.has(type)) {
        validateFixedChild(child, type, childPath, errors, warnings);
        continue;
      }
      validateVisualChild(child, type, childPath, {
        width: sectionWidth,
        height: sectionHeight,
        textBoxes,
        visualBoxes,
        defaultZIndex: childIndex + 1,
        errors,
        warnings,
        seenIds,
      });
    }
    validateTextSpacing(textBoxes, sectionPath, errors);
    validateLayering(visualBoxes, sectionPath, errors);
    validateCardContainment(visualBoxes, sectionPath, errors);
    validateSectionBottomSpacing(visualBoxes, sectionHeight, sectionPath, warnings);
  }

  if (navbarCount > 1) errors.push('IR may contain only one brand-navbar');
  if (contentSectionCount === 0 && (mode === 'replace' || !hasCanonical)) {
    errors.push('A new or replacement page must contain at least one non-navbar content section');
  }
  applyCompositionGuidance(metrics, mode, hasCanonical, warnings);
  validateDesignProfile(input.designProfile, mode, hasCanonical, errors, warnings);
  return { passed: errors.length === 0, errors, warnings, metrics };
}

function validateEnglishOnly(value, path, errors) {
  if (typeof value === 'string') {
    if (/[\u3400-\u9fff]/u.test(value)) errors.push(`${path} violates the English-only content rule`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateEnglishOnly(item, `${path}[${index}]`, errors));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) validateEnglishOnly(item, `${path}.${key}`, errors);
}

function validateComponentUsagePolicy(input, metrics, errors) {
  const declarations = input.explicitComponents ?? [];
  if (!Array.isArray(declarations)) {
    errors.push('explicitComponents must be an array of component type names');
    return;
  }
  const explicitTypes = new Set();
  for (const [index, declaration] of declarations.entries()) {
    try {
      const type = normalizeType(declaration);
      if (DEPRECATED_COMPONENT_TYPES.has(type)) {
        errors.push(`explicitComponents[${index}] declares deprecated component ${type}`);
        continue;
      }
      explicitTypes.add(type);
    } catch (error) {
      errors.push(`explicitComponents[${index}]: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const type of DEPRECATED_COMPONENT_TYPES) {
    if ((metrics.componentCounts[type] || 0) > 0) {
      errors.push(`${type} is deprecated and must not be generated`);
    }
  }
  for (const type of CONDITIONAL_SINGLE_USE_TYPES) {
    const count = metrics.componentCounts[type] || 0;
    if (count > 1) {
      errors.push(`${type} may be used at most once when the page context warrants it; found ${count}`);
    }
  }
  for (const type of EXPLICIT_ONLY_COMPONENT_TYPES) {
    if ((metrics.componentCounts[type] || 0) > 0 && !explicitTypes.has(type)) {
      errors.push(`${type} may be generated only when explicitly requested; add it to explicitComponents as an audit declaration`);
    }
  }
}

function validateVisualChild(child, type, childPath, context) {
  const { width: sectionWidth, height: sectionHeight, textBoxes, visualBoxes, defaultZIndex, errors, warnings, seenIds } = context;
  const x = strictNumber(child.x ?? child.left, 0, `${childPath}.x`, errors);
  const y = strictNumber(child.y ?? child.top, 0, `${childPath}.y`, errors);
  const width = resolvedChildWidth(child, type, childPath, errors);
  const height = resolvedChildHeight(child, type, width, childPath, errors);
  const zIndex = strictNumber(child.zIndex, defaultZIndex, `${childPath}.zIndex`, errors);
  if (width <= 0 || height <= 0) errors.push(`${childPath} must have positive width and height`);
  if (!child.allowOverflow && (x < 0 || x + width > sectionWidth)) {
    errors.push(`${childPath} exceeds horizontal section bounds (${x} + ${width} > ${sectionWidth}); reposition it or set allowOverflow for intentional bleed`);
  }
  if (!child.allowOverflow && (y < 0 || y + height > sectionHeight)) {
    errors.push(`${childPath} exceeds vertical section bounds (${y} + ${height} > ${sectionHeight}); expand the section or set allowOverflow for intentional bleed`);
  }

  if (type === 'text') {
    const content = string(child.text ?? child.content).trim();
    if (!content) errors.push(`${childPath}.text must not be empty`);
    if (/^(text content|lorem ipsum)$/i.test(content)) errors.push(`${childPath}.text contains placeholder copy; replace it with page-specific content`);
    if (/\p{Extended_Pictographic}/u.test(content)) warnings.push(`${childPath} contains emoji; prefer a real icon or image unless emoji is explicitly requested`);
    if (child.h !== undefined || child.height !== undefined) {
      const estimatedHeight = estimateTextHeight(child, width);
      if (height < estimatedHeight) {
        errors.push(`${childPath}.h ${height} is too small for the estimated text height ${estimatedHeight}; increase h or shorten the copy`);
      }
    }
  }
  if (type === 'rich-text') {
    const html = string(child.html ?? child.content ?? child.text).trim();
    if (!html) errors.push(`${childPath}.html must not be empty`);
    if (!/<[a-z][\s\S]*>/i.test(html)) warnings.push(`${childPath} has no HTML formatting; prefer a text component`);
    if (child.h !== undefined || child.height !== undefined) {
      const estimatedHeight = estimateRichTextHeight(child, width);
      if (height < estimatedHeight) {
        errors.push(`${childPath}.rich-text height ${height} is too small for the estimated content height ${estimatedHeight}`);
      }
    }
  }
  if (type === 'button') {
    const text = string(child.text).trim();
    if (!text || /^button$/i.test(text)) errors.push(`${childPath}.text must contain a specific action label, not a default placeholder`);
  }
  if (type === 'img') {
    const src = mediaSource(child.src ?? child.url ?? child.upload);
    validateOnlineImageSource(src, `${childPath}.src`, errors);
    const requestedFit = string(child.fit ?? child.fitMode).trim().toLowerCase();
    if (!requestedFit) {
      errors.push(`${childPath}.fit is required; choose "cover" or "contain" from the image purpose and aspect ratio`);
    } else if (!['cover', 'contain', 'fill'].includes(requestedFit)) {
      errors.push(`${childPath}.fit must be "cover", "contain", or "fill"`);
    }
    const fit = imageFit(child.fit ?? child.fitMode);
    if (fit === 'fill') warnings.push(`${childPath} uses fit "fill"; use it only for a purpose-built decorative strip because it can distort images`);
    validateSourceAspect(child, width, height, fit, childPath, errors, warnings);
  }
  if (type === 'video-player' && !mediaSource(child.url ?? child.videoUrl ?? child.src)) {
    errors.push(`${childPath} requires a non-empty video URL`);
  }
  if (type === 'video-player' && isPlaceholderSource(mediaSource(child.url ?? child.videoUrl ?? child.src))) {
    errors.push(`${childPath} uses a placeholder video URL`);
  }
  if (type === 'img-text') {
    const items = Array.isArray(child.items) ? child.items : [];
    if (items.length === 0) errors.push(`${childPath}.items must contain at least one image/text item`);
    for (const [index, item] of items.entries()) {
      const src = mediaSource(item?.imgUrl ?? item?.src ?? item?.url);
      validateOnlineImageSource(src, `${childPath}.items[${index}]`, errors);
    }
  }
  if (type === 'accordion' && (!Array.isArray(child.items) || child.items.length === 0)) {
    errors.push(`${childPath}.items must contain at least one accordion item`);
  }
  if (type === 'person-profile' && !string(child.name).trim()) {
    errors.push(`${childPath}.name must not be empty`);
  }
  if (type === 'person-profile') {
    validateOptionalOnlineImageSource(child.avatar ?? child.src, `${childPath}.avatar`, errors);
  }
  if (type === 'map' && !string(child.embedUrl).trim()) {
    errors.push(`${childPath} requires a real embedUrl; otherwise use address text and a button`);
  }
  if (type === 'rating' && (!string(child.rating).trim() || !string(child.reviewCount).trim())) {
    errors.push(`${childPath} requires both rating and reviewCount supplied by the user or project`);
  }
  if (type === 'countdown' && !string(child.targetDate).trim()) {
    errors.push(`${childPath} requires a targetDate supplied by the user or project`);
  }
  if (type === 'tabs') validateTabs(child, childPath, width, height, errors, warnings, seenIds);

  if (type === 'text' || type === 'rich-text') {
    textBoxes.push({ child, type, path: childPath, x, y, width, height });
  }
  visualBoxes.push({ child, type, path: childPath, x, y, width, height, zIndex });
}

function validateFixedChild(child, type, childPath, errors, warnings) {
  if (type === 'banner') {
    const items = Array.isArray(child.items) ? child.items : [];
    if (items.length === 0) errors.push(`${childPath}.items must contain at least one real banner image`);
    for (const [index, item] of items.entries()) {
      const src = mediaSource(item?.pic ?? item?.src ?? item?.url);
      validateOnlineImageSource(src, `${childPath}.items[${index}]`, errors);
    }
  }
  if (type === 'navigation' && (!Array.isArray(child.items) || child.items.length === 0)) {
    errors.push(`${childPath}.items must contain at least one navigation item`);
  }
  if (type === 'store-information' && !string(child.storeName).trim()) {
    warnings.push(`${childPath}.storeName is empty; confirm the component should use an editable neutral value`);
  }
  if (type === 'coupon') {
    validateOptionalOnlineImageSource(child.logo, `${childPath}.logo`, errors);
    validateOptionalOnlineImageSource(child.backgroundImage, `${childPath}.backgroundImage`, errors);
  }
  if (type === 'store-information') {
    validateOptionalOnlineImageSource(child.logo, `${childPath}.logo`, errors);
    validateOptionalOnlineImageSource(child.backgroundImage, `${childPath}.backgroundImage`, errors);
  }
  if (type === 'service-list') {
    validateOptionalOnlineImageSource(child.logo, `${childPath}.logo`, errors);
  }
}

function validateTabs(child, childPath, width, height, errors, warnings, seenIds) {
  const tabs = Array.isArray(child.tabs) ? child.tabs : [];
  if (tabs.length < 1 || tabs.length > 5) errors.push(`${childPath}.tabs must contain 1 to 5 tabs`);
  for (const [tabIndex, tab] of tabs.entries()) {
    const tabPath = `${childPath}.tabs[${tabIndex}]`;
    const tabHeight = strictNumber(tab?.height, Math.max(120, height - 40), `${tabPath}.height`, errors);
    const children = resolveAutoCardHeights(Array.isArray(tab?.children) ? tab.children : []);
    const textBoxes = [];
    const visualBoxes = [];
    for (const [index, tabChild] of children.entries()) {
      const nestedPath = `${tabPath}.children[${index}]`;
      let nestedType;
      try {
        nestedType = normalizeType(tabChild?.type);
      } catch (error) {
        errors.push(`${nestedPath}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      registerId(tabChild?.id, `${child.id || 'tabs'}-tab-${tabIndex + 1}-${nestedType}-${index + 1}`, nestedPath, seenIds, errors);
      if (TOP_LEVEL_BLOCK_TYPES.has(nestedType)) {
        errors.push(`${nestedPath}: top-level component ${nestedType} cannot be nested in tabs`);
        continue;
      }
      validateVisualChild(tabChild, nestedType, nestedPath, { width, height: tabHeight, textBoxes, visualBoxes, defaultZIndex: index + 1, errors, warnings, seenIds });
    }
    validateTextSpacing(textBoxes, tabPath, errors);
    validateLayering(visualBoxes, tabPath, errors);
    validateCardContainment(visualBoxes, tabPath, errors);
    validateSectionBottomSpacing(visualBoxes, tabHeight, tabPath, warnings);
  }
}

function validateTextSpacing(boxes, sectionPath, errors) {
  for (let leftIndex = 0; leftIndex < boxes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < boxes.length; rightIndex += 1) {
      const a = boxes[leftIndex];
      const b = boxes[rightIndex];
      const horizontalOverlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      if (horizontalOverlap <= 0) continue;
      const verticalOverlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (verticalOverlap > 0) {
        if (!a.child.allowOverlap && !b.child.allowOverlap) {
          errors.push(`${sectionPath} has overlapping text boxes ${a.path} and ${b.path}; adjust y/h or explicitly allow the intentional overlap`);
        }
        continue;
      }
      const gap = a.y <= b.y ? b.y - (a.y + a.height) : a.y - (b.y + b.height);
      if (gap >= 0 && gap < MIN_TEXT_GAP && !a.child.allowTightSpacing && !b.child.allowTightSpacing) {
        errors.push(`${sectionPath} has only ${gap}px between ${a.path} and ${b.path}; keep at least ${MIN_TEXT_GAP}px or explicitly allow tight spacing`);
      }
    }
  }
}

function validateLayering(boxes, sectionPath, errors) {
  const backgrounds = boxes.filter(({ type }) => type === 'img' || type === 'rectangle' || type === 'circle');
  const foregrounds = boxes.filter(({ type }) => FOREGROUND_CONTENT_TYPES.has(type));
  for (const background of backgrounds) {
    for (const foreground of foregrounds) {
      if (!boxesIntersect(background, foreground)) continue;
      if (background.zIndex >= foreground.zIndex) {
        errors.push(`${sectionPath} has ${background.path} at zIndex ${background.zIndex} covering ${foreground.path} at zIndex ${foreground.zIndex}; place backgrounds below readable or interactive content`);
      }
    }
  }

  const buttons = boxes.filter(({ type }) => type === 'button');
  const texts = boxes.filter(({ type }) => type === 'text' || type === 'rich-text');
  for (const button of buttons) {
    for (const text of texts) {
      if (boxesIntersect(button, text)) {
        errors.push(`${sectionPath} overlays ${text.path} on ${button.path}; use the button's own text field instead of a separate text component`);
      }
    }
  }
  for (let index = 0; index < buttons.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < buttons.length; otherIndex += 1) {
      if (boxesIntersect(buttons[index], buttons[otherIndex])) {
        errors.push(`${sectionPath} has overlapping buttons ${buttons[index].path} and ${buttons[otherIndex].path}`);
      }
    }
  }
  for (let index = 0; index < foregrounds.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < foregrounds.length; otherIndex += 1) {
      const a = foregrounds[index];
      const b = foregrounds[otherIndex];
      const bothText = (a.type === 'text' || a.type === 'rich-text') && (b.type === 'text' || b.type === 'rich-text');
      const buttonAndText = (a.type === 'button' && (b.type === 'text' || b.type === 'rich-text'))
        || (b.type === 'button' && (a.type === 'text' || a.type === 'rich-text'));
      const bothButtons = a.type === 'button' && b.type === 'button';
      if (bothText || buttonAndText || bothButtons || a.child.allowOverlap || b.child.allowOverlap) continue;
      if (boxesIntersect(a, b)) errors.push(`${sectionPath} has overlapping content components ${a.path} and ${b.path}`);
    }
  }
}

function validateSectionBottomSpacing(boxes, sectionHeight, sectionPath, warnings) {
  const contentBoxes = boxes.filter(({ type, child }) => !child.allowOverflow && type !== 'rectangle' && type !== 'circle' && type !== 'img');
  if (contentBoxes.length === 0) return;
  const contentBottom = Math.max(...contentBoxes.map(({ y, height }) => y + height));
  const gap = sectionHeight - contentBottom;
  if (gap >= 0 && gap < 24) warnings.push(`${sectionPath} leaves only ${gap}px below its final content; prefer 24–48px when the composition allows`);
}

function validateCardContainment(boxes, sectionPath, errors) {
  const cards = boxes.filter(({ type, child }) => type === 'rectangle' && child.autoFitContent !== false && !child.allowCardOverflow);
  for (const card of cards) {
    const bottomPadding = Math.max(0, number(card.child.contentPaddingBottom, 16));
    const cardBottom = card.y + card.height;
    for (const content of boxes) {
      if (content === card || content.child.allowCardOverflow || content.zIndex <= card.zIndex) continue;
      if (content.type === 'rectangle' || content.type === 'circle') continue;
      const horizontallyContained = content.x >= card.x && content.x + content.width <= card.x + card.width;
      const startsInsideCard = content.y >= card.y && content.y < cardBottom;
      if (!horizontallyContained || !startsInsideCard) continue;
      const requiredHeight = Math.ceil(content.y + content.height - card.y + bottomPadding);
      if (requiredHeight > card.height) {
        errors.push(`${card.path} card height ${card.height} is too small for ${content.path}; use at least ${requiredHeight} or omit h for automatic card sizing`);
      }
    }
  }
}

function boxesIntersect(a, b) {
  return Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0
    && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;
}

function collectIrMetrics(input) {
  const componentCounts = {};
  let nestedComponentCount = 0;
  let contentSectionCount = 0;
  const sections = Array.isArray(input?.sections) ? input.sections : [];

  function countChildren(children) {
    for (const child of Array.isArray(children) ? children : []) {
      let type;
      try {
        type = normalizeType(child?.type);
      } catch {
        continue;
      }
      componentCounts[type] = (componentCounts[type] || 0) + 1;
      nestedComponentCount += 1;
      if (type === 'tabs') {
        for (const tab of Array.isArray(child.tabs) ? child.tabs : []) countChildren(tab?.children);
      }
    }
  }

  for (const section of sections) {
    const children = Array.isArray(section?.children) ? section.children : [];
    if (children.some((child) => {
      try { return normalizeType(child?.type) !== 'brand-navbar'; } catch { return false; }
    })) contentSectionCount += 1;
    countChildren(children);
  }
  const text = componentCounts.text || 0;
  const richText = componentCounts['rich-text'] || 0;
  const images = (componentCounts.img || 0) + (componentCounts['img-text'] || 0);
  const primitives = text + images + (componentCounts.rectangle || 0) + (componentCounts.button || 0);
  return {
    sectionCount: sections.length,
    contentSectionCount,
    componentCount: nestedComponentCount,
    componentCounts,
    textCount: text,
    imageCount: images,
    rectangleCount: componentCounts.rectangle || 0,
    buttonCount: componentCounts.button || 0,
    richTextCount: richText,
    corePrimitiveRatio: nestedComponentCount ? Number((primitives / nestedComponentCount).toFixed(3)) : 0,
    richTextRatio: text + richText ? Number((richText / (text + richText)).toFixed(3)) : 0,
  };
}

function applyCompositionGuidance(metrics, mode, hasCanonical, warnings) {
  const isCompletePage = mode === 'replace' || !hasCanonical;
  if (isCompletePage && metrics.contentSectionCount >= 3 && metrics.textCount === 0) {
    warnings.push('The page has no text components; complete landing pages normally use text as the dominant information layer');
  }
  if (isCompletePage && metrics.contentSectionCount >= 3 && metrics.imageCount === 0) {
    warnings.push('The page has no image components; use real imagery when the brief or project provides suitable assets');
  }
  if (metrics.richTextCount > 2 && metrics.richTextRatio > 0.25) {
    warnings.push(`Rich text represents ${(metrics.richTextRatio * 100).toFixed(0)}% of text components; prefer separate text components unless mixed formatting is required`);
  }
  if (isCompletePage && metrics.componentCount >= 8 && metrics.corePrimitiveRatio < 0.6) {
    warnings.push(`Core primitives represent only ${(metrics.corePrimitiveRatio * 100).toFixed(0)}% of components; text, img, button, and rectangle should carry most of the page`);
  }
}

function validateDesignProfile(profile, mode, hasCanonical, errors, warnings) {
  const isCompletePage = mode === 'replace' || !hasCanonical;
  if (profile === undefined) {
    if (isCompletePage) {
      warnings.push('No designProfile was recorded; run the UI/UX design-system and controlled-variation stage before final delivery');
    }
    return;
  }
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    errors.push('designProfile must be an object when provided');
    return;
  }
  validateRequiredPaths(profile, [
    'source',
    'query',
    'direction',
    'variationSeed',
    'axes.layout',
    'axes.palette',
    'axes.typography',
    'axes.imageRhythm',
  ], 'designProfile', errors);
  if (hasPath(profile, 'source') && !/ui-ux-pro-max/i.test(string(profile.source))) {
    warnings.push('designProfile.source does not identify UI/UX Pro Max; confirm an equivalent design-intelligence review was completed');
  }
}

function validateSourceAspect(child, width, height, fit, childPath, errors, warnings) {
  const hasSourceWidth = child.sourceWidth !== undefined;
  const hasSourceHeight = child.sourceHeight !== undefined;
  if (hasSourceWidth !== hasSourceHeight) {
    errors.push(`${childPath} must provide sourceWidth and sourceHeight together`);
    return;
  }
  if (!hasSourceWidth) return;
  const sourceWidth = strictNumber(child.sourceWidth, NaN, `${childPath}.sourceWidth`, errors);
  const sourceHeight = strictNumber(child.sourceHeight, NaN, `${childPath}.sourceHeight`, errors);
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    errors.push(`${childPath} source dimensions must be positive`);
    return;
  }
  const ratioDifference = Math.max((sourceWidth / sourceHeight) / (width / height), (width / height) / (sourceWidth / sourceHeight));
  if (fit === 'fill' && ratioDifference > 1.1) {
    errors.push(`${childPath} would distort the source by ${ratioDifference.toFixed(1)}× with fit "fill"; use cover or contain`);
  }
  if (ratioDifference > 1.5 && fit === 'cover' && !string(child.objectPosition).trim()) {
    errors.push(`${childPath} frame ratio differs from the source by ${ratioDifference.toFixed(1)}×; set objectPosition to protect the crop focal point`);
  } else if (ratioDifference > 2 && fit === 'cover') {
    warnings.push(`${childPath} frame ratio differs from the source by ${ratioDifference.toFixed(1)}×; verify the crop and objectPosition`);
  }
}

function validateDesignJson(designJson) {
  const errors = [];
  const seenIds = new Map();
  const componentCounts = {};
  if (!Array.isArray(designJson) || designJson.length === 0) {
    return { passed: false, errors: ['designJson must be a non-empty array'] };
  }
  for (const [componentIndex, component] of designJson.entries()) {
    const path = `designJson[${componentIndex}]`;
    validateOutputComponent(component, path, {
      topLevel: true,
      seenIds,
      errors,
      componentCounts,
    });
  }
  for (const type of CONDITIONAL_SINGLE_USE_TYPES) {
    const count = componentCounts[type] || 0;
    if (count > 1) {
      errors.push(`designJson contains ${count} ${type} components; this component may appear at most once`);
    }
  }
  return { passed: errors.length === 0, errors };
}

function validateOutputComponent(component, path, context) {
  const { topLevel, seenIds, errors, componentCounts } = context;
  if (!component || typeof component !== 'object' || Array.isArray(component)) {
    errors.push(`${path} must be an object`);
    return;
  }
  validateRequiredPaths(component, ['id', 'label', 'type'], path, errors);
  registerId(component.id, path.replace(/[^A-Za-z0-9]+/g, '-'), path, seenIds, errors);
  if (component.type === 'free-box') {
    if (!topLevel) errors.push(`${path} cannot nest a free-box component`);
    validateFreeBoxOutput(component, path, context);
    return;
  }

  let type;
  try {
    type = normalizeType(component.type);
  } catch (error) {
    errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  if (component.type !== type) {
    errors.push(`${path}.type must use canonical component type "${type}"`);
  }
  componentCounts[type] = (componentCounts[type] || 0) + 1;
  if (DEPRECATED_COMPONENT_TYPES.has(type)) {
    errors.push(`${path} uses deprecated component ${type}`);
  }

  if (FIXED_COMPONENT_TYPES.has(type)) {
    if (!topLevel) errors.push(`${path} ${type} must be a top-level component beside free-box components`);
    validateFixedOutput(component, type, path, errors);
    return;
  }
  if (TOP_LEVEL_BLOCK_TYPES.has(type) && !topLevel) {
    errors.push(`${path} ${type} must be a top-level component beside free-box components`);
  }
  validateFieldOutput(component, type, path, context);
}

function validateFreeBoxOutput(component, path, context) {
  const { errors } = context;
  const requiredPaths = [
    'field.structure.label',
    'field.structure.child.sectionName',
    'field.structure.child.component_list',
    'field.styles.label',
    'field.styles.child.width',
    'field.styles.child.height',
    'field.styles.child.justify',
    'field.styles.child.bgColor',
    'field.config.label',
    'field.config.child.editMode',
    'field.config.child.showGuides',
    'field.config.child.enableHorizontalScroll',
    'field.config.child.gridSize',
  ];
  validateRequiredPaths(component, requiredPaths, path, errors);
  const controls = [
    'field.structure.child.sectionName',
    'field.structure.child.component_list',
    'field.styles.child.width',
    'field.styles.child.height',
    'field.styles.child.justify',
    'field.styles.child.bgColor',
    'field.config.child.editMode',
    'field.config.child.showGuides',
    'field.config.child.enableHorizontalScroll',
    'field.config.child.gridSize',
  ];
  for (const controlPath of controls) {
    validateControl(readPath(component, controlPath), `${path}.${controlPath}`, errors);
  }
  const children = readPath(component, 'field.structure.child.component_list.value');
  if (!Array.isArray(children)) {
    errors.push(`${path}.field.structure.child.component_list.value must be an array`);
    return;
  }
  for (const [index, child] of children.entries()) {
    validateOutputComponent(child, `${path}.field.structure.child.component_list.value[${index}]`, {
      ...context,
      topLevel: false,
    });
  }
}

function validateFieldOutput(component, type, path, context) {
  const { errors } = context;
  const contract = FIELD_COMPONENT_CONTRACTS[type];
  if (!contract) {
    errors.push(`${path} has no final output field contract for component type ${type}`);
    return;
  }
  validateRequiredPaths(component, [
    'field.structure.label',
    'field.structure.child',
    'field.styles.label',
    'field.styles.child',
  ], path, errors);
  for (const field of contract.structure) {
    const controlPath = `field.structure.child.${field}`;
    validateRequiredPaths(component, [controlPath], path, errors);
    validateControl(readPath(component, controlPath), `${path}.${controlPath}`, errors);
  }
  for (const field of contract.styles) {
    const controlPath = `field.styles.child.${field}`;
    validateRequiredPaths(component, [controlPath], path, errors);
    validateControl(readPath(component, controlPath), `${path}.${controlPath}`, errors);
  }

  if (['text', 'img', 'button', 'rectangle', 'circle'].includes(type)) {
    const linkPath = 'field.structure.child.link.value';
    validateRequiredPaths(component, [
      `${linkPath}.page`,
      `${linkPath}.url`,
      `${linkPath}.type`,
      `${linkPath}.serviceId`,
      `${linkPath}.productId`,
    ], path, errors);
  }
  if (type === 'tabs') validateTabOutput(component, path, context);
}

function validateTabOutput(component, path, context) {
  const { errors } = context;
  for (let tabIndex = 1; tabIndex <= 5; tabIndex += 1) {
    const valuePath = `field.structure.child.tab${tabIndex}Content.value`;
    const requiredPaths = [
      `${valuePath}.structure.label`,
      `${valuePath}.structure.child.component_list`,
      `${valuePath}.styles.label`,
      `${valuePath}.styles.child.height`,
      `${valuePath}.styles.child.justify`,
      `${valuePath}.styles.child.bgColor`,
    ];
    validateRequiredPaths(component, requiredPaths, path, errors);
    for (const suffix of [
      'structure.child.component_list',
      'styles.child.height',
      'styles.child.justify',
      'styles.child.bgColor',
    ]) {
      validateControl(readPath(component, `${valuePath}.${suffix}`), `${path}.${valuePath}.${suffix}`, errors);
    }
    const childrenPath = `${valuePath}.structure.child.component_list.value`;
    const children = readPath(component, childrenPath);
    if (!Array.isArray(children)) {
      errors.push(`${path}.${childrenPath} must be an array`);
      continue;
    }
    for (const [childIndex, child] of children.entries()) {
      validateOutputComponent(child, `${path}.${childrenPath}[${childIndex}]`, {
        ...context,
        topLevel: false,
      });
    }
  }
}

function validateFixedOutput(component, type, path, errors) {
  const propPaths = FIXED_COMPONENT_PROP_PATHS[type];
  validateRequiredPaths(component, ['component.name', 'component.props'], path, errors);
  if (!propPaths) {
    errors.push(`${path} has no final output property contract for component type ${type}`);
    return;
  }
  if (component.component?.name !== FIXED_COMPONENT_NAMES[type]) {
    errors.push(`${path}.component.name must be "${FIXED_COMPONENT_NAMES[type]}"`);
  }
  validateRequiredPaths(component.component?.props, propPaths, `${path}.component.props`, errors);

  if (type === 'navigation') {
    validateArrayItemPaths(component.component?.props?.list, [
      'text', 'useText', 'mode', 'link', 'link.page', 'link.appid', 'link.type',
      'link.name', 'icon', 'color', 'backgroundColor',
    ], `${path}.component.props.list`, errors);
  }
  if (type === 'brand-navbar') {
    validateArrayItemPaths(component.component?.props?.items, [
      'id', 'label', 'renderMode', 'icon', 'target', 'target.kind',
    ], `${path}.component.props.items`, errors);
  }
  if (type === 'banner') {
    validateArrayItemPaths(component.component?.props?.list, [
      'pic', 'link', 'link.name', 'link.type', 'link.appid', 'link.page',
    ], `${path}.component.props.list`, errors);
  }
  if (type === 'service-list') {
    validateArrayItemPaths(component.component?.props?.data?.categories, [
      'label', 'value', 'icon',
    ], `${path}.component.props.data.categories`, errors);
  }
}

function validateArrayItemPaths(value, requiredPaths, path, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }
  for (const [index, item] of value.entries()) {
    validateRequiredPaths(item, requiredPaths, `${path}[${index}]`, errors);
  }
}

function validateControl(value, path, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path} must be a control object`);
    return;
  }
  validateRequiredPaths(value, ['label', 'type', 'value'], path, errors);
  if (Object.hasOwn(value, 'type') && !string(value.type).trim()) {
    errors.push(`${path}.type must not be empty`);
  }
}

function validateRequiredPaths(value, requiredPaths, path, errors) {
  for (const requiredPath of requiredPaths) {
    if (!hasPath(value, requiredPath)) {
      errors.push(`${path} missing required field "${requiredPath}"`);
    }
  }
}

function hasPath(value, path) {
  let current = value;
  for (const segment of path.split('.')) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, segment)) return false;
    current = current[segment];
  }
  return current !== undefined;
}

function readPath(value, path) {
  let current = value;
  for (const segment of path.split('.')) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

function normalizeType(type) {
  const value = string(type).trim().toLowerCase();
  if (!value) throw new Error('Component type is required');
  if (value === 'image') return 'img';
  if (value === 'richtext') return 'rich-text';
  if (value === 'imgtext') return 'img-text';
  if (value === 'video') return 'video-player';
  if (value === 'socialshare') return 'social-share';
  if (value === 'personprofile') return 'person-profile';
  if (value === 'inquirybox') return 'inquiry-box';
  if (value === 'product-list' || value === 'productlist') return 'goods-list';
  if (value === 'blog') return 'blog-list';
  if (value === 'inquiry') return 'inquiry-box';
  if (value === 'storeinfo' || value === 'store-info') return 'store-information';
  if (SUPPORTED_CHILD_TYPES.has(value)) return value;
  throw new Error(`Unsupported Unico component type: ${value || '(empty)'}`);
}

function defaultComponentLabel(type) {
  const labels = {
    'goods-list': 'Product List',
    coupon: 'Coupon',
    navigation: 'Navigation',
    'brand-navbar': 'Brand Navbar',
    search: 'Search',
    banner: 'Banner',
    'store-information': 'Store Information',
    'discount-promotion': 'Discount Promotion',
    'service-list': 'Service List',
    'event-list': 'Event List',
    'event-calendar': 'Event Calendar',
    'blog-list': 'Blog',
    map: 'Map',
    'inquiry-box': 'Inquiry',
  };
  return labels[type] || type;
}

function control(label, type, value) {
  return { label, type, value };
}

function registerId(value, fallback, path, seenIds, errors) {
  const id = safeId(value || fallback, fallback);
  if (seenIds.has(id)) {
    errors.push(`${path} resolves to duplicate id "${id}" already used by ${seenIds.get(id)}`);
  } else {
    seenIds.set(id, path);
  }
}

function safeId(value, fallback = 'component') {
  const id = string(value).trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return id || fallback;
}

function string(value) {
  return value === undefined || value === null ? '' : String(value);
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function strictNumber(value, fallback, path, errors) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    errors.push(`${path} must be a finite number`);
    return fallback;
  }
  return parsed;
}

function resolvedChildWidth(child, type, path, errors) {
  const fallback = (DEFAULT_DIMENSIONS[type] || [120, 80])[0];
  if (path && errors) return strictNumber(child.w ?? child.width, fallback, `${path}.w`, errors);
  return number(child.w ?? child.width, fallback);
}

function resolvedChildHeight(child, type, width, path, errors) {
  const rawHeight = child.h ?? child.height;
  if (rawHeight !== undefined) {
    if (path && errors) return strictNumber(rawHeight, (DEFAULT_DIMENSIONS[type] || [120, 80])[1], `${path}.h`, errors);
    return number(rawHeight, (DEFAULT_DIMENSIONS[type] || [120, 80])[1]);
  }
  if (type === 'text') return estimateTextHeight(child, width);
  if (type === 'rich-text') return estimateRichTextHeight(child, width);
  return (DEFAULT_DIMENSIONS[type] || [120, 80])[1];
}

function estimateTextHeight(child, width) {
  const content = string(child.text ?? child.content);
  const fontSize = Math.max(1, number(child.fontSize, 16));
  const rawLineHeight = Number(child.lineHeight);
  const lineHeight = Number.isFinite(rawLineHeight) && rawLineHeight > 0 ? rawLineHeight : 1.35;
  const availableWidth = Math.max(1, width - 8);
  const logicalLines = content.split(/\r?\n/);
  let renderedLines = 0;
  for (const line of logicalLines) {
    let pixelWidth = 0;
    for (const character of line || ' ') {
      if (/\s/.test(character)) pixelWidth += fontSize * 0.33;
      else if (/[\u2E80-\u9FFF\uF900-\uFAFF]/.test(character)) pixelWidth += fontSize;
      else if (/[A-Z0-9]/.test(character)) pixelWidth += fontSize * 0.62;
      else pixelWidth += fontSize * 0.54;
    }
    renderedLines += Math.max(1, Math.ceil(pixelWidth / availableWidth));
  }
  return Math.max(Math.ceil(fontSize * lineHeight + 8), Math.ceil(renderedLines * fontSize * lineHeight + 8));
}

function estimateRichTextHeight(child, width) {
  const fontSize = Math.max(1, number(child.fontSize, 15));
  const paddingInline = Math.max(0, number(child.paddingInline ?? child.padding, 10));
  const paddingBlock = Math.max(0, number(child.paddingBlock ?? child.padding, 10));
  const availableWidth = Math.max(1, width - (paddingInline * 2));
  const rawLineHeight = Number(child.lineHeight);
  const lineHeight = Math.max(
    1.5,
    Number.isFinite(rawLineHeight) && rawLineHeight > 0 ? rawLineHeight : 1.5,
  );
  const content = richTextPlainText(child.html ?? child.content ?? child.text);
  const narrowColumn = availableWidth < fontSize * 8;
  const renderedLines = estimateWrappedLines(
    content,
    fontSize,
    availableWidth,
    narrowColumn ? 1.15 : 1,
  );
  const safety = narrowColumn
    ? Math.ceil(fontSize * 0.75)
    : (fontSize >= 14 ? Math.ceil(fontSize * 0.5) : 0);
  const rawHeight = (renderedLines * fontSize * lineHeight) + (paddingBlock * 2) + safety;
  return Math.max(1, Math.ceil(rawHeight) + 1);
}

function estimateWrappedLines(content, fontSize, availableWidth, widthFactor = 1) {
  const logicalLines = string(content).split(/\r?\n/);
  let renderedLines = 0;
  for (const line of logicalLines) {
    let pixelWidth = 0;
    for (const character of line || ' ') {
      if (/\s/.test(character)) pixelWidth += fontSize * 0.33;
      else if (/[\u2E80-\u9FFF\uF900-\uFAFF]/.test(character)) pixelWidth += fontSize;
      else if (/[A-Z0-9]/.test(character)) pixelWidth += fontSize * 0.62;
      else pixelWidth += fontSize * 0.54;
    }
    renderedLines += Math.max(1, Math.ceil((pixelWidth * widthFactor) / availableWidth));
  }
  return renderedLines;
}

function richTextPlainText(value) {
  return string(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function imageFit(value) {
  const fit = string(value || 'cover').toLowerCase();
  return fit === 'contain' || fit === 'fill' || fit === 'cover' ? fit : 'cover';
}

function mediaSource(value) {
  if (typeof value !== 'string') return '';
  const source = value.trim();
  if (!source || source === '[object Object]') return '';
  return source;
}

function validateOnlineImageSource(source, path, errors) {
  if (!source) {
    errors.push(`${path} must use a verified HTTP(S) image URL`);
    return;
  }
  if (isSvgSource(source)) {
    errors.push(`${path}: SVG images are forbidden; search for a real raster image URL`);
    return;
  }
  if (!isHttpSource(source)) {
    errors.push(`${path} must use a verified HTTP(S) image URL; local, data, blob, and generated sources are forbidden`);
    return;
  }
  if (isPlaceholderSource(source)) {
    errors.push(`${path} uses a placeholder domain; search for a real image`);
    return;
  }
  if (isImageProviderPage(source)) {
    errors.push(`${path} is not a direct image URL; use the provider's image CDN URL instead of its photo detail page`);
  }
}

function validateOptionalOnlineImageSource(value, path, errors) {
  const source = mediaSource(value);
  if (source) validateOnlineImageSource(source, path, errors);
}

function isHttpSource(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSvgSource(value) {
  const source = string(value).trim().toLowerCase();
  if (source.includes('<svg') || source.startsWith('data:image/svg+xml')) return true;
  try {
    const url = new URL(source);
    if (/\.svgz?$/.test(url.pathname)) return true;
    return ['format', 'fm', 'type'].some((key) => /^image\/svg\+xml$|^svg$/.test(string(url.searchParams.get(key)).toLowerCase()));
  } catch {
    return /\.svgz?(?:[?#]|$)/.test(source);
  }
}

function isPlaceholderSource(value) {
  return /(^|\.)example\.(com|org|net)(\/|$)|placeholder\.com|via\.placeholder/i.test(value);
}

function isImageProviderPage(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.toLowerCase();
    return (host === 'unsplash.com' && path.startsWith('/photos/'))
      || (host === 'pexels.com' && path.startsWith('/photo/'))
      || (host === 'pixabay.com' && path.startsWith('/photos/'));
  } catch {
    return false;
  }
}

function color(value) {
  return string(value || 'transparent');
}

function justify(value) {
  const v = string(value || 'left').toLowerCase();
  if (v === 'center' || v === 'right' || v === 'left') return v;
  return 'left';
}

function link(value) {
  const defaults = { page: '', url: '', type: 'external', serviceId: '', productId: '' };
  if (value && typeof value === 'object') return { ...defaults, ...value };
  return { ...defaults, url: string(value) };
}

function structureLabel(type) {
  if (type === 'text') return 'Text Content';
  if (type === 'button') return 'Button Text';
  if (type === 'img') return 'Image';
  if (type === 'rich-text') return 'Rich Text';
  if (type === 'img-text') return 'Image Text';
  if (type === 'video-player') return 'Video Content';
  if (type === 'countdown') return 'Countdown Content';
  if (type === 'tabs') return 'Tabs Content';
  if (type === 'accordion') return 'Accordion Content';
  if (type === 'map') return 'Map Content';
  if (type === 'rating') return 'Rating Content';
  if (type === 'social-share') return 'Social Share Content';
  if (type === 'person-profile') return 'Person Profile Content';
  if (type === 'inquiry-box') return 'Inquiry Box Content';
  return 'Content';
}

function styleLabel(type) {
  if (type === 'text') return 'Text Style';
  if (type === 'button') return 'Button Style';
  if (type === 'img') return 'Image Style';
  if (type === 'img-text') return 'Image Text Style';
  if (type === 'video-player') return 'Video Style';
  if (type === 'countdown') return 'Countdown Style';
  if (type === 'tabs') return 'Tabs Style';
  if (type === 'accordion') return 'Accordion Style';
  if (type === 'map') return 'Map Style';
  if (type === 'rating') return 'Rating Style';
  if (type === 'social-share') return 'Social Share Style';
  if (type === 'person-profile') return 'Person Profile Style';
  if (type === 'inquiry-box') return 'Inquiry Box Style';
  return 'Style';
}
