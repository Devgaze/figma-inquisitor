import { Inquisitor } from './inquisitor.class';
import { InqVariableCollection, notificationOptions } from './models.interface';
import { EventMessages } from './events.enum';

figma.showUI(__html__, {
  width: 600,
  height: 600,
  title: 'The Inquisitor - local variable inspector',
});

figma.skipInvisibleInstanceChildren = true;
figma.on('run', run);
figma.on('selectionchange', selectionHasChanged);

function run() {
  const localVariables = figma.variables.getLocalVariables();
  const collections: InqVariableCollection[] = figma.variables
    .getLocalVariableCollections()
    .map((c: VariableCollection) => ({ id: c.id, name: c.name, variableIds: c.variableIds }));

  const selection = [...figma.currentPage.selection];

  const inquisitor = new Inquisitor(localVariables, selection);
  const { unusedVariables, executionTimeInMs, countOfSelectedNodes } = inquisitor.getFigmaData();

  figma.ui.postMessage({
    type: EventMessages.FIGMA_PLUGIN_STARTED,
    collections,
    localVariables: localVariables.map((v: Variable) => ({
      name: v.name,
      id: v.id,
    })),
    unusedVariables,
    currentPageTitle: figma.currentPage.name,
  });

  // pop the job stats notification
  notifyFigma(executionTimeInMs, countOfSelectedNodes);
}

function selectionHasChanged() {
  const localVariables = figma.variables.getLocalVariables();
  const selection = [...figma.currentPage.selection];

  const inquisitor = new Inquisitor(localVariables, selection);
  const { unusedVariables, executionTimeInMs, countOfSelectedNodes } = inquisitor.getFigmaData();

  figma.ui.postMessage({
    type: EventMessages.FIGMA_DATA_READY,
    selection,
    unusedVariables,
  });

  // pop the job stats notification
  notifyFigma(executionTimeInMs, countOfSelectedNodes);
}

function notifyFigma(executionTimeInMs: number, countOfSelectedNodes: number) {
  const seconds = executionTimeInMs / 1000;
  const nodeCount = new Intl.NumberFormat('en-uk', { maximumSignificantDigits: 3 }).format(
    countOfSelectedNodes
  );

  if (parseInt(nodeCount) > 0) {
    if (seconds <= 1) {
      figma.notify(`Processed ${nodeCount} elements in ${seconds} seconds.`, notificationOptions);
    } else if (seconds <= 5) {
      figma.notify(`Processed ${nodeCount} elements in ${seconds} seconds.`, notificationOptions);
    } else {
      figma.notify(`Seriously!? ${nodeCount} elements?? Well it's done in ${seconds} seconds.`, {
        ...notificationOptions,
        error: true,
      });
    }
  }
}
