import * as fs from 'fs';
import * as path from 'path';
import * as Parser from 'tree-sitter';
import * as Catala from '/home/user/dev/projects/tree-sitter/tree-sitter-catala/bindings/node/index.js';
// import * as Catala from '../catala/tree-sitter/bindings/node';
import {
  CatalaFileParsed,
  CatalaGrammarTypes,
  CatalaSyntaxNode,
} from '../shared/CatalaTypes';
import {
  getAscendantNodeTypesPath,
  getClosestAscendantOfTypes,
  getTypeFromClosestAscendantOfTypes,
} from './tree-sitter-focus/tree-sitter-modules';

export async function parse(text: string): Promise<CatalaFileParsed> {
  const parser = new Parser();
  parser.setLanguage(Catala);
  const tree = parser.parse(text);
  const catalaFile: CatalaFileParsed = {
    error: [],
    enum_struct_name: [],
    field_name: [],
    scope_name: [],
    variable: [],
    verb_block: [],
    tree,
  };
  walkRecursive(tree.rootNode as CatalaSyntaxNode, catalaFile);
  return catalaFile;
}

function walkRecursive(
  node: CatalaSyntaxNode | undefined,
  catalaFile: CatalaFileParsed
) {
  if (!node) return;
  const catalaSyntaxNode: CatalaSyntaxNode = Object.assign(node, {
    enclosingBlockType: 'ALL',
  });

  // ['enum_struct_name', 'scope_decl_item', 'scope_decl']
  if (node.type === 'ERROR') {
    catalaFile.error.push(catalaSyntaxNode);
  }

  if (node.type === 'enum_struct_name') {
    const parentTypes: CatalaGrammarTypes[] = [
      'definition',
      'struct_decl',
      'struct_decl_item',
      'scope_decl_item',
    ];
    const grandParentTypes: CatalaGrammarTypes[] = ['scope', 'scope_decl'];
    const ascendantTypesPath = getAscendantNodeTypesPath(
      node,
      parentTypes,
      grandParentTypes
    );
    catalaSyntaxNode.ascendantTypesPath = ascendantTypesPath;
    catalaFile.enum_struct_name.push(catalaSyntaxNode);
  } else if (node.type === 'field_name') {
    const parentTypes: CatalaGrammarTypes[] = [
      'definition',
      'struct_decl',
      'struct_decl_item',
    ];
    const grandParentTypes: CatalaGrammarTypes[] = [
      'scope',
      'scope_decl',
      'struct_decl',
    ];
    const ascendantTypesPath = getAscendantNodeTypesPath(
      node,
      parentTypes,
      grandParentTypes
    );
    catalaSyntaxNode.ascendantTypesPath = ascendantTypesPath;
    catalaSyntaxNode.enclosingBlockType = getTypeFromClosestAscendantOfTypes(
      node,
      ['scope', 'scope_decl', 'struct_decl']
    );
    catalaFile.field_name.push(catalaSyntaxNode);
  } else if (node.type === 'scope_name') {
    catalaSyntaxNode.enclosingBlockType = getTypeFromClosestAscendantOfTypes(
      node,
      ['scope', 'scope_decl']
    );
    catalaFile.scope_name.push(catalaSyntaxNode);
  } else if (node.type === 'variable') {
    const parentTypes: CatalaGrammarTypes[] = ['definition', 'scope_decl_item'];
    const grandParentTypes: CatalaGrammarTypes[] = ['scope', 'scope_decl'];
    const ascendantTypesPath = getAscendantNodeTypesPath(
      node,
      parentTypes,
      grandParentTypes
    );

    catalaSyntaxNode.ascendantTypesPath = ascendantTypesPath;
    catalaFile.variable.push(catalaSyntaxNode);
  } else if (node.type === 'verb_block') {
    const parentTypes: CatalaGrammarTypes[] = ['definition', 'scope_decl_item'];
    const grandParentTypes: CatalaGrammarTypes[] = ['scope', 'scope_decl'];
    const ascendantTypesPath = getAscendantNodeTypesPath(
      node,
      parentTypes,
      grandParentTypes
    );

    catalaSyntaxNode.ascendantTypesPath = ascendantTypesPath;
    catalaFile.variable.push(catalaSyntaxNode);
  }

  if (node.childCount === 0) return;

  node.children.forEach((child) => {
    walkRecursive(child, catalaFile);
  });
}

const content = fs.readFileSync(
  path.resolve(__dirname, '../..', 'tests/fixtures/cli.catala_en'),
  'utf-8'
);

async function main() {
  const result = await parse(content).catch((err) => console.error(err));
  const { declarations, fields } = result as any;
  const print = {
    declarations,
    fields,
  };
  // print; /*?*/
}
main();
