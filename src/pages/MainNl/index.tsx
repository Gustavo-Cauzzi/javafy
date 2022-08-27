import { Autocomplete, Button, Checkbox, IconButton, TextField, Tooltip, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiInfo, FiMoon, FiSun } from 'react-icons/fi';
import { useMode } from '../../hooks/mode';
import CustomSwitch from '../../shared/components/CustomSwitch';
import { SpecialsComponentProps, SpecialsComponentRef } from '../../shared/components/specials/common';
import DesperdiciosSpecials from '../../shared/components/specials/DesperdiciosSpecials';
import { getMainTableName, indentStringWithTab, standardizeParamsInQuery, toCamel } from '../../utils/Utils';

type Projects = Array<{
  id: number;
  label: string;
}>;

interface Config {
  defaultVar: string;
  customFormatString: (str: string, v?: string) => string;
  addJavaSpecials: (str: string, v?: string) => string;
  queryIndentLevel: number;
  especialConfiguration?: React.ForwardRefExoticComponent<
    SpecialsComponentProps & React.RefAttributes<SpecialsComponentRef>
  >;
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
    customFormatString: (str: string, _v?: string) => str,
    addJavaSpecials: (str: string, _v?: string) => str,
  },
  1: {
    defaultVar: 'sql',
    customFormatString: standardizeParamsInQuery,
    queryIndentLevel: 0,
    especialConfiguration: DesperdiciosSpecials,
    addJavaSpecials(str: string, v?: string) {
      const params = Array.from(
        new Set(
          str
            .split(' ')
            .filter(word => word.includes('par_'))
            .map(param => param.replaceAll(')', ''))
            .map(param => param.replaceAll('(', '')),
        ),
      );

      const query = `${str}\nQuery query = em.createNativeQuery(${v ?? this.defaultVar}.toString(), Tuple.class);
      ${params
        .map(param => `\nquery.setParameter("${param.replace(':', '')}", ${param.replace(':', '').split('par_')[1]});`)
        .join('')}
      `.trimEnd();

      return (
        `${query}\n\ntry {` +
        `\n    return NativeUtils.convertResultList((List<Tuple>) query.getResultList(), SelectVO.class);` +
        `\n} catch (NlMsgErroException e) {` +
        `\n    e.printStackTrace();` +
        `\n}` +
        `\n` +
        `\nreturn Collections.emptyList();`
      );
    },
  },
  2: {
    defaultVar: 'sql',
    customFormatString: standardizeParamsInQuery,
    queryIndentLevel: 1,
    addJavaSpecials(str: string, _v?: string) {
      const parsedStr = str
        .split('\n')
        .map(line => {
          let l = line;
          if (l.includes('.append("')) {
            while (l.includes('  ");')) l = l.replaceAll('  ");', ' ");');
          }
          return l;
        })
        .join('\n');

      const tableNameQuery = toCamel(
        `query_${
          getMainTableName(
            parsedStr
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
    customFormatString: (str: string, _v?: string) => str,
    addJavaSpecials: (str: string, _v?: string) => str,
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
  const theme = useTheme();

  const { setMode } = useMode();

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

  const specialConfigComponentRef = useRef<SpecialsComponentRef>(null);

  const handleJavafy = () => {
    if (varName === '') {
      toast.error('Informe o nome da variável!', {
        style: {
          border: `1px solid ${theme.palette.primary.dark}`,
          color: theme.palette.primary.dark,
          maxWidth: 600,
        },
        iconTheme: {
          primary: theme.palette.primary.dark,
          secondary: theme.palette.primary.light,
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
    const finalString = valueWithProjectSpecials.trim();

    console.log('specialConfigComponentRef: ', specialConfigComponentRef);
    if (specialConfigComponentRef.current?.executeFormatting) {
      specialConfigComponentRef.current?.executeFormatting(finalString);
    } else {
      setText2(finalString);
    }
  };

  useEffect(() => {
    if (text1) handleJavafy();
  }, [project]);

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
      .filter(line => line.includes('.append') || line.includes('");'))
      .join('\n');

    detectedVar.forEach(v => {
      value = value
        .replaceAll(`${v}.append(" `, ``)
        .replaceAll(`${v}.append("`, ``)
        .replaceAll(`");`, ``)
        .replaceAll('//', '--');
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
    <main
      className="min-w-screen min-h-screen"
      style={{ background: theme.palette.background.default, transition: 'background 0.5s' }}
    >
      <div className="lg:absolute lg:top-0 lg:left-0 py-5 pl-10 pr-7 flex justify-center lg:justify-start relative w-full gap-5">
        <div className="flex gap-5 w-full items-center">
          <Autocomplete
            options={projects}
            value={project}
            onChange={(_e, newValue) => {
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

        <div>
          <IconButton onClick={() => setMode(state => (state === 'light' ? 'dark' : 'light'))}>
            {theme.palette.mode === 'light' ? (
              <FiMoon size={28} color={theme.palette.primary.main} />
            ) : (
              <FiSun size={28} color={theme.palette.primary.light} />
            )}
          </IconButton>
        </div>
      </div>

      <div className="pb-10 pt-6 lg:pt-10 flex w-full justify-center items-center flex-col lg:mt-0">
        <h1 className="text-3xl">{javafy ? 'Javafy SQL' : 'SQLify Java'}</h1>
        <h3 className="text-lg">
          ou troque para{' '}
          <button
            type="button"
            onClick={() => setJavafy(state => !state)}
            className="cursor-pointer hover:underline font-bold"
          >
            {javafy ? 'SQLify' : 'Javafy'}
          </button>
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
        />
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
                  onChange={(_e, checked) => {
                    localStorage.setItem('@javafy/removeJava', JSON.stringify(Number(!noJavaQuery)));
                    setNoJavaQuery(checked);
                  }}
                />
                <span className="text-center">Remover java</span>
              </div>
            </Tooltip>
          )}

          {(() => {
            const SpecialConfigComponent = projectConfiguration[project.id].especialConfiguration;
            return SpecialConfigComponent ? (
              <SpecialConfigComponent
                str={text2}
                onChange={newValue => {
                  setText2(newValue);
                }}
                ref={specialConfigComponentRef}
              />
            ) : null;
          })()}
        </div>
        <TextField
          value={noJavaQuery && javafy ? unjavafyJavaQuery(text2) : text2}
          onChange={e => (noJavaQuery ? noJavaQueryChange(e.target.value) : setText2(e.target.value))}
          multiline
          fullWidth
          minRows={15}
          placeholder={javafy ? 'Aqui está sua query no java...' : 'Aqui está sua query sql...'}
        />
      </div>
    </main>
  );
};

export default MainNl;
