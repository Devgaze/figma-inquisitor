import { InqFigmaData, InqUnusedVariable } from './models.interface';
interface IInquisitor {
  localVariables: Variable[];
  currentSelection: SceneNode[];
  unusedVariables: Variable[];
  executionTimeInMs: number;

  getFigmaData(): InqFigmaData;
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
    console.clear();
  }

  getFigmaData(): InqFigmaData {
    const unusedVariables: InqUnusedVariable[] = (this.unusedVariables || []).map((v: Variable) => {
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

    while (q.length > 0) {
      const node = q.shift();

      if (node === null) continue;

      if (node.boundVariables && node.boundVariables.hasOwnProperty('characters')) {
        unusedVariables = unusedVariables.filter(
          (v: Variable) => v.id != node.boundVariables.characters.id
        );
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('effects')) {
        node.boundVariables.effects.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
            // console.warn(`Comparing effect ${v.id} != ${e.id}`);
            return v.id != e.id ? e : undefined;
          });
        });
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('fills')) {
        node.boundVariables.fills.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
            return v.id != e.id ? e : undefined;
          });
        });
      }

      if (node.boundVariables && node.boundVariables.hasOwnProperty('strokes')) {
        node.boundVariables.strokes.forEach((e: any) => {
          unusedVariables = unusedVariables.filter((v: Variable) => {
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

    return { result, unusedVariables };
  }
}
