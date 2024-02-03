interface LanguageComment {
    line: string;
    lineString: string;
    blockStart: string;
    blockStartString: string;
    blockEnd: string;
    blockEndString: string;
}

const languageCommentMap: Record<string, LanguageComment> = {
    'javascript, typescript, typescriptreact, javascriptreact, scss': {
        line: "\\/\\/",
        lineString: "//",
        blockStart: "\\/\\*\\*\\?",
        blockStartString: "/**",
        blockEnd: "\\*\\/",
        blockEndString: "*/",
    },
    'python': {
        line: "#",
        lineString: "#",
        blockStart: '"""',
        blockStartString: '"""',
        blockEnd: '"""',
        blockEndString: '"""',
    },
};

export const getLanguageComment = (languageId: string): LanguageComment => {
    const keys = Object.keys(languageCommentMap);
    const languageIdKey = keys.find(key => key.includes(languageId)) || '';
    const languageComment = languageCommentMap[languageIdKey];
    if (!languageComment) {
        return { 
            line: "\\/\\/",
            lineString: "//",
            blockStart: "\\/\\*\\*\\?",
            blockStartString: "/**",
            blockEnd: "\\*\\/",
            blockEndString: "*/",
        }
    }
    return languageComment;
}
