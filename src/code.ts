import { Inquisitor } from './inquisitor.class';
import { EventMessages } from './value.const';

figma.showUI(__html__, {
  width: 600,
  height: 600,
  title: 'The Inquisitor - local variable inspector',
});

figma.skipInvisibleInstanceChildren = true;

figma.on('selectionchange', selectionHasChanged);

function selectionHasChanged() {
  const localVariables = figma.variables.getLocalVariables();
  const collections = figma.variables.getLocalVariableCollections();
  const selection = [...figma.currentPage.selection];
  const currentPage = figma.currentPage;

  const inquisitor = new Inquisitor(localVariables, selection);
  const unusedVariablesInfo = inquisitor.getFigmaData();

  figma.ui.postMessage({
    type: EventMessages.FIGMA_DATA_READY,
    localVariables: localVariables.map((v: Variable) => ({
      name: v.name,
    })),
    collections,
    selection,
    unusedVariablesInfo,
    currentPage,
  });
}
