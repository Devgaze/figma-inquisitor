type UnusedVariable = {
  id: string;
  name: string;
  variableCollectionId: string;
};

type FigmaData = {
  unusedVariables: UnusedVariable[];
  executionTimeInMs: number;
  countOfSelectedNodes: number;
};

interface IInquisitor {
  localVariables: Variable[];
  currentSelection: SceneNode[];
  unusedVariables: Variable[];
  executionTimeInMs: number;

  getFigmaData(): FigmaData;
}

export class Inquisitor implements IInquisitor {
  localVariables: Variable[];
  currentSelection: SceneNode[];
  unusedVariables: Variable[];
  executionTimeInMs: number;

  constructor(variables: Variable[], selection: SceneNode[]) {
    this.localVariables = variables || [];
    const start = Date.now();

    const { result, unusedVariables } = this._walkTheNodes(selection || []);
    this.unusedVariables = unusedVariables;
    this.currentSelection = result;

    const end = Date.now();
    this.executionTimeInMs = end - start;
    // console.warn(
    //   `Executed traversal of ${this.currentSelection.length} elements in ${this.executionTimeInMs} ms and identified ${this.unusedVariables.length} unused variables`
    // );
  }

  getFigmaData(): FigmaData {
    const unusedVariables = this.unusedVariables.map((v: Variable) => {
      const { id, name, variableCollectionId } = v;
      return { id, name, variableCollectionId };
    });

    return {
      unusedVariables,
      executionTimeInMs: this.executionTimeInMs,
      countOfSelectedNodes: this.currentSelection.length,
    };
  }

  private _walkTheNodes(root: any) {
    const q: any[] = [...root];
    const result: any[] = [];
    let c = 0;
    let unusedVariables: Variable[] = [...this.localVariables];

    // console.log(this.localVariables);
    while (q.length > 0) {
      const node = q.shift();

      if (node === null) continue;

      // console.log(node);
      // check for bounded varibales
      if (node.boundVariables && node.boundVariables.hasOwnProperty('characters')) {
        // console.log('found character bounding');
        unusedVariables = unusedVariables.filter(
          (v: Variable) => v.id != node.boundVariables.characters.id
        );
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('effects')) {
        // console.log('found effect bounding');
        node.boundVariables.effects.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
            // console.warn(`Comparing effect ${v.id} != ${e.id}`);
            return v.id != e.id ? e : undefined;
          });
        });
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('fills')) {
        // console.log('found fill bounding');
        node.boundVariables.fills.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
            // console.warn(`Comparing fills ${v.id} != ${e.id}`);
            return v.id != e.id ? e : undefined;
          });
        });
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('strokes')) {
        // console.log('found stroke bounding');
        node.boundVariables.strokes.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
            // console.warn(`Comparing stroke ${v.id} != ${e.id}`);
            return v.id != e.id ? e : undefined;
          });
        });
      }

      if (node.reactions) {
        // check for (re)actions
        node.reactions.forEach((r: Reaction) => {
          if (!r.actions) {
            return;
          }

          const filteredActions = r.actions.filter(
            (a: any) => !!a && (a.type === 'SET_VARIABLE' || a.type === 'VARIABLE')
          );

          filteredActions.forEach((a: any) => {
            unusedVariables = unusedVariables.filter((v: Variable) => v.id != a.variableId);
          });
        });
      }
      result.push(node);

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          q.push(node.children[i]);
        }
      }
      c++;
    }
    // console.error(unusedVariables);
    return { result, unusedVariables };
  }
}
