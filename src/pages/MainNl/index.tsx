import { Autocomplete, Button, Checkbox, IconButton, Input, TextField, Tooltip } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CustomSwitch from '../../shared/components/CustomSwitch';
import { darkColor, lightColor } from '../../Theme';
import { getMainTableName, standardizeParamsInQuery, toCamel, indentStringWithTab } from '../../utils/Utils';
import { FiInfo } from 'react-icons/fi';

type Projects = Array<{
  id: number;
  label: string;
}>;

interface Config {
  defaultVar: string;
  customFormatString: (str: string, v?: string) => string;
  addJavaSpecials: (str: string, v?: string) => string;
  queryIndentLevel: number;
}

interface ProjectConfig {
  [key: number]: Config;
}

const projects: Projects = [
  { id: 0, label: 'Padrão' },
  { id: 1, label: 'Controle de desperdícios' },
  { id: 2, label: 'NLWeb' },
  // { id: 3, label: 'Novo RE' },
];

const projectConfiguration: ProjectConfig = {
  0: {
    defaultVar: 'sql',
    queryIndentLevel: 0,
    customFormatString: (str: string, v?: string) => str,
    addJavaSpecials: (str: string, v?: string) => str,
  },
  1: {
    defaultVar: 'sql',
    customFormatString: standardizeParamsInQuery,
    queryIndentLevel: 0,
    addJavaSpecials: function (str: string, v?: string) {
      const params = Array.from(
        new Set(
          str
            .split(' ')
            .filter(word => word.includes('par_'))
            .map(param => param.replaceAll(')', ''))
            .map(param => param.replaceAll('(', '')),
        ),
      );

      return (
        `
        ${str}
        \nQuery query = em.createNativeQuery(${v ?? this.defaultVar}.toString(), Tuple.class);
        ${params
          .map(
            param => `\nquery.setParameter("${param.replace(':', '')}", ${param.replace(':', '').split('par_')[1]});`,
          )
          .join('')}
        `.trimEnd() +
        '\n\ntry {' +
        '\n    return NativeUtils.convertResultList((List<Tuple>) query.getResultList(), SelectVO.class);' +
        '\n} catch (NlMsgErroException e) {' +
        '\n    e.printStackTrace();' +
        '\n}' +
        '\n' +
        '\nreturn Collections.emptyList();'
      );
    },
  },
  2: {
    defaultVar: 'sql',
    customFormatString: standardizeParamsInQuery,
    queryIndentLevel: 1,
    addJavaSpecials: function (str: string, v?: string) {
      console.log(': a');
      str = str
        .split('\n')
        .map(line => {
          if (line.includes('.append("')) {
            while (line.includes('  ");')) line = line.replaceAll('  ");', ' ");');
          }
          return line;
        })
        .join('\n');

      const tableNameQuery = toCamel(
        `query_${
          getMainTableName(
            str
              .split('\n')
              .filter(line => line.includes('.append("'))
              .join('\n'),
          ) ?? 'Tabela'
        }`,
      );

      return [
        `if (${tableNameQuery} == null) {`,
        ...indentStringWithTab(str, this.queryIndentLevel).split('\n'),
        '}',
        '',
        `return ${tableNameQuery};`,
      ].join('\n');
    },
  },
  3: {
    defaultVar: 'sb',
    queryIndentLevel: 0,
    customFormatString: (str: string, v?: string) => str,
    addJavaSpecials: (str: string, v?: string) => str,
  },
};

type Project = Projects[number];

const defaultProject = localStorage.getItem('@javafy/projects');

const unjavafyJavaQuery = (stringWithJavaContent: string) => {
  return stringWithJavaContent
    .split('\n')
    .filter(line => line.includes('.append("'))
    .map(line => line.trim())
    .join('\n');
};

