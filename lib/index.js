'use strict';

const headerHandler = require('./handlers/header');
const tablesHandler = require('./handlers/tables');
const blocksHandler = require('./handlers/blocks');
const entitiesHandler = require('./handlers/entities');

const toLines = (string) => {
  const lines = string.split(/\r\n|\r|\n/g);
  const contentLines = lines.filter((l) => {
    return l.trim !== 'EOF';
  });
  return contentLines;
};

// Parse the value into the native representation
const parseValue = (type, value) => {
  if ((type >= 10) && (type < 60)) {
    return parseFloat(value, 10);
  } else if ((type >= 210) && (type < 240)) {
    return parseFloat(value, 10);
  } else if ((type >= 60) && (type < 100)) {
    return parseInt(value, 10);
  } else {
    return value;
  }
};

// Content lines are alternate lines of type and value
const convertToTypesAndValues = (contentLines) => {
  let state = 'type';
  let type;
  const typesAndValues = [];
  for(let line of contentLines) {
    if (state === 'type') {
      type = parseInt(line, 10);
      state = 'value';
    } else {
      typesAndValues.push([type, parseValue(type, line)]);
      state = 'type';
    }
  }
  return typesAndValues;
};


const separateSections = (tuples) => {
  let sectionTuples;
  return tuples.reduce((sections, tuple) => {
    if ((tuple[0] === 0) && (tuple[1] === 'SECTION')) {
      sectionTuples = [];
    } else if ((tuple[0] === 0) && (tuple[1] === 'ENDSEC')) {
      sections.push(sectionTuples);
      sectionTuples = undefined;
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple);
    }
    return sections;
  }, []);
};

// Each section start with the type tuple, then proceeds
// with the contents of the section
const reduceSection = (acc, section) => {
  const sectionType = section[0][1];
  const contentTuples = section.slice(1);
  switch(sectionType) {
    case 'HEADER':
      acc.header = headerHandler(contentTuples);
      break;
    case 'TABLES':
      acc.tables = tablesHandler(contentTuples);
      break;
    case 'BLOCKS':
      acc.blocks = blocksHandler(contentTuples);
      break;
    case 'ENTITIES':
      acc.entities = entitiesHandler(contentTuples);
      break;
    default:
  }
  return acc;
};


const parseString = (string) => {
  const lines = toLines(string);
  const tuples = convertToTypesAndValues(lines);
  const sections = separateSections(tuples);
  const result = sections.reduce(reduceSection, {
    // In the event of empty sections
    header: {},
    blocks: [],
    entities: [],
  });
  return result;
};

module.exports.config = require('./config');
module.exports.parseString = parseString;
module.exports.denormalise = require('./denormalise');
module.exports.entityToPolyline = require('./entityToPolyline');
module.exports.BoundingBox = require('./BoundingBox');
module.exports.colors = require('./util/colors');
module.exports.toSVG = require('./toSVG');
module.exports.groupEntitiesByLayer = require('./groupEntitiesByLayer');
