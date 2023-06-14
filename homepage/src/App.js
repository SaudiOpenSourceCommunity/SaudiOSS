import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Avatar,
  Modal,
  Badge,
  Pagination,
  Input,
  Picklist,
  PicklistOption,
  Textarea
} from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faPlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import { fetchDevs } from "./githubApi";

function App() {
  const [developers, loadDevelopers] = useState([]);
  const [projects, loadProjects] = useState([]);
  const [view, setView] = useState("devs");
  useEffect(() => {
    const fetchDev = async () => {
      const developers = await fetchDevs();
      loadDevelopers(developers);
      const projects = developers.reduce((projects, dev) => {
        dev.projects.forEach(project => {
          projects.push({
            dev_name_ar: dev.name,
            dev_github_url: dev.githubURL,
            id: project?.details?.id,
            name: project.name,
            description: project.description,
            language: project?.details?.language,
            license: project?.details?.license,
            topics: project?.details?.topics,
            URL: project.URL
          });
        });
        return projects;
      }, []);
      loadProjects(projects);
    };
    fetchDev();
  }, []);

  if (developers.length === 0) return <></>;
  return (
    <div>
      <div className="devs-title">المبرمجون</div>
      <div className="center-items">
        <AddDevButton developers={developers} />
      </div>
      <div className="view-buttons-container">
        <button
          className={view === "devs" ? "active" : ""}
          onClick={() => setView("devs")}
          title="بطاقات المطورين"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </button>
        <button
          className={view === "projects" ? "active" : ""}
          onClick={() => setView("projects")}
          title="قائمة المشاريع"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </button>
      </div>
      {view === "projects" ? (
        <div className="projects-container">
          {projects.map(project => (
            <ProjectInfo
              project={project}
              key={project.name + project.dev_name_ar}
            />
          ))}
        </div>
      ) : null}

      {view === "devs" ? (
        <div className="devs-container">
          {developers.map(developer => (
            <DevInfo developer={developer} key={developer.name} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DevInfo({ developer }) {
  const [closed, handleOnClose] = useState(false);
  const [page, pageChange] = useState(1);

  const getProjectContent = () => {
    const project = developer.projects[page - 1];
    return (
      <>
        <div>
          <a target="_blank" href={project.URL} rel="noreferrer">
            <b style={{ fontSize: "1.5em" }}>{project.name}</b>
          </a>
        </div>
        <div>{project.description}</div>
      </>
    );
  };
  const handelActivePageChange = (event, page) => pageChange(page);
  const getGitHubURL = () => {
    if (developer.githubURL)
      return (
        <h1 className="rainbow-p-top_large rainbow-font-size-heading_small rainbow-color_dark-1">
          <a target="_blank" href={developer.githubURL} rel="noreferrer">
            {developer.name}
          </a>
        </h1>
      );
    return (
      <h1 className="rainbow-p-top_large rainbow-font-size-heading_small rainbow-color_dark-1">
        {developer.name}
      </h1>
    );
  };
  const getPagination = () => {
    if (developer.projects.length > 1)
      return (
        <Pagination
          className="rainbow-m_auto"
          pages={developer.projects.length}
          activePage={page}
          onChange={handelActivePageChange}
          style={{ direction: "ltr" }}
        />
      );
    return <></>;
  };
  return (
    <div className="rainbow-m-around_large item">
      <Card
        footer={
          <>
            <Button
              variant="brand"
              className="rainbow-m-around_medium"
              onClick={() => handleOnClose(true)}
            >
              المشاريع البرمجية
              <FontAwesomeIcon
                icon={faCode}
                className="rainbow-m-left_medium"
              />
              <Badge
                className="rainbow-m-around_xx"
                label={developer.projects.length}
                title="total projects count"
                style={{ padding: "0.25em 0.50em", margin: "-2em -1em 1.5em" }}
              />
            </Button>
          </>
        }
      >
        <div className="rainbow-p-around_xx-large rainbow-align-content_center rainbow-flex_column">
          <Avatar
            src={`${developer.githubURL}.png`}
            assistiveText={developer.name}
            title={developer.name}
            size="large"
            style={{ height: "5.2rem", width: "5.2rem" }}
          />
          {getGitHubURL()}
        </div>
        <Modal
          isOpen={closed}
          onRequestClose={() => handleOnClose(false)}
          title="المشاريع"
          footer={
            <div className="rainbow-flex rainbow-justify_spread">
              <Avatar
                src={`${developer.githubURL}.png`}
                assistiveText={developer.name}
                title={developer.name}
                size="large"
              />
              <Badge
                className="rainbow-m-around_medium"
                label={developer.name}
                style={{
                  color: "white",
                  backgroundColor: "green"
                }}
              />
            </div>
          }
        >
          <div style={{ textAlign: "center", paddingBottom: "2em" }}>
            {getProjectContent()}
          </div>
          {getPagination()}
        </Modal>
      </Card>
    </div>
  );
}

function ProjectInfo({ project }) {
  const getDevGitHubURL = () => {
    if (project.dev_github_url)
      return (
        <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
          <a target="_blank" href={project.dev_github_url} rel="noreferrer">
            {project.dev_name_ar}
          </a>
        </p>
      );
    return (
      <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
        {project.dev_name_ar}
      </p>
    );
  };
  const getProjectGitHubURL = () => {
    if (project.URL)
      return (
        <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
          <a target="_blank" href={project.URL} rel="noreferrer">
            {project.name}
          </a>
        </p>
      );
    return (
      <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
        {project.name}
      </p>
    );
  };
  const getProjectLicense = () => {
    if (project.license)
      return (
        <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
          {project.license.name}
        </p>
      );
    return (
      <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
        &nbsp;
      </p>
    );
  };
  const getProjectLanguage = () => {
    if (project.language)
      return (
        <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
          {project.language}
        </p>
      );
    return (
      <p className="rainbow-font-size-heading_small rainbow-color_dark-1">
        &nbsp;
      </p>
    );
  };
  const getProjectTopics = () => {
    if (project.topics && project.topics.length > 0)
      return (
        <div className="topics-container">
          {project.topics.map(topic => (
            <span className="topic" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      );
    return <div className="topics-container">&nbsp;</div>;
  };
  return (
    <div className="project-list-item row-lg">
      <div className="project-list-item-user-container w-1of4">
        <Avatar
          src={`${project.dev_github_url}.png`}
          assistiveText={project.dev_name_ar}
          title={project.dev_name_ar}
          size="large"
          style={{ height: "2.2rem", width: "2.2rem" }}
        />
        {getDevGitHubURL()}
      </div>
      <div className="project-list-item-project-details-container w-2of4">
        {getProjectGitHubURL()}
        {project.description}
      </div>
      <div className="project-list-item-project-meta-container w-1of4">
        {getProjectLanguage()}
        {getProjectLicense()}
        {getProjectTopics()}
      </div>
    </div>
  );
}

function AddDevButton({ developers }) {
  const [closed, handleOnClose] = useState(false);
  const [name, setName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubProjects, setGithubProjects] = useState([]);

  const [activeProject, setActiveProject] = useState({
    name: "",
    URL: "",
    description: "",
    details: {
      id: Math.floor(Math.random * 9999999999),
      language: "",
      license: {
        name: ""
      },
      topics: []
    }
  });
  const [projects, setProjects] = useState([]);

  const getUserProjects = async () => {
    try {
      const previousDev = developers.find(developer =>
        developer.githubURL
          ?.toLowerCase()
          .match(`https://github.com/${githubUsername}`.toLowerCase())
      );
      setName(previousDev ? previousDev.name : "");
      const previousProjects = previousDev?.projects || [];
      setProjects(previousProjects);

      const respones = await fetch(
        `https://api.github.com/users/${githubUsername}/repos`
      );
      const data = await respones.json();

      setGithubProjects([
        // ...previousProjects,
        ...data
          // .filter((project) => {
          //   const x = previousProjects.find(
          //     (previousProject) =>
          //       previousProject.details.id === project.id
          //   );

          //   return !x;
          // })
          .map(project => {
            return {
              name: project.name,
              URL: `https://github.com/${githubUsername}/${project.name}`,
              description: "",
              details: {
                id: project.id,
                license: project.license || { name: "" },
                language: project.language || "",
                topics: project.topics || []
              }
            };
          })
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const devJSON = useMemo(() => {
    if (name === "" || githubUsername === "" || projects.length === 0) {
      return "";
    }

    return JSON.stringify(
      {
        name,
        githubURL: `https://github.com/${githubUsername}`,
        projects: projects
      },
      null,
      4
    );
  }, [name, projects, githubUsername]);

  const addActiveProject = () => {
    setProjects([...projects, activeProject]);

    setActiveProject({
      name: "",
      URL: "",
      description: "",
      details: {
        id: Math.floor(Math.random * 9999999999),
        language: "",
        license: {
          name: ""
        },
        topics: []
      }
    });
  };

  const [copyState, setCopyState] = useState("");

  const copyProjects = async () => {
    setCopyState("");
    try {
      await navigator.clipboard.writeText(devJSON);
      setCopyState("تم النسخ الى المحفظة");
    } catch (e) {
      console.error(e);
      setCopyState("فشل النسخ");
    }
  };

  return (
    <div>
      <Button
        variant="brand"
        className="rainbow-m-around_medium"
        onClick={() => handleOnClose(true)}
      >
        <FontAwesomeIcon icon={faPlus} className="rainbow-m-left_medium" />
        أضف مشاريعك
      </Button>

      <Modal
        isOpen={closed}
        onRequestClose={() => handleOnClose(false)}
        title="اضف مشاريعك"
      >
        <div style={{ textAlign: "center", paddingBottom: "2em" }}>
          <div className="">
            <Input
              label="إسمك"
              placeholder="إسمك"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              onChange={e => setName(e.target.value)}
            />
            <Input
              label="حسابك على منصة Github"
              placeholder="حسابك على منصة Github"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              onChange={e => setGithubUsername(e.target.value)}
              onBlur={getUserProjects}
            />
            <div className="">
              <Picklist
                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                label="إختر مشروعك"
                onChange={value =>
                  setActiveProject(
                    githubProjects.find(
                      project =>
                        project.details.id.toString() === value.name.toString()
                    )
                  )
                }
                size="large"
              >
                {githubProjects
                  .filter(project => {
                    return !projects.find(
                      addedProject =>
                        addedProject.details.id === project.details.id
                    );
                  })
                  .map(project => (
                    <PicklistOption
                      key={project.details.id}
                      name={project.details.id.toString()}
                      label={project.name}
                    />
                  ))}
              </Picklist>
            </div>
            <Input
              label="إسم المشروع"
              placeholder="إسم المشروع"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              type="text"
              onChange={e =>
                setActiveProject(activeProject => {
                  return { ...activeProject, name: e.target.value };
                })
              }
              value={activeProject.name}
            />
            <Input
              label="رابط المشروع"
              placeholder="رابط المشروع"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto ltr"
              type="text"
              onChange={e =>
                setActiveProject(activeProject => {
                  return { ...activeProject, URL: e.target.value };
                })
              }
              value={activeProject.URL}
            />
            <Input
              label="شرح للمشروع"
              placeholder="شرح للمشروع"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              onChange={e =>
                setActiveProject(activeProject => {
                  return { ...activeProject, description: e.target.value };
                })
              }
              value={activeProject.description}
            />
            <Input
              label="اللغة البرمجية"
              placeholder="اللغة البرمجية"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto ltr"
              onChange={e =>
                setActiveProject(activeProject => {
                  return {
                    ...activeProject,
                    details: {
                      ...activeProject.details,
                      language: e.target.value
                    }
                  };
                })
              }
              value={activeProject.details.language}
            />
            <Input
              label="مواضيع المشروع"
              placeholder="مواضيع المشروع مفصولة بفاصلة ,"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              onChange={e =>
                setActiveProject(activeProject => {
                  return {
                    ...activeProject,
                    details: {
                      ...activeProject.details,
                      topics: e.target.value.split(",")
                    }
                  };
                })
              }
              value={activeProject.details.topics.join(",")}
            />
            <Button onClick={addActiveProject}>
              <FontAwesomeIcon
                icon={faPlus}
                className="rainbow-m-left_medium"
              />
              أضف المشروع
            </Button>

            {devJSON ? (
              <div>
                <div className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto">
                  <Textarea
                    value={devJSON}
                    grow={true}
                    size="large"
                    label={
                      <div>
                        انسخ هذا المكون واضفه الى &nbsp;
                        <a href="https://github.com/SaudiOpenSourceCommunity/SaudiOSS/blob/master/devs.json">
                          قائمة المبرمجين على قيتهب
                        </a>
                      </div>
                    }
                    className="ltr"
                    rows={5}
                  ></Textarea>
                </div>
                <div className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto">
                  <Button onClick={copyProjects}>
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="rainbow-m-left_medium"
                    />
                    إنسخ
                  </Button>
                </div>
                <div>
                  <p>{copyState}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
