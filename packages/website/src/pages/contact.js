import React from "react";
import clsx from "clsx";
import Layout from "./../components/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import {
  SimpleGrid,
  Box,
  Text,
  Button,
  List,
  ListItem,
  ListIcon,
  Flex
} from "@chakra-ui/core";

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title="Contact" description="Contact rowsncolumns">
      <Box className="container" pt={10} display='block'>
        <Text fontSize={30} fontWeight='bold' mb={5} as='h1'>Contact us</Text>
        <Text fontSize={20} fontWeight='bold' as='h2' mb={1}>Sales enquiries</Text>
        <Text>For sales enquiries, email us at <a href='mailto:sales@rowsncolumns.app'>sales@rowsncolumns.app</a></Text>

        <Text mt={5} fontSize={20} fontWeight='bold' as='h2' mb={1}>Support</Text>
        <Text>For support, email us at <a href='mailto:support@rowsncolumns.app'>support@rowsncolumns.app</a></Text>
      </Box>
    </Layout>
  );
}

export default Home;
