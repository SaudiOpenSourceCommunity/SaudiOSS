import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Modal,
  Badge,
  Pagination
} from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import fetchProjects from "./githubApi";

function App() {
  const [developers, loadDevelopers] = useState([]);
  useEffect(() => {
    const fetchDev = async () => {
      const developers = await fetchProjects();
      loadDevelopers(developers);
    };
    fetchDev();
  }, []);
  if (developers.length === 0) return <></>;
  return (
    <div className="devs-container">
      {developers.map(developer => (
        <DevInfo developer={developer} />
      ))}
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
          <a target="_blank" href={project.URL}>
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
          <a target="_blank" href={developer.githubURL}>
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
                title="the badge title"
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

export default App;
