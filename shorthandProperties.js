const esprima = require('esprima');
const getStdin = require('get-stdin');


// looks for console.log(x) or console['error'](y)
const isConsoleCall = (node) => {
    return (node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.object.type === 'Identifier') &&
        (node.callee.object.name === 'console');
};

// looks for redundant declarations inside objects, like { <foo: foo> }
const isShorthandableProperty = (node) => {
  return (node.type === 'Property') &&
      (node.shorthand === false) &&
      (node.key.type === 'Identifier') &&
      (node.value.type === 'Identifier') &&
      (node.key.name === node.value.name)
};

// the replacement for { <foo: foo> } is just { <foo> }
const getShorthandProperty = (node) => node.value.name;


// given Javascript source as a string, an estree node-matcher, and an estree node-transformer,
// transform the source
const transformSource = (source, isMatched, getTransformed) => {
    const entries = [];
    esprima.parseScript(source, {}, (node, meta) => {
        if (isMatched(node)) {
            entries.push({
                start: meta.start.offset,
                end: meta.end.offset,
                content: getTransformed(node),
            });
        }
    });
    entries
        .sort((a, b) => b.end - a.end )
        .forEach(n => {
            source = source.slice(0, n.start) + n.content + source.slice(n.end);
        });
    return source;
};


const main = async () => {
    const source = await getStdin();

    const modified = transformSource(source, isShorthandableProperty, getShorthandProperty);
    process.stdout.write(modified);
};

main().catch(console.error);
