import { Autocomplete, Button, TextField } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import CustomSwitch from '../../shared/components/CustomSwitch';
import { darkColor, lightColor } from '../../Theme';
import { toCamel } from '../../utils/Utils';

type Projects = Array<{
  id: number;
  label: string;
}>;

interface Config {
  defaultVar: string;
  customFormatString: (str: string, v?: string) => string;
  addJavaSpecials: (str: string, v?: string) => string;
}

interface ProjectConfig {
  [key: number]: Config;
}

const projects: Projects = [
  { id: 0, label: 'Padrão' },
  { id: 1, label: 'Controle de desperdícios' },
  { id: 2, label: 'NLWeb' },
  { id: 3, label: 'Novo RE' },
];

const projectConfiguration: ProjectConfig = {
  0: {
    defaultVar: 'sql',
    customFormatString: (str: string, v?: string) => str,
    addJavaSpecials: (str: string, v?: string) => str,
  },
  1: {
    defaultVar: 'sql',
    customFormatString: function (str: string) {
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
    },
    addJavaSpecials: function (str: string, v?: string) {
      const params = Array.from(
        new Set(
          str
            .split(' ')
            .filter(word => word.includes('par_'))
            .map(param => param.replace(')', '')),
        ),
      );

      //prettier-ignore
      return `
        ${str}
        \nQuery query = em.createNativeQuery(${v ?? this.defaultVar}.toString(), Tuple.class);
        ${
          params.map(param =>
            `\nquery.setParameter("${param.replace(':', '')}", ${param.replace(':', '').split('par_')[1]});`
          ).join('')
        }
      `;
    },
  },
  2: {
    defaultVar: 'sql',
    customFormatString: (str: string, v?: string) => str,
    addJavaSpecials: (str: string, v?: string) => str,
  },
  3: {
    defaultVar: 'sb',
    customFormatString: (str: string, v?: string) => str,
    addJavaSpecials: (str: string, v?: string) => str,
  },
};

type Project = Projects[number];

const defaultProject = localStorage.getItem('@javafy/projects');

const MainNl: React.FC = () => {
  const [javafy, setJavafy] = useState(true);
  const [varName, setVarName] = useState('sql');
  const [didUserChangeVarName, setDidUserChangeVarName] = useState(false);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [project, setProject] = useState<Project>(
    defaultProject ? (JSON.parse(defaultProject) as Project) : projects[0],
  );

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

    const formattedString = projectConfiguration[project.id].customFormatString(text1, varName);

    const splitedByLine = formattedString.split('\n');
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

  return (
    <>
      <div className="absolute top-0 right-0 left-0 py-1.5 px-4">
        <div>
          <Autocomplete
            options={projects}
            value={project}
            onChange={(e, newValue) => {
              if (!newValue) console.error('Autocomplete foi limpo. este comportamento não é previsto!');
              localStorage.setItem('@javafy/projects', JSON.stringify(newValue));
              if (newValue && !didUserChangeVarName) setVarName(projectConfiguration[newValue.id].defaultVar);
              setProject(newValue ?? projects[0]);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={params => <TextField {...params} />}
            style={{ maxWidth: 350 }}
          />
        </div>
      </div>

      <div className="py-10 flex w-full justify-center items-center flex-col">
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
          placeholder={javafy ? 'Paste your sql here' : 'Paste your java here'}
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
        </div>
        <TextField
          value={text2}
          onChange={e => setText2(e.target.value)}
          multiline
          fullWidth
          minRows={15}
          placeholder={javafy ? 'Here is your javafied query...' : 'Here is your SQL query...'}
        ></TextField>
      </div>
    </>
  );
};

export default MainNl;
