// figma.closePlugin();

// This shows the HTML page in "ui.html".

figma.showUI(__html__, {
  width: 600,
  height: 600,
  title: 'The Inquisitor - local variable inspector',
});
figma.skipInvisibleInstanceChildren = true;

figma.on('selectionchange', selectionHasChanged);

function selectionHasChanged() {
  figma.ui.postMessage({
    type: 'uiDataReady',
  });
}
