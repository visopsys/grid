import React from "react";
import clsx from "clsx";
import Layout from "./../components/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import SpreadSheet from "@rowsncolumns/spreadsheet";
import { SimpleGrid, Box, Text, Button, List, ListItem } from "@chakra-ui/core";
import { Global, css } from "@emotion/core";

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={"Home"}
      description="React Components for Tabular Data. SpreadSheet and DataGrid for the Enterprise."
    >
      <Global
        styles={css`
          .footer {
            display: none;
          }
        `}
      />
      <Box padding={2} flex={1} display="flex">
        <SpreadSheet initialColorMode="light" />
      </Box>
    </Layout>
  );
}

export default Home;
