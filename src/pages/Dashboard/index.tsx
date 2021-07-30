
import { FiChevronRight } from 'react-icons/fi';
import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../Services/api';

import { Title, Form, Repos, Error } from './styles';
import logo from '../../assets/logo.svg';

interface GithubRepository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export const Dashboard: FC = () => {

  const [repos, setRepos] = useState<GithubRepository[]>(() => {
    const storageRepos = localStorage.getItem('@Gitcollection:repositories');

    if(storageRepos) {
      return JSON.parse(storageRepos);
    }
    return[];
  });
  
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputErro]= useState('');

  const formEl = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    localStorage.setItem('@Gitcollection:repositories', JSON.stringify(repos));
  }, [repos]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void{
    setNewRepo(event.target.value);  
  }

  async function handleAddRepo(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputErro('Informe o username/repositório');
      return;
    }

    try{
      const response = await api.get<GithubRepository>(`repos/${newRepo}`);
    
      const repository = response.data;

      setRepos([...repos, repository]);
      formEl.current?.reset();
      setNewRepo('');
      setInputErro('');
    } catch { 
      setInputErro('Repositório não encontrado');
    }
  }

  return (
    <>
      <img src={logo} alt="GitCollection" />
      <Title>Catálogo de repositórios do Github</Title>

      <Form ref={formEl} hasError={Boolean(inputError)} onSubmit={handleAddRepo}>                                                                                                   
        <input 
          placeholder="username/repository_name" 
          onChange={handleInputChange}
        />

        <button type="submit">Buscar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repos>
        {repos.map((repository, index) => (
          <Link
            to={`/repositories/${repository.full_name}`} 
            key={repository.full_name + index}
          >
            <img 
              src={repository.owner.avatar_url} 
              alt={repository.owner.login} 
            />

            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>

            <FiChevronRight 
              size={20}
            /> 
          </Link>
        ))}
      </Repos>
    </>    
  )
};

