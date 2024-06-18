const {PerfRenderFromJson} = require('proskomma-json-tools');

function verse_stats({content, contentType, level}) {
    if (!["perf"].includes(contentType)) {
        return {
            "completed": false,
            "abandonReason": ["bad_format", {expected: "perf", found: contentType}]
        }
    }
    const actions = {
        startDocument: [
            {
                description: "Set up",
                test: () => true,
                action: ({ config, context, workspace, output }) => {
                    output.emptyVerses = [];
                    output.shortVerses = [];
                    output.longVerses = [];
                    workspace.chapter = null;
                    workspace.verses = null;
                    workspace.words = 0;
                }
            },
        ],
        mark: [
            {
                description: "Update CV state",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    try {
                        const element = context.sequences[0].element;
                        if (element.subType === "chapter") {
                            workspace.chapter = element.atts["number"];
                            workspace.verses = null;

                        } else if (element.subType === "verses") {
                            if (workspace.verses) {
                                if (workspace.words === 0) {
                                    output.emptyVerses.push(`${workspace.chapter}:${workspace.verses}`);
                                } else if (workspace.words < config.minWordsPerVerse) {
                                    output.shortVerses.push(`${workspace.chapter}:${workspace.verses}`);
                                } else if (workspace.words > config.maxWordsPerVerse) {
                                    output.longVerses.push(`${workspace.chapter}:${workspace.verses}`);
                                }
                            }
                            workspace.verses = element.atts["number"];
                            workspace.words = 0;
                        }
                    } catch (err) {
                        console.error(err);
                        throw err;
                    }
                    return true;
                },
            },
        ],
        text: [
            {
                description: "Split strings and count words",
                test: () => true,
                action: ({config, context, workspace, output}) => {
                    for (let word of context.sequences[0].element.text.split(/[\s:;,.]+/).filter(w => w.length > 0)) {
                        workspace.words++;
                    }
                }
            }
        ],

    }
    const cl = new PerfRenderFromJson({ srcJson: content, actions });
    const output = {};
    cl.renderDocument({ docId: "", config: {minWordsPerVerse: 10, maxWordsPerVerse: 30}, output });
    const issues = [];
    for (const [k, v] of Object.entries(output)) {
        for (const cv of output[k]) {
            issues.push({
                name: k,
                level,
                "args": {cv}
            });
        }
    }
    return {
     "completed": true,
     issues
    }
}

module.exports = {verse_stats}
