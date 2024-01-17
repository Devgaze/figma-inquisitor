import { Inquisitor } from './inquisitor.class';
import { InqVariableCollection } from './models.interface';
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
  const selection = [...figma.currentPage.selection];
  const collections: InqVariableCollection[] = figma.variables
    .getLocalVariableCollections()
    .map((c: VariableCollection) => ({ id: c.id, name: c.name, variableIds: c.variableIds }));

  const inquisitor = new Inquisitor(localVariables, selection);
  const unusedVariablesInfo = inquisitor.getFigmaData();

  figma.ui.postMessage({
    type: EventMessages.FIGMA_DATA_READY,
    localVariables: localVariables.map((v: Variable) => ({
      name: v.name,
      id: v.id,
    })),
    collections,
    selection,
    unusedVariablesInfo,
    currentPageTitle: figma.currentPage.name,
  });
}
