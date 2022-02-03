// faz uma string cammel case
export const toCamel = (s: string) => {
    return s.replace(/([-_][a-z])/gi, w => {
        return w.toUpperCase().replace('-', '').replace('_', '');
    });
};

// par_id_restaurante - ERRADO
// par_idRestaurante - CERTO
// standardizeParamsInQuery corrige todos os parametros para ficarem no padrão
export const standardizeParamsInQuery = (str: string) => {
    const params = str
        .split(' ')
        .filter(word => word.includes('par_'))
        .map(param => `par_${toCamel(param.split(':par_')[1])}`);

    let index = 0;

    str = str
        .split(' ')
        .map(word => (word.includes('par_') ? `:${params[index++]}` : word))
        .join(' ');

    return str;
};

export const getMainTableName = (sql: string): null | string => {
    let selectDepth = 0;
    let tableName = null;
    const wordByWord = sql
        .split('')
        .filter(word => word !== ')' && word !== '(')
        .join('')
        .split(' ');

    try {
        wordByWord.forEach((word, index, array) => {
            console.log('word: ', word, selectDepth);
            if (word.toLowerCase() === 'select') selectDepth++;
            else if (word.toLowerCase() === 'from') {
                selectDepth--;
                if (!selectDepth) {
                    tableName = array[index + 1] ?? null;
                    throw 'break';
                }
            }
        });
    } catch (error) {
        // Só pra cancelar o forEach
    }

    return tableName;
};

export const indentStringWithTab = (str: string, numOfTabs: number) => {
    const tab = '    ';
    let tabInsert = '';

    for (let i = 1; i <= numOfTabs; i++) tabInsert += tab;

    return str
        .split('\n')
        .map(line => tabInsert + line)
        .join('\n');
};