const MainNl: React.FC = () => {
  const [javafy, setJavafy] = useState(true);
  const [varName, setVarName] = useState('sql');
  const [didUserChangeVarName, setDidUserChangeVarName] = useState(false);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [project, setProject] = useState<Project>(
    defaultProject ? (JSON.parse(defaultProject) as Project) : projects[0],
  );
  const [noJavaQuery, setNoJavaQuery] = useState(
    Boolean(JSON.parse(localStorage.getItem('@javafy/removeJava') ?? '0') as number),
  );

  useEffect(() => {
    if (text1) handleJavafy();
  }, [project]);

  const handleJavafy = () => {
    if (varName === '') {
      toast.error('Informe o nome da variável!', {
        style: {
          border: `1px solid ${darkColor}`,
          color: darkColor,
          maxWidth: 600,
        },
        iconTheme: {
          primary: darkColor,
          secondary: lightColor,
        },
        duration: 6000,
      });
      return;
    }

    let splitedByLine = text1.split('\n');
    splitedByLine = splitedByLine.map(line => line.trimEnd());
    splitedByLine = projectConfiguration[project.id].customFormatString(splitedByLine.join('\n'), varName).split('\n');

    let biggestLine = 0;
    let leastAmountOfSpacesAtTheBegining = Infinity;

    splitedByLine.forEach(line => {
      if (line.length > biggestLine) biggestLine = line.length;

      if (leastAmountOfSpacesAtTheBegining === 0) return;

      let spaceTestIndex = 0;
      while (line.length !== 0 && line[spaceTestIndex] === ' ') spaceTestIndex++;
      if (leastAmountOfSpacesAtTheBegining > spaceTestIndex) leastAmountOfSpacesAtTheBegining = spaceTestIndex;
    });

    const squaredQuery = splitedByLine.map(line => {
      const newLine = line.padEnd(biggestLine, ' ');
      const splited = newLine.split('');
      splited.splice(0, leastAmountOfSpacesAtTheBegining);
      return splited.join('');
    });

    const sqledLine = squaredQuery.map(line => `${varName}.append(" ${line} ");`);

    const final = [`StringBuilder ${varName} = new StringBuilder();`, '', ...sqledLine].join('\n');

    const valueWithProjectSpecials = projectConfiguration[project.id].addJavaSpecials(final, varName);

    setText2(valueWithProjectSpecials.trim());
  };

  const handleSQLify = () => {
    const lineThatHasVar = text1.split('\n').filter(line => line.includes('.append("'));
    const detectedVar: string[] = [];
    if (lineThatHasVar.length > 0) {
      lineThatHasVar.forEach(line => {
        const appendSplitted = line.split('.append("')[0];
        if (appendSplitted.includes(' ')) {
          detectedVar.push(appendSplitted);
        } else {
          const splittedBySpace = appendSplitted.split(' ');
          detectedVar.push(splittedBySpace[splittedBySpace.length - 1]);
        }
      });
    }

    let value = text1
      .split('\n')
      .filter(line => line.includes('.append'))
      .join('\n');

    detectedVar.forEach(v => {
      value = value.replaceAll(`${v}.append(" `, ``).replaceAll(`${v}.append("`, ``).replaceAll(`");`, ``);
      // .replaceAll(`Query query = em.createNativeQuery(${v}.toString(), Tuple.class);`, ``);
    });

    setText2(value.trim());
  };

  const noJavaQueryChange = (newValue: string) => {
    setText2(state => {
      const splittedByLine = state.split('\n');
      const queryBeginning = splittedByLine.findIndex(line => line.includes('append("'));

      const javaCode = splittedByLine.filter(line => !line.includes('.append("'));

      return [
        ...javaCode.filter((_, i) => i < queryBeginning),
        ...indentStringWithTab(newValue, projectConfiguration[project.id].queryIndentLevel).split('\n'),
        ...javaCode.filter((_, i) => i >= queryBeginning),
      ].join('\n');
    });
  };

  return (
    <>
      <div className="lg:absolute lg:top-0 lg:left-0 py-3 px-10 flex justify-center lg:justify-start relative w-full">
        <div className="flex gap-5 w-full items-center">
          <Autocomplete
            options={projects}
            value={project}
            onChange={(e, newValue) => {
              if (!newValue) console.error('Autocomplete foi limpo. este comportamento não é previsto!');
              if (newValue && !didUserChangeVarName) setVarName(projectConfiguration[newValue.id].defaultVar);

              localStorage.setItem('@javafy/projects', JSON.stringify(newValue));
              setProject(newValue ?? projects[0]);
            }}
            fullWidth
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={params => <TextField {...params} label="Projeto" />}
            className="lg:max-w-xs"
            disableClearable
            getOptionDisabled={option => option.id === 3}
          />
          <div className="hidden lg:block">
            <Tooltip
              title="Escolhendo o projeto, o conversor irá assumir os padrões estabelecidos para cada um deles"
              arrow
              placement="bottom"
            >
              <div>
                <IconButton>
                  <FiInfo />
                </IconButton>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="pb-10 pt-6 lg:pt-10 flex w-full justify-center items-center flex-col lg:mt-0">
        <h1 className="text-3xl">{javafy ? 'Javafy SQL' : 'SQLify Java'}</h1>
        <h3 className="text-lg">
          ou troque para{' '}
          <a onClick={() => setJavafy(state => !state)} className="cursor-pointer hover:underline font-bold">
            {javafy ? 'Sqlfy' : 'Javafy'}
          </a>
        </h3>
      </div>

      <div className="flex w-full justify-around px-10 flex-col gap-5 lg:flex-row">
        <TextField
          value={text1}
          multiline
          fullWidth
          minRows={15}
          onChange={e => setText1(e.target.value)}
          placeholder={javafy ? 'Coloque seu SQL aqui' : 'Coloque seu java aqui'}
        ></TextField>
        <div className="flex flex-row lg:flex-col justify-around lg:justify-start w-full items-center lg:max-w-24 gap-7 px-2 py-4">
          <Button variant="contained" onClick={javafy ? handleJavafy : handleSQLify}>
            {javafy ? 'Javafy' : 'SQLify'}!
          </Button>

          <div className="flex items-center lg:flex-col">
            {javafy ? 'SQLify' : <b>SQLify</b>}
            <div className="flex lg:rotate-90 lg:transform-gpu lg:my-1">
              <CustomSwitch checked={javafy} onChange={() => setJavafy(state => !state)} />
            </div>
            {javafy ? <b>Javafy</b> : 'Javafy'}
          </div>

          {javafy && (
            <TextField
              value={varName}
              onChange={e => {
                setVarName(e.target.value);
                setDidUserChangeVarName(e.target.value !== projectConfiguration[project.id].defaultVar);
              }}
              label="Var"
              inputProps={{ style: { textAlign: 'center' } }}
              size="small"
              error={varName.length === 0}
            />
          )}

          {javafy && (
            <Tooltip
              arrow
              placement="top"
              title="Irá deixar apenas a query. Não irá por outras linhas de java como a declaração do StringBuilder, etc."
              enterDelay={400}
            >
              <div className="flex gap-0.5 items-center lg:flex-col justify-center">
                <Checkbox
                  checked={noJavaQuery}
                  color="primary"
                  onChange={(e, checked) => {
                    localStorage.setItem('@javafy/removeJava', JSON.stringify(Number(!noJavaQuery)));
                    setNoJavaQuery(checked);
                  }}
                />
                <span className="text-center">Remover java</span>
              </div>
            </Tooltip>
          )}
        </div>
        <TextField
          value={noJavaQuery ? unjavafyJavaQuery(text2) : text2}
          onChange={e => (noJavaQuery ? noJavaQueryChange(e.target.value) : setText2(e.target.value))}
          multiline
          fullWidth
          minRows={15}
          placeholder={javafy ? 'Aqui está sua query no java...' : 'Aqui está sua query sql...'}
        ></TextField>
      </div>
    </>
  );
};

export default MainNl;
