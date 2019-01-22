/*
 * a shell tool to transform JS

  use it like so:
  $ node ./shorthandProperties.js < source.js > target.js

  Or, to do it en masse, with bash, see transform.sh
*/

const esprima = require('esprima');
const getStdin = require('get-stdin');


// looks for redundant declarations inside objects, like { <foo: foo> }
const isShorthandableProperty = (node) => {
  return node.type === 'Property' &&
      node.shorthand === false &&
      node.key.type === 'Identifier' &&
      node.value.type === 'Identifier' &&
      node.key.name === node.value.name
};

// the content for { <foo: foo> } is just { <foo> }
const getShorthandProperty = (node) => node.value.name;


/*
 * Given Javascript source as a string, an estree node-matcher, and an estree node-transformer,
 * return transformed source as string
 */
const transformSource = (source, isMatched, getTransformed) => {
    const edits = [];
    esprima.parseScript(source, {jsx: true}, (node, meta) => {
        if (isMatched(node)) {
            edits.push({
                start: meta.start.offset,
                end: meta.end.offset,
                content: getTransformed(node),
            });
        }
    });

    /*
     * Perform all the edits.
     * Note we perform the edits from bottom to top, so the start and end offsets don't need to be
     * reshuffled with each edit. We recreate the string over and over, so it's not efficient,
     * but this is good enough for now.
     */
    edits
        .sort((a, b) => b.end - a.end)
        .forEach(edit => {
            source = source.slice(0, edit.start) + edit.content + source.slice(edit.end);
        });
    return source;
};


const main = async () => {
    const source = await getStdin();
    const modified = transformSource(source, isShorthandableProperty, getShorthandProperty);
    process.stdout.write(modified);
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});