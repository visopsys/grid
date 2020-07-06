import React from "react";
import clsx from "clsx";
import Layout from "./../components/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import SpreadSheet from "@rowsncolumns/spreadsheet";
import { SimpleGrid, Box, Text, Button, List, ListItem } from "@chakra-ui/core";

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
      description="React Components for Tabular Data. SpreadSheet and Datagrid for the Enterprise."
    >
      <SimpleGrid
        columns={[1, 1, 2]}
        className="container"
        height={["auto", "auto", 600]}
        spacing={30}
        pt={10}
        pb={10}
      >
        <Box justifyContent="center" display="flex" flexDirection="column">
          <Text as="h1" fontSize="4xl" fontWeight="bold" mb={2}>
            SpreadSheet
          </Text>
          <Text mb={6} fontSize="lg">
            Excel-like Datagrid component for React JS. Built for high
            performance rendering similar to google sheets.
          </Text>
          <List styleType="disc" pb={5}>
            <ListItem>High performance (uses canvas for rendering)</ListItem>
            <ListItem>Declarative</ListItem>
            <ListItem>Easily customizable</ListItem>
            <ListItem>Feature packed</ListItem>
          </List>
          <Box>
            {/* <Button variantColor='blue' mr={2}>Demo</Button> */}
            <Button as="a" href="/docs" variantColor='purple' _hover={{ color: 'white'}}>
              Get Started
            </Button>
          </Box>
        </Box>
        <Box minWidth={[0, 0, 500, 700]} display="flex">
          <SpreadSheet initialColorMode='light' />
        </Box>
      </SimpleGrid>
    </Layout>
  );
}

export default Home;
